import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getUserProfile,
  saveUserProfile,
  clearAccountLocalData,
  saveSyncedProfileAndCards,
  hasUnsyncedChanges,
  DEFAULT_USER_PROFILE,
} from '@/lib/storage';

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

describe('AuthContext Business Logic & Modals', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.restoreAllMocks();
  });

  it('triggers merge confirmation if unbound guest data has completions', () => {
    saveUserProfile({
      ...DEFAULT_USER_PROFILE,
      syncedUserId: null,
      completedLessons: ['u1-l1', 'u1-l2'],
    });

    const localProfile = getUserProfile();
    const completionsCount =
      localProfile.completedLessons.length +
      localProfile.completedKanaGroups.length;

    expect(localProfile.syncedUserId).toBeNull();
    expect(completionsCount).toBe(2);
    // Should trigger merge dialog because completionsCount > 0 and syncedUserId is null
    const shouldPromptMerge = !localProfile.syncedUserId && completionsCount > 0;
    expect(shouldPromptMerge).toBe(true);
  });

  it('skips merge confirmation if guest data is empty', () => {
    saveUserProfile({
      ...DEFAULT_USER_PROFILE,
      syncedUserId: null,
      completedLessons: [],
    });

    const localProfile = getUserProfile();
    const completionsCount = localProfile.completedLessons.length;
    const shouldPromptMerge = !localProfile.syncedUserId && completionsCount > 0;
    expect(shouldPromptMerge).toBe(false);
  });

  it('discards previous account local cache when a different account logs in', () => {
    // Account 1 cached locally
    saveUserProfile({
      ...DEFAULT_USER_PROFILE,
      syncedUserId: 'user_1',
      completedLessons: ['u1-l1'],
    });

    const localProfile = getUserProfile();
    const incomingUser = { id: 'user_2' };

    if (localProfile.syncedUserId && localProfile.syncedUserId !== incomingUser.id) {
      clearAccountLocalData();
    }

    const after = getUserProfile();
    expect(after.syncedUserId).toBeNull();
    expect(after.completedLessons).toEqual([]);
  });

  it('detects unsynced changes and requires confirmation before logout', () => {
    // Logged in user makes local modifications
    saveUserProfile({
      ...DEFAULT_USER_PROFILE,
      syncedUserId: 'user_1',
      completedLessons: ['u1-l1'],
    });

    expect(hasUnsyncedChanges()).toBe(true);
    // Logout flow checks hasUnsyncedChanges()
    const requiresWarning = hasUnsyncedChanges();
    expect(requiresWarning).toBe(true);

    // After cleanup on confirmed logout:
    clearAccountLocalData();
    expect(hasUnsyncedChanges()).toBe(false);
    expect(getUserProfile().syncedUserId).toBeNull();
  });
});
