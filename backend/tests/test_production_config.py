import os
from unittest.mock import patch
import pytest
from fastapi.testclient import TestClient
from config import settings


def test_production_settings_validation_missing_or_weak_secret():
    """Verify production mode rejects missing, weak, or placeholder SECRET_KEY."""
    # 1. Placeholder secret
    with patch.dict(os.environ, {
        "ENVIRONMENT": "production",
        "SECRET_KEY": "replace_with_a_secure_random_64_character_hex_string",
        "ALLOWED_ORIGINS": "https://nihongo.example.com",
        "DATABASE_URL": "postgresql://user:pass@localhost:5432/nihongo",
    }):
        with pytest.raises(RuntimeError) as exc:
            settings.validate_startup_config()
        assert "SECRET_KEY is missing, too short" in str(exc.value)

    # 2. Too short secret (< 32 chars)
    with patch.dict(os.environ, {
        "ENVIRONMENT": "production",
        "SECRET_KEY": "short_secret_key",
        "ALLOWED_ORIGINS": "https://nihongo.example.com",
        "DATABASE_URL": "postgresql://user:pass@localhost:5432/nihongo",
    }):
        with pytest.raises(RuntimeError) as exc:
            settings.validate_startup_config()
        assert "SECRET_KEY is missing, too short" in str(exc.value)


def test_production_settings_validation_invalid_origins():
    """Verify production mode rejects wildcard '*' or localhost in ALLOWED_ORIGINS."""
    # 1. Wildcard origin
    with patch.dict(os.environ, {
        "ENVIRONMENT": "production",
        "SECRET_KEY": "a" * 64,
        "ALLOWED_ORIGINS": "*",
        "DATABASE_URL": "postgresql://user:pass@localhost:5432/nihongo",
    }):
        with pytest.raises(RuntimeError) as exc:
            settings.validate_startup_config()
        assert "cannot be wildcard '*'" in str(exc.value)

    # 2. Localhost origin
    with patch.dict(os.environ, {
        "ENVIRONMENT": "production",
        "SECRET_KEY": "a" * 64,
        "ALLOWED_ORIGINS": "http://localhost:3000",
        "DATABASE_URL": "postgresql://user:pass@localhost:5432/nihongo",
    }):
        with pytest.raises(RuntimeError) as exc:
            settings.validate_startup_config()
        assert "cannot contain localhost/127.0.0.1 in production" in str(exc.value)


def test_production_settings_validation_sqlite_warning():
    """Verify production mode rejects SQLite unless explicitly allowed."""
    with patch.dict(os.environ, {
        "ENVIRONMENT": "production",
        "SECRET_KEY": "a" * 64,
        "ALLOWED_ORIGINS": "https://nihongo.example.com",
        "DATABASE_URL": "sqlite:///./nihongo.db",
        "ALLOW_SQLITE_IN_PRODUCTION": "false",
    }):
        with pytest.raises(RuntimeError) as exc:
            settings.validate_startup_config()
        assert "SQLite is not recommended for production" in str(exc.value)

    # If ALLOW_SQLITE_IN_PRODUCTION is True, it succeeds
    with patch.dict(os.environ, {
        "ENVIRONMENT": "production",
        "SECRET_KEY": "a" * 64,
        "ALLOWED_ORIGINS": "https://nihongo.example.com",
        "DATABASE_URL": "sqlite:///./nihongo.db",
        "ALLOW_SQLITE_IN_PRODUCTION": "true",
    }):
        settings.validate_startup_config()  # Should not raise


def test_security_headers_present_on_responses(client: TestClient):
    """Verify standard security headers are attached to API responses."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.headers["X-Content-Type-Options"] == "nosniff"
    assert response.headers["Referrer-Policy"] == "strict-origin-when-cross-origin"
    assert response.headers["X-Frame-Options"] == "DENY"
    assert "camera=()" in response.headers["Permissions-Policy"]


def test_https_hsts_header_in_production(client: TestClient):
    """Verify HSTS header is attached when request is forwarded over HTTPS in production."""
    with patch.dict(os.environ, {"ENVIRONMENT": "production"}):
        response = client.get("/health", headers={"X-Forwarded-Proto": "https"})
        assert response.status_code == 200
        assert "Strict-Transport-Security" in response.headers
        assert response.headers["Strict-Transport-Security"] == "max-age=31536000; includeSubDomains"
