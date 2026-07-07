import { createRequestHandler } from "react-router";

declare module "react-router" {
  export interface AppLoadContext {
    cloudflare: {
      env: Env;
      ctx: ExecutionContext;
    };
  }
}

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE
);

const SITE = "https://kakiokosi.com";

// IndexNow（Bing/Naver等 → ChatGPT/Copilot引用経路）。Googleは非対応のため
// Google向けはsitemap lastmodのみ。通知はベストエフォートで、失敗しても
// 公開処理には影響させない。キーファイルは public/<key>.txt で配信。
const INDEXNOW_KEY = "97ee09b96812fa3564276b87ca6454ac";

async function notifyIndexNow(urls: string[]): Promise<void> {
  try {
    await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: "kakiokosi.com",
        key: INDEXNOW_KEY,
        keyLocation: `${SITE}/${INDEXNOW_KEY}.txt`,
        urlList: urls,
      }),
    });
  } catch {
    // best-effort: IndexNowの失敗は無視
  }
}

// ゾーン側リダイレクトルールから漏れた旧WordPress URLの301マップ
// （GSC「見つかりませんでした(404)」実測分。行き先は現行の同一記事）。
// デコード+小文字化+末尾スラッシュ除去後の部分一致。パート違い（-2等の
// WPスラッグ接尾辞）は長いものを先に置いて誤マッチを防ぐ。
const LEGACY_REDIRECTS: Array<[string, string]> = [
  ["大前研一が語る福島原発事故part１", "/share/society/302"],
  ["大前研一が語る福島原発事故part２", "/share/society/301"],
  ["大前研一が語る福島原発事故part３", "/share/society/300"],
  ["中野剛志先生のよくわかるtpp解説", "/share/economy/237"],
  ["まどか☆マギカ」-2", "/share/entertainment/232"],
  ["まどか☆マギカ」-3", "/share/entertainment/231"],
  ["まどか☆マギカ」-4", "/share/entertainment/230"],
  ["まどか☆マギカ」", "/share/entertainment/233"],
  ["孫正義vs池田信夫「光の道」対談-2", "/share/business/291"],
  ["孫正義vs池田信夫「光の道」対談-3", "/share/business/288"],
  ["孫正義vs池田信夫「光の道」対談-4", "/share/business/286"],
  ["孫正義vs池田信夫「光の道」対談", "/share/business/292"],
  ["津田大介×児玉龍彦のustream対談-2", "/share/society/263"],
  ["津田大介×児玉龍彦のustream対談-3", "/share/society/262"],
  ["津田大介×児玉龍彦のustream対談-4", "/share/society/260"],
  ["津田大介×児玉龍彦のustream対談", "/share/society/264"],
  ["ボランティアスタッフの応募フォーム", "/share/about"],
  ["/volunteer", "/share/about"],
];

function matchLegacyRedirect(pathname: string): string | null {
  let decoded: string;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null;
  }
  const p = decoded.toLowerCase().replace(/\/+$/, "");
  // 現行URL空間は対象外（誤爆防止）
  if (p.startsWith("/share/") || p.startsWith("/assets/") || p.startsWith("/uploads/")) {
    return null;
  }
  for (const [needle, target] of LEGACY_REDIRECTS) {
    if (p.includes(needle)) return target;
  }
  return null;
}

