import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchAllLearningLogs } from "@/lib/supabase/actions";
import AdminLogList from "@/components/tutor/AdminLogList";
import Link from "next/link";

export const metadata = {
  title: "AI学習チューター | 学習記録",
};

export default async function TutorAdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/tutor/login");
  }

  const { data: logs, error } = await fetchAllLearningLogs();

  return (
    <div className="flex-1 bg-gray-50">
      {/* Page Header */}
      <div className="border-b border-gray-200 bg-white px-4 py-5">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📊</span>
            <div>
              <h1 className="text-lg font-bold text-gray-800">学習記録一覧</h1>
              <p className="text-xs text-gray-500">
                {user.email} の学習履歴
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="mx-auto max-w-4xl px-4 py-6">
        {error && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {!logs || logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
            <span className="text-5xl">📝</span>
            <p className="text-lg font-medium text-gray-500">
              まだ学習記録がありません
            </p>
            <p className="text-sm text-gray-400">
              チューターとの会話で記録が保存されると、ここに表示されます。
            </p>
            <Link
              href="/tutor"
              className="mt-2 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition hover:from-indigo-600 hover:to-blue-700"
            >
              学習を始める
            </Link>
          </div>
        ) : (
          <AdminLogList logs={logs} />
        )}
      </main>
    </div>
  );
}
