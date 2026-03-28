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
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
    },
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
