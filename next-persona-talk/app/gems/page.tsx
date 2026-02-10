"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { Gem } from "@/lib/gems/types";
import { ICON_OPTIONS, GEM_TEMPLATES } from "@/lib/gems/types";
import { getGems, saveGem, deleteGem } from "@/lib/gems/storage";

export default function GemsPage() {
  const [gems, setGems] = useState<Gem[]>([]);
  const [showEditor, setShowEditor] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  // Editor state
  const [name, setName] = useState("");
  const [icon, setIcon] = useState("🤖");
  const [description, setDescription] = useState("");
  const [systemInstruction, setSystemInstruction] = useState("");

  useEffect(() => {
    setGems(getGems());
  }, []);

  const handleCreate = () => {
    if (!name.trim() || !systemInstruction.trim()) return;
    saveGem({
      name: name.trim(),
      icon,
      description: description.trim(),
      systemInstruction: systemInstruction.trim(),
    });
    setGems(getGems());
    resetEditor();
  };

  const handleDelete = (id: string) => {
    if (!confirm("この Gem を削除しますか？")) return;
    deleteGem(id);
    setGems(getGems());
  };

  const handleUseTemplate = (template: (typeof GEM_TEMPLATES)[number]) => {
    setName(template.name);
    setIcon(template.icon);
    setDescription(template.description);
    setSystemInstruction(template.systemInstruction);
    setShowTemplates(false);
    setShowEditor(true);
  };

  const resetEditor = () => {
    setName("");
    setIcon("🤖");
    setDescription("");
    setSystemInstruction("");
    setShowEditor(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 px-4 py-4 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm transition hover:bg-slate-200"
            >
              🏠
            </Link>
            <div>
              <h1 className="text-lg font-bold text-slate-800">
                💎 My Gems
              </h1>
              <p className="text-xs text-slate-400">
                カスタム AI ペルソナを作成・管理
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              resetEditor();
              setShowEditor(!showEditor);
            }}
            className="rounded-lg bg-indigo-500 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-600 active:scale-95"
          >
            + 新規作成
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        {/* Editor */}
        {showEditor && (
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-800">
                新しい Gem を作成
              </h2>
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className="rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-100"
              >
                📋 テンプレートから作る
              </button>
            </div>

            {/* Templates */}
            {showTemplates && (
              <div className="mb-4 flex flex-col gap-2 rounded-xl border border-amber-100 bg-amber-50/50 p-3">
                {GEM_TEMPLATES.map((t, i) => (
                  <button
                    key={i}
                    onClick={() => handleUseTemplate(t)}
                    className="flex items-center gap-3 rounded-lg bg-white p-3 text-left shadow-sm transition hover:shadow-md"
                  >
                    <span className="text-2xl">{t.icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-slate-700">
                        {t.name}
                      </p>
                      <p className="text-xs text-slate-400">{t.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <div className="flex flex-col gap-4">
              {/* Icon selector + Name */}
              <div className="flex gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-500">
                    アイコン
                  </label>
                  <div className="flex flex-wrap gap-1 rounded-lg border border-slate-200 p-2">
                    {ICON_OPTIONS.map((ic) => (
                      <button
                        key={ic}
                        onClick={() => setIcon(ic)}
                        className={`flex h-8 w-8 items-center justify-center rounded-md text-lg transition ${
                          icon === ic
                            ? "bg-indigo-100 ring-2 ring-indigo-400"
                            : "hover:bg-slate-100"
                        }`}
                      >
                        {ic}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-xs font-medium text-slate-500">
                    名前 *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="例: 英語の先生"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  />
                  <label className="mb-1 mt-3 block text-xs font-medium text-slate-500">
                    説明
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="例: 優しく英語を教えてくれる"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
              </div>

              {/* System Instruction */}
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-500">
                  命令書（System Instruction）*
                </label>
                <textarea
                  value={systemInstruction}
                  onChange={(e) => setSystemInstruction(e.target.value)}
                  placeholder={`AIの振る舞いを詳しく記述してください。\n例:\n- あなたは優しい英語の先生です。\n- 日本語で説明しながら英語を教えてください。\n- 回答は200文字以内にしてください。`}
                  rows={8}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm leading-relaxed text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                />
                <p className="mt-1 text-xs text-slate-400">
                  ここに書いた内容がAIの人格・ルールになります。具体的に書くほど望む会話が得られます。
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={resetEditor}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-100"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!name.trim() || !systemInstruction.trim()}
                  className="rounded-lg bg-indigo-500 px-6 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-600 active:scale-95 disabled:opacity-40"
                >
                  💎 Gem を作成
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Gem List */}
        {gems.length === 0 && !showEditor ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
            <span className="text-6xl">💎</span>
            <h2 className="text-xl font-bold text-slate-600">
              Gem がまだありません
            </h2>
            <p className="max-w-sm text-sm text-slate-400">
              「新規作成」ボタンからオリジナルの AI ペルソナを作ってみましょう。
              テンプレートからも簡単に始められます。
            </p>
            <button
              onClick={() => {
                resetEditor();
                setShowEditor(true);
              }}
              className="rounded-lg bg-indigo-500 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-600"
            >
              + 最初の Gem を作る
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {gems.map((gem) => (
              <div
                key={gem.id}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
              >
                <Link
                  href={`/gems/${gem.id}`}
                  className="block p-5"
                >
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-2xl">
                      {gem.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-800">{gem.name}</h3>
                      <p className="text-xs text-slate-400">
                        {gem.description || "説明なし"}
                      </p>
                    </div>
                  </div>
                  <p className="line-clamp-2 text-xs leading-relaxed text-slate-500">
                    {gem.systemInstruction}
                  </p>
                </Link>
                <div className="flex items-center justify-between border-t border-slate-100 px-5 py-2">
                  <span className="text-[10px] text-slate-300">
                    {new Date(gem.createdAt).toLocaleDateString("ja-JP")}
                  </span>
                  <button
                    onClick={() => handleDelete(gem.id)}
                    className="rounded px-2 py-1 text-xs text-slate-400 transition hover:bg-red-50 hover:text-red-500"
                  >
                    削除
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
