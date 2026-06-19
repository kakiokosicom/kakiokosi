import type { Route } from "./+types/sitemap[.]xml";

export async function loader({ context }: Route.LoaderArgs) {
  const db = context.cloudflare.env.DB;
  const baseUrl = "https://kakiokosi.com";

  const [posts, pages, categories] = await Promise.all([
    db
      .prepare(
        // noindex 投稿（派生・断片の逐語転載, migration 0024）は混合シグナル回避のため除外
        `SELECT id, primary_category, published_at, updated_at FROM posts WHERE status = 'published' AND noindex = 0 ORDER BY published_at DESC`
      )
      .all<{ id: number; primary_category: string; published_at: string; updated_at: string }>(),
    db
      .prepare(`SELECT slug, updated_at FROM pages`)
      .all<{ slug: string; updated_at: string }>(),
    db
      .prepare(
        `SELECT c.slug, MAX(COALESCE(p.updated_at, p.published_at)) as lastmod
         FROM categories c
         JOIN post_categories pc ON pc.category_slug = c.slug
         JOIN posts p ON p.id = pc.post_id AND p.status = 'published'
         GROUP BY c.slug
         HAVING COUNT(pc.post_id) >= 1`
      )
      .all<{ slug: string; lastmod: string | null }>(),
  ]);

  const urls: string[] = [];

  // Top page — 最新の「更新」日を反映（published_at DESC 順なので results[0] は
  // 最新公開記事であり最新更新記事とは限らない。全記事の MAX(updated_at) を取る）
  const topLastmod = posts.results.reduce<string>((max, p) => {
    const m = p.updated_at || p.published_at || "";
    return m > max ? m : max;
  }, "");
  urls.push(entry(baseUrl, "/", topLastmod || null));

  // Article pages
  for (const post of posts.results) {
    const lastmod = post.updated_at || post.published_at;
    urls.push(entry(baseUrl, `/share/${post.primary_category}/${post.id}`, lastmod));
  }

  // Category pages
  for (const cat of categories.results) {
    urls.push(entry(baseUrl, `/share/category/${cat.slug}`, cat.lastmod ?? null));
  }

  // Tag pages are noindex'd site-wide (see share.tag.$slug.tsx) and excluded
  // from the sitemap to avoid sending mixed signals to crawlers.

  // Static pages (exclude login/regist/update/preparation/complete_regist)
  const publicPages = new Set([
    "about", "tos", "privacy", "regal", "company", "contact",
    "technique", "tapeokoshi", "jirei", "nagare", "omitsumori", "point", "webmeeting",
    "kakiokoshi-toha", "mojikoshi-tool", "gijiroku", "meispeech",
    "interview-kakiokoshi", "ted-talks", "mojikoshi-fukugyo", "presentation",
    "kigyoka-meigen", "ai-hatarakikata", "seijika-enzetsu",
  ]);
  for (const page of pages.results) {
    if (publicPages.has(page.slug)) {
      urls.push(entry(baseUrl, `/share/${page.slug}`, page.updated_at));
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

function entry(
  base: string,
  path: string,
  lastmod: string | null
): string {
  const encodedPath = path
    .split("/")
    .map((segment) => encodeURIComponent(decodeURIComponent(segment)))
    .join("/");
  const lastmodTag = lastmod
    ? `\n    <lastmod>${lastmod.substring(0, 10)}</lastmod>`
    : "";
  return `  <url>
    <loc>${base}${encodedPath}</loc>${lastmodTag}
  </url>`;
}
