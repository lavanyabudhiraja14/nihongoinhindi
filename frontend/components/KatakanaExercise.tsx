'use client';

import React, { useState, useEffect } from 'react';
import loanwordsData from '@/content/loanwords.json';
import { LoanwordExerciseItem } from '@/types';
import { createInitialCard } from '@/lib/sm2';
import { addCardToDeck, isCardInDeck, addCardsToDeck } from '@/lib/storage';
import { loanwordsToQuizItems, QuizItem } from '@/lib/quiz';
import Quiz from '@/components/Quiz';

export default function KatakanaExercise() {
  const items = loanwordsData as LoanwordExerciseItem[];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [inDeck, setInDeck] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<QuizItem[] | null>(null);

  const current = items[currentIndex];

  useEffect(() => {
    if (current) {
      setInDeck(isCardInDeck(`loanword:${current.id}`));
    }
  }, [current, currentIndex]);

  const handleNext = () => {
    setIsRevealed(false);
    setAudioError(null);
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const handlePrev = () => {
    setIsRevealed(false);
    setAudioError(null);
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  const handlePlayAudio = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAudioError(null);

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setAudioError('आपके ब्राउज़र में जापानी आवाज़ उपलब्ध नहीं है।');
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(current.word);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.85;
      utterance.onerror = () => {
        setAudioError('आपके ब्राउज़र में जापानी आवाज़ उपलब्ध नहीं है।');
      };
      window.speechSynthesis.speak(utterance);
    } catch {
      setAudioError('आपके ब्राउज़र में जापानी आवाज़ उपलब्ध नहीं है।');
    }
  };

  const handleAddToDeck = (e: React.MouseEvent) => {
    e.stopPropagation();
    const card = createInitialCard(current.id, 'loanword');
    addCardToDeck(card);
    setInDeck(true);
  };

  const handleAddAllToDeck = () => {
    const cards = items.map((lw) => createInitialCard(lw.id, 'loanword'));
    addCardsToDeck(cards);
    setInDeck(true);
  };

  const handleStartQuiz = () => {
    const quizItems = loanwordsToQuizItems(items);
    setActiveQuiz(quizItems);
  };

  const allLoanwordQuizItems = loanwordsToQuizItems(items);

  return (
    <div className="space-y-4">
      {/* Exercise Info Banner & Group Action Buttons */}
      <div className="p-4 bg-white rounded-[12px] border border-[#E8E8EC] text-[13px] text-[#0D1B4B]/80 space-y-3 font-hindi shadow-xs">
        <p>
          <strong className="text-[#0D1B4B]">शब्द पहचान अभ्यास (20 Loanwords):</strong> जापानी काताकाना शब्द पढ़ें और अर्थ जांचने के लिए कार्ड पर टैप करें।
        </p>
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={handleAddAllToDeck}
            className="flex-1 py-2 px-3 bg-[#0D1B4B] hover:bg-[#081232] text-white text-[12px] font-semibold rounded-[6px] transition cursor-pointer"
          >
            सभी २० डेक में जोड़ें
          </button>
          <button
            type="button"
            onClick={handleStartQuiz}
            className="flex-1 py-2 px-3 glass-red hover:bg-[#BC2025]/20 text-[#BC2025] text-[12px] font-semibold rounded-[6px] transition cursor-pointer"
          >
            क्विज़ लें (Quiz Loanwords)
          </button>
        </div>
      </div>

      {/* Progress & Counter */}
      <div className="flex justify-between items-center text-[13px] font-medium text-[#5B6070] px-1 font-hindi">
        <span>शब्द (<strong className="text-[#0D1B4B] font-mono">{currentIndex + 1}</strong> / {items.length})</span>
        <button
          type="button"
          onClick={handleAddToDeck}
          disabled={inDeck}
          className={`px-3 py-1 rounded-[6px] text-[12px] font-semibold border transition font-hindi ${
            inDeck
              ? 'bg-emerald-50 text-[#138808] border-emerald-300'
              : 'bg-[#F4F4F6] text-[#0D1B4B] border-[#E8E8EC] hover:border-[#0D1B4B]/30'
          }`}
        >
          {inDeck ? '✓ डेक में है' : '+ डेक में जोड़ें'}
        </button>
      </div>

      {/* Interactive Word Card */}
      <div
        onClick={() => setIsRevealed(!isRevealed)}
        className="w-full min-h-[280px] bg-white rounded-[12px] border border-[#E8E8EC] shadow-xs p-6 flex flex-col justify-between items-center text-center cursor-pointer transition-all hover:border-[#0D1B4B]/30 select-none"
      >
        <div className="w-full flex justify-between items-center text-[13px] text-[#5B6070] font-hindi">
          <span>{isRevealed ? 'उत्तर (Answer)' : 'प्रश्न (Word)'}</span>
          <button
            type="button"
            onClick={handlePlayAudio}
            className="text-[12px] bg-[#F4F4F6] hover:bg-[#E8E8EC] text-[#0D1B4B] px-3 py-1 rounded-[6px] font-medium transition flex items-center gap-1.5 cursor-pointer border border-[#E8E8EC]"
          >
            <span>उच्चारण</span>
          </button>
        </div>

        {/* Word Display */}
        <div className="my-auto py-3 space-y-2 w-full max-w-md mx-auto">
          <div className="text-[40px] font-bold font-jp text-[#0D1B4B] tracking-wide">
            {current.word}
          </div>

          {!isRevealed ? (
            <div className="text-[13px] text-[#5B6070] mt-2 font-hindi">
              (अर्थ देखने के लिए कार्ड को छुएं)
            </div>
          ) : (
            <div className="space-y-2.5 pt-2 text-left glass-navy p-4 rounded-[12px] w-full">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#5B6070] block">उच्चारण / Romaji</span>
                <div className="text-[15px] font-mono font-bold text-[#0D1B4B]">
                  /{current.romaji}/
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-[#5B6070] block font-hindi">अर्थ (Hindi & English)</span>
                <div className="text-[16px] font-bold text-[#0D1B4B] font-hindi">
                  {current.hindiMeaning}
                </div>
                <div className="text-[12px] text-[#5B6070] mt-0.5">
                  English: {current.englishMeaning}
                </div>
              </div>

              {current.noteHindi && (
                <div className="text-[12px] text-[#0D1B4B] bg-white/80 p-2.5 rounded-[8px] border border-[#0D1B4B]/15 font-hindi">
                  ℹ️ {current.noteHindi}
                </div>
              )}
            </div>
          )}
        </div>

        {audioError && (
          <p className="text-[11px] text-[#B45309] bg-amber-50 rounded-[6px] px-2.5 py-1 border border-amber-200">
            {audioError}
          </p>
        )}

        <div className="text-[12px] text-[#5B6070] font-hindi">
          {isRevealed ? 'अगले शब्द के लिए नीचे बटन दबाएँ' : 'उत्तर देखने के लिए टैप करें'}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handlePrev}
          className="flex-1 py-2.5 bg-[#F4F4F6] hover:bg-[#E8E8EC] text-[#0D1B4B] font-semibold rounded-[8px] text-[13px] transition cursor-pointer border border-[#E8E8EC] font-hindi"
        >
          ← पिछला (Previous)
        </button>
        <button
          type="button"
          onClick={handleNext}
          className="flex-1 py-2.5 bg-[#BC2025] hover:bg-[#8B1519] active:bg-[#6B0F13] text-white font-semibold rounded-[8px] text-[13px] transition shadow-xs cursor-pointer font-hindi"
        >
          अगला (Next) →
        </button>
      </div>

      {/* Loanwords Quiz Modal */}
      {activeQuiz && (
        <Quiz
          items={activeQuiz}
          allPool={allLoanwordQuizItems}
          titleHindi="काताकाना लोनवर्ड्स"
          onClose={() => setActiveQuiz(null)}
        />
      )}
    </div>
  );
}
