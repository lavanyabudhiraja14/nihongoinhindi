'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Play,
  ArrowRight,
  Check,
  RotateCw,
  Flame,
  BookOpen,
  Sparkles,
  Bot,
  Layers,
} from 'lucide-react';
import { getUserProfile, getDeckCards } from '@/lib/storage';
import { UserProfile } from '@/types';
import { getDueCards, formatLocalDate } from '@/lib/sm2';
import { getWeekdayStreak, calculateCourseProgress, CourseProgressStats } from '@/lib/progress';
import unitsData from '@/content/units.json';
import InstallPrompt from '@/components/InstallPrompt';

const FOUNDATIONAL_CHARS = [
  { char: 'あ', romaji: 'a', hindi: 'आ', rowId: 'h-a-row' },
  { char: 'い', romaji: 'i', hindi: 'इ', rowId: 'h-a-row' },
  { char: 'う', romaji: 'u', hindi: 'उ', rowId: 'h-a-row' },
  { char: 'え', romaji: 'e', hindi: 'ए', rowId: 'h-a-row' },
  { char: 'お', romaji: 'o', hindi: 'ओ', rowId: 'h-a-row' },
  { char: 'か', romaji: 'ka', hindi: 'क', rowId: 'h-ka-row' },
];

export default function HomePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [dueCount, setDueCount] = useState<number>(0);
  const [deckSize, setDeckSize] = useState<number>(0);
  const [progressStats, setProgressStats] = useState<CourseProgressStats | null>(null);

  useEffect(() => {
    const userProf = getUserProfile();
    const deck = getDeckCards();
    const todayStr = formatLocalDate();
    const due = getDueCards(deck, todayStr);
    const stats = calculateCourseProgress(userProf, deck, todayStr);

    setProfile(userProf);
    setDeckSize(deck.length);
    setDueCount(due.length);
    setProgressStats(stats);
  }, []);

  const totalLessons = unitsData.reduce((acc, u) => acc + u.lessons.length, 0);
  const completedLessons = profile?.completedLessons.length || 0;

  // Real curriculum statistics
  const kanaCompletedGroups = profile?.completedKanaGroups.length || 0;
  const kanaTotalGroups = 10;
  const kanaPct = Math.min(100, Math.round((kanaCompletedGroups / kanaTotalGroups) * 100));

  const vocabCompletedUnits = profile?.completedVocabUnits.length || 0;
  const vocabTotalUnits = 20;
  const vocabPct = Math.min(100, Math.round((vocabCompletedUnits / vocabTotalUnits) * 100));

  const kanjiCompletedGroups = (profile?.completedKanjiGroups || []).length;
  const kanjiTotalGroups = 5;
  const kanjiPct = Math.min(100, Math.round((kanjiCompletedGroups / kanjiTotalGroups) * 100));

  const grammarCompletedPoints = profile?.completedGrammarPoints.length || 0;
  const grammarTotalPoints = 25;
  const grammarPct = Math.min(100, Math.round((grammarCompletedPoints / grammarTotalPoints) * 100));

  // Overall course progress (combined Kana + Vocab + Kanji + Grammar = 60 items)
  const overallPercent = progressStats?.courseProgressPercent || 0;
  const totalCompletedItems =
    (progressStats?.kanaGroupsCompleted || 0) +
    (progressStats?.vocabUnitsCompleted || 0) +
    (progressStats?.kanjiGroupsCompleted || 0) +
    (progressStats?.grammarPointsCompleted || 0);

  // 7-day weekday streak row (सोम मंगल बुध गुरु शुक्र शनि रवि) derived from real data
  const streak = profile?.streakDays || 1;
  const todayStr = formatLocalDate();
  const weekDayItems = profile ? getWeekdayStreak(profile, todayStr) : [];

  // SVG Progress Ring calculations (r=26, circ=163.36)
  const ringRadius = 26;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const strokeDashoffset = ringCircumference - (overallPercent / 100) * ringCircumference;

  return (
    <div className="space-y-7">
      {/* PWA Install Banner */}
      <InstallPrompt />

      {/* Page Header */}
      <header className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-1">
        <div>
          <h1 className="text-[28px] font-semibold text-[#0D1B4B] font-hindi leading-[1.3]">
            नमस्ते, शिक्षार्थी
          </h1>
          <p className="text-[14px] text-[#5B6070] font-hindi leading-[1.5] mt-0.5">
            आज का जापानी अध्ययन और अभ्यास पूरा करें
          </p>
        </div>

        <div className="text-[13px] text-[#5B6070] font-hindi">
          दैनिक लक्ष्य: <span className="font-semibold text-[#0D1B4B]">{profile?.dailyGoalMinutes || 10} मिनट</span>
        </div>
      </header>

      {/* ── Section 1: Top 3 Compact Glass Cards (~150px tall each) ──── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Review Flashcards (Blue Glass) */}
        <div className="glass-blue p-4 sm:p-5 flex flex-col justify-between min-h-[150px] rounded-[12px]">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[11px] font-semibold text-[#1D4ED8] uppercase tracking-wider font-hindi block">
                स्मृति समीक्षा · SM-2
              </span>
              <div className="text-[20px] font-semibold text-[#0D1B4B] font-hindi leading-tight mt-0.5">
                {dueCount > 0 ? `${dueCount} कार्ड्स बाकी हैं` : 'सभी कार्ड्स पूरे'}
              </div>
            </div>
            <div className="w-8 h-8 rounded-[8px] bg-[#2563EB]/15 flex items-center justify-center text-[#2563EB] shrink-0">
              <RotateCw className="w-4 h-4" />
            </div>
          </div>

          <div className="pt-3 flex items-center justify-between gap-2 border-t border-[#2563EB]/20">
            {dueCount > 0 ? (
              <Link
                href="/review"
                className="h-9 px-3.5 rounded-[7px] bg-[#BC2025] hover:bg-[#8B1519] active:scale-[0.985] text-white text-[13px] font-medium transition-all inline-flex items-center gap-1.5 shadow-xs font-hindi"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>समीक्षा शुरू करें</span>
              </Link>
            ) : (
              <Link
                href="/review"
                className="h-9 px-3.5 rounded-[7px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[13px] font-medium transition-all inline-flex items-center gap-1.5 shadow-xs font-hindi"
              >
                <span>डेक देखें</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
            <span className="text-[12px] text-[#5B6070] font-hindi font-medium">
              {dueCount > 0 ? `~${Math.ceil(dueCount * 0.5)} मिनट` : `${deckSize} कुल कार्ड्स`}
            </span>
          </div>
        </div>

        {/* Card 2: Weekday Streak Row (Saffron Glass) */}
        <div className="glass-saffron p-4 sm:p-5 flex flex-col justify-between min-h-[150px] rounded-[12px]">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="text-[11px] font-semibold text-[#B45309] uppercase tracking-wider font-hindi block">
                अध्ययन लकीर · Streak
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-[22px] font-bold text-[#B45309] font-mono leading-none">
                  {streak}
                </span>
                <span className="text-[15px] font-semibold text-[#0D1B4B] font-hindi">
                  दिन लगातार
                </span>
              </div>
            </div>
            <div className="w-8 h-8 rounded-[8px] bg-[#FF9933]/20 flex items-center justify-center text-[#B45309] shrink-0">
              <Flame className="w-4 h-4" />
            </div>
          </div>

          {/* Weekday Row (सोम ... रवि) */}
          <div className="pt-2 border-t border-[#FF9933]/25 flex items-center justify-between gap-1">
            {weekDayItems.map((d, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-mono transition-all ${
                    d.isCompleted
                      ? 'bg-[#138808] text-white shadow-xs'
                      : d.isToday
                      ? 'ring-2 ring-[#2563EB] bg-white text-[#2563EB] font-bold'
                      : 'border border-[#E8E8EC] bg-white/70 text-[#5B6070]'
                  }`}
                  title={`${d.label} (${d.dateStr})`}
                >
                  {d.isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : ''}
                </div>
                <span className="text-[10px] text-[#5B6070] font-hindi leading-none">
                  {d.short}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: Overall Real Course Progress (Green Glass with Ring Gauge) */}
        <div className="glass-green p-4 sm:p-5 flex flex-col justify-between min-h-[150px] rounded-[12px]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-semibold text-[#138808] uppercase tracking-wider font-hindi block">
                संपूर्ण N5 प्रगति
              </span>
              <div className="text-[18px] font-semibold text-[#0D1B4B] font-hindi leading-tight mt-0.5">
                {totalCompletedItems} / 60 विषय
              </div>
              <p className="text-[11px] text-[#5B6070] font-hindi mt-0.5">
                काना, शब्द, कांजी व व्याकरण
              </p>
            </div>

            {/* Circular Progress Ring */}
            <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
              <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                <circle
                  cx="32"
                  cy="32"
                  r={ringRadius}
                  className="stroke-[#138808]/20"
                  strokeWidth="5"
                  fill="none"
                />
                <circle
                  cx="32"
                  cy="32"
                  r={ringRadius}
                  className="stroke-[#138808] transition-all duration-700 ease-out"
                  strokeWidth="5"
                  strokeDasharray={ringCircumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-[14px] text-[#0D1B4B]">
                {overallPercent}%
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-[#138808]/20 flex justify-between items-center text-[12px]">
            <span className="text-[#5B6070] font-hindi">पाठ: {completedLessons}/{totalLessons}</span>
            <Link
              href="/progress"
              className="text-[#138808] font-semibold font-hindi hover:underline flex items-center gap-1"
            >
              <span>विस्तार देखें</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Compact Next Lesson Bar ──────────────────────────────────── */}
      <div className="bg-white rounded-[12px] border border-[#E8E8EC] p-4 sm:p-4.5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-9 h-9 rounded-[8px] bg-[#2563EB]/12 text-[#2563EB] flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="glass-pill-blue text-[10px] font-hindi py-0.5 px-2">
                अगला अनुशंसित पाठ
              </span>
              <span className="text-[12px] text-[#5B6070] font-hindi">इकाई 1 · पाठ 1</span>
            </div>
            <h3 className="text-[15px] font-semibold text-[#0D1B4B] font-hindi mt-1">
              जापानी वाक्य संरचना और अभिवादन
            </h3>
          </div>
        </div>

        <Link
          href="/learn"
          className="py-2 px-4 rounded-[8px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-[13px] font-semibold font-hindi transition inline-flex items-center justify-center gap-1.5 shadow-xs shrink-0 cursor-pointer"
        >
          <span>सीखना शुरू करें</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* ── Section 2: Curriculum Practice Tiles (Colored Glass Boxes) ─ */}
      <section className="space-y-4">
        <div className="flex items-baseline justify-between">
          <div>
            <h2 className="text-[20px] font-semibold text-[#0D1B4B] font-hindi leading-tight">
              अभ्यास पाठ्यक्रम
            </h2>
            <p className="text-[13px] text-[#5B6070] font-hindi mt-0.5">
              JLPT N5 वर्णमाला, शब्दावली, कांजी और व्याकरण
            </p>
          </div>
          <Link
            href="/learn"
            className="text-[13px] text-[#2563EB] hover:underline font-hindi font-medium flex items-center gap-1"
          >
            <span>सभी देखें</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* 6 Category Tiles in Distinct Color Glass Styles */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Tile 1: Hiragana (Glass Red) */}
          <Link
            href="/learn"
            className="glass-red p-5 transition-all hover:scale-[1.01] flex flex-col justify-between space-y-4 group rounded-[12px]"
          >
            <div>
              <div className="flex justify-between items-start">
                <div className="w-9 h-9 rounded-[8px] bg-[#BC2025]/15 text-[#BC2025] flex items-center justify-center font-jp font-bold text-lg">
                  あ
                </div>
                <span className="text-[13px] font-mono text-[#BC2025] font-semibold">
                  {kanaPct}%
                </span>
              </div>
              <h3 className="text-[16px] font-semibold text-[#0D1B4B] font-hindi mt-3">
                हिरागाना (Hiragana)
              </h3>
              <p className="text-[13px] text-[#5B6070] font-hindi mt-0.5">
                46 मूल वर्ण व ध्वनियाँ
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-full bg-[#BC2025]/20 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-[#BC2025] h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(kanaPct, 5)}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[13px]">
                <span className="text-[#5B6070] font-hindi">मूल लिपि</span>
                <span className="text-[#BC2025] font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform font-hindi">
                  <span>जारी रखें</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </Link>

          {/* Tile 2: Katakana (Glass Saffron) */}
          <Link
            href="/learn"
            className="glass-saffron p-5 transition-all hover:scale-[1.01] flex flex-col justify-between space-y-4 group rounded-[12px]"
          >
            <div>
              <div className="flex justify-between items-start">
                <div className="w-9 h-9 rounded-[8px] bg-[#FF9933]/25 text-[#B45309] flex items-center justify-center font-jp font-bold text-lg">
                  ア
                </div>
                <span className="text-[13px] font-mono text-[#B45309] font-semibold">
                  {kanaPct}%
                </span>
              </div>
              <h3 className="text-[16px] font-semibold text-[#0D1B4B] font-hindi mt-3">
                काताकाना (Katakana)
              </h3>
              <p className="text-[13px] text-[#5B6070] font-hindi mt-0.5">
                विदेशी शब्द व लोनवर्ड्स
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-full bg-[#FF9933]/25 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-[#FF9933] h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(kanaPct, 5)}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[13px]">
                <span className="text-[#5B6070] font-hindi">लोनवर्ड्स अभ्यास</span>
                <span className="text-[#B45309] font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform font-hindi">
                  <span>जारी रखें</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </Link>

          {/* Tile 3: Vocabulary (Glass Green) */}
          <Link
            href="/learn"
            className="glass-green p-5 transition-all hover:scale-[1.01] flex flex-col justify-between space-y-4 group rounded-[12px]"
          >
            <div>
              <div className="flex justify-between items-start">
                <div className="w-9 h-9 rounded-[8px] bg-[#138808]/15 text-[#138808] flex items-center justify-center font-jp font-bold text-lg">
                  語
                </div>
                <span className="text-[13px] font-mono text-[#138808] font-semibold">
                  {vocabPct}%
                </span>
              </div>
              <h3 className="text-[16px] font-semibold text-[#0D1B4B] font-hindi mt-3">
                शब्दावली (Vocabulary)
              </h3>
              <p className="text-[13px] text-[#5B6070] font-hindi mt-0.5">
                200 आवश्यक शब्द · 20 इकाइयाँ
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-full bg-[#138808]/20 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-[#138808] h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(vocabPct, 5)}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[13px]">
                <span className="text-[#5B6070] font-hindi">{vocabCompletedUnits} / 20 पूर्ण</span>
                <span className="text-[#138808] font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform font-hindi">
                  <span>जारी रखें</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </Link>

          {/* Tile 4: Kanji (Glass Blue) */}
          <Link
            href="/learn"
            className="glass-blue p-5 transition-all hover:scale-[1.01] flex flex-col justify-between space-y-4 group rounded-[12px]"
          >
            <div>
              <div className="flex justify-between items-start">
                <div className="w-9 h-9 rounded-[8px] bg-[#2563EB]/15 text-[#2563EB] flex items-center justify-center font-jp font-bold text-lg">
                  字
                </div>
                <span className="text-[13px] font-mono text-[#1D4ED8] font-semibold">
                  {kanjiPct}%
                </span>
              </div>
              <h3 className="text-[16px] font-semibold text-[#0D1B4B] font-hindi mt-3">
                कांजी (Kanji)
              </h3>
              <p className="text-[13px] text-[#5B6070] font-hindi mt-0.5">
                50 मुख्य कांजी · 5 समूह
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-full bg-[#2563EB]/20 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-[#2563EB] h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(kanjiPct, 5)}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[13px]">
                <span className="text-[#5B6070] font-hindi">{kanjiCompletedGroups} / 5 पूर्ण</span>
                <span className="text-[#1D4ED8] font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform font-hindi">
                  <span>जारी रखें</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </Link>

          {/* Tile 5: Grammar (Glass Purple) */}
          <Link
            href="/learn"
            className="glass-purple p-5 transition-all hover:scale-[1.01] flex flex-col justify-between space-y-4 group rounded-[12px]"
          >
            <div>
              <div className="flex justify-between items-start">
                <div className="w-9 h-9 rounded-[8px] bg-[#7C3AED]/15 text-[#7C3AED] flex items-center justify-center font-jp font-bold text-lg">
                  文
                </div>
                <span className="text-[13px] font-mono text-[#6D28D9] font-semibold">
                  {grammarPct}%
                </span>
              </div>
              <h3 className="text-[16px] font-semibold text-[#0D1B4B] font-hindi mt-3">
                व्याकरण (Grammar)
              </h3>
              <p className="text-[13px] text-[#5B6070] font-hindi mt-0.5">
                25 N5 सूत्र व उदाहरण
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-full bg-[#7C3AED]/20 rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-[#7C3AED] h-full rounded-full transition-all duration-300"
                  style={{ width: `${Math.max(grammarPct, 5)}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-[13px]">
                <span className="text-[#5B6070] font-hindi">{grammarCompletedPoints} / 25 पूर्ण</span>
                <span className="text-[#6D28D9] font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform font-hindi">
                  <span>जारी रखें</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </Link>

          {/* Tile 6: AI Sensei (Glass Teal) */}
          <Link
            href="/tutor"
            className="glass-teal p-5 transition-all hover:scale-[1.01] flex flex-col justify-between space-y-4 group rounded-[12px]"
          >
            <div>
              <div className="flex justify-between items-start">
                <div className="w-9 h-9 rounded-[8px] bg-[#0D9488]/15 text-[#0D9488] flex items-center justify-center font-jp font-bold text-lg">
                  問
                </div>
                <span className="glass-pill-teal text-[10px] py-0.5 px-2">
                  ऑनलाइन
                </span>
              </div>
              <h3 className="text-[16px] font-semibold text-[#0D1B4B] font-hindi mt-3">
                एआई ट्यूटर (AI Sensei)
              </h3>
              <p className="text-[13px] text-[#5B6070] font-hindi mt-0.5">
                हिंदी में सवाल पूछें व संदेह दूर करें
              </p>
            </div>

            <div className="pt-3 border-t border-[#0D9488]/20 flex justify-between items-center text-[13px]">
              <span className="text-[#5B6070] font-hindi">24/7 शिक्षक</span>
              <span className="text-[#0F766E] font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform font-hindi">
                <span>बातचीत करें</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* ── Section 3: Foundation Insights & Characters ────────────────── */}
      <section className="space-y-4">
        <div>
          <h2 className="text-[20px] font-semibold text-[#0D1B4B] font-hindi leading-tight">
            दैनिक अभ्यास व अंतर्दृष्टि
          </h2>
          <p className="text-[13px] text-[#5B6070] font-hindi mt-0.5">
            मूलभूत नियम और हाल के अक्षर
          </p>
        </div>

        {/* Flattened Single Card with divided rows */}
        <div className="bg-white rounded-[12px] border border-[#E8E8EC] shadow-xs divide-y divide-[#E8E8EC]">
          {/* Row 1: Sentence Structure Formula */}
          <div className="p-5 sm:p-6 space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-semibold text-[#0D1B4B] font-hindi">
                वाक्य संरचना नियम
              </h3>
              <span className="text-[13px] text-[#5B6070] font-mono">
                SOV Pattern
              </span>
            </div>

            <p className="text-[15px] text-[#5B6070] font-hindi leading-[1.5]">
              हिंदी और जापानी दोनों में <span className="font-semibold text-[#0D1B4B]">क्रिया (Verb) हमेशा वाक्य के अंत में</span> आती है।
            </p>

            <div className="bg-[#F4F4F6] rounded-[8px] p-3.5 text-[13px] font-mono space-y-1 text-[#0D1B4B] border border-[#E8E8EC]">
              <div>
                <span className="text-[#5B6070] font-hindi">हिंदी: </span>
                <span className="text-[#BC2025]">मैं</span> <span className="text-[#138808]">किताब</span> <span className="text-[#0D1B4B] font-semibold">पढ़ता हूँ</span>।
              </div>
              <div>
                <span className="text-[#5B6070] font-hindi">जापानी: </span>
                <span className="text-[#BC2025]">Watashi wa</span> <span className="text-[#138808]">hon o</span> <span className="text-[#0D1B4B] font-semibold">yomimasu</span>.
              </div>
            </div>
          </div>

          {/* Row 2: Foundational Characters */}
          <div className="p-5 sm:p-6 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-[16px] font-semibold text-[#0D1B4B] font-hindi">
                  मूल स्वर वर्ण
                </h3>
                <p className="text-[13px] text-[#5B6070] font-hindi mt-0.5">
                  हिरागाना A-पङ्क्ति के आवश्यक वर्ण
                </p>
              </div>

              <Link
                href="/learn"
                className="text-[13px] text-[#2563EB] hover:underline font-hindi font-medium flex items-center gap-1"
              >
                <span>वर्णमाला चार्ट</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 pt-1">
              {FOUNDATIONAL_CHARS.map((item) => {
                const isLearned = profile?.completedKanaGroups.includes(item.rowId);

                return (
                  <Link
                    key={item.char}
                    href="/learn"
                    className={`flex flex-col items-center justify-center p-3 rounded-[8px] border transition-colors ${
                      isLearned
                        ? 'bg-[#138808]/8 border-[#138808]/30'
                        : 'bg-[#F4F4F6] border-[#E8E8EC] hover:border-[#2563EB]/40'
                    }`}
                  >
                    <span className="text-[22px] font-bold font-jp text-[#0D1B4B] leading-tight">
                      {item.char}
                    </span>
                    <span className="text-[12px] font-mono text-[#5B6070] mt-0.5">
                      /{item.romaji}/
                    </span>
                    <span className="text-[12px] font-semibold text-[#0D1B4B] font-hindi">
                      {item.hindi}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
