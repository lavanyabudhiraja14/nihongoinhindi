import io
import os
import pytest
from fastapi.testclient import TestClient
from PIL import Image

from main import app
from database import SessionLocal
from dependencies import get_client_ip
from models import User, UserSession, UserProgress, UserReviewCard, UserAvatar
from starlette.requests import Request


def test_signup_success(client: TestClient):
    payload = {
        "email": "Learner1@example.com",
        "password": "StrongPassword123!",
        "display_name": "रोहन",
    }
    res = client.post("/api/auth/signup", json=payload)
    assert res.status_code == 201
    data = res.json()
    assert data["email"] == "learner1@example.com"  # Normalized lowercase
    assert data["display_name"] == "रोहन"
    assert "password" not in data
    assert "password_hash" not in data
    assert "nihongo_session" in res.cookies
    assert "nihongo_csrf" in res.cookies


def test_signup_duplicate_email(client: TestClient):
    payload = {
        "email": "learner_dup@example.com",
        "password": "StrongPassword123!",
        "display_name": "परीक्षार्थी",
    }
    res1 = client.post("/api/auth/signup", json=payload)
    assert res1.status_code == 201

    # Attempt second registration with same email (case insensitive)
    payload["email"] = "LEARNER_DUP@example.com"
    res2 = client.post("/api/auth/signup", json=payload)
    assert res2.status_code == 409
    assert "पहले से मौजूद" in res2.json()["detail"]


def test_signup_validation_weak_password(client: TestClient):
    payload = {
        "email": "weak@example.com",
        "password": "password123",  # Common password
        "display_name": "परीक्षार्थी",
    }
    res = client.post("/api/auth/signup", json=payload)
    assert res.status_code == 422


def test_login_success_and_generic_failure(client: TestClient):
    # 1. Sign up user
    client.post("/api/auth/signup", json={
        "email": "login_test@example.com",
        "password": "CorrectPassword123",
        "display_name": "परीक्षक",
    })

    # 2. Login with correct credentials
    login_res = client.post("/api/auth/login", json={
        "email": "login_test@example.com",
        "password": "CorrectPassword123",
    })
    assert login_res.status_code == 200
    assert "nihongo_session" in login_res.cookies
    assert "nihongo_csrf" in login_res.cookies

    # 3. Login with wrong password (generic error)
    wrong_pass_res = client.post("/api/auth/login", json={
        "email": "login_test@example.com",
        "password": "WrongPassword123",
    })
    assert wrong_pass_res.status_code == 401
    assert "अमान्य ईमेल या पासवर्ड" in wrong_pass_res.json()["detail"]

    # 4. Login with non-existent user (same generic error)
    no_user_res = client.post("/api/auth/login", json={
        "email": "nonexistent@example.com",
        "password": "SomePassword123",
    })
    assert no_user_res.status_code == 401
    assert "अमान्य ईमेल या पासवर्ड" in no_user_res.json()["detail"]


def test_login_rate_limiting_per_ip_and_email(client: TestClient):
    email = "ratelimit_user@example.com"

    # Register user
    client.post("/api/auth/signup", json={
        "email": email,
        "password": "CorrectPassword123",
    })

    # Attempt 5 consecutive failed logins (triggering email limit)
    for _ in range(5):
        client.post("/api/auth/login", json={
            "email": email,
            "password": "WrongPassword",
        })

    # 6th attempt should return 429 Too Many Requests
    blocked_res = client.post("/api/auth/login", json={
        "email": email,
        "password": "WrongPassword",
    })
    assert blocked_res.status_code == 429
    assert "बहुत अधिक प्रयास" in blocked_res.json()["detail"]


