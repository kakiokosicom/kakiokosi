# Schema.org Structured Data Audit -- kakiokosi.com

**Date:** 2026-03-28
**Auditor:** Claude (Schema.org Markup Specialist)
**Site:** https://kakiokosi.com
**Framework:** React Router v7 + Cloudflare Pages (SSR)

---

## 1. Detection Results

### Existing Schema Markup: NONE

| Source | JSON-LD | Microdata | RDFa |
|--------|---------|-----------|------|
| Homepage (`/share`) | None | None | None |
| Article page (`/share/society/936`) | None | None | None |
| Category page (`/share/category/business`) | None | None | None |
| Tag pages | None | None | None |
| Static pages (about, tos, privacy) | None | None | None |
| Root layout (`root.tsx`) | None | None | None |

**Summary:** The site has zero structured data of any kind. No `<script type="application/ld+json">` tags, no `itemtype`/`itemprop` microdata attributes, and no RDFa `vocab`/`typeof` attributes were found in the codebase or in live SSR output.

### What DOES exist (positive signals):
- Open Graph meta tags on article pages (`og:title`, `og:description`, `og:type`, `og:image`)
- Semantic HTML: `<article>`, `<header>`, `<footer>`, `<time dateTime="">`, `<nav>`
- `<html lang="ja">` language declaration
- XML sitemap at `/sitemap.xml`

---

## 2. Validation Results

Not applicable -- no existing schema to validate.

---

## 3. Missing Schema Opportunities

### Priority 1 -- High Impact (implement immediately)

| Schema Type | Page(s) | Google Rich Result | Notes |
|-------------|---------|-------------------|-------|
| **Article** | `/share/:category/:id` | Article rich results, Google Discover | 143 published articles. This is the single highest-impact addition. |
| **BreadcrumbList** | All pages | Breadcrumb trail in SERPs | Improves click-through rate by showing navigation path. |
| **WebSite** | Root layout (all pages) | Sitelinks | Establishes site identity for Google. |
| **Organization** | Root layout (all pages) | Knowledge Panel | Defines the publisher entity. |

### Priority 2 -- Medium Impact

| Schema Type | Page(s) | Google Rich Result | Notes |
|-------------|---------|-------------------|-------|
| **CollectionPage** | `/share`, `/share/category/:slug`, `/share/tag/:slug` | N/A (semantic benefit) | Helps search engines understand listing pages. |
| **WebPage** | Static pages (about, tos, privacy) | N/A (semantic benefit) | Basic page identification. |

### NOT Recommended

| Schema Type | Reason |
|-------------|--------|
| **FAQ** | Restricted to government/healthcare authority sites since August 2023. kakiokosi.com does not qualify. |
| **HowTo** | Rich results removed September 2023; deprecated. |
| **SpecialAnnouncement** | Deprecated July 31, 2025. |
| **SpeechOrTranscript** (hypothetical) | Not a recognized Google rich result type. The site's transcript content maps best to `Article`. |

---

## 4. Recommended JSON-LD Implementation

### Files created:
- `app/lib/schema.ts` -- Schema generator functions
- `app/components/json-ld.tsx` -- React component for rendering JSON-LD

### 4a. Root Layout (`app/root.tsx`) -- Organization + WebSite

Add to the `<head>` in the `Layout` component, or at the top of the `App` component:

```tsx
import { JsonLd } from "~/components/json-ld";
import { organizationSchema, webSiteSchema } from "~/lib/schema";

// Inside the App component return, before <Header>:
<JsonLd data={organizationSchema()} />
<JsonLd data={webSiteSchema()} />
```

This will produce:

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "書き起こし.com",
  "url": "https://kakiokosi.com",
  "logo": "https://kakiokosi.com/logo.png",
  "description": "講演・インタビュー・スピーチの書き起こし記事を共有するサイト"
}
```

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "書き起こし.com",
  "url": "https://kakiokosi.com",
  "description": "講演・インタビュー・スピーチの書き起こし記事を共有するサイト",
  "inLanguage": "ja",
  "publisher": {
    "@type": "Organization",
    "name": "書き起こし.com",
    "url": "https://kakiokosi.com",
    "logo": {
      "@type": "ImageObject",
      "url": "https://kakiokosi.com/logo.png"
    }
  }
}
```

### 4b. Article Pages (`app/routes/share.$category.$id.tsx`)

```tsx
import { JsonLd } from "~/components/json-ld";
import { articleSchema, breadcrumbSchema } from "~/lib/schema";

// Inside ArticlePage component, before the <div> wrapper:
const SITE_URL = "https://kakiokosi.com";
const articleUrl = `${SITE_URL}/share/${post.primary_category}/${post.id}`;

<JsonLd data={articleSchema(post, { url: articleUrl, categories, tags })} />
<JsonLd data={breadcrumbSchema([
  { name: "ホーム", url: `${SITE_URL}/share` },
  { name: categoryLabel, url: `${SITE_URL}/share/category/${post.primary_category}` },
  { name: post.title, url: articleUrl },
])} />
```

Example output for article ID 936:

