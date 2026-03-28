import { data } from "react-router";
import type { Route } from "./+types/share.category.$slug.page.$page";
import { getPostsByCategory, POSTS_PER_PAGE } from "~/lib/db.server";
import { PostCard } from "~/components/post-card";
import { Pagination } from "~/components/pagination";

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
  return [
    { title: `${name} - ${page}ページ目 | 書き起こし.com` },
  ];
}

export default function CategoryPagePaginated({ loaderData }: Route.ComponentProps) {
  const { posts, totalPages, category, currentPage } = loaderData;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        {category.name}
        <span className="text-base font-normal text-gray-400 ml-2">{currentPage}ページ目</span>
      </h1>
      <div>
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        baseUrl={`/share/category/${category.slug}`}
      />
    </div>
  );
}
