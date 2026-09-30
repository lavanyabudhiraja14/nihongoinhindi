from datetime import datetime, timezone, timedelta
from unittest.mock import patch
import pytest
from fastapi.testclient import TestClient

from database import SessionLocal
from models import User, EmailVerificationToken, PasswordResetToken, UserSession, utc_now, ensure_utc
from security import (
    hash_password,
    verify_password,
    generate_session_token,
    hash_session_token,
    generate_verification_token,
    hash_verification_token,
    generate_reset_token,
    hash_reset_token,
)


# =============================================================
# 1. FORGOT PASSWORD TESTS
# =============================================================

def test_forgot_password_success(client: TestClient):
    """Forgot password generates a token and sends email for registered user."""
    db = SessionLocal()
    try:
        user = User(
            email="learner@example.com",
            password_hash=hash_password("OldPassword123!"),
            display_name="परीक्षार्थी",
            is_verified=True,
        )
        db.add(user)
        db.commit()
    finally:
        db.close()

    with patch("routers.auth.send_password_reset_email") as mock_send_email:
        mock_send_email.return_value = True
        res = client.post("/api/auth/forgot-password", json={"email": "LEARNER@example.com"})
        assert res.status_code == 200
        assert res.json()["status"] == "ok"
        assert "यदि यह ईमेल पंजीकृत है" in res.json()["message"]

        # Check that email was sent with token
        mock_send_email.assert_called_once()
        called_email = mock_send_email.call_args[0][0]
        called_token = mock_send_email.call_args[0][1]
        assert called_email == "learner@example.com"
        assert len(called_token) > 20

        # Check token stored in DB as hash
        token_hash = hash_reset_token(called_token)
        db = SessionLocal()
        try:
            db_token = db.query(PasswordResetToken).filter(PasswordResetToken.token_hash == token_hash).first()
            assert db_token is not None
            assert db_token.used is False
            assert ensure_utc(db_token.expires_at) > utc_now()
        finally:
            db.close()


def test_forgot_password_anti_enumeration(client: TestClient):
    """Forgot password returns identical generic 200 message if email is not found."""
    with patch("routers.auth.send_password_reset_email") as mock_send_email:
        res = client.post("/api/auth/forgot-password", json={"email": "nonexistent@example.com"})
        assert res.status_code == 200
        assert res.json()["status"] == "ok"
        assert "यदि यह ईमेल पंजीकृत है" in res.json()["message"]
        mock_send_email.assert_not_called()


def test_forgot_password_invalidates_previous_tokens(client: TestClient):
    """Subsequent forgot password requests invalidate earlier unused tokens."""
    db = SessionLocal()
    try:
        user = User(
            email="repeat@example.com",
            password_hash=hash_password("Password123!"),
            display_name="यूज़र",
        )
        db.add(user)
        db.commit()
        user_id = user.id
    finally:
        db.close()

    # Request 1
    client.post("/api/auth/forgot-password", json={"email": "repeat@example.com"})
    db = SessionLocal()
    try:
        tokens = db.query(PasswordResetToken).filter(PasswordResetToken.user_id == user_id).all()
        assert len(tokens) == 1
        assert tokens[0].used is False
    finally:
        db.close()

    # Request 2
    client.post("/api/auth/forgot-password", json={"email": "repeat@example.com"})
    db = SessionLocal()
    try:
        tokens = db.query(PasswordResetToken).filter(PasswordResetToken.user_id == user_id).order_by(PasswordResetToken.created_at).all()
        assert len(tokens) == 2
        assert tokens[0].used is True  # Earlier token invalidated
        assert tokens[1].used is False  # New token valid
    finally:
        db.close()


# =============================================================
# 2. RESET PASSWORD TESTS
# =============================================================

