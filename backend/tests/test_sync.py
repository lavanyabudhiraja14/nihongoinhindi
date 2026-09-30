import pytest
from datetime import datetime, timezone, timedelta
from fastapi.testclient import TestClient

from main import app
from sync_logic import merge_progress, merge_cards, format_iso_datetime
from schemas import UserProfileData, ReviewCardData


def test_user_data_isolation():
    client_a = TestClient(app)
    client_b = TestClient(app)

    # Sign up User A
    res_a = client_a.post("/api/auth/signup", json={
        "email": "user_a@example.com",
        "password": "PasswordA123!",
        "display_name": "उपयोगकर्ता ए",
    })
    assert res_a.status_code == 201
    csrf_a = res_a.cookies.get("nihongo_csrf")

    # Sign up User B
    res_b = client_b.post("/api/auth/signup", json={
        "email": "user_b@example.com",
        "password": "PasswordB123!",
        "display_name": "उपयोगकर्ता बी",
    })
    assert res_b.status_code == 201

    # User A pushes progress with CSRF header
    payload_a = {
        "profile": {
            "dailyGoalMinutes": 20,
            "streakDays": 5,
            "longestStreakDays": 10,
            "completedLessons": ["u1-l1", "u1-l2"],
            "completedKanaGroups": ["h-a"],
            "completedKanjiGroups": ["k-group-1"],
            "completedVocabUnits": ["v-unit-1"],
            "completedGrammarPoints": ["g-wa-desu"],
            "bookmarkedItems": ["b-1"],
            "lastActiveDate": "2026-09-30",
            "onboarded": True,
            "resetEpoch": 0,
        },
        "cards": [
            {
                "id": "hiragana:h-a",
                "source": "hiragana",
                "rawId": "h-a",
                "repetitions": 3,
                "easeFactor": 2.5,
                "intervalDays": 6,
                "dueDate": "2026-10-06",
            }
        ],
    }
    sync_res_a = client_a.post("/api/sync/progress", json=payload_a, headers={"X-CSRF-Token": csrf_a})
    assert sync_res_a.status_code == 200

    # User B gets progress -> must NOT see User A's data!
    get_res_b = client_b.get("/api/sync/progress")
    assert get_res_b.status_code == 200
    b_data = get_res_b.json()
    assert b_data["profile"]["completedLessons"] == []
    assert len(b_data["cards"]) == 0


def test_endpoint_sync_reset_epoch_client_newer():
    client = TestClient(app)
    # 1. Sign up user
    signup_res = client.post("/api/auth/signup", json={
        "email": "reset_user@example.com",
        "password": "Password123!",
    })
    csrf = signup_res.cookies.get("nihongo_csrf")

    # 2. Push initial progress (epoch 0) with lessons and cards
    client.post(
        "/api/sync/progress",
        json={
            "profile": {
                "dailyGoalMinutes": 10,
                "streakDays": 5,
                "longestStreakDays": 5,
                "completedLessons": ["u1-l1", "u1-l2"],
                "completedKanaGroups": ["h-a"],
                "completedVocabUnits": ["v-1"],
                "completedGrammarPoints": ["g-1"],
                "bookmarkedItems": ["b-1"],
                "lastActiveDate": "2026-09-28",
                "onboarded": True,
                "resetEpoch": 0,
            },
            "cards": [
                {
                    "id": "hiragana:h-a",
                    "source": "hiragana",
                    "rawId": "h-a",
                    "repetitions": 4,
                    "easeFactor": 2.5,
                    "intervalDays": 10,
                    "dueDate": "2026-10-08",
                }
            ],
        },
        headers={"X-CSRF-Token": csrf},
    )

    # 3. User performs a RESET on client: epoch increments to 1, completions reset to empty
    reset_payload = {
        "profile": {
            "dailyGoalMinutes": 10,
            "streakDays": 1,
            "longestStreakDays": 1,
            "completedLessons": [],
            "completedKanaGroups": [],
            "completedVocabUnits": [],
            "completedGrammarPoints": [],
            "bookmarkedItems": [],
            "lastActiveDate": "2026-09-30",
            "onboarded": False,
            "resetEpoch": 1,
        },
        "cards": [],
    }
    res = client.post("/api/sync/progress", json=reset_payload, headers={"X-CSRF-Token": csrf})
    assert res.status_code == 200
    data = res.json()
    # Verified: server epoch is 1, and old completions and cards are wiped
    assert data["profile"]["resetEpoch"] == 1
    assert data["profile"]["completedLessons"] == []
    assert len(data["cards"]) == 0


