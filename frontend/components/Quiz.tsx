'use client';

import React, { useState, useEffect } from 'react';
import {
  QuizItem,
  QuizMode,
  generateOptions,
  checkTypedAnswer,
  shuffleArray,
  FEEDBACK_MESSAGES,
} from '@/lib/quiz';
import { markDailyActivity } from '@/lib/storage';

interface QuizProps {
  items: QuizItem[];
  allPool: QuizItem[];
  titleHindi: string;
  onClose: () => void;
}

export default function Quiz({ items, allPool, titleHindi, onClose }: QuizProps) {
  const [mode, setMode] = useState<QuizMode>('jp-to-romaji');
  const [quizQueue, setQuizQueue] = useState<QuizItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [typedInput, setTypedInput] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [currentOptions, setCurrentOptions] = useState<string[]>([]);

  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [missedItems, setMissedItems] = useState<QuizItem[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  // Initialize quiz queue on mount or restart
  useEffect(() => {
    startQuiz(items, mode);
  }, [items, mode]);

  const startQuiz = (sourceItems: QuizItem[], currentMode: QuizMode) => {
    const shuffled = shuffleArray(sourceItems);
    setQuizQueue(shuffled);
    setCurrentIndex(0);
    setScore({ correct: 0, total: 0 });
    setMissedItems([]);
    setIsFinished(false);
    resetQuestionState();

    if (shuffled.length > 0 && currentMode !== 'typing') {
      const opts = generateOptions(shuffled[0], allPool, currentMode);
      setCurrentOptions(opts);
    }
  };

  const resetQuestionState = () => {
    setSelectedOption(null);
    setTypedInput('');
    setIsAnswered(false);
    setIsCorrect(false);
  };

  const currentItem = quizQueue[currentIndex];

  const handleSelectOption = (option: string) => {
    if (isAnswered || !currentItem) return;

    setSelectedOption(option);
    setIsAnswered(true);

    let correct = false;
    if (mode === 'romaji-to-jp') {
      correct = option === currentItem.prompt;
    } else {
      correct = option === currentItem.answerRomaji || option === currentItem.answer;
    }

    setIsCorrect(correct);
    updateScore(correct);
  };

  const handleSubmitTyped = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAnswered || !currentItem || !typedInput.trim()) return;

    setIsAnswered(true);
    const correct = checkTypedAnswer(typedInput, currentItem);
    setIsCorrect(correct);
    updateScore(correct);
  };

  const updateScore = (correct: boolean) => {
    setScore((prev) => ({
      correct: prev.correct + (correct ? 1 : 0),
      total: prev.total + 1,
    }));

    if (!correct && currentItem) {
      setMissedItems((prev) => [...prev, currentItem]);
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < quizQueue.length) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      resetQuestionState();

      if (mode !== 'typing') {
        const nextItem = quizQueue[nextIdx];
        const opts = generateOptions(nextItem, allPool, mode);
        setCurrentOptions(opts);
      }
    } else {
      markDailyActivity();
      setIsFinished(true);
    }
  };

  const handleRetryMistakes = () => {
    if (missedItems.length === 0) return;
    startQuiz(missedItems, mode);
  };

  if (!currentItem && !isFinished) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-stone-200 text-center relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] uppercase font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">
            🎯 क्विज़: {titleHindi}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center text-xs font-bold transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Mode Selector */}
        {!isFinished && (
          <div className="flex bg-stone-100 p-1 rounded-xl mb-4 gap-1">
            <button
              type="button"
              onClick={() => setMode('jp-to-romaji')}
              className={`flex-1 py-1.5 text-[10px] font-semibold rounded-lg transition cursor-pointer ${
                mode === 'jp-to-romaji' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500'
              }`}
            >
              🇯🇵 ➔ Romaji
            </button>
            <button
              type="button"
              onClick={() => setMode('romaji-to-jp')}
              className={`flex-1 py-1.5 text-[10px] font-semibold rounded-lg transition cursor-pointer ${
                mode === 'romaji-to-jp' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500'
              }`}
            >
              Romaji ➔ 🇯🇵
            </button>
            <button
              type="button"
              onClick={() => setMode('typing')}
              className={`flex-1 py-1.5 text-[10px] font-semibold rounded-lg transition cursor-pointer ${
                mode === 'typing' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500'
              }`}
            >
              ⌨️ टाइप करें
            </button>
          </div>
        )}

        {/* Summary Screen when finished */}
        {isFinished ? (
          <div className="space-y-4 py-3">
            <div className="text-4xl">🏆</div>
            <h3 className="text-xl font-bold text-stone-900 font-hindi">
              क्विज़ संपन्न!
            </h3>
            <div className="bg-stone-50 border border-stone-200 p-4 rounded-2xl space-y-1">
              <div className="text-3xl font-bold text-rose-600">
                {score.correct} / {score.total}
              </div>
              <div className="text-xs text-stone-500">
                सटीकता: {score.total > 0 ? Math.round((score.correct / score.total) * 100) : 0}%
              </div>
            </div>

            {missedItems.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs text-stone-600">
                  आपने <strong>{missedItems.length}</strong> गलतियाँ कीं। क्या आप उन्हें दोहराना चाहते हैं?
                </p>
                <button
                  type="button"
                  onClick={handleRetryMistakes}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-2xl text-xs shadow transition cursor-pointer"
                >
                  🔄 गलतियाँ दोहराएँ ({missedItems.length})
                </button>
              </div>
            ) : (
              <p className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl font-medium">
                अद्भुत! आपने सभी प्रश्नों के सही उत्तर दिए 🎉
              </p>
            )}

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-2xl text-xs transition cursor-pointer"
            >
              क्विज़ समाप्त करें (Done)
            </button>
          </div>
        ) : (
          /* Question Active State */
          <div className="space-y-4">
            {/* Progress Counter */}
            <div className="flex justify-between items-center text-[11px] font-semibold text-stone-400 px-1">
              <span>प्रश्न {currentIndex + 1} / {quizQueue.length}</span>
              <span className="text-rose-600">अंक: {score.correct}</span>
            </div>

            {/* Prompt Box */}
            <div className="bg-stone-50 rounded-2xl p-6 border border-stone-200 flex flex-col items-center justify-center min-h-[120px]">
              {mode === 'romaji-to-jp' ? (
                <div>
                  <div className="text-2xl font-bold text-rose-600 font-mono">
                    /{currentItem.answerRomaji || currentItem.answer}/
                  </div>
                  {currentItem.answerHindi && (
                    <div className="text-xs font-hindi text-stone-500 mt-1">
                      {currentItem.answerHindi}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-5xl font-bold font-jp text-stone-900">
                  {currentItem.prompt}
                </div>
              )}
            </div>

            {/* Answer Mode: 4 Options vs Typing */}
            {mode !== 'typing' ? (
              <div className="grid grid-cols-2 gap-2">
                {currentOptions.map((opt, idx) => {
                  let btnStyle = 'border-stone-200 bg-white text-stone-800 hover:bg-stone-50';

                  if (isAnswered) {
                    const isOptCorrect =
                      mode === 'romaji-to-jp'
                        ? opt === currentItem.prompt
                        : opt === currentItem.answerRomaji || opt === currentItem.answer;

                    if (isOptCorrect) {
                      btnStyle = 'bg-emerald-500 border-emerald-600 text-white font-bold';
                    } else if (selectedOption === opt) {
                      btnStyle = 'bg-rose-500 border-rose-600 text-white font-bold';
                    } else {
                      btnStyle = 'opacity-40 border-stone-200 bg-stone-50 text-stone-400';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isAnswered}
                      onClick={() => handleSelectOption(opt)}
                      className={`p-3.5 rounded-2xl border text-sm font-semibold transition-all cursor-pointer ${
                        mode === 'romaji-to-jp' ? 'text-2xl font-jp' : 'font-mono'
                      } ${btnStyle}`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
            ) : (
              /* Typing Input Form */
              <form onSubmit={handleSubmitTyped} className="space-y-2">
                <input
                  type="text"
                  value={typedInput}
                  disabled={isAnswered}
                  onChange={(e) => setTypedInput(e.target.value)}
                  placeholder="रोमाजी में उत्तर टाइप करें (e.g. ka)..."
                  className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-center text-sm font-mono focus:outline-none focus:border-rose-500 focus:bg-white"
                  autoFocus
                />
                {!isAnswered && (
                  <button
                    type="submit"
                    className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-2xl text-xs transition cursor-pointer"
                  >
                    उत्तर जांचें (Check)
                  </button>
                )}
              </form>
            )}

            {/* Feedback Message Banner */}
            {isAnswered && (
              <div className="space-y-3 pt-1 animate-fade-in">
                <div
                  className={`p-3 rounded-2xl text-xs font-semibold leading-relaxed ${
                    isCorrect
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {isCorrect
                    ? FEEDBACK_MESSAGES.correct[currentIndex % FEEDBACK_MESSAGES.correct.length]
                    : FEEDBACK_MESSAGES.incorrect(
                        currentItem.answerRomaji || currentItem.answer,
                        currentItem.prompt
                      )}
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  className="w-full py-3 bg-stone-900 hover:bg-black text-white font-semibold rounded-2xl text-xs shadow-md transition cursor-pointer"
                >
                  {currentIndex + 1 < quizQueue.length ? 'अगला प्रश्न (Next) →' : 'परिणाम देखें (View Score) 🏆'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
