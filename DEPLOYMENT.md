# Production Deployment Guide: Nihongo Seekho

This guide explains how to deploy **Nihongo Seekho** to production hosting platforms (such as **Vercel** for the Next.js frontend and **Render** or **Railway** for the FastAPI backend).

---

## 1. Architecture & Security Model

```
                    ┌────────────────────────┐
                    │      Web Browser       │
                    └───────────┬────────────┘
                                │ (HTTPS Same-Origin)
                                ▼
                    ┌────────────────────────┐
                    │   Frontend (Vercel)    │
                    │      Next.js 16        │
                    └───────────┬────────────┘
                                │ (Proxy rewrites /api/* and /health)
                                ▼
                    ┌────────────────────────┐
                    │  Backend (Render/etc.) │
                    │        FastAPI         │
                    └───────────┬────────────┘
                                │ (SQLAlchemy / Alembic)
                                ▼
                    ┌────────────────────────┐
                    │   Database (SQLite /   │
                    │       PostgreSQL)      │
                    └────────────────────────┘
```

* **Same-Origin Architecture**: The user's browser only connects to the frontend domain (e.g. `https://nihongo-seekho.vercel.app`).
* All requests to `/api/*` and `/health` are proxied server-side to the backend URL (`BACKEND_URL`).
* **Cookies**: Session and CSRF cookies stay same-origin with the frontend, avoiding cross-site cookie restrictions.

---

## 2. Environment Variables Reference

### Backend Host (Render / Railway / Fly.io)

| Variable | Description | Example / Recommended Value |
|---|---|---|
| `ENVIRONMENT` | Must be set to `production` to activate startup validation and security rules. | `production` |
| `SECRET_KEY` | 64-character random hex string used to sign CSRF tokens and internal security. | Generate using: `python -c "import secrets; print(secrets.token_hex(32))"` |
| `DATABASE_URL` | Database connection string. For production, use hosted PostgreSQL. | `postgresql://user:password@host:5432/nihongo_prod` |
| `ALLOW_SQLITE_IN_PRODUCTION` | Set to `true` ONLY if running on a persistent disk or volume with SQLite. | `false` |
| `ALLOWED_ORIGINS` | Comma-separated list of exact frontend origin URLs. Cannot contain `localhost` or `*` in production. | `https://nihongo-seekho.vercel.app` |
| `TRUSTED_PROXIES` | Comma-separated list of reverse proxy IP ranges to trust for client IP and HTTPS headers. | `127.0.0.1,10.0.0.0/8,172.16.0.0/12,192.168.0.0/16` |
| `GROQ_API_KEY` | Optional Groq API key for the AI Sensei Japanese tutor. | `gsk_your_real_groq_api_key` |
| `GROQ_MODEL` | LLM model for AI Tutor. | `openai/gpt-oss-120b` |
| `RATE_LIMIT_DAILY` | Max AI Tutor messages per client IP per day. | `30` |
| `EMAIL_PROVIDER` | Email provider: `resend`, `smtp`, or `console` (default in dev). | `resend` or `smtp` |
| `EMAIL_FROM` | Sender display name and address. | `Nihongo Seekho <noreply@nihongoseekho.com>` |
| `FRONTEND_URL` | Public frontend URL used to generate reset and verification links. | `https://nihongo-seekho.vercel.app` |
| `RESEND_API_KEY` | API Key from Resend (required if `EMAIL_PROVIDER=resend`). | `re_123456789_...` |
| `SMTP_HOST` | SMTP server host (required if `EMAIL_PROVIDER=smtp`). | `smtp.sendgrid.net` or `smtp.mailgun.org` |
| `SMTP_PORT` | SMTP port (typically 587 for TLS, 465 for SSL). | `587` |
| `SMTP_USER` | SMTP username / API key identity. | `apikey` |
| `SMTP_PASSWORD` | SMTP password / API token. | `your_smtp_api_key` |
| `SMTP_USE_TLS` | Enable STARTTLS. | `true` |

### Frontend Host (Vercel / Netlify / Cloudflare Pages)

| Variable | Description | Example / Recommended Value |
|---|---|---|
| `BACKEND_URL` | Server-side address of the backend. Used strictly by Next.js rewrites. **Do NOT add `NEXT_PUBLIC_`**. | `https://nihongo-backend.onrender.com` |

---

## 3. Email Provider Configuration

Nihongo Seekho supports two production email backends:

