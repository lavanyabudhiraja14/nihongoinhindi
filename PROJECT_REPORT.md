# Project Report: Nihongo Seekho (हिंदी में जापानी सीखें)

**Date**: September 30, 2026  
**Repository Location**: `/Users/lavanyabudhiraja/Desktop/nihongo to hindi`  
**Report Type**: Comprehensive Verification & Audit Report  

---

## Executive Summary

> **Executive Summary (10 Lines)**  
> Nihongo Seekho is a full-stack, Hindi-medium Japanese (JLPT N5) learning application featuring a Next.js 16 frontend and FastAPI Python backend with SQLite database persistence. The core curriculum contains 20 units (200 words), 50 kanji, 25 grammar points, full Hiragana/Katakana charts, an SM-2 spaced repetition review deck, and an AI Sensei tutor powered by Groq LLMs. User accounts, Argon2id security, CSRF protection, avatar uploads, and two-way progress syncing with conflict resolution are fully implemented and verified. Phase 1 UI restyling (vibrant glassmorphism, bright blue `#2563EB` color system, widened 280px sidebar, and compact dashboard cards) is complete with zero build/lint errors. All 36 backend tests and 87 frontend tests pass cleanly with 100% test suite success. Phase 2 wide-screen modal layouts remain the primary pending presentation task.

---

## 1. Overview & System Architecture

### Tech Stack & Versions
* **Frontend**: Next.js `16.3.6` (React `19.2.8`), TypeScript `5`, Tailwind CSS `v4`, Lucide React `1.49.0`, Vitest `4.1.11`.
* **Backend**: Python `3.12.5`, FastAPI `>=0.110.0`, Uvicorn `>=0.28.0`, SQLAlchemy `>=2.0.0`, Alembic `>=1.13.0`, Argon2-cffi `>=23.1.0`, Pillow `>=10.2.0`, Pytest `9.1.1`.
* **Database**: SQLite3 (`nihongo.db`), managed via Alembic migrations.
* **LLM Engine**: Groq SDK (`groq>=0.18.0`), model `openai/gpt-oss-120b`.

### Repository Structure
```
nihongo to hindi/
├── backend/
│   ├── alembic/              # Alembic migration environment and versions
│   │   ├── versions/         # Migration scripts (bc6582643b9c_create_user_and_sync_tables.py)
│   │   └── env.py            # Migration runtime configuration
│   ├── routers/              # FastAPI routers
│   │   ├── auth.py           # Authentication, profile, security & avatar endpoints
│   │   └── sync.py           # Progress and review cards synchronization
│   ├── tests/                # Pytest test suite (36 tests)
│   ├── database.py           # SQLAlchemy engine & startup migration verifier
│   ├── dependencies.py       # Auth context, CSRF validator, client IP resolver
│   ├── main.py               # FastAPI app lifespan, global error handler, AI tutor
│   ├── models.py             # SQLAlchemy models (User, Progress, Cards, Sessions, Avatars)
│   ├── schemas.py            # Pydantic request/response schemas
│   ├── security.py           # Argon2id password hashing, CSRF & rate limiters
│   ├── sync_logic.py         # Merging rules, reset_epoch, LWW card reconciliation
│   └── requirements.txt      # Python dependencies
├── frontend/
│   ├── app/                  # Next.js App Router pages
│   │   ├── account/          # Account management & data export
│   │   ├── learn/            # Curriculum hub (7 sub-tabs)
│   │   ├── login/            # Log in page with localized error handling
│   │   ├── progress/         # Statistics, daily goals, progress reset
│   │   ├── review/           # SM-2 Flashcard review system
│   │   ├── signup/           # Registration with validation
│   │   ├── tutor/            # AI Sensei interactive chat
│   │   ├── globals.css       # Design tokens & glass classes (.glass-blue, etc.)
│   │   └── page.tsx          # Home Dashboard
│   ├── components/           # Reusable UI & modal components
│   ├── content/              # JLPT N5 curriculum JSON databases
│   ├── context/              # React AuthContext provider
│   ├── lib/                  # SM-2 algorithms, API clients, sync engine, storage
│   ├── tests/                # Vitest test suite (87 tests)
│   └── package.json          # Node dependencies & scripts
├── CONTENT_INVENTORY.md      # Detailed curriculum & component audit
├── DESIGN_SPEC.md            # Visual specifications & design tokens
├── RUNNING.md                # Local setup, run commands & troubleshooting guide
└── PROJECT_REPORT.md         # This verification report
```

---

## 2. Feature Status Table

