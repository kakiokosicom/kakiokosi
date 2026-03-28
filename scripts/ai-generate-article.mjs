#!/usr/bin/env node
/**
 * AI Article Generator — runs the full PDCA pipeline on a single post.
 *
 * Usage: node scripts/ai-generate-article.mjs --post-id 1368
 *
 * Requires ANTHROPIC_API_KEY env var.
 */

import { readFileSync } from "fs";
import { execSync } from "child_process";
import { argv } from "process";

const args = {};
for (let i = 2; i < argv.length; i += 2) {
  args[argv[i].replace(/^--/, "")] = argv[i + 1];
}

const postId = args["post-id"];
const dbPath = args["db"] || "/tmp/kakiokosi_d1.db";
const apiKey = process.env.ANTHROPIC_API_KEY;

if (!postId) { console.error("Usage: --post-id <id>"); process.exit(1); }
if (!apiKey) { console.error("Set ANTHROPIC_API_KEY env var"); process.exit(1); }

// Get post content
const title = execSync(`sqlite3 ${dbPath} "SELECT title FROM posts WHERE id = ${postId};"`, { encoding: "utf-8" }).trim();
const rawContent = execSync(`sqlite3 ${dbPath} "SELECT content FROM posts WHERE id = ${postId};"`, { encoding: "utf-8" }).trim();
const transcription = rawContent.replace(/<[^>]*>/g, "").trim();

console.log(`\n📝 Post #${postId}: ${title}`);
console.log(`   原文: ${transcription.length} chars\n`);

const PAJI_STYLE = `あなたは「パジ」というペンネームで活動する、テクノロジー・ビジネス分野の人気ライターです。
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

async function callClaude(system, prompt, maxTokens = 4096) {
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
      system,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.content[0]?.text || "";
}

// ─── PLAN ───
console.log("🔵 P: 構成案を生成中...");
const plan = await callClaude(
  PAJI_STYLE + "\n\nあなたは記事の構成プランナーです。",
  `ポッドキャスト「${title}」の書き起こしから記事構成案を作成してください。

## 出力
- 記事タイトル案3つ
- 冒頭フック案
- セクション構成
- キーポイント

## 書き起こし原文
${transcription.substring(0, 8000)}`
);
console.log("   ✅ Plan完了\n");

// ─── DO ───
console.log("🟣 D: 記事を生成中...");
const article = await callClaude(
  PAJI_STYLE + "\n\nあなたは記事ライターです。出力はHTMLのみ（h2, h3, p, strong, ul, li, blockquoteタグ）。",
  `構成案と書き起こしから、3000-6000文字のパジスタイル長文記事をHTML形式で執筆してください。

## 構成案
${plan}

## 書き起こし原文
${transcription.substring(0, 10000)}`,
  8192
);
console.log(`   ✅ Do完了 (${article.length} chars)\n`);

// ─── CHECK ───
console.log("🟡 C: 品質評価中...");
const checkRaw = await callClaude(
  "記事の品質評価エキスパートです。JSON形式のみで出力してください。",
  `記事「${title}」を評価してください。

{
  "score": (総合0-100),
  "originality": (0-100),
  "readability": (0-100),
  "depth": (0-100),
  "engagement": (0-100),
  "strengths": ["良い点"],
  "improvements": ["改善点: 具体的な方法"]
}

## 記事
${article.substring(0, 8000)}`,
  2048
);
let check;
try {
  const jsonStr = checkRaw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  check = JSON.parse(jsonStr);
} catch {
  check = { score: 70, improvements: ["評価解析失敗"], strengths: [] };
}
console.log(`   ✅ Check完了: スコア ${check.score}/100`);
console.log(`      独自性:${check.originality} 読みやすさ:${check.readability} 深さ:${check.depth} 引き込み:${check.engagement}`);
if (check.improvements?.length) {
  console.log(`      改善点: ${check.improvements.join(" / ")}`);
}
console.log();

// ─── ACT ───
console.log("🟢 A: 改善中...");
const improved = await callClaude(
  PAJI_STYLE + "\n\n記事のブラッシュアップ担当です。出力はHTMLのみ。",
  `以下の改善点を反映して記事をブラッシュアップしてください。

## 改善点
${(check.improvements || []).map((s, i) => `${i + 1}. ${s}`).join("\n")}

## 現在の記事
${article}`,
  8192
);
console.log(`   ✅ Act完了 (${improved.length} chars)\n`);

// ─── Extract new title from plan ───
const titleMatch = plan.match(/[1１][\.\）\.]?\s*[「『]?([^「『」』\n]+)[」』]?/);
const newTitle = titleMatch ? titleMatch[1].replace(/[「」『』]/g, "").trim() : title;

// ─── Save to DB ───
function esc(s) { return s.replace(/'/g, "''"); }
const excerpt = improved.replace(/<[^>]*>/g, "").substring(0, 200).replace(/\n/g, " ");

execSync(`sqlite3 ${dbPath} "UPDATE posts SET title = '${esc(newTitle)}', content = '${esc(improved)}', excerpt = '${esc(excerpt)}', status = 'published', primary_category = 'it', published_at = datetime('now'), updated_at = datetime('now') WHERE id = ${postId};"`, { stdio: "pipe" });
execSync(`sqlite3 ${dbPath} "INSERT OR REPLACE INTO post_categories (post_id, category_slug) VALUES (${postId}, 'it');"`, { stdio: "pipe" });

console.log("═══════════════════════════════════════");
console.log(`📰 記事公開: ${newTitle}`);
console.log(`   ID: ${postId}`);
console.log(`   スコア: ${check.score}/100`);
console.log(`   URL: /share/it/${postId}`);
console.log("═══════════════════════════════════════");
