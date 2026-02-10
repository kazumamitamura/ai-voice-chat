"use server";

import { createClient } from "@/lib/supabase/server";

// ---------- Types ----------
export interface LearningLog {
  id: string;
  user_id: string;
  subject: string;
  topic: string;
  evaluation: string;
  full_conversation: { role: string; content: string }[];
  created_at: string;
}

interface SaveData {
  subject: string;
  topic: string;
  evaluation: string;
  summary: string;
}

// ---------- Save learning log ----------
export async function saveLearningLog(
  saveData: SaveData,
  conversation: { role: string; content: string }[]
) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "認証されていません。ログインしてください。" };
  }

  const { error } = await supabase.from("tutor_learning_logs").insert({
    user_id: user.id,
    subject: saveData.subject,
    topic: saveData.topic,
    evaluation: saveData.evaluation,
    full_conversation: conversation,
  });

  if (error) {
    console.error("Supabase insert error:", error);
    return { error: "学習記録の保存に失敗しました。" };
  }

  return { success: true };
}

// ---------- Fetch all learning logs (admin) ----------
export async function fetchAllLearningLogs(): Promise<{
  data: LearningLog[] | null;
  error: string | null;
}> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { data: null, error: "認証されていません。" };
  }

  const { data, error } = await supabase
    .from("tutor_learning_logs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase fetch error:", error);
    return { data: null, error: "学習記録の取得に失敗しました。" };
  }

  return { data, error: null };
}

// ---------- Fetch user's own logs ----------
export async function fetchMyLearningLogs(): Promise<{
  data: LearningLog[] | null;
  error: string | null;
}> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { data: null, error: "認証されていません。" };
  }

  const { data, error } = await supabase
    .from("tutor_learning_logs")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Supabase fetch error:", error);
    return { data: null, error: "学習記録の取得に失敗しました。" };
  }

  return { data, error: null };
}
