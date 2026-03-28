import { data } from "react-router";
import type { Route } from "./+types/share.tag.$slug";
import { getPostsByTag, POSTS_PER_PAGE } from "~/lib/db.server";
import { PostCard } from "~/components/post-card";
import { Pagination } from "~/components/pagination";
import { JsonLd } from "~/components/json-ld";
import { collectionPageSchema } from "~/lib/schema";

export async function loader({ params, context }: Route.LoaderArgs) {
  const db = context.cloudflare.env.DB;
  const { posts, total, tag } = await getPostsByTag(db, params.slug, 1);
  if (!tag) {
    throw data("タグが見つかりません", { status: 404 });
  }
  return {
    posts,
    total,
    totalPages: Math.ceil(total / POSTS_PER_PAGE),
    tag,
    currentPage: 1,
  };
}

export function meta({ data: loaderData }: Route.MetaArgs) {
  const name = loaderData?.tag?.name ?? "";
  const slug = loaderData?.tag?.slug ?? "";
  const description = `「${name}」タグの書き���こし記事一覧 — 講演・インタビュー・スピーチのテキスト`;
  const url = `https://kakiokosi.com/share/tag/${slug}`;
  return [
    { title: `${name}の書き起こし記事一覧 | 書き起こし.com` },
    { name: "description", content: description },
    { tagName: "link", rel: "canonical", href: url },
    { property: "og:title", content: `${name} | 書き起こし.com` },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: url },
    { property: "og:site_name", content: "書き起こし.com" },
    { property: "og:locale", content: "ja_JP" },
    { name: "twitter:card", content: "summary" },
    { name: "twitter:title", content: `${name} | 書き起こし.com` },
    { name: "twitter:description", content: description },
  ];
}

export default function TagPage({ loaderData }: Route.ComponentProps) {
  const { posts, totalPages, tag, currentPage } = loaderData;

  return (
    <section className="max-w-5xl mx-auto">
      <JsonLd data={collectionPageSchema({
        name: `${tag.name}の書き起こし記事一覧`,
        description: `「${tag.name}」タグの書き起こし記事一覧`,
        url: `https://kakiokosi.com/share/tag/${tag.slug}`,
        numberOfItems: loaderData.total,
      })} />
      <header className="mb-16">
        <div className="inline-block bg-secondary-container px-3 py-1 text-[10px] font-bold tracking-[0.2em] text-on-secondary-container mb-4 uppercase">
          タグ
        </div>
        <h1 className="font-serif text-5xl md:text-7xl font-black text-primary tracking-tight">
          {tag.name}
        </h1>
        <div className="h-1 w-24 academic-gradient mt-6" />
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {posts.length === 0 && (
        <p className="text-on-surface-variant py-16 text-center text-lg">
          このタグの記事はまだありません。
        </p>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        baseUrl={`/share/tag/${tag.slug}`}
      />
    </section>
  );
}
