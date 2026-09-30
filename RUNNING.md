# Running Nihongo to Hindi (Nihongo Seekho)

This guide documents the setup, execution, database management, testing, and troubleshooting for both the FastAPI backend and Next.js frontend.

---

## 1. Prerequisites
- **Python**: 3.12+
- **Node.js**: 18+ (Node 20+ recommended)
- **SQLite3** (built-in)

---

## 2. Backend Setup & Run

### A. Environment Configuration
From the project root:
```bash
cd backend
cp .env.example .env
```
Ensure your `backend/.env` has a valid `SECRET_KEY` and optional `GROQ_API_KEY` (for AI Tutor). Note that SQLite database paths resolve relative to `backend/` regardless of your shell working directory.

### B. Virtual Environment & Dependencies
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### C. Database Migration (Alembic)
Always run migrations before starting the backend:
```bash
cd backend
source venv/bin/activate
alembic upgrade head
```
*Tip: Verify tables exist using `sqlite3 nihongo.db ".tables"` (should output: `alembic_version`, `user_avatars`, `user_progress`, `user_review_cards`, `user_sessions`, `users`).*

### D. Start Backend Server
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8000
```
- API Docs: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/health`

---

## 3. Frontend Setup & Run

### A. Install Dependencies
```bash
cd frontend
npm install
```

### B. Start Frontend Server
```bash
cd frontend
npm run dev
```
- App UI: `http://localhost:3000`
- API calls to `/api/*` are automatically proxied to `http://127.0.0.1:8000` via Next.js rewrites.
- **Important**: Whenever you modify `next.config.ts` or `.env`, you must restart the Next.js dev server (`npm run dev`) for proxy changes to take effect.

---

## 4. Running Tests

### Backend Test Suite (Pytest)
```bash
cd backend
source venv/bin/activate
pytest -v
```

### Frontend Test Suite (Vitest)
```bash
cd frontend
npm test
```

### Production Build Verification
```bash
cd frontend
npm run build
```

---

## 5. Local Database Management & Reset

If you ever need to completely reset your local development database:
```bash
cd backend
source venv/bin/activate
# 1. Remove the SQLite database file
rm -f nihongo.db
# 2. Run Alembic migrations to recreate all tables
alembic upgrade head
# 3. Confirm tables were created
sqlite3 nihongo.db ".tables"
```

---

## 6. Troubleshooting

### 1. 500 on Signup or "no such table: users"
- **Cause**: The database file has not been migrated or the migration was run against a different file location.
- **Fix**:
  1. `cd backend && source venv/bin/activate`
  2. `alembic upgrade head`
  3. Check health status at `curl http://localhost:8000/health` (should show `"database": "healthy"`).

### 2. Startup Fails Fast with "Database is not migrated"
- **Cause**: Backend startup check detected missing tables or out-of-sync Alembic revision.
- **Fix**: Run `alembic upgrade head` from the `backend/` directory.

### 3. Port in Use (8000 or 3000)
- **Find process**:
  - `lsof -i :8000` or `lsof -i :3000`
- **Kill process**:
  - `kill -9 <PID>`

### 4. Missing `.env` or CSRF / Cookie issues
- Ensure `backend/.env` exists.
- The frontend proxies requests same-origin through `/api/*` to ensure cookies and CSRF double-submit tokens work smoothly.
