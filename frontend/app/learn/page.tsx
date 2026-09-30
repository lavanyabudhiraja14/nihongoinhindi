'use client';

import React, { useState, useEffect } from 'react';
import unitsData from '@/content/units.json';
import hiraganaData from '@/content/hiragana.json';
import katakanaData from '@/content/katakana.json';
import vocabData from '@/content/vocab.json';
import kanjiData from '@/content/kanji.json';
import grammarData from '@/content/grammar.json';
import { Unit, KanaItem, VocabItem, GrammarPoint, KanjiItem, UserProfile } from '@/types';
import {
  getUserProfile,
  markLessonCompleted,
  toggleKanaGroupCompleted,
  toggleKanjiGroupCompleted,
  addCardsToDeck,
  getDeckCards,
} from '@/lib/storage';
import { createInitialCard } from '@/lib/sm2';
import { kanaToQuizItems, kanjiToQuizItems, QuizItem } from '@/lib/quiz';
import KanaDetailModal from '@/components/KanaDetailModal';
import KanjiDetailModal from '@/components/KanjiDetailModal';
import KatakanaExercise from '@/components/KatakanaExercise';
import VocabUnitView from '@/components/VocabUnitView';
import GrammarPointView from '@/components/GrammarPointView';
import Quiz from '@/components/Quiz';

interface KanaGroupDef {
  id: string;
  nameHindi: string;
  nameJp: string;
  category: 'basic' | 'dakuten' | 'handakuten' | 'yoon' | 'special';
  rowKey: string;
}

const KANJI_GROUP_DEFS = [
  { id: 'group-k1', titleHindi: 'कांजी १: संख्याएँ व आधार (१ ~ १०)', count: 10, icon: '🔢', subtitle: 'Numbers 1-10 (一 ~ 十)' },
  { id: 'group-k2', titleHindi: 'कांजी २: प्रकृति व काल (तत्व)', count: 10, icon: '🌲', subtitle: 'Nature & Calendar (日, 月, 木, 水...)' },
  { id: 'group-k3', titleHindi: 'कांजी ३: मनुष्य, दिशाएँ व आकार', count: 10, icon: '👥', subtitle: 'People & Directions (人, 男, 女, 上, 下...)' },
  { id: 'group-k4', titleHindi: 'कांजी ४: मुख्य क्रियाएँ व जीवन', count: 10, icon: '🏃', subtitle: 'Verbs & Actions (行, 来, 食, 飲, 見...)' },
  { id: 'group-k5', titleHindi: 'कांजी ५: समय, स्थान व समाज', count: 10, icon: '🏫', subtitle: 'Time & Places (年, 今, 校, 先, 生...)' },
];

