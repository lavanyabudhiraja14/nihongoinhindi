'use client';

import React, { useState, useEffect, useRef } from 'react';
import { getUserProfile } from '@/lib/storage';
import {
  ChatMessage,
  buildLearnedContext,
  sendTutorMessage,
  LearnedContext,
} from '@/lib/tutor';

interface HealthResponse {
  status: string;
  app: string;
  version: string;
}

const STARTER_PROMPTS = [
  'わたし は がくせい です का क्या अर्थ है?',
  'こんにちは और こんばんは में क्या अंतर है?',
  'जापानी में समय (Time) कैसे बताते हैं?',
];

export default function TutorPage() {
  const [loadingHealth, setLoadingHealth] = useState(false);
  const [healthData, setHealthData] = useState<HealthResponse | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);

  const [chatInput, setChatInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [learnedContext, setLearnedContext] = useState<LearnedContext>({
    kana: [],
    vocab: [],
    grammar: [],
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        'नमस्ते! मैं आपका जापानी भाषा ट्यूटर हूँ। जापानी व्याकरण, उच्चारण या शब्दावली से जुड़ा कोई भी सवाल पूछें!',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const profile = getUserProfile();
    const context = buildLearnedContext(profile);
    setLearnedContext(context);

    if (typeof window !== 'undefined') {
      setIsOnline(navigator.onLine);
      const handleOnline = () => setIsOnline(true);
      const handleOffline = () => setIsOnline(false);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isSending]);

  const testBackendConnection = async () => {
    setLoadingHealth(true);
    setHealthError(null);
    setHealthData(null);
    setLatencyMs(null);

    const startTime = performance.now();

    try {
      const res = await fetch('/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const endTime = performance.now();
      setLatencyMs(Math.round(endTime - startTime));

      if (!res.ok) {
        throw new Error(`HTTP Error: ${res.status} ${res.statusText}`);
      }

      const data = await res.json();
      setHealthData(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setHealthError(err.message);
      } else {
        setHealthError('Unknown network error');
      }
    } finally {
      setLoadingHealth(false);
    }
  };

  const submitQuestion = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isSending) return;

    if (!isOnline) {
      setChatError('📶 आप अभी ऑफ़लाइन हैं। AI ट्यूटर से बात करने के लिए इंटरनेट कनेक्शन आवश्यक है।');
      return;
    }

    setChatError(null);
    const newHistory: ChatMessage[] = [
      ...chatMessages,
      { role: 'user', content: trimmed },
    ];
    setChatMessages(newHistory);
    setChatInput('');
    setIsSending(true);

    try {
      const reply = await sendTutorMessage(
        '',
        trimmed,
        chatMessages,
        learnedContext
      );

      setChatMessages((prev) => [
        ...prev,
        { role: 'assistant', content: reply },
      ]);
    } catch (err: unknown) {
      if (!navigator.onLine) {
        setChatError('📶 आप अभी ऑफ़लाइन हैं। कृपया इंटरनेट कनेक्शन जांचें।');
      } else if (err instanceof Error) {
        setChatError(err.message);
      } else {
        setChatError('ट्यूटर सेवा से संपर्क करने में समस्या आई। कृपया बाद में प्रयास करें।');
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    submitQuestion(chatInput);
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-10">
      {/* Header */}
      <header className="pb-2 border-b border-[#E8E8EC]">
        <span className="glass-pill-red font-hindi">
          व्यक्तिगत सहायता
        </span>
        <h1 className="text-[28px] font-semibold text-[#0D1B4B] font-hindi leading-tight mt-2">
          जापानी AI ट्यूटर
        </h1>
        <p className="text-[13px] text-[#5B6070] mt-0.5">
          AI Sensei: Grammar & Vocabulary Assistant (Hindi Explanations)
        </p>
      </header>

      {/* Offline Notice Banner */}
      {!isOnline && (
        <div className="p-4 glass-saffron rounded-[12px] text-[13px] text-[#B45309] flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#FF9933]/20 flex items-center justify-center font-bold text-base text-[#B45309]">
            !
          </div>
          <div>
            <div className="font-bold font-hindi">आप अभी ऑफ़लाइन हैं</div>
            <div className="text-[12px] text-[#B45309]/90 font-hindi mt-0.5">
              AI ट्यूटर से बात करने के लिए इंटरनेट कनेक्शन आवश्यक है। अन्य पाठ्य सामग्री ऑफ़लाइन उपलब्ध है।
            </div>
          </div>
        </div>
      )}

      {/* Starter Prompts */}
      <div className="space-y-2">
        <span className="text-[12px] font-semibold text-[#5B6070] uppercase tracking-wider font-hindi block">
          सुझाए गए प्रश्न:
        </span>
        <div className="flex flex-wrap gap-2">
          {STARTER_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => submitQuestion(prompt)}
              disabled={isSending}
              className="text-[13px] bg-white hover:bg-[#F4F4F6] text-[#0D1B4B] px-3.5 py-1.5 rounded-[8px] border border-[#E8E8EC] text-left transition disabled:opacity-50 cursor-pointer shadow-xs font-hindi"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="bg-white rounded-[12px] border border-[#E8E8EC] shadow-xs p-5 flex flex-col h-[440px]">
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {chatMessages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[85%] rounded-[12px] p-3.5 text-[14px] leading-relaxed whitespace-pre-wrap font-hindi ${
                  msg.role === 'user'
                    ? 'bg-[#BC2025] text-white font-medium rounded-br-none'
                    : 'glass-navy text-[#0D1B4B] rounded-bl-none'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {isSending && (
            <div className="flex justify-start">
              <div className="glass-navy text-[#0D1B4B] rounded-[12px] rounded-bl-none p-3.5 text-[13px] flex items-center gap-2 font-hindi">
                <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-[#0D1B4B] border-t-transparent rounded-full" />
                <span>उत्तर तैयार हो रहा है...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Error Notice */}
        {chatError && (
          <div className="mb-2 p-3 glass-red rounded-[8px] text-[13px] text-[#BC2025] flex items-center justify-between font-hindi">
            <span>{chatError}</span>
            <button
              type="button"
              onClick={() => setChatError(null)}
              className="text-[#BC2025] hover:text-[#8B1519] font-bold ml-2 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Chat Input Box */}
        <form
          onSubmit={handleSendMessage}
          className="mt-3 pt-3 border-t border-[#E8E8EC] space-y-2"
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="जापानी या हिंदी में सवाल लिखें..."
              maxLength={500}
              disabled={isSending}
              className="flex-1 px-3.5 py-2.5 text-[14px] bg-[#F4F4F6] border border-[#E8E8EC] rounded-[8px] focus:outline-none focus:border-[#0D1B4B] focus:bg-white transition disabled:opacity-50 font-hindi"
            />
            <button
              type="submit"
              disabled={isSending || !chatInput.trim()}
              className="px-5 py-2.5 bg-[#BC2025] hover:bg-[#8B1519] active:bg-[#6B0F13] disabled:opacity-50 text-white rounded-[8px] text-[13px] font-semibold transition cursor-pointer font-hindi"
            >
              भेजें (Send)
            </button>
          </div>

          <div className="flex justify-between items-center text-[11px] text-[#5B6070] px-1 font-hindi">
            <span>AI सुझाव दे सकता है, मुख्य नियमों की पुष्टि करें।</span>
            <span className="font-mono">{chatInput.length} / 500</span>
          </div>
        </form>
      </div>

      {/* Backend Connection Test Card */}
      <div className="bg-white rounded-[12px] p-5 border border-[#E8E8EC] shadow-xs space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-[15px] font-semibold text-[#0D1B4B] font-hindi leading-tight">
              बैकएंड कनेक्शन स्थिति
            </h3>
            <span className="text-[11px] text-[#5B6070]">Backend Health Check</span>
          </div>
          <span className="text-[11px] font-mono text-[#5B6070] bg-[#F4F4F6] px-2.5 py-1 rounded-[6px] border border-[#E8E8EC]">
            /health
          </span>
        </div>

        <button
          type="button"
          onClick={testBackendConnection}
          disabled={loadingHealth}
          className="w-full py-2.5 px-4 bg-[#0D1B4B] hover:bg-[#081232] text-white rounded-[8px] text-[13px] font-semibold flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50 font-hindi"
        >
          {loadingHealth ? (
            <>
              <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />
              <span>जाँच हो रही है...</span>
            </>
          ) : (
            <span>GET /health को कॉल करें</span>
          )}
        </button>

        {/* Live Status Display */}
        {healthData && (
          <div className="p-3.5 glass-green rounded-[12px] text-[13px] space-y-1.5">
            <div className="flex items-center justify-between font-bold text-[#138808]">
              <span className="flex items-center gap-2 font-hindi">
                <span className="w-2 h-2 rounded-full bg-[#138808] animate-pulse" />
                कनेक्टेड (Status 200 OK)
              </span>
              <span className="text-[12px] text-[#138808] font-mono">
                {latencyMs}ms
              </span>
            </div>
            <pre className="text-[11px] font-mono text-[#0D1B4B] bg-white/80 p-2.5 rounded-[8px] mt-1 overflow-x-auto border border-[#138808]/20">
              {JSON.stringify(healthData, null, 2)}
            </pre>
          </div>
        )}

        {healthError && (
          <div className="p-3.5 glass-red rounded-[12px] text-[13px] space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-[#BC2025] font-hindi">
              <span className="w-2 h-2 rounded-full bg-[#BC2025]" />
              कनेक्शन विफल (Connection Failed)
            </div>
            <p className="text-[12px] text-[#BC2025] font-mono">{healthError}</p>
            <p className="text-[11px] text-[#5B6070] mt-1 font-hindi">
              कृपया सुनिश्चित करें कि बैकएंड सर्वर सक्रिय और कनेक्टेड है।
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
