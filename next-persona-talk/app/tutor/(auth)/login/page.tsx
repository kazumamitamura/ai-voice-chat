"use client";

import { useState } from "react";
import { login } from "@/lib/supabase/auth-actions";
import Link from "next/link";

export default function TutorLoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await login(formData);

    // redirect が成功すればここには来ない
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-500 via-blue-500 to-cyan-400 px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 text-3xl shadow-lg backdrop-blur-sm">
            📚
          </div>
          <h1 className="text-2xl font-bold text-white">AI学習チューター</h1>
          <p className="mt-1 text-sm text-white/80">
            ソクラテス式対話で学びを深めよう
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl bg-white p-6 shadow-xl">
          <h2 className="mb-5 text-center text-lg font-bold text-gray-800">
            ログイン
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-xs font-medium text-gray-500"
              >
                メールアドレス
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="example@email.com"
                required
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1 block text-xs font-medium text-gray-500"
              >
                パスワード
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="6文字以上"
                required
                minLength={6}
                className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-center text-xs text-red-600">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-gradient-to-r from-indigo-500 to-blue-600 py-2.5 text-sm font-bold text-white shadow-sm transition hover:from-indigo-600 hover:to-blue-700 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? "ログイン中..." : "ログイン"}
            </button>
          </form>

          <div className="mt-5 text-center">
            <Link
              href="/tutor/signup"
              className="text-xs text-indigo-500 hover:text-indigo-700 hover:underline"
            >
              アカウントをお持ちでない方はこちら（新規登録）
            </Link>
          </div>
        </div>

        {/* Back */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-xs text-white/60 hover:text-white/90 hover:underline"
          >
            &larr; トップページに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}
