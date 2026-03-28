import { data, redirect, Link } from "react-router";
import type { Route } from "./+types/share.$category.$id";
import { getPost, getRelatedPosts } from "~/lib/db.server";
import type { Post, PostSummary } from "~/lib/db.server";
import { formatArticleContent } from "~/lib/format-content";
import { Icon } from "~/components/icon";
import { imageSrcSet, imageSrc } from "~/lib/image";
import { getAuthor, authorJsonLd } from "~/lib/authors";

/** Generate a meta description from article HTML content when no excerpt exists. */
function generateExcerpt(html: string, fallback: string): string {
  const text = html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length < 30) return fallback;
  // Find a good sentence boundary within 120-160 chars
  const target = text.substring(0, 160);
  const lastPeriod = target.lastIndexOf("。");
  if (lastPeriod > 60) return target.substring(0, lastPeriod + 1);
  const lastComma = target.lastIndexOf("、");
  if (lastComma > 80) return target.substring(0, lastComma);
  return target.substring(0, 140) + "…";
}

const CATEGORY_LABELS: Record<string, string> = {
  business: "ビジネス",
  politics: "政治",
  society: "社会",
  world: "海外",
  it: "IT",
  entertainment: "エンターテイメント",
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
  const id = parseInt(params.id, 10);
  if (isNaN(id)) {
    throw data("記事が見つかりません", { status: 404 });
  }

  const { post, categories, tags } = await getPost(db, id);
  if (!post) {
    throw data("記事が見つかりません", { status: 404 });
  }

  if (params.category !== post.primary_category) {
    return redirect(`/share/${post.primary_category}/${post.id}`, 301);
  }

  const relatedPosts = await getRelatedPosts(db, id, post.primary_category, 4);

  return { post, categories, tags, relatedPosts };
}

export function meta({ data: loaderData }: Route.MetaArgs) {
  if (!loaderData?.post) {
    return [{ title: "記事が見つかりません | 書き起こし.com" }];
  }
  const { post } = loaderData;
  const url = `https://kakiokosi.com/share/${post.primary_category}/${post.id}`;
  const description = post.excerpt || generateExcerpt(post.content, post.title);
  return [
    { title: `${post.title} | 書き起こし.com` },
    { name: "description", content: description },
    { tagName: "link", rel: "canonical", href: url },
    { property: "og:title", content: post.title },
    { property: "og:description", content: description },
    { property: "og:type", content: "article" },
    { property: "og:url", content: url },
    { property: "og:site_name", content: "書き起こし.com" },
    { property: "og:locale", content: "ja_JP" },
    { property: "og:image", content: post.thumbnail_url ? (post.thumbnail_url.startsWith("http") ? post.thumbnail_url : `https://kakiokosi.com${post.thumbnail_url}`) : "https://kakiokosi.com/images/default-og.png" },
    { name: "twitter:image", content: post.thumbnail_url ? (post.thumbnail_url.startsWith("http") ? post.thumbnail_url : `https://kakiokosi.com${post.thumbnail_url}`) : "https://kakiokosi.com/images/default-og.png" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: post.title },
    { name: "twitter:description", content: description },
    ...(post.published_at
      ? [{ property: "article:published_time", content: post.published_at.replace(" ", "T") + "+09:00" }]
      : []),
    ...((post.updated_at || post.published_at)
      ? [{ property: "article:modified_time", content: (post.updated_at || post.published_at)!.replace(" ", "T") + "+09:00" }]
      : []),
  ];
}

