import os
from pathlib import Path
import pytest
from sqlalchemy import text
from fastapi.testclient import TestClient

# Ensure test runs against an isolated test database, preserving the developer's real nihongo.db
TEST_DB_PATH = Path(__file__).resolve().parent / "test_nihongo.db"
os.environ["DATABASE_URL"] = f"sqlite:///{TEST_DB_PATH}"
os.environ["SKIP_STARTUP_DB_CHECK"] = "1"

import database
from database import Base, engine, SessionLocal, get_db
import models
import security
from main import app


@pytest.fixture(scope="session", autouse=True)
def setup_test_database():
    """Create all tables on the isolated test engine and stamp migration revision."""
    if TEST_DB_PATH.exists():
        TEST_DB_PATH.unlink()

    Base.metadata.create_all(bind=engine)
    with engine.connect() as conn:
        conn.execute(text("CREATE TABLE IF NOT EXISTS alembic_version (version_num VARCHAR(32) NOT NULL, PRIMARY KEY (version_num))"))
        conn.execute(text("DELETE FROM alembic_version"))
        conn.execute(text("INSERT INTO alembic_version (version_num) VALUES ('c8ab4b63a2ef')"))
        conn.commit()
    yield
    Base.metadata.drop_all(bind=engine)
    if TEST_DB_PATH.exists():
        try:
            TEST_DB_PATH.unlink()
        except Exception:
            pass


@pytest.fixture(autouse=True)
def clean_db_and_limits():
    """Clear tables and rate limits between tests."""
    security._ip_login_attempts.clear()
    security._email_login_attempts.clear()
    security._ip_signup_attempts.clear()
    security._ip_forgot_password_attempts.clear()
    security._email_forgot_password_attempts.clear()
    security._ip_reset_password_attempts.clear()
    security._ip_verify_email_attempts.clear()
    security._ip_resend_verification_attempts.clear()
    security._email_resend_verification_attempts.clear()

    db = SessionLocal()
    try:
        db.query(models.EmailVerificationToken).delete()
        db.query(models.PasswordResetToken).delete()
        db.query(models.UserSession).delete()
        db.query(models.UserAvatar).delete()
        db.query(models.UserReviewCard).delete()
        db.query(models.UserProgress).delete()
        db.query(models.User).delete()
        db.commit()
    finally:
        db.close()
    yield


@pytest.fixture
def client():
    with TestClient(app) as c:
        yield c
