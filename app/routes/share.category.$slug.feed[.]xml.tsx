import type { Route } from "./+types/share.category.$slug.feed[.]xml";
import { getPostsByCategory } from "~/lib/db.server";

export async function loader({ params, context }: Route.LoaderArgs) {
  const db = context.cloudflare.env.DB;
  const { posts, category } = await getPostsByCategory(db, params.slug, 1);
  const baseUrl = "https://kakiokosi.com";

  if (!category) {
    return new Response("Not Found", { status: 404 });
  }

  const items = posts.map((post) => {
    const pubDate = post.published_at
      ? new Date(post.published_at + "Z").toUTCString()
      : "";
    const excerpt = (post.excerpt || post.title).replace(/[<>&]/g, (c) =>
      c === "<" ? "&lt;" : c === ">" ? "&gt;" : "&amp;"
    );
    return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${baseUrl}/share/${post.primary_category}/${post.id}</link>
      <guid isPermaLink="true">${baseUrl}/share/${post.primary_category}/${post.id}</guid>
      <description>${excerpt}</description>
      <pubDate>${pubDate}</pubDate>
    </item>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(category.name)} | 書き起こし.com</title>
    <link>${baseUrl}/share/category/${category.slug}</link>
    <description>${escapeXml(category.name)}カテゴリの書き起こし記事</description>
    <language>ja</language>
    <atom:link href="${baseUrl}/share/category/${category.slug}/feed.xml" rel="self" type="application/rss+xml"/>
${items.join("\n")}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