| Feature Category | Feature Description | Status | Evidence (File Paths) | Notes / Details |
|---|---|---|---|---|
| **Curriculum Content** | 20 Units, 200 Vocab words | **DONE** | `frontend/content/vocab.json`, `frontend/content/units.json` | 20 units $\times$ 10 words with Hindi/Romaji/Kanji and bilingual examples. |
| **Curriculum Content** | 50 N5 Kanji in 5 Groups | **DONE** | `frontend/content/kanji.json` | Onyomi, Kunyomi, Hindi/English meanings, mnemonics, linked vocab. |
| **Curriculum Content** | 25 JLPT N5 Grammar Points | **DONE** | `frontend/content/grammar.json` | Formulas, Hindi grammar comparisons, 3 examples each, common mistakes. |
| **Curriculum Content** | 107 Hiragana & 107 Katakana | **DONE** | `frontend/content/hiragana.json`, `frontend/content/katakana.json` | Basic, dakuten, handakuten, yoon, and special characters with mnemonics. |
| **Curriculum Content** | 20 Katakana Loanwords | **DONE** | `frontend/content/loanwords.json` | English loanwords with pronunciation and origin notes. |
| **Learning Engine** | SM-2 Flashcard Review System | **DONE** | `frontend/lib/sm2.ts`, `frontend/app/review/page.tsx` | SuperMemo-2 algorithm with interval, ease factor, due queue calculation. |
| **Learning Engine** | Dynamic Quiz Generator | **DONE** | `frontend/lib/quiz.ts`, `frontend/components/Quiz.tsx` | Multiple-choice generator with 4 unique distractors and score tracking. |
| **Learning Engine** | AI Sensei Tutor (Groq LLM) | **DONE** | `backend/main.py`, `frontend/app/tutor/page.tsx`, `frontend/lib/tutor.ts` | Contextual system prompt with learned kana/vocab/grammar injection. |
| **Accounts & Auth** | User Signup & Login | **DONE** | `backend/routers/auth.py`, `frontend/app/login/page.tsx`, `frontend/app/signup/page.tsx` | Argon2id hashing, secure httpOnly cookies, rate limiting per IP/email. |
| **Accounts & Auth** | Double-Submit CSRF Protection | **DONE** | `backend/dependencies.py`, `frontend/lib/api.ts` | Signed readable CSRF cookie paired with required `X-CSRF-Token` header. |
| **Accounts & Auth** | Profile & Avatar Management | **DONE** | `backend/routers/auth.py`, `frontend/app/account/page.tsx` | 256x256 WebP image compression stored in DB with ETag caching. |
| **Accounts & Auth** | Account Security Actions | **DONE** | `backend/routers/auth.py`, `frontend/app/account/page.tsx` | Email change, password change (revoking other sessions), delete account. |
| **Sync Engine** | Two-Way State & Card Sync | **DONE** | `backend/routers/sync.py`, `backend/sync_logic.py`, `frontend/lib/sync.ts` | Union of completions, latest-updated-at card reconciliation, reset epoch. |
| **Sync Engine** | Guest-to-Account Merge Dialog | **DONE** | `frontend/components/AuthModals.tsx`, `frontend/context/AuthContext.tsx` | Prompts user on login with guest data; includes JSON backup download. |
| **UI System (Phase 1)** | Bright Blue `#2563EB` System | **DONE** | `frontend/app/globals.css`, `frontend/app/page.tsx` | Replaced dark navy borders with `#2563EB` and vibrant gradient glass fills. |
| **UI System (Phase 1)** | Category Color Glass Tokens | **DONE** | `frontend/app/globals.css` | Hiragana red, Katakana saffron, Vocab green, Kanji blue, Grammar purple, Tutor teal. |
| **UI System (Phase 1)** | 280px Sidebar & Lucide Chips | **DONE** | `frontend/components/AppShell.tsx` | Category-colored icon chips, transparent borders, saffron active indicator. |
| **UI System (Phase 1)** | 3 Compact Home Cards | **DONE** | `frontend/app/page.tsx` | Equal-height (~150px) Review, Weekday Streak, and Combined Progress Ring. |
| **UI System (Phase 1)** | Emoji Purge in Favor of Lucide | **DONE** | `frontend/app/page.tsx`, `frontend/components/AppShell.tsx` | Replaced all UI emoji with Lucide vector icons. |
| **UI System (Phase 2)** | Wide Desktop Modal Layouts | **PARTIAL** | `frontend/components/VocabUnitView.tsx`, `frontend/components/KanaDetailModal.tsx` | Scheduled for Phase 2 implementation following user review of Phase 1. |
| **UI System (Phase 2)** | Remaining Pages Restyling | **PARTIAL** | `frontend/app/learn/page.tsx`, `frontend/app/review/page.tsx` | Functional with tokens, full wide-card multi-column desktop layout pending Phase 2. |
| **System Stability** | Database Startup Verifier | **DONE** | `backend/database.py`, `backend/main.py` | Fails fast if SQLite DB is unmigrated or not at Alembic head revision. |
| **System Stability** | Global JSON Error Handling | **DONE** | `backend/main.py`, `frontend/lib/error-handler.ts` | Structured 500 JSON response on backend; Hindi localized errors in frontend. |

