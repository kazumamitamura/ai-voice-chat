"use client";

import { useState, useRef, useEffect, useCallback } from "react";

// ---------- Types ----------
interface Message {
  role: "user" | "assistant";
  content: string;
}

// ---------- TTS ----------
function speak(text: string, onEnd?: () => void) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;

  // 読み上げ中なら一旦キャンセル
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ja-JP";
  utterance.rate = 1.2;
  utterance.pitch = 1.0;

  // 日本語ボイスを優先的に選択
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

// ---------- Component ----------
export default function PersonaChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // 音声リスト読み込み（初回）
  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => {
        window.speechSynthesis.getVoices();
      };
    }
  }, []);

  // メッセージ末尾に自動スクロール
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
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history: messages, // 既存の履歴を送信
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "エラーが発生しました");
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: data.reply,
      };
      setMessages([...updatedMessages, assistantMessage]);

      // AIの回答を自動で読み上げ
      setIsSpeaking(true);
      speak(data.reply, () => setIsSpeaking(false));
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }, [input, isLoading, messages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleStopSpeaking = () => {
    stopSpeaking();
    setIsSpeaking(false);
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-orange-50 to-orange-100">
      {/* ===== Header ===== */}
      <header className="sticky top-0 z-10 border-b-4 border-orange-500 bg-gradient-to-r from-orange-500 to-red-500 px-4 py-4 shadow-lg">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl" role="img" aria-label="fire">
              🔥
            </span>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-white">
                熱血パーソナトーク
              </h1>
              <p className="text-xs font-medium text-orange-100">
                松岡修造モード — 全力で応援するぞ！
              </p>
            </div>
          </div>
          {isSpeaking && (
            <button
              onClick={handleStopSpeaking}
              className="flex items-center gap-1.5 rounded-full bg-white/20 px-4 py-2 text-sm font-bold text-white backdrop-blur transition hover:bg-white/30 active:scale-95"
            >
              <span className="inline-block h-3 w-3 animate-pulse rounded-full bg-white" />
              音声停止
            </button>
          )}
        </div>
      </header>

      {/* ===== Chat Area ===== */}
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-4 overflow-y-auto px-4 py-6">
        {messages.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <span className="text-6xl">💪</span>
            <h2 className="text-2xl font-extrabold text-orange-600">
              さあ、話しかけてくれ！
            </h2>
            <p className="max-w-sm text-sm text-orange-400">
              何でも相談してくれ！全力で応援するぞ！
              <br />
              悩みも目標も、熱い言葉で答えるからな！
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="mr-2 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-red-500 text-lg shadow">
                🔥
              </div>
            )}
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow ${
                msg.role === "user"
                  ? "rounded-br-md bg-orange-500 text-white"
                  : "rounded-bl-md border border-orange-200 bg-white text-gray-800"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="mr-2 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-400 to-red-500 text-lg shadow">
              🔥
            </div>
            <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-orange-200 bg-white px-4 py-3 shadow">
              <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-orange-400 [animation-delay:0ms]" />
              <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-orange-400 [animation-delay:150ms]" />
              <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-orange-400 [animation-delay:300ms]" />
            </div>
          </div>
        )}

        {error && (
          <div className="mx-auto max-w-md rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-600">
            <p>⚠️ {error}</p>
            <button
              onClick={() => {
                setError(null);
                // 最後のユーザーメッセージを再送信
                const lastUserMsg = [...messages]
                  .reverse()
                  .find((m) => m.role === "user");
                if (lastUserMsg) {
                  setInput(lastUserMsg.content);
                  setMessages(messages.slice(0, -1));
                }
              }}
              className="mt-2 inline-block rounded-full bg-red-500 px-4 py-1.5 text-xs font-bold text-white transition hover:bg-red-600 active:scale-95"
            >
              再試行する
            </button>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* ===== Input Area ===== */}
      <footer className="sticky bottom-0 border-t-2 border-orange-200 bg-white/80 px-4 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center gap-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="なんでも話しかけてくれ！"
            disabled={isLoading}
            className="flex-1 rounded-full border-2 border-orange-300 bg-orange-50 px-5 py-3 text-sm text-gray-800 placeholder-orange-300 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-200 disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg transition hover:from-orange-600 hover:to-red-600 active:scale-95 disabled:opacity-40 disabled:hover:from-orange-500 disabled:hover:to-red-500"
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
          {isSpeaking && (
            <button
              onClick={handleStopSpeaking}
              className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-2 border-orange-300 bg-white text-orange-500 shadow transition hover:bg-orange-50 active:scale-95"
              title="音声を停止"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="h-5 w-5"
              >
                <path
                  fillRule="evenodd"
                  d="M4.5 7.5a3 3 0 0 1 3-3h9a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3v-9Z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
