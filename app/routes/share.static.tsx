import { data, redirect } from "react-router";
import type { Route } from "./+types/share.static";
import { getPage } from "~/lib/db.server";
import { JsonLd } from "~/components/json-ld";
import { breadcrumbSchema } from "~/lib/schema";

/** Slugs that were promoted to regular posts. 301 to the new canonical URL. */
const REDIRECTED_SLUGS: Record<string, string> = {
  "captio-alternative-email-memo": "/share/it/1380",
};

export async function loader({ request, context }: Route.LoaderArgs) {
  const db = context.cloudflare.env.DB;
  const url = new URL(request.url);
  const slug = url.pathname.replace(/^\/share\//, "").replace(/\/$/, "");
  const redirectTo = REDIRECTED_SLUGS[slug];
  if (redirectTo) {
    return redirect(redirectTo, 301);
  }
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
  "kakiokoshi-toha": "書き起こし（文字起こし）とは？意味・やり方・活用法をプロが徹底解説。講演・インタビュー・会議の音声をテキスト化する方法と、書き起こし.comの15年の実績に基づくノウハウを紹介します。",
  "mojikoshi-tool": "AI文字起こしツール・アプリを徹底比較。精度・料金・対応言語・リアルタイム対応などの観点で主要ツールを評価し、用途別のおすすめを紹介します。",
  gijiroku: "議事録の書き方を基本から解説。会議議事録のテンプレート・フォーマット、効率的な作成方法、AI議事録ツールの活用法まで網羅します。",
  meispeech: "世界の有名スピーチ・名演説をまとめた書き起こしアーカイブ。スティーブ・ジョブズ、オバマ大統領、村上春樹など、歴史に残る名スピーチの全文書き起こしを掲載。",
  "interview-kakiokoshi": "インタビューの書き起こし（文字起こし）のコツを解説。録音準備から書き起こし作業、校正・納品まで、プロの実践ノウハウを紹介します。",
  "ted-talks": "TED Talks日本語書き起こし一覧。TEDの人気トークを日本語で全文書き起こし。ビジネス・教育・社会など多彩なテーマのTEDトークを文字で読めます。",
  "mojikoshi-fukugyo": "文字起こし・テープ起こしの副業ガイド。未経験から始める方法、必要なスキル、収入の目安、案件の探し方、AI時代の文字起こし副業の将来性まで徹底解説。",
  presentation: "プレゼンテーションの話し方・コツを名スピーチから学ぶ。スティーブ・ジョブズやTED登壇者のテクニックを分析し、すぐに使えるプレゼンスキルを解説します。",
  "kigyoka-meigen": "起業家・経営者の名言・名スピーチまとめ。ジョブズ、堀江貴文、孫正義、ザッカーバーグなど、ビジネスリーダーの言葉を全文書き起こしで読めます。",
  "ai-hatarakikata": "AI時代の働き方まとめ。AIエージェント、自動化、新しい組織設計など、AI革命が仕事に与える影響を最新のトーク書き起こしから読み解きます。",
  "seijika-enzetsu": "政治家の演説・国会答弁まとめ。オバマ大統領、橋下徹、国会事故調など、歴史に残る政治スピーチと国会質疑の全文書き起こしアーカイブ。",
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

/** FAQ items for the About page — maps to content sections */
const ABOUT_FAQ_ITEMS = [
  {
    question: "書き起こし.comとは何ですか？",
    answer: "書き起こし.comは、講演・インタビュー・スピーチなどの映像・音声コンテンツをテキスト化し、共有するためのプラットフォームです。2011年の開設以来、政治・ビジネス・社会・IT・エンターテインメントなど、幅広い分野の書き起こし記事を掲載しています。",
  },
  {
    question: "書き起こし.comでは何ができますか？",
    answer: "政治家の演説、経営者の講演、有識者のインタビューなど、143本以上の書き起こし記事を無料で閲覧できます。ビジネス・政治・社会・海外・IT・エンタメの6カテゴリから興味のあるテーマを見つけ、記事のURLをSNSやメールで簡単にシェアできます。",
  },
  {
    question: "書き起こし.comはどんな人におすすめですか？",
    answer: "電車内や職場など音を出しにくい環境でコンテンツを消化したい方、長時間の動画を効率よく斜め読みしたい方、重要な発言を正確にテキストで確認したい研究者・ジャーナリストの方、過去のスピーチや議論を資料として活用したい方におすすめです。",
  },
  {
    question: "書き起こしの品質管理はどのように行っていますか？",
    answer: "映像・音声を丁寧に聴き取り発言内容を忠実にテキスト化し、編集部員による校正を実施しています。出典の明示、著作権への配慮、中立性の維持を方針とし、読者からの誤字・聞き取り誤りのご指摘も歓迎しています。",
  },
];

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

  const faqSchema = slug === "about" ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: ABOUT_FAQ_ITEMS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  } : null;

  return (
    <section className="max-w-3xl mx-auto">
      <JsonLd data={pageSchema} />
      {faqSchema && <JsonLd data={faqSchema} />}
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
