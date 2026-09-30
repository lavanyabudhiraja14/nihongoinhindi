import os
import tempfile
from pathlib import Path
import pytest
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient
from alembic.config import Config
from alembic import command

from database import Base, check_db_migrated, get_db
import models
from main import app

BACKEND_DIR = Path(__file__).resolve().parent.parent

def test_unmigrated_database_startup_fails():
    """Verify check_db_migrated raises RuntimeError when database is unmigrated."""
    with tempfile.NamedTemporaryFile(suffix=".db") as tmp:
        db_path = tmp.name
        temp_engine = create_engine(f"sqlite:///{db_path}")

        # Empty database without tables
        with pytest.raises(RuntimeError) as exc_info:
            check_db_migrated(temp_engine)

        assert "Database is not migrated" in str(exc_info.value)
        assert "Run: alembic upgrade head" in str(exc_info.value)


def test_file_database_migration_and_auth_lifecycle():
    """
    Integration test:
    1. Creates a real temporary file-based SQLite DB.
    2. Runs alembic upgrade head against it.
    3. Verifies all 6 tables exist.
    4. Runs signup, login, /me, and logout against the real schema.
    """
    with tempfile.TemporaryDirectory() as tmpdir:
        db_path = os.path.join(tmpdir, "integration_nihongo.db")
        db_url = f"sqlite:///{db_path}"

        # Run Alembic upgrade head against the temp database
        alembic_cfg = Config(str(BACKEND_DIR / "alembic.ini"))
        alembic_cfg.set_main_option("script_location", str(BACKEND_DIR / "alembic"))
        alembic_cfg.set_main_option("sqlalchemy.url", db_url)

        command.upgrade(alembic_cfg, "head")

        # Verify tables via SQLAlchemy inspector
        temp_engine = create_engine(db_url, connect_args={"check_same_thread": False})
        inspector = inspect(temp_engine)
        tables = set(inspector.get_table_names())

        required = {
            "users",
            "user_avatars",
            "user_progress",
            "user_review_cards",
            "user_sessions",
            "email_verification_tokens",
            "password_reset_tokens",
            "alembic_version",
        }
        assert required.issubset(tables), f"Missing tables in migrated DB: {required - tables}"

        # check_db_migrated must succeed on the migrated database
        check_db_migrated(temp_engine)

        # Setup test sessionmaker
        TempSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=temp_engine)

        def override_get_db():
            db = TempSessionLocal()
            try:
                yield db
            finally:
                db.close()

        app.dependency_overrides[get_db] = override_get_db

        try:
            client = TestClient(app)

            # Test Health endpoint
            health_res = client.get("/health")
            assert health_res.status_code == 200
            assert health_res.json()["status"] == "ok"

            # 1. Signup
            signup_payload = {
                "email": "integration_user@example.com",
                "password": "SecurePassword123!",
                "display_name": "Integration Tester"
            }
            signup_res = client.post("/api/auth/signup", json=signup_payload)
            assert signup_res.status_code == 201, signup_res.text
            user_data = signup_res.json()
            assert user_data["email"] == "integration_user@example.com"
            assert user_data["display_name"] == "Integration Tester"
            assert "nihongo_session" in client.cookies

            # 2. Get /me with active session
            me_res = client.get("/api/auth/me")
            assert me_res.status_code == 200
            assert me_res.json()["id"] == user_data["id"]

            # 3. Logout (with CSRF header)
            csrf_token = client.cookies.get("nihongo_csrf")
            logout_res = client.post("/api/auth/logout", headers={"X-CSRF-Token": csrf_token} if csrf_token else {})
            assert logout_res.status_code == 200

            # 4. /me after logout returns 401
            me_logged_out = client.get("/api/auth/me")
            assert me_logged_out.status_code == 401

            # 5. Login
            login_payload = {
                "email": "integration_user@example.com",
                "password": "SecurePassword123!"
            }
            login_res = client.post("/api/auth/login", json=login_payload)
            assert login_res.status_code == 200
            assert login_res.json()["email"] == "integration_user@example.com"

        finally:
            app.dependency_overrides.pop(get_db, None)
