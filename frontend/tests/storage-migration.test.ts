import { describe, it, expect, beforeEach } from 'vitest';
import {
  getUserProfile,
  saveUserProfile,
  getDeckCards,
  saveDeckCards,
  saveSyncedProfileAndCards,
  resetProgress,
  clearAccountLocalData,
  hasUnsyncedChanges,
  LEGACY_TIMESTAMP,
  DEFAULT_USER_PROFILE,
} from '@/lib/storage';
import { createInitialCard, calculateSM2 } from '@/lib/sm2';

const createLocalStorageMock = () => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
};

const localStorageMock = createLocalStorageMock();
Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

describe('Storage Migration & Sync Timestamps', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });


  it('defaults legacy profile missing updatedAt to 1970-01-01T00:00:00.000Z without stamping current time on read', () => {
    // Simulate legacy profile saved in localStorage before sync fields existed
    const legacyJson = JSON.stringify({
      dailyGoalMinutes: 15,
      streakDays: 4,
      longestStreakDays: 7,
      completedLessons: ['u1-l1'],
      completedKanaGroups: ['h-a'],
      completedVocabUnits: ['v-1'],
      completedGrammarPoints: [],
      bookmarkedItems: [],
      lastActiveDate: '2026-09-28',
      onboarded: true,
    });
    localStorage.setItem('nihongo_in_hindi_user_profile_v1', legacyJson);

    // Read profile
    const profile = getUserProfile();
    expect(profile.updatedAt).toBe(LEGACY_TIMESTAMP);
    expect(profile.resetEpoch).toBe(0);
    expect(profile.syncedUserId).toBeNull();

    // Verify localStorage was not modified by the read operation
    const rawAfter = localStorage.getItem('nihongo_in_hindi_user_profile_v1');
    expect(rawAfter).toBe(legacyJson);
  });

  it('defaults legacy SM-2 cards missing updatedAt to 1970-01-01T00:00:00.000Z', () => {
    const legacyCards = [
      {
        id: 'hiragana:h-a',
        source: 'hiragana',
        rawId: 'h-a',
        repetitions: 2,
        easeFactor: 2.5,
        intervalDays: 6,
        dueDate: '2026-10-06',
      },
    ];
    localStorage.setItem('nihongo_cards', JSON.stringify(legacyCards));

    const cards = getDeckCards();
    expect(cards.length).toBe(1);
    expect(cards[0].updatedAt).toBe(LEGACY_TIMESTAMP);
  });

  it('stamps current ISO timestamp on real user mutations', () => {
    saveUserProfile({
      ...DEFAULT_USER_PROFILE,
      completedLessons: ['u1-l1'],
    });

    const prof = getUserProfile();
    expect(prof.updatedAt).not.toBe(LEGACY_TIMESTAMP);
    expect(new Date(prof.updatedAt!).getTime()).toBeGreaterThan(new Date('2026-01-01').getTime());
  });

  it('sync writes preserve exact server timestamps and do not mark as unsynced', () => {
    const serverTimestamp = '2026-09-30T10:00:00.000Z';
    const serverProfile = {
      ...DEFAULT_USER_PROFILE,
      completedLessons: ['u1-l1', 'u1-l2'],
      updatedAt: serverTimestamp,
    };
    const serverCards = [
      {
        id: 'vocab:v-1',
        source: 'vocab' as const,
        rawId: 'v-1',
        repetitions: 3,
        easeFactor: 2.5,
        intervalDays: 6,
        dueDate: '2026-10-06',
        updatedAt: serverTimestamp,
      },
    ];

    saveSyncedProfileAndCards(serverProfile, serverCards, 'user_123', serverTimestamp);

    const localProfile = getUserProfile();
    expect(localProfile.syncedUserId).toBe('user_123');
    expect(localProfile.lastSyncedAt).toBe(serverTimestamp);
    expect(localProfile.updatedAt).toBe(serverTimestamp);

    const localCards = getDeckCards();
    expect(localCards[0].updatedAt).toBe(serverTimestamp);

    // Should NOT have unsynced changes immediately after sync write
    expect(hasUnsyncedChanges()).toBe(false);
  });

  it('resetProgress increments resetEpoch only when bound to an account', () => {
    // 1. Guest reset -> resetEpoch stays 0
    saveUserProfile({ ...DEFAULT_USER_PROFILE, syncedUserId: null, resetEpoch: 0 });
    const guestReset = resetProgress();
    expect(guestReset.resetEpoch).toBe(0);

    // 2. Account-bound reset -> resetEpoch increments
    saveUserProfile({ ...DEFAULT_USER_PROFILE, syncedUserId: 'user_456', resetEpoch: 2 });
    const accountReset = resetProgress();
    expect(accountReset.resetEpoch).toBe(3);
    expect(accountReset.completedLessons).toEqual([]);
  });

  it('clearAccountLocalData wipes account data and restores clean guest state', () => {
    saveUserProfile({
      ...DEFAULT_USER_PROFILE,
      syncedUserId: 'user_to_clear',
      completedLessons: ['u1-l1', 'u1-l2'],
    });
    saveDeckCards([
      {
        id: 'hiragana:h-a',
        source: 'hiragana',
        rawId: 'h-a',
        repetitions: 5,
        easeFactor: 2.6,
        intervalDays: 12,
        dueDate: '2026-10-12',
      },
    ]);

    clearAccountLocalData();

    const prof = getUserProfile();
    expect(prof.syncedUserId).toBeNull();
    expect(prof.completedLessons).toEqual([]);
    expect(getDeckCards()).toEqual([]);
  });
});
