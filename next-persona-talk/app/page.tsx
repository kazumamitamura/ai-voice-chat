import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 px-4">
      <div className="w-full max-w-md text-center">
        {/* Title */}
        <h1 className="mb-2 text-3xl font-extrabold text-white">
          AI Voice Chat
        </h1>
        <p className="mb-10 text-sm text-gray-400">
          アプリを選んでください
        </p>

        {/* App Cards */}
        <div className="flex flex-col gap-4">
          {/* 熱血パーソナトーク */}
          <Link
            href="/persona"
            className="group flex items-center gap-4 rounded-2xl border border-orange-500/30 bg-gradient-to-r from-orange-500/10 to-red-500/10 p-5 text-left shadow-lg transition hover:border-orange-500/60 hover:from-orange-500/20 hover:to-red-500/20 hover:shadow-orange-500/10"
          >
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-500 text-2xl shadow-md">
              🔥
            </div>
            <div>
              <h2 className="text-lg font-bold text-white group-hover:text-orange-300">
                熱血パーソナトーク
              </h2>
              <p className="mt-0.5 text-xs text-gray-400">
                松岡修造モードで全力応援チャット
              </p>
            </div>
          </Link>

          {/* AI学習チューター */}
          <Link
            href="/tutor"
            className="group flex items-center gap-4 rounded-2xl border border-indigo-500/30 bg-gradient-to-r from-indigo-500/10 to-blue-500/10 p-5 text-left shadow-lg transition hover:border-indigo-500/60 hover:from-indigo-500/20 hover:to-blue-500/20 hover:shadow-indigo-500/10"
          >
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 text-2xl shadow-md">
              📚
            </div>
            <div>
              <h2 className="text-lg font-bold text-white group-hover:text-indigo-300">
                AI学習チューター
              </h2>
              <p className="mt-0.5 text-xs text-gray-400">
                ソクラテス式対話で学びを深めよう
              </p>
            </div>
          </Link>

          {/* My Gems */}
          <Link
            href="/gems"
            className="group flex items-center gap-4 rounded-2xl border border-purple-500/30 bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-5 text-left shadow-lg transition hover:border-purple-500/60 hover:from-purple-500/20 hover:to-pink-500/20 hover:shadow-purple-500/10"
          >
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-2xl shadow-md">
              💎
            </div>
            <div>
              <h2 className="text-lg font-bold text-white group-hover:text-purple-300">
                My Gems
              </h2>
              <p className="mt-0.5 text-xs text-gray-400">
                自分だけの AI ペルソナを作成して会話しよう
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