---

## 3. Pages and Routes Audit

| Route | Page File | Purpose & Displayed Content | Design System Status |
|---|---|---|---|
| `/` | `app/page.tsx` | **Dashboard**: 3 equal-height top cards (Review with real due count, Weekday streak सोम...रवि, Real 60-item course progress ring), Next Lesson recommendation, 6 category practice tiles. | **Fully Updated (Phase 1 Glass System)** |
| `/learn` | `app/learn/page.tsx` | **Curriculum Hub**: 7 sub-tabs for Units, Vocabulary, Kanji, Grammar, Hiragana, Katakana, and Loanwords. | **Functional / Standard Shell (Phase 2 polish queued)** |
| `/review` | `app/review/page.tsx` | **SM-2 Flashcard Deck**: Interactive card flip, audio TTS, 4-button rating system (`0`, `3`, `4`, `5`), session review counters. | **Functional / Standard Shell (Phase 2 polish queued)** |
| `/progress` | `app/progress/page.tsx` | **Statistics & Settings**: Streak counts, honest 60-item breakdown, daily study target controls, progress reset confirmation modal. | **Updated with Honest 60-item progress stats** |
| `/tutor` | `app/tutor/page.tsx` | **AI Sensei Chat**: Chat window with LLM backend, speech playback, learned context status indicator, latency checker. | **Functional / Standard Shell (Phase 2 polish queued)** |
| `/login` | `app/login/page.tsx` | **User Login**: Email & password form, password visibility toggle, categorized Hindi error alerts (`error-handler.ts`). | **Updated with Specific Hindi Error Alerts** |
| `/signup` | `app/signup/page.tsx` | **User Registration**: Display name, email, password strength checks, localized error alerts. | **Updated with Specific Hindi Error Alerts** |
| `/account` | `app/account/page.tsx` | **Account & Security**: Display name editor, avatar upload, email/password modification, data backup export, account deletion. | **Updated with Error Handlers & Session Revocation** |

---

## 4. Backend Architecture & Security Controls

### Endpoints Inventory

| Method | Endpoint | Auth Required? | CSRF Required? | Rate Limited? | Purpose / Function |
|---|---|---|---|---|---|
| `GET` | `/health` | No | No | No | Safe health check reporting database migration status. |
| `POST` | `/api/tutor` | No | No | Yes (IP daily limit) | AI Japanese tutor chat completion via Groq. |
| `POST` | `/api/auth/signup` | No | No | Yes (IP limit) | Registers new user; returns `201` and sets session & CSRF cookies. |
| `POST` | `/api/auth/login` | No | No | Yes (IP & Email) | Authenticates credentials; sets session & CSRF cookies. |
| `POST` | `/api/auth/logout` | **Yes** | **Yes** | No | Revokes active session token in DB and clears cookies. |
| `GET` | `/api/auth/me` | **Yes** | No | No | Returns authenticated user profile and slides session expiry. |
| `PATCH` | `/api/auth/profile` | **Yes** | **Yes** | No | Updates user display name. |
| `POST` | `/api/auth/avatar` | **Yes** | **Yes** | No | Uploads, validates (2MB / 4096px), resizes to 256x256 WebP in DB. |
| `GET` | `/api/auth/avatar/{user_id}` | No | No | No | Serves WebP avatar bytes with `ETag` and `Cache-Control`. |
| `DELETE` | `/api/auth/avatar` | **Yes** | **Yes** | No | Deletes user avatar from database. |
| `POST` | `/api/auth/change-email` | **Yes** | **Yes** | No | Validates current password and updates account email. |
| `POST` | `/api/auth/change-password` | **Yes** | **Yes** | No | Validates current password and revokes all other sessions. |
| `POST` | `/api/auth/delete-account` | **Yes** | **Yes** | No | Validates password and cascades deletion of user data. |
| `GET` | `/api/sync/progress` | **Yes** | No | No | Fetches latest remote progress and review cards. |
| `POST` | `/api/sync/progress` | **Yes** | **Yes** | No | Merges progress & cards using reset_epoch and LWW conflict logic. |

