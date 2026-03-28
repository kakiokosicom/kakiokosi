# 書き起こし.com — Full SEO Audit Report

**Date:** 2026-03-28
**URL:** https://kakiokosi.com
**Tech Stack:** React Router v7 + Cloudflare Workers + D1 + R2
**Posts:** ~148 published (WordPress migration)
**Sitemap URLs:** 546

---

## Executive Summary

### Overall SEO Health Score: 44/100

| Category | Weight | Score | Weighted |
|----------|--------|-------|----------|
| Technical SEO | 25% | 52/100 | 13.0 |
| Content Quality | 25% | 42/100 | 10.5 |
| On-Page SEO | 20% | 50/100 | 10.0 |
| Schema / Structured Data | 10% | 40/100 | 4.0 |
| Performance (CWV) | 10% | 35/100 | 3.5 |
| Images | 5% | 30/100 | 1.5 |
| AI Search Readiness | 5% | 28/100 | 1.4 |
| **Total** | **100%** | | **43.9** |

### Top 5 Critical Issues
1. **13 static pages return HTTP 500** in production (about, tos, privacy, contact, etc.)
2. **Static asset caching broken** — all JS/CSS serve `max-age=0, must-revalidate`
3. **Security headers completely absent** — Workers ignores `_headers` file
4. **Pagination `/share/page/2` returns 404** in production
5. **Font loading extremely heavy** — ~7-15MB total (16 weights, 4 families)

### Top 5 Quick Wins
1. Fix static pages (`share.static.tsx` D1 query issue)
2. Add `Cache-Control` headers for hashed assets in Worker response
3. Add `author` field to Article JSON-LD schema
4. Remove `<changefreq>` and `<priority>` from sitemap
5. Add `fetchpriority="high"` to article LCP images

---

## 1. Technical SEO (52/100)

### Critical
- **Static pages broken (500 errors):** All 13 pages served by `share.static.tsx` return HTTP 500. These are in the sitemap, so Google is discovering server errors.
- **Security headers missing:** `public/_headers` file is ignored by Cloudflare Workers (only works with Pages). HSTS, X-Frame-Options, X-Content-Type-Options all absent. Must be set programmatically.
- **Pagination broken:** `/share/page/2` returns 404 despite route file existing locally.

### High
- **Duplicate robots.txt blocks:** Cloudflare prepends its own managed block, then local file's AI crawler blocks are duplicated.
- **Homepage redirect is 302:** `redirect("/share")` defaults to 302 — should be 301 for a permanent redirect.
- **Auth pages not noindexed:** `/auth/*` pages should have `<meta name="robots" content="noindex">`.

### Medium
- No `rel=prev/next` on paginated pages.
- URL uses numeric IDs instead of slugs (minor, acceptable for migration).

---

## 2. Content Quality (42/100)

### Critical
- **No author attribution anywhere.** `Post` model has `author_id` but it's never displayed or included in schema. Single largest E-E-A-T gap.
- **Homepage has near-zero text content.** Only "Latest Transcripts" and "Archives" as static text. Far below the 500-word recommended minimum.

### High
- **No source attribution on transcripts.** No links to source videos, speaker bios, or event pages. A transcription site's primary E-E-A-T advantage is proximity to original source material.
- **Missing legal/trust pages in navigation.** 運営情報 and 特定商取引法 pages exist in DB but aren't linked from footer. Legally required for Japanese commercial sites.
- **Content freshness:** Most recent article is from 2021-05-18 (nearly 5 years old). Sitemap `changefreq: daily` is misleading.

### Medium
- **Thin content risk on tag pages:** 380 tag pages for 148 posts — many tags likely have only 1 post.
- Category/tag pages have no descriptive text, only listings.
- About page is thin (~200 words), privacy policy dates from 2011.

---

## 3. On-Page SEO (50/100)

### High
- **Homepage H1 says "Archives"** — generic, English word on a Japanese site.
- **Category headings in English** (Business, Politics, Society) — misses Japanese keyword signals.
- **No mobile hamburger menu** — Category navigation completely inaccessible on phones.
- **Small touch targets** — 25% of interactive elements below 44x44px minimum.

