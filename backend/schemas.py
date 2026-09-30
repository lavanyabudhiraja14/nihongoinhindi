from datetime import datetime, timezone
from typing import List, Optional, Literal
from pydantic import BaseModel, Field, ConfigDict, field_validator
from security import validate_and_normalize_email, validate_password_strength


class UserCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    email: str
    password: str
    display_name: Optional[str] = Field(default="शिक्षार्थी", max_length=40)

    @field_validator("email")
    @classmethod
    def validate_email_address(cls, v: str) -> str:
        return validate_and_normalize_email(v)

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        validate_password_strength(v)
        return v

    @field_validator("display_name")
    @classmethod
    def validate_display_name(cls, v: Optional[str]) -> str:
        if not v or not v.strip():
            return "शिक्षार्थी"
        trimmed = v.strip()
        if len(trimmed) > 40:
            raise ValueError("नाम ४० अक्षरों से अधिक नहीं हो सकता।")
        return trimmed


class UserLogin(BaseModel):
    model_config = ConfigDict(extra="forbid")

    email: str
    password: str

    @field_validator("email")
    @classmethod
    def normalize_email_input(cls, v: str) -> str:
        return v.strip().lower()


class UserResponse(BaseModel):
    model_config = ConfigDict(extra="forbid", from_attributes=True)

    id: str
    email: str
    display_name: str
    is_verified: bool = False
    avatar_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class ForgotPasswordRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    email: str

    @field_validator("email")
    @classmethod
    def validate_email_address(cls, v: str) -> str:
        return validate_and_normalize_email(v)


class ResetPasswordRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    token: str = Field(..., min_length=1)
    new_password: str

    @field_validator("token")
    @classmethod
    def validate_token_format(cls, v: str) -> str:
        trimmed = v.strip()
        if not trimmed:
            raise ValueError("टोकन अमान्य या खाली है।")
        return trimmed

    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, v: str) -> str:
        validate_password_strength(v)
        return v


class VerifyEmailRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    token: str = Field(..., min_length=1)

    @field_validator("token")
    @classmethod
    def validate_token_format(cls, v: str) -> str:
        trimmed = v.strip()
        if not trimmed:
            raise ValueError("सत्यापन टोकन अमान्य या खाली है।")
        return trimmed


class ResendVerificationRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    email: Optional[str] = None

    @field_validator("email")
    @classmethod
    def validate_optional_email(cls, v: Optional[str]) -> Optional[str]:
        if v and v.strip():
            return validate_and_normalize_email(v)
        return None


class ProfileUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    display_name: str = Field(..., min_length=1, max_length=40)

    @field_validator("display_name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        trimmed = v.strip()
        if not trimmed:
            raise ValueError("नाम खाली नहीं हो सकता।")
        if len(trimmed) > 40:
            raise ValueError("नाम ४० अक्षरों से अधिक नहीं हो सकता।")
        return trimmed


class ChangeEmailRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    new_email: str
    current_password: str

    @field_validator("new_email")
    @classmethod
    def validate_new_email(cls, v: str) -> str:
        return validate_and_normalize_email(v)


class ChangePasswordRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    current_password: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, v: str) -> str:
        validate_password_strength(v)
        return v


class DeleteAccountRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    current_password: str


class ReviewCardData(BaseModel):
    model_config = ConfigDict(extra="forbid")

    id: str
    source: Literal["hiragana", "katakana", "loanword", "vocab", "kanji"]
    rawId: str
    repetitions: int = Field(default=0, ge=0)
    easeFactor: float = Field(default=2.5, ge=1.3)
    intervalDays: int = Field(default=0, ge=0)
    dueDate: str
    lastReviewed: Optional[str] = None
    updatedAt: Optional[str] = None


class UserProfileData(BaseModel):
    model_config = ConfigDict(extra="forbid")

    dailyGoalMinutes: int = Field(default=10, ge=1, le=120)
    streakDays: int = Field(default=1, ge=1)
    longestStreakDays: int = Field(default=1, ge=1)
    completedLessons: List[str] = Field(default_factory=list)
    completedKanaGroups: List[str] = Field(default_factory=list)
    completedKanjiGroups: Optional[List[str]] = Field(default_factory=list)
    completedVocabUnits: List[str] = Field(default_factory=list)
    completedGrammarPoints: List[str] = Field(default_factory=list)
    bookmarkedItems: List[str] = Field(default_factory=list)
    lastActiveDate: str = ""
    onboarded: bool = False
    resetEpoch: int = Field(default=0, ge=0)
    updatedAt: Optional[str] = None


class SyncProgressRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    profile: UserProfileData
    cards: List[ReviewCardData] = Field(default_factory=list)


class SyncProgressResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")

    status: str = "ok"
    profile: UserProfileData
    cards: List[ReviewCardData]
    serverSyncedAt: str
