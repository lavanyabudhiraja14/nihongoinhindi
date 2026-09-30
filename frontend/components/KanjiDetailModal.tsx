'use client';

import React, { useState, useEffect } from 'react';
import { KanjiItem, VocabItem } from '@/types';
import { createInitialCard } from '@/lib/sm2';
import { addCardToDeck, isCardInDeck } from '@/lib/storage';
import defaultVocabData from '@/content/vocab.json';

interface KanjiDetailModalProps {
  item: KanjiItem | null;
  onClose: () => void;
  vocabList?: VocabItem[];
}

export default function KanjiDetailModal({
  item,
  onClose,
  vocabList = defaultVocabData as VocabItem[],
}: KanjiDetailModalProps) {
  const [audioError, setAudioError] = useState<string | null>(null);
  const [playingWordId, setPlayingWordId] = useState<string | null>(null);
  const [inDeck, setInDeck] = useState(false);

  useEffect(() => {
    if (item) {
      const compositeId = `kanji:${item.id}`;
      setInDeck(isCardInDeck(compositeId));
      setAudioError(null);
      setPlayingWordId(null);
    }
  }, [item]);

  if (!item) return null;

  const linkedVocab = (item.linkedVocabIds || [])
    .map((vId) => vocabList.find((v) => v.id === vId))
    .filter((v): v is VocabItem => !!v);

  const handlePlayVocabAudio = (vocab: VocabItem) => {
    setAudioError(null);

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setAudioError('आपके ब्राउज़र में जापानी आवाज़ उपलब्ध नहीं है।');
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const textToSpeak = vocab.kana || vocab.kanji || vocab.romaji;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'ja-JP';
      utterance.rate = 0.85;

      utterance.onstart = () => setPlayingWordId(vocab.id);
      utterance.onend = () => setPlayingWordId(null);
      utterance.onerror = () => {
        setPlayingWordId(null);
        setAudioError('आवाज़ चलाने में त्रुटि हुई।');
      };

      window.speechSynthesis.speak(utterance);
    } catch {
      setPlayingWordId(null);
      setAudioError('आवाज़ चलाने में त्रुटि हुई।');
    }
  };

  const handleAddToDeck = () => {
    const card = createInitialCard(item.id, 'kanji');
    addCardToDeck(card);
    setInDeck(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-stone-200 text-center relative max-h-[90vh] overflow-y-auto space-y-4"
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

        {/* Badges */}
        <div className="flex items-center justify-center gap-2 pt-1">
          <span className="text-[10px] uppercase font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-100">
            {item.jlptLevel || 'JLPT N5'} • {item.strokeCount} स्ट्रोक
          </span>
          <span className="text-[10px] uppercase font-bold text-stone-600 bg-stone-100 px-2.5 py-1 rounded-full">
            {item.groupId}
          </span>
        </div>

        {/* Large Kanji Character Display */}
        <div className="py-2">
          <span className="text-7xl font-bold font-jp text-stone-900 leading-none inline-block hover:scale-105 transition-transform duration-200">
            {item.character}
          </span>
        </div>

        {/* Hindi & English Meaning */}
        <div className="space-y-0.5">
          <div className="text-2xl font-bold text-rose-600 font-hindi">
            {item.meaningHindi}
          </div>
          <div className="text-xs font-medium text-stone-400">
            {item.meaningEnglish}
          </div>
        </div>

        {/* Readings Section: Onyomi & Kunyomi */}
        <div className="grid grid-cols-2 gap-2 text-left">
          {/* Onyomi */}
          <div className="bg-stone-50 rounded-2xl p-3 border border-stone-200/80">
            <span className="text-[10px] uppercase font-bold text-stone-500 block mb-1">
              🇨🇳 ओनम्योमी (音読み)
            </span>
            <div className="flex flex-wrap gap-1">
              {item.onyomi && item.onyomi.length > 0 ? (
                item.onyomi.map((on, idx) => (
                  <span
                    key={idx}
                    className="font-jp font-bold text-stone-800 text-sm bg-white px-2 py-0.5 rounded-lg border border-stone-200 shadow-2xs"
                  >
                    {on}
                  </span>
                ))
              ) : (
                <span className="text-xs text-stone-400">—</span>
              )}
            </div>
          </div>

          {/* Kunyomi */}
          <div className="bg-stone-50 rounded-2xl p-3 border border-stone-200/80">
            <span className="text-[10px] uppercase font-bold text-stone-500 block mb-1">
              🇯🇵 कुनम्योमी (訓読み)
            </span>
            <div className="flex flex-wrap gap-1">
              {item.kunyomi && item.kunyomi.length > 0 ? (
                item.kunyomi.map((kun, idx) => (
                  <span
                    key={idx}
                    className="font-jp font-bold text-stone-800 text-sm bg-white px-2 py-0.5 rounded-lg border border-stone-200 shadow-2xs"
                  >
                    {kun}
                  </span>
                ))
              ) : (
                <span className="text-xs text-stone-400">—</span>
              )}
            </div>
          </div>
        </div>

        {/* Add to Deck Button */}
        <div>
          <button
            type="button"
            onClick={handleAddToDeck}
            disabled={inDeck}
            className={`w-full py-2.5 px-3 rounded-2xl text-xs font-semibold border transition flex items-center justify-center gap-1.5 cursor-pointer ${
              inDeck
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'bg-stone-900 hover:bg-black text-white border-transparent shadow-sm'
            }`}
          >
            <span>{inDeck ? '✓ समीक्षा डेक में सुरक्षित है' : '🎴 डेक में जोड़ें (Add to SM-2 Deck)'}</span>
          </button>
        </div>

        {/* Stroke Order Placeholder Notice */}
        <div className="bg-stone-100/70 border border-stone-200 rounded-2xl p-2.5 flex items-center justify-center gap-2 text-stone-600 text-xs font-hindi">
          <span>🖌️</span>
          <span>स्ट्रोक ऑर्डर जल्द आएगा</span>
        </div>

        {audioError && (
          <p className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-2 leading-tight">
            ⚠️ {audioError}
          </p>
        )}

        {/* Mnemonic Section */}
        {item.mnemonic && (
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3.5 text-left">
            <span className="text-[10px] uppercase font-bold text-amber-800 block mb-1">
              🧠 याद रखने का सूत्र (Mnemonic)
            </span>
            <p className="text-xs text-amber-950 leading-relaxed font-hindi">
              {item.mnemonic}
            </p>
          </div>
        )}

        {/* Linked Vocab Words (Tap to hear audio on the vocab word) */}
        {linkedVocab.length > 0 && (
          <div className="bg-rose-50/40 border border-rose-100 rounded-2xl p-3.5 text-left space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-rose-700 block">
                📖 संबंधित शब्दावली (Linked Vocab)
              </span>
              <span className="text-[9px] text-stone-400 font-hindi">
                (सुनने के लिए टैप करें)
              </span>
            </div>
            <div className="space-y-1.5">
              {linkedVocab.map((vocab) => {
                const isSpeaking = playingWordId === vocab.id;
                return (
                  <div
                    key={vocab.id}
                    onClick={() => handlePlayVocabAudio(vocab)}
                    className="bg-white hover:bg-rose-50/80 p-2.5 rounded-xl border border-rose-100 cursor-pointer transition flex items-center justify-between group active:scale-[0.99]"
                    title="उच्चारण सुनने के लिए क्लिक करें"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold font-jp text-stone-900 text-sm">
                          {vocab.kanji || vocab.kana}
                        </span>
                        {vocab.kanji && (
                          <span className="text-xs font-jp text-stone-500">
                            ({vocab.kana})
                          </span>
                        )}
                        <span className="font-mono text-stone-400 text-[10px]">
                          /{vocab.romaji}/
                        </span>
                      </div>
                      <div className="text-xs text-rose-700 font-hindi font-medium">
                        {vocab.hindiMeaning}
                      </div>
                    </div>

                    <button
                      type="button"
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs transition ${
                        isSpeaking
                          ? 'bg-rose-600 text-white'
                          : 'bg-stone-100 text-stone-600 group-hover:bg-rose-100 group-hover:text-rose-700'
                      }`}
                    >
                      {isSpeaking ? '🔊' : '🔈'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
