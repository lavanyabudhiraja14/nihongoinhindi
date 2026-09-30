'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getAuthErrorMessage } from '@/lib/error-handler';

export default function LoginPage() {
  const router = useRouter();
  const { login, status } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('कृपया ईमेल और पासवर्ड दर्ज करें।');
      return;
    }

    setLoading(true);
    try {
      await login(email.trim(), password);
      router.push('/');
    } catch (err: unknown) {
      const msg = getAuthErrorMessage(err, 'LoginPage');
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-[420px] bg-white rounded-[12px] border border-[#E8E8EC] p-6 sm:p-8 shadow-xs space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="w-10 h-10 rounded-[8px] bg-[#BC2025] flex items-center justify-center mx-auto mb-3 shadow-xs">
            <span className="text-white text-lg font-bold font-jp leading-none">学</span>
          </div>
          <h1 className="text-[28px] font-semibold text-[#0D1B4B] font-hindi leading-tight">
            लॉग इन करें
          </h1>
          <p className="text-[13px] text-[#5B6070]">
            Log In to your Account
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 rounded-[8px] bg-red-50 border border-red-200 text-[#BC2025] text-[13px] font-hindi leading-tight animate-in fade-in">
            {errorMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-[#0D1B4B] font-hindi mb-1" htmlFor="login-email">
              ईमेल पता <span className="text-[#5B6070] font-normal">/ Email</span>
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full px-3.5 py-2.5 rounded-[8px] border border-[#E8E8EC] bg-white text-[15px] text-[#0D1B4B] placeholder-[#5B6070]/50 focus:outline-none focus:ring-2 focus:ring-[#0D1B4B]/20 focus:border-[#0D1B4B] transition"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[13px] font-medium text-[#0D1B4B] font-hindi" htmlFor="login-password">
                पासवर्ड <span className="text-[#5B6070] font-normal">/ Password</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-[12px] text-[#BC2025] hover:underline font-hindi font-medium"
              >
                पासवर्ड भूल गए? <span className="text-[#5B6070] font-normal text-[11px]">/ Forgot?</span>
              </Link>
            </div>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-[8px] bg-[#BC2025] hover:bg-[#8B1519] disabled:opacity-50 text-white text-[15px] font-semibold font-hindi transition cursor-pointer flex items-center justify-center gap-2 shadow-xs"
          >
            {loading ? (
              <span>लॉग इन हो रहा है...</span>
            ) : (
              <>
                <span>लॉग इन करें</span>
                <span className="text-[12px] font-normal text-white/80">/ Log In</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Navigation */}
        <div className="text-center space-y-3 pt-2 border-t border-[#E8E8EC]">
          <p className="text-[13px] text-[#5B6070] font-hindi">
            खाता नहीं है?{' '}
            <Link href="/signup" className="text-[#BC2025] font-semibold hover:underline">
              नया खाता बनाएं
            </Link>
          </p>

          <div>
            <Link
              href="/"
              className="text-[13px] text-[#5B6070] hover:text-[#0D1B4B] font-hindi hover:underline"
            >
              अतिथि के रूप में जारी रखें (बिना खाते के)
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
