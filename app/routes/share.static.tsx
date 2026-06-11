import { data, redirect } from "react-router";
import type { Route } from "./+types/share.static";
import { getPage } from "~/lib/db.server";
import { JsonLd } from "~/components/json-ld";
import { breadcrumbSchema } from "~/lib/schema";
import { ogImageUrl } from "~/lib/og-manifest";

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
  about: "書き起こし.comは2011年から運営する講演・インタビュー・スピーチの書き起こし専門メディアです。編集方針、品質管理の体制、出典の明示や著作権への配慮など、サイトの運営姿勢を紹介します。",
  privacy: "書き起こし.comのプライバシーポリシー。個人情報の取得目的・利用範囲・第三者提供・Cookieの扱い・お問い合わせ窓口など、当サイトにおける個人情報保護の方針を定めています。",
  tos: "書き起こし.comの利用規約。コンテンツの著作権、引用・転載のルール、禁止事項、免責事項など、当サイトをご利用いただく際の条件を定めています。",
  contact: "書き起こし.comへのお問い合わせページ。記事内容の誤りのご指摘、書き起こしのご依頼・お見積もり、掲載に関するご要望などは、こちらのフォームからご連絡ください。",
  company: "書き起こし.comの運営情報。運営会社（株式会社ユリカ）の概要、所在地、事業内容、サイトの沿革など、当メディアの運営体制について掲載しています。",
  regal: "書き起こし.comの特定商取引法に基づく表記。販売事業者名、所在地、連絡先、料金、支払い方法、納品時期、キャンセルポリシーなどを記載しています。",
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
  technique: "書き起こし（テープ起こし）の作業技術・テクニックを実務目線で解説。聴き取り精度、表記統一、ケバ取りの判断、整文の度合いなど、品質を左右するポイントを書き起こし.com編集部が紹介します。",
  tapeokoshi: "テープ起こし（書き起こし）の基本と進め方を解説。録音準備から書き起こし作業、校正・納品までの一連の流れ、AI文字起こしとの併用、料金相場と発注時の注意点まで、15年の実績に基づく実務ノウハウを書き起こし.com編集部が紹介します。",
  jirei: "テープ起こし・書き起こしの具体的なご依頼事例を紹介。講演会、シンポジウム、インタビュー、座談会、会議議事録、研究調査など、業種・用途別の納品実績と、それぞれに最適化した書き起こし.comの対応プロセスを掲載しています。",
  nagare: "書き起こしサービスのご利用の流れを5ステップで解説。お問い合わせ・お見積もり・音源ご送付・書き起こし作業・納品まで、依頼から受け取りまでの工程と所要時間を、書き起こし.com編集部が丁寧にご案内します。",
  omitsumori: "書き起こしサービスのお見積もり方法を解説。音源の長さ・話者数・整文レベルなどの料金要素、無料お見積もりのご依頼手順、納期と料金のバランス調整まで、初めての方にもわかりやすく書き起こし.comがご案内します。",
  point: "書き起こし作業を効率的に進めるためのポイント・コツを実務視点で解説。音源の前処理、話者の整理、整文の判断基準、品質チェックの観点まで、書き起こし.com編集部の15年のノウハウを公開します。",
  webmeeting: "Zoom・Teams・Google Meetなど、Web会議の録画・録音を書き起こす方法を解説。録画ファイルの抽出手順、話者識別のコツ、AI文字起こしとの併用、議事録への落とし込みまで、書き起こし.com編集部が実務目線で紹介します。",
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
    { property: "og:image", content: ogImageUrl(`page-${slug}`) },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: `${title} | 書き起こし.com` },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: ogImageUrl(`page-${slug}`) },
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
    // root.tsx の GLOBAL_JSON_LD にある WebSite ノードを @id で参照する
    // （匿名 WebSite ノードの重複を作らない）
    isPartOf: { "@id": "https://kakiokosi.com/#website" },
  };

  // FAQPage schema は2023年8月以降、政府・医療系サイト以外ではリッチリザルト
  // 対象外のため出力しない（FAQ自体は本文コンテンツとして価値があるので残す）。

  return (
    <section className="max-w-3xl mx-auto">
      <JsonLd data={pageSchema} />
      <JsonLd data={breadcrumbSchema([
        { name: "ホーム", url: "https://kakiokosi.com/" },
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
