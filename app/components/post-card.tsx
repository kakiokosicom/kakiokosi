import { Link } from "react-router";
import type { Post } from "~/lib/db.server";

const CATEGORY_LABELS: Record<string, string> = {
  business: "Business",
  politics: "Politics",
  society: "Society",
  world: "Foreign",
  it: "IT",
  entertainment: "Entertainment",
};

export function PostCard({ post, featured }: { post: Post; featured?: boolean }) {
  const date = post.published_at
    ? new Date(post.published_at).toLocaleDateString("ja-JP")
    : "";
  const categoryLabel = CATEGORY_LABELS[post.primary_category] ?? post.primary_category;

  if (featured) {
    return (
      <article className="group cursor-pointer pb-16 mb-4">
        <Link
          to={`/share/${post.primary_category}/${post.id}`}
          className="block no-underline"
        >
          <div className="flex flex-col lg:flex-row gap-10">
            {post.thumbnail_url && (
              <div className="lg:w-3/5 overflow-hidden aspect-[16/9] bg-surface-container-high">
                <img
                  src={post.thumbnail_url}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
              </div>
            )}
            <div className={`${post.thumbnail_url ? "lg:w-2/5" : ""} flex flex-col justify-center`}>
              <div className="flex items-center gap-4 mb-4">
                <span className="font-label text-xs font-bold text-secondary tracking-widest uppercase">
                  {categoryLabel}
                </span>
                <span className="text-xs text-on-surface-variant">{date}</span>
              </div>
              <h2 className="font-serif text-2xl md:text-3xl font-bold leading-tight mb-4 text-primary group-hover:text-secondary transition-colors">
                {post.title}
              </h2>
              {post.excerpt && (
                <p className="text-on-surface-variant text-base leading-relaxed line-clamp-3 mb-8">
                  {post.excerpt}
                </p>
              )}
              <span className="text-xs font-bold text-primary flex items-center gap-2">
                READ THE TRANSCRIPT
                <span className="h-[1px] w-8 bg-secondary group-hover:w-12 transition-all" />
              </span>
            </div>
          </div>
        </Link>
      </article>
    );
  }

  return (
    <article className="group cursor-pointer">
      <Link
        to={`/share/${post.primary_category}/${post.id}`}
        className="block no-underline"
      >
        {post.thumbnail_url && (
          <div className="aspect-[16/10] mb-6 overflow-hidden bg-surface-container-high">
            <img
              src={post.thumbnail_url}
              alt={post.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              loading="lazy"
            />
          </div>
        )}
        <div className="flex items-center gap-4 mb-3">
          <span className="font-label text-[10px] font-bold text-secondary tracking-widest uppercase">
            {categoryLabel}
          </span>
          <span className="text-[10px] text-on-surface-variant">{date}</span>
        </div>
        <h3 className="font-serif text-xl font-bold leading-snug mb-3 text-primary group-hover:text-secondary transition-colors">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="text-on-surface-variant text-sm leading-relaxed line-clamp-2">
            {post.excerpt}
          </p>
        )}
      </Link>
    </article>
  );
}
