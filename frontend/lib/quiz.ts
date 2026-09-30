import { KanaItem, LoanwordExerciseItem, VocabItem, KanjiItem } from '@/types';

export type QuizMode = 'jp-to-romaji' | 'romaji-to-jp' | 'typing';
export type KanjiQuizMode = 'meaning' | 'reading';

export interface QuizItem {
  id: string;
  prompt: string;
  promptRomaji?: string;
  answer: string;
  answerRomaji?: string;
  answerHindi?: string;
  group: string;
  isSpecialO?: boolean; // flag for を / ヲ
}

export interface QuizQuestion {
  item: QuizItem;
  mode: QuizMode;
  prompt: string;
  promptSubtext?: string;
  options: string[]; // 4 unique options (empty for typing mode)
  correctAnswer: string;
}

/**
 * Filter out ぢ/づ/ヂ/ヅ and special-sounds group from quiz pool.
 */
export function isEligibleKanaForQuiz(item: KanaItem): boolean {
  // Exclude special sounds
  if (item.groupCategory === 'special' || item.row === 'special-sounds') {
    return false;
  }
  // Exclude ぢ/づ/ヂ/ヅ (ids: h-dji, h-dzu, k-dji, k-dzu)
  if (['h-dji', 'h-dzu', 'k-dji', 'k-dzu'].includes(item.id)) {
    return false;
  }
  if (['ぢ', 'づ', 'ヂ', 'ヅ'].includes(item.kana)) {
    return false;
  }
  return true;
}

/**
 * Convert KanaItems into generic QuizItems.
 */
export function kanaToQuizItems(items: KanaItem[]): QuizItem[] {
  return items
    .filter(isEligibleKanaForQuiz)
    .map((k) => ({
      id: k.id,
      prompt: k.kana,
      promptRomaji: k.romaji,
      answer: k.romaji,
      answerRomaji: k.romaji,
      answerHindi: k.hindiPhonetic,
      group: k.row,
      isSpecialO: k.id === 'h-wo' || k.id === 'k-wo' || k.kana === 'を' || k.kana === 'ヲ',
    }));
}

/**
 * Convert Loanwords into generic QuizItems.
 */
export function loanwordsToQuizItems(items: LoanwordExerciseItem[]): QuizItem[] {
  return items.map((lw) => ({
    id: lw.id,
    prompt: lw.word,
    promptRomaji: lw.romaji,
    answer: lw.hindiMeaning,
    answerRomaji: lw.romaji,
    answerHindi: lw.hindiMeaning,
    group: 'loanwords',
  }));
}

/**
 * Convert VocabItems into generic QuizItems.
 */
export function vocabToQuizItems(items: VocabItem[]): QuizItem[] {
  return items.map((v) => ({
    id: v.id,
    prompt: v.kanji || v.kana,
    promptRomaji: v.romaji,
    answer: v.hindiMeaning,
    answerRomaji: v.romaji,
    answerHindi: v.hindiMeaning,
    group: v.category,
  }));
}

/**
 * Convert KanjiItems into generic QuizItems.
 * Supports 2 modes:
 * - 'meaning': kanji -> Hindi meaning
 * - 'reading': kanji -> reading-in-context (using linkedVocabIds). Skips any kanji with zero linkedVocabIds.
 */
export function kanjiToQuizItems(
  items: KanjiItem[],
  mode: KanjiQuizMode = 'meaning',
  vocabPool: VocabItem[] = []
): QuizItem[] {
  if (mode === 'reading') {
    const vocabMap = new Map(vocabPool.map((v) => [v.id, v]));
    const result: QuizItem[] = [];

    for (const k of items) {
      if (!k.linkedVocabIds || k.linkedVocabIds.length === 0) {
        continue;
      }
      const linkedVocab = k.linkedVocabIds
        .map((id) => vocabMap.get(id))
        .find((v): v is VocabItem => !!v);

      if (!linkedVocab) {
        continue;
      }

      result.push({
        id: `${k.id}-reading`,
        prompt: linkedVocab.kanji || linkedVocab.kana,
        promptRomaji: linkedVocab.romaji,
        answer: linkedVocab.kana,
        answerRomaji: linkedVocab.romaji,
        answerHindi: linkedVocab.hindiMeaning,
        group: k.groupId,
      });
    }

    return result;
  }

  // Default: 'meaning' mode
  return items.map((k) => ({
    id: `${k.id}-meaning`,
    prompt: k.character,
    promptRomaji: k.onyomi?.[0] || k.kunyomi?.[0] || '',
    answer: k.meaningHindi,
    answerRomaji: k.meaningEnglish || k.id,
    answerHindi: k.meaningHindi,
    group: k.groupId,
  }));
}