const KANA_GROUPS: KanaGroupDef[] = [
  // Basic Rows
  { id: 'a-row', nameHindi: 'A-पङ्क्ति (स्वर)', nameJp: 'あ行 (a, i, u, e, o)', category: 'basic', rowKey: 'a-row' },
  { id: 'ka-row', nameHindi: 'Ka-पङ्क्ति', nameJp: 'か行 (ka, ki, ku, ke, ko)', category: 'basic', rowKey: 'ka-row' },
  { id: 'sa-row', nameHindi: 'Sa-पङ्क्ति', nameJp: 'さ行 (sa, shi, su, se, so)', category: 'basic', rowKey: 'sa-row' },
  { id: 'ta-row', nameHindi: 'Ta-पङ्क्ति', nameJp: 'た行 (ta, chi, tsu, te, to)', category: 'basic', rowKey: 'ta-row' },
  { id: 'na-row', nameHindi: 'Na-पङ्क्ति', nameJp: 'な行 (na, ni, nu, ne, no)', category: 'basic', rowKey: 'na-row' },
  { id: 'ha-row', nameHindi: 'Ha-पङ्क्ति', nameJp: 'हा行 (ha, hi, fu, he, ho)', category: 'basic', rowKey: 'ha-row' },
  { id: 'ma-row', nameHindi: 'Ma-पङ्क्ति', nameJp: 'ま行 (ma, mi, mu, me, mo)', category: 'basic', rowKey: 'ma-row' },
  { id: 'ya-row', nameHindi: 'Ya-पङ्क्ति', nameJp: 'や行 (ya, yu, yo)', category: 'basic', rowKey: 'ya-row' },
  { id: 'ra-row', nameHindi: 'Ra-पङ्क्ति (Tap R)', nameJp: 'ら行 (ra, ri, ru, re, ro)', category: 'basic', rowKey: 'ra-row' },
  { id: 'wa-row', nameHindi: 'Wa & N-पङ्क्ति', nameJp: 'わ行・ん (wa, o, n)', category: 'basic', rowKey: 'wa-row' },

  // Dakuten
  { id: 'ga-row', nameHindi: 'Ga-पङ्क्ति (दकुतेन)', nameJp: 'が行 (ga, gi, gu, ge, go)', category: 'dakuten', rowKey: 'ga-row' },
  { id: 'za-row', nameHindi: 'Za-पङ्क्ति (दकुतेन)', nameJp: 'ざ行 (za, ji, zu, ze, zo)', category: 'dakuten', rowKey: 'za-row' },
  { id: 'da-row', nameHindi: 'Da-पङ्क्ति (दकुतेन)', nameJp: 'だ行 (da, ji, zu, de, do)', category: 'dakuten', rowKey: 'da-row' },
  { id: 'ba-row', nameHindi: 'Ba-पङ्क्ति (दकुतेन)', nameJp: 'ば行 (ba, bi, bu, be, bo)', category: 'dakuten', rowKey: 'ba-row' },

  // Handakuten
  { id: 'pa-row', nameHindi: 'Pa-पङ्क्ति (हन्दाकुतेन)', nameJp: 'ぱ行 (pa, pi, pu, pe, po)', category: 'handakuten', rowKey: 'pa-row' },

  // Yoon Combinations
  { id: 'kya-group', nameHindi: 'Kya-वर्ग (संयोजन)', nameJp: 'きゃ・きゅ・きょ', category: 'yoon', rowKey: 'kya-group' },
  { id: 'sha-group', nameHindi: 'Sha-वर्ग (संयोजन)', nameJp: 'しゃ・しゅ・しょ', category: 'yoon', rowKey: 'sha-group' },
  { id: 'cha-group', nameHindi: 'Cha-वर्ग (संयोजन)', nameJp: 'ちゃ・ちゅ・ちょ', category: 'yoon', rowKey: 'cha-group' },
  { id: 'nya-group', nameHindi: 'Nya-वर्ग (संयोजन)', nameJp: 'にゃ・にゅ・にょ', category: 'yoon', rowKey: 'nya-group' },
  { id: 'hya-group', nameHindi: 'Hya-वर्ग (संयोजन)', nameJp: 'ひゃ・ひゅ・ひょ', category: 'yoon', rowKey: 'hya-group' },
  { id: 'mya-group', nameHindi: 'Mya-वर्ग (संयोजन)', nameJp: 'みゃ・みゅ・みょ', category: 'yoon', rowKey: 'mya-group' },
  { id: 'rya-group', nameHindi: 'Rya-वर्ग (संयोजन)', nameJp: 'りゃ・りゅ・りょ', category: 'yoon', rowKey: 'rya-group' },
  { id: 'gya-group', nameHindi: 'Gya-वर्ग (संयोजन)', nameJp: 'ぎゃ・ぎゅ・ぎょ', category: 'yoon', rowKey: 'gya-group' },
  { id: 'ja-group', nameHindi: 'Ja-वर्ग (संयोजन)', nameJp: 'じゃ・じゅ・じょ', category: 'yoon', rowKey: 'ja-group' },
  { id: 'bya-group', nameHindi: 'Bya-वर्ग (संयोजन)', nameJp: 'びゃ・びゅ・びょ', category: 'yoon', rowKey: 'bya-group' },
  { id: 'pya-group', nameHindi: 'Pya-वर्ग (संयोजन)', nameJp: 'ぴゃ・ぴゅ・ぴょ', category: 'yoon', rowKey: 'pya-group' },

  // Special Sounds
  { id: 'special-sounds', nameHindi: 'विशेष ध्वनियाँ (Special Sounds)', nameJp: '促音・長音・四つ仮名', category: 'special', rowKey: 'special-sounds' },
];

