import type { Route } from "./+types/share._index";
import { getPublishedPosts, POSTS_PER_PAGE } from "~/lib/db.server";
import { PostCard } from "~/components/post-card";

export function meta() {
  return [
    { title: "書き起こし.com" },
    { name: "description", content: "講演・インタビュー・スピーチの書き起こし記事を共有するサイト" },
  ];
}

export async function loader({ context }: Route.LoaderArgs) {
  const db = context.cloudflare.env.DB;
  const { posts, total } = await getPublishedPosts(db, 1);
  return { posts, total, totalPages: Math.ceil(total / POSTS_PER_PAGE) };
}

export default function ShareIndex({ loaderData }: Route.ComponentProps) {
  const { posts } = loaderData;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">新着記事</h1>
      <div>
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
      {posts.length === 0 && (
        <p className="text-gray-500 py-8 text-center">記事がまだありません。</p>
      )}
    </div>
  );
}
