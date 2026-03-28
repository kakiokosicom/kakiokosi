import { Link } from "react-router";
import type { Route } from "./+types/share._index";
import { getPublishedPosts, POSTS_PER_PAGE } from "~/lib/db.server";
import { PostCard } from "~/components/post-card";
import { Pagination } from "~/components/pagination";

export function meta() {
  return [
    { title: "書き起こし.com" },
    {
      name: "description",
      content:
        "講演・インタビュー・スピーチの書き起こし記事を共有するサイト",
    },
  ];
}

export async function loader({ context }: Route.LoaderArgs) {
  const db = context.cloudflare.env.DB;
  const { posts, total } = await getPublishedPosts(db, 1);
  return { posts, total, totalPages: Math.ceil(total / POSTS_PER_PAGE) };
}

export default function ShareIndex({ loaderData }: Route.ComponentProps) {
  const { posts, totalPages } = loaderData;
  const featured = posts[0];
  const rest = posts.slice(1);

  return (
    <section className="max-w-5xl mx-auto">
      <header className="mb-16">
        <div className="inline-block bg-secondary-container px-3 py-1 text-[10px] font-bold tracking-[0.2em] text-on-secondary-container mb-4 uppercase">
          Latest Transcripts
        </div>
        <h1 className="font-serif text-5xl md:text-7xl font-black text-primary tracking-tight">
          Archives
        </h1>
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
          記事がまだありません。
        </p>
      )}

      <Pagination currentPage={1} totalPages={totalPages} baseUrl="/share" />
    </section>
  );
}
