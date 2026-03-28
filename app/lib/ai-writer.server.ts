/**
 * AI Content Writer — パジ長文X投稿スキルを用いた記事生成エンジン
 *
 * PDCA ワークフロー:
 *   Plan  → 原液から構成案を生成
 *   Do    → 構成案をベースに長文記事を生成
 *   Check → 記事の品質スコアリング + 改善提案
 *   Act   → 改善提案を反映して記事をブラッシュアップ
 */

const PAJI_STYLE_PROMPT = `あなたは「パジ」というペンネームで活動する、テクノロジー・ビジネス分野の人気ライターです。
以下のスタイルで記事を執筆してください:

【パジの文体特徴】
- 読者に語りかけるような親しみやすい文体（「〜なんですよね」「〜というわけです」）
- 専門用語を使いつつも、必ず平易な言葉で補足説明を入れる
- 具体的な数字・事例・固有名詞を多用して説得力を出す
- 「つまり」「要するに」「ここがポイントなんですが」などの接続で論理展開を明確にする
- 長文でも読み飽きない工夫: 小見出し、箇条書き、強調を効果的に使う
- 冒頭で読者の関心を引くフック（問いかけ、衝撃的な事実、逆説）を入れる
- 最後に読者への問いかけや行動喚起で締める
- X（Twitter）の長文ポスト風: 1段落は3-4文程度、テンポ良く

【記事のクオリティ基準】
- オリジナリティ: 単なる情報の羅列ではなく、独自の視点・考察を必ず入れる
- 深さ: 表面的な紹介に留まらず、「なぜそうなのか」「今後どうなるか」まで踏み込む
- 構造: 明確な起承転結、各セクションに小見出し
- 長さ: 3000-6000文字程度の読み応えある長文`;

export type AiStep = "plan" | "do" | "check" | "act";

export type PlanResult = {
  outline: string;
  hook: string;
  keyPoints: string[];
  targetAudience: string;
};

export type CheckResult = {
  score: number; // 0-100
  originality: number;
  readability: number;
  depth: number;
  engagement: number;
  improvements: string[];
  strengths: string[];
};

async function callClaude(
  apiKey: string,
  systemPrompt: string,
  userPrompt: string,
  maxTokens = 4096
): Promise<string> {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Claude API error ${res.status}: ${err}`);
  }

  const data = (await res.json()) as {
    content: Array<{ type: string; text: string }>;
  };
  return data.content[0]?.text || "";
}

// ─── PLAN: 原液から構成案を生成 ───

export async function planArticle(
  apiKey: string,
  transcription: string,
  title: string
): Promise<string> {
  const system = `${PAJI_STYLE_PROMPT}

あなたは記事の構成プランナーです。音声書き起こしの原文を分析し、魅力的な長文記事の構成案を作成してください。`;

  const prompt = `以下はポッドキャスト「${title}」の音声書き起こしです。
この内容をベースに、X（Twitter）の長文ポスト風の読み応えある記事の構成案を作成してください。

【出力フォーマット】
## 記事タイトル案
（キャッチーで読みたくなるタイトルを3つ提案）

## フック（冒頭）
（読者の関心を引く書き出し案、2-3文）

## 構成
1. セクション名 — 内容の概要
2. セクション名 — 内容の概要
...

## キーポイント
- 記事の核となるメッセージ
- 読者に伝えたい独自の視点

## ターゲット読者
（この記事が刺さる読者層）

---

【書き起こし原文】
${transcription.substring(0, 8000)}`;

  return callClaude(apiKey, system, prompt);
}

// ─── DO: 構成案から長文記事を生成 ───

export async function generateArticle(
  apiKey: string,
  transcription: string,
  title: string,
  plan: string
): Promise<string> {
  const system = `${PAJI_STYLE_PROMPT}

あなたは記事ライターです。構成案と元の書き起こしをベースに、完成度の高い長文記事をHTML形式で執筆してください。
出力はHTMLのみ（<h2>, <h3>, <p>, <strong>, <ul>, <li>, <blockquote>タグを使用）。
<html>や<body>タグは不要です。記事本文のみを出力してください。`;

  const prompt = `以下の構成案と書き起こし原文をベースに、パジスタイルの長文記事を執筆してください。

【構成案】
${plan}

【書き起こし原文】
${transcription.substring(0, 10000)}

---

上記を元に、3000-6000文字の読み応えある記事をHTML形式で出力してください。
原文の情報を活かしつつ、独自の考察・分析を加えてオリジナリティを出してください。`;

  return callClaude(apiKey, system, prompt, 8192);
}

// ─── CHECK: 品質スコアリング + 改善提案 ───

export async function checkArticle(
  apiKey: string,
  article: string,
  title: string
): Promise<string> {
  const system = `あなたは記事の品質評価エキスパートです。
記事を多角的に評価し、具体的な改善提案を出してください。
必ず以下のJSON形式で出力してください（JSONのみ、他のテキスト不要）。`;

  const prompt = `以下の記事「${title}」を評価してください。

【評価軸（各0-100点）】
- originality: オリジナリティ（独自の視点・考察があるか）
- readability: 読みやすさ（構成、文体、テンポ）
- depth: 深さ（表面的でなく踏み込んだ内容か）
- engagement: エンゲージメント力（読者を引き込む力、シェアしたくなるか）

【出力JSON形式】
{
  "score": (総合点0-100),
  "originality": (0-100),
  "readability": (0-100),
  "depth": (0-100),
  "engagement": (0-100),
  "strengths": ["良い点1", "良い点2", "良い点3"],
  "improvements": ["改善点1: 具体的な改善方法", "改善点2: 具体的な改善方法", "改善点3: 具体的な改善方法"]
}

【記事】
${article.substring(0, 8000)}`;

  return callClaude(apiKey, system, prompt, 2048);
}

// ─── ACT: 改善提案を反映してブラッシュアップ ───

export async function improveArticle(
  apiKey: string,
  article: string,
  title: string,
  improvements: string[],
  customInstruction?: string
): Promise<string> {
  const system = `${PAJI_STYLE_PROMPT}

あなたは記事のブラッシュアップ担当です。
改善提案を反映して記事をより良くしてください。
出力はHTMLのみ（記事本文のみ）。`;

  const improvementList = improvements.map((imp, i) => `${i + 1}. ${imp}`).join("\n");

  const prompt = `以下の記事を改善してください。

【改善すべきポイント】
${improvementList}
${customInstruction ? `\n【追加の指示】\n${customInstruction}` : ""}

【現在の記事】
${article}

---

上記の改善点を全て反映した、ブラッシュアップ版をHTML形式で出力してください。
良い部分はそのまま活かしつつ、弱い部分を強化してください。`;

  return callClaude(apiKey, system, prompt, 8192);
}
