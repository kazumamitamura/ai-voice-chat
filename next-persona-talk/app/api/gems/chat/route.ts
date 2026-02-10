import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GROQ_API_KEY が設定されていません。" },
        { status: 500 }
      );
    }

    const { message, history, systemInstruction } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "メッセージが空です。" },
        { status: 400 }
      );
    }

    if (!systemInstruction || typeof systemInstruction !== "string") {
      return NextResponse.json(
        { error: "システム命令が設定されていません。" },
        { status: 400 }
      );
    }

    const groq = new Groq({
      apiKey,
      dangerouslyAllowBrowser: true,
    });

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
      model: "llama3-8b-8192",
      messages,
      temperature: 0.8,
      max_tokens: 512,
    });

    const reply =
      chatCompletion.choices[0]?.message?.content ?? "応答を生成できませんでした。";

    return NextResponse.json({ reply });
  } catch (error: unknown) {
    console.error("Gem Groq API Error:", error);

    const status =
      error instanceof Error && "status" in error
        ? (error as { status: number }).status
        : undefined;

    if (status === 429) {
      return NextResponse.json(
        { error: "APIのレート制限に達しました。少し待ってから再度お試しください。" },
        { status: 429 }
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
