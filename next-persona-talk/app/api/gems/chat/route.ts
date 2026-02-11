import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const apiKey =
      process.env.GROQ_API_KEY || process.env.NEXT_PUBLIC_GROQ_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "GROQ_API_KEY が設定されていません。.env.local を確認してください。" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { message, history, systemInstruction } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "メッセージが空です。" },
        { status: 400 }
      );
    }

    if (!systemInstruction || typeof systemInstruction !== "string") {
      return NextResponse.json(
        { error: "命令書（System Instruction）が設定されていません。Gem の設定を確認してください。" },
        { status: 400 }
      );
    }

    const groq = new Groq({ apiKey });

    const messages: Groq.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: systemInstruction },
      ...(history ?? []).map((msg: { role: string; content: string }) => ({
        role: (msg.role === "user" ? "user" : "assistant") as
          | "user"
          | "assistant",
        content: msg.content,
      })),
      { role: "user", content: message },
    ];

    const chatCompletion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages,
      temperature: 0.8,
      max_tokens: 512,
    });

    const reply = chatCompletion.choices[0]?.message?.content;

    if (!reply) {
      console.error("Groq returned empty response:", JSON.stringify(chatCompletion));
      return NextResponse.json(
        { error: "AIからの応答が空でした。もう一度お試しください。" },
        { status: 502 }
      );
    }

    return NextResponse.json({ reply });
  } catch (error: unknown) {
    console.error("Gem Groq API Error:", error);

    if (error instanceof Groq.APIError) {
      const msg = error.message || "Groq APIエラー";
      if (error.status === 429) {
        return NextResponse.json(
          { error: "APIのレート制限に達しました。少し待ってから再度お試しください。" },
          { status: 429 }
        );
      }
      if (error.status === 401) {
        return NextResponse.json(
          { error: "APIキーが無効です。.env.local の GROQ_API_KEY を確認してください。" },
          { status: 401 }
        );
      }
      return NextResponse.json(
        { error: `Groq API エラー (${error.status}): ${msg}` },
        { status: error.status || 500 }
      );
    }

    const msg =
      error instanceof Error ? error.message : "不明なエラーが発生しました。";
    return NextResponse.json(
      { error: `AIからの応答取得に失敗しました: ${msg}` },
      { status: 500 }
    );
  }
}
