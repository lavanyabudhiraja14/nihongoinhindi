import { describe, it, expect } from 'vitest';
import {
  createInitialCard,
  calculateSM2,
  formatLocalDate,
  addDaysToDate,
  isCardDue,
  getDueCards,
  SM2Card,
} from '../lib/sm2';

describe('SM-2 Spaced Repetition Logic', () => {
  const baseDate = new Date(2026, 8, 28); // 2026-09-28

  it('creates an initial card with default values and composite ID', () => {
    const card = createInitialCard('h-ka', 'hiragana', baseDate);
    expect(card.id).toBe('hiragana:h-ka');
    expect(card.source).toBe('hiragana');
    expect(card.rawId).toBe('h-ka');
    expect(card.repetitions).toBe(0);
    expect(card.easeFactor).toBe(2.5);
    expect(card.intervalDays).toBe(0);
    expect(card.dueDate).toBe('2026-09-28');
  });

  it('first review with Good (quality 4) sets repetition=1 and interval=1', () => {
    const card = createInitialCard('h-ka', 'hiragana', baseDate);
    const updated = calculateSM2(card, 4, baseDate);

    expect(updated.repetitions).toBe(1);
    expect(updated.intervalDays).toBe(1);
    expect(updated.dueDate).toBe('2026-09-29');
    expect(updated.easeFactor).toBe(2.5);
    expect(updated.lastReviewed).toBe('2026-09-28');
  });

  it('second review with Good (quality 4) sets repetition=2 and interval=6', () => {
    const card: SM2Card = {
      id: 'hiragana:h-ka',
      source: 'hiragana',
      rawId: 'h-ka',
      repetitions: 1,
      easeFactor: 2.5,
      intervalDays: 1,
      dueDate: '2026-09-29',
    };
    const updated = calculateSM2(card, 4, new Date(2026, 8, 29));

    expect(updated.repetitions).toBe(2);
    expect(updated.intervalDays).toBe(6);
    expect(updated.dueDate).toBe('2026-10-05');
  });

  it('third review with Good (quality 4) grows interval by interval * EF', () => {
    const card: SM2Card = {
      id: 'hiragana:h-ka',
      source: 'hiragana',
      rawId: 'h-ka',
      repetitions: 2,
      easeFactor: 2.5,
      intervalDays: 6,
      dueDate: '2026-10-05',
    };
    const updated = calculateSM2(card, 4, new Date(2026, 9, 5));

    expect(updated.repetitions).toBe(3);
    // 6 * 2.5 = 15
    expect(updated.intervalDays).toBe(15);
    expect(updated.dueDate).toBe('2026-10-20');
  });

  it('Again (quality 0) resets repetitions to 0 and interval to 1 day', () => {
    const matureCard: SM2Card = {
      id: 'hiragana:h-ka',
      source: 'hiragana',
      rawId: 'h-ka',
      repetitions: 5,
      easeFactor: 2.6,
      intervalDays: 45,
      dueDate: '2026-09-28',
    };

    const updated = calculateSM2(matureCard, 0, baseDate);

    expect(updated.repetitions).toBe(0);
    expect(updated.intervalDays).toBe(1);
    expect(updated.dueDate).toBe('2026-09-29');
    expect(updated.easeFactor).toBeLessThan(2.6);
  });

  it('ease factor never drops below minimum 1.3 under consecutive failures', () => {
    let card = createInitialCard('h-ka', 'hiragana', baseDate);
    // Fail 10 times consecutively
    for (let i = 0; i < 10; i++) {
      card = calculateSM2(card, 0, baseDate);
    }

    expect(card.easeFactor).toBe(1.3);
    expect(card.repetitions).toBe(0);
    expect(card.intervalDays).toBe(1);
  });

  it('Hard (quality 3) counts as pass, lowers EF, and increments interval with 1.2 multiplier (min 1 day more)', () => {
    const card: SM2Card = {
      id: 'hiragana:h-ka',
      source: 'hiragana',
      rawId: 'h-ka',
      repetitions: 2,
      easeFactor: 2.5,
      intervalDays: 6,
      dueDate: '2026-09-28',
    };

    const updated = calculateSM2(card, 3, baseDate);

    expect(updated.repetitions).toBe(3);
    // Math.max(6 + 1, round(6 * 1.2)) = Math.max(7, 7) = 7
    expect(updated.intervalDays).toBe(7);
    expect(updated.easeFactor).toBeLessThan(2.5);
    expect(updated.easeFactor).toBeGreaterThanOrEqual(1.3);
  });

  it('Easy (quality 5) applies standard SM-2 plus extra 1.3 bonus multiplier and increases EF', () => {
    const card: SM2Card = {
      id: 'hiragana:h-ka',
      source: 'hiragana',
      rawId: 'h-ka',
      repetitions: 2,
      easeFactor: 2.5,
      intervalDays: 6,
      dueDate: '2026-09-28',
    };

    const updated = calculateSM2(card, 5, baseDate);

    expect(updated.repetitions).toBe(3);
    // 6 * 2.5 * 1.3 = 19.5 -> 20
    expect(updated.intervalDays).toBe(20);
    expect(updated.easeFactor).toBeGreaterThan(2.5);
  });

  it('accurately identifies due cards by local date', () => {
    const today = '2026-09-28';
    const cardDuePast: SM2Card = { ...createInitialCard('c1', 'vocab'), dueDate: '2026-09-27' };
    const cardDueToday: SM2Card = { ...createInitialCard('c2', 'vocab'), dueDate: '2026-09-28' };
    const cardDueFuture: SM2Card = { ...createInitialCard('c3', 'vocab'), dueDate: '2026-09-29' };

    expect(isCardDue(cardDuePast, today)).toBe(true);
    expect(isCardDue(cardDueToday, today)).toBe(true);
    expect(isCardDue(cardDueFuture, today)).toBe(false);

    const dueCards = getDueCards([cardDuePast, cardDueToday, cardDueFuture], today);
    expect(dueCards.length).toBe(2);
    expect(dueCards.map((c) => c.id)).toEqual(['vocab:c1', 'vocab:c2']);
  });
});
