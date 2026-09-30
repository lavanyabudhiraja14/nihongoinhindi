import hmac
import hashlib
import secrets
import time
from typing import Dict, Tuple, Optional
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, InvalidHashError, VerificationError
import email_validator
from email_validator import validate_email, EmailNotValidError

# Initialize Argon2id password hasher directly
ph = PasswordHasher(
    time_cost=2,
    memory_cost=65536,  # 64 MB
    parallelism=1,
    hash_len=32,
)

# Common passwords blacklist (top 50 common weak passwords)
COMMON_PASSWORDS = {
    "password", "12345678", "123456789", "1234567890", "1234567", "qwertyuiop",
    "password123", "admin123", "welcome1", "iloveyou", "secret123", "letmein123",
    "monkey123", "dragon123", "football", "shadow123", "master123", "superman1",
    "trustno1", "computer1", "pass1234", "test1234", "password1", "12341234",
    "abc12345", "nihongo123", "nihongo1", "japanese1", "shikshak1"
}


def hash_password(password: str) -> str:
    """Hash a plaintext password using Argon2id."""
    return ph.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    """Verify a plaintext password against an Argon2id hash in constant time."""
    try:
        return ph.verify(password_hash, password)
    except (VerifyMismatchError, InvalidHashError, VerificationError):
        return False


def validate_and_normalize_email(email_str: str) -> str:
    """Validate email format and return normalized lowercase address."""
    try:
        validated = validate_email(email_str.strip(), check_deliverability=False)
        return validated.normalized.lower()
    except EmailNotValidError as e:
        raise ValueError("कृपया एक मान्य ईमेल पता दर्ज करें।") from e


def validate_password_strength(password: str) -> None:
    """Enforce password length and reject easily guessable common passwords."""
    if len(password) < 8:
        raise ValueError("पासवर्ड कम से कम ८ अक्षरों का होना चाहिए।")
    if len(password) > 128:
        raise ValueError("पासवर्ड १२८ अक्षरों से अधिक नहीं हो सकता।")
    if password.lower() in COMMON_PASSWORDS:
        raise ValueError("यह पासवर्ड बहुत सामान्य और कमजोर है। कृपया एक मजबूत पासवर्ड चुनें।")


def generate_session_token() -> str:
    """Generate a high-entropy random URL-safe opaque session token."""
    return secrets.token_urlsafe(32)


def hash_session_token(token: str) -> str:
    """Hash a session token with SHA-256 for secure database storage."""
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def generate_verification_token() -> str:
    """Generate a high-entropy random token for email verification."""
    return secrets.token_urlsafe(32)


def hash_verification_token(token: str) -> str:
    """Hash an email verification token with SHA-256 for secure database storage."""
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def generate_reset_token() -> str:
    """Generate a high-entropy random token for password reset."""
    return secrets.token_urlsafe(32)


def hash_reset_token(token: str) -> str:
    """Hash a password reset token with SHA-256 for secure database storage."""
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def generate_csrf_token() -> str:
    """Generate a high-entropy random CSRF token for the double-submit cookie pattern."""
    return secrets.token_urlsafe(32)


def verify_csrf_tokens(cookie_token: Optional[str], header_token: Optional[str]) -> bool:
    """Constant-time comparison for CSRF double-submit token validation."""
    if not cookie_token or not header_token:
        return False
    return hmac.compare_digest(cookie_token.strip(), header_token.strip())


# =============================================================
# IN-MEMORY RATE LIMITERS FOR AUTH
# (Sliding Window per IP and per Email)
# =============================================================
_ip_login_attempts: Dict[str, list] = {}
_email_login_attempts: Dict[str, list] = {}
_ip_signup_attempts: Dict[str, list] = {}
_ip_forgot_password_attempts: Dict[str, list] = {}
_email_forgot_password_attempts: Dict[str, list] = {}
_ip_reset_password_attempts: Dict[str, list] = {}
_ip_verify_email_attempts: Dict[str, list] = {}
_ip_resend_verification_attempts: Dict[str, list] = {}
_email_resend_verification_attempts: Dict[str, list] = {}


