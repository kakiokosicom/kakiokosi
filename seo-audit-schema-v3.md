# Schema.org Structured Data Audit v3

**Site:** https://kakiokosi.com
**Date:** 2026-03-28
**Auditor:** Claude Opus 4.6 (1M context)

---

## 1. Global JSON-LD (root.tsx -- every page)

**Location:** `app/root.tsx` lines 53-91, injected in `<head>` at line 102-104.

### Rendered block

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "name": "書き起こし.com",
      "url": "https://kakiokosi.com",
      "description": "講演・インタビュー・スピーチの書き起こし記事を共有するサイト",
      "inLanguage": "ja"
    },
    {
      "@type": "Organization",
      "@id": "https://kakiokosi.com/#organization",
      "name": "書き起こし.com",
      "url": "https://kakiokosi.com",
      "description": "講演・インタビュー・スピーチの書き起こし記事を共有するサイト",
      "foundingDate": "2011",
      "logo": {
        "@type": "ImageObject",
        "url": "https://kakiokosi.com/favicon.ico"
      },
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "道玄坂1丁目10番8号 渋谷道玄坂東急ビル2F-C",
        "addressLocality": "渋谷区",
        "addressRegion": "東京都",
        "addressCountry": "JP"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "customer service",
        "email": "info@kakiokosi.com",
        "availableLanguage": "Japanese"
      }
    }
  ]
}
```

### Validation

| Check | Result | Notes |
|-------|--------|-------|
| @context = `https://schema.org` | PASS | |
| @graph array | PASS | Two nodes: WebSite + Organization |
| WebSite.name | PASS | |
| WebSite.url | PASS | Absolute URL |
| WebSite.inLanguage | PASS | |
| Organization.@id | PASS | `https://kakiokosi.com/#organization` -- enables cross-reference |
| Organization.logo | WARN | See issue L-1 below |
| Organization.address | PASS | Street, locality, region, country all present |
| Organization.contactPoint | PASS | |
| Organization.foundingDate | PASS | "2011" |
| No deprecated types | PASS | |
| No placeholder text | PASS | |

### Issues

**L-1 (Low): Organization logo uses `favicon.ico`**
- Current: `https://kakiokosi.com/favicon.ico` (15 KB, ICO format, 48x48 max)
- Google's logo guidelines require the image to be crawlable, indexable, and representative. ICO is technically accepted, but Google recommends a higher-resolution image (min 112x112 px, ideally square, in JPEG/PNG/SVG/WebP format).
- **Recommendation:** Create a dedicated logo image (e.g., `/images/logo.png` at 512x512) and reference that instead. Keep `favicon.ico` for browser tabs only.
- **Severity:** Low. ICO works but may not render well in knowledge panels.

**L-2 (Info): WebSite node lacks SearchAction**
- The `webSiteSchema()` function in `app/lib/schema.ts` exists but is unused; the root layout builds its own inline object.
- Adding a `potentialAction` with `SearchAction` would enable the Google sitelinks search box, but only if the site exposes a `/search?q=` endpoint. Currently no search route exists, so omitting it is correct.
- **Status:** No action needed until a search feature is added.

---

## 2. Homepage / Listing Page (share._index.tsx)

**Location:** `app/routes/share._index.tsx` lines 43-48.

### Rendered block

```json
{
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "書き起こし記事一覧",
  "description": "講演・インタビュー・スピーチの書き起こし記事を共有するサイト",
  "url": "https://kakiokosi.com/share",
  "isPartOf": {
    "@type": "WebSite",
    "name": "書き起こし.com",
    "url": "https://kakiokosi.com"
  },
  "inLanguage": "ja",
  "mainEntity": {
    "@type": "ItemList",
    "numberOfItems": <total>
  }
}
```

### Validation

| Check | Result | Notes |
|-------|--------|-------|
| @context | PASS | |
| @type = CollectionPage | PASS | |
| name, description, url | PASS | All present, URL absolute |
| isPartOf -> WebSite | PASS | |
| inLanguage | PASS | |
| mainEntity.numberOfItems | PASS | Dynamic from DB |
| No deprecated types | PASS | |

### Issues

None. This block is clean.

---

## 3. Article Page (share.$category.$id.tsx)

**Location:** `app/routes/share.$category.$id.tsx` lines 93-136.

### Rendered block (example for /share/society/936)

