import { describe, it, expect } from 'vitest';
import { recordActivity, calculateCourseProgress, getWeekdayStreak } from '@/lib/progress';
import { UserProfile } from '@/types';
import { DEFAULT_USER_PROFILE } from '@/lib/storage';
import { SM2Card } from '@/lib/sm2';

describe('Streak & Activity Tracking Logic (recordActivity)', () => {
  it('initializes streak to 1 if no lastActiveDate exists', () => {
    const profile: UserProfile = {
      ...DEFAULT_USER_PROFILE,
      lastActiveDate: '',
      streakDays: 0,
      longestStreakDays: 0,
    };

    const updated = recordActivity(profile, '2026-09-29');
    expect(updated.streakDays).toBe(1);
    expect(updated.longestStreakDays).toBe(1);
    expect(updated.lastActiveDate).toBe('2026-09-29');
  });

  it('keeps streak unchanged on same-day activity', () => {
    const profile: UserProfile = {
      ...DEFAULT_USER_PROFILE,
      streakDays: 4,
      longestStreakDays: 10,
      lastActiveDate: '2026-09-29',
    };

    const updated = recordActivity(profile, '2026-09-29');
    expect(updated.streakDays).toBe(4);
    expect(updated.longestStreakDays).toBe(10);
    expect(updated.lastActiveDate).toBe('2026-09-29');
  });

  it('increments streak and updates longest streak on next-day activity', () => {
    const profile: UserProfile = {
      ...DEFAULT_USER_PROFILE,
      streakDays: 4,
      longestStreakDays: 4,
      lastActiveDate: '2026-09-28',
    };

    const updated = recordActivity(profile, '2026-09-29');
    expect(updated.streakDays).toBe(5);
    expect(updated.longestStreakDays).toBe(5);
    expect(updated.lastActiveDate).toBe('2026-09-29');
  });

  it('resets streak to 1 and keeps longest streak when a day is missed', () => {
    const profile: UserProfile = {
      ...DEFAULT_USER_PROFILE,
      streakDays: 7,
      longestStreakDays: 14,
      lastActiveDate: '2026-09-26', // Missed 2026-09-27 and 2026-09-28
    };

    const updated = recordActivity(profile, '2026-09-29');
    expect(updated.streakDays).toBe(1);
    expect(updated.longestStreakDays).toBe(14);
    expect(updated.lastActiveDate).toBe('2026-09-29');
  });
});

describe('Course Progress Calculation (calculateCourseProgress)', () => {
  it('calculates 0% for fresh profile', () => {
    const profile: UserProfile = { ...DEFAULT_USER_PROFILE };
    const stats = calculateCourseProgress(profile, [], '2026-09-29');

    expect(stats.currentStreak).toBe(1);
    expect(stats.kanaGroupsCompleted).toBe(0);
    expect(stats.vocabUnitsCompleted).toBe(0);
    expect(stats.grammarPointsCompleted).toBe(0);
    expect(stats.cardsInDeck).toBe(0);
    expect(stats.cardsReviewedToday).toBe(0);
    expect(stats.courseProgressPercent).toBe(0);
  });

  it('accurately counts cards reviewed today from deck cards', () => {
    const profile: UserProfile = { ...DEFAULT_USER_PROFILE };
    const deck: SM2Card[] = [
      {
        id: 'hiragana:h-a',
        source: 'hiragana',
        rawId: 'h-a',
        repetitions: 1,
        easeFactor: 2.5,
        intervalDays: 1,
        dueDate: '2026-09-30',
        lastReviewed: '2026-09-29',
      },
      {
        id: 'vocab:v-ohayou',
        source: 'vocab',
        rawId: 'v-ohayou',
        repetitions: 2,
        easeFactor: 2.5,
        intervalDays: 6,
        dueDate: '2026-10-05',
        lastReviewed: '2026-09-28', // Reviewed yesterday
      },
    ];

    const stats = calculateCourseProgress(profile, deck, '2026-09-29');
    expect(stats.cardsInDeck).toBe(2);
    expect(stats.cardsReviewedToday).toBe(1);
  });

  it('computes honest course content percentage correctly across all 4 categories', () => {
    // 60 total core items (10 kana + 20 vocab + 5 kanji + 25 grammar)
    const profile: UserProfile = {
      ...DEFAULT_USER_PROFILE,
      completedKanaGroups: ['a-row', 'ka-row'], // 2
      completedVocabUnits: ['unit-v1'], // 1
      completedKanjiGroups: ['group-k1'], // 1
      completedGrammarPoints: ['grammar-1-wa-desu', 'grammar-2-ka'], // 2
    };

    const stats = calculateCourseProgress(profile, [], '2026-09-29');
    expect(stats.kanaGroupsCompleted).toBe(2);
    expect(stats.vocabUnitsCompleted).toBe(1);
    expect(stats.kanjiGroupsCompleted).toBe(1);
    expect(stats.grammarPointsCompleted).toBe(2);
    // (2 + 1 + 1 + 2) / 60 = 6 / 60 = 10%
    expect(stats.courseProgressPercent).toBe(10);
  });
});

