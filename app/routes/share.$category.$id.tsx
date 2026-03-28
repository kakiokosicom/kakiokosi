import { data, redirect, Link } from "react-router";
import type { Route } from "./+types/share.$category.$id";
import { getPost, getRelatedPosts } from "~/lib/db.server";
import type { Post } from "~/lib/db.server";
import { formatArticleContent } from "~/lib/format-content";

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
  const description = post.excerpt || post.title;
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
    ...(post.thumbnail_url
      ? [
          { property: "og:image", content: post.thumbnail_url },
          { name: "twitter:image", content: post.thumbnail_url },
        ]
      : []),
    { name: "twitter:card", content: post.thumbnail_url ? "summary_large_image" : "summary" },
    { name: "twitter:title", content: post.title },
    { name: "twitter:description", content: description },
    ...(post.published_at
      ? [{ property: "article:published_time", content: post.published_at }]
      : []),
  ];
}

export default function ArticlePage({ loaderData }: Route.ComponentProps) {
  const { post, categories, tags, relatedPosts } = loaderData;
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
        datePublished: post.published_at?.replace(" ", "T") || undefined,
        dateModified: (post.updated_at || post.published_at)?.replace(" ", "T") || undefined,
        ...(post.thumbnail_url ? { image: post.thumbnail_url } : {}),
        author: {
          "@type": "Person",
          name: "書き起こし.com編集部",
          url: "https://kakiokosi.com/share/about",
        },
        publisher: {
          "@type": "Organization",
          name: "書き起こし.com",
          url: "https://kakiokosi.com",
        },
        inLanguage: "ja",
        ...(tags.length > 0
          ? { keywords: tags.map((t) => t.name).join(", ") }
          : {}),
        ...(categories.length > 0
          ? { articleSection: categories.map((c) => c.name).join(", ") }
          : {}),
        mainEntityOfPage: { "@type": "WebPage", "@id": articleUrl },
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
            <span className="font-label text-xs uppercase tracking-[0.2em] text-secondary font-bold">
              {categoryLabelEn}
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
              文字起こし: <Link to="/share/about" className="text-secondary no-underline hover:underline">書き起こし.com編集部</Link>
            </span>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-primary leading-[1.15] font-black mb-8">
            {post.title}
          </h1>
          {post.thumbnail_url && (
            <div className="aspect-[16/9] w-full overflow-hidden rounded-xl bg-surface-container mb-12">
              <img
                src={post.thumbnail_url}
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
                  {related.thumbnail_url && (
                    <div className="aspect-[16/10] mb-4 overflow-hidden bg-surface-container-high rounded-lg">
                      <img
                        src={related.thumbnail_url}
                        alt={related.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>
                  )}
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
              <span className="material-symbols-outlined text-xl">
                menu_book
              </span>
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
            <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-8xl opacity-10">
              auto_stories
            </span>
            <h3 className="font-serif text-xl mb-2">書き起こし.comとは</h3>
            <p className="text-xs text-on-primary-container mb-6 leading-relaxed">
              2011年から講演・スピーチ・インタビューを文字に起こし、知識として共有しています。
            </p>
            <Link
              to="/share/about"
              className="inline-flex items-center gap-2 text-xs font-bold text-secondary no-underline hover:underline"
            >
              詳しく見る
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </Link>
          </div>
        </div>
      </aside>
    </div>
  );
}