def test_merge_progress_same_epoch_union_and_lww():
    now = datetime(2026, 9, 30, 12, 0, 0, tzinfo=timezone.utc)
    t1 = format_iso_datetime(now - timedelta(hours=2))
    t2 = format_iso_datetime(now - timedelta(hours=1))

    # Server state: has lesson 1 and bookmarks [b1, b2] at t1
    server_p = UserProfileData(
        dailyGoalMinutes=10,
        streakDays=3,
        longestStreakDays=7,
        completedLessons=["u1-l1"],
        completedKanaGroups=["h-a"],
        completedKanjiGroups=[],
        completedVocabUnits=["v-1"],
        completedGrammarPoints=[],
        bookmarkedItems=["b1", "b2"],
        lastActiveDate="2026-09-28",
        onboarded=True,
        resetEpoch=0,
        updatedAt=t1,
    )

    # Client state: has lesson 2 and UN-BOOKMARKED b1 (so bookmarks are [b2, b3]) at t2 (newer)
    client_p = UserProfileData(
        dailyGoalMinutes=15,
        streakDays=4,
        longestStreakDays=8,
        completedLessons=["u1-l2"],
        completedKanaGroups=["h-ka"],
        completedKanjiGroups=["kanji-1"],
        completedVocabUnits=["v-2"],
        completedGrammarPoints=["g-1"],
        bookmarkedItems=["b2", "b3"],  # b1 was removed
        lastActiveDate="2026-09-29",
        onboarded=True,
        resetEpoch=0,
        updatedAt=t2,
    )

    merged = merge_progress(client_p, server_p, now)

    # 1. Completions are unioned
    assert sorted(merged.completedLessons) == ["u1-l1", "u1-l2"]
    assert sorted(merged.completedKanaGroups) == ["h-a", "h-ka"]
    assert merged.completedKanjiGroups == ["kanji-1"]
    assert sorted(merged.completedVocabUnits) == ["v-1", "v-2"]
    assert merged.completedGrammarPoints == ["g-1"]

    # 2. Bookmarking (un-bookmarking) respected via LWW (client was newer)
    assert merged.bookmarkedItems == ["b2", "b3"]
    assert "b1" not in merged.bookmarkedItems

    # 3. Settings: dailyGoalMinutes from newer client
    assert merged.dailyGoalMinutes == 15

    # 4. Streak: client has later lastActiveDate (2026-09-29 > 2026-09-28)
    assert merged.lastActiveDate == "2026-09-29"
    assert merged.streakDays == 4
    assert merged.longestStreakDays == 8


def test_merge_progress_reset_epoch_handling():
    now = datetime(2026, 9, 30, 12, 0, 0, tzinfo=timezone.utc)

    # Server has epoch 1 (server was reset)
    server_p = UserProfileData(
        dailyGoalMinutes=10,
        streakDays=1,
        longestStreakDays=1,
        completedLessons=[],
        resetEpoch=1,
        updatedAt=format_iso_datetime(now),
    )

    # Stale client still sends epoch 0 with old completed lessons
    stale_client_p = UserProfileData(
        dailyGoalMinutes=15,
        streakDays=10,
        longestStreakDays=20,
        completedLessons=["u1-l1", "u1-l2", "u1-l3"],
        resetEpoch=0,
        updatedAt=format_iso_datetime(now),
    )

    merged = merge_progress(stale_client_p, server_p, now)
    # Stale client data must be completely discarded
    assert merged.resetEpoch == 1
    assert merged.completedLessons == []
    assert merged.streakDays == 1


def test_merge_cards_conflict_resolution_and_clamp():
    now = datetime(2026, 9, 30, 12, 0, 0, tzinfo=timezone.utc)
    t_old = format_iso_datetime(now - timedelta(hours=5))
    t_new = format_iso_datetime(now - timedelta(minutes=10))

    # Server card: reviewed 5 hours ago (interval=3)
    server_cards = [
        ReviewCardData(
            id="vocab:v-taberu",
            source="vocab",
            rawId="v-taberu",
            repetitions=2,
            easeFactor=2.5,
            intervalDays=3,
            dueDate="2026-10-03",
            lastReviewed="2026-09-30",
            updatedAt=t_old,
        ),
        ReviewCardData(
            id="hiragana:h-a",
            source="hiragana",
            rawId="h-a",
            repetitions=5,
            easeFactor=2.6,
            intervalDays=12,
            dueDate="2026-10-12",
            updatedAt=t_old,
        ),
    ]

    # Client card: reviewed 10 minutes ago (interval=6, ease=2.6)
    client_cards = [
        ReviewCardData(
            id="vocab:v-taberu",
            source="vocab",
            rawId="v-taberu",
            repetitions=3,
            easeFactor=2.6,
            intervalDays=6,
            dueDate="2026-10-06",
            lastReviewed="2026-09-30",
            updatedAt=t_new,
        ),
        ReviewCardData(
            id="kanji:k-ichi",
            source="kanji",
            rawId="k-ichi",
            repetitions=1,
            easeFactor=2.5,
            intervalDays=1,
            dueDate="2026-10-01",
            updatedAt=t_new,
        ),
    ]

    merged = merge_cards(client_cards, server_cards, client_epoch=0, server_epoch=0, now=now)
    merged_dict = {c.id: c for c in merged}

    # All 3 cards present
    assert len(merged) == 3
    # v-taberu: client card was newer, so client card wins
    assert merged_dict["vocab:v-taberu"].intervalDays == 6
    assert merged_dict["vocab:v-taberu"].repetitions == 3
    # h-a: from server
    assert merged_dict["hiragana:h-a"].repetitions == 5
    # k-ichi: from client
    assert merged_dict["kanji:k-ichi"].intervalDays == 1