def check_rate_limit(
    tracker: Dict[str, list],
    key: str,
    max_attempts: int,
    window_seconds: int,
    error_message: str,
) -> None:
    """Enforce sliding-window rate limit."""
    now = time.time()
    timestamps = tracker.get(key, [])
    # Filter out entries older than window
    valid_timestamps = [t for t in timestamps if now - t < window_seconds]

    if len(valid_timestamps) >= max_attempts:
        tracker[key] = valid_timestamps
        raise ValueError(error_message)

    valid_timestamps.append(now)
    tracker[key] = valid_timestamps


def limit_login(client_ip: str, email: str) -> None:
    """Limit login to 10 attempts/min per IP and 5 attempts/min per email."""
    # Rate limit by IP: max 10 per minute
    check_rate_limit(
        _ip_login_attempts,
        client_ip,
        max_attempts=10,
        window_seconds=60,
        error_message="बहुत अधिक प्रयास हुए। कृपया १ मिनट बाद पुनः प्रयास करें।",
    )
    # Rate limit by Email: max 5 per minute
    if email:
        check_rate_limit(
            _email_login_attempts,
            email.lower(),
            max_attempts=5,
            window_seconds=60,
            error_message="इस ईमेल के लिए बहुत अधिक प्रयास हुए। कृपया १ मिनट बाद पुनः प्रयास करें।",
        )


def limit_signup(client_ip: str) -> None:
    """Limit signup to 5 accounts per hour per IP."""
    check_rate_limit(
        _ip_signup_attempts,
        client_ip,
        max_attempts=5,
        window_seconds=3600,
        error_message="साइन अप सीमा समाप्त। कृपया कुछ समय बाद पुनः प्रयास करें।",
    )


def limit_forgot_password(client_ip: str, email: str) -> None:
    """Limit password reset requests: 5 per 15 min per IP, 3 per 15 min per email."""
    check_rate_limit(
        _ip_forgot_password_attempts,
        client_ip,
        max_attempts=5,
        window_seconds=900,
        error_message="पासवर्ड रीसेट अनुरोधों की सीमा समाप्त। कृपया १५ मिनट बाद पुनः प्रयास करें।",
    )
    if email:
        check_rate_limit(
            _email_forgot_password_attempts,
            email.lower(),
            max_attempts=3,
            window_seconds=900,
            error_message="इस ईमेल के लिए पासवर्ड रीसेट अनुरोधों की सीमा समाप्त। कृपया १५ मिनट बाद पुनः प्रयास करें।",
        )


def limit_reset_password(client_ip: str) -> None:
    """Limit password reset submissions to 10 attempts per minute per IP."""
    check_rate_limit(
        _ip_reset_password_attempts,
        client_ip,
        max_attempts=10,
        window_seconds=60,
        error_message="बहुत अधिक प्रयास। कृपया १ मिनट बाद पुनः प्रयास करें।",
    )


def limit_verify_email(client_ip: str) -> None:
    """Limit email verification attempts to 10 attempts per minute per IP."""
    check_rate_limit(
        _ip_verify_email_attempts,
        client_ip,
        max_attempts=10,
        window_seconds=60,
        error_message="सत्यापन प्रयास सीमा समाप्त। कृपया १ मिनट बाद पुनः प्रयास करें।",
    )


def limit_resend_verification(client_ip: str, email: str) -> None:
    """Limit verification resend: 3 per 5 min per IP, 3 per 5 min per email."""
    check_rate_limit(
        _ip_resend_verification_attempts,
        client_ip,
        max_attempts=3,
        window_seconds=300,
        error_message="सत्यापन ईमेल भेजने की सीमा समाप्त। कृपया ५ मिनट बाद पुनः प्रयास करें।",
    )
    if email:
        check_rate_limit(
            _email_resend_verification_attempts,
            email.lower(),
            max_attempts=3,
            window_seconds=300,
            error_message="इस ईमेल के लिए सत्यापन ईमेल भेजने की सीमा समाप्त। कृपया ५ मिनट बाद पुनः प्रयास करें।",
        )

