'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getAuthErrorMessage } from '@/lib/error-handler';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const { resetPassword } = useAuth();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!token) {
      setErrorMessage('पासवर्ड रीसेट टोकन अमान्य या अनुपलब्ध है। कृपया नया रीसेट लिंक अनुरोध करें।');
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage('पासवर्ड कम से कम ८ अक्षरों का होना चाहिए।');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('दोनों पासवर्ड मेल नहीं खाते हैं।');
      return;
    }

    setLoading(true);
    try {
      const msg = await resetPassword(token, newPassword);
      setSuccessMessage(msg);
      setSuccess(true);
    } catch (err: unknown) {
      const msg = getAuthErrorMessage(err, 'ResetPasswordPage');
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="space-y-4 text-center">
        <div className="p-4 rounded-[10px] bg-red-50 border border-red-200 text-[#BC2025] space-y-2">
          <p className="text-[14px] font-semibold font-hindi">रीसेट टोकन अनुपलब्ध है</p>
          <p className="text-[12px] text-[#5B6070] font-hindi">
            यह लिंक अमान्य है। कृपया पासवर्ड रीसेट का नया अनुरोध करें।
          </p>
        </div>
        <Link
          href="/forgot-password"
          className="inline-block py-2.5 px-5 rounded-[8px] bg-[#BC2025] hover:bg-[#8B1519] text-white text-[14px] font-semibold font-hindi transition"
        >
          नया रीसेट लिंक अनुरोध करें / Request New Link
        </Link>
      </div>
    );
  }

  if (success) {
    return (
      <div className="space-y-5 animate-in fade-in text-center">
        <div className="p-5 rounded-[10px] bg-green-50 border border-green-200 text-[#0D1B4B] space-y-2">
          <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto font-bold text-lg">
            ✓
          </div>
          <h2 className="text-[16px] font-bold text-green-800 font-hindi">
            पासवर्ड सफलतापूर्वक बदल दिया गया!
          </h2>
          <p className="text-[13px] text-[#5B6070] font-hindi leading-relaxed">
            {successMessage || 'आपका नया पासवर्ड सक्रिय हो गया है। आप अब अपने नए पासवर्ड के साथ लॉग इन कर सकते हैं।'}
          </p>
        </div>

        <Link
          href="/login"
          className="block w-full py-2.5 px-4 rounded-[8px] bg-[#BC2025] hover:bg-[#8B1519] text-white text-[15px] font-semibold font-hindi transition text-center shadow-xs"
        >
          लॉग इन करें / Log In Now
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errorMessage && (
        <div className="p-3 rounded-[8px] bg-red-50 border border-red-200 text-[#BC2025] text-[13px] font-hindi leading-tight animate-in fade-in">
          {errorMessage}
        </div>
      )}

      <div>
        <label className="block text-[13px] font-medium text-[#0D1B4B] font-hindi mb-1" htmlFor="new-password">
          नया पासवर्ड <span className="text-[#5B6070] font-normal">/ New Password (कम से कम ८ अक्षर)</span>
        </label>
        <div className="relative">
          <input
            id="new-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            minLength={8}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3.5 py-2.5 pr-10 rounded-[8px] border border-[#E8E8EC] bg-white text-[15px] text-[#0D1B4B] placeholder-[#5B6070]/50 focus:outline-none focus:ring-2 focus:ring-[#0D1B4B]/20 focus:border-[#0D1B4B] transition"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#5B6070] hover:text-[#0D1B4B] p-1 text-[13px] font-hindi cursor-pointer"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? 'छिपाएं' : 'दिखाएं'}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-[13px] font-medium text-[#0D1B4B] font-hindi mb-1" htmlFor="confirm-password">
          नए पासवर्ड की पुष्टि करें <span className="text-[#5B6070] font-normal">/ Confirm New Password</span>
        </label>
        <div className="relative">
          <input
            id="confirm-password"
            type={showConfirm ? 'text' : 'password'}
            autoComplete="new-password"
            required
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3.5 py-2.5 pr-10 rounded-[8px] border border-[#E8E8EC] bg-white text-[15px] text-[#0D1B4B] placeholder-[#5B6070]/50 focus:outline-none focus:ring-2 focus:ring-[#0D1B4B]/20 focus:border-[#0D1B4B] transition"
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#5B6070] hover:text-[#0D1B4B] p-1 text-[13px] font-hindi cursor-pointer"
            aria-label={showConfirm ? 'Hide password' : 'Show password'}
          >
            {showConfirm ? 'छिपाएं' : 'दिखाएं'}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 px-4 rounded-[8px] bg-[#BC2025] hover:bg-[#8B1519] disabled:opacity-50 text-white text-[15px] font-semibold font-hindi transition cursor-pointer flex items-center justify-center gap-2 shadow-xs"
      >
        {loading ? (
          <span>पासवर्ड रीसेट हो रहा है...</span>
        ) : (
          <>
            <span>पासवर्ड रीसेट करें</span>
            <span className="text-[12px] font-normal text-white/80">/ Set New Password</span>
          </>
        )}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-[420px] bg-white rounded-[12px] border border-[#E8E8EC] p-6 sm:p-8 shadow-xs space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="w-10 h-10 rounded-[8px] bg-[#BC2025] flex items-center justify-center mx-auto mb-3 shadow-xs">
            <span className="text-white text-lg font-bold font-jp leading-none">鍵</span>
          </div>
          <h1 className="text-[26px] font-semibold text-[#0D1B4B] font-hindi leading-tight">
            नया पासवर्ड सेट करें
          </h1>
          <p className="text-[13px] text-[#5B6070]">
            Set Your New Password
          </p>
        </div>

        <Suspense
          fallback={
            <div className="py-8 text-center text-[14px] text-[#5B6070] font-hindi">
              लोड हो रहा है...
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>

        {/* Footer Navigation */}
        <div className="text-center space-y-3 pt-2 border-t border-[#E8E8EC]">
          <p className="text-[13px] text-[#5B6070] font-hindi">
            याद आ गया?{' '}
            <Link href="/login" className="text-[#BC2025] font-semibold hover:underline">
              लॉग इन करें
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
