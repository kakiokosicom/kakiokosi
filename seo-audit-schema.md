# Schema.org Structured Data Audit -- kakiokosi.com

**Date:** 2026-03-28
**Site:** https://kakiokosi.com (書き起こし.com)
**Stack:** React Router v7 on Cloudflare Workers + D1

---

## 1. Current Implementation Summary

### 1.1 Global Schema (root.tsx, lines 49-70)

Injected on every page via `<script type="application/ld+json">` in the `<head>`.

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "name": "書き起こし.com",
      "url": "https://kakiokosi.com",
      "description": "講演・インタビュー・スピーチの書き起こし記事を共有するサイト",
      "inLanguage": "ja",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://kakiokosi.com/share?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "Organization",
      "name": "書き起こし.com",
      "url": "https://kakiokosi.com"
    }
  ]
}
```

### 1.2 Article Page Schema (share.$category.$id.tsx, lines 85-112)

Each article page injects a second JSON-LD block in the `<body>`:

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      "headline": "...",
      "description": "...",
      "url": "https://kakiokosi.com/share/{category}/{id}",
      "datePublished": "...",
      "dateModified": "...",
      "image": "...",
      "publisher": {
        "@type": "Organization",
        "name": "書き起こし.com",
        "url": "https://kakiokosi.com"
      },
      "mainEntityOfPage": { "@type": "WebPage", "@id": "..." }
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "ホーム", "item": "https://kakiokosi.com/share" },
        { "@type": "ListItem", "position": 2, "name": "社会", "item": "https://kakiokosi.com/share/category/society" },
        { "@type": "ListItem", "position": 3, "name": "記事タイトル" }
      ]
    }
  ]
}
```

### 1.3 Unused Utility Library (app/lib/schema.ts)

A well-written utility module exists at `app/lib/schema.ts` with helper functions for Organization, WebSite, WebPage, CollectionPage, Article, and BreadcrumbList schemas. **However, it is not imported anywhere.** The article page constructs its JSON-LD inline instead.

---

## 2. Validation Results

### 2.1 Global Schema (WebSite + Organization) -- PASS with warnings

| Check | Result | Notes |
|-------|--------|-------|
| @context is https://schema.org | PASS | |
| @type is valid | PASS | WebSite and Organization are both valid |
| Required properties | PASS | name, url present |
| SearchAction target | WARN | The target URL `https://kakiokosi.com/share?q={search_term_string}` implies search functionality exists. Verify that `/share?q=` actually works, or remove the SearchAction. |
| Organization: logo missing | FAIL | Google recommends `logo` for Organization. No logo property is set. |
| Organization: minimal | WARN | Only `name` and `url` -- consider adding `logo`, `description`, `sameAs` |

### 2.2 Article Schema -- PASS with issues

| Check | Result | Notes |
|-------|--------|-------|
| @context is https://schema.org | PASS | |
| @type Article | PASS | |
| headline | PASS | |
| datePublished | PASS | Present when post has published_at |
| dateModified | PASS | Falls back to published_at |
| image | WARN | Only included when thumbnail_url exists. Google requires `image` for Article rich results. Articles without thumbnails will not qualify. |
| author | FAIL | **Missing.** Google requires `author` for Article rich results. This is a critical omission. |
| publisher.logo | FAIL | **Missing.** The publisher Organization lacks a `logo` property. Google requires this. |
| inLanguage | MISSING | Not set on Article (but set on global WebSite) |
| keywords | MISSING | Tags are available in loader data but not included in schema |
| articleSection | MISSING | Categories are available but not included |

### 2.3 BreadcrumbList -- PASS with issue

| Check | Result | Notes |
|-------|--------|-------|
| @type BreadcrumbList | PASS | |
| itemListElement | PASS | 3 items with correct positions |
| Last item missing `item` URL | WARN | The last breadcrumb (position 3) has no `item` property. Google's documentation says the last item may omit it, but including it is safer. |

---

## 3. Pages Missing Schema Entirely

| Page | Route File | Schema Present |
|------|-----------|----------------|
| Homepage `/share` | share._index.tsx | NO -- relies only on global WebSite/Org |
| Category pages `/share/category/{slug}` | share.category.$slug.tsx | NO |
| Tag pages `/share/tag/{slug}` | share.tag.$slug.tsx | NO |
| Paginated pages `/share/page/{n}` | share.page.$page.tsx | NO |
| Static pages (about, tos, privacy, contact) | share.static.tsx | NO |

---

## 4. Issues and Recommendations

### CRITICAL -- Article author is missing

Google's Article rich result documentation states: "To be eligible for the Article rich result, you must include the `author` property." Without it, the site will not earn Article rich results in Google Search.

