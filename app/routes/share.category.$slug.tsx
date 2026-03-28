import { data } from "react-router";
import type { Route } from "./+types/share.category.$slug";
import { getPostsByCategory, POSTS_PER_PAGE } from "~/lib/db.server";
import { PostCard } from "~/components/post-card";
import { Pagination } from "~/components/pagination";
import { JsonLd } from "~/components/json-ld";
import { collectionPageSchema } from "~/lib/schema";

const CATEGORY_LABELS: Record<string, string> = {
  business: "ビジネス",
  politics: "政治",
  society: "社会",
  world: "海外",
  it: "IT",
  entertainment: "エンターテイメント",
};

const CATEGORY_LABELS_EN: Record<string, string> = {
  business: "Business",
  politics: "Politics",
  society: "Society",
  world: "Foreign",
  it: "IT",
  entertainment: "Entertainment",
};

const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  business: "経営者の講演、スタートアップのピッチ、TED Talksのビジネス系プレゼンテーションなど、ビジネスに関する書き起こし記事をまとめています。",
  politics: "政治家の記者会見、国会答弁、政策発表など、政治に関する発言の書き起こし記事をまとめています。",
  society: "社会問題に関する講演、TED Talks、記者会見など、社会をテーマにした書き起こし記事をまとめています。",
  world: "海外の著名人によるスピーチ、国際会議での発言、海外メディアのインタビューなどの書き起こし記事をまとめています。",
  it: "テクノロジー企業のプレゼンテーション、IT業界のカンファレンス、技術者の講演などの書き起こし記事をまとめています。",
  entertainment: "芸能人の記者会見、アーティストのインタビュー、エンターテイメント業界に関する書き起こし記事をまとめています。",
};

export async function loader({ params, context }: Route.LoaderArgs) {
  const db = context.cloudflare.env.DB;
  const { posts, total, category } = await getPostsByCategory(db, params.slug, 1);
  if (!category) {
    throw data("カテゴリが見つかりません", { status: 404 });
  }
  return {
    posts,
    total,
    totalPages: Math.ceil(total / POSTS_PER_PAGE),
    category,
    currentPage: 1,
  };
}

export function meta({ data: loaderData }: Route.MetaArgs) {
  const name = loaderData?.category?.name ?? "";
  const slug = loaderData?.category?.slug ?? "";
  const description = `${name}カテゴリの書き起こし記事一覧 — 講演・インタビュー・スピーチのテキスト`;
  const url = `https://kakiokosi.com/share/category/${slug}`;
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

export default function CategoryPage({ loaderData }: Route.ComponentProps) {
  const { posts, totalPages, category, currentPage } = loaderData;
  const label = CATEGORY_LABELS[category.slug] ?? category.name;
  const labelEn = CATEGORY_LABELS_EN[category.slug] ?? category.name;
  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <section className="max-w-5xl mx-auto">
      <JsonLd data={collectionPageSchema({
        name: `${label}の書き起こし記事一覧`,
        description: CATEGORY_DESCRIPTIONS[category.slug] || `${label}カテゴリの書き起こし記事一覧`,
        url: `https://kakiokosi.com/share/category/${category.slug}`,
        numberOfItems: loaderData.total,
      })} />
      <header className="mb-16">
        <div className="inline-block bg-secondary-container px-3 py-1 text-[10px] font-bold tracking-[0.2em] text-on-secondary-container mb-4 uppercase">
          カテゴリ
        </div>
        <h1 className="font-serif text-5xl md:text-7xl font-black text-primary tracking-tight">
          {label}
        </h1>
        <p className="font-label text-sm text-on-surface-variant mt-2">{labelEn}</p>
        <div className="h-1 w-24 academic-gradient mt-6" />
        {CATEGORY_DESCRIPTIONS[category.slug] && (
          <p className="mt-6 text-on-surface-variant leading-relaxed max-w-2xl">
            {CATEGORY_DESCRIPTIONS[category.slug]}
          </p>
        )}
      </header>

      {featured && <PostCard post={featured} featured />}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-16">
        {rest.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {posts.length === 0 && (
        <p className="text-on-surface-variant py-16 text-center text-lg">
          このカテゴリにはまだ記事がありません。
        </p>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        baseUrl={`/share/category/${category.slug}`}
      />
    </section>
  );
}
