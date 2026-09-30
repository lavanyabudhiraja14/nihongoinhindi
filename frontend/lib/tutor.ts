import { UserProfile, KanaItem, VocabItem, GrammarPoint } from '@/types';
import hiraganaData from '@/content/hiragana.json';
import katakanaData from '@/content/katakana.json';
import vocabData from '@/content/vocab.json';
import grammarData from '@/content/grammar.json';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface LearnedContext {
  kana: string[];
  vocab: string[];
  grammar: string[];
}

export interface TutorRequestBody {
  message: string;
  history?: ChatMessage[];
  learned?: LearnedContext;
}

export interface TutorResponseBody {
  reply: string;
  status: string;
}

/**
 * Builds compact learned context lists from user's actual learned content.
 * Kana: specific kana characters (e.g. 'あ', 'い')
 * Vocab: kana/kanji + English meaning (e.g. 'おはよう (Good morning (casual))')
 * Grammar: grammar titles (e.g. 'X は Y です - विषय चिह्न')
 */
export function buildLearnedContext(profile: UserProfile): LearnedContext {
  const completedKanaSet = new Set(profile.completedKanaGroups || []);
  const learnedKana: string[] = [];

  for (const item of (hiraganaData as KanaItem[])) {
    if (completedKanaSet.has(item.row) && item.kana) {
      if (!learnedKana.includes(item.kana)) {
        learnedKana.push(item.kana.slice(0, 60));
      }
    }
  }

  for (const item of (katakanaData as KanaItem[])) {
    if (completedKanaSet.has(item.row) && item.kana) {
      if (!learnedKana.includes(item.kana)) {
        learnedKana.push(item.kana.slice(0, 60));
      }
    }
  }

  const completedVocabSet = new Set(profile.completedVocabUnits || []);
  const learnedVocab: string[] = [];

  for (const item of (vocabData as VocabItem[])) {
    if (completedVocabSet.has(item.unitId)) {
      const text = `${item.kana} (${item.englishMeaning})`.trim().slice(0, 60);
      if (text && !learnedVocab.includes(text)) {
        learnedVocab.push(text);
      }
    }
  }

  const completedGrammarSet = new Set(profile.completedGrammarPoints || []);
  const learnedGrammar: string[] = [];

  for (const point of (grammarData as GrammarPoint[])) {
    if (completedGrammarSet.has(point.id)) {
      const text = `${point.titleJp} (${point.titleHindi})`.slice(0, 60);
      if (!learnedGrammar.includes(text)) {
        learnedGrammar.push(text);
      }
    }
  }

  return {
    kana: learnedKana.slice(0, 120),
    vocab: learnedVocab.slice(0, 100),
    grammar: learnedGrammar.slice(0, 20),
  };
}

/**
 * Send a message to the AI Tutor backend endpoint.
 */
export async function sendTutorMessage(
  apiUrl: string = '',
  message: string = '',
  history: ChatMessage[] = [],
  learned: LearnedContext = { kana: [], vocab: [], grammar: [] }
): Promise<string> {
  const trimmed = message.trim();
  if (!trimmed) {
    throw new Error('संदेश खाली नहीं हो सकता।');
  }

  // Keep at most last 6 messages in history
  const recentHistory = history.slice(-6).map((h) => ({
    role: h.role,
    content: h.content.slice(0, 800),
  }));

  const payload: TutorRequestBody = {
    message: trimmed.slice(0, 500),
    history: recentHistory,
    learned,
  };

  const res = await fetch(`${apiUrl}/api/tutor`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    let errorDetail = 'ट्यूटर सेवा से संपर्क करने में समस्या आई। कृपया बाद में प्रयास करें।';
    try {
      const errorJson = await res.json();
      if (errorJson && typeof errorJson.detail === 'string') {
        errorDetail = errorJson.detail;
      }
    } catch {
      // Fallback to default message
    }
    throw new Error(errorDetail);
  }

  const data: TutorResponseBody = await res.json();
  return data.reply;
}
