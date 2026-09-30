import io
import os
from datetime import datetime, timezone, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Request, Response, UploadFile, File, status
from sqlalchemy.orm import Session
from PIL import Image

from database import get_db
from models import (
    User,
    UserProgress,
    UserSession,
    UserAvatar,
    EmailVerificationToken,
    PasswordResetToken,
    utc_now,
    ensure_utc,
)
from schemas import (
    UserCreate,
    UserLogin,
    UserResponse,
    ProfileUpdate,
    ChangeEmailRequest,
    ChangePasswordRequest,
    DeleteAccountRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    VerifyEmailRequest,
    ResendVerificationRequest,
)
from security import (
    hash_password,
    verify_password,
    generate_session_token,
    hash_session_token,
    generate_verification_token,
    hash_verification_token,
    generate_reset_token,
    hash_reset_token,
    generate_csrf_token,
    limit_login,
    limit_signup,
    limit_forgot_password,
    limit_reset_password,
    limit_verify_email,
    limit_resend_verification,
    validate_password_strength,
)
from email_service import send_password_reset_email, send_verification_email
from dependencies import (
    get_current_user,
    get_client_ip,
    verify_csrf,
    SESSION_COOKIE_NAME,
    CSRF_COOKIE_NAME,
)

router = APIRouter(prefix="/api/auth", tags=["auth"])

ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
IS_PROD = ENVIRONMENT.lower() == "production"
MAX_AVATAR_BYTES = 2 * 1024 * 1024  # 2MB


def set_auth_cookies(response: Response, session_token: str, csrf_token: str, max_age_days: int = 30) -> None:
    """Set secure httpOnly session cookie and readable CSRF cookie."""
    max_age_seconds = max_age_days * 24 * 60 * 60
    # 1. HttpOnly Session Cookie
    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=session_token,
        max_age=max_age_seconds,
        httponly=True,
        samesite="lax",
        secure=IS_PROD,
        path="/",
    )
    # 2. Readable Double-Submit CSRF Cookie (httponly=False so JS can read and mirror in header)
    response.set_cookie(
        key=CSRF_COOKIE_NAME,
        value=csrf_token,
        max_age=max_age_seconds,
        httponly=False,
        samesite="lax",
        secure=IS_PROD,
        path="/",
    )


def clear_auth_cookies(response: Response) -> None:
    """Clear session and CSRF cookies on logout or account deletion."""
    response.delete_cookie(
        key=SESSION_COOKIE_NAME,
        httponly=True,
        samesite="lax",
        secure=IS_PROD,
        path="/",
    )
    response.delete_cookie(
        key=CSRF_COOKIE_NAME,
        httponly=False,
        samesite="lax",
        secure=IS_PROD,
        path="/",
    )


@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def signup(
    payload: UserCreate,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    """Create a new user account, initialize progress record, and issue session."""
    client_ip = get_client_ip(request)
    try:
        limit_signup(client_ip)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=str(e))

    # Check if email is already registered
    existing_user = db.query(User).filter(User.email == payload.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="इस ईमेल से खाता पहले से मौजूद है।",
        )

    # Hash password with Argon2id
    hashed = hash_password(payload.password)
    new_user = User(
        email=payload.email,
        password_hash=hashed,
        display_name=payload.display_name or "शिक्षार्थी",
    )
    db.add(new_user)
    db.flush()

    # Create initial progress record
    initial_progress = UserProgress(
        user_id=new_user.id,
        daily_goal_minutes=10,
        streak_days=1,
        longest_streak_days=1,
        completed_lessons=[],
        completed_kana_groups=[],
        completed_kanji_groups=[],
        completed_vocab_units=[],
        completed_grammar_points=[],
        bookmarked_items=[],
        last_active_date="",
        onboarded=False,
        reset_epoch=0,
    )
    db.add(initial_progress)

    # Issue session
    token = generate_session_token()
    token_hash = hash_session_token(token)
    csrf_token = generate_csrf_token()
    expires_at = datetime.now(timezone.utc) + timedelta(days=30)

    session_record = UserSession(
        user_id=new_user.id,
        token_hash=token_hash,
        expires_at=expires_at,
    )
    db.add(session_record)

    # Generate initial email verification token (valid for 24h)
    raw_verify_token = generate_verification_token()
    verify_token_hash = hash_verification_token(raw_verify_token)
    verification_record = EmailVerificationToken(
        user_id=new_user.id,
        token_hash=verify_token_hash,
        expires_at=utc_now() + timedelta(hours=24),
        used=False,
    )
    db.add(verification_record)
    db.commit()
    db.refresh(new_user)

    # Dispatch verification email
    send_verification_email(new_user.email, raw_verify_token, new_user.display_name)

    set_auth_cookies(response, token, csrf_token)
    return new_user


