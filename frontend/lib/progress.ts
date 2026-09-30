import { UserProfile } from '@/types';
import { SM2Card, formatLocalDate, parseLocalDate } from '@/lib/sm2';

export interface CourseProgressStats {
  currentStreak: number;
  longestStreak: number;
  kanaGroupsCompleted: number;
  totalKanaGroups: number;
  vocabUnitsCompleted: number;
  totalVocabUnits: number;
  kanjiGroupsCompleted: number;
  totalKanjiGroups: number;
  grammarPointsCompleted: number;
  totalGrammarPoints: number;
  cardsInDeck: number;
  cardsReviewedToday: number;
  courseProgressPercent: number;
}

export const TOTAL_KANA_GROUPS = 10; // 10 basic rows (a, ka, sa, ta, na, ha, ma, ya, ra, wa)
export const TOTAL_VOCAB_UNITS = 20; // 20 vocabulary units (200 words)
export const TOTAL_KANJI_GROUPS = 5; // 5 kanji groups (50 kanji)
export const TOTAL_GRAMMAR_POINTS = 25; // 25 essential N5 grammar points

/**
 * Pure function to record activity and compute streak according to rules:
 * - Same-day activity: streak unchanged.
 * - Next-day activity (1 day after lastActiveDate): streak + 1, update longestStreak.
 * - Missed day (> 1 day gap): streak reset to 1.
 */
export function recordActivity(
  profile: UserProfile,
  todayDateStr: string = formatLocalDate()
): UserProfile {
  const currentStreak = profile.streakDays || 0;
  const currentLongest = profile.longestStreakDays || Math.max(1, currentStreak);
  const lastActive = profile.lastActiveDate;

  if (!lastActive) {
    return {
      ...profile,
      streakDays: 1,
      longestStreakDays: Math.max(currentLongest, 1),
      lastActiveDate: todayDateStr,
    };
  }

  if (lastActive === todayDateStr) {
    // Same day activity: keep streak unchanged
    return {
      ...profile,
      streakDays: Math.max(1, currentStreak),
      longestStreakDays: Math.max(currentLongest, currentStreak, 1),
      lastActiveDate: todayDateStr,
    };
  }

  // Calculate day difference using local date boundaries
  const lastDate = parseLocalDate(lastActive);
  const todayDate = parseLocalDate(todayDateStr);

  const diffMs = todayDate.getTime() - lastDate.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    // Consecutive next day
    const newStreak = Math.max(1, currentStreak) + 1;
    const newLongest = Math.max(currentLongest, newStreak);
    return {
      ...profile,
      streakDays: newStreak,
      longestStreakDays: newLongest,
      lastActiveDate: todayDateStr,
    };
  } else if (diffDays > 1) {
    // Missed at least one day: reset streak to 1, preserve historical longest
    return {
      ...profile,
      streakDays: 1,
      longestStreakDays: currentLongest,
      lastActiveDate: todayDateStr,
    };
  } else {
    // Edge case (e.g. clock change): maintain current streak and update date
    return {
      ...profile,
      lastActiveDate: todayDateStr,
    };
  }
}

/**
 * Pure function to calculate course progress through THIS app's curriculum.
 * Accurately combines Kana (10) + Vocab (20) + Kanji (5) + Grammar (25) = 60 core items.
 */
