import type { Route } from "./+types/sitemap[.]xml";

export async function loader({ context }: Route.LoaderArgs) {
  const db = context.cloudflare.env.DB;
  const baseUrl = "https://kakiokosi.com";

  const [posts, pages, categories] = await Promise.all([
    db
      .prepare(
        `SELECT id, primary_category, published_at, updated_at FROM posts WHERE status = 'published' ORDER BY published_at DESC`
      )
      .all<{ id: number; primary_category: string; published_at: string; updated_at: string }>(),
    db
      .prepare(`SELECT slug, updated_at FROM pages`)
      .all<{ slug: string; updated_at: string }>(),
    db
      .prepare(`SELECT slug FROM categories`)
      .all<{ slug: string }>(),
  ]);

  const urls: string[] = [];

  // Top page
  urls.push(entry(baseUrl, "/share", posts.results[0]?.published_at, "daily", "1.0"));

  // Article pages
  for (const post of posts.results) {
    const lastmod = post.updated_at || post.published_at;
    urls.push(
      entry(baseUrl, `/share/${post.primary_category}/${post.id}`, lastmod, "monthly", "0.8")
    );
  }

  // Category pages
  for (const cat of categories.results) {
    urls.push(entry(baseUrl, `/share/category/${cat.slug}`, null, "weekly", "0.6"));
  }

  // Static pages (exclude login/regist/update/preparation/complete_regist)
  const publicPages = new Set([
    "about", "tos", "privacy", "regal", "company", "contact",
    "technique", "tapeokoshi", "jirei", "nagare", "omitsumori", "point", "webmeeting",
  ]);
  for (const page of pages.results) {
    if (publicPages.has(page.slug)) {
      urls.push(entry(baseUrl, `/share/${page.slug}`, page.updated_at, "monthly", "0.5"));
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
  lastmod: string | null,
  changefreq: string,
  priority: string
): string {
  const lastmodTag = lastmod
    ? `\n    <lastmod>${lastmod.substring(0, 10)}</lastmod>`
    : "";
  return `  <url>
    <loc>${base}${path}</loc>${lastmodTag}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}