describe('Weekday Streak Row Derivation (getWeekdayStreak)', () => {
  it('marks today as completed when active today', () => {
    // Reference date: Wednesday 2026-09-30, streak 3 (Monday, Tuesday, Wednesday completed)
    const profile: UserProfile = {
      ...DEFAULT_USER_PROFILE,
      lastActiveDate: '2026-09-30',
      streakDays: 3,
    };

    const days = getWeekdayStreak(profile, '2026-09-30');
    expect(days).toHaveLength(7);

    // Mon, Tue, Wed should be completed
    expect(days[0].label).toBe('सोम');
    expect(days[0].isCompleted).toBe(true);
    expect(days[1].label).toBe('मंगल');
    expect(days[1].isCompleted).toBe(true);
    expect(days[2].label).toBe('बुध');
    expect(days[2].isCompleted).toBe(true);
    expect(days[2].isToday).toBe(true);

    // Thu, Fri, Sat, Sun should NOT be completed
    expect(days[3].label).toBe('गुरु');
    expect(days[3].isCompleted).toBe(false);
    expect(days[4].label).toBe('शुक्र');
    expect(days[4].isCompleted).toBe(false);
  });

  it('marks today as NOT completed if user has not yet practiced today (active yesterday)', () => {
    // Reference date: Wednesday 2026-09-30, but lastActiveDate was Tuesday 2026-09-29 with streak 2
    const profile: UserProfile = {
      ...DEFAULT_USER_PROFILE,
      lastActiveDate: '2026-09-29',
      streakDays: 2,
    };

    const days = getWeekdayStreak(profile, '2026-09-30');
    expect(days[0].label).toBe('सोम');
    expect(days[0].isCompleted).toBe(true); // Monday completed
    expect(days[1].label).toBe('मंगल');
    expect(days[1].isCompleted).toBe(true); // Tuesday completed
    expect(days[2].label).toBe('बुध');
    expect(days[2].isToday).toBe(true);
    expect(days[2].isCompleted).toBe(false); // Wednesday (today) is NOT completed yet!
  });

  it('correctly handles streak that began in the previous week', () => {
    // Reference date: Wednesday 2026-09-30, 10-day streak ending today (2026-09-21 Monday of previous week to 2026-09-30)
    const profile: UserProfile = {
      ...DEFAULT_USER_PROFILE,
      lastActiveDate: '2026-09-30',
      streakDays: 10,
    };

    const days = getWeekdayStreak(profile, '2026-09-30');
    // Mon, Tue, Wed of current week must all be completed
    expect(days[0].isCompleted).toBe(true);
    expect(days[1].isCompleted).toBe(true);
    expect(days[2].isCompleted).toBe(true);
    // Thu is future/unreached
    expect(days[3].isCompleted).toBe(false);
  });

  it('shows all days uncompleted if streak is broken (inactive for > 1 day)', () => {
    // Reference date: Wednesday 2026-09-30, last active Sunday 2026-09-27
    const profile: UserProfile = {
      ...DEFAULT_USER_PROFILE,
      lastActiveDate: '2026-09-27',
      streakDays: 5,
    };

    const days = getWeekdayStreak(profile, '2026-09-30');
    // All days in current week should be false because streak is broken
    expect(days.every((d) => !d.isCompleted)).toBe(true);
    expect(days[2].isToday).toBe(true);
  });
});

