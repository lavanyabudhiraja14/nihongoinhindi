import { UserProfile } from '@/types';
import { SM2Card, formatLocalDate } from '@/lib/sm2';
import { recordActivity } from '@/lib/progress';

const STORAGE_KEY = 'nihongo_in_hindi_user_profile_v1';
const CARDS_STORAGE_KEY = 'nihongo_cards';
const SYNC_DIRTY_KEY = 'nihongo_sync_is_dirty';
export const LEGACY_TIMESTAMP = '1970-01-01T00:00:00.000Z';

export function getSyncDirty(): boolean {
  if (typeof localStorage === 'undefined') return false;
  return localStorage.getItem(SYNC_DIRTY_KEY) === 'true';
}

export function setSyncDirty(isDirty: boolean): void {
  if (typeof localStorage === 'undefined') return;
  if (isDirty) {
    localStorage.setItem(SYNC_DIRTY_KEY, 'true');
  } else {
    localStorage.removeItem(SYNC_DIRTY_KEY);
  }
}

export const DEFAULT_USER_PROFILE: UserProfile = {
  dailyGoalMinutes: 10,
  streakDays: 1,
  longestStreakDays: 1,
  completedLessons: [],
  completedKanaGroups: [],
  completedKanjiGroups: [],
  completedVocabUnits: [],
  completedGrammarPoints: [],
  bookmarkedItems: [],
  lastActiveDate: formatLocalDate(),
  onboarded: false,
  syncedUserId: null,
  resetEpoch: 0,
  updatedAt: LEGACY_TIMESTAMP,
  lastSyncedAt: null,
};

/**
 * Safely retrieve the user's learning profile from localStorage.
 * Missing updatedAt defaults to LEGACY_TIMESTAMP (never stamped to current time on read).
 */
export function getUserProfile(): UserProfile {
  if (typeof localStorage === 'undefined') {
    return DEFAULT_USER_PROFILE;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return DEFAULT_USER_PROFILE;
    }
    const parsed = JSON.parse(raw) as Partial<UserProfile>;
    const streak = typeof parsed.streakDays === 'number' ? parsed.streakDays : 1;
    const longest = typeof parsed.longestStreakDays === 'number' ? parsed.longestStreakDays : Math.max(1, streak);

    return {
      ...DEFAULT_USER_PROFILE,
      ...parsed,
      streakDays: streak,
      longestStreakDays: longest,
      completedLessons: Array.isArray(parsed.completedLessons) ? parsed.completedLessons : [],
      completedKanaGroups: Array.isArray(parsed.completedKanaGroups) ? parsed.completedKanaGroups : [],
      completedKanjiGroups: Array.isArray(parsed.completedKanjiGroups) ? parsed.completedKanjiGroups : [],
      completedVocabUnits: Array.isArray(parsed.completedVocabUnits) ? parsed.completedVocabUnits : [],
      completedGrammarPoints: Array.isArray(parsed.completedGrammarPoints) ? parsed.completedGrammarPoints : [],
      bookmarkedItems: Array.isArray(parsed.bookmarkedItems) ? parsed.bookmarkedItems : [],
      syncedUserId: parsed.syncedUserId ?? null,
      resetEpoch: typeof parsed.resetEpoch === 'number' ? parsed.resetEpoch : 0,
      updatedAt: parsed.updatedAt || LEGACY_TIMESTAMP,
      lastSyncedAt: parsed.lastSyncedAt ?? null,
    };
  } catch (error) {
    console.error('Failed to read user profile from localStorage:', error);
    return DEFAULT_USER_PROFILE;
  }
}

type StorageMutationListener = () => void;
const mutationListeners: Set<StorageMutationListener> = new Set();

export function onStorageMutation(listener: StorageMutationListener): () => void {
  mutationListeners.add(listener);
  return () => mutationListeners.delete(listener);
}

function notifyMutationListeners(): void {
  mutationListeners.forEach((fn) => {
    try {
      fn();
    } catch (err) {
      console.error('Error in storage mutation listener:', err);
    }
  });
}

/**
 * Save the user profile to localStorage.
 * Real user actions stamp updatedAt to new Date().toISOString() and mark sync dirty.
 * Sync writes (isSyncWrite=true) preserve the server's timestamps without marking dirty.
 */
