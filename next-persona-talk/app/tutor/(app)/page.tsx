import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TutorChat from "@/components/tutor/TutorChat";

export const metadata = {
  title: "AI学習チューター | チャット",
};

export default async function TutorChatPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/tutor/login");
  }

  return <TutorChat />;
}
