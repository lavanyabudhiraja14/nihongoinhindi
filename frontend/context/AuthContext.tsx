'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthUser, UserProfile } from '@/types';
import { apiFetch } from '@/lib/api';
import {
  getUserProfile,
  getDeckCards,
  saveSyncedProfileAndCards,
  clearAccountLocalData,
  hasUnsyncedChanges,
} from '@/lib/storage';
import { syncClient } from '@/lib/sync';

export type AuthStatus = 'loading' | 'guest' | 'authed';

interface PendingMergeState {
  guestCompletionsCount: number;
  resolve: (shouldMerge: boolean) => void;
}

interface AuthContextValue {
  user: AuthUser | null;
  status: AuthStatus;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => Promise<boolean>;
  refreshUser: () => Promise<void>;
  updateProfile: (displayName: string) => Promise<void>;
  uploadAvatar: (file: File) => Promise<string>;
  changeEmail: (newEmail: string, currentPassword: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  deleteAccount: (currentPassword: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<string>;
  resetPassword: (token: string, newPassword: string) => Promise<string>;
  verifyEmail: (token: string) => Promise<{ success: boolean; message: string; user?: AuthUser }>;
  resendVerification: (email?: string) => Promise<string>;
  pendingMerge: PendingMergeState | null;
  cancelPendingMerge: () => void;
  confirmPendingMerge: () => void;
  unsyncedWarningModal: { isOpen: boolean; onConfirm: () => void; onCancel: () => void } | null;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [pendingMerge, setPendingMerge] = useState<PendingMergeState | null>(null);
  const [unsyncedWarningModal, setUnsyncedWarningModal] = useState<{
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
  } | null>(null);

  const fetchRemoteProgressAndSet = useCallback(async (userId: string) => {
    try {
      const res = await apiFetch<{ status: string; profile: UserProfile; cards: any[]; serverSyncedAt: string }>(
        '/api/sync/progress'
      );
      if (res && res.profile) {
        saveSyncedProfileAndCards(res.profile, res.cards || [], userId, res.serverSyncedAt);
      }
    } catch (err) {
      console.error('Failed to fetch remote progress:', err);
    }
  }, []);

  const handlePostAuthSync = useCallback(
    async (authenticatedUser: AuthUser) => {
      const localProfile = getUserProfile();

      // Case A: Local profile already belongs to this exact user
      if (localProfile.syncedUserId === authenticatedUser.id) {
        await syncClient.performSync();
        return;
      }

      // Case B: Local profile belongs to a DIFFERENT previous account -> NEVER merge
      if (localProfile.syncedUserId && localProfile.syncedUserId !== authenticatedUser.id) {
        clearAccountLocalData();
        await fetchRemoteProgressAndSet(authenticatedUser.id);
        return;
      }

      // Case C: Unbound guest data
      const completionsCount =
        localProfile.completedLessons.length +
        localProfile.completedKanaGroups.length +
        (localProfile.completedKanjiGroups || []).length +
        localProfile.completedVocabUnits.length +
        localProfile.completedGrammarPoints.length +
        getDeckCards().length;

      if (completionsCount > 0) {
        // Prompt user with confirmation modal
        const shouldMerge = await new Promise<boolean>((resolve) => {
          setPendingMerge({
            guestCompletionsCount: completionsCount,
            resolve,
          });
        });
        setPendingMerge(null);

        if (shouldMerge) {
          // Merge guest data into account: set epoch-safe and push to server
          const guestProfile: UserProfile = {
            ...localProfile,
            syncedUserId: authenticatedUser.id,
            resetEpoch: 0,
          };
          saveSyncedProfileAndCards(guestProfile, getDeckCards(), authenticatedUser.id);
          await syncClient.performSync();
        } else {
          // Discard guest data and pull remote account data
          clearAccountLocalData();
          await fetchRemoteProgressAndSet(authenticatedUser.id);
        }
      } else {
        // Empty guest data: pull remote account data directly
        await fetchRemoteProgressAndSet(authenticatedUser.id);
      }
    },
    [fetchRemoteProgressAndSet]
  );

  const refreshUser = useCallback(async () => {
    try {
      const res = await apiFetch<AuthUser>('/api/auth/me');
      if (res && res.id) {
        setUser(res);
        setStatus('authed');
        // If local profile is bound to user, perform background sync
        const prof = getUserProfile();
        if (prof.syncedUserId === res.id) {
          syncClient.triggerSync(false);
        }
      } else {
        setUser(null);
        setStatus('guest');
      }
    } catch {
      setUser(null);
      setStatus('guest');
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const res = await apiFetch<AuthUser>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setUser(res);
    setStatus('authed');
    await handlePostAuthSync(res);
  };

  const signup = async (email: string, password: string, displayName?: string) => {
    const res = await apiFetch<AuthUser>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, display_name: displayName || 'शिक्षार्थी' }),
    });
    setUser(res);
    setStatus('authed');
    await handlePostAuthSync(res);
  };

