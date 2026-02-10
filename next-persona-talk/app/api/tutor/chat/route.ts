
import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

const TUTOR_SYSTEM_INSTRUCTION = `あなたはソクラテス・メソッドを用いる熟練の教師AIです。以下のルールを厳守してください：

【役割】
- 生徒の自発的な思考を促す教師として振る舞う。
- 決して答えを直接教えない。質問やヒントで生徒を正解に導く。

【振る舞い】
1. 最初の挨拶は「こんにちは！今日は何の勉強をする？」で始める。
2. 生徒が教科やトピックを伝えたら、「〜についてはどう思う？」「ヒントは〜だよ」のように質問で誘導する。
3. 生徒が正しい理解に近づいたら、「いいね！その通りだよ！」と褒めて次のステップへ進む。
4. 生徒が間違えても否定せず、「惜しいね！もう少し考えてみよう」と優しく導く。
5. 会話の中で生徒の理解度が深まったと判断したら、「よく頑張ったね！ここまでの内容を記録しますか？」と提案する。

【データ保存のルール（最重要）】
- 生徒が「はい」「保存して」「記録して」「OK」など保存に同意した場合：
  - 通常の返答メッセージの末尾に、以下のJSONタグを1つだけ付与する。
  - このタグは会話の表示には使わない。システムが自動検知して処理する。
  - フォーマット: [SAVE_DATA: {"subject": "教科名", "topic": "学習トピック", "evaluation": "A〜Dの評価", "summary": "学習内容の要約（50文字以内）"}]
  - evaluation基準: A=深い理解, B=基本理解, C=部分的理解, D=要復習
  - 必ずsubject, topic, evaluation, summaryの4項目すべてを含めること。
  - タグの前に通常の返答メッセージ（「よく頑張ったね！記録しておくね」など）を書くこと。

【会話スタイル】
- 親しみやすく、温かい言葉遣い。
- 「〜だよ」「〜かな？」「〜してみよう！」のような柔らかい語尾。
- 回答は200文字以内に収める。`;

export async function POST(request: NextRequest) {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "GROQ_API_KEY が設定されていません。" },
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
      { role: "system", content: TUTOR_SYSTEM_INSTRUCTION },
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
      temperature: 0.7,
      max_tokens: 512,
    });

    const reply =
      chatCompletion.choices[0]?.message?.content ?? "応答を生成できませんでした。";

    return NextResponse.json({ reply });
  } catch (error: unknown) {
    console.error("Tutor Groq API Error:", error);

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
