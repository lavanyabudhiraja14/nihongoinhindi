'use client';

import React, { useState, useEffect } from 'react';
import { KanaItem } from '@/types';
import { createInitialCard } from '@/lib/sm2';
import { addCardToDeck, isCardInDeck } from '@/lib/storage';

interface KanaDetailModalProps {
  item: KanaItem | null;
  onClose: () => void;
}

export default function KanaDetailModal({ item, onClose }: KanaDetailModalProps) {
  const [audioError, setAudioError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [inDeck, setInDeck] = useState(false);

  useEffect(() => {
    if (item) {
      const compositeId = `${item.type}:${item.id}`;
      setInDeck(isCardInDeck(compositeId));
    }
  }, [item]);

  if (!item) return null;

  const handlePlayAudio = () => {
    setAudioError(null);

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setAudioError('आपके ब्राउज़र में जापानी आवाज़ उपलब्ध नहीं है।');
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const textToSpeak = item.examples && item.examples.length > 0
        ? item.examples[0].jp
        : item.kana;

      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.85;

      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => {
        setIsPlaying(false);
        setAudioError('आपके ब्राउज़र में जापानी आवाज़ उपलब्ध नहीं है।');
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      setIsPlaying(false);
      setAudioError('आपके ब्राउज़र में जापानी आवाज़ उपलब्ध नहीं है।');
    }
  };

  const handleAddToDeck = () => {
    const card = createInitialCard(item.id, item.type);
    addCardToDeck(card);
    setInDeck(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 text-center relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center text-sm font-bold transition cursor-pointer"
        >
          ✕
        </button>

        {/* Category Badge */}
        <div className="mb-2">
          <span className="text-[10px] uppercase font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">
            {item.type === 'hiragana' ? 'हिरागाना' : 'काताकाना'} • {item.row}
          </span>
        </div>

        {/* Large Kana Display */}
        <div className="my-3 py-2">
          <span className="text-6xl font-bold font-jp text-stone-900 leading-none inline-block">
            {item.kana}
          </span>
        </div>

        {/* Phonetic & Romaji */}
        <div className="space-y-1 mb-4">
          <div className="text-xl font-bold text-rose-600 font-hindi">
            {item.hindiPhonetic}
          </div>
          <div className="text-xs font-mono text-stone-400">
            /{item.romaji}/
          </div>
        </div>

        {/* Action Buttons: Audio & Add to Deck */}
        <div className="flex gap-2 mb-4">
          <button
            type="button"
            onClick={handlePlayAudio}
            disabled={isPlaying}
            className="flex-1 py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold rounded-2xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <span>{isPlaying ? '🔊 बोल रहा है...' : '🔊 उच्चारण'}</span>
          </button>

          <button
            type="button"
            onClick={handleAddToDeck}
            disabled={inDeck}
            className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-semibold border transition flex items-center justify-center gap-1 cursor-pointer ${
              inDeck
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'bg-stone-900 hover:bg-black text-white border-transparent'
            }`}
          >
            <span>{inDeck ? '✓ डेक में है' : '🎴 डेक में जोड़ें'}</span>
          </button>
        </div>

        {audioError && (
          <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-2 mb-3 leading-tight">
            ⚠️ {audioError}
          </p>
        )}

        {/* Pronunciation Note (if applicable) */}
        {item.pronunciationNote && (
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3 text-left mb-3">
            <span className="text-[10px] uppercase font-bold text-amber-800 block mb-0.5">
              💡 उच्चारण विशेष टिप्पणी
            </span>
            <p className="text-xs text-amber-900 leading-relaxed font-hindi">
              {item.pronunciationNote}
            </p>
          </div>
        )}

        {/* Mnemonic / Rule Hint */}
        {item.mnemonic && (
          <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3 text-left mb-3">
            <span className="text-[10px] uppercase font-bold text-stone-500 block mb-0.5">
              🧠 याद रखने का सूत्र (Mnemonic)
            </span>
            <p className="text-xs text-stone-800 leading-relaxed font-hindi">
              {item.mnemonic}
            </p>
          </div>
        )}

        {/* Special Sound Examples (if applicable) */}
        {item.examples && item.examples.length > 0 && (
          <div className="bg-rose-50/40 border border-rose-100 rounded-2xl p-3 text-left space-y-2">
            <span className="text-[10px] uppercase font-bold text-rose-700 block">
              📖 उदाहरण शब्द (Examples)
            </span>
            <div className="space-y-1.5">
              {item.examples.map((ex, idx) => (
                <div key={idx} className="bg-white p-2 rounded-xl border border-rose-100/60 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold font-jp text-stone-900">{ex.jp}</span>
                    <span className="font-mono text-stone-400 text-[11px]">/{ex.romaji}/</span>
                  </div>
                  <div className="text-rose-700 font-hindi mt-0.5">{ex.hindi}</div>
                  <div className="text-[11px] text-stone-500">{ex.meaning}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Review Tag */}
        {item.needs_review && (
          <div className="mt-3 pt-2 border-t border-stone-100">
            <span className="text-[9px] text-stone-400">
              Needs review: verified JLPT N5 content
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
