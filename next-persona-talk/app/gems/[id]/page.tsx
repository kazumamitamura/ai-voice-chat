"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getGemById } from "@/lib/gems/storage";
import type { Gem } from "@/lib/gems/types";
import GemChat from "@/components/gems/GemChat";

export default function GemChatPage() {
  const params = useParams();
  const router = useRouter();
  const [gem, setGem] = useState<Gem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = params.id as string;
    const found = getGemById(id);
    if (!found) {
      router.replace("/gems");
      return;
    }
    setGem(found);
    setLoading(false);
  }, [params.id, router]);

  if (loading || !gem) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-500" />
          <p className="text-sm text-slate-400">読み込み中...</p>
        </div>
      </div>
    );
  }

  return <GemChat gem={gem} />;
}