export function saveUserProfile(profile: UserProfile, isSyncWrite: boolean = false): void {
  if (typeof localStorage === 'undefined') return;

  try {
    const toSave: UserProfile = {
      ...profile,
      updatedAt: isSyncWrite ? (profile.updatedAt || LEGACY_TIMESTAMP) : new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    if (!isSyncWrite) {
      setSyncDirty(true);
      notifyMutationListeners();
    }
  } catch (error) {
    console.error('Failed to save user profile to localStorage:', error);
  }
}

/**
 * Save progress and cards directly from server sync results without marking them as dirty.
 */
export function saveSyncedProfileAndCards(
  profile: UserProfile,
  cards: SM2Card[],
  userId: string,
  syncedAt: string = new Date().toISOString()
): void {
  if (typeof localStorage === 'undefined') return;

  const toSaveProfile: UserProfile = {
    ...profile,
    syncedUserId: userId,
    lastSyncedAt: syncedAt,
    updatedAt: profile.updatedAt || syncedAt,
  };

  saveUserProfile(toSaveProfile, true);
  saveDeckCards(cards, true);
  setSyncDirty(false);
}

/**
 * Mark daily activity, updating streak and lastActiveDate.
 */
export function markDailyActivity(todayDateStr?: string): UserProfile {
  const current = getUserProfile();
  const updated = recordActivity(current, todayDateStr);
  saveUserProfile(updated);
  return updated;
}

/**
 * Set the daily study goal in minutes and mark user as onboarded.
 */
export function setDailyGoal(minutes: number): UserProfile {
  const current = getUserProfile();
  const updated: UserProfile = {
    ...current,
    dailyGoalMinutes: minutes,
    onboarded: true,
  };
  saveUserProfile(updated);
  return updated;
}

/**
 * Mark a lesson as completed and record daily activity.
 */
export function markLessonCompleted(lessonId: string): UserProfile {
  const current = getUserProfile();
  const alreadyCompleted = current.completedLessons.includes(lessonId);
  const updatedList = alreadyCompleted
    ? current.completedLessons
    : [...current.completedLessons, lessonId];

  const withActivity = recordActivity({
    ...current,
    completedLessons: updatedList,
  });
  saveUserProfile(withActivity);
  return withActivity;
}

/**
 * Check whether a lesson is completed.
 */
export function isLessonCompleted(lessonId: string): boolean {
  const current = getUserProfile();
  return current.completedLessons.includes(lessonId);
}

/**
 * Mark or toggle a Kana row/group as completed and record activity if marked.
 */
export function toggleKanaGroupCompleted(groupId: string): UserProfile {
  const current = getUserProfile();
  const exists = current.completedKanaGroups.includes(groupId);
  const updatedGroups = exists
    ? current.completedKanaGroups.filter((id) => id !== groupId)
    : [...current.completedKanaGroups, groupId];

  let updatedProfile: UserProfile = {
    ...current,
    completedKanaGroups: updatedGroups,
  };

  if (!exists) {
    updatedProfile = recordActivity(updatedProfile);
  }

  saveUserProfile(updatedProfile);
  return updatedProfile;
}

/**
 * Check whether a Kana row/group is completed.
 */
export function isKanaGroupCompleted(groupId: string): boolean {
  const current = getUserProfile();
  return current.completedKanaGroups.includes(groupId);
}

/**
 * Mark or toggle a Kanji group as completed and record activity if marked.
 */
export function toggleKanjiGroupCompleted(groupId: string): UserProfile {
  const current = getUserProfile();
  const currentKanji = current.completedKanjiGroups || [];
  const exists = currentKanji.includes(groupId);
  const updatedGroups = exists
    ? currentKanji.filter((id) => id !== groupId)
    : [...currentKanji, groupId];

  let updatedProfile: UserProfile = {
    ...current,
    completedKanjiGroups: updatedGroups,
  };

  if (!exists) {
    updatedProfile = recordActivity(updatedProfile);
  }

  saveUserProfile(updatedProfile);
  return updatedProfile;
}

/**
 * Check whether a Kanji group is completed.
 */
export function isKanjiGroupCompleted(groupId: string): boolean {
  const current = getUserProfile();
  return (current.completedKanjiGroups || []).includes(groupId);
}

/**
 * Mark a Vocab unit as completed (passed with >= 80%) and record activity.
 */
export function markVocabUnitCompleted(unitId: string): UserProfile {
  const current = getUserProfile();
  const already = current.completedVocabUnits.includes(unitId);
  const updatedUnits = already
    ? current.completedVocabUnits
    : [...current.completedVocabUnits, unitId];

  const updated = recordActivity({
    ...current,
    completedVocabUnits: updatedUnits,
  });
  saveUserProfile(updated);
  return updated;
}

/**
 * Check whether a Vocab unit is completed.
 */
export function isVocabUnitCompleted(unitId: string): boolean {
  const current = getUserProfile();
  return current.completedVocabUnits.includes(unitId);
}

/**
 * Mark a Grammar point as completed (passed with >= 2/3) and record activity.
 */
export function markGrammarPointCompleted(pointId: string): UserProfile {
  const current = getUserProfile();
  const already = current.completedGrammarPoints.includes(pointId);
  const updatedPoints = already
    ? current.completedGrammarPoints
    : [...current.completedGrammarPoints, pointId];

  const updated = recordActivity({
    ...current,
    completedGrammarPoints: updatedPoints,
  });
  saveUserProfile(updated);
  return updated;
}

/**
 * Check whether a Grammar point is completed.
 */
export function isGrammarPointCompleted(pointId: string): boolean {
  const current = getUserProfile();
  return current.completedGrammarPoints.includes(pointId);
}

/**
 * Toggle bookmarking of an item.
 */
export function toggleBookmark(itemId: string): UserProfile {
  const current = getUserProfile();
  const exists = current.bookmarkedItems.includes(itemId);
  const updated: UserProfile = {
    ...current,
    bookmarkedItems: exists
      ? current.bookmarkedItems.filter((id) => id !== itemId)
      : [...current.bookmarkedItems, itemId],
  };
  saveUserProfile(updated);
  return updated;
}

/**
 * Reset all user progress.
 * If bound to an account (syncedUserId is set), increments resetEpoch.
 * If guest, keeps resetEpoch = 0.
 */
export function resetProgress(): UserProfile {
  const current = getUserProfile();
  const nextEpoch = current.syncedUserId ? (current.resetEpoch || 0) + 1 : 0;

  const resetProf: UserProfile = {
    ...DEFAULT_USER_PROFILE,
    syncedUserId: current.syncedUserId,
    resetEpoch: nextEpoch,
    updatedAt: new Date().toISOString(),
  };

  saveUserProfile(resetProf, true);
  saveDeckCards([], true);
  setSyncDirty(true);
  notifyMutationListeners();
  return resetProf;
}

/**
 * Clear all local account data upon logout and restore clean guest state.
 */
export function clearAccountLocalData(): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_USER_PROFILE));
  localStorage.setItem(CARDS_STORAGE_KEY, JSON.stringify([]));
  setSyncDirty(false);
}

