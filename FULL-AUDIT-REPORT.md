# kakiokosi.com Full SEO Audit Report

**Date:** 2026-03-28
**URL:** https://kakiokosi.com
**Business Type:** Japanese transcription (書き起こし) content platform
**Pages Indexed in Sitemap:** 271
**Tech Stack:** React Router v7 + Cloudflare Pages + D1 (SQLite) + SSR

---

## Executive Summary

### Overall SEO Health Score: 42/100

| Category | Score | Weight | Weighted |
|----------|-------|--------|----------|
| Technical SEO | 55/100 | 25% | 13.8 |
| Content Quality | 45/100 | 25% | 11.3 |
| On-Page SEO | 35/100 | 20% | 7.0 |
| Schema / Structured Data | 5/100 | 10% | 0.5 |
| Performance (CWV) | 60/100 | 10% | 6.0 |
| Images | 15/100 | 5% | 0.8 |
| AI Search Readiness | 25/100 | 5% | 1.3 |
| **Total** | | | **40.7** |

### Top 5 Critical Issues
1. **No canonical tags** on any page — high risk of duplicate content
2. **No structured data (JSON-LD)** — zero schema markup across the entire site
3. **All images have empty alt text** (`alt=""`) — accessibility and SEO failure
4. **Missing meta descriptions** on homepage, category pages, and static pages
5. **No `<link rel="canonical">` tags** — Google may index duplicate URLs

### Top 5 Quick Wins
1. Add canonical tags to all pages (1-2 hours via root layout)
2. Add Article JSON-LD to article pages (2-3 hours)
3. Fix image alt text to use post titles (30 minutes)
4. Add meta descriptions to static pages (1 hour)
5. Add BreadcrumbList schema to article pages (1 hour)

---

## 1. Technical SEO

### 1.1 Crawlability
| Check | Status | Notes |
|-------|--------|-------|
| robots.txt | PASS | Properly configured, blocks AI crawlers, allows search engines |
| XML Sitemap | PASS | Dynamic generation, 271 URLs, well-formed |
| Sitemap in robots.txt | PASS | Referenced correctly |
| Internal linking | WARN | Category nav in header, but no breadcrumbs |
| Crawl depth | PASS | Most content 2-3 clicks from homepage |

**robots.txt Analysis:**
- Correctly blocks AI training crawlers (GPTBot, ClaudeBot, Bytespider, etc.)
- Allows standard search engine crawlers
- Uses Content-Signal headers (non-standard but forward-thinking)
- Sitemap referenced at bottom

