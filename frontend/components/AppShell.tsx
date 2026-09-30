'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  RotateCw,
  BarChart3,
  Bot,
  User,
  Flame,
  Menu,
  X,
} from 'lucide-react';
import { getUserProfile, getDeckCards } from '@/lib/storage';
import { UserProfile } from '@/types';
import { useAuth } from '@/context/AuthContext';
import BottomNav from '@/components/BottomNav';
import OnboardingModal from '@/components/OnboardingModal';
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister';
import AuthModals from '@/components/AuthModals';

const NAV_ITEMS = [
  {
    id: 'home',
    labelHindi: 'डैशबोर्ड',
    labelEn: 'Dashboard',
    href: '/',
    Icon: LayoutDashboard,
    chipColor: 'bg-[#2563EB]/12 text-[#2563EB]',
  },
  {
    id: 'learn',
    labelHindi: 'पाठ्यक्रम',
    labelEn: 'Curriculum',
    href: '/learn',
    Icon: BookOpen,
    chipColor: 'bg-[#138808]/12 text-[#138808]',
  },
  {
    id: 'review',
    labelHindi: 'स्मृति समीक्षा',
    labelEn: 'Review Deck',
    href: '/review',
    Icon: RotateCw,
    chipColor: 'bg-[#2563EB]/12 text-[#2563EB]',
  },
  {
    id: 'progress',
    labelHindi: 'प्रगति व सेटिंग्स',
    labelEn: 'Progress',
    href: '/progress',
    Icon: BarChart3,
    chipColor: 'bg-[#FF9933]/18 text-[#B45309]',
  },
  {
    id: 'tutor',
    labelHindi: 'एआई ट्यूटर',
    labelEn: 'AI Sensei',
    href: '/tutor',
    Icon: Bot,
    chipColor: 'bg-[#0D9488]/12 text-[#0D9488]',
  },
  {
    id: 'account',
    labelHindi: 'खाता',
    labelEn: 'Account',
    href: '/account',
    Icon: User,
    chipColor: 'bg-[#7C3AED]/12 text-[#7C3AED]',
  },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, status } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [deckCount, setDeckCount] = useState(0);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  useEffect(() => {
    const p = getUserProfile();
    const cards = getDeckCards();
    setProfile(p);
    setDeckCount(cards.length);
  }, [pathname, user]);

  const streakDays = profile?.streakDays || 1;
  const completedTotal =
    (profile?.completedLessons.length || 0) +
    (profile?.completedKanaGroups.length || 0) +
    (profile?.completedVocabUnits.length || 0) +
    (profile?.completedGrammarPoints.length || 0) +
    ((profile?.completedKanjiGroups || []).length || 0);

  return (
    <div className="min-h-screen text-[#0D1B4B] relative bg-[#F4F4F6] selection:bg-[#BC2025]/12 selection:text-[#BC2025]">
      {/* ── Fixed Subtle Glass Background Blobs (z-0 above background, behind z-10 content) ─── */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden" aria-hidden="true">
        <div className="absolute top-[-10%] left-[15%] w-[520px] h-[520px] rounded-full bg-[#2563EB]/[0.07] blur-[120px]" />
        <div className="absolute top-[25%] right-[-5%] w-[480px] h-[480px] rounded-full bg-[#FF9933]/[0.09] blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[30%] w-[440px] h-[440px] rounded-full bg-[#BC2025]/[0.07] blur-[110px]" />
      </div>

      {/* ── Mobile Drawer Backdrop (< 1024px) ────────────────────── */}
      {mobileDrawerOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 min-[1024px]:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setMobileDrawerOpen(false)}
        />
      )}

      {/* ── Sidebar (Fixed Permanent at >= 1024px, Drawer at < 1024px) ─── */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-[280px] bg-white border-r border-[#E8E8EC] flex flex-col z-50 shrink-0 transition-transform duration-300 ease-out min-[1024px]:translate-x-0 ${
          mobileDrawerOpen ? 'max-[1023px]:translate-x-0' : 'max-[1023px]:-translate-x-full'
        }`}
      >
        {/* Brand Logo Header */}
        <div className="px-5 pt-6 pb-5 flex items-center justify-between border-b border-[#E8E8EC]">
          <Link
            href="/"
            onClick={() => setMobileDrawerOpen(false)}
            className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/30 rounded-[8px]"
          >
            <div className="w-8 h-8 rounded-[8px] bg-[#BC2025] flex items-center justify-center shrink-0 transition-colors group-hover:bg-[#8B1519] shadow-xs">
              <span className="text-white text-base font-bold font-jp leading-none select-none">
                学
              </span>
            </div>
            <div>
              <div className="text-[#0D1B4B] font-semibold text-[15px] leading-tight tracking-tight">
                Nihongo Seekho
              </div>
              <div className="text-[#5B6070] text-[13px] mt-0.5 font-hindi">
                N5 स्तर · हिंदी में
              </div>
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setMobileDrawerOpen(false)}
            className="text-[#5B6070] hover:text-[#0D1B4B] min-[1024px]:hidden p-1.5 rounded-[8px] transition cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive =
              item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setMobileDrawerOpen(false)}
                className={`w-full min-h-[44px] flex items-center gap-3 px-3 py-2 rounded-[10px] text-[15px] border-[1.5px] transition-all duration-150 relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/30 ${
                  isActive
                    ? 'border-[#2563EB] bg-[#2563EB]/[0.14] text-[#0D1B4B] font-semibold shadow-xs'
                    : 'border-transparent text-[#0D1B4B] hover:border-[#2563EB] hover:bg-[#2563EB]/[0.08] font-normal'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-2.5 bottom-2.5 w-[3px] rounded-r-full bg-[#FF9933]" />
                )}
                {/* Category Colored Icon Chip */}
                <div className={`w-7 h-7 rounded-[7px] flex items-center justify-center shrink-0 ${item.chipColor}`}>
                  <item.Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-hindi leading-tight">{item.labelHindi}</div>
                  <div className="text-[11px] text-[#5B6070] font-normal leading-tight mt-0.5">
                    {item.labelEn}
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Pinned Stats Widget (Light Blue Glass) */}
        <div className="mt-auto mx-3 mb-3 glass-sidebar-box p-3.5 space-y-2">
          <div className="flex justify-between items-center text-[13px]">
            <span className="text-[#5B6070] font-hindi">सीखे गए विषय</span>
            <span className="text-[#B45309] font-semibold font-mono">
              {completedTotal}
            </span>
          </div>

          <div className="flex justify-between items-center text-[13px]">
            <span className="text-[#5B6070] font-hindi">समीक्षा डेक</span>
            <span className="text-[#138808] font-semibold font-mono">
              {deckCount}
            </span>
          </div>
        </div>

        {/* Pinned User Footer (Light Blue Glass Profile Card Link) */}
        <div className="px-3 pb-4">
          {status === 'authed' && user ? (
            <Link
              href="/account"
              onClick={() => setMobileDrawerOpen(false)}
              className="glass-sidebar-box p-2.5 flex items-center gap-3 group hover:bg-[#2563EB]/[0.14] transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/30"
            >
              {user.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt={user.display_name}
                  className="w-8 h-8 rounded-full object-cover border border-[#2563EB]/30 shrink-0"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#FF9933] to-[#BC2025] flex items-center justify-center shrink-0 text-white text-[13px] font-semibold font-hindi shadow-xs">
                  {user.display_name?.charAt(0) || 'अ'}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="text-[#0D1B4B] text-[13px] font-semibold truncate font-hindi group-hover:text-[#2563EB] transition">
                  {user.display_name}
                </div>
                <div className="text-[#5B6070] text-[11px] truncate font-normal">
                  खाता व सेटिंग्स / Account
                </div>
              </div>
            </Link>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileDrawerOpen(false)}
              className="glass-sidebar-box p-2.5 flex items-center gap-3 group hover:bg-[#2563EB]/[0.14] transition duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB]/30"
            >
              <div className="w-8 h-8 rounded-full bg-[#2563EB]/12 flex items-center justify-center shrink-0 text-[#2563EB] text-[13px]">
                <User className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[#0D1B4B] text-[13px] font-semibold truncate font-hindi">
                  अतिथि (Guest)
                </div>
                <div className="text-[#2563EB] text-[11px] truncate font-semibold">
                  लॉग इन करें / Sign In
                </div>
              </div>
            </Link>
          )}
        </div>
      </aside>

      {/* ── Main Content Container (Offset by 280px on desktop) ─────── */}
      <div className="relative z-10 min-[1024px]:pl-[280px] flex flex-col min-h-screen">
        {/* Mobile Top Header (< 1024px only) */}
        <header className="sticky top-0 z-30 px-4 py-3.5 flex items-center justify-between bg-white/90 backdrop-blur-md border-b border-[#E8E8EC] min-[1024px]:hidden">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileDrawerOpen(true)}
              className="text-[#0D1B4B]/70 hover:text-[#0D1B4B] p-1.5 rounded-[8px] transition cursor-pointer"
              aria-label="Open navigation drawer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <div className="text-[12px] text-[#5B6070] leading-none">
                Nihongo Seekho
              </div>
              <div className="text-[15px] font-semibold text-[#0D1B4B] font-hindi leading-tight mt-0.5">
                हिंदी में जापानी सीखें
              </div>
            </div>
          </div>

          {/* Top Right: Streak Pill on Mobile (Glass Saffron Pill) */}
          <div className="glass-pill-saffron flex items-center gap-1.5 rounded-[8px] px-3 py-1.5 shadow-xs">
            <span className="text-[#FF9933]">
              <Flame className="w-4 h-4" />
            </span>
            <span className="font-semibold text-[13px] font-mono leading-none text-[#0D1B4B]">
              {streakDays}
            </span>
            <span className="text-[13px] font-hindi leading-none text-[#0D1B4B]">
              दिन
            </span>
          </div>
        </header>

        {/* Page Content Canvas */}
        <main className="flex-1 px-4 sm:px-6 py-6 sm:py-8 max-w-[1100px] w-full mx-auto pb-24 min-[1024px]:pb-8">
          {children}
        </main>

        {/* Mobile Bottom Navigation (< 1024px) */}
        <BottomNav />

        {/* Modals & Service Worker */}
        <OnboardingModal />
        <ServiceWorkerRegister />
        <AuthModals />
      </div>
    </div>

  );
}
