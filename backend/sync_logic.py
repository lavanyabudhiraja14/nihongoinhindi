from datetime import datetime, timezone, timedelta
from typing import List, Dict, Tuple, Optional
from schemas import UserProfileData, ReviewCardData


def parse_iso_datetime(dt_str: Optional[str]) -> Optional[datetime]:
    if not dt_str:
        return None
    try:
        # Normalize trailing Z to UTC
        cleaned = dt_str.replace("Z", "+00:00")
        dt = datetime.fromisoformat(cleaned)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt
    except Exception:
        return None


def format_iso_datetime(dt: datetime) -> str:
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.isoformat()


def clamp_updated_at(dt_str: Optional[str], now: datetime) -> datetime:
    """Validate client updatedAt timestamp, clamping it if it exceeds server now by > 60s (clock skew)."""
    parsed = parse_iso_datetime(dt_str)
    if not parsed:
        return now
    # Clamp future dates beyond 60s
    if parsed > now + timedelta(seconds=60):
        return now
    return parsed


def merge_progress(
    client_p: UserProfileData,
    server_p: UserProfileData,
    now: datetime,
) -> UserProfileData:
    """
    Merge client and server progress according to the deterministic merge specification:
    1. Reset Epoch:
       - client < server: client is outdated, server wins completely.
       - client > server: client performed a local reset, client wins completely.
    2. Same Epoch:
       - Completions (lessons, kana, kanji, vocab, grammar): Set Union.
       - Bookmarks: LWW (Latest timestamp wins so un-bookmarking is preserved).
       - Settings (goal, onboarded): LWW based on updatedAt.
       - Streak: Record with the newer lastActiveDate wins. If same date, max(streak).
       - Longest streak: max(client.longest, server.longest, current_streak).
    """
    # 1. Reset epoch check
    if client_p.resetEpoch < server_p.resetEpoch:
        return server_p.model_copy()

    if client_p.resetEpoch > server_p.resetEpoch:
        clamped_time = clamp_updated_at(client_p.updatedAt, now)
        updated = client_p.model_copy()
        updated.updatedAt = format_iso_datetime(clamped_time)
        return updated

    # 2. Same epoch merge
    client_dt = clamp_updated_at(client_p.updatedAt, now)
    server_dt = parse_iso_datetime(server_p.updatedAt) or (now - timedelta(days=365))

    client_is_newer = client_dt >= server_dt

    # Set union for completions
    def union_lists(l1: List[str], l2: Optional[List[str]]) -> List[str]:
        s = set(l1)
        if l2:
            s.update(l2)
        return sorted(list(s))

    merged_lessons = union_lists(client_p.completedLessons, server_p.completedLessons)
    merged_kana = union_lists(client_p.completedKanaGroups, server_p.completedKanaGroups)
    merged_kanji = union_lists(client_p.completedKanjiGroups or [], server_p.completedKanjiGroups or [])
    merged_vocab = union_lists(client_p.completedVocabUnits, server_p.completedVocabUnits)
    merged_grammar = union_lists(client_p.completedGrammarPoints, server_p.completedGrammarPoints)

    # Bookmarks: LWW to respect un-bookmarking
    merged_bookmarks = client_p.bookmarkedItems if client_is_newer else server_p.bookmarkedItems

    # Scalar settings: LWW
    merged_goal = client_p.dailyGoalMinutes if client_is_newer else server_p.dailyGoalMinutes
    merged_onboarded = client_p.onboarded or server_p.onboarded

    # Streaks: record with later lastActiveDate provides streakDays and lastActiveDate
    client_active = client_p.lastActiveDate or ""
    server_active = server_p.lastActiveDate or ""

    if client_active > server_active:
        active_date = client_active
        streak = client_p.streakDays
    elif server_active > client_active:
        active_date = server_active
        streak = server_p.streakDays
    else:
        active_date = client_active or server_active
        streak = max(client_p.streakDays, server_p.streakDays)

    longest_streak = max(
        client_p.longestStreakDays,
        server_p.longestStreakDays,
        streak,
    )

    return UserProfileData(
        dailyGoalMinutes=merged_goal,
        streakDays=max(1, streak),
        longestStreakDays=max(1, longest_streak),
        completedLessons=merged_lessons,
        completedKanaGroups=merged_kana,
        completedKanjiGroups=merged_kanji,
        completedVocabUnits=merged_vocab,
        completedGrammarPoints=merged_grammar,
        bookmarkedItems=merged_bookmarks,
        lastActiveDate=active_date,
        onboarded=merged_onboarded,
        resetEpoch=server_p.resetEpoch,
        updatedAt=format_iso_datetime(now),
    )


def merge_cards(
    client_cards: List[ReviewCardData],
    server_cards: List[ReviewCardData],
    client_epoch: int,
    server_epoch: int,
    now: datetime,
) -> List[ReviewCardData]:
    """
    Merge client cards and server cards based on updated_at timestamps:
    - If client_epoch < server_epoch: Discard client cards, return server cards.
    - If client_epoch > server_epoch: Discard server cards, return client cards.
    - If same epoch: For cards in both sets, the card with the more recent updatedAt wins.
    """
    if client_epoch < server_epoch:
        return [c.model_copy() for c in server_cards]

    if client_epoch > server_epoch:
        result = []
        for c in client_cards:
            clamped = clamp_updated_at(c.updatedAt, now)
            copy_c = c.model_copy()
            copy_c.updatedAt = format_iso_datetime(clamped)
            result.append(copy_c)
        return result

    # Same epoch merge by card ID
    server_map: Dict[str, ReviewCardData] = {c.id: c for c in server_cards}
    client_map: Dict[str, ReviewCardData] = {c.id: c for c in client_cards}

    all_ids = set(server_map.keys()).union(set(client_map.keys()))
    merged: List[ReviewCardData] = []

    for cid in all_ids:
        c_client = client_map.get(cid)
        c_server = server_map.get(cid)

        if c_client and not c_server:
            clamped = clamp_updated_at(c_client.updatedAt, now)
            copy_c = c_client.model_copy()
            copy_c.updatedAt = format_iso_datetime(clamped)
            merged.append(copy_c)
        elif c_server and not c_client:
            merged.append(c_server.model_copy())
        elif c_client and c_server:
            # Conflict: compare timestamps
            c_dt = clamp_updated_at(c_client.updatedAt, now)
            s_dt = parse_iso_datetime(c_server.updatedAt) or (now - timedelta(days=365))

            if c_dt >= s_dt:
                copy_c = c_client.model_copy()
                copy_c.updatedAt = format_iso_datetime(c_dt)
                merged.append(copy_c)
            else:
                merged.append(c_server.model_copy())

    # Sort deterministically by id
    merged.sort(key=lambda x: x.id)
    return merged
