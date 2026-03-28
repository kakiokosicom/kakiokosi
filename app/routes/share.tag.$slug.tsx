import { data } from "react-router";
import type { Route } from "./+types/share.tag.$slug";
import { getPostsByTag, POSTS_PER_PAGE } from "~/lib/db.server";
import { PostCard } from "~/components/post-card";
import { Pagination } from "~/components/pagination";

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
  return [
    { title: `${name} | 書き起こし.com` },
    { name: "description", content: `「${name}」タグの書き起こし記事一覧` },
  ];
}

export default function TagPage({ loaderData }: Route.ComponentProps) {
  const { posts, totalPages, tag, currentPage } = loaderData;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        タグ: {tag.name}
      </h1>
      <div>
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
      {posts.length === 0 && (
        <p className="text-gray-500 py-8 text-center">このタグの記事はまだありません。</p>
      )}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        baseUrl={`/share/tag/${tag.slug}`}
      />
    </div>
  );
}
