import uuid
from typing import Optional
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Integer,
    Float,
    Boolean,
    DateTime,
    ForeignKey,
    LargeBinary,
    JSON,
    Index,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
from database import Base


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def ensure_utc(dt: datetime) -> datetime:
    if dt is None:
        return dt
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def generate_uuid() -> str:
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    display_name = Column(String(40), nullable=False, default="शिक्षार्थी")
    is_verified = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    # Relationships
    progress = relationship("UserProgress", back_populates="user", uselist=False, cascade="all, delete-orphan")
    review_cards = relationship("UserReviewCard", back_populates="user", cascade="all, delete-orphan")
    sessions = relationship("UserSession", back_populates="user", cascade="all, delete-orphan")
    avatar = relationship("UserAvatar", back_populates="user", uselist=False, cascade="all, delete-orphan")
    email_verification_tokens = relationship("EmailVerificationToken", back_populates="user", cascade="all, delete-orphan")
    password_reset_tokens = relationship("PasswordResetToken", back_populates="user", cascade="all, delete-orphan")

    @property
    def avatar_url(self) -> Optional[str]:
        if self.avatar and getattr(self.avatar, "updated_at", None):
            ts = int(ensure_utc(self.avatar.updated_at).timestamp())
            return f"/api/auth/avatar/{self.id}?v={ts}"
        return None


class UserAvatar(Base):
    __tablename__ = "user_avatars"

    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    image_bytes = Column(LargeBinary, nullable=False)
    content_type = Column(String(32), default="image/webp", nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    user = relationship("User", back_populates="avatar")


class UserProgress(Base):
    __tablename__ = "user_progress"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True, nullable=False)
    daily_goal_minutes = Column(Integer, default=10, nullable=False)
    streak_days = Column(Integer, default=1, nullable=False)
    longest_streak_days = Column(Integer, default=1, nullable=False)
    completed_lessons = Column(JSON, default=list, nullable=False)
    completed_kana_groups = Column(JSON, default=list, nullable=False)
    completed_kanji_groups = Column(JSON, default=list, nullable=False)
    completed_vocab_units = Column(JSON, default=list, nullable=False)
    completed_grammar_points = Column(JSON, default=list, nullable=False)
    bookmarked_items = Column(JSON, default=list, nullable=False)
    last_active_date = Column(String(10), default="", nullable=False)
    onboarded = Column(Boolean, default=False, nullable=False)
    reset_epoch = Column(Integer, default=0, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    user = relationship("User", back_populates="progress")


class UserReviewCard(Base):
    __tablename__ = "user_review_cards"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    card_id = Column(String(100), index=True, nullable=False)
    source = Column(String(20), nullable=False)
    raw_id = Column(String(80), nullable=False)
    repetitions = Column(Integer, default=0, nullable=False)
    ease_factor = Column(Float, default=2.5, nullable=False)
    interval_days = Column(Integer, default=0, nullable=False)
    due_date = Column(String(10), nullable=False)
    last_reviewed = Column(String(10), nullable=True)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    user = relationship("User", back_populates="review_cards")

    __table_args__ = (
        UniqueConstraint("user_id", "card_id", name="uq_user_card"),
        Index("ix_user_cards_due", "user_id", "due_date"),
    )


class UserSession(Base):
    __tablename__ = "user_sessions"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    token_hash = Column(String(64), unique=True, index=True, nullable=False)
    expires_at = Column(DateTime(timezone=True), index=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    revoked = Column(Boolean, default=False, nullable=False)

    user = relationship("User", back_populates="sessions")


class EmailVerificationToken(Base):
    __tablename__ = "email_verification_tokens"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    token_hash = Column(String(64), unique=True, index=True, nullable=False)
    expires_at = Column(DateTime(timezone=True), index=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    used = Column(Boolean, default=False, nullable=False)

    user = relationship("User", back_populates="email_verification_tokens")


class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    token_hash = Column(String(64), unique=True, index=True, nullable=False)
    expires_at = Column(DateTime(timezone=True), index=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    used = Column(Boolean, default=False, nullable=False)

    user = relationship("User", back_populates="password_reset_tokens")