def test_csrf_protection(client: TestClient):
    signup_res = client.post("/api/auth/signup", json={
        "email": "csrf_test@example.com",
        "password": "StrongPassword123!",
    })
    csrf_token = signup_res.cookies.get("nihongo_csrf")
    assert csrf_token is not None

    # 1. Missing CSRF header on mutating request -> 403 Forbidden
    res_missing = client.patch(
        "/api/auth/profile",
        json={"display_name": "न्यू नेम"},
    )
    assert res_missing.status_code == 403
    assert "CSRF टोकन" in res_missing.json()["detail"]

    # 2. Wrong CSRF header -> 403 Forbidden
    res_wrong = client.patch(
        "/api/auth/profile",
        json={"display_name": "न्यू नेम"},
        headers={"X-CSRF-Token": "invalid_csrf_token_value"},
    )
    assert res_wrong.status_code == 403

    # 3. Valid CSRF header -> 200 OK
    res_valid = client.patch(
        "/api/auth/profile",
        json={"display_name": "न्यू नेम"},
        headers={"X-CSRF-Token": csrf_token},
    )
    assert res_valid.status_code == 200
    assert res_valid.json()["display_name"] == "न्यू नेम"


def test_logout(client: TestClient):
    signup_res = client.post("/api/auth/signup", json={
        "email": "logout_test@example.com",
        "password": "StrongPassword123!",
    })
    csrf_token = signup_res.cookies.get("nihongo_csrf")

    # Access /me
    me_res = client.get("/api/auth/me")
    assert me_res.status_code == 200

    # Logout with CSRF header
    logout_res = client.post("/api/auth/logout", headers={"X-CSRF-Token": csrf_token})
    assert logout_res.status_code == 200

    # Access /me after logout should fail with 401
    me_after = client.get("/api/auth/me")
    assert me_after.status_code == 401


def test_password_change_revokes_other_sessions():
    client1 = TestClient(app)
    client2 = TestClient(app)

    signup_res = client1.post("/api/auth/signup", json={
        "email": "session_revoke@example.com",
        "password": "InitialPassword123",
    })
    csrf1 = signup_res.cookies.get("nihongo_csrf")

    # Login from client2
    login_res2 = client2.post("/api/auth/login", json={
        "email": "session_revoke@example.com",
        "password": "InitialPassword123",
    })
    csrf2 = login_res2.cookies.get("nihongo_csrf")

    # Both sessions work initially
    assert client1.get("/api/auth/me").status_code == 200
    assert client2.get("/api/auth/me").status_code == 200

    # Change password from client2
    change_res = client2.post(
        "/api/auth/change-password",
        json={
            "current_password": "InitialPassword123",
            "new_password": "BrandNewPassword123!",
        },
        headers={"X-CSRF-Token": csrf2},
    )
    assert change_res.status_code == 200

    # Session 1 must now be revoked (401)!
    assert client1.get("/api/auth/me").status_code == 401

    # Session 2 remains valid (200)
    assert client2.get("/api/auth/me").status_code == 200


def test_change_password_wrong_current_password(client: TestClient):
    signup_res = client.post("/api/auth/signup", json={
        "email": "wrong_pass_user@example.com",
        "password": "CorrectPassword123!",
    })
    csrf = signup_res.cookies.get("nihongo_csrf")

    res = client.post(
        "/api/auth/change-password",
        json={
            "current_password": "WrongCurrentPassword123!",
            "new_password": "NewValidPassword123!",
        },
        headers={"X-CSRF-Token": csrf},
    )
    assert res.status_code == 400
    assert "वर्तमान पासवर्ड गलत है" in res.json()["detail"]


def test_change_email_and_wrong_password_check(client: TestClient):
    signup_res = client.post("/api/auth/signup", json={
        "email": "original_email@example.com",
        "password": "Password123!",
    })
    csrf = signup_res.cookies.get("nihongo_csrf")

    # 1. Attempt change email with WRONG password -> 400
    res_wrong = client.post(
        "/api/auth/change-email",
        json={
            "new_email": "updated_email@example.com",
            "current_password": "IncorrectPassword",
        },
        headers={"X-CSRF-Token": csrf},
    )
    assert res_wrong.status_code == 400
    assert "वर्तमान पासवर्ड गलत है" in res_wrong.json()["detail"]

    # 2. Change email with CORRECT password -> 200
    res_ok = client.post(
        "/api/auth/change-email",
        json={
            "new_email": "updated_email@example.com",
            "current_password": "Password123!",
        },
        headers={"X-CSRF-Token": csrf},
    )
    assert res_ok.status_code == 200
    assert res_ok.json()["user"]["email"] == "updated_email@example.com"