### Database Tables Schema (`models.py`)

1. **`users`**:
   * `id` (String(36), PK): UUID4.
   * `email` (String(255), Unique, Indexed): Lowercase normalized email.
   * `password_hash` (String(255)): Argon2id hash.
   * `display_name` (String(40)): User's name.
   * `created_at`, `updated_at` (DateTime with UTC timezone).
2. **`user_avatars`**:
   * `user_id` (String(36), FK `users.id` CASCADE, PK).
   * `image_bytes` (LargeBinary): 256x256 WebP image.
   * `content_type` (String(32)): `image/webp`.
   * `updated_at` (DateTime with UTC timezone).
3. **`user_progress`**:
   * `id` (String(36), PK), `user_id` (String(36), FK `users.id` CASCADE, Unique Index).
   * `daily_goal_minutes` (Integer), `streak_days` (Integer), `longest_streak_days` (Integer).
   * `completed_lessons`, `completed_kana_groups`, `completed_kanji_groups`, `completed_vocab_units`, `completed_grammar_points`, `bookmarked_items` (JSON).
   * `last_active_date` (String(10)), `onboarded` (Boolean), `reset_epoch` (Integer).
   * `updated_at` (DateTime with UTC timezone).
4. **`user_review_cards`**:
   * `id` (String(36), PK), `user_id` (String(36), FK `users.id` CASCADE).
   * `card_id` (String(100)), `source` (String(20)), `raw_id` (String(80)).
   * `repetitions` (Integer), `ease_factor` (Float), `interval_days` (Integer), `due_date` (String(10)), `last_reviewed` (String(10)).
   * `updated_at` (DateTime with UTC timezone).
   * Unique Constraint: `("user_id", "card_id")`, Index: `("user_id", "due_date")`.
5. **`user_sessions`**:
   * `id` (String(36), PK), `user_id` (String(36), FK `users.id` CASCADE).
   * `token_hash` (String(64), Unique Index): SHA-256 hash of opaque token.
   * `expires_at` (DateTime with UTC timezone, Index), `created_at` (DateTime), `revoked` (Boolean).

---

## 5. Frontend Architecture & State Management

### Local Storage Schema
* `nihongo_user_profile`: Stores `UserProfile` containing completions, streak statistics, active date, synced user ID, and `resetEpoch`.
* `nihongo_deck_cards`: Stores `SM2Card[]` spaced repetition cards.
* `nihongo_dirty_flag`: Boolean flag set on client mutations to prevent false-positive syncs from clock skew.
* `nihongo_last_synced_at`: ISO timestamp recorded upon successful sync responses.

### Design Tokens & Glass Styles (`globals.css`)
* `.glass-blue`: `1.5px solid #2563EB`, gradient `rgba(37,99,235,0.16)` to `0.06`, `12px` blur (`6px` mobile).
* `.glass-red`: `1.5px solid #BC2025`, gradient `rgba(188,32,37,0.16)` to `0.06`.
* `.glass-saffron`: `1.5px solid #FF9933`, gradient `rgba(255,153,51,0.18)` to `0.06`.
* `.glass-green`: `1.5px solid #138808`, gradient `rgba(19,136,8,0.16)` to `0.06`.
* `.glass-purple`: `1.5px solid #7C3AED`, gradient `rgba(124,58,237,0.16)` to `0.06`.
* `.glass-teal`: `1.5px solid #0D9488`, gradient `rgba(13,148,136,0.16)` to `0.06`.
* `.glass-sidebar-box`: `1px solid rgba(37,99,235,0.35)`, background `rgba(37,99,235,0.08)`.

---

## 6. Testing & Build Verification

### Backend Pytest Suite
* **Command**: `pytest -v`
* **Test Count**: **36 tests** across 4 test modules:
  * `test_auth.py` (16 tests): Signup, login, password checks, CSRF protection, rate limits, session revocation, avatar uploads, trusted proxy headers.
  * `test_migration_integration.py` (2 tests): Unmigrated startup failure check, full lifecycle on migrated file database.
  * `test_sync.py` (5 tests): Isolation, reset epoch propagation, union of completions, LWW card reconciliation.
  * `test_tutor.py` (13 tests): Validation constraints, Groq LLM mock responses, error handling, rate limiting.
* **Status**: **100% Passed (36/36 in 3.31s)**.