/**
 * Shuffle an array in place (Fisher-Yates).
 */
export function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Generate 4 unique distractor options:
 * - Must be unique by displayed answer text.
 * - Never allow two options in the same question that share the same romaji.
 * - Pick distractors from the same group first, then broader pool.
 * - Shuffled.
 */
export function generateOptions(
  targetItem: QuizItem,
  allPool: QuizItem[],
  mode: QuizMode
): string[] {
  const getDisplayAnswer = (item: QuizItem): string => {
    if (mode === 'romaji-to-jp') {
      return item.prompt; // Japanese character/word
    }
    // For jp-to-romaji or meaning:
    return item.answerRomaji || item.answer;
  };

  const correctAnswer = getDisplayAnswer(targetItem);
  const correctRomaji = (targetItem.answerRomaji || targetItem.answer).toLowerCase();

  const selectedAnswers = new Set<string>([correctAnswer]);
  const selectedRomajis = new Set<string>([correctRomaji]);

  // Candidates in the same group (excluding target)
  const sameGroup = shuffleArray(
    allPool.filter((item) => item.id !== targetItem.id && item.group === targetItem.group)
  );

  // Candidates in other groups
  const otherGroups = shuffleArray(
    allPool.filter((item) => item.id !== targetItem.id && item.group !== targetItem.group)
  );

  const candidates = [...sameGroup, ...otherGroups];

  for (const candidate of candidates) {
    if (selectedAnswers.size >= 4) break;

    const candDisplay = getDisplayAnswer(candidate);
    const candRomaji = (candidate.answerRomaji || candidate.answer).toLowerCase();

    // Check uniqueness of display text and romaji
    if (!selectedAnswers.has(candDisplay) && !selectedRomajis.has(candRomaji)) {
      selectedAnswers.add(candDisplay);
      selectedRomajis.add(candRomaji);
    }
  }

  // If still fewer than 4 (very rare edge case on tiny test datasets), fill uniquely
  if (selectedAnswers.size < 4) {
    for (const candidate of candidates) {
      if (selectedAnswers.size >= 4) break;
      const candDisplay = getDisplayAnswer(candidate);
      if (!selectedAnswers.has(candDisplay)) {
        selectedAnswers.add(candDisplay);
      }
    }
  }

  return shuffleArray(Array.from(selectedAnswers));
}

/**
 * Standardize romanized input for typing comparison.
 * Maps standard aliases: shi/si, chi/ti, tsu/tu, fu/hu, ji/zi.
 * Handles "wo" only for を/ヲ (isSpecialO).
 */
export function normalizeRomaji(input: string, isSpecialO: boolean = false): string {
  let cleaned = input.trim().toLowerCase().replace(/\s+/g, '');

  if (isSpecialO) {
    if (cleaned === 'wo') return 'o';
  }

  // Normalize aliases
  cleaned = cleaned
    .replace(/shi/g, 'si')
    .replace(/chi/g, 'ti')
    .replace(/tsu/g, 'tu')
    .replace(/fu/g, 'hu')
    .replace(/ji/g, 'zi');

  return cleaned;
}

/**
 * Validate typing answer against target item.
 */
export function checkTypedAnswer(userInput: string, item: QuizItem): boolean {
  const targetRomaji = item.answerRomaji || item.answer;
  const normalizedInput = normalizeRomaji(userInput, item.isSpecialO);
  const normalizedTarget = normalizeRomaji(targetRomaji, item.isSpecialO);

  if (normalizedInput === normalizedTarget) {
    return true;
  }

  // Also accept direct Japanese character input match if user types in kana
  if (userInput.trim() === item.prompt.trim()) {
    return true;
  }

  return false;
}

/**
 * Feedback messages in natural spoken Hindi.
 */
export const FEEDBACK_MESSAGES = {
  correct: [
    'शानदार! सही उत्तर है 🎉',
    'बिल्कुल सही! शाबाश 👍',
    'अति उत्तम! सही जवाब ⭐',
    'बहुत बढ़िया! सही पकड़ा 👏',
  ],
  incorrect: (correctAnswer: string, romaji?: string) => {
    if (romaji && romaji !== correctAnswer) {
      return `कोई बात नहीं! सही उत्तर था: ${correctAnswer} (${romaji}) (गलती से ही सीखते हैं)`;
    }
    return `कोई बात नहीं! सही उत्तर था: ${correctAnswer} (गलती से ही सीखते हैं)`;
  },
};