export default {
  /**
   * Scheduled handler — auto-publishes the oldest IT draft that passes an
   * automated quality gate（機械点検ゲート付き自動公開）.
   * Cron: every 3 days at 09:00 JST (00:00 UTC).
   *
   * 設計（SEO監査 2026-06）:
   *  1. 最古から順にIT下書きを取り出し、qualityGate() で機械点検
   *  2. 合格 → published に。不合格 → needs_review に退避（公開キューから外し
   *     人手レビュー対象に。再公開ループで無限に詰まらせない）してログに理由記録
   *  3. 最初に合格した1本だけ公開（従来どおり3日1本のスロットル）
   *  4. 残キュー深度をログ出力。低下時は queue_low=true（オンデマンド補充の合図）
   * すべてコンテンツベースの決定的チェックでLLM不要・CF内で完結。
   * 点検結果は構造化ログとして `wrangler tail` / CFダッシュボードで確認できる。
   */
  async scheduled(_event, env, _ctx) {
    const candidates = await env.DB.prepare(
      `SELECT id, title, content, excerpt, voicy_url, spotify_url, source_url, author_id
       FROM posts WHERE status = 'draft' AND primary_category = 'it'
       ORDER BY id ASC LIMIT 10`
    ).all<{
      id: number; title: string | null; content: string | null; excerpt: string | null;
      voicy_url: string | null; spotify_url: string | null; source_url: string | null; author_id: string | null;
    }>();

    let publishedId: number | null = null;
    const held: Array<{ id: number; issues: string[] }> = [];

    for (const post of candidates.results) {
      const issues = qualityGate(post);
      if (issues.length === 0) {
        await env.DB.prepare(
          `UPDATE posts SET status='published',
           published_at=datetime('now','+9 hours'), updated_at=datetime('now','+9 hours')
           WHERE id=?1 AND status='draft'`
        ).bind(post.id).run();
        publishedId = post.id;
        break;
      }
      // 不合格は公開せず needs_review に退避（キューから外す）
      await env.DB.prepare(
        `UPDATE posts SET status='needs_review', updated_at=datetime('now','+9 hours')
         WHERE id=?1 AND status='draft'`
      ).bind(post.id).run();
      held.push({ id: post.id, issues });
    }

    if (publishedId !== null) {
      // 新記事とホーム（lastmod更新）をIndexNowへ通知
      await notifyIndexNow([`${SITE}/share/it/${publishedId}`, `${SITE}/`]);
    }

    const remaining = await env.DB.prepare(
      `SELECT COUNT(*) AS c FROM posts WHERE status='draft' AND primary_category='it'`
    ).first<{ c: number }>();
    const queueRemaining = remaining?.c ?? 0;

    // 構造化された点検ログ（published / held+理由 / 残キュー / 補充要否）
    console.log(
      "autopublish " +
        JSON.stringify({
          published: publishedId,
          held_for_review: held,
          queue_remaining: queueRemaining,
          queue_low: queueRemaining < 2,
        })
    );
  },

  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 旧WP URLの301（末尾スラッシュ正規化より先に処理して1ホップで確定させる）
    const legacy = matchLegacyRedirect(url.pathname);
    if (legacy) {
      return Response.redirect(`${SITE}${legacy}`, 301);
    }

    // 末尾スラッシュURLの200応答は重複URLを生むため、正規形へ301で寄せる
    // （ルート / と静的アセットは除外）
    if (
      url.pathname.length > 1 &&
      url.pathname.endsWith("/") &&
      !url.pathname.startsWith("/assets/") &&
      !url.pathname.startsWith("/uploads/")
    ) {
      url.pathname = url.pathname.replace(/\/+$/, "");
      return Response.redirect(url.toString(), 301);
    }

    const response = await requestHandler(request, {
      cloudflare: { env, ctx },
    });

    // Immutable cache for hashed static assets, uploaded images, and self-hosted
    // fonts（/fonts/*.woff2 は content-hash 付きファイル名なので immutable で安全）
    if (
      url.pathname.startsWith("/assets/") ||
      url.pathname.startsWith("/uploads/") ||
      url.pathname.startsWith("/fonts/")
    ) {
      response.headers.set(
        "Cache-Control",
        "public, max-age=31536000, immutable"
      );
    }

    // Ensure charset on HTML responses
    const contentType = response.headers.get("Content-Type");
    if (contentType && contentType.includes("text/html") && !contentType.includes("charset")) {
      response.headers.set("Content-Type", "text/html; charset=utf-8");
    }

    // Security headers
    response.headers.set("X-Content-Type-Options", "nosniff");
    response.headers.set("X-Frame-Options", "DENY");
    response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload"
    );
    response.headers.set(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=()"
    );
    response.headers.set(
      "Content-Security-Policy",
      // フォントをセルフホスト化したため font-src/style-src の Google ホストを撤廃（self のみ）
      "default-src 'self'; script-src 'self' 'unsafe-inline' https://analytics.ahrefs.com; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' https: data:; connect-src 'self' https://analytics.ahrefs.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests"
    );

    return response;
  },
} satisfies ExportedHandler<Env>;

/**
 * IT下書きの自動公開ゲート（コンテンツベースの決定的チェック・LLM不要）。
 * 合格 = 空配列。1つでも問題があれば理由コードの配列を返し、公開を保留する。
 * しきい値は SEO監査の品質基準（薄さ・構造・出典/著者・プレースホルダ）に対応。
 */
function qualityGate(post: {
  title: string | null;
  content: string | null;
  excerpt: string | null;
  voicy_url: string | null;
  spotify_url: string | null;
  source_url: string | null;
  author_id: string | null;
}): string[] {
  const issues: string[] = [];
  const html = post.content ?? "";
  const text = html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();

  if (text.length < 1800) issues.push("content_too_short");
  if (!/<h2[\s>]/i.test(html)) issues.push("no_h2_structure");
  if (/<h1[\s>]/i.test(html)) issues.push("has_h1");
  if (!(post.excerpt ?? "").trim()) issues.push("no_excerpt");

  const tl = (post.title ?? "").trim().length;
  if (tl < 10 || tl > 70) issues.push("title_length_out_of_range");

  // 出典(原典/音声)か著者のいずれか＝来歴が無い記事は自動公開しない
  if (!post.voicy_url && !post.spotify_url && !post.source_url && !post.author_id) {
    issues.push("no_provenance");
  }

  // 生成途中の痕跡・プレースホルダ・壊れたJSON-LDが残っていないか
  if (/INVALID_JSON|<!--\s*(TITLE|EXCERPT)|\bTODO\b|\bFIXME\b|ここに(タイトル|本文|テキスト)/i.test(html)) {
    issues.push("placeholder_or_template_markers");
  }

  return issues;
}
