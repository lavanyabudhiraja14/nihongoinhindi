import { describe, it, expect, beforeEach } from 'vitest';
import kanjiData from '../content/kanji.json';
import vocabData from '../content/vocab.json';
import { KanjiItem, VocabItem } from '../types';
import { kanjiToQuizItems } from '../lib/quiz';
import { createInitialCard } from '../lib/sm2';
import {
  getUserProfile,
  toggleKanjiGroupCompleted,
  isKanjiGroupCompleted,
  resetProgress,
} from '../lib/storage';

describe('Kanji Content Validation & Integrity', () => {
  const allKanji = kanjiData as KanjiItem[];
  const allVocab = vocabData as VocabItem[];
  const vocabIdSet = new Set(allVocab.map((v) => v.id));

  it('contains exactly 50 kanji items', () => {
    expect(allKanji.length).toBe(50);
  });

  it('has unique IDs across all kanji items', () => {
    const seenIds = new Set<string>();
    allKanji.forEach((k) => {
      expect(seenIds.has(k.id), `Duplicate kanji ID: ${k.id}`).toBe(false);
      seenIds.add(k.id);
    });
    expect(seenIds.size).toBe(50);
  });

  it('is divided into 5 groups with 10 kanji each', () => {
    const groups = new Map<string, KanjiItem[]>();
    allKanji.forEach((k) => {
      const list = groups.get(k.groupId) || [];
      list.push(k);
      groups.set(k.groupId, list);
    });

    expect(groups.size).toBe(5);
    ['group-k1', 'group-k2', 'group-k3', 'group-k4', 'group-k5'].forEach((gId) => {
      expect(groups.has(gId), `Missing group: ${gId}`).toBe(true);
      expect(groups.get(gId)?.length, `Group ${gId} should have 10 kanji`).toBe(10);
    });
  });

  it('has no duplicate Hindi meanings within the same groupId', () => {
    const groupMeanings = new Map<string, Set<string>>();

    allKanji.forEach((k) => {
      if (!groupMeanings.has(k.groupId)) {
        groupMeanings.set(k.groupId, new Set());
      }
      const set = groupMeanings.get(k.groupId)!;
      const trimmed = k.meaningHindi.trim();
      expect(
        set.has(trimmed),
        `Duplicate Hindi meaning '${trimmed}' found in ${k.groupId} (item: ${k.id})`
      ).toBe(false);
      set.add(trimmed);
    });
  });

  it('ensures every linkedVocabIds entry exists in vocab.json', () => {
    allKanji.forEach((k) => {
      expect(Array.isArray(k.linkedVocabIds), `${k.id} linkedVocabIds must be an array`).toBe(true);
      k.linkedVocabIds.forEach((vId) => {
        expect(
          vocabIdSet.has(vId),
          `Kanji ${k.id} references missing vocab ID: ${vId}`
        ).toBe(true);
      });
    });
  });

  it('contains all required fields with proper types', () => {
    allKanji.forEach((k) => {
      expect(typeof k.id).toBe('string');
      expect(typeof k.groupId).toBe('string');
      expect(typeof k.character).toBe('string');
      expect(k.character.length).toBeGreaterThan(0);
      expect(Array.isArray(k.onyomi)).toBe(true);
      expect(Array.isArray(k.kunyomi)).toBe(true);
      expect(typeof k.meaningHindi).toBe('string');
      expect(typeof k.meaningEnglish).toBe('string');
      expect(typeof k.strokeCount).toBe('number');
      expect(k.strokeCount).toBeGreaterThan(0);
      expect(typeof k.mnemonic).toBe('string');
      expect(k.needs_review).toBe(true);
    });
  });
});

