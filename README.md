# Nihongo in Hindi (हिंदी में जापानी सीखें) 🇯🇵🇮🇳

A mobile-first Progressive Web App (PWA) designed to teach Japanese to Hindi speakers from zero up to **JLPT N5 ONLY**, leveraging linguistic similarities (SOV word order, verb at the end, particle comparisons, and loanwords).

---

## 🏗️ Project Architecture

```text
nihongo-to-hindi/
├── backend/                  # FastAPI (Python 3.12+)
│   ├── venv/                 # Python Virtual Environment
│   ├── main.py               # FastAPI app (CORS, /health, /api/tutor)
│   ├── requirements.txt      # Python dependencies
│   ├── .env                  # Backend environment variables
│   └── .env.example          # Environment template
│
├── frontend/                 # Next.js 14+ (App Router, TypeScript, Tailwind CSS)
│   ├── app/                  # App router pages (Home, Learn, Review, Progress, Tutor)
│   ├── components/           # UI components (BottomNav, OnboardingModal)
│   ├── content/              # JSON-only curriculum & content
│   │   ├── hiragana.json     # Basic Hiragana sample rows
│   │   ├── katakana.json     # Basic Katakana sample rows
│   │   ├── units.json        # N5 Units & Lessons
│   │   ├── vocab.json        # N5 Vocabulary with Hindi & English meanings
│   │   └── grammar.json      # N5 Grammar patterns with Hindi comparisons
│   ├── lib/                  # Helpers (storage.ts for typed localStorage)
│   ├── types/                # TypeScript definitions (KanaItem, VocabItem, GrammarPoint)
│   ├── .env.local            # Frontend environment variables
│   └── .env.example          # Frontend environment template
│
├── .gitignore                # Root gitignore
└── README.md                 # Project guide & instructions
```

---

## 🚀 Running the Project (Two Terminals)

### Terminal 1: Backend (FastAPI)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Activate the virtual environment:
   - **macOS / Linux**:
     ```bash
     source venv/bin/activate
     ```
   - **Windows**:
     ```bash
     venv\Scripts\activate
     ```

3. (First time only) Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the FastAPI server on port 8000:
   ```bash
   python main.py
   ```
   *The backend will be live at [http://localhost:8000](http://localhost:8000). Interactive API docs are at [http://localhost:8000/docs](http://localhost:8000/docs).*

---

### Terminal 2: Frontend (Next.js)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. (First time only) Install npm dependencies:
   ```bash
   npm install
   ```

3. Start the Next.js development server on port 3000:
   ```bash
   npm run dev
   ```
   *Open [http://localhost:3000](http://localhost:3000) in your browser (use mobile device emulation for the best mobile-first experience).*

---

## 🧪 Testing the Frontend-Backend Connection

1. Start both servers as described above.
2. In your browser, open [http://localhost:3000/tutor](http://localhost:3000/tutor).
3. Click the **"GET /health को कॉल करें"** button.
4. You will see a live status pill (🟢 Connected) and the response from FastAPI:
   ```json
   {
     "status": "ok",
     "app": "Nihongo in Hindi Backend",
     "version": "0.1.0"
   }
   ```

---

## 📌 Core Rules & Content Verification
- **Content Separation**: All lesson and language content is stored strictly in `/frontend/content/*.json`. No hardcoded lesson text in React components.
- **Natural Hindi**: Explanations use natural spoken Devanagari Hindi rather than machine translations.
- **Review Tags**: Any content item requiring review is marked with `"needs_review": true`.
- **Strict Scope**: Limited strictly to JLPT N5 foundational learning.