@router.post("/login", response_model=UserResponse)
def login(
    payload: UserLogin,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    """Authenticate user with email and password, setting httpOnly session and CSRF cookies."""
    client_ip = get_client_ip(request)
    try:
        limit_login(client_ip, payload.email)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=str(e))

    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="अमान्य ईमेल या पासवर्ड।",
        )

    # Issue session with sliding expiration
    token = generate_session_token()
    token_hash = hash_session_token(token)
    csrf_token = generate_csrf_token()
    expires_at = datetime.now(timezone.utc) + timedelta(days=30)

    session_record = UserSession(
        user_id=user.id,
        token_hash=token_hash,
        expires_at=expires_at,
    )
    db.add(session_record)
    db.commit()
    db.refresh(user)

    set_auth_cookies(response, token, csrf_token)
    return user


@router.post("/logout", dependencies=[Depends(verify_csrf)])
def logout(
    request: Request,
    response: Response,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Revoke current session and delete cookies."""
    token = request.cookies.get(SESSION_COOKIE_NAME)
    if not token:
        auth_header = request.headers.get("authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header[7:].strip()

    if token:
        token_hash = hash_session_token(token)
        db.query(UserSession).filter(UserSession.token_hash == token_hash).update({"revoked": True})
        db.commit()

    clear_auth_cookies(response)
    return {"status": "ok", "message": "सफलतापूर्वक लॉग आउट हुआ।"}


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Return currently authenticated user profile."""
    return current_user


@router.patch("/profile", response_model=UserResponse, dependencies=[Depends(verify_csrf)])
def update_profile(
    payload: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update user display name."""
    current_user.display_name = payload.display_name
    current_user.updated_at = utc_now()
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/avatar", dependencies=[Depends(verify_csrf)])
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Upload, validate, and resize avatar to 256x256 WebP in database."""
    content = await file.read()
    if len(content) > MAX_AVATAR_BYTES:
        raise HTTPException(
            status_code=status.HTTP_413_CONTENT_TOO_LARGE,
            detail="चित्र का आकार २ MB से कम होना चाहिए।",
        )

    # Validate image using Pillow
    try:
        img = Image.open(io.BytesIO(content))
        img.verify()
        img = Image.open(io.BytesIO(content))
        width, height = img.size
        if width > 4096 or height > 4096 or (width * height) > 16_000_000:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="चित्र का रिज़ॉल्यूशन बहुत बड़ा है (अधिकतम ४०९६x४०९६ पिक्सल)।",
            )
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="अमान्य चित्र फ़ाइल। केवल PNG, JPG, या WebP की अनुमति है।",
        )

    # Convert to RGBA for transparency or RGB
    if img.mode not in ("RGB", "RGBA"):
        img = img.convert("RGBA")

    # Resize to 256x256 with high-quality resampling
    img = img.resize((256, 256), Image.Resampling.LANCZOS)

    output_buffer = io.BytesIO()
    img.save(output_buffer, format="WEBP", quality=85)
    webp_bytes = output_buffer.getvalue()

    now = utc_now()
    avatar = db.query(UserAvatar).filter(UserAvatar.user_id == current_user.id).first()
    if avatar:
        avatar.image_bytes = webp_bytes
        avatar.content_type = "image/webp"
        avatar.updated_at = now
    else:
        avatar = UserAvatar(
            user_id=current_user.id,
            image_bytes=webp_bytes,
            content_type="image/webp",
            updated_at=now,
        )
        db.add(avatar)

    db.commit()
    return {
        "status": "ok",
        "avatar_url": f"/api/auth/avatar/{current_user.id}?v={int(now.timestamp())}",
    }


@router.get("/avatar/{user_id}")
def get_avatar(
    user_id: str,
    request: Request,
    db: Session = Depends(get_db),
):
    """Serve resized WebP avatar from database with ETag caching."""
    avatar = db.query(UserAvatar).filter(UserAvatar.user_id == user_id).first()
    if not avatar:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="अवतार नहीं मिला।")

    etag = f'W/"{int(avatar.updated_at.timestamp())}"'
    if_none_match = request.headers.get("if-none-match")
    if if_none_match == etag:
        return Response(status_code=status.HTTP_304_NOT_MODIFIED)

    return Response(
        content=avatar.image_bytes,
        media_type=avatar.content_type,
        headers={
            "ETag": etag,
            "Cache-Control": "public, max-age=3600",
        },
    )