**Fix:** Add an `author` property. Since the site is a transcript archive without per-article bylines, use the Organization as author:

```json
"author": {
  "@type": "Organization",
  "name": "書き起こし.com",
  "url": "https://kakiokosi.com"
}
```

### CRITICAL -- Publisher logo is missing

The `publisher` object in the Article schema has no `logo`. Google recommends it for Article rich results.

### HIGH -- Use the existing schema.ts utility

The `app/lib/schema.ts` file has well-structured helpers that are not imported anywhere. Refactoring to use these helpers would:
- Centralize all schema definitions in one place
- Ensure consistency (e.g., logo, inLanguage always included)
- Make future updates easier

### HIGH -- Add CollectionPage schema to listing pages

Category and tag pages should use CollectionPage schema (the helper already exists in schema.ts).

### MEDIUM -- Homepage should have explicit WebPage schema

The homepage at `/share` has no page-specific schema. It should include a `CollectionPage` or `WebPage` schema.

### MEDIUM -- Add BreadcrumbList to category and tag pages

These pages have a clear hierarchy (Home > Category/Tag) but no breadcrumb schema.

### LOW -- SearchAction may be non-functional

The global WebSite schema includes a SearchAction targeting `?q={search_term_string}`, but no search route handler was found. If search is not implemented, remove the SearchAction to avoid misrepresenting functionality to Google.

### LOW -- Static pages lack WebPage schema

Pages like About, Terms of Service, and Privacy Policy could benefit from `WebPage` schema with appropriate `@type` values (e.g., `AboutPage` for the about page).

---

## 5. Recommended JSON-LD Implementations

### 5.1 Improved Global Schema (root.tsx)

Replace the current `GLOBAL_JSON_LD` constant:

```typescript
const GLOBAL_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://kakiokosi.com/#website",
      name: "書き起こし.com",
      url: "https://kakiokosi.com",
      description: "講演・インタビュー・スピーチの書き起こし記事を共有するサイト",
      inLanguage: "ja",
      publisher: { "@id": "https://kakiokosi.com/#organization" },
    },
    {
      "@type": "Organization",
      "@id": "https://kakiokosi.com/#organization",
      name: "書き起こし.com",
      url: "https://kakiokosi.com",
      // logo: {
      //   "@type": "ImageObject",
      //   url: "https://kakiokosi.com/logo.png",
      //   width: 600,
      //   height: 60,
      // },
      description: "講演・インタビュー・スピーチの書き起こし記事を共有するサイト",
    },
  ],
};
```

Notes:
- Removed SearchAction until search is actually implemented
- Added `@id` references to link entities within the graph
- Logo is commented out until an actual logo asset is created at `/logo.png`

### 5.2 Improved Article Schema (share.$category.$id.tsx)

```typescript
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      headline: post.title,
      description: post.excerpt || post.title,
      url: articleUrl,
      mainEntityOfPage: { "@type": "WebPage", "@id": articleUrl },
      inLanguage: "ja",
      ...(post.published_at
        ? { datePublished: new Date(post.published_at).toISOString() }
        : {}),
      ...(post.updated_at || post.published_at
        ? {
            dateModified: new Date(
              post.updated_at || post.published_at!
            ).toISOString(),
          }
        : {}),
      ...(post.thumbnail_url
        ? {
            image: {
              "@type": "ImageObject",
              url: post.thumbnail_url.startsWith("http")
                ? post.thumbnail_url
                : `https://kakiokosi.com${post.thumbnail_url}`,
            },
          }
        : {}),
      author: {
        "@type": "Organization",
        name: "書き起こし.com",
        url: "https://kakiokosi.com",
      },
      publisher: {
        "@id": "https://kakiokosi.com/#organization",
      },
      ...(tags.length > 0
        ? { keywords: tags.map((t) => t.name).join(", ") }
        : {}),
      articleSection: categoryLabel,
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "ホーム",
          item: "https://kakiokosi.com/share",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: categoryLabel,
          item: `https://kakiokosi.com/share/category/${post.primary_category}`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: post.title,
          item: articleUrl,
        },
      ],
    },
  ],
};
```

Key changes:
- Added `author` (Organization) -- required for Article rich results
- Added `inLanguage`
- Added `keywords` from tags
- Added `articleSection` from category
- Publisher uses `@id` reference to the global Organization
- Dates converted to full ISO 8601 via `toISOString()`
- Last breadcrumb item now includes `item` URL
- Image uses absolute URL with fallback

### 5.3 New: Homepage Schema (share._index.tsx)

Add to the component:

```typescript
const homepageJsonLd = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "書き起こし記事アーカイブ",
  description: "講演・インタビュー・スピーチの書き起こし記事を共有するサイト",
  url: "https://kakiokosi.com/share",
  isPartOf: { "@id": "https://kakiokosi.com/#website" },
  inLanguage: "ja",
};
```

Render:
```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageJsonLd) }}
/>
```

### 5.4 New: Category Page Schema (share.category.$slug.tsx)

```typescript
const categoryJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      name: `${label}の書き起こし記事一覧`,
      description: `${label}カテゴリの書き起こし記事一覧`,
      url: `https://kakiokosi.com/share/category/${category.slug}`,
      isPartOf: { "@id": "https://kakiokosi.com/#website" },
      inLanguage: "ja",
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "ホーム",
          item: "https://kakiokosi.com/share",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: label,
          item: `https://kakiokosi.com/share/category/${category.slug}`,
        },
      ],
    },
  ],
};
```

### 5.5 New: Tag Page Schema (share.tag.$slug.tsx)

```typescript
const tagJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      name: `「${tag.name}」の書き起こし記事一覧`,
      description: `「${tag.name}」タグの書き起こし記事一覧`,
      url: `https://kakiokosi.com/share/tag/${tag.slug}`,
      isPartOf: { "@id": "https://kakiokosi.com/#website" },
      inLanguage: "ja",
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "ホーム",
          item: "https://kakiokosi.com/share",
        },
        {
          "@type": "ListItem",
          position: 2,
          name: tag.name,
          item: `https://kakiokosi.com/share/tag/${tag.slug}`,
        },
      ],
    },
  ],
};
```

### 5.6 New: About Page Schema (share.static.tsx -- about slug)

For the About page specifically, use `AboutPage`:

```typescript
// In share.static.tsx, conditionally add schema based on slug
const STATIC_PAGE_TYPES: Record<string, string> = {
  about: "AboutPage",
  contact: "ContactPage",
};

