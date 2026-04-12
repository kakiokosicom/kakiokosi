import { data } from "react-router";
import type { Route } from "./+types/share.tag.$slug";
import { getPostsByTag, POSTS_PER_PAGE } from "~/lib/db.server";
import { PostCard } from "~/components/post-card";
import { Pagination } from "~/components/pagination";
import { JsonLd } from "~/components/json-ld";
import { collectionPageSchema } from "~/lib/schema";

/** Minimum number of articles for a tag page to be indexed by search engines. */
const MIN_ARTICLES_FOR_INDEX = 5;

export async function loader({ params, context }: Route.LoaderArgs) {
  const db = context.cloudflare.env.DB;
  const { posts, total, tag } = await getPostsByTag(db, params.slug, 1);
  if (!tag) {
    throw data("タグが見つかりません", { status: 404 });
  }
  if (total === 0) {
    throw data("このタグの記事はまだありません", { status: 404 });
  }
  return {
    posts,
    total,
    totalPages: Math.ceil(total / POSTS_PER_PAGE),
    tag,
    currentPage: 1,
    shouldIndex: total >= MIN_ARTICLES_FOR_INDEX,
  };
}

export function meta({ data: loaderData }: Route.MetaArgs) {
  const name = loaderData?.tag?.name ?? "";
  const slug = loaderData?.tag?.slug ?? "";
  const total = loaderData?.total ?? 0;
  const shouldIndex = loaderData?.shouldIndex ?? false;
  const description = `「${name}」に関する書き起こし記事${total}件を掲載。講演・インタビュー・スピーチを正確にテキスト化し、検索・引用しやすい形でアーカイブしています。`;
  const url = `https://kakiokosi.com/share/tag/${slug}`;
  return [
    { title: `${name}の書き起こし記事一覧（${total}件） | 書き起こし.com` },
    { name: "description", content: description },
    { tagName: "link", rel: "canonical", href: url },
    ...(!shouldIndex
      ? [{ name: "robots", content: "noindex, follow" }]
      : []),
    { property: "og:title", content: `${name} | 書き起こし.com` },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: url },
    { property: "og:site_name", content: "書き起こし.com" },
    { property: "og:locale", content: "ja_JP" },
    { property: "og:image", content: "https://kakiokosi.com/images/default-og.png" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: `${name} | 書き起こし.com` },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: "https://kakiokosi.com/images/default-og.png" },
  ];
}

export default function TagPage({ loaderData }: Route.ComponentProps) {
  const { posts, totalPages, tag, currentPage, total } = loaderData;

  return (
    <section className="max-w-5xl mx-auto">
      <JsonLd data={collectionPageSchema({
        name: `${tag.name}の書き起こし記事一覧`,
        description: `「${tag.name}」に関する書き起こし記事${total}件を掲載`,
        url: `https://kakiokosi.com/share/tag/${tag.slug}`,
        numberOfItems: total,
      })} />
      <header className="mb-16">
        <div className="inline-block bg-secondary-container px-3 py-1 text-[10px] font-bold tracking-[0.2em] text-on-secondary-container mb-4 uppercase">
          タグ
        </div>
        <h1 className="font-serif text-5xl md:text-7xl font-black text-primary tracking-tight">
          {tag.name}
        </h1>
        <p className="mt-6 text-on-surface-variant text-base md:text-lg leading-relaxed max-w-2xl">
          「{tag.name}」に関連する講演・インタビュー・スピーチの書き起こし記事を
          {total}件掲載しています。話し手の言葉をそのままテキスト化し、
          検索・引用しやすい形でアーカイブしています。
        </p>
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