const VOCAB_UNIT_DEFS = [
  { id: 'unit-v1', titleHindi: 'यूनिट १: अभिवादन व शिष्टाचार', count: 10, icon: '👋' },
  { id: 'unit-v2', titleHindi: 'यूनिट २: संख्याएँ (१ से १०)', count: 10, icon: '🔢' },
  { id: 'unit-v3', titleHindi: 'यूनिट ३: परिवार और रिश्ते', count: 10, icon: '👨‍👩‍👧‍👦' },
  { id: 'unit-v4', titleHindi: 'यूनिट ४: भोजन और पेय', count: 10, icon: '🍱' },
  { id: 'unit-v5', titleHindi: 'यूनिट ५: समय और दिन', count: 10, icon: '⏰' },
  { id: 'unit-v6', titleHindi: 'यूनिट ६: स्थान और शहर', count: 10, icon: '🏫' },
  { id: 'unit-v7', titleHindi: 'यूनिट ७: दैनिक मुख्य क्रियाएँ', count: 10, icon: '🏃' },
  { id: 'unit-v8', titleHindi: 'यूनिट ८: N5 मुख्य विशेषण', count: 10, icon: '✨' },
  { id: 'unit-v9', titleHindi: 'यूनिट ९: रंग और वस्तुएँ', count: 10, icon: '🎨' },
  { id: 'unit-v10', titleHindi: 'यूनिट १०: दैनिक जीवन की वस्तुएँ', count: 10, icon: '🪑' },
  { id: 'unit-v11', titleHindi: 'यूनिट ११: शरीर के अंग', count: 10, icon: '👤' },
  { id: 'unit-v12', titleHindi: 'यूनिट १२: मौसम और प्रकृति', count: 10, icon: '⛅' },
  { id: 'unit-v13', titleHindi: 'यूनिट १३: कपड़े व परिधान', count: 10, icon: '👘' },
  { id: 'unit-v14', titleHindi: 'यूनिट १४: क्रियाएँ २ (Daily Verbs 2)', count: 10, icon: '🚶' },
  { id: 'unit-v15', titleHindi: 'यूनिट १५: भावनाएँ व संवेदनाएँ', count: 10, icon: '😊' },
  { id: 'unit-v16', titleHindi: 'यूनिट १६: यात्रा व परिवहन', count: 10, icon: '🚅' },
  { id: 'unit-v17', titleHindi: 'यूनिट १७: काल व समय २ (Time & Calendar 2)', count: 10, icon: '📅' },
  { id: 'unit-v18', titleHindi: 'यूनिट १८: प्रश्नवाचक शब्द (Question Words)', count: 10, icon: '❓' },
  { id: 'unit-v19', titleHindi: 'यूनिट १९: घर-गृहस्थी व उपकरण', count: 10, icon: '🏠' },
  { id: 'unit-v20', titleHindi: 'यूनिट २०: बातचीत व सामाजिक शिष्टाचार', count: 10, icon: '🤝' },
];