```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "【TED Talks】\"ママ抱っこしてよ\"闇の中でもがく子供たち（登丸賢美）",
  "description": "【TED Talks】\"ママ抱っこしてよ\"闘の中でもがく子供たち（登丸賢美）",
  "url": "https://kakiokosi.com/share/society/936",
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://kakiokosi.com/share/society/936"
  },
  "inLanguage": "ja",
  "datePublished": "2017-07-19T07:38:05.000Z",
  "dateModified": "2017-07-19T07:38:05.000Z",
  "publisher": {
    "@type": "Organization",
    "name": "書き起こし.com",
    "url": "https://kakiokosi.com",
    "logo": {
      "@type": "ImageObject",
      "url": "https://kakiokosi.com/logo.png"
    }
  },
  "articleSection": "Society"
}
```

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "ホーム", "item": "https://kakiokosi.com/share" },
    { "@type": "ListItem", "position": 2, "name": "Society", "item": "https://kakiokosi.com/share/category/society" },
    { "@type": "ListItem", "position": 3, "name": "【TED Talks】...", "item": "https://kakiokosi.com/share/society/936" }
  ]
}
```

### 4c. Archive/Listing Page (`app/routes/share._index.tsx`)

```tsx
import { JsonLd } from "~/components/json-ld";
import { collectionPageSchema, breadcrumbSchema } from "~/lib/schema";

<JsonLd data={collectionPageSchema({
  name: "Archives | 書き起こし.com",
  description: "講演・インタビュー・スピーチの書き起こし記事を共有するサイト",
  url: "https://kakiokosi.com/share",
})} />
<JsonLd data={breadcrumbSchema([
  { name: "ホーム", url: "https://kakiokosi.com/share" },
])} />
```

### 4d. Category Pages (`app/routes/share.category.$slug.tsx`)

```tsx
import { JsonLd } from "~/components/json-ld";
import { collectionPageSchema, breadcrumbSchema } from "~/lib/schema";

const SITE_URL = "https://kakiokosi.com";

<JsonLd data={collectionPageSchema({
  name: `${category.name} | 書き起こし.com`,
  description: `${category.name}カテゴリの書き起こし記事一覧`,
  url: `${SITE_URL}/share/category/${category.slug}`,
})} />
<JsonLd data={breadcrumbSchema([
  { name: "ホーム", url: `${SITE_URL}/share` },
  { name: category.name, url: `${SITE_URL}/share/category/${category.slug}` },
])} />
```

### 4e. Tag Pages (`app/routes/share.tag.$slug.tsx`)

```tsx
import { JsonLd } from "~/components/json-ld";
import { collectionPageSchema, breadcrumbSchema } from "~/lib/schema";

const SITE_URL = "https://kakiokosi.com";

<JsonLd data={collectionPageSchema({
  name: `${tag.name} | 書き起こし.com`,
  description: `「${tag.name}」タグの書き起こし記事一覧`,
  url: `${SITE_URL}/share/tag/${tag.slug}`,
})} />
<JsonLd data={breadcrumbSchema([
  { name: "ホーム", url: `${SITE_URL}/share` },
  { name: tag.name, url: `${SITE_URL}/share/tag/${tag.slug}` },
])} />
```

---

## 5. SSR Rendering Check

The site uses React Router v7 with Cloudflare Pages SSR. The `<JsonLd>` component renders a `<script type="application/ld+json">` tag using React's `dangerouslySetInnerHTML`. This will be included in the SSR HTML response, which is critical because:

1. Googlebot primarily reads the initial HTML (SSR output)
2. JSON-LD injected only via client-side JavaScript may not be indexed reliably
3. React Router v7's SSR renders components on the server by default, so `<JsonLd>` placed inside route components will appear in the initial HTML

**Verification approach after implementation:** Run `curl -s https://kakiokosi.com/share/society/936 | grep "application/ld+json"` to confirm the script tags appear in the raw HTML.

---

## 6. Additional Recommendations

### 6a. Logo Asset
The schema references `https://kakiokosi.com/logo.png`. Ensure this file exists in the `public/` directory. Google recommends logo images be at least 112x112px and in PNG, JPG, or SVG format. Update the `LOGO_URL` constant in `app/lib/schema.ts` once the correct path is confirmed.

### 6b. Author Information
Article schema currently omits `author` because the codebase does not expose author names on article pages (only `author_id` exists in the DB). If author display names become available, add:
```json
"author": {
  "@type": "Person",
  "name": "Author Name"
}
```
Google lists `author.name` as a recommended property for Article schema.

### 6c. Image Requirements for Article
Google recommends article images be at least 1200px wide for optimal display in Google Discover. Many articles lack `thumbnail_url`. Consider adding default/fallback images.

### 6d. Canonical URLs
Consider adding `<link rel="canonical">` tags to all pages. This is not structured data per se, but it reinforces the URL signals that schema.org markup provides.

### 6e. Testing After Deployment
1. Google Rich Results Test: https://search.google.com/test/rich-results
2. Schema.org Validator: https://validator.schema.org/
3. Google Search Console > Enhancements to monitor indexing of structured data

---

## Summary

| Metric | Current | After Implementation |
|--------|---------|---------------------|
| Schema types present | 0 | 6 (Organization, WebSite, Article, BreadcrumbList, CollectionPage, WebPage) |
| Pages with structured data | 0 | All public pages |
| Google rich result eligibility | None | Article, Breadcrumbs, Sitelinks |
| Validation errors | N/A | 0 (all generated schema is spec-compliant) |
