import { data } from "react-router";
import type { Route } from "./+types/share.static";
import { getPage } from "~/lib/db.server";
import { JsonLd } from "~/components/json-ld";
import { breadcrumbSchema } from "~/lib/schema";

export async function loader({ request, context }: Route.LoaderArgs) {
  const db = context.cloudflare.env.DB;
  const url = new URL(request.url);
  const slug = url.pathname.replace(/^\/share\//, "").replace(/\/$/, "");
  let page;
  try {
    page = await getPage(db, slug);
  } catch {
    // pages table may not exist yet — treat as 404
    throw data("ページが見つかりません", { status: 404 });
  }
  if (!page) {
    throw data("ページが見つかりません", { status: 404 });
  }
  return { page };
}

const PAGE_DESCRIPTIONS: Record<string, string> = {
  about: "書き起こし.comは、講演・インタビュー・スピーチの書き起こし記事を共有するサイトです。",
  privacy: "書き起こし.comのプライバシーポリシー — 個人情報の取り扱いについて",
  tos: "書き起こし.comの利用規約",
  contact: "書き起こし.comへのお問い合わせ",
  company: "書き起こし.comの運営情報",
  regal: "書き起こし.comの特定商取引法に基づく表記",
  technique: "書き起こしの技術・テクニックについて",
  tapeokoshi: "テープ起こしの基本と方法について",
  jirei: "書き起こしの事例紹介",
  nagare: "書き起こしサービスのご利用の流れ",
  omitsumori: "書き起こしサービスのお見積もりについて",
  point: "書き起こしのポイント・コツ",
  webmeeting: "Web会議の書き起こしについて",
};

export function meta({ data: loaderData, location }: Route.MetaArgs) {
  const title = loaderData?.page?.title ?? "ページ";
  const slug = location.pathname.replace(/^\/share\//, "").replace(/\/$/, "");
  const description = PAGE_DESCRIPTIONS[slug] || `${title} — 書き起こし.com`;
  const canonicalUrl = `https://kakiokosi.com${location.pathname}`;
  return [
    { title: `${title} | 書き起こし.com` },
    { name: "description", content: description },
    { tagName: "link", rel: "canonical", href: canonicalUrl },
    { property: "og:title", content: `${title} | 書き起こし.com` },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: canonicalUrl },
    { property: "og:site_name", content: "書き起こし.com" },
    { property: "og:locale", content: "ja_JP" },
    { property: "og:image", content: "https://kakiokosi.com/images/default-og.png" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: `${title} | 書き起こし.com` },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: "https://kakiokosi.com/images/default-og.png" },
  ];
}

const PAGE_SCHEMA_TYPES: Record<string, string> = {
  about: "AboutPage",
  contact: "ContactPage",
};

export default function StaticPage({ loaderData }: Route.ComponentProps) {
  const { page } = loaderData;
  const slug = page.slug;
  const pageUrl = `https://kakiokosi.com/share/${slug}`;
  const pageType = PAGE_SCHEMA_TYPES[slug] || "WebPage";

  const pageSchema = {
    "@context": "https://schema.org",
    "@type": pageType,
    name: page.title,
    description: PAGE_DESCRIPTIONS[slug] || `${page.title} — 書き起こし.com`,
    url: pageUrl,
    inLanguage: "ja",
    isPartOf: {
      "@type": "WebSite",
      name: "書き起こし.com",
      url: "https://kakiokosi.com",
    },
  };

  return (
    <section className="max-w-3xl mx-auto">
      <JsonLd data={pageSchema} />
      <JsonLd data={breadcrumbSchema([
        { name: "ホーム", url: "https://kakiokosi.com/share" },
        { name: page.title, url: pageUrl },
      ])} />
      <header className="mb-12">
        <h1 className="font-serif text-4xl font-black text-primary mb-4">
          {page.title}
        </h1>
        <div className="h-1 w-16 academic-gradient" />
      </header>
      <div
        className="static-content"
        dangerouslySetInnerHTML={{ __html: page.content }}
      />
    </section>
  );
}
