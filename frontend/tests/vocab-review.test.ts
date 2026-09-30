import { describe, it, expect } from 'vitest';
import vocabData from '../content/vocab.json';
import grammarData from '../content/grammar.json';
import { VocabItem, GrammarPoint } from '../types';
import { SM2Card, createInitialCard } from '../lib/sm2';

describe('Vocab Review Resolution & Content Integrity', () => {
  const allVocab = vocabData as VocabItem[];
  const allGrammar = grammarData as GrammarPoint[];

  it('contains exactly 200 vocab items across 20 units with 10 words each', () => {
    expect(allVocab.length).toBe(200);
    const unitGroups = new Map<string, VocabItem[]>();

    allVocab.forEach((w) => {
      const list = unitGroups.get(w.unitId) || [];
      list.push(w);
      unitGroups.set(w.unitId, list);
    });

    expect(unitGroups.size).toBe(20);
    unitGroups.forEach((words, uId) => {
      expect(words.length, `Unit ${uId} must have 10 words`).toBe(10);
    });
  });

  it('every vocab id resolves through the review card lookup with complete fields', () => {
    allVocab.forEach((word) => {
      const card: SM2Card = createInitialCard(word.id, 'vocab');

      // Simulate review page lookup
      const found = allVocab.find((v) => v.id === card.rawId);
      expect(found, `Vocab item with id ${card.rawId} should be found`).toBeDefined();

      const display = {
        promptJp: found?.kana || card.rawId,
        kanjiSub: found?.kanji,
        speakText: found?.kana || card.rawId,
        romaji: found?.romaji || '',
        hindiMeaning: found?.hindiMeaning || '',
        englishMeaning: found?.englishMeaning,
        exampleJp: found?.exampleJp,
        exampleRomaji: found?.exampleRomaji,
        exampleHindi: found?.exampleHindi,
      };

      expect(display.promptJp).toBeTruthy();
      expect(display.speakText).toBe(found?.kana);
      expect(display.romaji).toBeTruthy();
      expect(display.hindiMeaning).toBeTruthy();
      expect(display.englishMeaning).toBeTruthy();
      expect(display.exampleJp).toBeTruthy();
      expect(display.exampleRomaji).toBeTruthy();
      expect(display.exampleHindi).toBeTruthy();
    });
  });

  it('every grammar point has exactly 3 examples, a common mistake, and 3 valid quiz questions', () => {
    expect(allGrammar.length).toBe(25);

    allGrammar.forEach((point, idx) => {
      expect(point.pointNumber).toBe(idx + 1);
      expect(point.titleJp).toBeTruthy();
      expect(point.titleHindi).toBeTruthy();
      expect(point.formula).toBeTruthy();
      expect(point.explanationHindi).toBeTruthy();
      expect(point.hindiComparison).toBeTruthy();

      expect(point.examples.length).toBe(3);
      point.examples.forEach((ex) => {
        expect(ex.jp).toBeTruthy();
        expect(ex.romaji).toBeTruthy();
        expect(ex.hindi).toBeTruthy();
      });

      expect(point.commonMistake).toBeDefined();
      expect(point.commonMistake.mistakeJp).toBeTruthy();
      expect(point.commonMistake.correctionJp).toBeTruthy();
      expect(point.commonMistake.explanationHindi).toBeTruthy();

      expect(point.quiz.length).toBe(3);
      point.quiz.forEach((q) => {
        expect(q.question).toBeTruthy();
        expect(q.options.length).toBe(4);
        expect(new Set(q.options).size).toBe(4);
        expect(q.correctIndex).toBeGreaterThanOrEqual(0);
        expect(q.correctIndex).toBeLessThanOrEqual(3);
        expect(q.explanationHindi).toBeTruthy();
      });
    });
  });
});
