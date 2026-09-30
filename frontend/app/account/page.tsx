'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getUserProfile, getDeckCards } from '@/lib/storage';
import { UserProfile } from '@/types';
import { SM2Card } from '@/lib/sm2';
import { syncClient, SyncStatus } from '@/lib/sync';
import { getAuthErrorMessage } from '@/lib/error-handler';

export default function AccountPage() {
  const router = useRouter();
  const {
    user,
    status,
    logout,
    updateProfile,
    uploadAvatar,
    changeEmail,
    changePassword,
    deleteAccount,
    resendVerification,
  } = useAuth();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [deckCards, setDeckCards] = useState<SM2Card[]>([]);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced');

  // Edit Name state
  const [isEditingName, setIsEditingName] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [nameError, setNameError] = useState('');
  const [nameSaving, setNameSaving] = useState(false);

  // Avatar Upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState('');

  // Change Email state
  const [newEmail, setNewEmail] = useState('');
  const [emailPassword, setEmailPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [emailSuccess, setEmailSuccess] = useState('');
  const [emailSaving, setEmailSaving] = useState(false);
  const [verificationSending, setVerificationSending] = useState(false);
  const [verificationFeedback, setVerificationFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Delete Account modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleteDeleting, setDeleteDeleting] = useState(false);

  // Protect route: redirect guest to login
  useEffect(() => {
    if (status === 'guest') {
      router.push('/login');
    }
  }, [status, router]);

  // Load local data and subscribe to sync status
  useEffect(() => {
    setProfile(getUserProfile());
    setDeckCards(getDeckCards());
    if (user?.display_name) {
      setDisplayName(user.display_name);
    }
    const unsubscribe = syncClient.subscribe((s) => setSyncStatus(s));
    return () => unsubscribe();
  }, [user]);

  if (status === 'loading' || !user) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-[#5B6070] font-hindi text-[15px]">खाता जानकारी लोड हो रही है...</div>
      </div>
    );
  }

  // Handle display name save
  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameError('');
    const trimmed = displayName.trim();
    if (!trimmed) {
      setNameError('नाम खाली नहीं हो सकता।');
      return;
    }
    if (trimmed.length > 40) {
      setNameError('नाम ४० अक्षरों से अधिक नहीं हो सकता।');
      return;
    }

    setNameSaving(true);
    try {
      await updateProfile(trimmed);
      setIsEditingName(false);
    } catch (err: unknown) {
      setNameError(getAuthErrorMessage(err, 'AccountPage:UpdateProfile'));
    } finally {
      setNameSaving(false);
    }
  };

  // Handle Avatar file selection
  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setAvatarError('');
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validation: format & 2MB max
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setAvatarError('केवल PNG, JPG, या WebP चित्र की अनुमति है।');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setAvatarError('चित्र का आकार २ MB से कम होना चाहिए।');
      return;
    }

    setAvatarUploading(true);
    try {
      await uploadAvatar(file);
    } catch (err: unknown) {
      setAvatarError(getAuthErrorMessage(err, 'AccountPage:UploadAvatar'));
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Handle Email change
  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError('');
    setEmailSuccess('');

    if (!newEmail.trim() || !emailPassword) {
      setEmailError('कृपया नया ईमेल और वर्तमान पासवर्ड दर्ज करें।');
      return;
    }

    setEmailSaving(true);
    try {
      await changeEmail(newEmail.trim(), emailPassword);
      setEmailSuccess('ईमेल सफलतापूर्वक अपडेट कर दिया गया। कृपया नए पते पर भेजे गए लिंक से इसे सत्यापित करें।');
      setNewEmail('');
      setEmailPassword('');
    } catch (err: unknown) {
      setEmailError(getAuthErrorMessage(err, 'AccountPage:ChangeEmail'));
    } finally {
      setEmailSaving(false);
    }
  };

  // Handle Send Verification Link from Account Page
  const handleSendVerificationFromAccount = async () => {
    setVerificationFeedback(null);
    setVerificationSending(true);
    try {
      const msg = await resendVerification(user.email);
      setVerificationFeedback({ type: 'success', text: msg || 'सत्यापन लिंक आपके ईमेल पर भेज दिया गया है।' });
    } catch (err: unknown) {
      const msg = getAuthErrorMessage(err, 'AccountPage:SendVerification');
      setVerificationFeedback({ type: 'error', text: msg });
    } finally {
      setVerificationSending(false);
    }
  };

  // Handle Password change
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('कृपया सभी पासवर्ड फ़ील्ड भरें।');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('नया पासवर्ड कम से कम ८ अक्षरों का होना चाहिए।');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('नए पासवर्ड मेल नहीं खाते।');
      return;
    }

    setPasswordSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordSuccess('पासवर्ड सफलतापूर्वक बदल दिया गया। अन्य सभी सत्र समाप्त कर दिए गए हैं।');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      setPasswordError(getAuthErrorMessage(err, 'AccountPage:ChangePassword'));
    } finally {
      setPasswordSaving(false);
    }
  };

  // Export Learning Data as JSON
  const handleExportData = () => {
    const data = {
      user: {
        id: user.id,
        email: user.email,
        display_name: user.display_name,
        created_at: user.created_at,
      },
      profile: profile || getUserProfile(),
      deckCards: deckCards,
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nihongo_backup_${user.email}_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Handle Delete Account
  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setDeleteError('');

    if (deleteConfirmText.trim() !== 'खाता हटाएं') {
      setDeleteError('कृपया पुष्टि के लिए "खाता हटाएं" सही रूप में लिखें।');
      return;
    }

    if (!deletePassword) {
      setDeleteError('कृपया अपना वर्तमान पासवर्ड दर्ज करें।');
      return;
    }

    setDeleteDeleting(true);
    try {
      await deleteAccount(deletePassword);
      router.push('/signup');
    } catch (err: unknown) {
      setDeleteError(getAuthErrorMessage(err, 'AccountPage:DeleteAccount'));
    } finally {
      setDeleteDeleting(false);
    }
  };

  // Metrics calculation from 100% real data
  const completedLessonsCount = profile?.completedLessons?.length || 0;
  const completedKanaCount = profile?.completedKanaGroups?.length || 0;
  const completedKanjiCount = (profile?.completedKanjiGroups || []).length;
  const completedVocabCount = profile?.completedVocabUnits?.length || 0;
  const completedGrammarCount = profile?.completedGrammarPoints?.length || 0;
  const streakDays = profile?.streakDays || 1;
  const longestStreakDays = profile?.longestStreakDays || 1;
  const totalDeckCount = deckCards.length;

  const memberSinceFormatted = user.created_at
    ? new Date(user.created_at).toLocaleDateString('hi-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <div className="space-y-6 max-w-[800px] mx-auto pb-12">
      {/* Header & Sync Status Pill */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-[#E8E8EC]">
        <div>
          <h1 className="text-[28px] font-semibold text-[#0D1B4B] font-hindi leading-tight">
            खाता और सेटिंग्स
          </h1>
          <p className="text-[13px] text-[#5B6070] mt-0.5">
            Account Management & Learning Record
          </p>
        </div>

        {/* Sync Status Badge */}
        <div className="flex items-center gap-2">
          {syncStatus === 'synced' && (
            <div className="glass-pill-green font-hindi text-[13px] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#138808]" />
              क्लाउड से सिंक्ड
            </div>
          )}
          {syncStatus === 'syncing' && (
            <div className="glass-pill-saffron font-hindi text-[13px] text-[#B45309] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#FF9933] animate-pulse" />
              सिंक हो रहा है...
            </div>
          )}
          {syncStatus === 'offline' && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[8px] bg-[#F4F4F6] border border-[#E8E8EC] text-[#5B6070] text-[13px] font-hindi">
              <span className="w-2 h-2 rounded-full bg-[#5B6070]" />
              ऑफ़लाइन मोड (स्थानीय सुरक्षित)
            </div>
          )}
          {syncStatus === 'error' && (
            <div className="glass-pill-red font-hindi text-[13px] flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#BC2025]" />
              सिंक में रुकावट
            </div>
          )}
        </div>
      </div>

      {/* ── CARD 1: Profile Details ───────────────────────────── */}
      <div className="bg-white rounded-[12px] border border-[#E8E8EC] p-6 shadow-xs space-y-5">
        <div className="border-b border-[#E8E8EC] pb-3">
          <h2 className="text-[20px] font-semibold text-[#0D1B4B] font-hindi leading-tight">
            प्रोफ़ाइल विवरण
          </h2>
          <p className="text-[13px] text-[#5B6070]">Profile Details</p>
        </div>

        {avatarError && (
          <div className="p-3 rounded-[8px] bg-red-50 border border-red-200 text-[#BC2025] text-[13px] font-hindi">
            {avatarError}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar Display */}
          <div className="relative group">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.display_name}
                className="w-20 h-20 rounded-full object-cover border-2 border-[#E8E8EC]"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FF9933] to-[#BC2025] flex items-center justify-center text-white text-2xl font-bold font-hindi shadow-xs">
                {user.display_name?.charAt(0) || 'अ'}
              </div>
            )}

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleAvatarSelect}
              className="hidden"
            />
          </div>

          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarUploading}
                className="py-1.5 px-3 rounded-[8px] bg-[#F4F4F6] hover:bg-[#E8E8EC] text-[#0D1B4B] text-[13px] font-semibold font-hindi transition cursor-pointer border border-[#E8E8EC]"
              >
                {avatarUploading ? 'अपलोड हो रहा है...' : 'चित्र बदलें (Change Avatar)'}
              </button>
            </div>
            <p className="text-[11px] text-[#5B6070]">
              PNG, JPG, या WebP प्रारूप, अधिकतम २ MB।
            </p>
          </div>
        </div>

        {/* Display Name Edit Form */}
        <div className="grid sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-[13px] font-medium text-[#0D1B4B] font-hindi mb-1">
              प्रदर्शित नाम <span className="text-[#5B6070] font-normal">/ Display Name</span>
            </label>
            {isEditingName ? (
              <form onSubmit={handleSaveName} className="space-y-2">
                <input
                  type="text"
                  maxLength={40}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-3 py-2 rounded-[8px] border border-[#E8E8EC] text-[15px] text-[#0D1B4B] focus:outline-none focus:border-[#0D1B4B]"
                />
                {nameError && (
                  <p className="text-[11px] text-[#BC2025] font-hindi">{nameError}</p>
                )}
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={nameSaving}
                    className="py-1.5 px-3 rounded-[8px] bg-[#BC2025] hover:bg-[#8B1519] text-white text-[13px] font-semibold font-hindi transition"
                  >
                    {nameSaving ? 'सहेज रहे हैं...' : 'सहेजें (Save)'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingName(false);
                      setDisplayName(user.display_name);
                    }}
                    className="py-1.5 px-3 rounded-[8px] bg-[#F4F4F6] text-[#5B6070] text-[13px] font-hindi"
                  >
                    रद्द करें
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-center justify-between p-2.5 rounded-[8px] bg-[#F4F4F6] border border-[#E8E8EC]">
                <span className="text-[15px] font-semibold text-[#0D1B4B] font-hindi">
                  {user.display_name}
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditingName(true)}
                  className="text-[13px] text-[#BC2025] font-semibold font-hindi hover:underline cursor-pointer"
                >
                  संपादित करें
                </button>
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[13px] font-medium text-[#0D1B4B] font-hindi">
                ईमेल <span className="text-[#5B6070] font-normal">/ Email Address</span>
              </label>
              {user.is_verified ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-600" />
                  सत्यापित (Verified)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  असत्यापित (Unverified)
                </span>
              )}
            </div>
            <div className="p-2.5 rounded-[8px] bg-[#F4F4F6] border border-[#E8E8EC] text-[15px] text-[#0D1B4B]/80 font-mono select-all">
              {user.email}
            </div>

            {!user.is_verified && (
              <div className="mt-2.5 p-2.5 rounded-[8px] bg-amber-50/80 border border-amber-200/90 text-[#78350F] space-y-1.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[12px] font-hindi">
                  <span>खाते की सुरक्षा के लिए कृपया ईमेल सत्यापित करें।</span>
                  <button
                    type="button"
                    onClick={handleSendVerificationFromAccount}
                    disabled={verificationSending}
                    className="text-[#BC2025] hover:underline font-semibold cursor-pointer text-left sm:text-right"
                  >
                    {verificationSending ? 'भेजा जा रहा है...' : 'सत्यापन लिंक भेजें / Send Link'}
                  </button>
                </div>
                {verificationFeedback && (
                  <p
                    className={`text-[11px] font-hindi ${
                      verificationFeedback.type === 'success' ? 'text-green-700 font-medium' : 'text-[#BC2025]'
                    }`}
                  >
                    {verificationFeedback.text}
                  </p>
                )}
              </div>
            )}

            <p className="text-[11px] text-[#5B6070] mt-1.5 font-hindi">
              सदस्यता प्रारंभ: {memberSinceFormatted}
            </p>
          </div>
        </div>
      </div>

      {/* ── CARD 2: Learning So Far (Real Data Only) ─────────────── */}
      <div className="bg-white rounded-[12px] border border-[#E8E8EC] p-6 shadow-xs space-y-5">
        <div className="border-b border-[#E8E8EC] pb-3">
          <h2 className="text-[20px] font-semibold text-[#0D1B4B] font-hindi leading-tight">
            सीखने का रिकॉर्ड
          </h2>
          <p className="text-[13px] text-[#5B6070]">Learning Done So Far (100% Real Progress)</p>
        </div>

        {/* Real Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-[8px] bg-[#F4F4F6] border border-[#E8E8EC]">
            <div className="text-[13px] text-[#5B6070] font-hindi">पूर्ण पाठ</div>
            <div className="text-[20px] font-semibold text-[#0D1B4B] font-mono mt-0.5">
              {completedLessonsCount}
            </div>
            <div className="text-[11px] text-[#5B6070]">Lessons Done</div>
          </div>

          <div className="p-3.5 rounded-[8px] bg-[#F4F4F6] border border-[#E8E8EC]">
            <div className="text-[13px] text-[#5B6070] font-hindi">काना पंक्तियां</div>
            <div className="text-[20px] font-semibold text-[#0D1B4B] font-mono mt-0.5">
              {completedKanaCount} <span className="text-[13px] text-[#5B6070] font-normal">/ 10</span>
            </div>
            <div className="text-[11px] text-[#5B6070]">Kana Groups</div>
          </div>

          <div className="p-3.5 rounded-[8px] bg-[#F4F4F6] border border-[#E8E8EC]">
            <div className="text-[13px] text-[#5B6070] font-hindi">शब्दावली इकाइयां</div>
            <div className="text-[20px] font-semibold text-[#0D1B4B] font-mono mt-0.5">
              {completedVocabCount} <span className="text-[13px] text-[#5B6070] font-normal">/ 20</span>
            </div>
            <div className="text-[11px] text-[#5B6070]">Vocab Units</div>
          </div>

          <div className="p-3.5 rounded-[8px] bg-[#F4F4F6] border border-[#E8E8EC]">
            <div className="text-[13px] text-[#5B6070] font-hindi">कांजी समूह</div>
            <div className="text-[20px] font-semibold text-[#0D1B4B] font-mono mt-0.5">
              {completedKanjiCount} <span className="text-[13px] text-[#5B6070] font-normal">/ 5</span>
            </div>
            <div className="text-[11px] text-[#5B6070]">Kanji Groups</div>
          </div>

          <div className="p-3.5 rounded-[8px] bg-[#F4F4F6] border border-[#E8E8EC]">
            <div className="text-[13px] text-[#5B6070] font-hindi">व्याकरण बिंदु</div>
            <div className="text-[20px] font-semibold text-[#0D1B4B] font-mono mt-0.5">
              {completedGrammarCount} <span className="text-[13px] text-[#5B6070] font-normal">/ 25</span>
            </div>
            <div className="text-[11px] text-[#5B6070]">Grammar Points</div>
          </div>

          <div className="p-3.5 rounded-[8px] bg-[#F4F4F6] border border-[#E8E8EC]">
            <div className="text-[13px] text-[#5B6070] font-hindi">समीक्षा डेक कार्ड</div>
            <div className="text-[20px] font-semibold text-[#138808] font-mono mt-0.5">
              {totalDeckCount}
            </div>
            <div className="text-[11px] text-[#5B6070]">Flashcards in Deck</div>
          </div>

          <div className="p-3.5 rounded-[8px] bg-[#F4F4F6] border border-[#E8E8EC]">
            <div className="text-[13px] text-[#5B6070] font-hindi">वर्तमान स्ट्रीक</div>
            <div className="text-[20px] font-semibold text-[#FF9933] font-mono mt-0.5">
              {streakDays} <span className="text-[13px] font-hindi font-normal">दिन</span>
            </div>
            <div className="text-[11px] text-[#5B6070]">Current Streak</div>
          </div>

          <div className="p-3.5 rounded-[8px] bg-[#F4F4F6] border border-[#E8E8EC]">
            <div className="text-[13px] text-[#5B6070] font-hindi">सर्वश्रेष्ठ स्ट्रीक</div>
            <div className="text-[20px] font-semibold text-[#0D1B4B] font-mono mt-0.5">
              {longestStreakDays} <span className="text-[13px] font-hindi font-normal">दिन</span>
            </div>
            <div className="text-[11px] text-[#5B6070]">Longest Streak</div>
          </div>
        </div>

        {/* Recent Completed Items */}
        <div className="space-y-2 pt-2">
          <h3 className="text-[16px] font-semibold text-[#0D1B4B] font-hindi">
            हाल ही में सीखे गए विषय
          </h3>
          {completedLessonsCount === 0 && completedKanaCount === 0 && completedVocabCount === 0 ? (
            <p className="text-[13px] text-[#5B6070] font-hindi">
              अभी कोई पाठ पूरा नहीं हुआ है। पाठ्यक्रम से सीखना शुरू करें!
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {profile?.completedKanaGroups?.slice(-5).map((id) => (
                <span
                  key={id}
                  className="px-2.5 py-1 rounded-[6px] bg-stone-100 text-[#0D1B4B] text-[13px] font-mono border border-[#E8E8EC]"
                >
                  काना: {id}
                </span>
              ))}
              {profile?.completedVocabUnits?.slice(-5).map((id) => (
                <span
                  key={id}
                  className="px-2.5 py-1 rounded-[6px] bg-stone-100 text-[#0D1B4B] text-[13px] font-mono border border-[#E8E8EC]"
                >
                  शब्दावली: {id}
                </span>
              ))}
              {profile?.completedLessons?.slice(-5).map((id) => (
                <span
                  key={id}
                  className="px-2.5 py-1 rounded-[6px] bg-stone-100 text-[#0D1B4B] text-[13px] font-mono border border-[#E8E8EC]"
                >
                  पाठ: {id}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── CARD 3: Security Settings ─────────────────────────── */}
      <div className="bg-white rounded-[12px] border border-[#E8E8EC] p-6 shadow-xs space-y-6">
        <div className="border-b border-[#E8E8EC] pb-3">
          <h2 className="text-[20px] font-semibold text-[#0D1B4B] font-hindi leading-tight">
            सुरक्षा सेटिंग्स
          </h2>
          <p className="text-[13px] text-[#5B6070]">Security & Credentials</p>
        </div>

        {/* Change Email Form */}
        <div className="space-y-3 pb-6 border-b border-[#E8E8EC]">
          <h3 className="text-[16px] font-semibold text-[#0D1B4B] font-hindi">
            ईमेल बदलें <span className="text-[13px] text-[#5B6070] font-normal">/ Change Email</span>
          </h3>

          {emailError && (
            <div className="p-3 rounded-[8px] bg-red-50 border border-red-200 text-[#BC2025] text-[13px] font-hindi">
              {emailError}
            </div>
          )}
          {emailSuccess && (
            <div className="p-3 rounded-[8px] bg-green-50 border border-green-200 text-[#138808] text-[13px] font-hindi">
              {emailSuccess}
            </div>
          )}

          <form onSubmit={handleChangeEmail} className="grid sm:grid-cols-2 gap-3">
            <div>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="नया ईमेल पता / New Email"
                className="w-full px-3.5 py-2.5 rounded-[8px] border border-[#E8E8EC] text-[15px] focus:outline-none focus:border-[#0D1B4B]"
              />
            </div>
            <div>
              <input
                type="password"
                required
                value={emailPassword}
                onChange={(e) => setEmailPassword(e.target.value)}
                placeholder="वर्तमान पासवर्ड / Current Password"
                className="w-full px-3.5 py-2.5 rounded-[8px] border border-[#E8E8EC] text-[15px] focus:outline-none focus:border-[#0D1B4B]"
              />
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={emailSaving}
                className="py-2 px-4 rounded-[8px] bg-[#0D1B4B] hover:bg-[#081232] text-white text-[13px] font-semibold font-hindi transition cursor-pointer"
              >
                {emailSaving ? 'अपडेट हो रहा है...' : 'ईमेल अपडेट करें'}
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="space-y-3">
          <h3 className="text-[16px] font-semibold text-[#0D1B4B] font-hindi">
            पासवर्ड बदलें <span className="text-[13px] text-[#5B6070] font-normal">/ Change Password</span>
          </h3>

          {passwordError && (
            <div className="p-3 rounded-[8px] bg-red-50 border border-red-200 text-[#BC2025] text-[13px] font-hindi">
              {passwordError}
            </div>
          )}
          {passwordSuccess && (
            <div className="p-3 rounded-[8px] bg-green-50 border border-green-200 text-[#138808] text-[13px] font-hindi">
              {passwordSuccess}
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-3">
            <div>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="वर्तमान पासवर्ड / Current Password"
                className="w-full max-w-[400px] px-3.5 py-2.5 rounded-[8px] border border-[#E8E8EC] text-[15px] focus:outline-none focus:border-[#0D1B4B]"
              />
            </div>
            <div className="grid sm:grid-cols-2 gap-3 max-w-[600px]">
              <input
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="नया पासवर्ड (न्यूनतम ८ अक्षर)"
                className="w-full px-3.5 py-2.5 rounded-[8px] border border-[#E8E8EC] text-[15px] focus:outline-none focus:border-[#0D1B4B]"
              />
              <input
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="नया पासवर्ड पुनः लिखें"
                className="w-full px-3.5 py-2.5 rounded-[8px] border border-[#E8E8EC] text-[15px] focus:outline-none focus:border-[#0D1B4B]"
              />
            </div>
            <div>
              <button
                type="submit"
                disabled={passwordSaving}
                className="py-2 px-4 rounded-[8px] bg-[#0D1B4B] hover:bg-[#081232] text-white text-[13px] font-semibold font-hindi transition cursor-pointer"
              >
                {passwordSaving ? 'सहेज रहे हैं...' : 'पासवर्ड अपडेट करें'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ── CARD 4: Data & Account Danger Zone ─────────────────── */}
      <div className="bg-white rounded-[12px] border border-[#E8E8EC] p-6 shadow-xs space-y-6">
        <div className="border-b border-[#E8E8EC] pb-3">
          <h2 className="text-[20px] font-semibold text-[#0D1B4B] font-hindi leading-tight">
            डेटा और सत्र
          </h2>
          <p className="text-[13px] text-[#5B6070]">Data Export & Account Actions</p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-[16px] font-semibold text-[#0D1B4B] font-hindi">
              सीखने का डेटा डाउनलोड करें
            </h3>
            <p className="text-[13px] text-[#5B6070]">
              Export all your progress, flashcards, and settings as JSON
            </p>
          </div>
          <button
            type="button"
            onClick={handleExportData}
            className="py-2.5 px-4 rounded-[8px] bg-[#F4F4F6] hover:bg-[#E8E8EC] text-[#0D1B4B] text-[13px] font-semibold font-hindi transition cursor-pointer border border-[#E8E8EC]"
          >
            डेटा निर्यात करें (JSON)
          </button>
        </div>

        <div className="pt-4 border-t border-[#E8E8EC] flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-[16px] font-semibold text-[#0D1B4B] font-hindi">
              लॉग आउट करें
            </h3>
            <p className="text-[13px] text-[#5B6070]">
              Sign out from this browser session
            </p>
          </div>
          <button
            type="button"
            onClick={() => logout()}
            className="py-2.5 px-4 rounded-[8px] bg-[#F4F4F6] hover:bg-stone-200 text-[#0D1B4B] text-[13px] font-semibold font-hindi transition cursor-pointer"
          >
            लॉग आउट (Log Out)
          </button>
        </div>

        {/* Danger Zone: Delete Account */}
        <div className="pt-4 border-t border-red-100 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-[16px] font-semibold text-[#BC2025] font-hindi">
              खाता हमेशा के लिए हटाएं
            </h3>
            <p className="text-[13px] text-[#5B6070]">
              Permanently delete your account and all associated cloud data
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowDeleteModal(true)}
            className="py-2 px-4 rounded-[8px] bg-red-50 hover:bg-red-100 text-[#BC2025] text-[13px] font-semibold font-hindi transition cursor-pointer border border-red-200"
          >
            खाता हटाएं (Delete Account)
          </button>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-[12px] border border-[#E8E8EC] p-6 max-w-[440px] w-full shadow-lg space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div>
              <h3 className="text-[20px] font-semibold text-[#BC2025] font-hindi leading-tight">
                खाता हटाने की पुष्टि करें
              </h3>
              <p className="text-[13px] text-[#5B6070] mt-0.5">
                Confirm Permanent Account Deletion
              </p>
            </div>

            <p className="text-[14px] text-[#0D1B4B]/80 font-hindi leading-relaxed">
              यह क्रिया स्थायी है। आपका पूरा डेटा, कांजी व शब्दावली प्रगति, और समीक्षा डेक हमेशा के लिए मिटा दिए जाएंगे।
            </p>

            {deleteError && (
              <div className="p-2.5 rounded-[8px] bg-red-50 border border-red-200 text-[#BC2025] text-[13px] font-hindi">
                {deleteError}
              </div>
            )}

            <form onSubmit={handleDeleteAccount} className="space-y-3 pt-1">
              <div>
                <label className="block text-[13px] font-medium text-[#0D1B4B] font-hindi mb-1">
                  पुष्टि के लिए <span className="font-semibold text-[#BC2025]">खाता हटाएं</span> लिखें:
                </label>
                <input
                  type="text"
                  required
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="खाता हटाएं"
                  className="w-full px-3 py-2 rounded-[8px] border border-[#E8E8EC] text-[15px] focus:outline-none focus:border-[#BC2025]"
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#0D1B4B] font-hindi mb-1">
                  वर्तमान पासवर्ड:
                </label>
                <input
                  type="password"
                  required
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 rounded-[8px] border border-[#E8E8EC] text-[15px] focus:outline-none focus:border-[#BC2025]"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={deleteDeleting}
                  className="flex-1 py-2.5 px-4 rounded-[8px] bg-[#BC2025] hover:bg-[#8B1519] disabled:opacity-50 text-white text-[15px] font-semibold font-hindi transition cursor-pointer"
                >
                  {deleteDeleting ? 'हटाया जा रहा है...' : 'स्थायी रूप से हटाएं'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteError('');
                  }}
                  className="flex-1 py-2.5 px-4 rounded-[8px] bg-[#F4F4F6] hover:bg-[#E8E8EC] text-[#0D1B4B] text-[15px] font-medium font-hindi transition cursor-pointer"
                >
                  रद्द करें
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