def test_reset_password_success_and_revokes_sessions(client: TestClient):
    """Valid reset token changes password and revokes all active sessions."""
    db = SessionLocal()
    try:
        user = User(
            email="resetme@example.com",
            password_hash=hash_password("InitialPassword123!"),
            display_name="रीसेट",
        )
        db.add(user)
        db.flush()
        user_id = user.id

        # Create active sessions
        s1 = UserSession(user_id=user_id, token_hash="sessionhash1", expires_at=utc_now() + timedelta(days=5), revoked=False)
        s2 = UserSession(user_id=user_id, token_hash="sessionhash2", expires_at=utc_now() + timedelta(days=5), revoked=False)
        db.add_all([s1, s2])

        # Create reset token
        raw_token = generate_reset_token()
        token_hash = hash_reset_token(raw_token)
        reset_rec = PasswordResetToken(
            user_id=user_id,
            token_hash=token_hash,
            expires_at=utc_now() + timedelta(minutes=30),
            used=False,
        )
        db.add(reset_rec)
        db.commit()
    finally:
        db.close()

    # Submit reset
    res = client.post("/api/auth/reset-password", json={
        "token": raw_token,
        "new_password": "BrandNewSecurePassword123!",
    })
    assert res.status_code == 200
    assert "सफलतापूर्वक" in res.json()["message"]

    # Verify DB state
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        reset_rec = db.query(PasswordResetToken).filter(PasswordResetToken.token_hash == token_hash).first()
        s1 = db.query(UserSession).filter(UserSession.token_hash == "sessionhash1").first()
        s2 = db.query(UserSession).filter(UserSession.token_hash == "sessionhash2").first()

        # Password updated with Argon2id
        assert verify_password("BrandNewSecurePassword123!", user.password_hash)
        assert not verify_password("InitialPassword123!", user.password_hash)
        # Token marked used
        assert reset_rec.used is True
        # All sessions revoked
        assert s1.revoked is True
        assert s2.revoked is True
    finally:
        db.close()


def test_reset_password_invalid_or_reused_token(client: TestClient):
    """Reset password rejects invalid and already used tokens."""
    # Invalid token
    res = client.post("/api/auth/reset-password", json={
        "token": "invalid_fake_token_12345",
        "new_password": "BrandNewSecurePassword123!",
    })
    assert res.status_code == 400
    assert "अमान्य" in res.json()["detail"]

    # Reused token
    db = SessionLocal()
    try:
        user = User(email="used@example.com", password_hash=hash_password("Pass12345!"))
        db.add(user)
        db.flush()

        raw_token = generate_reset_token()
        reset_rec = PasswordResetToken(
            user_id=user.id,
            token_hash=hash_reset_token(raw_token),
            expires_at=utc_now() + timedelta(minutes=30),
            used=True,  # already used
        )
        db.add(reset_rec)
        db.commit()
    finally:
        db.close()

    res = client.post("/api/auth/reset-password", json={
        "token": raw_token,
        "new_password": "BrandNewSecurePassword123!",
    })
    assert res.status_code == 400
    assert "अमान्य या पहले से उपयोग किया गया" in res.json()["detail"]


def test_reset_password_expired_token(client: TestClient):
    """Reset password rejects expired tokens."""
    db = SessionLocal()
    try:
        user = User(email="expired@example.com", password_hash=hash_password("Pass12345!"))
        db.add(user)
        db.flush()

        raw_token = generate_reset_token()
        reset_rec = PasswordResetToken(
            user_id=user.id,
            token_hash=hash_reset_token(raw_token),
            expires_at=utc_now() - timedelta(minutes=5),  # expired 5 min ago
            used=False,
        )
        db.add(reset_rec)
        db.commit()
    finally:
        db.close()

    res = client.post("/api/auth/reset-password", json={
        "token": raw_token,
        "new_password": "BrandNewSecurePassword123!",
    })
    assert res.status_code == 400
    assert "समाप्त" in res.json()["detail"]