export default function LearnPage() {
  const [activeTab, setActiveTab] = useState<'units' | 'hiragana' | 'katakana' | 'kanji' | 'vocab' | 'grammar' | 'exercise'>('units');
  const [selectedKana, setSelectedKana] = useState<KanaItem | null>(null);
  const [selectedKanji, setSelectedKanji] = useState<KanjiItem | null>(null);
  const [selectedVocabUnit, setSelectedVocabUnit] = useState<{ id: string; title: string; items: VocabItem[] } | null>(null);
  const [selectedGrammarPoint, setSelectedGrammarPoint] = useState<GrammarPoint | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [deckCardIds, setDeckCardIds] = useState<Set<string>>(new Set());
  const [activeQuiz, setActiveQuiz] = useState<{ items: QuizItem[]; pool: QuizItem[]; title: string } | null>(null);

  const units = unitsData as Unit[];
  const hiragana = hiraganaData as KanaItem[];
  const katakana = katakanaData as KanaItem[];
  const allVocab = vocabData as VocabItem[];
  const allKanji = kanjiData as KanjiItem[];
  const allGrammar = grammarData as GrammarPoint[];

  useEffect(() => {
    refreshState();
  }, []);

  const refreshState = () => {
    setProfile(getUserProfile());
    const deck = getDeckCards();
    setDeckCardIds(new Set(deck.map((c) => c.id)));
  };

  const handleToggleLesson = (lessonId: string) => {
    const updated = markLessonCompleted(lessonId);
    setProfile({ ...updated });
  };

  const handleToggleKanaGroup = (groupId: string, scriptPrefix: string) => {
    const fullKey = `${scriptPrefix}-${groupId}`;
    const updated = toggleKanaGroupCompleted(fullKey);
    setProfile({ ...updated });
  };

  const handleToggleKanjiGroup = (groupId: string) => {
    const updated = toggleKanjiGroupCompleted(groupId);
    setProfile({ ...updated });
  };

  const handleAddGroupToDeck = (groupItems: KanaItem[], scriptType: 'hiragana' | 'katakana') => {
    const cards = groupItems.map((item) => createInitialCard(item.id, scriptType));
    addCardsToDeck(cards);
    refreshState();
  };

  const handleAddKanjiGroupToDeck = (groupItems: KanjiItem[]) => {
    const cards = groupItems.map((item) => createInitialCard(item.id, 'kanji'));
    addCardsToDeck(cards);
    refreshState();
  };

  const handleStartGroupQuiz = (groupItems: KanaItem[], allItems: KanaItem[], groupTitle: string) => {
    const quizItems = kanaToQuizItems(groupItems);
    const pool = kanaToQuizItems(allItems);
    if (quizItems.length === 0) return;
    setActiveQuiz({ items: quizItems, pool, title: groupTitle });
  };

  const handleStartKanjiQuiz = (
    groupItems: KanjiItem[],
    allItems: KanjiItem[],
    groupTitle: string,
    mode: 'meaning' | 'reading' = 'meaning'
  ) => {
    const quizItems = kanjiToQuizItems(groupItems, mode, allVocab);
    const pool = kanjiToQuizItems(allItems, mode, allVocab);
    if (quizItems.length === 0) return;
    const modeTitle = mode === 'reading' ? `${groupTitle} (संदर्भ पठन)` : `${groupTitle} (अर्थ क्विज़)`;
    setActiveQuiz({ items: quizItems, pool, title: modeTitle });
  };

  const renderKanaSection = (items: KanaItem[], scriptType: 'hiragana' | 'katakana') => {
    const scriptPrefix = scriptType === 'hiragana' ? 'h' : 'k';
    const categories: Array<{ key: KanaGroupDef['category']; titleHindi: string; badge: string }> = [
      { key: 'basic', titleHindi: '१. मूल ४६ वर्ण (Basic Characters)', badge: '46 अक्षर' },
      { key: 'dakuten', titleHindi: '२. दकुतेन ध्वनियाँ (Dakuten: ग, ज़, द, ब)', badge: '20 अक्षर' },
      { key: 'handakuten', titleHindi: '३. हन्दाकुतेन ध्वनियाँ (Handakuten: प)', badge: '5 अक्षर' },
      { key: 'yoon', titleHindi: '४. संयोजन ध्वनियाँ (Yoon Combinations)', badge: '33 संयोजन' },
      { key: 'special', titleHindi: '५. विशेष ध्वनियाँ (Special Sounds)', badge: '3 नियम' },
    ];

    return (
      <div className="space-y-6">
        {categories.map((cat) => {
          const groupsInCat = KANA_GROUPS.filter((g) => g.category === cat.key);

          return (
            <div key={cat.key} className="space-y-3">
              <div className="flex items-center justify-between border-b border-[#E8E8EC] pb-2">
                <h3 className="text-[16px] font-semibold text-[#0D1B4B] font-hindi">
                  {cat.titleHindi}
                </h3>
                <span className="glass-pill-red text-[11px] font-hindi">
                  {cat.badge}
                </span>
              </div>

              <div className="space-y-3">
                {groupsInCat.map((group) => {
                  const groupItems = items.filter((item) => item.row === group.rowKey);
                  const fullGroupKey = `${scriptPrefix}-${group.id}`;
                  const isCompleted = profile?.completedKanaGroups?.includes(fullGroupKey) || false;

                  if (groupItems.length === 0) return null;

                  const allInDeck = groupItems.every((item) =>
                    deckCardIds.has(`${scriptType}:${item.id}`)
                  );

                  return (
                    <div
                      key={group.id}
                      className="bg-white rounded-[12px] p-4 border border-[#E8E8EC] shadow-xs space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-[14px] text-[#0D1B4B] font-hindi">
                            {group.nameHindi}
                          </div>
                          <div className="text-[11px] text-[#5B6070] font-jp mt-0.5">
                            {group.nameJp}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleKanaGroup(group.id, scriptPrefix)}
                          className={`px-3 py-1 rounded-[6px] text-[12px] font-semibold transition cursor-pointer flex items-center gap-1 border font-hindi ${
                            isCompleted
                              ? 'bg-emerald-50 text-[#138808] border-emerald-300'
                              : 'bg-[#F4F4F6] text-[#5B6070] border-[#E8E8EC] hover:border-[#138808] hover:text-[#138808]'
                          }`}
                        >
                          <span>{isCompleted ? '✓ सीखा गया' : 'मार्क करें'}</span>
                        </button>
                      </div>

                      <div
                        className={`grid gap-2 ${
                          group.category === 'special'
                            ? 'grid-cols-1'
                            : groupItems.length <= 3
                              ? 'grid-cols-3'
                              : 'grid-cols-5'
                        }`}
                      >
                        {groupItems.map((item) => {
                          const itemInDeck = deckCardIds.has(`${scriptType}:${item.id}`);
                          return (
                            <div
                              key={item.id}
                              onClick={() => setSelectedKana(item)}
                              className="bg-[#F4F4F6] hover:bg-white hover:border-[#0D1B4B]/30 border border-[#E8E8EC] rounded-[8px] p-2 text-center cursor-pointer transition-all active:scale-95 flex flex-col items-center justify-center gap-0.5 relative"
                            >
                              {itemInDeck && (
                                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#BC2025]" title="डेक में है" />
                              )}
                              <span
                                className={`font-bold font-jp text-[#0D1B4B] leading-none ${
                                  group.category === 'special' ? 'text-[18px]' : 'text-[24px]'
                                }`}
                              >
                                {item.kana}
                              </span>
                              <span className="text-[11px] font-semibold text-[#BC2025] truncate max-w-full font-hindi">
                                {item.hindiPhonetic}
                              </span>
                              <span className="text-[9px] text-[#5B6070] font-mono truncate max-w-full">
                                /{item.romaji}/
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {group.category !== 'special' && (
                        <div className="flex gap-2 pt-2 border-t border-[#E8E8EC]">
                          <button
                            type="button"
                            onClick={() => handleAddGroupToDeck(groupItems, scriptType)}
                            className={`flex-1 py-1.5 px-2 rounded-[6px] text-[12px] font-semibold border transition cursor-pointer flex items-center justify-center gap-1 font-hindi ${
                              allInDeck
                                ? 'bg-[#F4F4F6] text-[#5B6070] border-[#E8E8EC]'
                                : 'bg-[#0D1B4B] hover:bg-[#081232] text-white border-transparent'
                            }`}
                          >
                            <span>{allInDeck ? '✓ डेक में जुड़े हैं' : 'डेक में जोड़ें'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleStartGroupQuiz(groupItems, items, group.nameHindi)}
                            className="flex-1 py-1.5 px-2 glass-red rounded-[6px] text-[12px] font-semibold text-[#BC2025] transition cursor-pointer flex items-center justify-center gap-1 font-hindi hover:bg-[#BC2025]/20"
                          >
                            <span>क्विज़ लें</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="pb-2 border-b border-[#E8E8EC]">
        <h1 className="text-[28px] font-semibold text-[#0D1B4B] font-hindi leading-tight">
          सीखने का मार्ग
        </h1>
        <p className="text-[13px] text-[#5B6070] mt-0.5">
          Curriculum: JLPT N5 वर्णमाला, शब्दावली एवं व्याकरण
        </p>
      </header>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-[12px] bg-white border border-[#E8E8EC] shadow-xs">
        {[
          { id: 'units', labelHindi: 'इकाइयाँ', labelEn: 'Units' },
          { id: 'vocab', labelHindi: 'शब्दावली', labelEn: '200 Vocab' },
          { id: 'kanji', labelHindi: 'कांजी', labelEn: '50 Kanji' },
          { id: 'grammar', labelHindi: 'व्याकरण', labelEn: '25 Grammar' },
          { id: 'hiragana', labelHindi: 'हिरागाना', labelEn: 'あ Hiragana' },
          { id: 'katakana', labelHindi: 'काताकाना', labelEn: 'ア Katakana' },
          { id: 'exercise', labelHindi: 'लोनवर्ड्स', labelEn: 'Loanwords' },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-2 px-3.5 rounded-[8px] text-[13px] font-hindi transition-all duration-150 cursor-pointer border-[1.5px] ${
                isActive
                  ? 'border-[#0D1B4B] bg-[#0D1B4B]/[0.10] text-[#0D1B4B] font-semibold shadow-xs'
                  : 'border-transparent text-[#5B6070] hover:text-[#0D1B4B] hover:bg-[#0D1B4B]/[0.04]'
              }`}
            >
              <span>{tab.labelHindi}</span>
              <span className="text-[11px] block font-normal text-[#5B6070]">{tab.labelEn}</span>
            </button>
          );
        })}
      </div>


      {/* Tab: Units */}
      {activeTab === 'units' && (
        <div className="space-y-4">
          {units.map((unit) => (
            <div
              key={unit.id}
              className="bg-white rounded-[12px] p-6 border border-[#E8E8EC] shadow-xs space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="glass-pill-red text-[11px] font-mono">
                    Unit {unit.unitNumber}
                  </span>
                  <h3 className="text-[18px] font-semibold text-[#0D1B4B] mt-2 font-hindi leading-tight">
                    {unit.titleHindi}
                  </h3>
                  <p className="text-[13px] font-jp text-[#5B6070] mt-0.5">
                    {unit.titleJp}
                  </p>
                </div>
                {unit.needs_review && (
                  <span className="glass-pill-saffron text-[11px] font-hindi">
                    समीक्षाधीन
                  </span>
                )}
              </div>

              <p className="text-[14px] text-[#0D1B4B]/80 leading-relaxed font-hindi bg-[#F4F4F6] p-3 rounded-[8px] border border-[#E8E8EC]">
                {unit.descriptionHindi}
              </p>

              <div className="space-y-2 pt-1">
                {unit.lessons.map((lesson) => {
                  const isCompleted = profile?.completedLessons.includes(lesson.id);

                  return (
                    <div
                      key={lesson.id}
                      className="flex items-center justify-between p-3.5 rounded-[8px] bg-white border border-[#E8E8EC] hover:border-[#0D1B4B]/30 transition"
                    >
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleToggleLesson(lesson.id)}
                          className={`w-6 h-6 rounded-[6px] flex items-center justify-center border text-[11px] font-bold transition cursor-pointer ${isCompleted
                              ? 'bg-[#138808] border-[#138808] text-white'
                              : 'border-[#E8E8EC] bg-[#F4F4F6] text-[#5B6070] hover:border-[#138808]'
                            }`}
                        >
                          {isCompleted ? '✓' : ''}
                        </button>
                        <div>
                          <div className="text-[14px] font-semibold text-[#0D1B4B] font-hindi">
                            {lesson.titleHindi}
                          </div>
                          <div className="text-[12px] text-[#5B6070] font-jp mt-0.5">
                            {lesson.titleJp} • {lesson.durationMinutes} मिनट
                          </div>
                        </div>
                      </div>

                      <span className="glass-pill-navy text-[11px] font-hindi">
                        {lesson.type}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Vocabulary (20 Units Path) */}
      {activeTab === 'vocab' && (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-[12px] border border-[#E8E8EC] text-[13px] text-[#0D1B4B]/80 font-hindi leading-relaxed">
            <strong className="text-[#0D1B4B]">JLPT N5 शब्दावली (200 शब्द):</strong> २० इकाइयों में विभाजित २०० आवश्यक शब्द। किसी भी यूनिट पर टैप करके शब्द सीखें, डेक में जोड़ें व क्विज़ हल करें।
          </div>

          <div className="space-y-3">
            {VOCAB_UNIT_DEFS.map((uDef) => {
              const unitWords = allVocab.filter((w) => w.unitId === uDef.id);
              const isCompleted = profile?.completedVocabUnits?.includes(uDef.id) || false;
              const inDeckCount = unitWords.filter((w) => deckCardIds.has(`vocab:${w.id}`)).length;

              return (
                <div
                  key={uDef.id}
                  onClick={() =>
                    setSelectedVocabUnit({
                      id: uDef.id,
                      title: uDef.titleHindi,
                      items: unitWords,
                    })
                  }
                  className="bg-white rounded-[12px] p-4 border border-[#E8E8EC] hover:border-[#0D1B4B]/30 shadow-xs transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-9 h-9 rounded-[8px] bg-[#F4F4F6] border border-[#E8E8EC] flex items-center justify-center text-[13px] font-bold text-[#0D1B4B] font-mono">
                      {uDef.id.replace('unit-v', 'V')}
                    </div>
                    <div>
                      <div className="font-semibold text-[15px] text-[#0D1B4B] font-hindi group-hover:text-[#BC2025] transition">
                        {uDef.titleHindi}
                      </div>
                      <div className="text-[12px] text-[#5B6070] mt-0.5">
                        {uDef.count} शब्द • {inDeckCount} डेक में
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isCompleted ? (
                      <span className="glass-pill-green text-[11px] font-hindi">
                        ✓ पूर्ण (Passed)
                      </span>
                    ) : (
                      <span className="text-[13px] text-[#5B6070] group-hover:text-[#BC2025] transition font-hindi font-medium">
                        खोलें →
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab: Kanji (5 Groups of 10) */}
      {activeTab === 'kanji' && (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-[12px] border border-[#E8E8EC] text-[13px] text-[#0D1B4B]/80 font-hindi leading-relaxed">
            <strong className="text-[#0D1B4B]">JLPT N5 कांजी (50 वर्ण):</strong> ५ समूहों में विभाजित ५० आवश्यक कांजी। विवरण देखने व शब्दावली उच्चारण सुनने के लिए कांजी पर टैप करें।
          </div>

          <div className="space-y-4">
            {KANJI_GROUP_DEFS.map((gDef) => {
              const groupKanji = allKanji.filter((k) => k.groupId === gDef.id);
              const isCompleted = profile?.completedKanjiGroups?.includes(gDef.id) || false;
              const allInDeck = groupKanji.every((item) =>
                deckCardIds.has(`kanji:${item.id}`)
              );

              return (
                <div
                  key={gDef.id}
                  className="bg-white rounded-[12px] p-5 border border-[#E8E8EC] shadow-xs space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-[8px] bg-[#F4F4F6] border border-[#E8E8EC] flex items-center justify-center text-[13px] font-bold text-[#0D1B4B] font-mono">
                        {gDef.id.replace('group-k', 'K')}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="glass-pill-navy text-[10px] font-mono">
                            {gDef.id}
                          </span>
                          <span className="text-[11px] text-[#5B6070] font-hindi font-medium">
                            10 कांजी
                          </span>
                        </div>
                        <h3 className="text-[16px] font-semibold text-[#0D1B4B] mt-1 font-hindi">
                          {gDef.titleHindi}
                        </h3>
                        <p className="text-[12px] text-[#5B6070] font-mono mt-0.5">
                          {gDef.subtitle}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleKanjiGroup(gDef.id)}
                      className={`px-3 py-1.5 rounded-[6px] text-[12px] font-semibold transition cursor-pointer flex items-center gap-1 border font-hindi ${
                        isCompleted
                          ? 'bg-emerald-50 text-[#138808] border-emerald-300'
                          : 'bg-[#F4F4F6] text-[#5B6070] border-[#E8E8EC] hover:border-[#138808] hover:text-[#138808]'
                      }`}
                    >
                      <span>{isCompleted ? '✓ सीखा गया' : 'मार्क करें'}</span>
                    </button>
                  </div>

                  {/* 10 Kanji Cards Grid */}
                  <div className="grid grid-cols-5 gap-2.5">
                    {groupKanji.map((item) => {
                      const itemInDeck = deckCardIds.has(`kanji:${item.id}`);
                      return (
                        <div
                          key={item.id}
                          onClick={() => setSelectedKanji(item)}
                          className="bg-[#F4F4F6] hover:bg-white hover:border-[#0D1B4B]/30 border border-[#E8E8EC] rounded-[8px] p-2.5 text-center cursor-pointer transition-all active:scale-95 flex flex-col items-center justify-center gap-0.5 relative group"
                        >
                          {itemInDeck && (
                            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-[#BC2025]" title="डेक में सुरक्षित है" />
                          )}
                          <span className="font-bold font-jp text-[#0D1B4B] text-[26px] leading-none group-hover:scale-105 transition-transform">
                            {item.character}
                          </span>
                          <span className="text-[11px] font-semibold text-[#BC2025] font-hindi truncate max-w-full mt-1">
                            {item.meaningHindi}
                          </span>
                          <span className="text-[9px] text-[#5B6070] font-jp truncate max-w-full">
                            {item.onyomi?.[0] || item.kunyomi?.[0] || ''}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Action buttons: Add to Deck, Quiz (Meaning), Quiz (Reading) */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-[#E8E8EC]">
                    <button
                      type="button"
                      onClick={() => handleAddKanjiGroupToDeck(groupKanji)}
                      className={`py-2 px-3 rounded-[8px] text-[13px] font-semibold border transition cursor-pointer flex items-center justify-center gap-1.5 font-hindi ${
                        allInDeck
                          ? 'bg-[#F4F4F6] text-[#5B6070] border-[#E8E8EC]'
                          : 'bg-[#0D1B4B] hover:bg-[#081232] text-white border-transparent'
                      }`}
                    >
                      <span>{allInDeck ? '✓ डेक में जुड़े हैं' : 'डेक में जोड़ें'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStartKanjiQuiz(groupKanji, allKanji, gDef.titleHindi, 'meaning')}
                      className="py-2 px-3 glass-red rounded-[8px] text-[13px] font-semibold text-[#BC2025] transition cursor-pointer flex items-center justify-center gap-1.5 font-hindi hover:bg-[#BC2025]/20"
                    >
                      <span>अर्थ क्विज़ (Meaning)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleStartKanjiQuiz(groupKanji, allKanji, gDef.titleHindi, 'reading')}
                      className="py-2 px-3 glass-saffron rounded-[8px] text-[13px] font-semibold text-[#B45309] transition cursor-pointer flex items-center justify-center gap-1.5 font-hindi hover:bg-[#FF9933]/20"
                    >
                      <span>पठन क्विज़ (Reading)</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab: Grammar (25 Core Points Path) */}
      {activeTab === 'grammar' && (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-[12px] border border-[#E8E8EC] text-[13px] text-[#0D1B4B]/80 font-hindi leading-relaxed">
            <strong className="text-[#0D1B4B]">JLPT N5 व्याकरण (25 नियम):</strong> हिंदी संरचना से तुलना, सामान्य गलतियाँ व अभ्यास क्विज़। किसी भी नियम पर टैप करके सीखें।
          </div>

          <div className="space-y-3">
            {allGrammar.map((point) => {
              const isCompleted = profile?.completedGrammarPoints?.includes(point.id) || false;

              return (
                <div
                  key={point.id}
                  onClick={() => setSelectedGrammarPoint(point)}
                  className="bg-white rounded-[12px] p-4 border border-[#E8E8EC] hover:border-[#0D1B4B]/30 shadow-xs transition-all cursor-pointer space-y-2 group"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="glass-pill-navy text-[10px] font-mono">
                        Point {point.pointNumber}
                      </span>
                      <h4 className="text-[15px] font-semibold text-[#0D1B4B] mt-1.5 font-hindi group-hover:text-[#BC2025] transition">
                        {point.titleHindi}
                      </h4>
                      <div className="text-[12px] font-jp text-[#5B6070] mt-0.5">
                        {point.titleJp}
                      </div>
                    </div>

                    {isCompleted ? (
                      <span className="glass-pill-green text-[11px] font-hindi">
                        ✓ पूर्ण (Passed)
                      </span>
                    ) : (
                      <span className="text-[13px] text-[#5B6070] group-hover:text-[#BC2025] transition font-hindi font-medium">
                        सीखें →
                      </span>
                    )}
                  </div>

                  <div className="bg-[#F4F4F6] p-2.5 rounded-[6px] border border-[#E8E8EC] text-[12px] font-mono text-[#0D1B4B] truncate">
                    सूत्र: {point.formula}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab: Hiragana */}
      {activeTab === 'hiragana' && (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-[12px] border border-[#E8E8EC] text-[13px] text-[#0D1B4B]/80 font-hindi leading-relaxed">
            <strong className="text-[#0D1B4B]">हिरागाना (Hiragana):</strong> जापानी के मूल शब्द व व्याकरण की लिपि। विवरण देखें, डेक में जोड़ें या क्विज़ लें।
          </div>

          {renderKanaSection(hiragana, 'hiragana')}
        </div>
      )}

      {/* Tab: Katakana */}
      {activeTab === 'katakana' && (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-[12px] border border-[#E8E8EC] text-[13px] text-[#0D1B4B]/80 font-hindi leading-relaxed">
            <strong className="text-[#0D1B4B]">काताकाना (Katakana):</strong> विदेशी भाषा के शब्दों (Loanwords) के लिए प्रयुक्त लिपि। विवरण देखें, डेक में जोड़ें या क्विज़ लें।
          </div>

          {renderKanaSection(katakana, 'katakana')}
        </div>
      )}

      {/* Tab: Katakana Loanwords Exercise */}
      {activeTab === 'exercise' && <KatakanaExercise />}

      {/* Modals */}
      <KanaDetailModal
        item={selectedKana}
        onClose={() => {
          setSelectedKana(null);
          refreshState();
        }}
      />

      <KanjiDetailModal
        item={selectedKanji}
        vocabList={allVocab}
        onClose={() => {
          setSelectedKanji(null);
          refreshState();
        }}
      />

      {selectedVocabUnit && (
        <VocabUnitView
          unitId={selectedVocabUnit.id}
          unitTitleHindi={selectedVocabUnit.title}
          items={selectedVocabUnit.items}
          allVocab={allVocab}
          onClose={() => {
            setSelectedVocabUnit(null);
            refreshState();
          }}
          onRefresh={refreshState}
        />
      )}

      {selectedGrammarPoint && (
        <GrammarPointView
          point={selectedGrammarPoint}
          onClose={() => {
            setSelectedGrammarPoint(null);
            refreshState();
          }}
          onRefresh={refreshState}
        />
      )}

      {activeQuiz && (
        <Quiz
          items={activeQuiz.items}
          allPool={activeQuiz.pool}
          titleHindi={activeQuiz.title}
          onClose={() => setActiveQuiz(null)}
        />
      )}
    </div>
  );
}