export function calculateCourseProgress(
  profile: UserProfile,
  deckCards: SM2Card[] = [],
  todayDateStr: string = formatLocalDate()
): CourseProgressStats {
  const kanaCount = profile.completedKanaGroups?.length || 0;
  const vocabCount = profile.completedVocabUnits?.length || 0;
  const kanjiCount = (profile.completedKanjiGroups || []).length;
  const grammarCount = profile.completedGrammarPoints?.length || 0;

  const cardsInDeck = deckCards.length;
  const cardsReviewedToday = deckCards.filter(
    (card) => card.lastReviewed === todayDateStr
  ).length;

  // Track progress against this app's content components:
  // 10 kana basic groups + 20 vocab units + 5 kanji groups + 25 grammar points = 60 total items
  const totalCurriculumItems = TOTAL_KANA_GROUPS + TOTAL_VOCAB_UNITS + TOTAL_KANJI_GROUPS + TOTAL_GRAMMAR_POINTS;
  const completedCurriculumItems =
    Math.min(TOTAL_KANA_GROUPS, kanaCount) +
    Math.min(TOTAL_VOCAB_UNITS, vocabCount) +
    Math.min(TOTAL_KANJI_GROUPS, kanjiCount) +
    Math.min(TOTAL_GRAMMAR_POINTS, grammarCount);

  const courseProgressPercent = Math.min(
    100,
    Math.round((completedCurriculumItems / totalCurriculumItems) * 100)
  );

  return {
    currentStreak: profile.streakDays || 1,
    longestStreak: profile.longestStreakDays || profile.streakDays || 1,
    kanaGroupsCompleted: kanaCount,
    totalKanaGroups: TOTAL_KANA_GROUPS,
    vocabUnitsCompleted: vocabCount,
    totalVocabUnits: TOTAL_VOCAB_UNITS,
    kanjiGroupsCompleted: kanjiCount,
    totalKanjiGroups: TOTAL_KANJI_GROUPS,
    grammarPointsCompleted: grammarCount,
    totalGrammarPoints: TOTAL_GRAMMAR_POINTS,
    cardsInDeck,
    cardsReviewedToday,
    courseProgressPercent,
  };
}

export interface WeekdayStreakItem {
  label: string;
  short: string;
  nameEn: string;
  dateStr: string;
  isCompleted: boolean;
  isToday: boolean;
  isFuture: boolean;
}

/**
 * Pure function to derive the 7-day Monday-to-Sunday completion row from real data.
 */
export function getWeekdayStreak(
  profile: UserProfile,
  referenceDateStr: string = formatLocalDate()
): WeekdayStreakItem[] {
  const WEEKDAY_CONFIG = [
    { label: 'सोम', short: 'सो', nameEn: 'Mon' },
    { label: 'मंगल', short: 'मं', nameEn: 'Tue' },
    { label: 'बुध', short: 'बु', nameEn: 'Wed' },
    { label: 'गुरु', short: 'गु', nameEn: 'Thu' },
    { label: 'शुक्र', short: 'शु', nameEn: 'Fri' },
    { label: 'शनि', short: 'श', nameEn: 'Sat' },
    { label: 'रवि', short: 'र', nameEn: 'Sun' },
  ];

  const refDate = parseLocalDate(referenceDateStr);
  const dayOfWeek = refDate.getDay(); // 0 is Sun, 1 is Mon, ... 6 is Sat
  const mondayOffset = (dayOfWeek + 6) % 7;
  const mondayDate = new Date(refDate.getFullYear(), refDate.getMonth(), refDate.getDate() - mondayOffset);

  const lastActive = profile?.lastActiveDate || '';
  const streak = profile?.streakDays || 0;

  let streakStartMs = 0;
  let streakEndMs = 0;

  if (lastActive && streak > 0) {
    const lastActiveDate = parseLocalDate(lastActive);
    const diffDays = Math.round((refDate.getTime() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24));

    // Active streak: studied today (diffDays=0) or yesterday (diffDays=1)
    if (diffDays >= 0 && diffDays <= 1) {
      streakEndMs = lastActiveDate.getTime();
      const startDate = new Date(lastActiveDate.getFullYear(), lastActiveDate.getMonth(), lastActiveDate.getDate() - (streak - 1));
      streakStartMs = startDate.getTime();
    }
  }

  return WEEKDAY_CONFIG.map((w, idx) => {
    const d = new Date(mondayDate.getFullYear(), mondayDate.getMonth(), mondayDate.getDate() + idx);
    const dateStr = formatLocalDate(d);
    const dMs = d.getTime();

    const isCompleted = streakStartMs > 0 && dMs >= streakStartMs && dMs <= streakEndMs;
    const isToday = dateStr === referenceDateStr;
    const isFuture = dateStr > referenceDateStr;

    return {
      label: w.label,
      short: w.short,
      nameEn: w.nameEn,
      dateStr,
      isCompleted,
      isToday,
      isFuture,
    };
  });
}