def test_delete_account_and_wrong_password_check(client: TestClient):
    signup_res = client.post("/api/auth/signup", json={
        "email": "to_delete@example.com",
        "password": "Password123!",
    })
    csrf = signup_res.cookies.get("nihongo_csrf")
    user_id = signup_res.json()["id"]

    # 1. Attempt delete with WRONG password -> 400
    del_wrong = client.request(
        "DELETE",
        "/api/auth/account",
        json={"current_password": "IncorrectPassword"},
        headers={"X-CSRF-Token": csrf},
    )
    assert del_wrong.status_code == 400
    assert "वर्तमान पासवर्ड गलत है" in del_wrong.json()["detail"]

    # 2. Delete with CORRECT password -> 200
    del_ok = client.request(
        "DELETE",
        "/api/auth/account",
        json={"current_password": "Password123!"},
        headers={"X-CSRF-Token": csrf},
    )
    assert del_ok.status_code == 200

    # Verify user record and progress are removed from DB
    db = SessionLocal()
    assert db.query(User).filter(User.id == user_id).first() is None
    assert db.query(UserProgress).filter(UserProgress.user_id == user_id).first() is None
    db.close()


def test_unauthenticated_requests_return_401():
    anon_client = TestClient(app)

    # All protected endpoints return 401 when accessed without active session
    assert anon_client.get("/api/auth/me").status_code == 401
    assert anon_client.patch("/api/auth/profile", json={"display_name": "x"}).status_code == 401
    assert anon_client.post("/api/auth/avatar").status_code == 401
    assert anon_client.post("/api/auth/change-email", json={"new_email": "a@b.com", "current_password": "p"}).status_code == 401
    assert anon_client.post("/api/auth/change-password", json={"current_password": "p", "new_password": "p"}).status_code == 401
    assert anon_client.request("DELETE", "/api/auth/account", json={"current_password": "p"}).status_code == 401
    assert anon_client.post("/api/auth/logout").status_code == 401
    assert anon_client.get("/api/sync/progress").status_code == 401
    assert anon_client.post("/api/sync/progress", json={"profile": {"dailyGoalMinutes": 10, "streakDays": 1, "longestStreakDays": 1, "completedLessons": [], "completedKanaGroups": [], "completedVocabUnits": [], "completedGrammarPoints": [], "bookmarkedItems": [], "lastActiveDate": "", "onboarded": False, "resetEpoch": 0}, "cards": []}).status_code == 401


def test_avatar_upload_resize_and_etag(client: TestClient):
    signup_res = client.post("/api/auth/signup", json={
        "email": "avatar_user@example.com",
        "password": "Password123!",
    })
    csrf = signup_res.cookies.get("nihongo_csrf")
    user_id = signup_res.json()["id"]

    # Generate 500x500 test image in memory
    img = Image.new("RGB", (500, 500), color=(255, 0, 0))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)

    # Upload avatar with CSRF token
    upload_res = client.post(
        "/api/auth/avatar",
        files={"file": ("test.png", buf.getvalue(), "image/png")},
        headers={"X-CSRF-Token": csrf},
    )
    assert upload_res.status_code == 200
    assert "avatar_url" in upload_res.json()

    # Retrieve avatar
    get_res = client.get(f"/api/auth/avatar/{user_id}")
    assert get_res.status_code == 200
    assert get_res.headers["content-type"] == "image/webp"
    etag = get_res.headers.get("etag")
    assert etag is not None

    # Verify resized dimensions in database
    retrieved_img = Image.open(io.BytesIO(get_res.content))
    assert retrieved_img.size == (256, 256)

    # Test ETag conditional request
    cached_res = client.get(f"/api/auth/avatar/{user_id}", headers={"if-none-match": etag})
    assert cached_res.status_code == 304

    # Verify GET /api/auth/me returns avatar_url
    me_res = client.get("/api/auth/me")
    assert me_res.status_code == 200
    assert me_res.json()["avatar_url"] is not None
    assert f"/api/auth/avatar/{user_id}" in me_res.json()["avatar_url"]

    # Test relogin persists avatar
    client.post("/api/auth/logout", headers={"X-CSRF-Token": csrf})
    login_res = client.post("/api/auth/login", json={
        "email": "avatar_user@example.com",
        "password": "Password123!",
    })
    assert login_res.status_code == 200
    assert login_res.json()["avatar_url"] is not None
    assert f"/api/auth/avatar/{user_id}" in login_res.json()["avatar_url"]

    me_relogin_res = client.get("/api/auth/me")
    assert me_relogin_res.status_code == 200
    assert me_relogin_res.json()["avatar_url"] is not None


