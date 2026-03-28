import { data, redirect, Link } from "react-router";
import type { Route } from "./+types/share.$category.$id";
import { getPost } from "~/lib/db.server";

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

  return { post, categories, tags };
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
  const { post, categories, tags } = loaderData;
  const date = post.published_at
    ? new Date(post.published_at).toLocaleDateString("ja-JP")
    : "";
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
        datePublished: post.published_at || undefined,
        dateModified: post.updated_at || post.published_at || undefined,
        ...(post.thumbnail_url ? { image: post.thumbnail_url } : {}),
        publisher: {
          "@type": "Organization",
          name: "書き起こし.com",
          url: "https://kakiokosi.com",
        },
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
            <li><Link to="/share" className="hover:text-secondary no-underline">ホー��</Link></li>
            <li className="before:content-['/'] before:mx-2 before:text-outline-variant">
              <Link to={`/share/category/${post.primary_category}`} className="hover:text-secondary no-underline">{categoryLabel}</Link>
            </li>
            <li className="before:content-['/'] before:mx-2 before:text-outline-variant text-on-surface truncate max-w-xs">
              {post.title}
            </li>
          </ol>
        </nav>

        <header className="mb-12">
          <div className="flex items-center gap-4 mb-6">
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
          dangerouslySetInnerHTML={{ __html: post.content }}
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
                    {CATEGORY_LABELS[cat.slug]?.[0] ?? "#"}
                  </span>
                  {cat.name}
                </Link>
              ))}
            </nav>
          </div>

          {/* Newsletter CTA */}
          <div className="p-8 bg-primary-container text-white rounded-xl relative overflow-hidden">
            <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-8xl opacity-10">
              mail
            </span>
            <h3 className="font-serif text-xl mb-2">Newsletter</h3>
            <p className="text-xs text-on-primary-container mb-6">
              深みのある思考を、あなたのインボックスへ。
            </p>
            <div className="relative">
              <input
                className="w-full bg-primary border-none rounded-lg py-2 pl-4 pr-10 text-xs text-white placeholder:text-white/40 focus:ring-1 focus:ring-secondary focus:outline-none"
                placeholder="Email Address"
                type="email"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 text-secondary">
                <span className="material-symbols-outlined">
                  arrow_forward
                </span>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
