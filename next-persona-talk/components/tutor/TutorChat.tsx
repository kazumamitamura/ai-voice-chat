"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { saveLearningLog } from "@/lib/supabase/actions";

// ========== Types ==========
interface Message {
  role: "user" | "assistant";
  content: string;
}

// ========== SAVE_DATA parser ==========
const SAVE_DATA_REGEX = /\[SAVE_DATA:\s*(\{[\s\S]*?\})\s*\]/;

function extractSaveData(text: string) {
  const match = text.match(SAVE_DATA_REGEX);
  if (!match) return { cleanText: text, saveData: null };

  try {
    const saveData = JSON.parse(match[1]) as {
      subject: string;
      topic: string;
      evaluation: string;
      summary: string;
    };
    const cleanText = text.replace(SAVE_DATA_REGEX, "").trim();
    return { cleanText, saveData };
  } catch {
    return { cleanText: text, saveData: null };
  }
}

// ========== TTS ==========
function speak(text: string, onEnd?: () => void) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ja-JP";
  utterance.rate = 1.0;
  utterance.pitch = 1.0;

  const voices = window.speechSynthesis.getVoices();
  const jaVoice = voices.find((v) => v.lang.startsWith("ja"));
  if (jaVoice) utterance.voice = jaVoice;

  if (onEnd) utterance.onend = onEnd;
  window.speechSynthesis.speak(utterance);
}

function stopSpeaking() {
  if (typeof window !== "undefined" && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}

// ========== Component ==========
export default function TutorChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 音声リスト読み込み
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  // 自動スクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 音声状態の監視
  useEffect(() => {
    const interval = setInterval(() => {
      if (typeof window !== "undefined" && window.speechSynthesis) {
        setIsSpeaking(window.speechSynthesis.speaking);
      }
    }, 200);
    return () => clearInterval(interval);
  }, []);

  // 初回挨拶を自動送信
  useEffect(() => {
    if (initialized) return;
    setInitialized(true);

    const greeting: Message = {
      role: "assistant",
      content: "こんにちは！今日は何の勉強をする？",
    };
    setMessages([greeting]);

    // 初回挨拶を音声で読み上げ
    setTimeout(() => {
      if (ttsEnabled) {
        setIsSpeaking(true);
        speak(greeting.content, () => setIsSpeaking(false));
      }
    }, 500);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // saveNotice を3秒後に消す
  useEffect(() => {
    if (!saveNotice) return;
    const timer = setTimeout(() => setSaveNotice(null), 4000);
    return () => clearTimeout(timer);
  }, [saveNotice]);

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    setError(null);
    const userMessage: Message = { role: "user", content: trimmed };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/tutor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history: messages,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "エラーが発生しました");

      // SAVE_DATA タグを検知・除去
      const { cleanText, saveData } = extractSaveData(data.reply);

      const assistantMessage: Message = {
        role: "assistant",
        content: cleanText,
      };
      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);

      // Supabase に保存
      if (saveData) {
        const result = await saveLearningLog(saveData, finalMessages);
        if (result.error) {
          setSaveNotice(`⚠️ 保存失敗: ${result.error}`);
        } else {
          setSaveNotice(
            `✅ 学習記録を保存しました（${saveData.subject} / 評価: ${saveData.evaluation}）`
          );
        }
      }

      // TTS
      if (ttsEnabled) {
        setIsSpeaking(true);
        speak(cleanText, () => setIsSpeaking(false));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }, [input, isLoading, messages, ttsEnabled]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-1 flex-col bg-[#7494C0]">
      {/* ===== TTS Floating Controls ===== */}
      <div className="flex items-center justify-center gap-2 bg-[#6B8BB2]/80 px-4 py-2 backdrop-blur-sm">
        <button
          onClick={() => {
            setTtsEnabled(!ttsEnabled);
            if (ttsEnabled) stopSpeaking();
          }}
          className={`flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
            ttsEnabled
              ? "bg-white/25 text-white"
              : "bg-white/10 text-white/50"
          }`}
        >
          {ttsEnabled ? "🔊 音声ON" : "🔇 音声OFF"}
        </button>
        {isSpeaking && (
          <button
            onClick={() => {
              stopSpeaking();
              setIsSpeaking(false);
            }}
            className="flex items-center gap-1 rounded-full bg-red-500/80 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-600"
          >
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-white" />
            停止
          </button>
        )}
      </div>

      {/* ===== Save Notice ===== */}
      {saveNotice && (
        <div
          className={`mx-4 mt-2 rounded-lg px-4 py-2 text-center text-sm font-medium shadow ${
            saveNotice.startsWith("✅")
              ? "border border-green-200 bg-green-50 text-green-700"
              : "border border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {saveNotice}
        </div>
      )}

      {/* ===== Chat Area ===== */}
      <main className="flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto flex max-w-2xl flex-col gap-3">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {/* AI Avatar */}
              {msg.role === "assistant" && (
                <div className="mr-2 mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white text-lg shadow">
                  🎓
                </div>
              )}

              {/* Bubble */}
              <div
                className={`relative max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow ${
                  msg.role === "user"
                    ? "rounded-br-md bg-[#8CE655] text-gray-900"
                    : "rounded-bl-md bg-white text-gray-800"
                }`}
              >
                {/* LINE風の三角 */}
                {msg.role === "assistant" && (
                  <div className="absolute -left-1.5 top-3 h-3 w-3 rotate-45 bg-white" />
                )}
                {msg.role === "user" && (
                  <div className="absolute -right-1.5 top-3 h-3 w-3 rotate-45 bg-[#8CE655]" />
                )}
                <span className="relative z-10">{msg.content}</span>
              </div>

              {/* User Avatar */}
              {msg.role === "user" && (
                <div className="ml-2 mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white text-lg shadow">
                  👤
                </div>
              )}
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="mr-2 mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-white text-lg shadow">
                🎓
              </div>
              <div className="relative flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-white px-4 py-3 shadow">
                <div className="absolute -left-1.5 top-3 h-3 w-3 rotate-45 bg-white" />
                <span className="relative z-10 flex gap-1">
                  <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:0ms]" />
                  <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:150ms]" />
                  <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:300ms]" />
                </span>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mx-auto max-w-md rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-600">
              ⚠️ {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* ===== Input Area ===== */}
      <footer className="border-t border-[#5B7BA3] bg-[#EEE9E4] px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="メッセージを入力..."
            disabled={isLoading}
            className="flex-1 rounded-full border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 outline-none transition focus:border-[#6B8BB2] focus:ring-2 focus:ring-[#6B8BB2]/30 disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#6B8BB2] text-white shadow transition hover:bg-[#5B7BA3] active:scale-95 disabled:opacity-40"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-5 w-5"
            >
              <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
            </svg>
          </button>
        </div>
      </footer>
    </div>
  );
}
