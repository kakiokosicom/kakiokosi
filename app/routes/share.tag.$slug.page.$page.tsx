import { data } from "react-router";
import type { Route } from "./+types/share.tag.$slug.page.$page";
import { getPostsByTag, POSTS_PER_PAGE } from "~/lib/db.server";
import { PostCard } from "~/components/post-card";
import { Pagination } from "~/components/pagination";
import { JsonLd } from "~/components/json-ld";
import { collectionPageSchema } from "~/lib/schema";

/**
 * Paginated tag pages (page 2+).
 *
 * Previously missing: the tag index (`share.tag.$slug.tsx`) renders a
 * <Pagination> whose page-2+ links pointed at `/share/tag/:slug/page/:page`,
 * but no such route existed — every "next"/page link 404'd (Ahrefs 2026-05
 * flagged `/share/tag/書き起こし/page/2` etc.). This mirrors the category
 * paginated route so those follow-links resolve.
 *
 * Like the tag index and category pagination, these are `noindex, follow`:
 * no page-specific unique content, but the internal-link signal to the listed
 * posts is preserved.
 */
export async function loader({ params, context }: Route.LoaderArgs) {
  const db = context.cloudflare.env.DB;
  const page = parseInt(params.page, 10);
  if (isNaN(page) || page < 2) {
    // page 1 lives at /share/tag/:slug — don't duplicate it here
    throw data("ページが見つかりません", { status: 404 });
  }
  const { posts, total, tag } = await getPostsByTag(db, params.slug, page);
  if (!tag) {
    throw data("タグが見つかりません", { status: 404 });
  }
  if (posts.length === 0) {
    // Out-of-range page — avoid emitting empty, crawlable pages
    throw data("このページの記事はありません", { status: 404 });
  }
  return {
    posts,
    total,
    totalPages: Math.ceil(total / POSTS_PER_PAGE),
    tag,
    currentPage: page,
  };
}

export function meta({ data: loaderData }: Route.MetaArgs) {
  const name = loaderData?.tag?.name ?? "";
  const slug = loaderData?.tag?.slug ?? "";
  const page = loaderData?.currentPage ?? 1;
  const description = `「${name}」に関する書き起こし記事一覧（${page}ページ目）`;
  const url = `https://kakiokosi.com/share/tag/${slug}/page/${page}`;
  return [
    { title: `${name}の書き起こし記事一覧 - ${page}ページ目 | 書き起こし.com` },
    { name: "description", content: description },
    { tagName: "link", rel: "canonical", href: url },
    { name: "robots", content: "noindex, follow" },
    { property: "og:title", content: `${name} - ${page}ページ目 | 書き起こし.com` },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: url },
    { property: "og:site_name", content: "書き起こし.com" },
    { property: "og:locale", content: "ja_JP" },
    { property: "og:image", content: "https://kakiokosi.com/images/default-og.png" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: `${name} - ${page}ページ目 | 書き起こし.com` },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: "https://kakiokosi.com/images/default-og.png" },
  ];
}

export default function TagPagePaginated({ loaderData }: Route.ComponentProps) {
  const { posts, totalPages, tag, currentPage, total } = loaderData;

  return (
    <section className="max-w-5xl mx-auto">
      <JsonLd data={collectionPageSchema({
        name: `${tag.name}の書き起こし記事一覧 - ${currentPage}ページ目`,
        description: `「${tag.name}」に関する書き起こし記事${total}件を掲載`,
        url: `https://kakiokosi.com/share/tag/${tag.slug}/page/${currentPage}`,
        numberOfItems: total,
      })} />
      <header className="mb-16">
        <div className="inline-block bg-secondary-container px-3 py-1 text-[10px] font-bold tracking-[0.2em] text-on-secondary-container mb-4 uppercase">
          タグ
        </div>
        <h1 className="font-serif text-5xl md:text-7xl font-black text-primary tracking-tight">
          {tag.name}
        </h1>
        <span className="inline-block mt-2 font-label text-sm text-on-surface-variant">
          {currentPage}ページ目
        </span>
        <div className="h-1 w-24 academic-gradient mt-6" />
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        baseUrl={`/share/tag/${tag.slug}`}
      />
    </section>
  );
}
