import { UserProfile } from '@/types';
import { SM2Card } from '@/lib/sm2';
import {
  getUserProfile,
  getDeckCards,
  saveSyncedProfileAndCards,
  hasUnsyncedChanges,
  onStorageMutation,
} from '@/lib/storage';
import { apiFetch } from '@/lib/api';
import { logErrorInDev } from '@/lib/error-handler';

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error';

interface SyncResponse {
  status: string;
  profile: UserProfile;
  cards: SM2Card[];
  serverSyncedAt: string;
}

type SyncStatusListener = (status: SyncStatus) => void;

export class SyncManager {
  private status: SyncStatus = 'synced';
  private listeners: Set<SyncStatusListener> = new Set();
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private isSyncing = false;
  private retryCount = 0;
  private maxRetries = 3;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.setStatus('synced');
        this.triggerSync(true);
      });
      window.addEventListener('offline', () => {
        this.setStatus('offline');
      });
    }

    onStorageMutation(() => {
      const profile = getUserProfile();
      if (profile.syncedUserId && hasUnsyncedChanges()) {
        this.triggerSync(false);
      }
    });
  }

  public getRetryCount(): number {
    return this.retryCount;
  }

  public resetRetryCount(): void {
    this.retryCount = 0;
  }

  public isSyncInProgress(): boolean {
    return this.isSyncing;
  }

  public getStatus(): SyncStatus {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      return 'offline';
    }
    return this.status;
  }

  public subscribe(listener: SyncStatusListener): () => void {
    this.listeners.add(listener);
    listener(this.getStatus());
    return () => this.listeners.delete(listener);
  }

  private setStatus(newStatus: SyncStatus) {
    this.status = newStatus;
    this.listeners.forEach((fn) => fn(newStatus));
  }

  /**
   * Schedule a debounced background sync.
   */
  public triggerSync(immediate = false, debounceMs = 1500) {
    if (typeof localStorage === 'undefined') return;

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    if (immediate) {
      this.performSync();
    } else {
      this.debounceTimer = setTimeout(() => {
        this.performSync();
      }, debounceMs);
    }
  }

  /**
   * Perform direct sync with the backend.
   */
  public async performSync(): Promise<boolean> {
    if (typeof localStorage === 'undefined') return false;

    const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    if (!isOnline) {
      this.setStatus('offline');
      return false;
    }

    const currentProfile = getUserProfile();
    // Only sync if user is bound to an account
    if (!currentProfile.syncedUserId) {
      this.setStatus('synced');
      return true;
    }

    if (this.isSyncing) return false;
    this.isSyncing = true;
    this.setStatus('syncing');

    try {
      const cards = getDeckCards();

      const payload = {
        profile: {
          dailyGoalMinutes: currentProfile.dailyGoalMinutes,
          streakDays: currentProfile.streakDays,
          longestStreakDays: currentProfile.longestStreakDays,
          completedLessons: currentProfile.completedLessons,
          completedKanaGroups: currentProfile.completedKanaGroups,
          completedKanjiGroups: currentProfile.completedKanjiGroups || [],
          completedVocabUnits: currentProfile.completedVocabUnits,
          completedGrammarPoints: currentProfile.completedGrammarPoints,
          bookmarkedItems: currentProfile.bookmarkedItems,
          lastActiveDate: currentProfile.lastActiveDate,
          onboarded: currentProfile.onboarded,
          resetEpoch: currentProfile.resetEpoch || 0,
          updatedAt: currentProfile.updatedAt,
        },
        cards: cards.map((c) => ({
          id: c.id,
          source: c.source,
          rawId: c.rawId,
          repetitions: c.repetitions,
          easeFactor: c.easeFactor,
          intervalDays: c.intervalDays,
          dueDate: c.dueDate,
          lastReviewed: c.lastReviewed || null,
          updatedAt: c.updatedAt || null,
        })),
      };

      const res = await apiFetch<SyncResponse>('/api/sync/progress', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      if (res && res.profile) {
        saveSyncedProfileAndCards(
          res.profile,
          res.cards || [],
          currentProfile.syncedUserId,
          res.serverSyncedAt
        );
      }

      this.retryCount = 0;
      this.setStatus('synced');
      this.isSyncing = false;
      return true;
    } catch (err) {
      logErrorInDev('SyncManager:performSync', err);
      this.isSyncing = false;
      this.setStatus('error');

      // Retry with exponential backoff if below max retries
      if (this.retryCount < this.maxRetries) {
        this.retryCount++;
        const backoffMs = Math.pow(2, this.retryCount) * 1000;
        setTimeout(() => this.triggerSync(true), backoffMs);
      }

      return false;
    }
  }
}

export const syncClient = new SyncManager();