  const performLogoutCleanup = async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // Proceed with local cleanup even if logout endpoint network fails
    }
    clearAccountLocalData();
    setUser(null);
    setStatus('guest');
  };

  const logout = async (): Promise<boolean> => {
    if (typeof window !== 'undefined' && (!navigator.onLine || hasUnsyncedChanges())) {
      // Show confirmation dialog before logging out with unsynced changes
      const proceed = await new Promise<boolean>((resolve) => {
        setUnsyncedWarningModal({
          isOpen: true,
          onConfirm: () => {
            setUnsyncedWarningModal(null);
            resolve(true);
          },
          onCancel: () => {
            setUnsyncedWarningModal(null);
            resolve(false);
          },
        });
      });

      if (!proceed) return false;
    } else {
      // Try final sync before logout if online
      if (navigator.onLine) {
        await syncClient.performSync();
      }
    }

    await performLogoutCleanup();
    return true;
  };

  const updateProfile = useCallback(async (displayName: string) => {
    const res = await apiFetch<AuthUser>('/api/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify({ display_name: displayName }),
    });
    setUser(res);
  }, []);

  const uploadAvatar = useCallback(async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const res = await apiFetch<{ status: string; avatar_url: string }>('/api/auth/avatar', {
      method: 'POST',
      body: formData,
    });
    if (res && res.avatar_url) {
      setUser((prev) => (prev ? { ...prev, avatar_url: res.avatar_url } : null));
    }
    await refreshUser();
    return res.avatar_url;
  }, [refreshUser]);

  const changeEmail = useCallback(async (newEmail: string, currentPassword: string) => {
    const res = await apiFetch<{ status: string; user: AuthUser }>('/api/auth/change-email', {
      method: 'POST',
      body: JSON.stringify({ new_email: newEmail, current_password: currentPassword }),
    });
    if (res && res.user) {
      setUser(res.user);
    }
  }, []);

  const changePassword = useCallback(async (currentPassword: string, newPassword: string) => {
    await apiFetch('/api/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    });
  }, []);

  const deleteAccount = useCallback(async (currentPassword: string) => {
    await apiFetch('/api/auth/account', {
      method: 'DELETE',
      body: JSON.stringify({ current_password: currentPassword }),
    });
    clearAccountLocalData();
    setUser(null);
    setStatus('guest');
  }, []);

  const forgotPassword = useCallback(async (email: string): Promise<string> => {
    const res = await apiFetch<{ status: string; message: string }>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    return res.message || 'यदि यह ईमेल पंजीकृत है, तो पासवर्ड रीसेट लिंक भेज दिया गया है।';
  }, []);

  const resetPassword = useCallback(async (token: string, newPassword: string): Promise<string> => {
    const res = await apiFetch<{ status: string; message: string }>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, new_password: newPassword }),
    });
    return res.message || 'पासवर्ड सफलतापूर्वक रीसेट हो गया है।';
  }, []);

  const verifyEmail = useCallback(async (token: string): Promise<{ success: boolean; message: string; user?: AuthUser }> => {
    const res = await apiFetch<{ status: string; message: string; user?: AuthUser }>('/api/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
    if (res && res.user) {
      setUser(res.user);
    }
    return {
      success: true,
      message: res.message || 'ईमेल सफलतापूर्वक सत्यापित हो गया है!',
      user: res.user,
    };
  }, []);

  const resendVerification = useCallback(async (email?: string): Promise<string> => {
    const res = await apiFetch<{ status: string; message: string }>('/api/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email: email || undefined }),
    });
    return res.message || 'सत्यापन लिंक भेज दिया गया है।';
  }, []);

  const confirmPendingMerge = useCallback(() => {
    if (pendingMerge) pendingMerge.resolve(true);
  }, [pendingMerge]);

  const cancelPendingMerge = useCallback(() => {
    if (pendingMerge) pendingMerge.resolve(false);
  }, [pendingMerge]);

  return (
    <AuthContext.Provider
      value={{
        user,
        status,
        login,
        signup,
        logout,
        refreshUser,
        updateProfile,
        uploadAvatar,
        changeEmail,
        changePassword,
        deleteAccount,
        forgotPassword,
        resetPassword,
        verifyEmail,
        resendVerification,
        pendingMerge,
        confirmPendingMerge,
        cancelPendingMerge,
        unsyncedWarningModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
