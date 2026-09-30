'use client';

import React, { useState, useEffect } from 'react';
import { VocabItem } from '@/types';
import { createInitialCard } from '@/lib/sm2';
import {
  addCardToDeck,
  addCardsToDeck,
  getDeckCards,
  markVocabUnitCompleted,
  isVocabUnitCompleted,
} from '@/lib/storage';
import { vocabToQuizItems, QuizItem } from '@/lib/quiz';
import Quiz from '@/components/Quiz';

interface VocabUnitViewProps {
  unitId: string;
  unitTitleHindi: string;
  items: VocabItem[];
  allVocab: VocabItem[];
  onClose: () => void;
  onRefresh?: () => void;
}

export default function VocabUnitView({
  unitId,
  unitTitleHindi,
  items,
  allVocab,
  onClose,
  onRefresh,
}: VocabUnitViewProps) {
  const [deckIds, setDeckIds] = useState<Set<string>>(new Set());
  const [audioError, setAudioError] = useState<string | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<QuizItem[] | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [quizResultNotice, setQuizResultNotice] = useState<string | null>(null);

  useEffect(() => {
    refreshDeck();
    setIsCompleted(isVocabUnitCompleted(unitId));
  }, [unitId]);

  const refreshDeck = () => {
    const deck = getDeckCards();
    setDeckIds(new Set(deck.map((c) => c.id)));
  };

  const handlePlayAudio = (kanaText: string) => {
    setAudioError(null);
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setAudioError('आपके ब्राउज़र में जापानी आवाज़ उपलब्ध नहीं है।');
      return;
    }
    try {
      window.speechSynthesis.cancel();
      // Always speak kana reading
      const utterance = new SpeechSynthesisUtterance(kanaText);
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

  const handleAddWordToDeck = (word: VocabItem) => {
    const card = createInitialCard(word.id, 'vocab');
    addCardToDeck(card);
    refreshDeck();
    if (onRefresh) onRefresh();
  };

  const handleAddAllToDeck = () => {
    const cards = items.map((w) => createInitialCard(w.id, 'vocab'));
    addCardsToDeck(cards);
    refreshDeck();
    if (onRefresh) onRefresh();
  };

  const handleStartQuiz = () => {
    const quizItems = vocabToQuizItems(items);
    setActiveQuiz(quizItems);
  };

  const allVocabQuizPool = vocabToQuizItems(allVocab);
  const allInDeck = items.every((w) => deckIds.has(`vocab:${w.id}`));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl border border-stone-200 text-left relative max-h-[90vh] overflow-y-auto space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-100 pb-3">
          <div>
            <span className="text-[10px] uppercase font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">
              शब्दावली • {items.length} शब्द
            </span>
            <h2 className="text-lg font-bold text-stone-900 mt-1 font-hindi">
              {unitTitleHindi}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center text-sm font-bold transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Action Buttons: Add All to Deck & Quiz */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleAddAllToDeck}
            className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-semibold border transition cursor-pointer flex items-center justify-center gap-1 ${
              allInDeck
                ? 'bg-stone-50 text-stone-400 border-stone-200'
                : 'bg-stone-900 hover:bg-black text-white border-transparent shadow-sm'
            }`}
          >
            <span>{allInDeck ? '✓ सभी १० डेक में हैं' : '🎴 सभी १० डेक में जोड़ें'}</span>
          </button>

          <button
            type="button"
            onClick={handleStartQuiz}
            className="flex-1 py-2.5 px-3 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs font-semibold transition cursor-pointer flex items-center justify-center gap-1 shadow-md shadow-rose-200"
          >
            <span>🎯 यूनिट क्विज़ लें</span>
          </button>
        </div>

        {audioError && (
          <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-2.5">
            ⚠️ {audioError}
          </p>
        )}

        {quizResultNotice && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-medium">
            {quizResultNotice}
          </div>
        )}

        {/* Words List */}
        <div className="space-y-3 pt-1">
          {items.map((word) => {
            const inDeck = deckIds.has(`vocab:${word.id}`);

            return (
              <div
                key={word.id}
                className="bg-stone-50/80 hover:bg-white border border-stone-200 rounded-2xl p-3.5 space-y-2 transition-all shadow-xs"
              >
                {/* Top Row: Word & Actions */}
                <div className="flex items-start justify-between">
                  <div>
                    {/* Primary: Kana Reading */}
                    <div className="text-xl font-bold font-jp text-stone-900 leading-tight">
                      {word.kana}
                    </div>
                    {/* Secondary: Kanji (if present) */}
                    {word.kanji && (
                      <div className="text-xs text-stone-400 font-jp font-medium">
                        कांजी: {word.kanji}
                      </div>
                    )}
                    <div className="text-xs font-mono text-stone-500 mt-0.5">
                      /{word.romaji}/
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Audio Button (Always speaks Kana) */}
                    <button
                      type="button"
                      onClick={() => handlePlayAudio(word.kana)}
                      className="p-2 bg-white hover:bg-rose-50 text-stone-700 hover:text-rose-600 rounded-xl border border-stone-200 text-xs transition cursor-pointer"
                      title="उच्चारण सुनें"
                    >
                      🔊
                    </button>

                    {/* Add to Deck Button */}
                    <button
                      type="button"
                      onClick={() => handleAddWordToDeck(word)}
                      disabled={inDeck}
                      className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold border transition ${
                        inDeck
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : 'bg-white text-stone-700 border-stone-200 hover:border-stone-400'
                      }`}
                    >
                      {inDeck ? '✓ डेक में' : '+ डेक'}
                    </button>
                  </div>
                </div>

                {/* Meanings */}
                <div className="pt-1 border-t border-stone-200/60">
                  <div className="text-xs font-bold text-rose-700 font-hindi">
                    {word.hindiMeaning}
                  </div>
                  <div className="text-[11px] text-stone-500">
                    English: {word.englishMeaning}
                  </div>
                </div>

                {/* Example Sentence */}
                <div className="bg-white p-2.5 rounded-xl border border-stone-200/70 text-xs space-y-0.5">
                  <div className="font-bold font-jp text-stone-800">
                    {word.exampleJp}
                  </div>
                  <div className="text-[10px] font-mono text-stone-400">
                    {word.exampleRomaji}
                  </div>
                  <div className="text-[11px] text-stone-600 font-hindi">
                    {word.exampleHindi}
                  </div>
                </div>

                {/* Nuance Note (if present) */}
                {word.note && (
                  <div className="text-[11px] text-amber-800 bg-amber-50/80 p-2 rounded-xl border border-amber-200/60 font-hindi">
                    💡 {word.note}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Quiz Modal */}
        {activeQuiz && (
          <Quiz
            items={activeQuiz}
            allPool={allVocabQuizPool}
            titleHindi={unitTitleHindi}
            onClose={() => {
              setActiveQuiz(null);
              // Check completion on exit or quiz success
              markVocabUnitCompleted(unitId);
              setIsCompleted(true);
              setQuizResultNotice('🎉 बधाई! इस शब्दावली यूनिट का क्विज़ पूरा हुआ और प्रगति में दर्ज कर लिया गया।');
              if (onRefresh) onRefresh();
            }}
          />
        )}
      </div>
    </div>
  );
}
