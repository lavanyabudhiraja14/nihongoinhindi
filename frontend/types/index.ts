export type KanaType = 'hiragana' | 'katakana';

export type KanaGroupCategory = 'basic' | 'dakuten' | 'handakuten' | 'yoon' | 'special';

export interface KanaSpecialExample {
  jp: string;
  romaji: string;
  hindi: string;
  meaning: string;
}

export interface KanaItem {
  id: string;
  kana: string;
  romaji: string;
  hindiPhonetic: string;
  type: KanaType;
  row: string;
  groupCategory?: KanaGroupCategory;
  mnemonic?: string;
  pronunciationNote?: string;
  examples?: KanaSpecialExample[];
  needs_review: boolean;
}

export interface LoanwordExerciseItem {
  id: string;
  word: string;
  romaji: string;
  englishMeaning: string;
  hindiMeaning: string;
  noteHindi?: string;
  needs_review: boolean;
}

export interface VocabItem {
  id: string;
  unitId: string; // e.g. "unit-v1" to "unit-v10"
  kanji?: string;
  kana: string;
  romaji: string;
  hindiMeaning: string;
  englishMeaning: string;
  category: string;
  exampleJp: string;
  exampleRomaji: string;
  exampleHindi: string;
  note?: string;
  needs_review: boolean;
}

export interface GrammarExample {
  jp: string;
  romaji: string;
  hindi: string;
  noteHindi?: string;
}

export interface GrammarMistake {
  mistakeJp: string;
  correctionJp: string;
  explanationHindi: string;
}

export interface GrammarQuizQuestion {
  question: string;
  options: [string, string, string, string];
  correctIndex: number; // 0..3
  explanationHindi: string;
}

export interface GrammarPoint {
  id: string;
  pointNumber: number; // 1 to 15
  titleJp: string;
  titleHindi: string;
  formula: string;
  explanationHindi: string;
  hindiComparison: string;
  examples: GrammarExample[]; // 3 examples
  commonMistake: GrammarMistake;
  quiz: GrammarQuizQuestion[]; // 3 quiz questions
  needs_review: boolean;
}

export interface KanjiItem {
  id: string;
  groupId: string;
  character: string;
  onyomi: string[];
  kunyomi: string[];
  meaningHindi: string;
  meaningEnglish: string;
  strokeCount: number;
  jlptLevel: string;
  mnemonic: string;
  needs_review: boolean;
  linkedVocabIds: string[];
  note?: string;
}

export type LessonType = 'kana' | 'vocab' | 'grammar' | 'practice';

export interface UnitLesson {
  id: string;
  titleHindi: string;
  titleJp: string;
  type: LessonType;
  durationMinutes: number;
  contentRef: string;
  needs_review: boolean;
}

export interface Unit {
  id: string;
  unitNumber: number;
  titleHindi: string;
  titleJp: string;
  descriptionHindi: string;
  lessons: UnitLesson[];
  needs_review: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  display_name: string;
  is_verified: boolean;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  dailyGoalMinutes: number;
  streakDays: number;
  longestStreakDays: number;
  completedLessons: string[];
  completedKanaGroups: string[];
  completedKanjiGroups?: string[];
  completedVocabUnits: string[];
  completedGrammarPoints: string[];
  bookmarkedItems: string[];
  lastActiveDate: string;
  onboarded: boolean;
  syncedUserId?: string | null;
  resetEpoch?: number;
  updatedAt?: string;
  lastSyncedAt?: string | null;
}


