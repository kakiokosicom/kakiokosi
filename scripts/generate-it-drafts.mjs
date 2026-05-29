#!/usr/bin/env node
/**
 * 原液(etc draft) 一括記事化バッチ
 * ─────────────────────────────────────────────────────────────────────────
 * 背景: 3日ごとの自動公開cron(workers/app.ts)は `status='draft' AND
 * primary_category='it'` の最古ドラフトを1本publishするだけ。記事の「生成」は
 * しない。ITキューが枯渇すると自動公開が止まる（2026-05の停止原因）。
 * 一方、音声文字起こしの「原液」が primary_category='etc' に多数ドラフトとして
 * 眠っている。本スクリプトは原液を AIライター(app/lib/ai-writer.server.ts と同等の
 * パジ文体PDCA)に通して IT 記事ドラフトを生成し、キューを補充する。
 *
 * 重要な安全設計:
 *  - cron は3日に1本しか公開しないので、ドラフトを大量生成してもサイトには
 *    少しずつしか出ない（量産による品質低下リスクは公開スロットルで吸収）。
 *  - それでも各記事は CHECK ステップの品質スコアでゲートし、閾値未満は採用しない
 *    （弱い派生コンテンツを増やさない＝品質集中戦略 migration 0024/0028 と整合）。
 *  - 生成元の原液は status='archived' に退避し、再実行で重複生成しない。
 *  - --dry-run でDBに書かず生成結果を scripts/out/ に保存してレビュー可能。
 *
 * 前提:
 *  - 環境変数 ANTHROPIC_API_KEY（Workerのsecretと同じ鍵。ローカルに用意する）
 *  - wrangler が本番D1にアクセス可能（npx wrangler whoami で確認）
 *  - migration 0029(source_id カラム)適用済み
 *
 * 使い方:
 *  ANTHROPIC_API_KEY=sk-ant-... node scripts/generate-it-drafts.mjs --dry-run --limit 2
 *  ANTHROPIC_API_KEY=sk-ant-... node scripts/generate-it-drafts.mjs --limit 8 --min-score 72
 *
 * オプション:
 *  --limit N        今回処理する原液の本数（既定 5）
 *  --min-score N    採用する総合品質スコアの閾値 0-100（既定 70）
 *  --model ID       使用モデル（既定 claude-sonnet-4-20250514。品質重視なら
 *                   --model claude-sonnet-4-6 を推奨）
 *  --dry-run        DBに書かず scripts/out/<id>.html に生成物を保存して終了
 *  --keep-rejects   閾値未満でも原液を archived にせずプールに残す（既定は退避）
 */

import { execFileSync } from "child_process";
import { writeFileSync, mkdirSync, existsSync } from "fs";

// ── CLI 引数 ───────────────────────────────────────────────────────────────
const argv = process.argv.slice(2);
const flag = (name) => argv.includes(`--${name}`);
const opt = (name, def) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : def;
};
const LIMIT = parseInt(opt("limit", "5"), 10);
const MIN_SCORE = parseInt(opt("min-score", "70"), 10);
const MODEL = opt("model", "claude-sonnet-4-20250514");
const DRY = flag("dry-run");
const KEEP_REJECTS = flag("keep-rejects");
const DB = "kakiokosi-db";
const API_KEY = process.env.ANTHROPIC_API_KEY;

if (!API_KEY) {
  console.error("✗ ANTHROPIC_API_KEY 環境変数が未設定です。");
  console.error("  例: ANTHROPIC_API_KEY=sk-ant-... node scripts/generate-it-drafts.mjs --dry-run --limit 2");
  process.exit(1);
}

// ── D1 ヘルパ ────────────────────────────────────────────────────────────────
// execFileSync + 引数配列でシェルを介さない（SQL内のメタ文字も安全に1引数として渡る）。
// さらに本文など任意文字列を含む書き込みは --command ではなく一時 .sql ファイル経由。
const WRANGLER_OPTS = { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 };

function d1Select(sql) {
  const out = execFileSync(
    "npx",
    ["wrangler", "d1", "execute", DB, "--remote", "--json", "--command", sql],
    WRANGLER_OPTS
  );
  const start = out.indexOf("[");
  if (start < 0) throw new Error("D1 JSON応答をパースできません: " + out.slice(0, 200));
  const parsed = JSON.parse(out.slice(start));
  return parsed[0]?.results ?? [];
}

