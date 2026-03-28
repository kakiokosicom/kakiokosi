import { Link } from "react-router";
import type { Post } from "~/lib/db.server";

export function PostCard({ post }: { post: Post }) {
  const date = post.published_at
    ? new Date(post.published_at).toLocaleDateString("ja-JP")
    : "";

  return (
    <article className="border-b border-gray-100 py-6 last:border-0">
      <Link
        to={`/share/${post.primary_category}/${post.id}`}
        className="block no-underline group"
      >
        <div className="flex gap-4">
          {post.thumbnail_url && (
            <img
              src={post.thumbnail_url}
              alt=""
              className="w-32 h-20 object-cover rounded flex-shrink-0"
              loading="lazy"
            />
          )}
          <div className="min-w-0">
            <h2 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 line-clamp-2">
              {post.title}
            </h2>
            {post.excerpt && (
              <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                {post.excerpt}
              </p>
            )}
            <div className="mt-2 flex gap-3 text-xs text-gray-400">
              <span>{post.primary_category}</span>
              <time dateTime={post.published_at ?? ""}>{date}</time>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
