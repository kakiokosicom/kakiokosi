#!/usr/bin/env node
/**
 * 記事別OG画像（タイトルカード）の一括生成
 * ─────────────────────────────────────────────────────────────────────────
 * 背景: 全ページが共通の default-og.png を使っており、SNSシェア・Google
 * Discover 面で不利だった（SEO監査 2026-06-11 Images 65点の主因）。
 * 本スクリプトはインデックス可能な公開記事・ガイドページ・カテゴリページの
 * タイトルカード(1200x630 PNG)を Playwright で生成し、
 * public/images/og/ に保存 + app/lib/og-manifest.ts を書き出す。
 * テンプレートはマニフェストに存在するページのみ専用OG画像を参照する
 * （存在しない新規記事は従来どおり default-og.png にフォールバック）。
 *
 * 使い方:
 *   node scripts/generate-og-images.mjs            # 全対象を生成
 *   node scripts/generate-og-images.mjs --only 1388  # 特定IDのみ
 *
 * 新しい記事を公開したら再実行してコミットする（cron公開分は次回実行時に追従）。
 */
import { execFileSync } from "child_process";
import { mkdirSync, writeFileSync } from "fs";
import { pathToFileURL } from "url";

/** playwright をローカル → グローバル(npm root -g) の順で解決する */
async function loadChromium() {
  try {
    return (await import("playwright")).chromium;
  } catch {
    const globalRoot = execFileSync("npm", ["root", "-g"], { encoding: "utf8" }).trim();
    const mod = await import(pathToFileURL(`${globalRoot}/playwright/index.mjs`).href);
    return mod.chromium;
  }
}

const DB = "kakiokosi-db";
const OUT_DIR = "public/images/og";
const ONLY = (() => {
  const i = process.argv.indexOf("--only");
  return i >= 0 ? String(process.argv[i + 1]) : null;
})();

function d1Select(sql) {
  const out = execFileSync(
    "npx",
    ["wrangler", "d1", "execute", DB, "--remote", "--json", "--command", sql],
    { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 }
  );
  const start = out.indexOf("[");
  return JSON.parse(out.slice(start))[0]?.results ?? [];
}

const CATEGORY_LABELS = {
  business: "ビジネス", politics: "政治", society: "社会", world: "海外",
  it: "IT", entertainment: "エンターテイメント", economy: "経済・マネー",
  culture: "カルチャー", etc: "その他",
};

function cardHtml(title, kicker) {
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  // 長文タイトルは自動縮小（CJK 1200px幅で概ね3行に収める）
  const size = title.length > 60 ? 44 : title.length > 40 ? 52 : title.length > 24 ? 60 : 72;
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { width:1200px; height:630px; overflow:hidden;
    font-family:"Hiragino Sans","Noto Sans JP",sans-serif;
    background:linear-gradient(135deg,#03192e 0%,#1a2e44 60%,#24405e 100%);
    color:#fff; display:flex; flex-direction:column; justify-content:space-between;
    padding:64px 72px; position:relative; }
  .rule { position:absolute; top:0; left:0; right:0; height:10px;
    background:linear-gradient(90deg,#c9a227,#e8d48b); }
  .kicker { font-size:26px; letter-spacing:.25em; color:#e8d48b; font-weight:700; }
  .title { font-size:${size}px; font-weight:800; line-height:1.35;
    display:-webkit-box; -webkit-line-clamp:4; -webkit-box-orient:vertical; overflow:hidden; }
  .footer { display:flex; align-items:baseline; justify-content:space-between; }
  .brand { font-size:38px; font-weight:800;
    font-family:"Hiragino Mincho ProN","Noto Serif JP",serif; }
  .domain { font-size:24px; color:rgba(255,255,255,.55); letter-spacing:.12em; }
  </style></head><body>
  <div class="rule"></div>
  <div class="kicker">${esc(kicker)}</div>
  <div class="title">${esc(title)}</div>
  <div class="footer"><div class="brand">書き起こし.com</div>
  <div class="domain">kakiokosi.com</div></div>
  </body></html>`;
}

async function main() {
  mkdirSync(OUT_DIR, { recursive: true });

  // 対象1: インデックス可能な公開記事
  const posts = d1Select(
    `SELECT id, title, primary_category FROM posts
     WHERE status='published' AND (noindex IS NULL OR noindex=0)
     ORDER BY id`
  );
  // 対象2: ガイド・静的ページ
  const pages = d1Select(`SELECT slug, title FROM pages ORDER BY slug`);
  // 対象3: カテゴリページ
  const categories = d1Select(`SELECT slug, name FROM categories ORDER BY slug`);

  const targets = [];
  for (const p of posts) {
    targets.push({
      file: `post-${p.id}.jpg`, key: `post-${p.id}`, title: p.title,
      kicker: `${CATEGORY_LABELS[p.primary_category] ?? p.primary_category} ｜ 書き起こし`,
    });
  }
  for (const p of pages) {
    targets.push({ file: `page-${p.slug}.jpg`, key: `page-${p.slug}`, title: p.title, kicker: "書き起こし.com" });
  }
  for (const c of categories) {
    targets.push({
      file: `category-${c.slug}.jpg`, key: `category-${c.slug}`,
      title: `${CATEGORY_LABELS[c.slug] ?? c.name}の書き起こし記事一覧`, kicker: "カテゴリ",
    });
  }

  const chromium = await loadChromium();
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
  let generated = 0;
  for (const t of targets) {
    if (ONLY && !t.key.endsWith(`-${ONLY}`)) continue;
    await page.setContent(cardHtml(t.title, t.kicker), { waitUntil: "load" });
    await page.screenshot({ path: `${OUT_DIR}/${t.file}`, type: "jpeg", quality: 84 });
    generated++;
  }
  await browser.close();

  // マニフェスト書き出し（テンプレートが存在チェックに使う）
  const manifest = `// 自動生成: scripts/generate-og-images.mjs が public/images/og/ と同期して出力する。
// 手で編集しない。新記事公開後はスクリプトを再実行してコミットする。
export const OG_KEYS: ReadonlySet<string> = new Set(${JSON.stringify(targets.map((t) => t.key), null, 2)});

/** 専用OG画像があればそのURL、なければ既定画像を返す */
export function ogImageUrl(key: string): string {
  return OG_KEYS.has(key)
    ? \`https://kakiokosi.com/images/og/\${key}.jpg\`
    : "https://kakiokosi.com/images/default-og.png";
}
`;
  writeFileSync("app/lib/og-manifest.ts", manifest);
  console.log(`generated ${generated} images → ${OUT_DIR}/, manifest: app/lib/og-manifest.ts (${targets.length} keys)`);
}

main().catch((e) => { console.error(e); process.exit(1); });
