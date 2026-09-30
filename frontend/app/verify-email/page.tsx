'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getAuthErrorMessage } from '@/lib/error-handler';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const { user, verifyEmail, resendVerification, refreshUser } = useAuth();

  const [verifying, setVerifying] = useState(false);
  const [verified, setVerified] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState('');
  const [verifyError, setVerifyError] = useState('');

  const [resendEmail, setResendEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState('');
  const [resendError, setResendError] = useState('');
  const verifiedTokenRef = React.useRef<string | null>(null);

  // Auto-verify if token is present in URL
  useEffect(() => {
    if (!token || verifiedTokenRef.current === token) return;
    verifiedTokenRef.current = token;

    let mounted = true;
    const executeVerification = async () => {
      setVerifying(true);
      setVerifyError('');
      try {
        const res = await verifyEmail(token);
        if (mounted) {
          setVerified(true);
          setVerifyMessage(res.message);
          await refreshUser();
        }
      } catch (err: unknown) {
        if (mounted) {
          const msg = getAuthErrorMessage(err, 'VerifyEmailPage');
          setVerifyError(msg);
        }
      } finally {
        if (mounted) {
          setVerifying(false);
        }
      }
    };

    executeVerification();

    return () => {
      mounted = false;
    };
  }, [token, verifyEmail, refreshUser]);

  const handleResend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setResendError('');
    setResendSuccess('');

    const target = user?.email || resendEmail.trim();
    if (!user && !target) {
      setResendError('कृपया अपना ईमेल पता दर्ज करें।');
      return;
    }

    setResending(true);
    try {
      const msg = await resendVerification(target || undefined);
      setResendSuccess(msg);
    } catch (err: unknown) {
      const msg = getAuthErrorMessage(err, 'VerifyEmailResend');
      setResendError(msg);
    } finally {
      setResending(false);
    }
  };

  // 1. Verifying token in progress
  if (token && verifying) {
    return (
      <div className="py-8 text-center space-y-3">
        <div className="w-10 h-10 border-3 border-[#BC2025] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-[15px] font-medium text-[#0D1B4B] font-hindi">
          ईमेल सत्यापित किया जा रहा है...
        </p>
        <p className="text-[13px] text-[#5B6070]">Verifying your email address...</p>
      </div>
    );
  }

  // 2. Token verified successfully
  if (token && verified) {
    return (
      <div className="space-y-5 text-center animate-in fade-in">
        <div className="p-5 rounded-[10px] bg-green-50 border border-green-200 text-[#0D1B4B] space-y-2">
          <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center mx-auto font-bold text-lg">
            ✓
          </div>
          <h2 className="text-[17px] font-bold text-green-800 font-hindi">
            ईमेल सफलतापूर्वक सत्यापित हो गया!
          </h2>
          <p className="text-[13px] text-[#5B6070] font-hindi leading-relaxed">
            {verifyMessage || 'आपका खाता अब पूर्णतः सत्यापित है। आप Nihongo Seekho की सभी सुविधाओं का उपयोग कर सकते हैं।'}
          </p>
        </div>

        <Link
          href="/"
          className="block w-full py-2.5 px-4 rounded-[8px] bg-[#BC2025] hover:bg-[#8B1519] text-white text-[15px] font-semibold font-hindi transition text-center shadow-xs"
        >
          सीखना शुरू करें / Continue Learning
        </Link>
      </div>
    );
  }

  // 3. Token verification failed or expired
  if (token && verifyError) {
    return (
      <div className="space-y-5 animate-in fade-in">
        <div className="p-4 rounded-[10px] bg-red-50 border border-red-200 text-[#BC2025] space-y-2 text-center">
          <p className="text-[15px] font-semibold font-hindi">सत्यापन असफल रहा</p>
          <p className="text-[13px] text-[#5B6070] font-hindi leading-relaxed">
            {verifyError}
          </p>
        </div>

        {resendSuccess ? (
          <div className="p-3 rounded-[8px] bg-blue-50 border border-blue-200 text-[#0D1B4B] text-[13px] font-hindi text-center">
            {resendSuccess}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-[13px] text-[#5B6070] font-hindi text-center">
              क्या आप एक नया सत्यापन लिंक प्राप्त करना चाहते हैं?
            </p>

            {!user && (
              <input
                type="email"
                placeholder="name@example.com"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                className="w-full px-3.5 py-2 rounded-[8px] border border-[#E8E8EC] bg-white text-[14px] text-[#0D1B4B] placeholder-[#5B6070]/50 focus:outline-none focus:ring-2 focus:ring-[#0D1B4B]/20"
              />
            )}

            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="w-full py-2.5 px-4 rounded-[8px] bg-[#BC2025] hover:bg-[#8B1519] disabled:opacity-50 text-white text-[14px] font-semibold font-hindi transition cursor-pointer flex items-center justify-center gap-2 shadow-xs"
            >
              {resending ? 'भेजा जा रहा है...' : 'नया सत्यापन ईमेल भेजें / Resend Email'}
            </button>
          </div>
        )}
      </div>
    );
  }

  // 4. Default: User landed without token (e.g. after signup or from profile)
  return (
    <div className="space-y-5 animate-in fade-in">
      <div className="p-4 rounded-[10px] bg-blue-50/60 border border-blue-200/80 text-[#0D1B4B] space-y-2 text-center">
        <div className="w-9 h-9 rounded-full bg-blue-100 text-[#2563EB] flex items-center justify-center mx-auto font-bold text-sm">
          ✉
        </div>
        <h2 className="text-[16px] font-semibold font-hindi text-[#0D1B4B]">
          सत्यापन ईमेल भेजा गया है
        </h2>
        <p className="text-[13px] text-[#5B6070] font-hindi leading-relaxed">
          {user?.email ? (
            <>
              हमने <strong>{user.email}</strong> पर एक पुष्टिकरण लिंक भेजा है। कृपया अपना इनबॉक्स जांचें और लिंक पर क्लिक करें।
            </>
          ) : (
            'हमने आपके पंजीकृत ईमेल पर एक सत्यापन लिंक भेजा है। कृपया अपना इनबॉक्स और स्पैम फ़ोल्डर जांचें।'
          )}
        </p>
      </div>

      {resendSuccess && (
        <div className="p-3 rounded-[8px] bg-green-50 border border-green-200 text-green-800 text-[13px] font-hindi text-center animate-in fade-in">
          {resendSuccess}
        </div>
      )}

      {resendError && (
        <div className="p-3 rounded-[8px] bg-red-50 border border-red-200 text-[#BC2025] text-[13px] font-hindi text-center animate-in fade-in">
          {resendError}
        </div>
      )}

      <div className="space-y-3 pt-1">
        {!user && (
          <input
            type="email"
            placeholder="name@example.com"
            value={resendEmail}
            onChange={(e) => setResendEmail(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-[8px] border border-[#E8E8EC] bg-white text-[14px] text-[#0D1B4B] placeholder-[#5B6070]/50 focus:outline-none focus:ring-2 focus:ring-[#0D1B4B]/20"
          />
        )}

        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className="w-full py-2.5 px-4 rounded-[8px] border border-[#BC2025] text-[#BC2025] hover:bg-[#BC2025]/5 disabled:opacity-50 text-[14px] font-semibold font-hindi transition cursor-pointer flex items-center justify-center gap-2"
        >
          {resending ? 'ईमेल भेजा जा रहा है...' : 'सत्यापन ईमेल पुनः भेजें / Resend Email'}
        </button>

        <Link
          href="/"
          className="block w-full py-2.5 px-4 rounded-[8px] bg-[#BC2025] hover:bg-[#8B1519] text-white text-[14px] font-semibold font-hindi transition text-center shadow-xs"
        >
          बाद में सत्यापित करें (मुखपृष्ठ पर जाएं)
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-[440px] bg-white rounded-[12px] border border-[#E8E8EC] p-6 sm:p-8 shadow-xs space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <div className="w-10 h-10 rounded-[8px] bg-[#BC2025] flex items-center justify-center mx-auto mb-3 shadow-xs">
            <span className="text-white text-lg font-bold font-jp leading-none">確</span>
          </div>
          <h1 className="text-[26px] font-semibold text-[#0D1B4B] font-hindi leading-tight">
            ईमेल सत्यापन
          </h1>
          <p className="text-[13px] text-[#5B6070]">
            Email Verification
          </p>
        </div>

        <Suspense
          fallback={
            <div className="py-8 text-center text-[14px] text-[#5B6070] font-hindi">
              लोड हो रहा है...
            </div>
          }
        >
          <VerifyEmailContent />
        </Suspense>

        {/* Footer Navigation */}
        <div className="text-center space-y-3 pt-2 border-t border-[#E8E8EC]">
          <Link
            href="/"
            className="text-[13px] text-[#5B6070] hover:text-[#0D1B4B] font-hindi hover:underline"
          >
            मुखपृष्ठ पर वापस जाएं (Home)
          </Link>
        </div>
      </div>
    </div>
  );
}
