import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildLearnedContext, sendTutorMessage } from '@/lib/tutor';
import { UserProfile } from '@/types';
import { DEFAULT_USER_PROFILE } from '@/lib/storage';

describe('Tutor Context Builder (buildLearnedContext)', () => {
  it('returns empty lists for blank user profile', () => {
    const profile: UserProfile = { ...DEFAULT_USER_PROFILE };
    const context = buildLearnedContext(profile);

    expect(context.kana).toEqual([]);
    expect(context.vocab).toEqual([]);
    expect(context.grammar).toEqual([]);
  });

  it('builds kana list from real kana content when rows are completed', () => {
    const profile: UserProfile = {
      ...DEFAULT_USER_PROFILE,
      completedKanaGroups: ['a-row'],
    };
    const context = buildLearnedContext(profile);

    // Should contain real kana characters (e.g. あ, い, う, え, お)
    expect(context.kana.length).toBeGreaterThan(0);
    expect(context.kana).toContain('あ');
    expect(context.kana).toContain('い');
  });

  it('builds vocab list formatted as kana (englishMeaning) from real content', () => {
    const profile: UserProfile = {
      ...DEFAULT_USER_PROFILE,
      completedVocabUnits: ['unit-v1'],
    };
    const context = buildLearnedContext(profile);

    expect(context.vocab.length).toBeGreaterThan(0);
    // e.g. "おはよう (Good morning (casual))" or "こんにちは (Hello / Good afternoon)"
    const hasGreeting = context.vocab.some(
      (v) => v.includes('おはよう') || v.includes('こんにちは')
    );
    expect(hasGreeting).toBe(true);
  });

  it('builds grammar list from real grammar titles', () => {
    const profile: UserProfile = {
      ...DEFAULT_USER_PROFILE,
      completedGrammarPoints: ['grammar-1-wa-desu'],
    };
    const context = buildLearnedContext(profile);

    expect(context.grammar.length).toBe(1);
    expect(context.grammar[0]).toContain('X は Y です');
  });
});

describe('Tutor API Client (sendTutorMessage)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('rejects empty or whitespace-only messages', async () => {
    await expect(
      sendTutorMessage('http://localhost:8000', '   ', [], { kana: [], vocab: [], grammar: [] })
    ).rejects.toThrow('संदेश खाली नहीं हो सकता।');
  });

  it('sends correct payload and returns assistant reply', async () => {
    const mockReply = 'नमस्ते! यह एक परीक्षण उत्तर है।';
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ reply: mockReply, status: 'ok' }),
    } as Response);

    const reply = await sendTutorMessage(
      'http://localhost:8000',
      'Konnichiwa',
      [{ role: 'user', content: 'Hi' }],
      { kana: ['あ'], vocab: ['おはよう (Good morning)'], grammar: ['X は Y です'] }
    );

    expect(reply).toBe(mockReply);
    expect(global.fetch).toHaveBeenCalledTimes(1);

    const callArgs = (global.fetch as any).mock.calls[0];
    expect(callArgs[0]).toBe('http://localhost:8000/api/tutor');
    const sentBody = JSON.parse(callArgs[1].body);
    expect(sentBody.message).toBe('Konnichiwa');
    expect(sentBody.history).toHaveLength(1);
    expect(sentBody.learned.kana).toEqual(['あ']);
  });

  it('handles server error response gracefully', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ detail: 'आज की दैनिक सीमा पूरी हो गई है।' }),
    } as Response);

    await expect(
      sendTutorMessage('http://localhost:8000', 'Test', [], { kana: [], vocab: [], grammar: [] })
    ).rejects.toThrow('आज की दैनिक सीमा पूरी हो गई है।');
  });
});
