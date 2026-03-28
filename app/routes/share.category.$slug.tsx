import { data } from "react-router";
import type { Route } from "./+types/share.category.$slug";
import { getPostsByCategory, POSTS_PER_PAGE } from "~/lib/db.server";
import { PostCard } from "~/components/post-card";
import { Pagination } from "~/components/pagination";

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
  return [
    { title: `${name} | 書き起こし.com` },
    { name: "description", content: `${name}カテゴリの書き起こし記事一覧` },
  ];
}

export default function CategoryPage({ loaderData }: Route.ComponentProps) {
  const { posts, totalPages, category, currentPage } = loaderData;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{category.name}</h1>
      <div>
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
      {posts.length === 0 && (
        <p className="text-gray-500 py-8 text-center">このカテゴリにはまだ記事がありません。</p>
      )}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        baseUrl={`/share/category/${category.slug}`}
      />
    </div>
  );
}
