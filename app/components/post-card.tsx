import { Link } from "react-router";
import type { PostSummary } from "~/lib/db.server";
import { imageSrcSet, imageSrc } from "~/lib/image";

const CATEGORY_ICONS: Record<string, string> = {
  business: "💼",
  politics: "🏛️",
  society: "🌐",
  world: "✈️",
  it: "💻",
  entertainment: "🎭",
  economy: "💰",
  culture: "🎨",
  etc: "📝",
};

const CATEGORY_LABELS: Record<string, string> = {
  business: "ビジネス",
  politics: "政治",
  society: "社会",
  world: "海外",
  it: "IT",
  entertainment: "エンタメ",
  economy: "経済・マネー",
  culture: "カルチャー",
  etc: "その他",
};

function TextThumbnail({ title, category, size = "md" }: { title: string; category: string; size?: "lg" | "md" }) {
  const icon = CATEGORY_ICONS[category] || "📝";
  const label = CATEGORY_LABELS[category] ?? category;
  const isLg = size === "lg";
  return (
    <div className="w-full h-full academic-gradient flex flex-col justify-between p-6 md:p-8 relative overflow-hidden">
      <div className="absolute -right-8 -top-8 opacity-[0.07]">
        <span className={isLg ? "text-[10rem]" : "text-[8rem]"}>{icon}</span>
      </div>
      <span className={`font-label ${isLg ? "text-xs" : "text-[10px]"} tracking-[0.2em] text-secondary-container/80 uppercase`}>
        {label}
      </span>
      <p className={`font-serif ${isLg ? "text-xl md:text-2xl" : "text-base md:text-lg"} font-bold text-white/90 leading-snug ${isLg ? "line-clamp-4" : "line-clamp-3"}`}>
        {title}
      </p>
    </div>
  );
}

export function PostCard({ post, featured }: { post: PostSummary; featured?: boolean }) {
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
            <div className="lg:w-3/5 overflow-hidden aspect-[16/9] bg-surface-container-high">
              {post.thumbnail_url ? (
                <img
                  src={imageSrc(post.thumbnail_url, 640)}
                  srcSet={imageSrcSet(post.thumbnail_url, [320, 640, 960])}
                  sizes="(max-width: 768px) 100vw, 60vw"
                  alt={post.title}
                  width={640}
                  height={360}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="eager"
                  fetchPriority="high"
                />
              ) : (
                <TextThumbnail title={post.title} category={post.primary_category} size="lg" />
              )}
            </div>
            <div className="lg:w-2/5 flex flex-col justify-center">
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
                書き起こしを読む
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
        <div className="aspect-[16/10] mb-6 overflow-hidden bg-surface-container-high">
          {post.thumbnail_url ? (
            <img
              src={imageSrc(post.thumbnail_url, 400)}
              srcSet={imageSrcSet(post.thumbnail_url, [320, 400, 640])}
              sizes="(max-width: 768px) 100vw, 50vw"
              alt={post.title}
              width={400}
              height={250}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              loading="lazy"
            />
          ) : (
            <TextThumbnail title={post.title} category={post.primary_category} />
          )}
        </div>
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
