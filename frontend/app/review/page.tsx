'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { SM2Card, calculateSM2, getDueCards, formatLocalDate } from '@/lib/sm2';
import { getDeckCards, updateCardInDeck, markDailyActivity } from '@/lib/storage';
import hiraganaData from '@/content/hiragana.json';
import katakanaData from '@/content/katakana.json';
import loanwordsData from '@/content/loanwords.json';
import vocabData from '@/content/vocab.json';
import kanjiData from '@/content/kanji.json';
import { KanaItem, LoanwordExerciseItem, VocabItem, KanjiItem } from '@/types';

interface DisplayContent {
  promptJp: string;
  kanjiSub?: string;
  speakText: string;
  romaji: string;
  hindiMeaning: string;
  englishMeaning?: string;
  exampleJp?: string;
  exampleRomaji?: string;
  exampleHindi?: string;
  noteOrMnemonic?: string;
  sourceBadge: string;
}

export default function ReviewPage() {
  const [deck, setDeck] = useState<SM2Card[]>([]);
  const [dueCards, setDueCards] = useState<SM2Card[]>([]);
  const [sessionQueue, setSessionQueue] = useState<SM2Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    again: 0,
    hard: 0,
    good: 0,
    easy: 0,
    totalReviews: 0,
  });
  const [audioError, setAudioError] = useState<string | null>(null);

  // Client-side initial load
  useEffect(() => {
    loadDeckAndDueCards();
  }, []);

  const loadDeckAndDueCards = () => {
    const allCards = getDeckCards();
    const today = formatLocalDate();
    const due = getDueCards(allCards, today);

    setDeck(allCards);
    setDueCards(due);
    setSessionQueue([...due]);
    setCurrentIndex(0);
    setIsRevealed(false);
    setIsFinished(false);
    setSessionStats({ again: 0, hard: 0, good: 0, easy: 0, totalReviews: 0 });
  };

  const currentCard = sessionQueue[currentIndex];

  // Helper to look up rich card content from source JSONs
  const getCardDisplay = (card: SM2Card): DisplayContent => {
    if (card.source === 'hiragana') {
      const item = (hiraganaData as KanaItem[]).find((k) => k.id === card.rawId);
      return {
        promptJp: item?.kana || card.rawId,
        speakText: item?.kana || card.rawId,
        romaji: item?.romaji || '',
        hindiMeaning: item?.hindiPhonetic || '',
        noteOrMnemonic: item?.mnemonic || item?.pronunciationNote,
        sourceBadge: 'हिरागाना (Hiragana)',
      };
    }
    if (card.source === 'katakana') {
      const item = (katakanaData as KanaItem[]).find((k) => k.id === card.rawId);
      return {
        promptJp: item?.kana || card.rawId,
        speakText: item?.kana || card.rawId,
        romaji: item?.romaji || '',
        hindiMeaning: item?.hindiPhonetic || '',
        noteOrMnemonic: item?.mnemonic || item?.pronunciationNote,
        sourceBadge: 'काताकाना (Katakana)',
      };
    }
    if (card.source === 'loanword') {
      const item = (loanwordsData as LoanwordExerciseItem[]).find((lw) => lw.id === card.rawId);
      return {
        promptJp: item?.word || card.rawId,
        speakText: item?.word || card.rawId,
        romaji: item?.romaji || '',
        hindiMeaning: item?.hindiMeaning || '',
        englishMeaning: item?.englishMeaning,
        noteOrMnemonic: item?.noteHindi,
        sourceBadge: 'लोनवर्ड (Loanword)',
      };
    }
    if (card.source === 'kanji') {
      const item = (kanjiData as KanjiItem[]).find((k) => k.id === card.rawId);
      const readings = [
        item?.onyomi?.length ? `音: ${item.onyomi.join(', ')}` : '',
        item?.kunyomi?.length ? `訓: ${item.kunyomi.join(', ')}` : '',
      ].filter(Boolean).join(' | ');

      const firstVocab = item?.linkedVocabIds?.length
        ? (vocabData as VocabItem[]).find((v) => item.linkedVocabIds.includes(v.id))
        : null;

      return {
        promptJp: item?.character || card.rawId,
        kanjiSub: readings || undefined,
        speakText: firstVocab?.kana || item?.character || card.rawId,
        romaji: firstVocab ? `${firstVocab.kana} (${firstVocab.romaji})` : (item?.onyomi?.[0] || item?.kunyomi?.[0] || ''),
        hindiMeaning: item?.meaningHindi || '',
        englishMeaning: item?.meaningEnglish,
        noteOrMnemonic: item?.mnemonic || (item?.strokeCount ? `${item.strokeCount} स्ट्रोक` : undefined),
        sourceBadge: 'कांजी (Kanji)',
      };
    }
    // vocab
    const item = (vocabData as VocabItem[]).find((v) => v.id === card.rawId);
    return {
      promptJp: item?.kana || card.rawId,
      kanjiSub: item?.kanji,
      speakText: item?.kana || card.rawId,
      romaji: item?.romaji || '',
      hindiMeaning: item?.hindiMeaning || '',
      englishMeaning: item?.englishMeaning,
      exampleJp: item?.exampleJp,
      exampleRomaji: item?.exampleRomaji,
      exampleHindi: item?.exampleHindi,
      noteOrMnemonic: item?.note,
      sourceBadge: 'शब्दावली (Vocab)',
    };
  };

  const handleRate = (quality: number) => {
    if (!currentCard) return;

    const updated = calculateSM2(currentCard, quality);
    updateCardInDeck(updated);
    markDailyActivity();

    // Tally session stats
    setSessionStats((prev) => ({
      ...prev,
      totalReviews: prev.totalReviews + 1,
      again: prev.again + (quality === 0 ? 1 : 0),
      hard: prev.hard + (quality === 3 ? 1 : 0),
      good: prev.good + (quality === 4 ? 1 : 0),
      easy: prev.easy + (quality === 5 ? 1 : 0),
    }));

    if (quality < 3) {
      // Again: re-queue at the end of the current session
      setSessionQueue((prev) => [...prev, updated]);
    }

    if (currentIndex + 1 < sessionQueue.length || quality < 3) {
      setCurrentIndex((prev) => prev + 1);
      setIsRevealed(false);
      setAudioError(null);
    } else {
      setIsFinished(true);
    }
  };

  const handlePlayAudio = (textToSpeak: string) => {
    setAudioError(null);
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setAudioError('आपके ब्राउज़र में जापानी आवाज़ उपलब्ध नहीं है।');
      return;
    }
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
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

  const display = currentCard ? getCardDisplay(currentCard) : null;

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-10">
      {/* Header */}
      <header className="pb-2 border-b border-[#E8E8EC]">
        <span className="glass-pill-red font-hindi">
          SM-2 स्पेस्ड रिपीटिशन
        </span>
        <h1 className="text-[28px] font-semibold text-[#0D1B4B] font-hindi leading-tight mt-2">
          स्मृति अभ्यास
        </h1>
        <p className="text-[13px] text-[#5B6070] mt-0.5">
          Review Flashcards: Spaced Repetition Practice
        </p>
      </header>

      {/* Deck Empty or No Cards Due */}
      {dueCards.length === 0 && !isFinished && (
        <div className="bg-white rounded-[12px] p-8 border border-[#E8E8EC] text-center shadow-xs space-y-4 my-4">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#138808]/10 border border-[#138808]/30 flex items-center justify-center text-[#138808] font-bold text-xl">
            ✓
          </div>
          <h3 className="text-[20px] font-semibold text-[#0D1B4B] font-hindi">
            {deck.length === 0 ? 'आपका रिव्यू डेक खाली है' : 'आज के सभी कार्ड्स पूरे हो गए!'}
          </h3>
          <p className="text-[14px] text-[#5B6070] leading-relaxed font-hindi max-w-md mx-auto">
            {deck.length === 0
              ? 'नए अक्षर, लोनवर्ड्स या शब्दावली अपने अभ्यास डेक में जोड़ने के लिए "सीखें" पृष्ठ पर जाएँ।'
              : 'शानदार! आज अभ्यास के लिए कोई कार्ड शेष नहीं है। कल की पुनरावृत्ति के लिए तैयार रहें या नया पाठ सीखें।'}
          </p>
          <div className="pt-2">
            <Link
              href="/learn"
              className="inline-block py-2.5 px-5 bg-[#BC2025] hover:bg-[#8B1519] text-white font-semibold rounded-[8px] text-[13px] font-hindi transition shadow-xs"
            >
              नया सीखें व डेक में जोड़ें (Go to Learn) →
            </Link>
          </div>
        </div>
      )}

      {/* Session Summary Screen */}
      {isFinished && (
        <div className="bg-white rounded-[12px] p-6 border border-[#E8E8EC] text-center shadow-xs space-y-5">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#0D1B4B]/10 border border-[#0D1B4B]/30 flex items-center justify-center text-[#0D1B4B] font-bold text-xl">
            ★
          </div>
          <div>
            <h3 className="text-[20px] font-semibold text-[#0D1B4B] font-hindi">
              आज का अभ्यास सत्र संपन्न!
            </h3>
            <p className="text-[13px] text-[#5B6070] mt-1">
              आपने कुल {sessionStats.totalReviews} कार्ड्स का सफल अभ्यास किया।
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left pt-2">
            <div className="glass-red p-3.5 rounded-[12px]">
              <span className="text-[11px] text-[#BC2025] font-semibold block font-hindi">फिर से (Again)</span>
              <span className="text-[22px] font-bold text-[#BC2025] font-mono">{sessionStats.again}</span>
            </div>
            <div className="glass-saffron p-3.5 rounded-[12px]">
              <span className="text-[11px] text-[#B45309] font-semibold block font-hindi">कठिन (Hard)</span>
              <span className="text-[22px] font-bold text-[#B45309] font-mono">{sessionStats.hard}</span>
            </div>
            <div className="glass-green p-3.5 rounded-[12px]">
              <span className="text-[11px] text-[#138808] font-semibold block font-hindi">अच्छा (Good)</span>
              <span className="text-[22px] font-bold text-[#138808] font-mono">{sessionStats.good}</span>
            </div>
            <div className="glass-navy p-3.5 rounded-[12px]">
              <span className="text-[11px] text-[#0D1B4B] font-semibold block font-hindi">आसान (Easy)</span>
              <span className="text-[22px] font-bold text-[#0D1B4B] font-mono">{sessionStats.easy}</span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={loadDeckAndDueCards}
              className="flex-1 py-2.5 bg-[#F4F4F6] hover:bg-[#E8E8EC] text-[#0D1B4B] font-semibold rounded-[8px] text-[13px] font-hindi transition cursor-pointer border border-[#E8E8EC]"
            >
              रीफ्रेश करें (Refresh)
            </button>
            <Link
              href="/learn"
              className="flex-1 py-2.5 bg-[#BC2025] hover:bg-[#8B1519] text-white font-semibold rounded-[8px] text-[13px] font-hindi shadow-xs transition flex items-center justify-center"
            >
              पाठ्यक्रम देखें →
            </Link>
          </div>
        </div>
      )}

      {/* Active Flashcard Session */}
      {!isFinished && sessionQueue.length > 0 && currentCard && display && (
        <div className="space-y-4">
          {/* Progress Header */}
          <div className="flex justify-between items-center text-[13px] font-medium text-[#5B6070] px-1">
            <span>शेष कार्ड्स: <strong className="text-[#0D1B4B] font-mono">{sessionQueue.length - currentIndex}</strong></span>
            <span className="glass-pill-navy text-[11px]">
              {display.sourceBadge}
            </span>
          </div>

          {/* Flashcard Box */}
          <div
            onClick={() => !isRevealed && setIsRevealed(true)}
            className="w-full min-h-[320px] bg-white rounded-[12px] border border-[#E8E8EC] shadow-xs p-6 flex flex-col justify-between items-center text-center transition-all hover:border-[#0D1B4B]/30 cursor-pointer select-none"
          >
            {/* Card Top */}
            <div className="w-full flex justify-between items-center text-[13px] text-[#5B6070]">
              <span className="font-hindi">{isRevealed ? 'उत्तर (Back)' : 'सामने (Front)'}</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlayAudio(display.speakText);
                }}
                className="text-[12px] bg-[#F4F4F6] hover:bg-[#E8E8EC] text-[#0D1B4B] px-3 py-1 rounded-[6px] font-medium transition flex items-center gap-1.5 cursor-pointer border border-[#E8E8EC]"
              >
                <span>उच्चारण</span>
              </button>
            </div>

            {/* Prompt */}
            <div className="my-auto py-4 space-y-2">
              <div className="text-[44px] font-bold font-jp text-[#0D1B4B] tracking-wide">
                {display.promptJp}
              </div>
              {display.kanjiSub && (
                <div className="text-[15px] font-jp text-[#5B6070] font-medium">
                  कांजी: {display.kanjiSub}
                </div>
              )}

              {!isRevealed ? (
                <div className="text-[13px] text-[#5B6070] mt-2 font-hindi">
                  (उत्तर देखने के लिए कहीं भी टैप करें)
                </div>
              ) : (
                /* Revealed Back Information */
                <div className="space-y-3 pt-3 text-left glass-navy p-4 rounded-[12px] w-full max-w-md mx-auto">
                  <div>
                    <span className="text-[11px] uppercase font-semibold text-[#5B6070] block">उच्चारण / Romaji</span>
                    <div className="text-[15px] font-mono font-bold text-[#0D1B4B]">
                      /{display.romaji}/
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] uppercase font-semibold text-[#5B6070] block">अर्थ (Hindi Meaning)</span>
                    <div className="text-[16px] font-bold text-[#0D1B4B] font-hindi">
                      {display.hindiMeaning}
                    </div>
                    {display.englishMeaning && (
                      <div className="text-[13px] text-[#5B6070] mt-0.5">
                        English: {display.englishMeaning}
                      </div>
                    )}
                  </div>

                  {/* Example Sentence */}
                  {display.exampleJp && (
                    <div className="bg-white/80 p-3 rounded-[8px] border border-[#0D1B4B]/15 text-[13px] space-y-0.5">
                      <span className="text-[10px] uppercase font-bold text-[#5B6070] block font-hindi">उदाहरण</span>
                      <div className="font-bold font-jp text-[#0D1B4B]">{display.exampleJp}</div>
                      <div className="text-[11px] font-mono text-[#5B6070]">{display.exampleRomaji}</div>
                      <div className="text-[13px] text-[#0D1B4B] font-hindi">{display.exampleHindi}</div>
                    </div>
                  )}

                  {display.noteOrMnemonic && (
                    <div className="text-[13px] text-[#0D1B4B] bg-white/80 p-3 rounded-[8px] border border-[#0D1B4B]/15 font-hindi">
                      💡 {display.noteOrMnemonic}
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
              {isRevealed ? 'नीचे अपनी समझ के अनुसार रेटिंग चुनें' : 'कार्ड टैप करके उत्तर देखें'}
            </div>
          </div>

          {/* Action Buttons: Reveal Answer OR 4 SM-2 Rating Buttons */}
          {!isRevealed ? (
            <button
              type="button"
              onClick={() => setIsRevealed(true)}
              className="w-full py-3 bg-[#BC2025] hover:bg-[#8B1519] text-white font-semibold rounded-[8px] text-[15px] font-hindi shadow-xs transition cursor-pointer"
            >
              उत्तर देखें (Show Answer)
            </button>
          ) : (
            <div className="space-y-2">
              <span className="block text-center text-[12px] font-semibold text-[#5B6070] uppercase tracking-wider font-hindi">
                आपको यह कार्ड कितना याद था?
              </span>
              <div className="grid grid-cols-4 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleRate(0)}
                  className="glass-red p-3 rounded-[12px] text-center transition cursor-pointer hover:bg-[#BC2025]/20"
                >
                  <div className="text-[14px] font-bold font-hindi text-[#BC2025]">फिर से</div>
                  <div className="text-[11px] text-[#BC2025]/80">Again (0)</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleRate(3)}
                  className="glass-saffron p-3 rounded-[12px] text-center transition cursor-pointer hover:bg-[#FF9933]/20"
                >
                  <div className="text-[14px] font-bold font-hindi text-[#B45309]">कठिन</div>
                  <div className="text-[11px] text-[#B45309]/80">Hard (3)</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleRate(4)}
                  className="glass-green p-3 rounded-[12px] text-center transition cursor-pointer hover:bg-[#138808]/20"
                >
                  <div className="text-[14px] font-bold font-hindi text-[#138808]">अच्छा</div>
                  <div className="text-[11px] text-[#138808]/80">Good (4)</div>
                </button>
                <button
                  type="button"
                  onClick={() => handleRate(5)}
                  className="glass-navy p-3 rounded-[12px] text-center transition cursor-pointer hover:bg-[#0D1B4B]/20"
                >
                  <div className="text-[14px] font-bold font-hindi text-[#0D1B4B]">आसान</div>
                  <div className="text-[11px] text-[#0D1B4B]/80">Easy (5)</div>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