function d1RunFile(sql, label) {
  const tmp = `/tmp/gen_it_${label}_${process.pid}.sql`;
  writeFileSync(tmp, sql);
  execFileSync(
    "npx",
    ["wrangler", "d1", "execute", DB, "--remote", `--file=${tmp}`],
    WRANGLER_OPTS
  );
}

const sqlEsc = (s) => String(s).replace(/'/g, "''");

// ── Claude API ───────────────────────────────────────────────────────────────
async function callClaude(system, user, maxTokens = 4096) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content: user }],
    }),
  });
  if (!res.ok) {
    throw new Error(`Claude API ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
  const data = await res.json();
  return data.content?.[0]?.text ?? "";
}

// ── パジ文体プロンプト（app/lib/ai-writer.server.ts と同一基準） ──────────────
const PAJI = `あなたは「パジ」というペンネームで活動する、テクノロジー・ビジネス分野の人気ライターです。
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

async function planArticle(raw, title) {
  const system = `${PAJI}\n\nあなたは記事の構成プランナーです。音声書き起こしの原文を分析し、魅力的な長文記事の構成案を作成してください。`;
  const user = `以下はポッドキャスト「${title}」の音声書き起こしです。
この内容をベースに、X（Twitter）の長文ポスト風の読み応えある記事の構成案を作成してください。

## 構成
1. セクション名 — 概要
...
## キーポイント
- 核となるメッセージ
## ターゲット読者
（刺さる読者層）

---
【書き起こし原文】
${raw.substring(0, 8000)}`;
  return callClaude(system, user);
}

async function generateArticle(raw, title, plan) {
  const system = `${PAJI}\n\nあなたは記事ライターです。構成案と元の書き起こしをベースに、完成度の高い長文記事をHTML形式で執筆してください。
出力はHTMLのみ（<h2>, <h3>, <p>, <strong>, <ul>, <li>, <blockquote>タグを使用）。
<html>や<body>タグは不要。記事本文のみを出力してください。`;
  const user = `以下の構成案と書き起こし原文をベースに、パジスタイルの長文記事を執筆してください。

【構成案】
${plan}

【書き起こし原文】
${raw.substring(0, 10000)}

---
3000-6000文字の読み応えある記事をHTML形式で出力。原文の情報を活かしつつ、独自の考察・分析でオリジナリティを出してください。`;
  return callClaude(system, user, 8192);
}

async function checkArticle(article, title) {
  const system = `あなたは記事の品質評価エキスパートです。記事を多角的に評価し、必ず以下のJSON形式のみで出力してください（他のテキスト不要）。`;
  const user = `記事「${title}」を評価。各0-100点。
{"score":総合,"originality":0-100,"readability":0-100,"depth":0-100,"engagement":0-100,"strengths":["..."],"improvements":["..."]}

【記事】
${article.substring(0, 8000)}`;
  const raw = await callClaude(system, user, 2048);
  const s = raw.indexOf("{");
  const e = raw.lastIndexOf("}");
  if (s < 0 || e < 0) return { score: 0, _parseError: raw.slice(0, 200) };
  try {
    return JSON.parse(raw.slice(s, e + 1));
  } catch {
    const m = raw.match(/"score"\s*:\s*(\d+)/);
    return { score: m ? parseInt(m[1], 10) : 0, _parseError: true };
  }
}

// 完成記事から SEO 用の title / excerpt を堅牢に抽出（plan のタイトル案に依存しない）
async function finalizeMeta(article, fallbackTitle) {
  const system = `あなたは日本語SEO編集者です。記事本文から最適な記事タイトルとメタディスクリプションを作成し、必ずJSONのみで出力してください。`;
  const user = `次の記事から JSON を出力:
{"title":"32〜42字程度・検索されやすくクリックしたくなる日本語タイトル（記号の多用は避ける）","excerpt":"110〜120字・記事の要点と読む価値を伝えるメタディスクリプション"}

【記事】
${article.substring(0, 6000)}`;
  try {
    const raw = await callClaude(system, user, 1024);
    const obj = JSON.parse(raw.slice(raw.indexOf("{"), raw.lastIndexOf("}") + 1));
    const title = (obj.title || "").trim() || fallbackTitle;
    let excerpt = (obj.excerpt || "").trim();
    if (!excerpt) excerpt = stripExcerpt(article);
    return { title: title.slice(0, 80), excerpt: excerpt.slice(0, 160) };
  } catch {
    return { title: fallbackTitle, excerpt: stripExcerpt(article) };
  }
}

function stripExcerpt(html) {
  const text = html.replace(/<[^>]+>/g, "").replace(/\s+/g, "").trim();
  const cut = text.slice(0, 118);
  const lastPeriod = cut.lastIndexOf("。");
  return lastPeriod > 60 ? cut.slice(0, lastPeriod + 1) : cut + "…";
}

// ── メイン ───────────────────────────────────────────────────────────────────
async function main() {
  console.log(`▶ 原液記事化バッチ  model=${MODEL} limit=${LIMIT} min-score=${MIN_SCORE} dry-run=${DRY}`);

  const pool = d1Select(
    `SELECT id, title, content FROM posts WHERE status='draft' AND primary_category='etc' ORDER BY id ASC LIMIT ${LIMIT}`
  );
  if (pool.length === 0) {
    console.log("プールに原液がありません（処理対象0）。");
    return;
  }
  console.log(`プールから ${pool.length} 本取得。`);

  if (DRY && !existsSync("scripts/out")) mkdirSync("scripts/out", { recursive: true });

  let accepted = 0,
    rejected = 0;

  for (const [i, row] of pool.entries()) {
    const tag = `[${i + 1}/${pool.length}] etc#${row.id}`;
    try {
      console.log(`\n${tag} 「${(row.title || "").slice(0, 40)}」 生成中…`);
      const plan = await planArticle(row.content, row.title || "無題");
      const article = await generateArticle(row.content, row.title || "無題", plan);
      const check = await checkArticle(article, row.title || "無題");
      const score = Number(check.score) || 0;
      const ok = score >= MIN_SCORE;
      console.log(`${tag} score=${score} (orig=${check.originality ?? "?"} read=${check.readability ?? "?"} depth=${check.depth ?? "?"} eng=${check.engagement ?? "?"}) → ${ok ? "採用" : "却下"}`);

      if (!ok) {
        rejected++;
        if (!DRY && !KEEP_REJECTS) {
          d1RunFile(
            `UPDATE posts SET status='archived', updated_at=datetime('now','+9 hours') WHERE id=${row.id};`,
            `arch_${row.id}`
          );
        }
        continue;
      }

      const meta = await finalizeMeta(article, row.title || "無題");
      accepted++;

      if (DRY) {
        const path = `scripts/out/${row.id}.html`;
        writeFileSync(
          path,
          `<!-- title: ${meta.title}\n     excerpt: ${meta.excerpt}\n     score: ${score} -->\n${article}`
        );
        console.log(`${tag} (dry-run) → ${path}  title=「${meta.title}」`);
        continue;
      }

      // it ドラフトを作成 + 原液を退避（来歴 source_id を記録）
      const insert = `INSERT INTO posts (author_id, title, content, excerpt, status, primary_category, source_id, created_at, updated_at)
VALUES (NULL, '${sqlEsc(meta.title)}', '${sqlEsc(article)}', '${sqlEsc(meta.excerpt)}', 'draft', 'it', ${row.id}, datetime('now','+9 hours'), datetime('now','+9 hours'));
UPDATE posts SET status='archived', updated_at=datetime('now','+9 hours') WHERE id=${row.id};`;
      d1RunFile(insert, `ins_${row.id}`);
      console.log(`${tag} → it draft 作成  title=「${meta.title}」`);
    } catch (e) {
      console.error(`${tag} ✗ エラー: ${e.message}`);
    }
  }

  console.log(`\n── 完了: 採用 ${accepted} / 却下 ${rejected} / 対象 ${pool.length}`);
  if (!DRY && accepted > 0) {
    console.log(`it ドラフトが ${accepted} 本増えました。次のcron（毎月3,6,9…日の09:00 JST）から1本ずつ自動公開されます。`);
  }
  if (DRY) console.log("dry-run のため scripts/out/ に保存のみ。本番反映は --dry-run を外して再実行。");
  const remaining = d1Select(
    `SELECT COUNT(*) c FROM posts WHERE status='draft' AND primary_category='etc'`
  )[0]?.c;
  console.log(`残り原液プール: ${remaining} 本（再実行で続きを処理）`);
}

main().catch((e) => {
  console.error("致命的エラー:", e);
  process.exit(1);
});