def test_reset_password_weak_password(client: TestClient):
    """Reset password rejects weak or common passwords."""
    db = SessionLocal()
    try:
        user = User(email="weak@example.com", password_hash=hash_password("Pass12345!"))
        db.add(user)
        db.flush()

        raw_token = generate_reset_token()
        reset_rec = PasswordResetToken(
            user_id=user.id,
            token_hash=hash_reset_token(raw_token),
            expires_at=utc_now() + timedelta(minutes=30),
            used=False,
        )
        db.add(reset_rec)
        db.commit()
    finally:
        db.close()

    res = client.post("/api/auth/reset-password", json={
        "token": raw_token,
        "new_password": "password",  # Common password
    })
    assert res.status_code == 422
    assert "कमजोर" in str(res.json()) or "अक्षरों" in str(res.json())


# =============================================================
# 3. EMAIL VERIFICATION TESTS
# =============================================================

def test_signup_creates_verification_token_and_sends_email(client: TestClient):
    """Signup issues a verification token and dispatches verification email."""
    with patch("routers.auth.send_verification_email") as mock_send:
        mock_send.return_value = True
        res = client.post("/api/auth/signup", json={
            "email": "newuser@example.com",
            "password": "SecurePassword123!",
            "display_name": "नवीन",
        })
        assert res.status_code == 201
        data = res.json()
        assert data["email"] == "newuser@example.com"
        assert data["is_verified"] is False

        mock_send.assert_called_once()
        called_email = mock_send.call_args[0][0]
        called_token = mock_send.call_args[0][1]
        assert called_email == "newuser@example.com"
        assert len(called_token) > 20

        # Check DB token
        token_hash = hash_verification_token(called_token)
        db = SessionLocal()
        try:
            vt = db.query(EmailVerificationToken).filter(EmailVerificationToken.token_hash == token_hash).first()
            assert vt is not None
            assert vt.used is False
            assert ensure_utc(vt.expires_at) > utc_now()
        finally:
            db.close()


def test_verify_email_success(client: TestClient):
    """Valid verification token sets is_verified=True and marks token used."""
    db = SessionLocal()
    try:
        user = User(
            email="verifytarget@example.com",
            password_hash=hash_password("Pass12345!"),
            is_verified=False,
        )
        db.add(user)
        db.flush()
        user_id = user.id

        raw_token = generate_verification_token()
        vt = EmailVerificationToken(
            user_id=user_id,
            token_hash=hash_verification_token(raw_token),
            expires_at=utc_now() + timedelta(hours=24),
            used=False,
        )
        db.add(vt)
        db.commit()
    finally:
        db.close()

    res = client.post("/api/auth/verify-email", json={"token": raw_token})
    assert res.status_code == 200
    assert "सत्यापित" in res.json()["message"]
    assert res.json()["user"]["is_verified"] is True

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        vt = db.query(EmailVerificationToken).filter(EmailVerificationToken.user_id == user_id).first()
        assert user.is_verified is True
        assert vt.used is True
    finally:
        db.close()


def test_verify_email_expired_or_reused(client: TestClient):
    """Expired or reused verification tokens are rejected."""
    db = SessionLocal()
    try:
        user = User(email="reuseverify@example.com", password_hash=hash_password("Pass12345!"), is_verified=False)
        db.add(user)
        db.flush()

        raw_token = generate_verification_token()
        vt = EmailVerificationToken(
            user_id=user.id,
            token_hash=hash_verification_token(raw_token),
            expires_at=utc_now() + timedelta(hours=24),
            used=True,
        )
        db.add(vt)
        db.commit()
    finally:
        db.close()

    res = client.post("/api/auth/verify-email", json={"token": raw_token})
    assert res.status_code == 400
    assert "अमान्य या पहले से उपयोग किया गया" in res.json()["detail"]


