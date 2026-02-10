"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import type { Gem } from "@/lib/gems/types";

interface Message {
  role: "user" | "assistant";
  content: string;
}

// TTS
function speak(text: string, onEnd?: () => void) {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "ja-JP";
  u.rate = 1.0;
  u.pitch = 1.0;
  const voices = window.speechSynthesis.getVoices();
  const ja = voices.find((v) => v.lang.startsWith("ja"));
  if (ja) u.voice = ja;
  if (onEnd) u.onend = onEnd;
  window.speechSynthesis.speak(u);
}

function stopSpeaking() {
  if (typeof window !== "undefined" && window.speechSynthesis)
    window.speechSynthesis.cancel();
}

export default function GemChat({ gem }: { gem: Gem }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () =>
        window.speechSynthesis.getVoices();
    }
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const i = setInterval(() => {
      if (typeof window !== "undefined" && window.speechSynthesis)
        setIsSpeaking(window.speechSynthesis.speaking);
    }, 200);
    return () => clearInterval(i);
  }, []);

  const sendMessage = useCallback(async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    setError(null);

    const userMsg: Message = { role: "user", content: trimmed };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/gems/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history: messages,
          systemInstruction: gem.systemInstruction,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "エラーが発生しました");

      const assistantMsg: Message = { role: "assistant", content: data.reply };
      setMessages([...updated, assistantMsg]);

      if (ttsEnabled) {
        setIsSpeaking(true);
        speak(data.reply, () => setIsSpeaking(false));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "エラーが発生しました");
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  }, [input, isLoading, messages, ttsEnabled, gem.systemInstruction]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 px-4 py-3 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/gems"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm transition hover:bg-slate-200"
              title="Gem一覧に戻る"
            >
              ←
            </Link>
            <span className="text-2xl">{gem.icon}</span>
            <div>
              <h1 className="text-base font-bold text-slate-800">{gem.name}</h1>
              <p className="text-xs text-slate-400">{gem.description}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setTtsEnabled(!ttsEnabled);
                if (ttsEnabled) stopSpeaking();
              }}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                ttsEnabled
                  ? "bg-indigo-100 text-indigo-700"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              {ttsEnabled ? "🔊 ON" : "🔇 OFF"}
            </button>
            {isSpeaking && (
              <button
                onClick={() => {
                  stopSpeaking();
                  setIsSpeaking(false);
                }}
                className="flex items-center gap-1 rounded-full bg-red-100 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-200"
              >
                <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-red-500" />
                停止
              </button>
            )}
            <Link
              href="/"
              className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-200"
            >
              🏠
            </Link>
          </div>
        </div>
      </header>

      {/* Chat */}
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-3 overflow-y-auto px-4 py-6">
        {messages.length === 0 && (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
            <span className="text-5xl">{gem.icon}</span>
            <h2 className="text-xl font-bold text-slate-600">{gem.name}</h2>
            <p className="max-w-sm text-sm text-slate-400">
              {gem.description}
              <br />
              何でも聞いてみてください！
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="mr-2 mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-lg">
                {gem.icon}
              </div>
            )}
            <div
              className={`relative max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
                msg.role === "user"
                  ? "rounded-br-md bg-indigo-500 text-white"
                  : "rounded-bl-md bg-white text-slate-800"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="mr-2 mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-lg">
              {gem.icon}
            </div>
            <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-white px-4 py-3 shadow-sm">
              <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-indigo-300 [animation-delay:0ms]" />
              <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-indigo-300 [animation-delay:150ms]" />
              <span className="inline-block h-2 w-2 animate-bounce rounded-full bg-indigo-300 [animation-delay:300ms]" />
            </div>
          </div>
        )}

        {error && (
          <div className="mx-auto max-w-md rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-600">
            {error}
          </div>
        )}
        <div ref={endRef} />
      </main>

      {/* Input */}
      <footer className="sticky bottom-0 border-t border-slate-200 bg-white/80 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center gap-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="メッセージを入力..."
            disabled={isLoading}
            className="flex-1 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-indigo-500 text-white shadow-sm transition hover:bg-indigo-600 active:scale-95 disabled:opacity-40"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
            </svg>
          </button>
        </div>
      </footer>
    </div>
  );
}
