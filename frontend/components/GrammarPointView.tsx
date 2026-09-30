'use client';

import React, { useState, useEffect } from 'react';
import { GrammarPoint } from '@/types';
import { markGrammarPointCompleted, isGrammarPointCompleted } from '@/lib/storage';

interface GrammarPointViewProps {
  point: GrammarPoint;
  onClose: () => void;
  onRefresh?: () => void;
}

export default function GrammarPointView({
  point,
  onClose,
  onRefresh,
}: GrammarPointViewProps) {
  const [activeTab, setActiveTab] = useState<'learn' | 'quiz'>('learn');
  const [audioError, setAudioError] = useState<string | null>(null);

  // Quiz state
  const [currentQuizIdx, setCurrentQuizIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [isQuizFinished, setIsQuizFinished] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    setIsCompleted(isGrammarPointCompleted(point.id));
  }, [point.id]);

  const handlePlayAudio = (text: string) => {
    setAudioError(null);
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setAudioError('आपके ब्राउज़र में जापानी आवाज़ उपलब्ध नहीं है।');
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
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

  const handleSelectQuizOption = (optIndex: number) => {
    if (selectedOpt !== null) return;
    setSelectedOpt(optIndex);

    const isCorrect = optIndex === point.quiz[currentQuizIdx].correctIndex;
    if (isCorrect) {
      setQuizScore((prev) => prev + 1);
    }
  };

  const handleNextQuizQuestion = () => {
    if (currentQuizIdx + 1 < point.quiz.length) {
      setCurrentQuizIdx((prev) => prev + 1);
      setSelectedOpt(null);
    } else {
      setIsQuizFinished(true);
      const finalScore = quizScore + (selectedOpt === point.quiz[currentQuizIdx].correctIndex ? 0 : 0);
      // Completion rule: at least 2 of 3 correct
      if (quizScore >= 2 || (quizScore === 1 && selectedOpt === point.quiz[currentQuizIdx].correctIndex)) {
        markGrammarPointCompleted(point.id);
        setIsCompleted(true);
        if (onRefresh) onRefresh();
      }
    }
  };

  const handleRetryQuiz = () => {
    setCurrentQuizIdx(0);
    setSelectedOpt(null);
    setQuizScore(0);
    setIsQuizFinished(false);
  };

  const currentQ = point.quiz[currentQuizIdx];

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
              व्याकरण बिंदु {point.pointNumber} / 15
            </span>
            <h2 className="text-lg font-bold text-stone-900 mt-1 font-hindi">
              {point.titleHindi}
            </h2>
            <div className="text-xs font-jp text-stone-500 font-bold">
              {point.titleJp}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center text-sm font-bold transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Learn vs Quiz Tabs */}
        <div className="flex bg-stone-100 p-1 rounded-2xl gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('learn')}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition cursor-pointer ${
              activeTab === 'learn' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500'
            }`}
          >
            📖 नियम व उदाहरण
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('quiz')}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl transition cursor-pointer flex items-center justify-center gap-1 ${
              activeTab === 'quiz' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500'
            }`}
          >
            <span>🎯 3-प्रश्नों का क्विज़</span>
            {isCompleted && <span className="text-emerald-600 text-xs">✓</span>}
          </button>
        </div>

        {audioError && (
          <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-2.5">
            ⚠️ {audioError}
          </p>
        )}

        {/* Tab: Learn (Explanation, Comparison, 3 Examples, Common Mistake) */}
        {activeTab === 'learn' && (
          <div className="space-y-4 pt-1 text-xs">
            {/* Formula Card */}
            <div className="bg-stone-900 text-white p-3.5 rounded-2xl">
              <span className="text-[10px] text-rose-300 font-bold uppercase block mb-0.5">
                व्याकरण सूत्र (Formula)
              </span>
              <div className="text-sm font-bold font-mono tracking-wide">
                {point.formula}
              </div>
            </div>

            {/* Explanation */}
            <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200 space-y-1">
              <span className="text-[10px] uppercase font-bold text-stone-500 block">
                📝 सरल व्याख्या (Explanation)
              </span>
              <p className="text-stone-800 leading-relaxed font-hindi whitespace-pre-line">
                {point.explanationHindi}
              </p>
            </div>

            {/* Hindi Comparison */}
            <div className="bg-rose-50/60 p-3.5 rounded-2xl border border-rose-100 space-y-1">
              <div className="flex items-center gap-1.5 text-rose-700 font-bold text-[11px]">
                <span>💡</span>
                <span>हिंदी संरचना से तुलना (Hindi Comparison)</span>
              </div>
              <p className="text-stone-700 leading-relaxed font-hindi whitespace-pre-line">
                {point.hindiComparison}
              </p>
            </div>

            {/* 3 Examples */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-stone-500 block">
                📖 उदाहरण वाक्य (3 Examples)
              </span>
              <div className="space-y-2">
                {point.examples.map((ex, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-3 rounded-2xl border border-stone-200 shadow-xs space-y-1 relative"
                  >
                    <div className="flex items-start justify-between">
                      <div className="font-bold font-jp text-sm text-stone-900 pr-8">
                        {ex.jp}
                      </div>
                      <button
                        type="button"
                        onClick={() => handlePlayAudio(ex.jp)}
                        className="p-1.5 bg-stone-50 hover:bg-rose-50 text-stone-600 hover:text-rose-600 rounded-lg border border-stone-200 text-xs transition cursor-pointer"
                        title="वाक्य सुनें"
                      >
                        🔊
                      </button>
                    </div>
                    <div className="text-[11px] font-mono text-stone-400">
                      {ex.romaji}
                    </div>
                    <div className="text-xs text-rose-700 font-hindi font-medium">
                      {ex.hindi}
                    </div>
                    {ex.noteHindi && (
                      <div className="text-[10px] text-stone-500 font-hindi pt-0.5 border-t border-stone-100">
                        ℹ️ {ex.noteHindi}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Common Mistake Alert */}
            <div className="bg-amber-50/80 p-3.5 rounded-2xl border border-amber-200/80 space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-800 font-bold text-[11px]">
                <span>⚠️</span>
                <span>अक्सर होने वाली गलती (Common Mistake)</span>
              </div>
              <div className="space-y-1 text-xs">
                <div className="text-rose-700">
                  ❌ <strong>गलत:</strong> <span className="font-jp">{point.commonMistake.mistakeJp}</span>
                </div>
                <div className="text-emerald-700">
                  ✓ <strong>सही:</strong> <span className="font-jp">{point.commonMistake.correctionJp}</span>
                </div>
                <p className="text-stone-700 font-hindi pt-1 border-t border-amber-200/60">
                  {point.commonMistake.explanationHindi}
                </p>
              </div>
            </div>

            {/* Bottom Button to Quiz */}
            <button
              type="button"
              onClick={() => setActiveTab('quiz')}
              className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-2xl text-xs shadow-md shadow-rose-200 transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <span>इस नियम का क्विज़ हल करें (Take Quiz)</span>
              <span>→</span>
            </button>
          </div>
        )}

        {/* Tab: Quiz (3 Questions, minimum 2/3 for completion) */}
        {activeTab === 'quiz' && (
          <div className="space-y-4 pt-1">
            {isQuizFinished ? (
              <div className="bg-white p-5 rounded-2xl border border-stone-200 text-center space-y-3">
                <div className="text-3xl">{quizScore >= 2 ? '🎉' : '📚'}</div>
                <h3 className="font-bold text-base text-stone-900 font-hindi">
                  {quizScore >= 2 ? 'क्विज़ उत्तीर्ण!' : 'अभ्यास जारी रखें'}
                </h3>
                <div className="text-2xl font-bold text-rose-600">
                  {quizScore} / {point.quiz.length} अंक
                </div>
                <p className="text-xs text-stone-600 leading-relaxed font-hindi">
                  {quizScore >= 2
                    ? 'बधाई! आपने इस व्याकरण बिंदु को सफलतापूर्वक सीख लिया है।'
                    : 'इस बिंदु को पूरा करने के लिए कम से कम २/३ अंक आवश्यक हैं। कृपया दोबारा प्रयास करें।'}
                </p>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={handleRetryQuiz}
                    className="flex-1 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl transition cursor-pointer"
                  >
                    🔄 पुनः प्रयास करें
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-2.5 bg-stone-900 hover:bg-black text-white text-xs font-semibold rounded-xl transition cursor-pointer"
                  >
                    समाप्त करें
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Quiz Progress */}
                <div className="flex justify-between items-center text-[11px] font-semibold text-stone-400 px-1">
                  <span>प्रश्न {currentQuizIdx + 1} / {point.quiz.length}</span>
                  <span className="text-rose-600">अंक: {quizScore}</span>
                </div>

                {/* Question Box */}
                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200">
                  <p className="font-bold text-xs text-stone-900 font-hindi leading-relaxed">
                    {currentQ.question}
                  </p>
                </div>

                {/* 4 Options */}
                <div className="space-y-2">
                  {currentQ.options.map((opt, idx) => {
                    let btnStyle = 'border-stone-200 bg-white text-stone-800 hover:bg-stone-50';

                    if (selectedOpt !== null) {
                      if (idx === currentQ.correctIndex) {
                        btnStyle = 'bg-emerald-500 border-emerald-600 text-white font-bold';
                      } else if (selectedOpt === idx) {
                        btnStyle = 'bg-rose-500 border-rose-600 text-white font-bold';
                      } else {
                        btnStyle = 'opacity-40 bg-stone-50 text-stone-400 border-stone-200';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        type="button"
                        disabled={selectedOpt !== null}
                        onClick={() => handleSelectQuizOption(idx)}
                        className={`w-full p-3 rounded-2xl border text-xs text-left transition-all cursor-pointer ${btnStyle}`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation Banner */}
                {selectedOpt !== null && (
                  <div className="space-y-3 pt-1 animate-fade-in">
                    <div
                      className={`p-3 rounded-2xl text-xs font-hindi leading-relaxed ${
                        selectedOpt === currentQ.correctIndex
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}
                    >
                      <div className="font-bold mb-0.5">
                        {selectedOpt === currentQ.correctIndex ? '✓ सही उत्तर!' : '❌ गलत उत्तर!'}
                      </div>
                      <div>{currentQ.explanationHindi}</div>
                    </div>

                    <button
                      type="button"
                      onClick={handleNextQuizQuestion}
                      className="w-full py-3 bg-stone-900 hover:bg-black text-white font-semibold rounded-2xl text-xs shadow-md transition cursor-pointer"
                    >
                      {currentQuizIdx + 1 < point.quiz.length ? 'अगला प्रश्न (Next) →' : 'परिणाम देखें 🏆'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