describe('Kanji Quiz Conversion (kanjiToQuizItems)', () => {
  const allKanji = kanjiData as KanjiItem[];
  const allVocab = vocabData as VocabItem[];

  it('converts to quiz items in "meaning" mode correctly', () => {
    const quizItems = kanjiToQuizItems(allKanji, 'meaning', allVocab);
    expect(quizItems.length).toBe(allKanji.length);

    quizItems.forEach((q, idx) => {
      const original = allKanji[idx];
      expect(q.id).toBe(`${original.id}-meaning`);
      expect(q.prompt).toBe(original.character);
      expect(q.answer).toBe(original.meaningHindi);
      expect(q.answerHindi).toBe(original.meaningHindi);
      expect(q.group).toBe(original.groupId);
    });
  });

  it('converts to quiz items in "reading" mode and skips kanji without linked vocab', () => {
    const quizItems = kanjiToQuizItems(allKanji, 'reading', allVocab);
    expect(quizItems.length).toBeGreaterThan(0);

    quizItems.forEach((q) => {
      expect(q.prompt).toBeTruthy();
      expect(q.answer).toBeTruthy(); // kana reading
      expect(q.answerRomaji).toBeTruthy();
      expect(q.answerHindi).toBeTruthy();
    });

    // Test skipping kanji with zero linkedVocabIds
    const dummyKanji: KanjiItem[] = [
      {
        id: 'k-dummy-1',
        groupId: 'group-k1',
        character: '無',
        onyomi: ['ム'],
        kunyomi: ['な-い'],
        meaningHindi: 'कुछ नहीं',
        meaningEnglish: 'nothing',
        strokeCount: 12,
        jlptLevel: 'N5',
        mnemonic: 'स्मरण',
        needs_review: true,
        linkedVocabIds: [], // 0 linked vocab
      },
      {
        id: 'k-dummy-2',
        groupId: 'group-k1',
        character: '一',
        onyomi: ['イチ'],
        kunyomi: ['ひと-つ'],
        meaningHindi: 'एक',
        meaningEnglish: 'one',
        strokeCount: 1,
        jlptLevel: 'N5',
        mnemonic: 'एक रेखा',
        needs_review: true,
        linkedVocabIds: ['v-ichi'],
      },
    ];

    const dummyQuizItems = kanjiToQuizItems(dummyKanji, 'reading', allVocab);
    expect(dummyQuizItems.length).toBe(1);
    expect(dummyQuizItems[0].id).toBe('k-dummy-2-reading');
    expect(dummyQuizItems[0].answer).toBe('いち');
  });
});

describe('Kanji SM-2 & Storage Integration', () => {
  const storageMock: Record<string, string> = {};

  beforeEach(() => {
    for (const k in storageMock) delete storageMock[k];

    const mockStorage = {
      getItem: (key: string) => storageMock[key] ?? null,
      setItem: (key: string, val: string) => {
        storageMock[key] = String(val);
      },
      removeItem: (key: string) => {
        delete storageMock[key];
      },
      clear: () => {
        for (const k in storageMock) delete storageMock[k];
      },
    };

    (globalThis as unknown as { window: unknown }).window = {
      localStorage: mockStorage,
    };
    (globalThis as unknown as { localStorage: unknown }).localStorage = mockStorage;

    resetProgress();
  });

  it('creates SM-2 card with composite id "kanji:<id>"', () => {
    const card = createInitialCard('k-ichi', 'kanji');
    expect(card.id).toBe('kanji:k-ichi');
    expect(card.source).toBe('kanji');
    expect(card.rawId).toBe('k-ichi');
    expect(card.repetitions).toBe(0);
    expect(card.easeFactor).toBe(2.5);
  });

  it('toggles kanji group completion correctly in user profile', () => {
    expect(isKanjiGroupCompleted('group-k1')).toBe(false);

    const updated1 = toggleKanjiGroupCompleted('group-k1');
    expect(updated1.completedKanjiGroups).toContain('group-k1');
    expect(isKanjiGroupCompleted('group-k1')).toBe(true);

    const updated2 = toggleKanjiGroupCompleted('group-k1');
    expect(updated2.completedKanjiGroups).not.toContain('group-k1');
    expect(isKanjiGroupCompleted('group-k1')).toBe(false);
  });
});
