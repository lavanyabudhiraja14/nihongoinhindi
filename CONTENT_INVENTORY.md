# Content & Feature Inventory (Nihongo Seekho - N5 in Hindi)

This document contains a complete audit of all routes, features, components, content files, and state management mechanisms in the application.

---

## 1. Routes & Pages (`frontend/app/`)

| Route | Page File | Core Purpose & Features |
|---|---|---|
| `/` | `app/page.tsx` | **Home Dashboard**: Welcome greeting, streak indicator, SM-2 due cards count & review shortcut, daily study goal & course progress bar, quick access tiles (Lessons, Hiragana, Katakana, Vocabulary, Kanji, Grammar, AI Tutor, Review Deck), today's highlighted lesson. |
| `/learn` | `app/learn/page.tsx` | **Curriculum Hub**: 7 sub-tabs: <br>1. **Units (इकाइयाँ)**: 20 structured units with 150+ lesson items.<br>2. **Vocab (शब्दावली)**: 20 units (200 words) with full unit viewer & quiz.<br>3. **Kanji (कांजी)**: 5 groups (50 kanji) with meaning & context-reading quizzes.<br>4. **Grammar (व्याकरण)**: 25 JLPT N5 points with formulas & quizzes.<br>5. **Hiragana (हिरागाना)**: 107 characters in 5 category sections.<br>6. **Katakana (काताकाना)**: 107 characters in 5 category sections.<br>7. **Loanwords (लोनवर्ड्स)**: Katakana loanwords interactive practice. |
| `/review` | `app/review/page.tsx` | **SM-2 Flashcard Review**: Due card queue, front/back flip card, Japanese speech synthesis audio playback, 4 rating buttons (Again [0], Hard [3], Good [4], Easy [5]), session progress statistics, completion screen. Supports 5 card sources: `hiragana`, `katakana`, `loanword`, `vocab`, `kanji`. |
| `/progress` | `app/progress/page.tsx` | **Progress & Settings**: Current streak & longest streak, cards reviewed today, total cards in deck, detailed completion breakdown (Kana, Vocab, Grammar, Kanji), daily goal adjustment (5, 10, 15, 20, 30 min), reset progress with safety modal. |
| `/tutor` | `app/tutor/page.tsx` | **AI Sensei Chat**: Chat interface with backend FastAPI LLM tutor, learned context injector (injects user's completed kana/vocab/grammar into system prompt), backend health status checker with latency benchmark, starter prompts, speech synthesis audio. |

---

## 2. Interactive Components (`frontend/components/`)

| Component | File Path | Description |
|---|---|---|
| `BottomNav` | `components/BottomNav.tsx` | Sticky 5-tab navigation bar (Home `/`, Learn `/learn`, Review `/review`, Progress `/progress`, Tutor `/tutor`). |
| `KanaDetailModal` | `components/KanaDetailModal.tsx` | Modal displaying large Kana character, Hindi phonetics, Romaji, speech synthesis audio button, "Add to SM-2 Deck", mnemonics, pronunciation notes, and special sound examples. |
| `KanjiDetailModal` | `components/KanjiDetailModal.tsx` | Modal displaying large Kanji character, separated Onyomi/Kunyomi badges, Hindi/English meanings, mnemonic, stroke order note ("स्ट्रोक ऑर्डर जल्द आएगा"), tap-to-speak linked vocabulary items list, and "Add to SM-2 Deck". |
| `VocabUnitView` | `components/VocabUnitView.tsx` | Full-screen unit modal with 10 vocabulary cards, Kanji/Kana readings, audio playback, Hindi meaning, example sentences (JP + Romaji + Hindi), "Add Unit to Deck", and 80%-pass unit quiz. |
| `GrammarPointView` | `components/GrammarPointView.tsx` | Full grammar guide modal with Hindi grammar comparison, formula badge, explanation, 3 bilingual examples, common mistakes breakdown, and 3-question quiz (>= 2/3 to pass). |
| `KatakanaExercise` | `components/KatakanaExercise.tsx` | 20 English-to-Katakana loanword training cards with audio playback, word origins, Hindi meaning, and interactive loanword quiz. |
| `Quiz` | `components/Quiz.tsx` | Unified 4-option multiple-choice quiz engine with 4 distractor uniqueness algorithms, progress bar, feedback in spoken Hindi, result screen, and score tracking. |
| `OnboardingModal` | `components/OnboardingModal.tsx` | First-time user welcome popup with daily study goal selection (5, 10, 15, 20, 30 min). |
| `InstallPrompt` | `components/InstallPrompt.tsx` | PWA installation banner for iOS and Android devices. |
| `ServiceWorkerRegister`| `components/ServiceWorkerRegister.tsx` | Registers service worker for offline asset caching. |

---

## 3. Curriculum & Content Files (`frontend/content/`)

| File | Content Count | Schema / Key Fields |
|---|---|---|
| `hiragana.json` | 107 characters | `id`, `kana`, `romaji`, `hindiPhonetic`, `type: 'hiragana'`, `row`, `groupCategory` (46 basic, 20 dakuten, 5 handakuten, 33 yoon, 3 special), `mnemonic`, `pronunciationNote`, `examples` |
| `katakana.json` | 107 characters | Same structure as hiragana, `type: 'katakana'` |
| `loanwords.json` | 20 items | `id`, `word`, `romaji`, `englishMeaning`, `hindiMeaning`, `noteHindi` |
| `vocab.json` | 200 words | 20 units $\times$ 10 words. `id`, `unitId`, `kanji?`, `kana`, `romaji`, `hindiMeaning`, `englishMeaning`, `category`, `exampleJp`, `exampleRomaji`, `exampleHindi`, `note?` |
| `kanji.json` | 50 kanji | 5 groups $\times$ 10 kanji. `id`, `groupId`, `character`, `onyomi[]`, `kunyomi[]`, `meaningHindi`, `meaningEnglish`, `strokeCount`, `jlptLevel`, `mnemonic`, `linkedVocabIds[]` |
| `grammar.json` | 25 grammar points | `id`, `pointNumber`, `titleJp`, `titleHindi`, `formula`, `explanationHindi`, `hindiComparison`, `examples` (3), `commonMistake`, `quiz` (3 questions) |
| `units.json` | 20 curriculum units | `id`, `unitNumber`, `titleHindi`, `titleJp`, `descriptionHindi`, `lessons` (lesson items with duration, types) |

---

## 4. Business Logic & Core Libraries (`frontend/lib/`)

| Library | File Path | Functions & Logic |
|---|---|---|
| `sm2.ts` | `lib/sm2.ts` | SuperMemo-2 algorithm implementation. `calculateSM2`, `createInitialCard`, `getDueCards`, local date parsing (`formatLocalDate`, `parseLocalDate`). `CardSource = 'hiragana' \| 'katakana' \| 'loanword' \| 'vocab' \| 'kanji'`. |
| `quiz.ts` | `lib/quiz.ts` | Quiz conversions (`kanaToQuizItems`, `loanwordsToQuizItems`, `vocabToQuizItems`, `kanjiToQuizItems` [meaning & reading modes]), `generateOptions` (ensures 4 unique distractors without duplicate romaji), `normalizeRomaji`, `checkTypedAnswer`, Hindi feedback messages. |
| `progress.ts`| `lib/progress.ts` | Daily activity recorder, streak counter (checks consecutive days, resets if broken), overall course completion percentage calculator. |
| `storage.ts` | `lib/storage.ts` | Client-side `localStorage` state management: `getUserProfile`, `saveUserProfile`, `markDailyActivity`, `setDailyGoal`, `markLessonCompleted`, `toggleKanaGroupCompleted`, `toggleKanjiGroupCompleted`, `markVocabUnitCompleted`, `markGrammarPointCompleted`, `getDeckCards`, `addCardsToDeck`, `updateCardInDeck`, `resetProgress`. |
| `tutor.ts` | `lib/tutor.ts` | API client for backend FastAPI endpoint (`/chat`), `buildLearnedContext` (extracts learned kana/vocab/grammar to personalize AI responses). |

---

## 5. Offline, Audio & Hardware Capabilities

- **Speech Synthesis (TTS)**: Web Speech API (`SpeechSynthesisUtterance`, `lang: 'ja-JP'`, rate `0.85`) across Kana, Vocab, Kanji, and Review cards.
- **PWA & Offline Support**: `public/manifest.json`, `public/sw.js`, PWA icons (192px, 512px), maskable icons, standalone display mode.