def test_resend_verification_email(client: TestClient):
    """Resending verification email sends new token and invalidates old ones."""
    db = SessionLocal()
    try:
        user = User(
            email="unverified@example.com",
            password_hash=hash_password("Pass12345!"),
            is_verified=False,
        )
        db.add(user)
        db.flush()
        user_id = user.id

        vt_old = EmailVerificationToken(
            user_id=user_id,
            token_hash="old_token_hash",
            expires_at=utc_now() + timedelta(hours=24),
            used=False,
        )
        db.add(vt_old)
        db.commit()
    finally:
        db.close()

    with patch("routers.auth.send_verification_email") as mock_send:
        mock_send.return_value = True
        res = client.post("/api/auth/resend-verification", json={"email": "unverified@example.com"})
        assert res.status_code == 200
        assert "सत्यापन लिंक भेज दिया गया है" in res.json()["message"]
        mock_send.assert_called_once()

    db = SessionLocal()
    try:
        vt_old = db.query(EmailVerificationToken).filter(EmailVerificationToken.token_hash == "old_token_hash").first()
        assert vt_old.used is True  # Old token invalidated

        tokens = db.query(EmailVerificationToken).filter(EmailVerificationToken.user_id == user_id).all()
        assert len(tokens) == 2
    finally:
        db.close()


def test_change_email_unverifies_account_and_sends_token(client: TestClient):
    """Changing email sets is_verified=False and sends verification to new email."""
    db = SessionLocal()
    try:
        user = User(
            email="initial@example.com",
            password_hash=hash_password("Password123!"),
            display_name="सत्यापित",
            is_verified=True,
        )
        db.add(user)
        db.flush()
        user_id = user.id

        # Session token
        raw_session = generate_session_token()
        session_rec = UserSession(
            user_id=user_id,
            token_hash=hash_session_token(raw_session),
            expires_at=utc_now() + timedelta(days=30),
            revoked=False,
        )
        db.add(session_rec)
        db.commit()
    finally:
        db.close()

    with patch("routers.auth.send_verification_email") as mock_send:
        mock_send.return_value = True
        client.cookies.set("nihongo_session", raw_session)
        client.cookies.set("nihongo_csrf", "csrftoken123")
        res = client.post(
            "/api/auth/change-email",
            headers={"X-CSRF-Token": "csrftoken123"},
            json={
                "new_email": "updated@example.com",
                "current_password": "Password123!",
            },
        )
        assert res.status_code == 200
        assert res.json()["user"]["email"] == "updated@example.com"
        assert res.json()["user"]["is_verified"] is False

        mock_send.assert_called_once()
        assert mock_send.call_args[0][0] == "updated@example.com"

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        assert user.email == "updated@example.com"
        assert user.is_verified is False
    finally:
        db.close()


def test_email_verification_full_lifecycle(client: TestClient):
    """Full lifecycle: signup -> get token -> verify -> check /me -> reject reuse -> relogin."""
    with patch("routers.auth.send_verification_email") as mock_send:
        # 1. Signup
        signup_res = client.post("/api/auth/signup", json={
            "email": "lifecycle_user@example.com",
            "password": "ValidPassword123!",
            "display_name": "लाइफसाइकिल",
        })
        assert signup_res.status_code == 201
        csrf = signup_res.cookies.get("nihongo_csrf")
        mock_send.assert_called_once()
        raw_token = mock_send.call_args[0][1]

        # 2. Before verification: /me shows is_verified = False
        me_before = client.get("/api/auth/me")
        assert me_before.status_code == 200
        assert me_before.json()["is_verified"] is False

        # 3. Verify email with token
        verify_res = client.post("/api/auth/verify-email", json={"token": raw_token})
        assert verify_res.status_code == 200
        assert verify_res.json()["user"]["is_verified"] is True

        # 4. After verification: /me shows is_verified = True
        me_after = client.get("/api/auth/me")
        assert me_after.status_code == 200
        assert me_after.json()["is_verified"] is True

        # 5. Reusing the token must fail with 400
        verify_again = client.post("/api/auth/verify-email", json={"token": raw_token})
        assert verify_again.status_code == 400

        # 6. Logout and relogin
        client.post("/api/auth/logout", headers={"X-CSRF-Token": csrf})
        login_res = client.post("/api/auth/login", json={
            "email": "lifecycle_user@example.com",
            "password": "ValidPassword123!",
        })
        assert login_res.status_code == 200
        assert login_res.json()["is_verified"] is True
