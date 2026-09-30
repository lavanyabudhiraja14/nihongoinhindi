export type CardSource = 'hiragana' | 'katakana' | 'loanword' | 'vocab' | 'kanji';

export interface SM2Card {
  id: string; // composite format: "<source>:<id>", e.g. "hiragana:h-ka"
  source: CardSource;
  rawId: string; // the actual item id, e.g. "h-ka"
  repetitions: number; // consecutive correct reviews
  easeFactor: number; // minimum 1.3, default 2.5
  intervalDays: number; // current interval in days
  dueDate: string; // YYYY-MM-DD (local date)
  lastReviewed?: string; // YYYY-MM-DD
  updatedAt?: string; // ISO 8601 UTC timestamp
}

/**
 * Format a Date object as YYYY-MM-DD using local time (not UTC).
 */
export function formatLocalDate(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse a YYYY-MM-DD string into a local Date object.
 */
export function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

/**
 * Add N days to a base date and return local YYYY-MM-DD string.
 */
export function addDaysToDate(baseDate: Date, days: number): string {
  const target = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate() + days);
  return formatLocalDate(target);
}

/**
 * Create a new initial SM-2 card with composite ID.
 */
export function createInitialCard(
  rawId: string,
  source: CardSource,
  today: Date = new Date()
): SM2Card {
  return {
    id: `${source}:${rawId}`,
    source,
    rawId,
    repetitions: 0,
    easeFactor: 2.5,
    intervalDays: 0,
    dueDate: formatLocalDate(today),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Calculate the next SM-2 schedule for a card given a review quality (0 to 5).
 *
 * Rules:
 * - quality < 3 (Again): repetitions = 0, interval = 1, EF lowered (min 1.3).
 * - quality >= 3 (Pass):
 *    - newRepetitions = card.repetitions + 1
 *    - EF is updated using standard SM-2 formula (min 1.3).
 *    - Hard (3): uses interval * 1.2 (minimum 1 day more than before).
 *    - Good (4): rep 1 -> 1 day, rep 2 -> 6 days, rep > 2 -> round(interval * EF).
 *    - Easy (5): rep 1 -> 1 day, rep 2 -> 6 days, rep > 2 -> round(interval * EF * 1.3).
 */
export function calculateSM2(
  card: SM2Card,
  quality: number,
  today: Date = new Date()
): SM2Card {
  const todayStr = formatLocalDate(today);

  // Calculate new Ease Factor (standard SM-2 formula)
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  const deltaEF = 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);
  const newEaseFactor = Math.max(1.3, Number((card.easeFactor + deltaEF).toFixed(3)));

  if (quality < 3) {
    // Again (failure)
    const intervalDays = 1;
    return {
      ...card,
      repetitions: 0,
      easeFactor: newEaseFactor,
      intervalDays,
      dueDate: addDaysToDate(today, intervalDays),
      lastReviewed: todayStr,
      updatedAt: new Date().toISOString(),
    };
  }

  // Pass (quality 3, 4, or 5)
  const newRepetitions = card.repetitions + 1;
  let nextInterval: number;

  if (quality === 3) {
    // Hard: counts as pass, but interval increases mildly by * 1.2 (at least 1 day more than previous)
    if (newRepetitions === 1) {
      nextInterval = 1;
    } else {
      const scaled = Math.round(card.intervalDays * 1.2);
      nextInterval = Math.max(card.intervalDays + 1, scaled);
    }
  } else if (quality === 5) {
    // Easy: gets standard interval progression with 1.3x easy multiplier for reps > 2
    if (newRepetitions === 1) {
      nextInterval = 1;
    } else if (newRepetitions === 2) {
      nextInterval = 6;
    } else {
      nextInterval = Math.round(card.intervalDays * card.easeFactor * 1.3);
    }
  } else {
    // Good (4): standard SM-2 progression
    if (newRepetitions === 1) {
      nextInterval = 1;
    } else if (newRepetitions === 2) {
      nextInterval = 6;
    } else {
      nextInterval = Math.round(card.intervalDays * card.easeFactor);
    }
  }

  // Ensure whole integer >= 1
  nextInterval = Math.max(1, Math.round(nextInterval));

  return {
    ...card,
    repetitions: newRepetitions,
    easeFactor: newEaseFactor,
    intervalDays: nextInterval,
    dueDate: addDaysToDate(today, nextInterval),
    lastReviewed: todayStr,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Check whether a card is due on or before today.
 */
export function isCardDue(card: SM2Card, todayStr: string = formatLocalDate()): boolean {
  return card.dueDate <= todayStr;
}

/**
 * Filter all cards that are currently due.
 */
export function getDueCards(cards: SM2Card[], todayStr: string = formatLocalDate()): SM2Card[] {
  return cards.filter((c) => isCardDue(c, todayStr));
}