### Frontend Vitest Suite
* **Command**: `npm test`
* **Test Count**: **87 tests** across 11 test suites:
  * `auth-errors.test.ts` (19 tests): Error mapping, network failure detection, dev-only `console.debug`.
  * `progress.test.ts` (11 tests): Combined 60-item course progress calculation, weekday streak derivation.
  * `kanji.test.ts` (10 tests): Group loading, quiz generation, meaning/reading modes.
  * `sm2.test.ts` (9 tests): Spaced repetition calculation, interval progression, ease factor clamping.
  * `quiz.test.ts` (8 tests): Distractor uniqueness, romaji normalization, answer verification.
  * `tutor.test.ts` (7 tests): Learned context serialization, message payload validation.
  * `storage-migration.test.ts` (6 tests): LocalStorage schema validation and defaults.
  * `sync-client.test.ts` (6 tests): Retry backoff, offline status, dirty flag synchronization.
  * `auth-context.test.ts` (4 tests): Guest merge, account isolation, logout warning modal.
  * `auth-validation.test.ts` (4 tests): Email format, password length, display name, avatar size.
  * `vocab-review.test.ts` (3 tests): Vocabulary deck additions and review queue updates.
* **Status**: **100% Passed (87/87 in 525ms)**.

### Production Build
* **Command**: `npm run build`
* **Result**: **Compiled successfully with 0 TypeScript and 0 lint errors** (Static prerendering for 11 routes).

---

## 7. UI Audit & Compliance

1. **Dark Navy / Black Boxes**:
   * Removed from Dashboard and AppShell.
   * Primary action buttons use solid red `#BC2025`; secondary actions use colored glass.
2. **Emoji Removal**:
   * Removed from Dashboard and Sidebar nav items. Vector Lucide icons (`LayoutDashboard`, `BookOpen`, `RotateCw`, `BarChart3`, `Bot`, `User`, `Flame`, etc.) are used exclusively.
3. **Desktop Modal Breakpoints (Phase 2 Scope)**:
   * `VocabUnitView.tsx`, `KanaDetailModal.tsx`, `KanjiDetailModal.tsx`, `GrammarPointView.tsx`, and `Quiz.tsx` currently render standard responsive modal dialogs.
   * The wide multi-column layout (`min(1100px, 90%)`) on `>=1024px` is queued for **Phase 2**.

---

## 8. Known Limitations & Technical Risks

1. **In-Memory Rate Limiting**:
   * IP and email attempt counts (`security.py` and `main.py`) reside in memory. In a multi-worker production environment (e.g. Gunicorn with multiple Uvicorn workers), rate limits should transition to Redis.
2. **Password Recovery & Email Verification**:
   * Email confirmation on signup and "Forgot Password" self-service flows are currently omitted (users reset passwords in `/account` while logged in).
3. **Deployment / Reverse Proxy Headers**:
   * In production behind Nginx/Cloudflare, `TRUSTED_PROXIES` environment variable must be populated to allow accurate client IP identification.

---

## 9. How to Run & Verify

### Backend
```bash
cd backend
source venv/bin/activate
alembic upgrade head
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Test Verification
```bash
# Backend tests
cd backend && source venv/bin/activate && pytest -v

# Frontend tests & build
cd frontend && npm test && npm run build
```

---

## 10. Recommended Next Steps

1. **UI Phase 2 Implementation** *(Effort: Medium, 3–4 hours)*:
   * Implement desktop wide-screen layouts (`min(1100px, 90%)`) for `VocabUnitView`, `KanjiDetailModal`, `GrammarPointView`, and `KanaDetailModal`.
   * Restyle `/learn`, `/review`, `/progress`, and `/tutor` pages using the new glass tokens.
2. **Password Reset Flow** *(Effort: Low-Medium, 2 hours)*:
   * Add email dispatch integration (e.g. Resend / SendGrid) and secure time-limited reset tokens.
3. **Redis Rate Limiting & Production Containerization** *(Effort: Low, 1.5 hours)*:
   * Add `Dockerfile` and `docker-compose.yml` bundling FastAPI, Next.js, and Redis.

---

## 11. Git & Workspace Status

* **Git Repository**: Root directory is currently an untracked local directory (`.git` not initialized).
* **Gitignore Coverage**: Comprehensive `.gitignore` exists at root ignoring:
  * `.env`, `backend/.env`, `frontend/.env.local`
  * `*.db`, `backend/*.db`, `*.sqlite3`
  * `venv/`, `backend/venv/`, `node_modules/`, `frontend/node_modules/`, `.next/`
