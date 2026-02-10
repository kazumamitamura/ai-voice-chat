"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "メールアドレスとパスワードを入力してください。" };
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.message === "Invalid login credentials") {
      return { error: "メールアドレスまたはパスワードが正しくありません。" };
    }
    return { error: error.message };
  }

  redirect("/tutor");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "メールアドレスとパスワードを入力してください。" };
  }

  if (password.length < 6) {
    return { error: "パスワードは6文字以上で入力してください。" };
  }

  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return { error: error.message };
  }

  redirect("/tutor");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/tutor/login");
}
