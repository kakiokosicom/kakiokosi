import { data } from "react-router";
import type { Route } from "./+types/share.category.$slug.page.$page";
import { getPostsByCategory, POSTS_PER_PAGE } from "~/lib/db.server";
import { PostCard } from "~/components/post-card";
import { Pagination } from "~/components/pagination";

const CATEGORY_LABELS: Record<string, string> = {
  business: "Business",
  politics: "Politics",
  society: "Society",
  world: "Foreign",
  it: "IT",
  entertainment: "Entertainment",
};

export async function loader({ params, context }: Route.LoaderArgs) {
  const db = context.cloudflare.env.DB;
  const page = parseInt(params.page, 10);
  if (isNaN(page) || page < 1) {
    throw data("ページが見つかりません", { status: 404 });
  }
  const { posts, total, category } = await getPostsByCategory(db, params.slug, page);
  if (!category) {
    throw data("カテゴリが見つかりません", { status: 404 });
  }
  return {
    posts,
    total,
    totalPages: Math.ceil(total / POSTS_PER_PAGE),
    category,
    currentPage: page,
  };
}

export function meta({ data: loaderData }: Route.MetaArgs) {
  const name = loaderData?.category?.name ?? "";
  const page = loaderData?.currentPage ?? 1;
  return [{ title: `${name} - ${page}ページ目 | 書き起こし.com` }];
}

export default function CategoryPagePaginated({ loaderData }: Route.ComponentProps) {
  const { posts, totalPages, category, currentPage } = loaderData;
  const label = CATEGORY_LABELS[category.slug] ?? category.name;

  return (
    <section className="max-w-5xl mx-auto">
      <header className="mb-16">
        <div className="inline-block bg-secondary-container px-3 py-1 text-[10px] font-bold tracking-[0.2em] text-on-secondary-container mb-4 uppercase">
          Archive / Category
        </div>
        <h1 className="font-serif text-5xl md:text-7xl font-black text-primary tracking-tight">
          {label}
        </h1>
        <span className="inline-block mt-2 font-label text-sm text-on-surface-variant">
          Page {currentPage}
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
        baseUrl={`/share/category/${category.slug}`}
      />
    </section>
  );
}