```json
{
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Article",
      "headline": "<post.title>",
      "description": "<post.excerpt || post.title>",
      "url": "https://kakiokosi.com/share/society/936",
      "datePublished": "2013-06-17T12:00:00+09:00",
      "dateModified": "2025-01-15T09:30:00+09:00",
      "image": {
        "@type": "ImageObject",
        "url": "<thumbnail_url or https://kakiokosi.com/images/default-og.svg>"
      },
      "author": {
        "@type": "Person",
        "name": "書き起こし.com編集部",
        "url": "https://kakiokosi.com/share/about"
      },
      "publisher": {
        "@id": "https://kakiokosi.com/#organization"
      },
      "inLanguage": "ja",
      "keywords": "<tag1>, <tag2>, ...",
      "articleSection": "<category name>",
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": "https://kakiokosi.com/share/society/936"
      },
      "speakable": {
        "@type": "SpeakableSpecification",
        "cssSelector": [".article-content", "h1"]
      }
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "ホーム", "item": "https://kakiokosi.com/share" },
        { "@type": "ListItem", "position": 2, "name": "社会", "item": "https://kakiokosi.com/share/category/society" },
        { "@type": "ListItem", "position": 3, "name": "<post.title>" }
      ]
    }
  ]
}
```

### Validation

| Check | Result | Notes |
|-------|--------|-------|
| @context | PASS | |
| @graph with Article + BreadcrumbList | PASS | |
| Article.headline | PASS | |
| Article.author (Person with name + url) | PASS | |
| Article.publisher @id reference | PASS | Resolves to Organization in root JSON-LD |
| Article.datePublished (ISO 8601 + TZ) | PASS | Uses `+09:00` (JST) |
| Article.dateModified (ISO 8601 + TZ) | PASS | Uses `+09:00` (JST) |
| Article.image | PASS | Falls back to default-og.svg |
| Article.keywords | PASS | Comma-separated tag names |
| Article.articleSection | PASS | Category names |
| Article.speakable | PASS | SpeakableSpecification with cssSelector |
| Article.mainEntityOfPage | PASS | WebPage with @id |
| Article.inLanguage | PASS | |
| BreadcrumbList positions | PASS | Sequential 1, 2, 3 |
| BreadcrumbList last item (no `item` URL) | PASS | Correct per Google spec -- final crumb omits URL |
| No deprecated types | PASS | |
| No placeholder text | PASS | |

### Issues

None. Article schema is comprehensive and well-structured.

---

## 4. Fallback Image URL

**Previous issue:** The default OG image was `default-og.png`, which returned 404.

### Current state

| Location | Value | Status |
|----------|-------|--------|
| `share._index.tsx` og:image (line 22) | `https://kakiokosi.com/images/default-og.svg` | FIXED |
| `share._index.tsx` twitter:image (line 26) | `https://kakiokosi.com/images/default-og.svg` | FIXED |
| `share.$category.$id.tsx` og:image (line 64) | Falls back to `default-og.svg` | FIXED |
| `share.$category.$id.tsx` twitter:image (line 65) | Falls back to `default-og.svg` | FIXED |
| `share.$category.$id.tsx` JSON-LD image (line 105) | Falls back to `default-og.svg` | FIXED |
| File exists on disk | `public/images/default-og.svg` | CONFIRMED |
| Old `default-og.png` references | None remaining | CONFIRMED |

### Verdict: RESOLVED

All fallback image references have been updated from `default-og.png` to `default-og.svg`. The SVG file exists at `public/images/default-og.svg`.

**Note:** Some social platforms (Facebook, LINE) may not render SVG for og:image. If social sharing previews are blank, consider providing a PNG/JPG fallback (1200x630) alongside the SVG.

---

## 5. Organization Logo

### Current state

| Location | Value |
|----------|-------|
| `root.tsx` GLOBAL_JSON_LD (line 74) | `https://kakiokosi.com/favicon.ico` |
| `app/lib/schema.ts` LOGO_URL (line 14) | `https://kakiokosi.com/favicon.ico` |
| `app/lib/schema.ts` organizationSchema() | `https://kakiokosi.com/favicon.ico` |
| `app/lib/schema.ts` webSiteSchema() publisher.logo | `https://kakiokosi.com/favicon.ico` |
| `app/lib/schema.ts` articleSchema() publisher.logo | `https://kakiokosi.com/favicon.ico` |

### Analysis