/**
 * Check whether there are local changes newer than the last successful sync.
 * Relies on explicit dirty flag to eliminate clock skew inaccuracies.
 */
export function hasUnsyncedChanges(): boolean {
  return getSyncDirty();
}

// =============================================================
// SM-2 FLASHCARD DECK STORAGE (nihongo_cards)
// =============================================================

export function getDeckCards(): SM2Card[] {
  if (typeof localStorage === 'undefined') {
    return [];
  }

  try {
    const raw = localStorage.getItem(CARDS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter(
        (c) =>
          c &&
          typeof c.id === 'string' &&
          typeof c.source === 'string' &&
          typeof c.dueDate === 'string'
      )
      .map((c) => ({
        ...c,
        updatedAt: c.updatedAt || LEGACY_TIMESTAMP,
      }));
  } catch (err) {
    console.error('Failed to read SM-2 cards from localStorage:', err);
    return [];
  }
}

export function saveDeckCards(cards: SM2Card[], isSyncWrite: boolean = false): void {
  if (typeof localStorage === 'undefined') return;

  try {
    const now = new Date().toISOString();
    const stamped = cards.map((c) => ({
      ...c,
      updatedAt: isSyncWrite ? (c.updatedAt || LEGACY_TIMESTAMP) : (c.updatedAt || now),
    }));
    localStorage.setItem(CARDS_STORAGE_KEY, JSON.stringify(stamped));
    if (!isSyncWrite) {
      setSyncDirty(true);
      notifyMutationListeners();
    }
  } catch (err) {
    console.error('Failed to save SM-2 cards to localStorage:', err);
  }
}

export function addCardsToDeck(newCards: SM2Card[]): { addedCount: number; totalCount: number } {
  const existing = getDeckCards();
  const existingIds = new Set(existing.map((c) => c.id));
  const now = new Date().toISOString();

  const toAdd = newCards
    .filter((c) => !existingIds.has(c.id))
    .map((c) => ({ ...c, updatedAt: c.updatedAt || now }));

  const merged = [...existing, ...toAdd];
  saveDeckCards(merged);

  return {
    addedCount: toAdd.length,
    totalCount: merged.length,
  };
}

export function addCardToDeck(newCard: SM2Card): boolean {
  const existing = getDeckCards();
  if (existing.some((c) => c.id === newCard.id)) {
    return false;
  }
  const stamped = { ...newCard, updatedAt: newCard.updatedAt || new Date().toISOString() };
  saveDeckCards([...existing, stamped]);
  return true;
}

export function updateCardInDeck(updatedCard: SM2Card): void {
  const existing = getDeckCards();
  const index = existing.findIndex((c) => c.id === updatedCard.id);
  const stamped = { ...updatedCard, updatedAt: new Date().toISOString() };

  if (index !== -1) {
    existing[index] = stamped;
  } else {
    existing.push(stamped);
  }
  saveDeckCards(existing);
}

export function isCardInDeck(compositeId: string): boolean {
  const existing = getDeckCards();
  return existing.some((c) => c.id === compositeId);
}