export default function ArticlePage({ loaderData }: Route.ComponentProps) {
  const { post, categories, tags, relatedPosts } = loaderData;
  const author = getAuthor(post.author_id);
  const date = post.published_at
    ? new Date(post.published_at).toLocaleDateString("ja-JP")
    : "";
  const updatedDate = post.updated_at
    ? new Date(post.updated_at).toLocaleDateString("ja-JP")
    : "";
  const showUpdated = updatedDate && updatedDate !== date;
  const categoryLabel =
    CATEGORY_LABELS[post.primary_category] ?? post.primary_category;
  const categoryLabelEn =
    CATEGORY_LABELS_EN[post.primary_category] ?? post.primary_category;

  const articleUrl = `https://kakiokosi.com/share/${post.primary_category}/${post.id}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: post.title,
        description: post.excerpt || post.title,
        url: articleUrl,
        datePublished: post.published_at ? post.published_at.replace(" ", "T") + "+09:00" : undefined,
        dateModified: (post.updated_at || post.published_at) ? (post.updated_at || post.published_at)!.replace(" ", "T") + "+09:00" : undefined,
        image: post.thumbnail_url
          ? { "@type": "ImageObject", url: post.thumbnail_url.startsWith("http") ? post.thumbnail_url : `https://kakiokosi.com${post.thumbnail_url}` }
          : { "@type": "ImageObject", url: "https://kakiokosi.com/images/default-og.png" },
        author: authorJsonLd(getAuthor(post.author_id)),
        publisher: {
          "@id": "https://kakiokosi.com/#organization",
        },
        inLanguage: "ja",
        ...(tags.length > 0
          ? { keywords: tags.map((t) => t.name).join(", ") }
          : {}),
        ...(categories.length > 0
          ? { articleSection: categories.map((c) => c.name).join(", ") }
          : {}),
        mainEntityOfPage: { "@type": "WebPage", "@id": articleUrl },
        speakable: {
          "@type": "SpeakableSpecification",
          cssSelector: [".article-content", "h1"],
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "ホーム", item: "https://kakiokosi.com/share" },
          { "@type": "ListItem", position: 2, name: categoryLabel, item: `https://kakiokosi.com/share/category/${post.primary_category}` },
          { "@type": "ListItem", position: 3, name: post.title },
        ],
      },
    ],
  };

  return (
    <div className="lg:flex gap-16 max-w-7xl mx-auto">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Article */}
      <article className="flex-1 max-w-3xl mx-auto lg:mx-0">
        {/* Breadcrumb */}
        <nav aria-label="パンくずリスト" className="mb-8 text-sm text-on-surface-variant">
          <ol className="flex items-center gap-2 list-none p-0 m-0">
            <li><Link to="/share" className="hover:text-secondary no-underline">ホーム</Link></li>
            <li className="before:content-['/'] before:mx-2 before:text-outline-variant">
              <Link to={`/share/category/${post.primary_category}`} className="hover:text-secondary no-underline">{categoryLabel}</Link>
            </li>
            <li className="before:content-['/'] before:mx-2 before:text-outline-variant text-on-surface truncate max-w-xs">
              {post.title}
            </li>
          </ol>
        </nav>

        <header className="mb-12">
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            <span className="font-label text-xs tracking-[0.2em] text-secondary font-bold">
              {categoryLabel}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-outline-variant/30" />
            <time
              className="font-label text-xs uppercase tracking-widest text-on-surface-variant/70"
              dateTime={post.published_at ?? ""}
            >
              {date}
            </time>
            {showUpdated && (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-outline-variant/30" />
                <time
                  className="font-label text-xs text-secondary/80"
                  dateTime={post.updated_at ?? ""}
                >
                  更新: {updatedDate}
                </time>
              </>
            )}
            <span className="w-1.5 h-1.5 rounded-full bg-outline-variant/30" />
            <span className="font-label text-xs text-on-surface-variant/70">
              文字起こし: {author.url.startsWith("https://kakiokosi.com") ? (
                <Link to={author.url.replace("https://kakiokosi.com", "")} className="text-secondary no-underline hover:underline">
                  {author.nickname ? `${author.name}（${author.nickname}）` : author.name}
                </Link>
              ) : (
                <a href={author.url} target="_blank" rel="noopener noreferrer" className="text-secondary no-underline hover:underline">
                  {author.nickname ? `${author.name}（${author.nickname}）` : author.name}
                </a>
              )}
            </span>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-primary leading-[1.15] font-black mb-8">
            {post.title}
          </h1>
          {post.thumbnail_url && (
            <div className="aspect-[16/9] w-full overflow-hidden rounded-xl bg-surface-container mb-12">
              <img
                src={imageSrc(post.thumbnail_url, 800)}
                srcSet={imageSrcSet(post.thumbnail_url, [480, 800, 1200])}
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 75vw, 800px"
                alt={post.title}
                width={800}
                height={450}
                className="w-full h-full object-cover"
                fetchPriority="high"
              />
            </div>
          )}
          {post.excerpt && (
            <p className="font-medium text-lg text-primary italic border-l-2 border-secondary-container pl-6 mb-12">
              {post.excerpt}
            </p>
          )}
        </header>

        <div
          className="article-content"
          dangerouslySetInnerHTML={{ __html: formatArticleContent(post.content) }}
        />

        {/* Audio Players */}
        {(() => {
          const spotifyLink = post.spotify_url || "https://open.spotify.com/show/1Ut2cPgG7i2iK7d1p5BoXK";
          const spotifyLabel = post.spotify_url ? "Spotifyで再生" : "Spotifyで番組を聴く";
          const hasAudio = post.voicy_url || post.spotify_url;
          return (
            <div className="mt-12 p-6 bg-surface-container-low rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xl">🎙️</span>
                <div>
                  <p className="text-sm font-medium text-primary">
                    {hasAudio ? "この記事の音声版" : "音声でも配信中"}
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    {hasAudio ? "音声でも聴くことができます" : "書き起こし.comのポッドキャストをチェック"}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {post.voicy_url && (
                  <a
                    href={post.voicy_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF6D3B] text-white rounded-full text-sm font-medium no-underline hover:bg-[#E55A2B] transition-colors"
                  >
                    ▶ Voicyで再生
                  </a>
                )}
                <a
                  href={spotifyLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1DB954] text-white rounded-full text-sm font-medium no-underline hover:bg-[#1aa34a] transition-colors"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                  </svg>
                  {spotifyLabel}
                </a>
              </div>
            </div>
          );
        })()}

        {/* Tags */}
        {tags.length > 0 && (
          <footer className="mt-20 pt-8 border-t border-outline-variant/20">
            <div className="flex flex-wrap gap-3">
              {tags.map((tag) => (
                <Link
                  key={tag.slug}
                  to={`/share/tag/${tag.slug}`}
                  className="text-sm px-4 py-2 bg-surface-container-low text-on-surface-variant no-underline hover:bg-secondary-container hover:text-on-secondary-container transition-colors rounded-full"
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          </footer>
        )}

        {/* Related Articles */}
        {relatedPosts.length > 0 && (
          <section className="mt-20 pt-12 border-t border-outline-variant/20">
            <h2 className="font-serif text-2xl font-bold text-primary mb-8">
              関連する書き起こし記事
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {relatedPosts.map((related) => (
                <Link
                  key={related.id}
                  to={`/share/${related.primary_category}/${related.id}`}
                  className="group block no-underline"
                >
                  <div className="aspect-[16/10] mb-4 overflow-hidden bg-surface-container-high rounded-lg">
                    {related.thumbnail_url ? (
                      <img
                        src={imageSrc(related.thumbnail_url, 400)}
                        srcSet={imageSrcSet(related.thumbnail_url, [320, 400])}
                        sizes="(max-width: 768px) 100vw, 50vw"
                        alt={related.title}
                        width={400}
                        height={250}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-surface-container text-on-surface-variant/30">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12">
                          <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <time className="text-[10px] text-on-surface-variant">
                    {related.published_at ? new Date(related.published_at).toLocaleDateString("ja-JP") : ""}
                  </time>
                  <h3 className="font-serif text-lg font-bold text-primary group-hover:text-secondary transition-colors mt-1 leading-snug">
                    {related.title}
                  </h3>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>

      {/* Sidebar */}
      <aside className="hidden lg:block w-80 flex-shrink-0">
        <div className="sticky top-28 flex flex-col gap-12">
          {/* Categories */}
          <div className="p-8 bg-surface-container-low rounded-xl">
            <div className="flex items-center gap-3 mb-6 text-primary">
              <Icon name="menu_book" className="w-5 h-5" />
              <h3 className="font-serif italic text-xl">カテゴリ</h3>
            </div>
            <nav className="flex flex-col gap-4">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  to={`/share/category/${cat.slug}`}
                  className="text-sm text-on-surface/70 hover:text-secondary transition-colors no-underline flex gap-3"
                >
                  <span className="text-secondary/40">
                    {CATEGORY_LABELS_EN[cat.slug]?.[0] ?? "#"}
                  </span>
                  {cat.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* About */}
          <div className="p-8 bg-primary-container text-white rounded-xl relative overflow-hidden">
            <Icon name="auto_stories" className="absolute -right-4 -bottom-4 w-20 h-20 opacity-10" />
            <h3 className="font-serif text-xl mb-2">書き起こし.comとは</h3>
            <p className="text-xs text-on-primary-container mb-6 leading-relaxed">
              2011年から講演・スピーチ・インタビューを文字に起こし、知識として共有しています。
            </p>
            <Link
              to="/share/about"
              className="inline-flex items-center gap-2 text-xs font-bold text-secondary no-underline hover:underline"
            >
              詳しく見る
              <Icon name="arrow_forward" className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
}
