from datetime import datetime, timezone
from typing import List, Dict
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models import User, UserProgress, UserReviewCard, utc_now
from schemas import (
    SyncProgressRequest,
    SyncProgressResponse,
    UserProfileData,
    ReviewCardData,
)
from sync_logic import merge_progress, merge_cards, format_iso_datetime, parse_iso_datetime
from dependencies import get_current_user, verify_csrf

router = APIRouter(prefix="/api/sync", tags=["sync"])


def _db_progress_to_schema(db_prog: UserProgress) -> UserProfileData:
    return UserProfileData(
        dailyGoalMinutes=db_prog.daily_goal_minutes,
        streakDays=db_prog.streak_days,
        longestStreakDays=db_prog.longest_streak_days,
        completedLessons=db_prog.completed_lessons or [],
        completedKanaGroups=db_prog.completed_kana_groups or [],
        completedKanjiGroups=db_prog.completed_kanji_groups or [],
        completedVocabUnits=db_prog.completed_vocab_units or [],
        completedGrammarPoints=db_prog.completed_grammar_points or [],
        bookmarkedItems=db_prog.bookmarked_items or [],
        lastActiveDate=db_prog.last_active_date or "",
        onboarded=db_prog.onboarded,
        resetEpoch=db_prog.reset_epoch or 0,
        updatedAt=format_iso_datetime(db_prog.updated_at),
    )


def _db_card_to_schema(c: UserReviewCard) -> ReviewCardData:
    return ReviewCardData(
        id=c.card_id,
        source=c.source,  # type: ignore
        rawId=c.raw_id,
        repetitions=c.repetitions,
        easeFactor=c.ease_factor,
        intervalDays=c.interval_days,
        dueDate=c.due_date,
        lastReviewed=c.last_reviewed,
        updatedAt=format_iso_datetime(c.updated_at),
    )


@router.get("/progress", response_model=SyncProgressResponse)
def get_progress(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve the current user's learning progress profile and review cards."""
    now = utc_now()
    db_prog = db.query(UserProgress).filter(UserProgress.user_id == current_user.id).first()

    if not db_prog:
        db_prog = UserProgress(
            user_id=current_user.id,
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
            updated_at=now,
        )
        db.add(db_prog)
        db.commit()
        db.refresh(db_prog)

    cards_db = db.query(UserReviewCard).filter(UserReviewCard.user_id == current_user.id).all()
    cards_schema = [_db_card_to_schema(c) for c in cards_db]
    prog_schema = _db_progress_to_schema(db_prog)

    return SyncProgressResponse(
        status="ok",
        profile=prog_schema,
        cards=cards_schema,
        serverSyncedAt=format_iso_datetime(now),
    )


@router.post("/progress", response_model=SyncProgressResponse, dependencies=[Depends(verify_csrf)])
def sync_progress(
    payload: SyncProgressRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Bidirectionally sync and merge progress and review cards using deterministic conflict resolution:
    - Respects resetEpoch: Client resets increment the epoch; outdated client data is rejected.
    - Set-union for curriculum completions.
    - Last-Write-Wins for bookmarks and settings.
    - Streak from the record with the latest lastActiveDate.
    - Card-by-card latest updatedAt wins for SM-2 cards.
    """
    now = utc_now()
    db_prog = db.query(UserProgress).filter(UserProgress.user_id == current_user.id).first()

    if not db_prog:
        db_prog = UserProgress(
            user_id=current_user.id,
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
            updated_at=now,
        )
        db.add(db_prog)
        db.flush()

    server_prog_schema = _db_progress_to_schema(db_prog)
    merged_profile = merge_progress(payload.profile, server_prog_schema, now)

    # If client performed a reset (client_epoch > server_epoch), purge previous server cards
    if payload.profile.resetEpoch > db_prog.reset_epoch:
        db.query(UserReviewCard).filter(UserReviewCard.user_id == current_user.id).delete()
        server_cards_db = []
    else:
        server_cards_db = db.query(UserReviewCard).filter(UserReviewCard.user_id == current_user.id).all()

    server_cards_schema = [_db_card_to_schema(c) for c in server_cards_db]
    merged_cards = merge_cards(
        payload.cards,
        server_cards_schema,
        payload.profile.resetEpoch,
        db_prog.reset_epoch,
        now,
    )

    # Persist merged progress back to db
    db_prog.daily_goal_minutes = merged_profile.dailyGoalMinutes
    db_prog.streak_days = merged_profile.streakDays
    db_prog.longest_streak_days = merged_profile.longestStreakDays
    db_prog.completed_lessons = merged_profile.completedLessons
    db_prog.completed_kana_groups = merged_profile.completedKanaGroups
    db_prog.completed_kanji_groups = merged_profile.completedKanjiGroups
    db_prog.completed_vocab_units = merged_profile.completedVocabUnits
    db_prog.completed_grammar_points = merged_profile.completedGrammarPoints
    db_prog.bookmarked_items = merged_profile.bookmarkedItems
    db_prog.last_active_date = merged_profile.lastActiveDate
    db_prog.onboarded = merged_profile.onboarded
    db_prog.reset_epoch = max(db_prog.reset_epoch, payload.profile.resetEpoch)
    db_prog.updated_at = now

    # Persist merged cards back to db
    existing_cards_dict: Dict[str, UserReviewCard] = {
        c.card_id: c for c in db.query(UserReviewCard).filter(UserReviewCard.user_id == current_user.id).all()
    }

    for mc in merged_cards:
        card_dt = parse_iso_datetime(mc.updatedAt) or now
        if mc.id in existing_cards_dict:
            c_db = existing_cards_dict[mc.id]
            c_db.source = mc.source
            c_db.raw_id = mc.rawId
            c_db.repetitions = mc.repetitions
            c_db.ease_factor = mc.easeFactor
            c_db.interval_days = mc.intervalDays
            c_db.due_date = mc.dueDate
            c_db.last_reviewed = mc.lastReviewed
            c_db.updated_at = card_dt
        else:
            new_card = UserReviewCard(
                user_id=current_user.id,
                card_id=mc.id,
                source=mc.source,
                raw_id=mc.rawId,
                repetitions=mc.repetitions,
                ease_factor=mc.easeFactor,
                interval_days=mc.intervalDays,
                due_date=mc.dueDate,
                last_reviewed=mc.lastReviewed,
                updated_at=card_dt,
            )
            db.add(new_card)

    db.commit()

    return SyncProgressResponse(
        status="ok",
        profile=merged_profile,
        cards=merged_cards,
        serverSyncedAt=format_iso_datetime(now),
    )