### Option A: Resend (Recommended)
1. Create an account at [resend.com](https://resend.com) and verify your sending domain (or use onboarding test email).
2. Generate an API key.
3. Configure the following environment variables on your backend:
   ```text
   EMAIL_PROVIDER="resend"
   RESEND_API_KEY="re_..."
   EMAIL_FROM="Nihongo Seekho <noreply@yourdomain.com>"
   FRONTEND_URL="https://nihongo-seekho.vercel.app"
   ```

### Option B: SMTP (Amazon SES, SendGrid, Postmark, Mailgun)
1. Obtain SMTP credentials from your transactional email provider.
2. Configure the following variables:
   ```text
   EMAIL_PROVIDER="smtp"
   SMTP_HOST="smtp.example.com"
   SMTP_PORT=587
   SMTP_USER="your_user"
   SMTP_PASSWORD="your_password"
   SMTP_USE_TLS=true
   EMAIL_FROM="Nihongo Seekho <noreply@yourdomain.com>"
   FRONTEND_URL="https://nihongo-seekho.vercel.app"
   ```

---

## 4. Start Commands & Database Migrations

### Backend
* **Build Command**:
  ```bash
  pip install -r requirements.txt
  ```
* **Start Command**:
  ```bash
  alembic upgrade head && uvicorn main:app --host 0.0.0.0 --port $PORT --proxy-headers --forwarded-allow-ips='*'
  ```
  > **Database Migrations**: Running `alembic upgrade head` at startup automatically applies schema migrations (including `users`, `user_sessions`, `email_verification_tokens`, `password_reset_tokens`, etc.) across both SQLite and PostgreSQL.

### Frontend
* **Build Command**:
  ```bash
  npm run build
  ```
* **Start Command**:
  ```bash
  npm start
  ```

---

## 5. Step-by-Step Deployment Checklist

Deploy in the following exact order:

### Step 1: Deploy Backend (Render / Railway)
1. Create a new **Web Service** pointing to the `backend/` directory.
2. Select Python 3.12 environment.
3. Generate a strong secret key:
   ```bash
   python -c "import secrets; print(secrets.token_hex(32))"
   ```
4. Set backend environment variables:
   * `ENVIRONMENT=production`
   * `SECRET_KEY=<generated_hex_key>`
   * `DATABASE_URL=<your_postgres_url>` (or set `ALLOW_SQLITE_IN_PRODUCTION=true` with a mounted disk)
   * `ALLOWED_ORIGINS=https://placeholder.vercel.app` (we will update this in Step 3)
   * `EMAIL_PROVIDER=resend` (or `smtp`)
   * `RESEND_API_KEY=<your_resend_api_key>`
   * `FRONTEND_URL=https://placeholder.vercel.app`
   * `GROQ_API_KEY=<your_groq_key>`
5. Deploy and verify the health check endpoint at:
   `https://your-backend.onrender.com/health` (should return `{"status":"ok","database":"healthy",...}`).

### Step 2: Deploy Frontend (Vercel)
1. Import the repository into **Vercel** and select the `frontend/` directory as the Root Directory.
2. Add the environment variable:
   * `BACKEND_URL=https://your-backend.onrender.com` (from Step 1)
3. Deploy the frontend project.
4. Note the generated production domain (e.g., `https://nihongo-seekho.vercel.app`).

### Step 3: Update Backend Configuration
1. Return to the backend host (Render/Railway).
2. Update `ALLOWED_ORIGINS` and `FRONTEND_URL` to match your exact Vercel domain:
   ```text
   ALLOWED_ORIGINS=https://nihongo-seekho.vercel.app
   FRONTEND_URL=https://nihongo-seekho.vercel.app
   ```
3. Restart or redeploy the backend service.

---

## 6. Post-Deployment Verification Checklist

Once both services are running, verify the live app:

- [ ] **1. Signup & Verification Email**: Create a new account at `/signup`. Verify redirect to `/verify-email` and receipt of the verification email.
- [ ] **2. Email Verification**: Click the verification link in the email or visit `/verify-email?token=...`. Confirm the account status turns to **सत्यापित (Verified)** in `/account`.
- [ ] **3. Forgot Password**: Request a password reset at `/forgot-password`. Verify receipt of the email and reset password at `/reset-password?token=...`.
- [ ] **4. Session Revocation**: Confirm that resetting password revokes other active sessions and requires logging in with the new password.
- [ ] **5. Login & Session Persistence**: Log in at `/login`, refresh the page, and confirm session remains authenticated.
- [ ] **6. Spaced Repetition Review**: Review kana/vocab cards at `/review` and confirm progress syncs.
- [ ] **7. AI Sensei Tutor**: Ask a question at `/tutor` and verify streaming responses.

---

## 7. Critical Warning on SQLite vs Hosted PostgreSQL

> [!WARNING]
> **Ephemeral Disk Data Loss**: Most cloud web hosts (including default Render Web Services, Vercel Serverless, and Railway Starter) use **ephemeral disks**. When a service is redeployed, restarted, or moved to another host, the local filesystem (including `nihongo.db`) is **completely erased**.
>
> For reliable production deployments, always use a managed **PostgreSQL database** (e.g. Supabase, Neon, AWS RDS, or Render Postgres) by setting:
> `DATABASE_URL="postgresql://user:password@host:5432/dbname"`.

---

## 8. Deferred Items & Future Roadmap

* **Secure Cookie Flag**: Cookie `secure=True` activation for HTTPS-only environments (postponed).
* **Hosted PostgreSQL Database**: Migration from development SQLite to managed PostgreSQL.
* **Persistent Distributed Rate Limiting**: Moving in-memory sliding-window limiter to Redis for multi-worker backend clusters.
* **Automated Database Backups**: Scheduled cron snapshots for PostgreSQL backups.
