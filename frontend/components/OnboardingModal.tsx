'use client';

import React, { useState, useEffect } from 'react';
import { getUserProfile, setDailyGoal } from '@/lib/storage';

interface OnboardingModalProps {
  onComplete?: () => void;
}

export default function OnboardingModal({ onComplete }: OnboardingModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<number>(10);

  useEffect(() => {
    const profile = getUserProfile();
    if (!profile.onboarded) {
      setIsOpen(true);
    }
  }, []);

  const handleSave = () => {
    setDailyGoal(selectedGoal);
    setIsOpen(false);
    if (onComplete) {
      onComplete();
    }
  };

  if (!isOpen) return null;

  const goalOptions = [
    {
      minutes: 5,
      label: '5 मिनट / दिन',
      subtext: 'हल्की शुरुआत (Casual)',
      emoji: '🌱',
    },
    {
      minutes: 10,
      label: '10 मिनट / दिन',
      subtext: 'संतुलित गति (Recommended)',
      emoji: '🎯',
      badge: 'सबसे लोकप्रिय',
    },
    {
      minutes: 20,
      label: '20 मिनट / दिन',
      subtext: 'तेज तैयारी (Intensive)',
      emoji: '⚡',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-stone-100 text-center">
        {/* Header Icon */}
        <div className="w-16 h-16 mx-auto mb-4 bg-rose-50 rounded-2xl flex items-center justify-center border border-rose-100">
          <span className="text-3xl font-jp font-bold text-rose-600">日</span>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-stone-800 mb-1">
          इराशाइमासे! (いらっしゃいませ)
        </h2>
        <p className="text-sm text-stone-600 mb-6 leading-relaxed">
          जापानी भाषा सीखें — अपनी मातृभाषा <span className="font-semibold text-rose-600">हिंदी</span> के ज़रिए। JLPT N5 तक का सफर अब आसान!
        </p>

        {/* Goal Selector */}
        <div className="text-left mb-6">
          <label className="block text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">
            अपना दैनिक लक्ष्य चुनें:
          </label>
          <div className="space-y-2.5">
            {goalOptions.map((opt) => {
              const isSelected = selectedGoal === opt.minutes;
              return (
                <button
                  key={opt.minutes}
                  type="button"
                  onClick={() => setSelectedGoal(opt.minutes)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'border-rose-500 bg-rose-50/70 shadow-sm ring-2 ring-rose-400/20'
                      : 'border-stone-200 bg-stone-50/50 hover:bg-stone-50 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{opt.emoji}</span>
                    <div>
                      <div className="font-semibold text-sm text-stone-800">
                        {opt.label}
                      </div>
                      <div className="text-xs text-stone-500">{opt.subtext}</div>
                    </div>
                  </div>
                  {opt.badge && (
                    <span className="text-[10px] uppercase font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
                      {opt.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={handleSave}
          className="w-full py-3.5 px-4 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-semibold rounded-2xl shadow-md shadow-rose-200 transition-all cursor-pointer"
        >
          सीखना शुरू करें 🚀
        </button>
      </div>
    </div>
  );
}