def test_avatar_upload_oversized_rejected(client: TestClient):
    signup_res = client.post("/api/auth/signup", json={
        "email": "large_avatar@example.com",
        "password": "Password123!",
    })
    csrf = signup_res.cookies.get("nihongo_csrf")

    # Create oversized payload (> 2MB)
    large_data = b"0" * (2 * 1024 * 1024 + 10)
    res = client.post(
        "/api/auth/avatar",
        files={"file": ("large.png", large_data, "image/png")},
        headers={"X-CSRF-Token": csrf},
    )
    assert res.status_code == 413


def test_avatar_upload_oversized_dimensions_rejected(client: TestClient):
    signup_res = client.post("/api/auth/signup", json={
        "email": "huge_dim_avatar@example.com",
        "password": "Password123!",
    })
    csrf = signup_res.cookies.get("nihongo_csrf")

    # Image with dimension 4097 x 50 (exceeds 4096 limit)
    img = Image.new("RGB", (4097, 50), color=(0, 255, 0))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)

    res = client.post(
        "/api/auth/avatar",
        files={"file": ("huge_dim.png", buf.getvalue(), "image/png")},
        headers={"X-CSRF-Token": csrf},
    )
    assert res.status_code == 400
    assert "चित्र का रिज़ॉल्यूशन बहुत बड़ा है" in res.json()["detail"]


def test_trusted_proxy_client_ip_handling():
    # 1. Direct request without proxy -> peer IP returned
    scope_direct = {"type": "http", "client": ("198.51.100.25", 50000), "headers": []}
    req_direct = Request(scope_direct)
    assert get_client_ip(req_direct) == "198.51.100.25"

    # 2. Untrusted peer sending spoofed X-Forwarded-For -> spoofed header IGNORED
    scope_untrusted = {
        "type": "http",
        "client": ("198.51.100.25", 50000),
        "headers": [(b"x-forwarded-for", b"203.0.113.195, 10.0.0.1")],
    }
    req_untrusted = Request(scope_untrusted)
    assert get_client_ip(req_untrusted) == "198.51.100.25"

    # 3. Trusted reverse proxy peer walking from RIGHT and matching CIDR (10.0.0.0/8)
    # Header contains: [Spoofed IP by client, Real Client IP, Trusted Internal Proxy, Trusted Gateway]
    scope_trusted = {
        "type": "http",
        "client": ("127.0.0.1", 50000),
        "headers": [(b"x-forwarded-for", b"1.1.1.1, 203.0.113.50, 10.1.2.3, 127.0.0.1")],
    }
    req_trusted = Request(scope_trusted)
    # 127.0.0.1 is trusted -> skip
    # 10.1.2.3 is in 10.0.0.0/8 (trusted) -> skip
    # 203.0.113.50 is the first untrusted IP from the right -> REAL CLIENT IP
    assert get_client_ip(req_trusted) == "203.0.113.50"

