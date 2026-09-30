import os
from pathlib import Path
from typing import Generator
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import declarative_base, sessionmaker, Session
from dotenv import load_dotenv

load_dotenv()

from config import settings, BACKEND_DIR

DATABASE_URL = settings.DATABASE_URL

connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

Base = declarative_base()


def check_db_migrated(target_engine=None) -> None:
    """
    Verify all required tables exist and alembic_version matches head revision.
    Raises RuntimeError if unmigrated. Does NOT create tables.
    """
    eng = target_engine or engine
    inspector = inspect(eng)
    tables = set(inspector.get_table_names())
    required_tables = {
        "users",
        "user_avatars",
        "user_progress",
        "user_review_cards",
        "user_sessions",
        "email_verification_tokens",
        "password_reset_tokens",
        "alembic_version",
    }
    missing = required_tables - tables
    if missing:
        raise RuntimeError(
            "Database is not migrated. Run: alembic upgrade head (from the backend folder)"
        )

    # Check migration version matches head
    from alembic.config import Config
    from alembic.script import ScriptDirectory

    alembic_ini_path = BACKEND_DIR / "alembic.ini"
    if alembic_ini_path.exists():
        cfg = Config(str(alembic_ini_path))
        cfg.set_main_option("script_location", str(BACKEND_DIR / "alembic"))
        script_dir = ScriptDirectory.from_config(cfg)
        heads = set(script_dir.get_heads())

        with eng.connect() as conn:
            result = conn.execute(text("SELECT version_num FROM alembic_version")).fetchall()
            db_revisions = {row[0] for row in result}

        if not heads.issubset(db_revisions):
            raise RuntimeError(
                "Database is not migrated. Run: alembic upgrade head (from the backend folder)"
            )


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency to provide a transactional database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