- `favicon.ico` is a valid, accessible URL (15 KB, 48x48 max resolution).
- Google's documentation states: logo should be a URL of an image that is representative of the organization, at least 112x112 px.
- The 48x48 size is below Google's recommended minimum.
- Note: The `articleSchema()` function in `schema.ts` is **not used** on the article page. The article page builds its own inline JSON-LD and uses `publisher: { "@id": "https://kakiokosi.com/#organization" }` -- which correctly references the global Organization node that contains the logo. So there is no duplication issue.

### Recommendation

Create `/public/images/logo.png` (512x512, square) and update:
1. `root.tsx` line 74: `"url": "https://kakiokosi.com/images/logo.png"`
2. `app/lib/schema.ts` line 14: `const LOGO_URL = \`\${SITE_URL}/images/logo.png\`;`

---

## 6. Additional Schema Coverage

### Category pages (share.category.$slug.tsx)

CollectionPage schema is rendered via `<JsonLd>` component. Includes name, description, URL, numberOfItems. **PASS.**

### Tag pages (share.tag.$slug.tsx)

CollectionPage schema is rendered via `<JsonLd>` component. Includes name, description, URL, numberOfItems. **PASS.**

### Paginated listing pages (share.page.$page.tsx)

**MISSING:** No JSON-LD is rendered on paginated pages (`/share/page/2`, `/share/page/3`, etc.). Should include a `CollectionPage` schema similar to the index page.

### Static pages (about, tos, privacy, contact)

**NOT AUDITED** in this pass. These pages may benefit from `WebPage` schema but are lower priority.

---

## 7. Consistency: schema.ts vs Inline JSON-LD

The codebase has two patterns for generating JSON-LD:

1. **`app/lib/schema.ts`** -- Utility functions (`articleSchema`, `collectionPageSchema`, `organizationSchema`, etc.)
2. **Inline objects** in route files (e.g., `root.tsx` GLOBAL_JSON_LD, `share.$category.$id.tsx` jsonLd)

### Divergences found

| Property | schema.ts `articleSchema()` | Inline in `share.$category.$id.tsx` |
|----------|-----------------------------|--------------------------------------|
| publisher | Full inline Organization object | `{ "@id": "..." }` reference (better) |
| datePublished | `new Date(...).toISOString()` (UTC, no TZ offset) | `.replace(" ", "T") + "+09:00"` (JST) |
| image fallback | None (only set if thumbnail_url exists) | Falls back to `default-og.svg` |
| speakable | Not present | Present |
| @graph wrapper | Not used | Used (Article + BreadcrumbList in one block) |

**The inline version in `share.$category.$id.tsx` is the authoritative one actually rendered.** The `articleSchema()` function in `schema.ts` is dead code for article pages.

### Recommendation

Either:
- (A) Remove the unused `articleSchema()` from `schema.ts` to avoid confusion, or
- (B) Update `articleSchema()` to match the inline version and use it in the route.

---

## 8. Summary of Findings

### Passed

| Item | Status |
|------|--------|
| WebSite schema (global) | PASS |
| Organization schema with @id, address, contactPoint (global) | PASS |
| CollectionPage on homepage | PASS |
| CollectionPage on category pages | PASS |
| CollectionPage on tag pages | PASS |
| Article with author, publisher @id ref, speakable, keywords, articleSection | PASS |
| Article dates in ISO 8601 with +09:00 timezone | PASS |
| BreadcrumbList on article pages | PASS |
| Fallback image uses default-og.svg (not .png) | PASS |
| @context = `https://schema.org` everywhere | PASS |
| All URLs are absolute | PASS |
| No deprecated types (HowTo, FAQ, SpecialAnnouncement) | PASS |
| No placeholder text | PASS |

### Action Items

| Priority | Issue | Location |
|----------|-------|----------|
| Low | L-1: Logo uses favicon.ico (48x48); upgrade to 112x112+ PNG | `root.tsx:74`, `schema.ts:14` |
| Low | L-3: Paginated pages lack CollectionPage JSON-LD | `share.page.$page.tsx` |
| Info | L-2: Dead code in `schema.ts` (`articleSchema`, `webSiteSchema`, `organizationSchema` functions are unused) | `app/lib/schema.ts` |
| Info | SVG fallback OG image may not render on some social platforms | All og:image meta tags |

### No Issues

- No references to deprecated `default-og.png` remain.
- Article schema is complete with all required and recommended properties.
- Publisher cross-referencing via `@id` works correctly between article and global Organization.
- Date formats are consistent (ISO 8601 with JST offset).

---

*Audit complete. All critical v2 issues have been resolved. Remaining items are low-priority enhancements.*