@router.post("/change-email", dependencies=[Depends(verify_csrf)])
def change_email(
    payload: ChangeEmailRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update account email address with password verification."""
    if not verify_password(payload.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="वर्तमान पासवर्ड गलत है।",
        )

    if payload.new_email == current_user.email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="नया ईमेल मौजूदा ईमेल के समान है।",
        )

    existing = db.query(User).filter(User.email == payload.new_email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="यह नया ईमेल पहले से किसी अन्य खाते में उपयोग में है।",
        )

    current_user.email = payload.new_email
    current_user.is_verified = False
    current_user.updated_at = utc_now()

    # Invalidate previous verification tokens
    db.query(EmailVerificationToken).filter(
        EmailVerificationToken.user_id == current_user.id,
        EmailVerificationToken.used == False,
    ).update({"used": True})

    # Generate new verification token (valid for 24h)
    raw_verify_token = generate_verification_token()
    verify_token_hash = hash_verification_token(raw_verify_token)
    verification_record = EmailVerificationToken(
        user_id=current_user.id,
        token_hash=verify_token_hash,
        expires_at=utc_now() + timedelta(hours=24),
        used=False,
    )
    db.add(verification_record)
    db.commit()
    db.refresh(current_user)

    # Dispatch verification email to new email address
    send_verification_email(current_user.email, raw_verify_token, current_user.display_name)

    return {
        "status": "ok",
        "message": "ईमेल सफलतापूर्वक अपडेट किया गया। कृपया नए पते पर भेजे गए लिंक से इसे सत्यापित करें।",
        "user": UserResponse.model_validate(current_user),
    }


@router.post("/change-password", dependencies=[Depends(verify_csrf)])
def change_password(
    payload: ChangePasswordRequest,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Update password, verify current password, and revoke all other user sessions."""
    if not verify_password(payload.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="वर्तमान पासवर्ड गलत है।",
        )

    try:
        validate_password_strength(payload.new_password)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    current_user.password_hash = hash_password(payload.new_password)
    current_user.updated_at = utc_now()

    # Identify current session token to preserve it
    current_token = request.cookies.get(SESSION_COOKIE_NAME)
    if not current_token:
        auth_header = request.headers.get("authorization")
        if auth_header and auth_header.startswith("Bearer "):
            current_token = auth_header[7:].strip()

    current_token_hash = hash_session_token(current_token) if current_token else None

    # Revoke all other active sessions
    query = db.query(UserSession).filter(
        UserSession.user_id == current_user.id,
        UserSession.revoked == False,
    )
    if current_token_hash:
        query = query.filter(UserSession.token_hash != current_token_hash)

    query.update({"revoked": True}, synchronize_session=False)
    db.commit()

    return {
        "status": "ok",
        "message": "पासवर्ड सफलतापूर्वक बदला गया। अन्य सभी सत्र समाप्त कर दिए गए हैं।",
    }


@router.delete("/account", dependencies=[Depends(verify_csrf)])
def delete_account(
    payload: DeleteAccountRequest,
    response: Response,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete account and all associated data after password confirmation."""
    if not verify_password(payload.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="वर्तमान पासवर्ड गलत है।",
        )

    db.delete(current_user)
    db.commit()

    clear_auth_cookies(response)
    return {"status": "ok", "message": "खाता सफलतापूर्वक हटा दिया गया।"}


@router.post("/forgot-password")
def forgot_password(
    payload: ForgotPasswordRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    """Request a password reset link. Anti-enumeration: returns identical response whether email exists or not."""
    client_ip = get_client_ip(request)
    try:
        limit_forgot_password(client_ip, payload.email)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=str(e))

    user = db.query(User).filter(User.email == payload.email).first()
    if user:
        # Invalidate previous unused reset tokens
        db.query(PasswordResetToken).filter(
            PasswordResetToken.user_id == user.id,
            PasswordResetToken.used == False,
        ).update({"used": True})

        # Generate single-use random token valid for 30 minutes
        raw_token = generate_reset_token()
        token_hash = hash_reset_token(raw_token)
        reset_rec = PasswordResetToken(
            user_id=user.id,
            token_hash=token_hash,
            expires_at=utc_now() + timedelta(minutes=30),
            used=False,
        )
        db.add(reset_rec)
        db.commit()

        # Send password reset email
        send_password_reset_email(user.email, raw_token, user.display_name)

    return {
        "status": "ok",
        "message": "यदि यह ईमेल पंजीकृत है, तो पासवर्ड रीसेट लिंक भेज दिया गया है।",
    }


@router.post("/reset-password")
def reset_password(
    payload: ResetPasswordRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    """Validate reset token, update password with Argon2id hash, and revoke all user sessions."""
    client_ip = get_client_ip(request)
    try:
        limit_reset_password(client_ip)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=str(e))

    token_hash = hash_reset_token(payload.token)
    reset_rec = db.query(PasswordResetToken).filter(PasswordResetToken.token_hash == token_hash).first()

    if not reset_rec or reset_rec.used:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="अमान्य या पहले से उपयोग किया गया पासवर्ड रीसेट लिंक। कृपया नया लिंक अनुरोध करें।",
        )

    if ensure_utc(reset_rec.expires_at) < utc_now():
        reset_rec.used = True
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="यह पासवर्ड रीसेट लिंक समाप्त (expired) हो चुका है। कृपया नया लिंक अनुरोध करें।",
        )

    user = db.query(User).filter(User.id == reset_rec.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="संबंधित उपयोगकर्ता खाता नहीं मिला।",
        )

    try:
        validate_password_strength(payload.new_password)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    # Update password and mark token used
    user.password_hash = hash_password(payload.new_password)
    user.updated_at = utc_now()
    reset_rec.used = True

    # Invalidate all existing sessions for this user
    db.query(UserSession).filter(
        UserSession.user_id == user.id,
        UserSession.revoked == False,
    ).update({"revoked": True})

    db.commit()

    return {
        "status": "ok",
        "message": "पासवर्ड सफलतापूर्वक रीसेट हो गया है। कृपया नए पासवर्ड के साथ लॉग इन करें।",
    }


@router.post("/verify-email")
def verify_email(
    payload: VerifyEmailRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    """Validate verification token and mark user email as verified."""
    client_ip = get_client_ip(request)
    try:
        limit_verify_email(client_ip)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=str(e))

    token_hash = hash_verification_token(payload.token)
    vt = db.query(EmailVerificationToken).filter(EmailVerificationToken.token_hash == token_hash).first()

    if not vt or vt.used:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="अमान्य या पहले से उपयोग किया गया सत्यापन लिंक।",
        )

    if ensure_utc(vt.expires_at) < utc_now():
        vt.used = True
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="यह ईमेल सत्यापन लिंक समाप्त (expired) हो चुका है। कृपया नया सत्यापन लिंक अनुरोध करें।",
        )

    user = db.query(User).filter(User.id == vt.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="संबंधित उपयोगकर्ता खाता नहीं मिला।",
        )

    user.is_verified = True
    user.updated_at = utc_now()
    vt.used = True

    # Invalidate other pending tokens
    db.query(EmailVerificationToken).filter(
        EmailVerificationToken.user_id == user.id,
        EmailVerificationToken.used == False,
    ).update({"used": True})

    db.commit()
    db.refresh(user)

    return {
        "status": "ok",
        "message": "ईमेल सफलतापूर्वक सत्यापित हो गया है!",
        "user": UserResponse.model_validate(user),
    }


@router.post("/resend-verification")
def resend_verification(
    payload: ResendVerificationRequest,
    request: Request,
    db: Session = Depends(get_db),
):
    """Resend email verification link. Can be called by unverified user with email or active session."""
    client_ip = get_client_ip(request)
    target_email = payload.email

    # If email not in payload, attempt to look up from session cookie if present
    if not target_email:
        token = request.cookies.get(SESSION_COOKIE_NAME)
        if not token:
            auth_header = request.headers.get("authorization")
            if auth_header and auth_header.startswith("Bearer "):
                token = auth_header[7:].strip()
        if token:
            token_hash = hash_session_token(token)
            session_rec = db.query(UserSession).filter(
                UserSession.token_hash == token_hash,
                UserSession.revoked == False,
                UserSession.expires_at > utc_now(),
            ).first()
            if session_rec:
                user = db.query(User).filter(User.id == session_rec.user_id).first()
                if user:
                    target_email = user.email

    try:
        limit_resend_verification(client_ip, target_email or "")
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail=str(e))

    if target_email:
        user = db.query(User).filter(User.email == target_email).first()
        if user and not user.is_verified:
            # Invalidate older tokens
            db.query(EmailVerificationToken).filter(
                EmailVerificationToken.user_id == user.id,
                EmailVerificationToken.used == False,
            ).update({"used": True})

            # Issue new token
            raw_token = generate_verification_token()
            token_hash = hash_verification_token(raw_token)
            vt = EmailVerificationToken(
                user_id=user.id,
                token_hash=token_hash,
                expires_at=utc_now() + timedelta(hours=24),
                used=False,
            )
            db.add(vt)
            db.commit()

            send_verification_email(user.email, raw_token, user.display_name)

    return {
        "status": "ok",
        "message": "यदि आपका खाता पंजीकृत और असत्यापित है, तो नया सत्यापन लिंक भेज दिया गया है।",
    }

