/**
 * Schema.org JSON-LD structured data generators for kakiokosi.com
 *
 * All functions return plain objects suitable for JSON.stringify()
 * and injection via <script type="application/ld+json">.
 */

const SITE_URL = "https://kakiokosi.com";
const SITE_NAME = "書き起こし.com";

// ─── CollectionPage (for archive, category, tag listings) ───────

export function collectionPageSchema(opts: {
  name: string;
  description: string;
  url: string;
  numberOfItems?: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: opts.name,
    description: opts.description,
    url: opts.url,
    // root.tsx の GLOBAL_JSON_LD にある WebSite ノードを @id 参照する
    // （匿名 WebSite ノードの重複を避ける。home/category/tag/全ページネーションに波及）
    isPartOf: { "@id": `${SITE_URL}/#website` },
    inLanguage: "ja",
    ...(opts.numberOfItems != null
      ? { mainEntity: { "@type": "ItemList", numberOfItems: opts.numberOfItems } }
      : {}),
  };
}

// ─── BreadcrumbList ─────────────────────────────────────────────

type BreadcrumbItem = { name: string; url: string };

export function breadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
