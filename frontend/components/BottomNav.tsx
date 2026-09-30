'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BookOpen,
  RotateCw,
  BarChart3,
  Bot,
} from 'lucide-react';

const NAV_ITEMS = [
  {
    nameHindi: 'डैशबोर्ड',
    nameEn: 'Home',
    href: '/',
    Icon: LayoutDashboard,
    activeColor: 'text-[#2563EB] bg-[#2563EB]/12',
  },
  {
    nameHindi: 'सीखें',
    nameEn: 'Learn',
    href: '/learn',
    Icon: BookOpen,
    activeColor: 'text-[#138808] bg-[#138808]/12',
  },
  {
    nameHindi: 'समीक्षा',
    nameEn: 'Review',
    href: '/review',
    Icon: RotateCw,
    activeColor: 'text-[#2563EB] bg-[#2563EB]/12',
  },
  {
    nameHindi: 'प्रगति',
    nameEn: 'Progress',
    href: '/progress',
    Icon: BarChart3,
    activeColor: 'text-[#B45309] bg-[#FF9933]/18',
  },
  {
    nameHindi: 'ट्यूटर',
    nameEn: 'Tutor',
    href: '/tutor',
    Icon: Bot,
    activeColor: 'text-[#0D9488] bg-[#0D9488]/12',
  },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E8E8EC] shadow-md min-[1024px]:hidden">
      <div className="max-w-md mx-auto flex items-center justify-around py-1.5 px-2">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center flex-1 py-1 transition-all"
            >
              <div
                className={`p-1.5 rounded-[8px] transition-all ${
                  isActive ? item.activeColor : 'text-[#5B6070] hover:bg-[#F4F4F6]'
                }`}
              >
                <item.Icon className="w-5 h-5" />
              </div>
              <span
                className={`text-[11px] font-hindi tracking-tight mt-0.5 ${
                  isActive ? 'text-[#0D1B4B] font-semibold' : 'text-[#5B6070] font-normal'
                }`}
              >
                {item.nameHindi}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