### 1.2 Indexability
| Check | Status | Notes |
|-------|--------|-------|
| Canonical tags | FAIL | **No canonical tags on any page** |
| Meta robots | WARN | No meta robots tags (defaults to index,follow — OK but explicit is better) |
| Noindex on auth pages | WARN | Auth pages (/auth/*) not explicitly noindexed |
| 301 redirects | PASS | Non-primary category URLs properly 301-redirect |
| Pagination | WARN | No rel=prev/next on paginated pages |

**Critical:** The absence of canonical tags is the single biggest SEO issue. With pagination and category/tag pages showing overlapping content, Google may split ranking signals across duplicate URLs.

### 1.3 Security
| Check | Status | Notes |
|-------|--------|-------|
| HTTPS | PASS | Cloudflare-managed SSL |
| upgrade-insecure-requests | PASS | CSP header set in `<meta>` tag |
| HSTS | INFO | Cloudflare handles this at edge |
| Mixed content | PASS | CSP upgrade-insecure-requests mitigates |

### 1.4 URL Structure
| Check | Status | Notes |
|-------|--------|-------|
| Clean URLs | PASS | `/share/category/business`, `/share/business/936` |
| Consistent pattern | PASS | All content under `/share/` prefix |
| No trailing slashes | PASS | Consistent URL format |
| URL length | PASS | All URLs under 100 chars |

**Note:** URLs use numeric IDs (`/share/business/1`) rather than slugs. This is slightly suboptimal for SEO (slugs provide keyword signals) but acceptable given the migration from WordPress.

### 1.5 Mobile Optimization
| Check | Status | Notes |
|-------|--------|-------|
| Viewport meta tag | PASS | `width=device-width, initial-scale=1` |
| Responsive design | PASS | Tailwind CSS with responsive breakpoints |
| Touch targets | PASS | Adequate sizing in navigation |
| Mobile nav | WARN | Category nav hidden on mobile (`hidden md:flex`) — no hamburger menu |

### 1.6 Server-Side Rendering
| Check | Status | Notes |
|-------|--------|-------|
| SSR enabled | PASS | React Router v7 SSR on Cloudflare Workers |
| Hydration | PASS | `ScrollRestoration` + `Scripts` in layout |
| Meta tags in SSR | PASS | `<Meta />` renders in `<head>` during SSR |
| JavaScript dependency | LOW RISK | Content renders server-side, JS enhances |

### 1.7 Redirect Handling
| Check | Status | Notes |
|-------|--------|-------|
| Homepage redirect | PASS | `/` → `/share` (302 via loader) |
| Category mismatch | PASS | Non-primary category → 301 redirect |
| www handling | INFO | Cloudflare-level (not verified in code) |

**Issue:** Homepage uses `redirect("/share")` which defaults to 302. Should be 301 for SEO since it's permanent.

### Technical SEO Score: 55/100

---

## 2. Content Quality

### 2.1 E-E-A-T Assessment

| Signal | Score | Notes |
|--------|-------|-------|
| Experience | 2/5 | No author profiles or bylines |
| Expertise | 2/5 | Transcription is factual but no editorial expertise shown |
| Authoritativeness | 2/5 | No organizational credibility, thin About page (~200 words) |
| Trustworthiness | 3/5 | HTTPS, privacy policy exists (but dated 2011) |

**Key Issues:**
- **No author attribution** on any article — who created these transcripts?
- **About page is thin** (~200 words) — no team info, company history, or credentials
- **Privacy policy outdated** — last updated 2011, doesn't mention GDPR or modern standards
- **No contact details** beyond a generic form
- **Copyright says 2024** — not updated to 2026

### 2.2 Content Depth
| Page Type | Avg Word Count | Assessment |
|-----------|---------------|------------|
| Article pages | 4,500-8,500+ | GOOD — transcripts are naturally long-form |
| Category pages | ~50 (excl. listings) | THIN — no category descriptions |
| Tag pages | ~50 (excl. listings) | THIN — no tag descriptions |
| Static pages | 180-380 | THIN — About and Privacy particularly thin |
| Homepage/Archive | ~50 (excl. listings) | THIN — no site introduction |

### 2.3 Content Freshness
- **Most recent article:** 2021-05-18 (nearly 5 years old)
- **Bulk of content:** 2014-2017
- **No new content since migration**
- **Sitemap `changefreq: daily`** for root is misleading — no daily updates

### 2.4 Duplicate Content Risk
- **Moderate risk:** Tag and category pages may surface the same articles
- **Mitigated by:** 301 redirects for non-primary category URLs
- **Not mitigated:** No canonical tags to consolidate signals

### Content Quality Score: 45/100

---

## 3. On-Page SEO

### 3.1 Title Tags
| Page Type | Implementation | Issues |
|-----------|---------------|--------|
| Article | `{title} \| 書き起こし.com` | PASS — unique, includes brand |
| Category | `{name} \| 書き起こし.com` | WARN — generic, no keyword context |
| Tag | `{name} \| 書き起こし.com` | WARN — generic |
| Archive | `書き起こし.com` | WARN — too short, no descriptive content |
| Static | `{title} \| 書き起こし.com` | PASS |

### 3.2 Meta Descriptions
| Page Type | Has Description | Quality |
|-----------|----------------|---------|
| Article | YES | Uses `post.excerpt \|\| post.title` — acceptable |
| Archive/Home | YES | Generic: "講演・インタビュー・スピーチの書き起こし記事を共有するサイト" |
| Category | YES | Very generic: "{name}カテゴリの書き起こし記事一覧" |
| Tag | YES | Very generic: "「{name}」タグの書き起こし記事一覧" |
| Static | NO | **Missing entirely** |

### 3.3 Heading Structure
| Page Type | H1 | Issues |
|-----------|-----|--------|
| Article | Post title | PASS — proper semantic H1 |
| Archive | "Archives" | WARN — English word on Japanese site, not descriptive |
| Category | Category label (English) | WARN — "Business" instead of "ビジネス" |
| Tag | Tag name (Japanese) | PASS |
| Static | Page title | PASS |

**Issue:** Category headings display in English (Business, Politics, Society, Foreign) on a Japanese-language site. This creates a language inconsistency and misses Japanese keyword signals.

### 3.4 Internal Linking
| Feature | Status | Notes |
|---------|--------|-------|
| Navigation categories | PASS | 6 categories in header |
| Article → category | PASS | Category label links |
| Article → tags | PASS | Tag links in footer |
| Breadcrumbs | FAIL | **No breadcrumb navigation** |
| Related articles | FAIL | **No related/recommended articles** |
| Footer links | PASS | About, ToS, Privacy, Contact |
| Cross-linking between articles | FAIL | No "see also" or related content |

### 3.5 Open Graph Tags
| Page Type | og:title | og:description | og:image | og:type |
|-----------|----------|----------------|----------|---------|
| Article | YES | YES | YES (if thumbnail) | YES (article) |
| Archive | NO | NO | NO | NO |
| Category | NO | NO | NO | NO |
| Tag | NO | NO | NO | NO |
| Static | NO | NO | NO | NO |

**Issue:** Only article pages have OG tags. All other pages lack social sharing metadata.

### 3.6 Twitter Card Tags
**Missing entirely across all pages.** No `twitter:card`, `twitter:title`, or `twitter:image` tags.

### On-Page SEO Score: 35/100

---

## 4. Schema / Structured Data

### Current Implementation: NONE

**Zero JSON-LD markup exists anywhere in the codebase.** This is a significant missed opportunity.

### Recommended Schema by Page Type

| Page Type | Recommended Schema | Priority |
|-----------|-------------------|----------|
| All pages | `WebSite` + `SearchAction` | HIGH |
| All pages | `Organization` | HIGH |
| Article pages | `Article` with author, datePublished, etc. | CRITICAL |
| Article pages | `BreadcrumbList` | HIGH |
| Category pages | `CollectionPage` | MEDIUM |
| Homepage | `WebPage` + `ItemList` | MEDIUM |
| Static (about) | `AboutPage` | LOW |
| Static (contact) | `ContactPage` | LOW |

### Impact
Without structured data, the site cannot qualify for:
- Rich results in Google Search
- Article carousels
- Breadcrumb trails in SERPs
- Enhanced knowledge panel signals
- FAQ rich snippets

### Schema Score: 5/100

---

## 5. Performance (Core Web Vitals)

### Code-Level Assessment

| Metric | Estimated | Notes |
|--------|-----------|-------|
| LCP | GOOD | SSR delivers content immediately, Cloudflare edge |
| INP | GOOD | Minimal JavaScript interactivity |
| CLS | MODERATE | Images without explicit width/height may cause shifts |

### Resource Loading
| Resource | Impact | Notes |
|----------|--------|-------|
| Google Fonts (4 families) | HIGH | 4 font families loaded: Noto Serif JP, Work Sans, Noto Sans JP, Material Symbols |
| Font preconnect | PASS | `preconnect` to fonts.googleapis.com |
| `display=swap` | PASS | Font display swap prevents FOIT |
| Image lazy loading | PARTIAL | PostCard uses `loading="lazy"`, but article hero images don't |
| CSS bundle | GOOD | Tailwind CSS tree-shaken |

### Concerns
1. **4 Google Font families** is excessive — Material Symbols Outlined alone is ~200KB+
2. **No image dimensions** specified on article thumbnails — potential CLS
3. **Article hero image** (`share.$category.$id.tsx:80`) has no `loading="lazy"` and no width/height
4. **No resource hints** beyond font preconnect (no `dns-prefetch` for image CDN)

### Performance Score: 60/100

---

## 6. Images

### Current Implementation

| Check | Status | Notes |
|-------|--------|-------|
| Alt text on thumbnails | FAIL | All use `alt=""` — empty string |
| Alt text on article hero | FAIL | Uses `alt=""` |
| Lazy loading (listings) | PASS | `loading="lazy"` on PostCard images |
| Lazy loading (article) | FAIL | Hero image loads eagerly (correct for LCP, but no explicit dimensions) |
| Width/height attributes | FAIL | **No images have explicit dimensions** |
| Modern formats (WebP/AVIF) | UNKNOWN | Images served from `/uploads/` — likely original WordPress formats |
| Responsive images | FAIL | No `srcset` or `<picture>` elements |
| Image compression | UNKNOWN | Would need to audit individual image sizes |

### Critical Image Issues
1. **Empty alt text everywhere** — `alt=""` tells screen readers and search engines to ignore the image. Should use descriptive alt text (post title at minimum).
2. **No width/height** — causes Cumulative Layout Shift
3. **No responsive images** — same image served to mobile and desktop
4. **No modern formats** — likely serving original JPEG/PNG from WordPress migration

### Images Score: 15/100

---

## 7. AI Search Readiness

### Citability Assessment

| Signal | Status | Notes |
|--------|--------|-------|
| Structured content | PARTIAL | Transcripts are well-structured text |
| Source attribution | PARTIAL | Some articles cite original sources/YouTube links |
| Author signals | FAIL | No author information |
| Date signals | PASS | Published dates shown and in metadata |
| Factual density | GOOD | Transcripts are factual, verbatim content |
| Unique content | GOOD | Transcripts are original content creation |
| robots.txt AI policy | CONFIGURED | Blocks AI training crawlers, allows search |
| Schema markup | FAIL | No structured data for AI to parse |

### AI Crawler Policy
The robots.txt blocks AI training crawlers (GPTBot, ClaudeBot, etc.) but allows standard search. This is a reasonable policy for protecting content while maintaining search visibility. However, there's no `llms.txt` or `ai.txt` file for AI-specific instructions.

### AI Search Readiness Score: 25/100

---

## 8. Additional Findings

### 8.1 Internationalization
- `<html lang="ja">` — correctly set
- No hreflang tags (appropriate — single language site)
- **Mixed language UI:** Category labels in English, content in Japanese — inconsistent

### 8.2 Security Concerns
- `dangerouslySetInnerHTML` used for article content and static pages — relies on sanitization of WordPress-migrated HTML content
- Newsletter email input has no form action — decorative only

### 8.3 Sitemap Issues
- `changefreq: daily` on root page is misleading (no daily updates)
- `lastmod` dates reflect original publication, not migration date
- No tag pages in sitemap
- Pagination pages not in sitemap (acceptable)

### 8.4 Missing Pages/Features
- No 404 page sitemap exclusion (handled by ErrorBoundary — good)
- No RSS/Atom feed
- No `llms.txt` file
- No `favicon.ico` or `apple-touch-icon` detected in root layout
- No `manifest.json` / PWA support

---

## Scoring Summary

| Category | Score | Grade |
|----------|-------|-------|
| Technical SEO | 55/100 | D+ |
| Content Quality | 45/100 | D |
| On-Page SEO | 35/100 | F+ |
| Schema / Structured Data | 5/100 | F |
| Performance (CWV) | 60/100 | C- |
| Images | 15/100 | F |
| AI Search Readiness | 25/100 | F+ |
| **Overall** | **42/100** | **D** |

---

*Report generated 2026-03-28 by SEO Audit Tool*
