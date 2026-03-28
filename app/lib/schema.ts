/**
 * Schema.org JSON-LD structured data generators for kakiokosi.com
 *
 * All functions return plain objects suitable for JSON.stringify()
 * and injection via <script type="application/ld+json">.
 */

import type { Post, Category, Tag } from "./db.server";

const SITE_URL = "https://kakiokosi.com";
const SITE_NAME = "書き起こし.com";
const SITE_DESCRIPTION =
  "講演・インタビュー・スピーチの書き起こし記事を共有するサイト";
const LOGO_URL = `${SITE_URL}/logo.png`; // Update when a logo asset exists

// ─── Organization ───────────────────────────────────────────────

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: LOGO_URL,
    description: SITE_DESCRIPTION,
    foundingDate: "2011",
    address: {
      "@type": "PostalAddress",
      addressLocality: "東京都",
      addressCountry: "JP",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: "info@kakiokosi.com",
      availableLanguage: "Japanese",
    },
    sameAs: [],
  };
}

// ─── WebSite (with SearchAction for sitelinks search box) ───────

export function webSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    inLanguage: "ja",
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: LOGO_URL,
      },
    },
  };
}

// ─── WebPage ────────────────────────────────────────────────────

export function webPageSchema(opts: {
  name: string;
  description: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: opts.name,
    description: opts.description,
    url: opts.url,
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
    },
    inLanguage: "ja",
  };
}

// ─── CollectionPage (for archive, category, tag listings) ───────

export function collectionPageSchema(opts: {
  name: string;
  description: string;
  url: string;
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
  };
}

// ─── Article ────────────────────────────────────────────────────

export function articleSchema(
  post: Post,
  opts: {
    url: string;
    categories?: Category[];
    tags?: Tag[];
  }
) {
  const published = post.published_at
    ? new Date(post.published_at).toISOString()
    : undefined;
  const modified = post.updated_at
    ? new Date(post.updated_at).toISOString()
    : published;

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt || post.title,
    url: opts.url,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": opts.url,
    },
    inLanguage: "ja",
    author: {
      "@type": "Person",
      name: "書き起こし.com編集部",
      url: `${SITE_URL}/share/about`,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: LOGO_URL,
      },
    },
  };

  if (published) {
    schema.datePublished = published;
  }
  if (modified) {
    schema.dateModified = modified;
  }
  if (post.thumbnail_url) {
    schema.image = {
      "@type": "ImageObject",
      url: post.thumbnail_url.startsWith("http")
        ? post.thumbnail_url
        : `${SITE_URL}${post.thumbnail_url}`,
    };
  }
  if (opts.tags && opts.tags.length > 0) {
    schema.keywords = opts.tags.map((t) => t.name).join(", ");
  }
  if (opts.categories && opts.categories.length > 0) {
    schema.articleSection = opts.categories.map((c) => c.name).join(", ");
  }

  return schema;
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

// ─── Helper: render JSON-LD script tag string (for SSR) ─────────

export function jsonLdScript(schema: Record<string, unknown>): string {
  return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
}
