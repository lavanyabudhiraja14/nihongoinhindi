import os
import logging
from pathlib import Path
from typing import List
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger("nihongo_backend")

BACKEND_DIR = Path(__file__).resolve().parent

INSECURE_SECRET_PLACEHOLDERS = {
    "replace_with_a_secure_random_64_character_hex_string",
    "your_secret_key_here",
    "secret",
    "changeme",
    "password",
    "admin",
    "12345678",
}


def resolve_sqlite_url(url: str) -> str:
    """Resolve relative SQLite paths against the backend directory."""
    if url.startswith("sqlite:///") and not url.startswith("sqlite:////") and ":memory:" not in url:
        rel_part = url[len("sqlite:///"):]
        if rel_part.startswith("./"):
            rel_part = rel_part[2:]
        abs_path = (BACKEND_DIR / rel_part).resolve()
        return f"sqlite:///{abs_path}"
    return url


class Settings:
    @property
    def ENVIRONMENT(self) -> str:
        return os.getenv("ENVIRONMENT", "development").strip().lower()

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"

    @property
    def SECRET_KEY(self) -> str:
        return os.getenv("SECRET_KEY", "replace_with_a_secure_random_64_character_hex_string").strip()

    @property
    def DATABASE_URL(self) -> str:
        raw_db_url = os.getenv("DATABASE_URL", "sqlite:///./nihongo.db").strip()
        return resolve_sqlite_url(raw_db_url)

    @property
    def ALLOWED_ORIGINS(self) -> List[str]:
        raw_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000")
        return [origin.strip() for origin in raw_origins.split(",") if origin.strip()]

    @property
    def TRUSTED_PROXIES(self) -> List[str]:
        raw_proxies = os.getenv(
            "TRUSTED_PROXIES",
            "127.0.0.1,::1,10.0.0.0/8,172.16.0.0/12,192.168.0.0/16,testclient",
        )
        return [proxy.strip() for proxy in raw_proxies.split(",") if proxy.strip()]

    @property
    def GROQ_API_KEY(self) -> str:
        return os.getenv("GROQ_API_KEY", "").strip()

    @property
    def GROQ_MODEL(self) -> str:
        return os.getenv("GROQ_MODEL", "openai/gpt-oss-120b").strip()

    @property
    def GROQ_REASONING_EFFORT(self) -> str:
        return os.getenv("GROQ_REASONING_EFFORT", "").strip()

    @property
    def RATE_LIMIT_DAILY(self) -> int:
        return int(os.getenv("RATE_LIMIT_DAILY", "30"))

    @property
    def LLM_TIMEOUT_SECONDS(self) -> float:
        return float(os.getenv("LLM_TIMEOUT_SECONDS", "20"))

    @property
    def MAX_OUTPUT_TOKENS(self) -> int:
        return int(os.getenv("MAX_OUTPUT_TOKENS", "2000"))

    @property
    def ALLOW_SQLITE_IN_PRODUCTION(self) -> bool:
        return os.getenv("ALLOW_SQLITE_IN_PRODUCTION", "false").strip().lower() in {
            "true",
            "1",
            "yes",
        }

    @property
    def PORT(self) -> int:
        return int(os.getenv("PORT", "8000"))

    @property
    def HOST(self) -> str:
        return os.getenv("HOST", "0.0.0.0")

    @property
    def SESSION_COOKIE_NAME(self) -> str:
        return os.getenv("SESSION_COOKIE_NAME", "nihongo_session")

    @property
    def SESSION_MAX_AGE_DAYS(self) -> int:
        return int(os.getenv("SESSION_MAX_AGE_DAYS", "30"))

    # Email Settings
    @property
    def EMAIL_PROVIDER(self) -> str:
        provider = os.getenv("EMAIL_PROVIDER", "").strip().lower()
        if provider:
            return provider
        if os.getenv("RESEND_API_KEY"):
            return "resend"
        if os.getenv("SMTP_HOST"):
            return "smtp"
        return "console"

    @property
    def EMAIL_FROM(self) -> str:
        return os.getenv("EMAIL_FROM", "Nihongo Seekho <noreply@nihongoseekho.com>").strip()

    @property
    def FRONTEND_URL(self) -> str:
        url = os.getenv("FRONTEND_URL", "http://localhost:3000").strip()
        return url.rstrip("/")

    @property
    def RESEND_API_KEY(self) -> str:
        return os.getenv("RESEND_API_KEY", "").strip()

    @property
    def SMTP_HOST(self) -> str:
        return os.getenv("SMTP_HOST", "").strip()

    @property
    def SMTP_PORT(self) -> int:
        return int(os.getenv("SMTP_PORT", "587"))

    @property
    def SMTP_USER(self) -> str:
        return os.getenv("SMTP_USER", "").strip()

    @property
    def SMTP_PASSWORD(self) -> str:
        return os.getenv("SMTP_PASSWORD", "").strip()

    @property
    def SMTP_USE_TLS(self) -> bool:
        return os.getenv("SMTP_USE_TLS", "true").strip().lower() in {"true", "1", "yes"}

    @property
    def SMTP_USE_SSL(self) -> bool:
        return os.getenv("SMTP_USE_SSL", "false").strip().lower() in {"true", "1", "yes"}

    def validate_startup_config(self) -> None:
        """Validate critical configuration, failing fast in production if unsafe."""
        if not self.is_production:
            return

        # 1. SECRET_KEY validation
        if (
            not self.SECRET_KEY
            or len(self.SECRET_KEY) < 32
            or self.SECRET_KEY.lower() in INSECURE_SECRET_PLACEHOLDERS
        ):
            raise RuntimeError(
                "Production configuration error: SECRET_KEY is missing, too short (must be at least 32 characters), "
                "or uses a default placeholder. Generate one using: python -c \"import secrets; print(secrets.token_hex(32))\""
            )

        # 2. ALLOWED_ORIGINS validation
        if not self.ALLOWED_ORIGINS:
            raise RuntimeError("Production configuration error: ALLOWED_ORIGINS cannot be empty in production.")

        for origin in self.ALLOWED_ORIGINS:
            if origin == "*":
                raise RuntimeError("Production configuration error: ALLOWED_ORIGINS cannot be wildcard '*' in production.")
            origin_lower = origin.lower()
            if "localhost" in origin_lower or "127.0.0.1" in origin_lower:
                raise RuntimeError(
                    f"Production configuration error: ALLOWED_ORIGINS cannot contain localhost/127.0.0.1 in production: {origin}"
                )

        # 3. DATABASE_URL validation
        if self.DATABASE_URL.startswith("sqlite") and not self.ALLOW_SQLITE_IN_PRODUCTION:
            raise RuntimeError(
                "Production configuration error: SQLite is not recommended for production because ephemeral hosts "
                "wipe disks on redeploy. Set ALLOW_SQLITE_IN_PRODUCTION=true to override or configure a hosted PostgreSQL DATABASE_URL."
            )

        # 4. Email configuration validation
        if self.EMAIL_PROVIDER == "resend" and not self.RESEND_API_KEY:
            raise RuntimeError(
                "Production configuration error: EMAIL_PROVIDER is 'resend' but RESEND_API_KEY is not set."
            )
        elif self.EMAIL_PROVIDER == "smtp" and not self.SMTP_HOST:
            raise RuntimeError(
                "Production configuration error: EMAIL_PROVIDER is 'smtp' but SMTP_HOST is not set."
            )
        elif self.EMAIL_PROVIDER == "console":
            logger.warning(
                "Warning: EMAIL_PROVIDER is 'console' in production. Emails will be logged but not delivered."
            )

        # 5. Optional GROQ_API_KEY check
        if not self.GROQ_API_KEY or self.GROQ_API_KEY == "your_groq_api_key_here":
            logger.warning("Warning: GROQ_API_KEY is not configured. AI Tutor features will be unavailable.")


settings = Settings()
