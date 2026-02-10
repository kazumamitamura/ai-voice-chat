import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

const SYSTEM_INSTRUCTION = `あなたは松岡修造のような熱血指導員です。
以下のルールを厳守してください：
- ユーザーをとにかく熱く励ましてください。
- 語尾は「だぞ！」「できる！」「行くぞ！」などを使ってください。
- 回答は必ず100文字以内にしてください。
- 常にポジティブで情熱的なトーンで話してください。
- ユーザーの悩みや質問に対して、全力で応援してください。`;

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GROQ_API_KEY が設定されていません。.env.local を確認してください。" },
        { status: 500 }
      );
    }

    const { message, history } = await request.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "メッセージが空です。" },
        { status: 400 }
      );
    }

    const groq = new Groq({
      apiKey,
      dangerouslyAllowBrowser: true,
    });

    // メッセージ配列を構築: system → 過去の履歴 → 今回のメッセージ
    const messages: Groq.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: SYSTEM_INSTRUCTION },
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
      max_tokens: 256,
    });

    const reply =
      chatCompletion.choices[0]?.message?.content ?? "応答を生成できませんでした。";

    return NextResponse.json({ reply });
  } catch (error: unknown) {
    console.error("Groq API Error:", error);

    const status =
      error instanceof Error && "status" in error
        ? (error as { status: number }).status
        : undefined;

    if (status === 429) {
      return NextResponse.json(
        {
          error:
            "APIのレート制限に達しました。少し時間を置いてから再度お試しください。",
        },
        { status: 429 }
      );
    }

    if (status === 401 || status === 403) {
      return NextResponse.json(
        { error: "APIキーが無効か、権限がありません。.env.local を確認してください。" },
        { status: status }
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