const staticPageJsonLd = {
  "@context": "https://schema.org",
  "@type": STATIC_PAGE_TYPES[slug] || "WebPage",
  name: page.title,
  description: PAGE_DESCRIPTIONS[slug] || `${page.title} -- 書き起こし.com`,
  url: `https://kakiokosi.com/share/${slug}`,
  isPartOf: { "@id": "https://kakiokosi.com/#website" },
  inLanguage: "ja",
};
```

---

## 6. Priority Action Items

| Priority | Action | File(s) | Impact |
|----------|--------|---------|--------|
| P0 | Add `author` to Article schema | share.$category.$id.tsx | Required for Article rich results |
| P0 | Add `logo` to publisher Organization | root.tsx, share.$category.$id.tsx | Required for rich results |
| P1 | Refactor to use schema.ts helpers | All route files | Consistency and maintainability |
| P1 | Add CollectionPage schema to homepage | share._index.tsx | Better page classification |
| P1 | Add CollectionPage + BreadcrumbList to category pages | share.category.$slug.tsx | Breadcrumb rich results |
| P2 | Add CollectionPage + BreadcrumbList to tag pages | share.tag.$slug.tsx | Breadcrumb rich results |
| P2 | Add keywords and articleSection to Article | share.$category.$id.tsx | Richer article context |
| P2 | Add WebPage/AboutPage/ContactPage to static pages | share.static.tsx | Better page type signals |
| P3 | Remove or validate SearchAction | root.tsx | Avoid misrepresentation |
| P3 | Create and add site logo asset | public/logo.png | Required for Organization logo |

---

## 7. Schema Types NOT Recommended

The following schema types should NOT be added to this site:

- **HowTo** -- Rich results removed September 2023
- **FAQ** -- Restricted to government/healthcare authority sites since August 2023
- **SpecialAnnouncement** -- Deprecated July 31, 2025
- **SpeakableSpecification** -- Still in beta, limited to English-language news sites on Google Assistant

---

## 8. Files Referenced

- `/Users/hajimeataka/kakiokosi/app/root.tsx` -- Global JSON-LD (lines 49-70, injected at line 82-84)
- `/Users/hajimeataka/kakiokosi/app/routes/share.$category.$id.tsx` -- Article + BreadcrumbList JSON-LD (lines 85-119)
- `/Users/hajimeataka/kakiokosi/app/routes/share._index.tsx` -- Homepage, no schema
- `/Users/hajimeataka/kakiokosi/app/routes/share.category.$slug.tsx` -- Category pages, no schema
- `/Users/hajimeataka/kakiokosi/app/routes/share.tag.$slug.tsx` -- Tag pages, no schema
- `/Users/hajimeataka/kakiokosi/app/routes/share.page.$page.tsx` -- Pagination pages, no schema
- `/Users/hajimeataka/kakiokosi/app/routes/share.static.tsx` -- Static pages, no schema
- `/Users/hajimeataka/kakiokosi/app/lib/schema.ts` -- Utility library (exists but unused)
