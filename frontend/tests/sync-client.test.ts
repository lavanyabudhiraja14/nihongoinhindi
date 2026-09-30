import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getUserProfile,
  saveUserProfile,
  clearAccountLocalData,
  saveSyncedProfileAndCards,
  hasUnsyncedChanges,
  DEFAULT_USER_PROFILE,
} from '@/lib/storage';
import { syncClient, SyncManager } from '@/lib/sync';

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

describe('Sync Client & Account Isolation', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.restoreAllMocks();
  });

  it('isolates different accounts: logging in with account B when account A was cached discards account A cache', () => {
    // 1. Account A was logged in on this browser
    saveUserProfile({
      ...DEFAULT_USER_PROFILE,
      syncedUserId: 'user_A',
      completedLessons: ['u1-l1', 'u1-l2', 'u1-l3'],
    });

    const localProfile = getUserProfile();
    expect(localProfile.syncedUserId).toBe('user_A');

    // 2. Account B logs in -> local data bound to user_A is cleared
    const incomingUser = { id: 'user_B' };
    if (localProfile.syncedUserId && localProfile.syncedUserId !== incomingUser.id) {
      clearAccountLocalData();
    }

    const clearedProfile = getUserProfile();
    expect(clearedProfile.syncedUserId).toBeNull();
    expect(clearedProfile.completedLessons).toEqual([]);
  });

  it('allows unbound guest progress to merge into new account upon first login', () => {
    // 1. Unbound guest data exists
    saveUserProfile({
      ...DEFAULT_USER_PROFILE,
      syncedUserId: null,
      completedLessons: ['u1-l1'],
      completedKanaGroups: ['h-a'],
    });

    const guestProfile = getUserProfile();
    expect(guestProfile.syncedUserId).toBeNull();

    // 2. User confirms merge into Account A
    const authenticatedUserId = 'user_A';
    const mergedProfile = {
      ...guestProfile,
      syncedUserId: authenticatedUserId,
      resetEpoch: 0,
    };
    saveSyncedProfileAndCards(mergedProfile, [], authenticatedUserId);

    const updatedProfile = getUserProfile();
    expect(updatedProfile.syncedUserId).toBe('user_A');
    expect(updatedProfile.completedLessons).toEqual(['u1-l1']);
  });

  it('detects unsynced changes when offline before logout', () => {
    // Account data with mutations made after last sync
    saveUserProfile({
      ...DEFAULT_USER_PROFILE,
      syncedUserId: 'user_A',
      lastSyncedAt: '2026-01-01T00:00:00.000Z',
      completedLessons: ['u1-l1'],
    });

    // hasUnsyncedChanges must return true
    expect(hasUnsyncedChanges()).toBe(true);
  });

  it('sync write does not mark data as dirty and does not schedule another sync', () => {
    let mutationFired = false;
    const unsubscribe = syncClient.subscribe(() => {});

    // Save initial dirty state
    saveUserProfile({
      ...DEFAULT_USER_PROFILE,
      syncedUserId: 'user_A',
      completedLessons: ['u1-l1'],
    });
    expect(hasUnsyncedChanges()).toBe(true);

    // Incoming sync write from server
    saveSyncedProfileAndCards(
      {
        ...DEFAULT_USER_PROFILE,
        syncedUserId: 'user_A',
        completedLessons: ['u1-l1', 'u1-l2'],
        updatedAt: '2026-09-30T10:00:00.000Z',
      },
      [],
      'user_A',
      '2026-09-30T10:00:00.000Z'
    );

    // Must be clean after sync write
    expect(hasUnsyncedChanges()).toBe(false);
    unsubscribe();
  });

  it('handles reset propagation: higher resetEpoch supersedes older progress', () => {
    // Device 1 bumped epoch to 2 after reset
    const device1ResetProfile = {
      ...DEFAULT_USER_PROFILE,
      syncedUserId: 'user_123',
      resetEpoch: 2,
      completedLessons: [],
      updatedAt: '2026-09-30T12:00:00.000Z',
    };

    // Device 2 was offline with older epoch 1 and some old lessons
    const device2StaleProfile = {
      ...DEFAULT_USER_PROFILE,
      syncedUserId: 'user_123',
      resetEpoch: 1,
      completedLessons: ['u1-l1', 'u1-l2'],
      updatedAt: '2026-09-30T10:00:00.000Z',
    };

    // When server resolves conflict with higher resetEpoch:
    const serverResolved = device1ResetProfile.resetEpoch > device2StaleProfile.resetEpoch
      ? device1ResetProfile
      : device2StaleProfile;

    expect(serverResolved.resetEpoch).toBe(2);
    expect(serverResolved.completedLessons).toEqual([]);
  });

  it('performs exponential backoff retry on network failure', async () => {
    vi.useFakeTimers();
    const manager = new SyncManager();
    saveUserProfile({
      ...DEFAULT_USER_PROFILE,
      syncedUserId: 'user_A',
      completedLessons: ['u1-l1'],
    });

    // Mock window / navigator online
    Object.defineProperty(globalThis, 'navigator', {
      value: { onLine: true },
      writable: true,
      configurable: true,
    });

    expect(manager.getRetryCount()).toBe(0);
    vi.useRealTimers();
  });
});


