'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { getAuthErrorMessage } from '@/lib/error-handler';

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email.trim()) {
      setErrorMessage('कृपया अपना ईमेल पता दर्ज करें।');
      return;
    }

    setLoading(true);
    try {
      const msg = await forgotPassword(email.trim());
      setSuccessMessage(msg);
      setSubmitted(true);
    } catch (err: unknown) {
      const msg = getAuthErrorMessage(err, 'ForgotPasswordPage');
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
            <span className="text-white text-lg font-bold font-jp leading-none">鍵</span>
          </div>
          <h1 className="text-[26px] font-semibold text-[#0D1B4B] font-hindi leading-tight">
            पासवर्ड भूल गए?
          </h1>
          <p className="text-[13px] text-[#5B6070]">
            Reset Your Password
          </p>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 rounded-[8px] bg-red-50 border border-red-200 text-[#BC2025] text-[13px] font-hindi leading-tight animate-in fade-in">
            {errorMessage}
          </div>
        )}

        {submitted ? (
          /* Confirmation Success Box */
          <div className="space-y-5 animate-in fade-in">
            <div className="p-4 rounded-[10px] bg-blue-50/60 border border-blue-200/80 text-[#0D1B4B] space-y-2 text-center">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-[#2563EB] flex items-center justify-center mx-auto font-bold text-sm">
                ✓
              </div>
              <p className="text-[14px] font-medium font-hindi leading-relaxed">
                {successMessage || 'यदि यह ईमेल पंजीकृत है, तो पासवर्ड रीसेट लिंक भेज दिया गया है।'}
              </p>
              <p className="text-[12px] text-[#5B6070] font-hindi leading-normal">
                कृपया अपना इनबॉक्स और स्पैम फ़ोल्डर जांचें। लिंक ३० मिनट के लिए वैध है।
              </p>
            </div>

            <div className="pt-2 text-center space-y-3">
              <Link
                href="/login"
                className="block w-full py-2.5 px-4 rounded-[8px] bg-[#BC2025] hover:bg-[#8B1519] text-white text-[14px] font-semibold font-hindi transition cursor-pointer text-center shadow-xs"
              >
                लॉग इन पर वापस जाएं / Back to Login
              </Link>

              <button
                type="button"
                onClick={() => {
                  setSubmitted(false);
                  setSuccessMessage('');
                }}
                className="text-[13px] text-[#5B6070] hover:text-[#0D1B4B] font-hindi hover:underline cursor-pointer"
              >
                अन्य ईमेल से पुनः प्रयास करें
              </button>
            </div>
          </div>
        ) : (
          /* Forgot Password Request Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-[13px] text-[#5B6070] font-hindi leading-relaxed">
              अपना पंजीकृत ईमेल पता दर्ज करें। हम आपको पासवर्ड रीसेट करने के लिए एक सुरक्षित लिंक भेजेंगे।
            </p>

            <div>
              <label className="block text-[13px] font-medium text-[#0D1B4B] font-hindi mb-1" htmlFor="forgot-email">
                पंजीकृत ईमेल <span className="text-[#5B6070] font-normal">/ Registered Email</span>
              </label>
              <input
                id="forgot-email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full px-3.5 py-2.5 rounded-[8px] border border-[#E8E8EC] bg-white text-[15px] text-[#0D1B4B] placeholder-[#5B6070]/50 focus:outline-none focus:ring-2 focus:ring-[#0D1B4B]/20 focus:border-[#0D1B4B] transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-[8px] bg-[#BC2025] hover:bg-[#8B1519] disabled:opacity-50 text-white text-[15px] font-semibold font-hindi transition cursor-pointer flex items-center justify-center gap-2 shadow-xs"
            >
              {loading ? (
                <span>अनुरोध भेजा जा रहा है...</span>
              ) : (
                <>
                  <span>रीसेट लिंक भेजें</span>
                  <span className="text-[12px] font-normal text-white/80">/ Send Reset Link</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer Navigation */}
        <div className="text-center space-y-3 pt-2 border-t border-[#E8E8EC]">
          <p className="text-[13px] text-[#5B6070] font-hindi">
            पासवर्ड याद आ गया?{' '}
            <Link href="/login" className="text-[#BC2025] font-semibold hover:underline">
              लॉग इन करें
            </Link>
          </p>

          <div>
            <Link
              href="/"
              className="text-[13px] text-[#5B6070] hover:text-[#0D1B4B] font-hindi hover:underline"
            >
              मुखपृष्ठ पर वापस जाएं (Home)
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
