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

export default {
  /**
   * Scheduled handler — publishes the oldest IT draft post.
   * Cron schedule: every 3 days at 09:00 JST (00:00 UTC).
   */
  async scheduled(_event, env, _ctx) {
    const result = await env.DB.prepare(
      `UPDATE posts SET status = 'published',
       published_at = datetime('now', '+9 hours'),
       updated_at = datetime('now', '+9 hours')
       WHERE id = (
         SELECT id FROM posts
         WHERE status = 'draft' AND primary_category = 'it'
         ORDER BY id ASC LIMIT 1
       )`
    ).run();
    console.log(`Auto-publish IT draft: changes=${result.meta.changes}`);
  },

  async fetch(request, env, ctx) {
    const url = new URL(request.url);

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
