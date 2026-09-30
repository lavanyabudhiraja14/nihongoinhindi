import { describe, it, expect } from 'vitest';
import {
  generateOptions,
  kanaToQuizItems,
  isEligibleKanaForQuiz,
  normalizeRomaji,
  checkTypedAnswer,
  QuizItem,
} from '../lib/quiz';
import hiraganaData from '../content/hiragana.json';
import katakanaData from '../content/katakana.json';
import { KanaItem } from '../types';

describe('Quiz Engine Logic', () => {
  const allHiraganaItems = kanaToQuizItems(hiraganaData as KanaItem[]);
  const allKatakanaItems = kanaToQuizItems(katakanaData as KanaItem[]);

  describe('Eligibility and Filtering', () => {
    it('excludes ぢ, づ, ヂ, ヅ from quiz pool', () => {
      const rawHiragana = hiraganaData as KanaItem[];
      const dji = rawHiragana.find((k) => k.id === 'h-dji');
      const dzu = rawHiragana.find((k) => k.id === 'h-dzu');

      expect(dji).toBeDefined();
      expect(isEligibleKanaForQuiz(dji!)).toBe(false);
      expect(isEligibleKanaForQuiz(dzu!)).toBe(false);

      const quizKanaIds = allHiraganaItems.map((q) => q.id);
      expect(quizKanaIds).not.toContain('h-dji');
      expect(quizKanaIds).not.toContain('h-dzu');
      expect(quizKanaIds).not.toContain('k-dji');
      expect(quizKanaIds).not.toContain('k-dzu');
    });

    it('excludes special-sounds group from quiz pool', () => {
      const rawHiragana = hiraganaData as KanaItem[];
      const specialItem = rawHiragana.find((k) => k.row === 'special-sounds');
      expect(specialItem).toBeDefined();
      expect(isEligibleKanaForQuiz(specialItem!)).toBe(false);

      const quizKanaIds = allHiraganaItems.map((q) => q.id);
      expect(quizKanaIds).not.toContain('h-special-sokuon');
      expect(quizKanaIds).not.toContain('h-special-chouon');
      expect(quizKanaIds).not.toContain('k-special-sokuon');
    });
  });

  describe('Distractor Option Generation', () => {
    it('always generates exactly 4 unique options including the correct answer in jp-to-romaji mode', () => {
      for (const target of allHiraganaItems.slice(0, 30)) {
        const options = generateOptions(target, allHiraganaItems, 'jp-to-romaji');

        expect(options.length).toBe(4);
        expect(new Set(options).size).toBe(4); // zero duplicates
        expect(options).toContain(target.answerRomaji);
      }
    });

    it('always generates exactly 4 unique options in romaji-to-jp mode', () => {
      for (const target of allKatakanaItems.slice(0, 30)) {
        const options = generateOptions(target, allKatakanaItems, 'romaji-to-jp');

        expect(options.length).toBe(4);
        expect(new Set(options).size).toBe(4); // zero duplicates
        expect(options).toContain(target.prompt);
      }
    });

    it('never allows two options in the same question that share the same romaji', () => {
      for (const target of allHiraganaItems) {
        const options = generateOptions(target, allHiraganaItems, 'jp-to-romaji');
        const lowerOptions = options.map((o) => o.toLowerCase());
        expect(new Set(lowerOptions).size).toBe(4);
      }
    });
  });

  describe('Typing Normalization & Aliases', () => {
    it('accepts standard alternate romaji transliterations (shi/si, chi/ti, tsu/tu, fu/hu, ji/zi)', () => {
      const shiItem: QuizItem = { id: 'h-shi', prompt: 'し', answer: 'shi', answerRomaji: 'shi', group: 'sa-row' };
      const chiItem: QuizItem = { id: 'h-chi', prompt: 'ち', answer: 'chi', answerRomaji: 'chi', group: 'ta-row' };
      const tsuItem: QuizItem = { id: 'h-tsu', prompt: 'つ', answer: 'tsu', answerRomaji: 'tsu', group: 'ta-row' };
      const fuItem: QuizItem = { id: 'h-fu', prompt: 'ふ', answer: 'fu', answerRomaji: 'fu', group: 'ha-row' };
      const jiItem: QuizItem = { id: 'h-ji', prompt: 'じ', answer: 'ji', answerRomaji: 'ji', group: 'za-row' };

      // shi / si
      expect(checkTypedAnswer('shi', shiItem)).toBe(true);
      expect(checkTypedAnswer('si', shiItem)).toBe(true);
      expect(checkTypedAnswer('  SI  ', shiItem)).toBe(true);

      // chi / ti
      expect(checkTypedAnswer('chi', chiItem)).toBe(true);
      expect(checkTypedAnswer('ti', chiItem)).toBe(true);

      // tsu / tu
      expect(checkTypedAnswer('tsu', tsuItem)).toBe(true);
      expect(checkTypedAnswer('tu', tsuItem)).toBe(true);

      // fu / hu
      expect(checkTypedAnswer('fu', fuItem)).toBe(true);
      expect(checkTypedAnswer('hu', fuItem)).toBe(true);

      // ji / zi
      expect(checkTypedAnswer('ji', jiItem)).toBe(true);
      expect(checkTypedAnswer('zi', jiItem)).toBe(true);
    });

    it('applies the "wo" alias ONLY for を/ヲ (isSpecialO: true), not globally', () => {
      const woItem: QuizItem = {
        id: 'h-wo',
        prompt: 'を',
        answer: 'o',
        answerRomaji: 'o',
        group: 'wa-row',
        isSpecialO: true,
      };

      const regularOItem: QuizItem = {
        id: 'h-o',
        prompt: 'お',
        answer: 'o',
        answerRomaji: 'o',
        group: 'a-row',
        isSpecialO: false,
      };

      // を accepts both 'o' and 'wo'
      expect(checkTypedAnswer('o', woItem)).toBe(true);
      expect(checkTypedAnswer('wo', woItem)).toBe(true);

      // Regular お accepts 'o', but rejects 'wo'
      expect(checkTypedAnswer('o', regularOItem)).toBe(true);
      expect(checkTypedAnswer('wo', regularOItem)).toBe(false);
    });

    it('handles whitespace, case-insensitivity, and direct Japanese input', () => {
      const kaItem: QuizItem = { id: 'h-ka', prompt: 'か', answer: 'ka', answerRomaji: 'ka', group: 'ka-row' };

      expect(checkTypedAnswer('KA', kaItem)).toBe(true);
      expect(checkTypedAnswer('  ka  ', kaItem)).toBe(true);
      expect(checkTypedAnswer('か', kaItem)).toBe(true);
      expect(checkTypedAnswer('ki', kaItem)).toBe(false);
    });
  });
});
