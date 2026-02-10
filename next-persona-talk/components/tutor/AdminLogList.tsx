"use client";

import { useState } from "react";
import type { LearningLog } from "@/lib/supabase/actions";

const EVALUATION_COLORS: Record<string, string> = {
  A: "bg-green-100 text-green-700 border-green-200",
  B: "bg-blue-100 text-blue-700 border-blue-200",
  C: "bg-yellow-100 text-yellow-700 border-yellow-200",
  D: "bg-red-100 text-red-700 border-red-200",
};

const EVALUATION_LABELS: Record<string, string> = {
  A: "深い理解",
  B: "基本理解",
  C: "部分的理解",
  D: "要復習",
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminLogList({ logs }: { logs: LearningLog[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-3">
      <p className="mb-2 text-sm text-gray-500">
        全 {logs.length} 件の学習記録
      </p>

      {logs.map((log) => (
        <div
          key={log.id}
          className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
        >
          {/* Card Header */}
          <button
            onClick={() =>
              setExpandedId(expandedId === log.id ? null : log.id)
            }
            className="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-gray-50"
          >
            {/* Evaluation Badge */}
            <div
              className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border text-lg font-bold ${EVALUATION_COLORS[log.evaluation] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}
            >
              {log.evaluation}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-800">
                  {log.subject}
                </span>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${EVALUATION_COLORS[log.evaluation] ?? "bg-gray-100 text-gray-600 border-gray-200"}`}
                >
                  {EVALUATION_LABELS[log.evaluation] ?? log.evaluation}
                </span>
              </div>
              <p className="mt-0.5 text-xs text-gray-500">{log.topic}</p>
            </div>

            {/* Date */}
            <div className="text-right">
              <p className="text-xs text-gray-400">
                {formatDate(log.created_at)}
              </p>
              <p className="mt-1 text-[10px] text-gray-300">
                {expandedId === log.id ? "▲ 閉じる" : "▼ 会話を見る"}
              </p>
            </div>
          </button>

          {/* Expandable Conversation */}
          {expandedId === log.id && log.full_conversation && (
            <div className="border-t border-gray-100 bg-gray-50 px-5 py-4">
              <p className="mb-3 text-xs font-semibold text-gray-500">
                会話履歴
              </p>
              <div className="flex max-h-80 flex-col gap-2 overflow-y-auto">
                {(
                  log.full_conversation as { role: string; content: string }[]
                ).map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-xl px-3 py-2 text-xs leading-relaxed ${
                        msg.role === "user"
                          ? "bg-[#8CE655] text-gray-900"
                          : "bg-white text-gray-700 shadow-sm"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
