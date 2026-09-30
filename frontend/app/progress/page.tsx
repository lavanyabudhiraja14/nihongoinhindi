'use client';

import React, { useState, useEffect } from 'react';
import { getUserProfile, setDailyGoal, resetProgress, getDeckCards } from '@/lib/storage';
import { UserProfile } from '@/types';
import { SM2Card, formatLocalDate } from '@/lib/sm2';
import { calculateCourseProgress, CourseProgressStats } from '@/lib/progress';

export default function ProgressPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [deckCards, setDeckCards] = useState<SM2Card[]>([]);
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  useEffect(() => {
    const p = getUserProfile();
    const cards = getDeckCards();
    setProfile(p);
    setDeckCards(cards);
  }, []);

  const stats: CourseProgressStats = profile
    ? calculateCourseProgress(profile, deckCards, formatLocalDate())
    : {
        currentStreak: 1,
        longestStreak: 1,
        kanaGroupsCompleted: 0,
        totalKanaGroups: 10,
        vocabUnitsCompleted: 0,
        totalVocabUnits: 20,
        kanjiGroupsCompleted: 0,
        totalKanjiGroups: 5,
        grammarPointsCompleted: 0,
        totalGrammarPoints: 25,
        cardsInDeck: 0,
        cardsReviewedToday: 0,
        courseProgressPercent: 0,
      };

  const handleGoalChange = (minutes: number) => {
    const updated = setDailyGoal(minutes);
    setProfile({ ...updated });
  };

  const handleReset = () => {
    const fresh = resetProgress();
    setProfile({ ...fresh });
    setDeckCards([]);
    setShowConfirmReset(false);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-10">
      {/* Header */}
      <header className="pb-2 border-b border-[#E8E8EC]">
        <span className="glass-pill-saffron font-hindi">
          प्रगति रिपोर्ट
        </span>
        <h1 className="text-[28px] font-semibold text-[#0D1B4B] font-hindi leading-tight mt-2">
          आपकी अध्ययन स्थिति
        </h1>
        <p className="text-[13px] text-[#5B6070] mt-0.5">
          Learning Progress & Daily Goal Tracking
        </p>
      </header>

      {/* Primary Streak & Deck Stats Grid (Glass Tiles) */}
      <div className="grid grid-cols-2 gap-3.5">
        <div className="glass-saffron p-5 rounded-[12px] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold text-[#B45309] font-hindi">लकीर (Streak)</span>
            <span className="text-[11px] text-[#B45309]/80 font-mono">
              सर्वश्रेष्ठ: {stats.longestStreak} दिन
            </span>
          </div>
          <div className="mt-3">
            <span className="text-[32px] font-bold text-[#B45309] font-mono leading-none">
              {stats.currentStreak}
            </span>
            <span className="text-[13px] text-[#B45309] font-hindi block mt-1 font-medium">दिन लगातार अध्ययन</span>
          </div>
        </div>

        <div className="glass-green p-5 rounded-[12px] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold text-[#138808] font-hindi">समीक्षा डेक (Deck)</span>
            <span className="glass-pill-green text-[10px]">
              आज: {stats.cardsReviewedToday}
            </span>
          </div>
          <div className="mt-3">
            <span className="text-[32px] font-bold text-[#138808] font-mono leading-none">
              {stats.cardsInDeck}
            </span>
            <span className="text-[13px] text-[#138808] font-hindi block mt-1 font-medium">सक्रिय फ्लैशकार्ड्स</span>
          </div>
        </div>
      </div>

      {/* Honest App Content Progress Overview */}
      <div className="bg-white rounded-[12px] p-6 border border-[#E8E8EC] shadow-xs space-y-5">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-[16px] text-[#0D1B4B] font-hindi leading-tight">
              इस ऐप की सामग्री प्रगति
            </h3>
            <span className="text-[12px] text-[#5B6070] block mt-0.5">
              Curriculum Progress (Real Data)
            </span>
          </div>
          <span className="text-[18px] font-bold text-[#BC2025] font-mono">
            {stats.courseProgressPercent}%
          </span>
        </div>

        <div className="w-full bg-[#F4F4F6] rounded-full h-2.5 overflow-hidden border border-[#E8E8EC]">
          <div
            className="bg-[#BC2025] h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${Math.max(stats.courseProgressPercent, 3)}%` }}
          />
        </div>

        <p className="text-[12px] text-[#5B6070] italic font-hindi">
          * यह प्रगति इस ऐप में उपलब्ध काना, शब्दावली और व्याकरण सामग्री पर आधारित है।
        </p>

        {/* Detailed Breakdown Mini Cards */}
        <div className="grid grid-cols-3 gap-2.5 pt-1 text-center">
          <div className="p-3 bg-[#F4F4F6] rounded-[8px] border border-[#E8E8EC]">
            <div className="text-[18px] font-bold text-[#0D1B4B] font-mono">
              {stats.kanaGroupsCompleted}
            </div>
            <div className="text-[11px] text-[#5B6070] font-hindi mt-0.5">काना वर्ग</div>
          </div>
          <div className="p-3 bg-[#F4F4F6] rounded-[8px] border border-[#E8E8EC]">
            <div className="text-[18px] font-bold text-[#0D1B4B] font-mono">
              {stats.vocabUnitsCompleted} <span className="text-[12px] text-[#5B6070] font-normal">/ {stats.totalVocabUnits}</span>
            </div>
            <div className="text-[11px] text-[#5B6070] font-hindi mt-0.5">शब्दावली इकाइयाँ</div>
          </div>
          <div className="p-3 bg-[#F4F4F6] rounded-[8px] border border-[#E8E8EC]">
            <div className="text-[18px] font-bold text-[#0D1B4B] font-mono">
              {stats.grammarPointsCompleted} <span className="text-[12px] text-[#5B6070] font-normal">/ {stats.totalGrammarPoints}</span>
            </div>
            <div className="text-[11px] text-[#5B6070] font-hindi mt-0.5">व्याकरण बिंदु</div>
          </div>
        </div>
      </div>

      {/* Daily Goal Settings */}
      <div className="bg-white rounded-[12px] p-6 border border-[#E8E8EC] shadow-xs space-y-4">
        <div>
          <h3 className="font-semibold text-[16px] text-[#0D1B4B] font-hindi leading-tight">
            दैनिक अध्ययन लक्ष्य बदलें
          </h3>
          <span className="text-[12px] text-[#5B6070] block mt-0.5">
            Daily Study Goal
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {[5, 10, 20].map((mins) => {
            const isSelected = profile?.dailyGoalMinutes === mins;
            return (
              <button
                key={mins}
                type="button"
                onClick={() => handleGoalChange(mins)}
                className={`py-2.5 px-3 rounded-[8px] text-[13px] font-semibold font-hindi transition cursor-pointer border-[1.5px] ${
                  isSelected
                    ? 'border-[#0D1B4B] bg-[#0D1B4B]/[0.10] text-[#0D1B4B] shadow-xs'
                    : 'border-[#E8E8EC] bg-[#F4F4F6] text-[#5B6070] hover:text-[#0D1B4B] hover:bg-[#E8E8EC]'
                }`}
              >
                {mins} मिनट
              </button>
            );
          })}
        </div>
      </div>

      {/* Reset Progress Section */}
      <div className="pt-2">
        {!showConfirmReset ? (
          <button
            type="button"
            onClick={() => setShowConfirmReset(true)}
            className="w-full py-2.5 text-[13px] font-semibold text-[#5B6070] hover:text-[#BC2025] transition cursor-pointer font-hindi"
          >
            डेटा रीसेट करें (Reset Progress)
          </button>
        ) : (
          <div className="glass-red p-4 rounded-[12px] text-center space-y-3">
            <p className="text-[13px] text-[#BC2025] font-semibold font-hindi">
              क्या आप सच में अपनी सारी प्रगति रीसेट करना चाहते हैं?
            </p>
            <div className="flex gap-2.5 justify-center">
              <button
                type="button"
                onClick={() => setShowConfirmReset(false)}
                className="px-4 py-1.5 bg-white border border-[#E8E8EC] text-[#0D1B4B] rounded-[6px] text-[13px] font-hindi font-medium cursor-pointer"
              >
                रद्द करें
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-1.5 bg-[#BC2025] text-white rounded-[6px] text-[13px] font-hindi font-semibold hover:bg-[#8B1519] cursor-pointer"
              >
                हाँ, रीसेट करें
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
