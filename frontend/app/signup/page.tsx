'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getAuthErrorMessage } from '@/lib/error-handler';

export default function SignupPage() {
  const router = useRouter();
  const { signup } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('कृपया सभी आवश्यक विवरण भरें।');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('पासवर्ड कम से कम ८ अक्षरों का होना चाहिए।');
      return;
    }

    setLoading(true);
    try {
      await signup(email.trim(), password, displayName.trim() || 'शिक्षार्थी');
      router.push('/verify-email');
    } catch (err: unknown) {
      const msg = getAuthErrorMessage(err, 'SignupPage');
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
            नया खाता बनाएं
          </h1>
          <p className="text-[13px] text-[#5B6070]">
            Create a New Account
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
            <label className="block text-[13px] font-medium text-[#0D1B4B] font-hindi mb-1" htmlFor="signup-name">
              आपका नाम <span className="text-[#5B6070] font-normal">(वैकल्पिक / Name)</span>
            </label>
            <input
              id="signup-name"
              type="text"
              maxLength={40}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="शिक्षार्थी / Learner"
              className="w-full px-3.5 py-2.5 rounded-[8px] border border-[#E8E8EC] bg-white text-[15px] text-[#0D1B4B] placeholder-[#5B6070]/50 focus:outline-none focus:ring-2 focus:ring-[#0D1B4B]/20 focus:border-[#0D1B4B] transition"
            />
          </div>

          <div>
            <label className="block text-[13px] font-medium text-[#0D1B4B] font-hindi mb-1" htmlFor="signup-email">
              ईमेल पता <span className="text-[#5B6070] font-normal">/ Email</span>
            </label>
            <input
              id="signup-email"
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
            <label className="block text-[13px] font-medium text-[#0D1B4B] font-hindi mb-1" htmlFor="signup-password">
              पासवर्ड <span className="text-[#5B6070] font-normal">/ Password (कम से कम ८ अक्षर)</span>
            </label>
            <div className="relative">
              <input
                id="signup-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                minLength={8}
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
            <p className="text-[11px] text-[#5B6070] mt-1 font-hindi">
              सुरक्षा के लिए न्यूनतम ८ अक्षरों का पासवर्ड रखें।
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-[8px] bg-[#BC2025] hover:bg-[#8B1519] disabled:opacity-50 text-white text-[15px] font-semibold font-hindi transition cursor-pointer flex items-center justify-center gap-2 shadow-xs"
          >
            {loading ? (
              <span>खाता बन रहा है...</span>
            ) : (
              <>
                <span>खाता बनाएं</span>
                <span className="text-[12px] font-normal text-white/80">/ Sign Up</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Navigation */}
        <div className="text-center space-y-3 pt-2 border-t border-[#E8E8EC]">
          <p className="text-[13px] text-[#5B6070] font-hindi">
            पहले से खाता है?{' '}
            <Link href="/login" className="text-[#BC2025] font-semibold hover:underline">
              लॉग इन करें
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