### Medium
- Article H1 oversized at 60px (36-48px is standard editorial).
- Breadcrumb layout broken on mobile — segments wrap with misaligned slashes.
- Tablet (768px) nav wrapping — title and nav links collide.
- Only article pages have OG/Twitter Card tags.

---

## 4. Schema / Structured Data (40/100)

### What Exists
- Global `WebSite` + `Organization` schema in `root.tsx` (every page)
- `Article` + `BreadcrumbList` schema on article pages

### Critical
- **Missing `author` on Article schema** — Google requires `author` for Article rich results.
- **Missing `logo` on Organization/publisher** — No `/logo.png` asset exists.

### High
- **5 page types lack page-specific schema:** Homepage, category, tag, paginated, and static pages.
- **Dead code:** `app/lib/schema.ts` has complete helper functions but is imported nowhere.
- **`SearchAction` references non-existent search handler.**

### Medium
- Last breadcrumb item omits `item` URL.
- Article dates may not be strict ISO 8601.
- `keywords` and `articleSection` available in loader data but not in schema.

---

## 5. Performance / Core Web Vitals (35/100)

### Verdict: DOES NOT PASS

| Metric | Estimated p75 (mobile) | Threshold | Status |
|--------|------------------------|-----------|--------|
| LCP | 2.5-3.5s | ≤2.5s | NEEDS IMPROVEMENT |
| INP | <100ms | ≤200ms | GOOD |
| CLS | 0.08-0.15 | ≤0.1 | BORDERLINE |

### Critical
- **Static asset caching broken:** All hashed JS/CSS serve `cache-control: max-age=0, must-revalidate`.
- **Font load is ~7-15MB total:** 4 families, 16 weights. Material Symbols alone is ~200KB+. Reduce to 2 families, 4 weights. Replace Material Symbols with inline SVGs.
- **Article images unoptimized:** Thumbnail is 485KB PNG. No WebP/AVIF, no `<link rel="preload">`, no `fetchpriority="high"`.

### What Works Well
- TTFB excellent (93-280ms from Cloudflare edge)
- Brotli compression active
- Route-level code splitting with modulepreload
- Zero third-party analytics or ad scripts

---

## 6. Sitemap Analysis

### Critical
- **13 static page URLs return 500** — must fix or remove from sitemap.

### Medium
- `<changefreq>` and `<priority>` on all 546 entries — Google ignores both.
- 76 posts share identical lastmod `2014-10-29` (WP migration artifact).
- 328 tag URLs contain unencoded Japanese characters — violates Sitemaps protocol. Apply `encodeURI()`.
- 3 duplicate tag URLs (`旅`, `30日`, `web`).
- 380 tag pages for 148 posts is excessive — consider excluding tags with <3 posts.

---

## 7. Visual & Mobile Analysis

### Critical
- **No hamburger menu on mobile** — Navigation categories completely inaccessible on phones.
- **25% of touch targets below 44x44px** — risks Google mobile usability penalty.

### High
- Tablet (768px) nav wrapping — title and links collide.
- Breadcrumb broken on mobile article pages.

### What Works Well
- Clean editorial design with good typography
- No horizontal overflow at any viewport
- 16px base font with 1.5 line-height
- Featured images scale properly
- Correct viewport meta tag

---

## 8. AI Search Readiness (28/100)

- `robots.txt` blocks all major AI crawlers (intentional but limits AI search visibility).
- Articles lack quotable summary sections and FAQ schema.
- No `speakable` markup (highly relevant for transcription content).
- No `llms.txt` file.

---

## Individual Audit Files
- `seo-audit-technical.md` — Technical SEO details
- `seo-audit-content.md` — Content quality & E-E-A-T
- `seo-audit-schema.md` — Schema markup analysis with recommended JSON-LD
- `seo-audit-sitemap.md` — Sitemap structure
- `seo-audit-performance.md` — Core Web Vitals
- `seo-audit-visual.md` — Visual & mobile analysis
- `screenshots/` — Desktop + mobile captures

---

*Report generated 2026-03-28 by SEO Audit (6 parallel subagents)*
