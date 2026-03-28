import { data } from "react-router";
import type { Route } from "./+types/share.category.$slug";
import { getPostsByCategory, POSTS_PER_PAGE } from "~/lib/db.server";
import { PostCard } from "~/components/post-card";
import { Pagination } from "~/components/pagination";

const CATEGORY_LABELS: Record<string, string> = {
  business: "ビジネス",
  politics: "政治",
  society: "社会",
  world: "海外",
  it: "IT",
  entertainment: "��ンターテイメント",
};

const CATEGORY_LABELS_EN: Record<string, string> = {
  business: "Business",
  politics: "Politics",
  society: "Society",
  world: "Foreign",
  it: "IT",
  entertainment: "Entertainment",
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
  const description = `${name}カテゴリの書き起こ��記事一覧 — 講演・インタビュー・スピーチのテキスト`;
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
      <header className="mb-16">
        <div className="inline-block bg-secondary-container px-3 py-1 text-[10px] font-bold tracking-[0.2em] text-on-secondary-container mb-4 uppercase">
          Archive / Category
        </div>
        <h1 className="font-serif text-5xl md:text-7xl font-black text-primary tracking-tight">
          {label}
        </h1>
        <p className="font-label text-sm text-on-surface-variant mt-2">{labelEn}</p>
        <div className="h-1 w-24 academic-gradient mt-6" />
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
