# Technical SEO Audit v3 -- kakiokosi.com

**Date:** 2026-03-28
**Auditor:** Claude Opus 4.6 (automated)
**Overall Score: 87 / 100**

---

## Executive Summary

The SELECT optimization and security header deployment from the previous audit cycle have been successfully verified. HTML payload sizes are now within target. All security headers are present. The primary remaining issues are: (1) Cloudflare Managed Rules prepend `Disallow: /` for all AI crawlers, overriding the custom `Allow` directives in `public/robots.txt`; (2) `og:image` on article pages uses relative URLs instead of absolute; (3) the `Content-Type` header for HTML pages omits `charset=utf-8`.

---

## 1. Page Size / Performance

| Page | Before (v2) | Now (v3) | Target | Status |
|------|-------------|----------|--------|--------|
| Homepage (`/share`) | 445 KB | **50 KB** | ~50 KB | PASS |
| Pagination (`/share/page/2`) | 557 KB | **47 KB** | ~47 KB | PASS |
| Article (`/share/society/936`) | -- | **61 KB** | -- | OK |

**Verdict: PASS.** The SELECT optimization reduced homepage payload by ~89% and pagination payload by ~92%.

---

## 2. Crawlability

### 2a. robots.txt

**Status: FAIL (Critical)**

The live `robots.txt` served at `https://kakiokosi.com/robots.txt` contains **Cloudflare Managed Content** prepended before the custom directives. The Cloudflare block sets `Disallow: /` for all major AI crawlers:

```
# BEGIN Cloudflare Managed content
User-agent: Bytespider
Disallow: /

User-agent: CCBot
Disallow: /

User-agent: ClaudeBot
Disallow: /

User-agent: Google-Extended
Disallow: /

User-agent: GPTBot
Disallow: /
# END Cloudflare Managed Content
```

Per the robots.txt specification (RFC 9309), when multiple `User-agent` groups exist for the same bot, the **most specific match** applies. However, both the Cloudflare block and the custom block use identical `User-agent` tokens (e.g., `User-agent: GPTBot`). In this situation, the first matching group encountered takes precedence in many parser implementations. Even with well-behaved parsers that evaluate all groups, the `Disallow: /` is a same-specificity match against `Allow: /share/`, and behavior varies by crawler.

**Practical impact:** GPTBot, ClaudeBot, CCBot, Google-Extended, and Bytespider are all likely blocked from crawling the entire site, negating the custom `Allow: /share/` directives.

**Fix:** In Cloudflare Dashboard, navigate to **Security > Bots > Bot Management** (or **AI Audit** under the domain settings). Disable the "Block AI Scrapers and Crawlers" toggle, or switch individual bots from "Block" to "Allow" so the managed rules are not injected. Then the custom `public/robots.txt` directives will take full effect.

### 2b. Sitemap

**Status: PASS**

- URL: `https://kakiokosi.com/sitemap.xml`
- HTTP status: 200
- Content-Type: `application/xml; charset=utf-8` -- correct
- URL count: **214** (homepage + 143 articles + category/static pages)
- `<lastmod>` dates: present, ISO 8601 format (e.g., `2026-03-28`)
- `<changefreq>` / `<priority>`: **absent** -- correct (deprecated per Google)
- Sitemap reference in robots.txt: present at bottom (`Sitemap: https://kakiokosi.com/sitemap.xml`)

### 2c. Redirect: / to /share

The root URL `https://kakiokosi.com/` returns HTTP 301 to `/share`. This is a single redirect (1 hop), which is acceptable.

---

## 3. Indexability

### 3a. Canonical Tags

| Page Type | Canonical Value | Status |
|-----------|----------------|--------|
| Homepage (`/share`) | `https://kakiokosi.com/share` | PASS |
| Pagination (`/share/page/2`) | `https://kakiokosi.com/share/page/2` | PASS (self-referencing) |
| Article (`/share/society/936`) | `https://kakiokosi.com/share/society/936` | PASS |
| Category (`/share/category/business`) | `https://kakiokosi.com/share/category/business` | PASS |

All canonical tags use absolute HTTPS URLs and are self-referencing. No cross-domain or protocol issues.

### 3b. Meta Tags

Homepage meta tags verified:
- `<title>`: present, descriptive, under 60 chars
- `<meta name="description">`: present, ~100 chars
- `<meta name="viewport">`: `width=device-width, initial-scale=1`
- `<html lang="ja">`: present
- `<meta charset="utf-8">`: present in HTML

### 3c. Open Graph / Twitter Cards

| Tag | Homepage | Article | Status |
|-----|----------|---------|--------|
| `og:title` | present | present | PASS |
| `og:description` | present | present | PASS |
| `og:type` | `website` | `article` | PASS |
| `og:url` | absolute | absolute | PASS |
| `og:image` | `/images/default-og.svg` | `/uploads/...800x450.png` | **FAIL** |
| `twitter:card` | `summary_large_image` | `summary_large_image` | PASS |
| `article:published_time` | -- | present | PASS |
| `article:modified_time` | -- | present | PASS |

**Issue (Medium):** `og:image` and `twitter:image` on article pages use **relative URLs** (e.g., `/uploads/2017/07/...`). The Open Graph protocol requires absolute URLs. Some platforms (Facebook, Twitter) may resolve these correctly, but others (Slack, Discord, LinkedIn) often fail to render the preview image.

**Fix:** Prepend `https://kakiokosi.com` to `og:image` and `twitter:image` values in the article page loader/meta function.

---

## 4. Security Headers

All headers verified present on every response (including 301 redirects):

| Header | Value | Status |
|--------|-------|--------|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` | PASS |
| `X-Content-Type-Options` | `nosniff` | PASS |
| `X-Frame-Options` | `DENY` | PASS |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | PASS |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | PASS |
| `Content-Security-Policy` | Full policy with `frame-ancestors 'none'`, `upgrade-insecure-requests` | PASS |

The CSP is applied both as an HTTP header (via `workers/app.ts`) and as a `<meta http-equiv>` tag in the HTML. The `<meta>` tag only contains `upgrade-insecure-requests`, which is a subset -- this is fine as the HTTP header takes priority.

**Dual-layer delivery:** `public/_headers` provides a static fallback for Cloudflare Pages, while `workers/app.ts` sets headers dynamically. Both are aligned.

---

## 5. Static Asset Caching

| Asset | Cache-Control | Status |
|-------|---------------|--------|
| `/assets/entry.client-CS2_CXNr.js` | `public, max-age=31536000, immutable` | PASS |

Verified: hashed JS assets receive 1-year immutable cache. This is set in both `workers/app.ts` (line 27-30) and `public/_headers` as a fallback.

---

## 6. Static Pages

| Path | HTTP Status | Status |
|------|-------------|--------|
| `/share/about` | 200 | PASS |
| `/share/tos` | 200 | PASS |
| `/share/privacy` | 200 | PASS |
| `/share/company` | 200 | PASS |
| `/share/regal` | 200 | PASS |
| `/share/contact` | 200 | PASS |

All static/legal pages return 200 OK.

---

## 7. RSS Feed

- URL: `https://kakiokosi.com/share/feed.xml`
- HTTP status: 200
- Content-Type: `application/rss+xml; charset=utf-8` -- correct
- Size: 15.9 KB
- Structure: valid RSS 2.0 with `<atom:link rel="self">`, `<guid isPermaLink="true">`, `<pubDate>`, `<category>`
- Linked from HTML via `<link rel="alternate" type="application/rss+xml">` -- PASS

---

## 8. Content-Type Headers

| Resource | Content-Type | Status |
|----------|-------------|--------|
| HTML pages | `text/html` (no charset) | **WARN** |
| Sitemap | `application/xml; charset=utf-8` | PASS |
| RSS Feed | `application/rss+xml; charset=utf-8` | PASS |
| JS assets | `text/javascript` | PASS |

**Issue (Low):** HTML pages are served as `text/html` without `charset=utf-8` in the HTTP header. The `<meta charset="utf-8">` in the HTML compensates, but adding `charset=utf-8` to the HTTP `Content-Type` header is best practice and prevents potential encoding detection delays in browsers.

**Fix:** In `workers/app.ts`, add after other header modifications:
```ts
if (!response.headers.get("Content-Type")?.includes("charset")) {
  const ct = response.headers.get("Content-Type");
  if (ct?.startsWith("text/html")) {
    response.headers.set("Content-Type", "text/html; charset=utf-8");
  }
}
```

---

## 9. Structured Data

### Homepage
- `WebSite` schema with name, URL, description, inLanguage -- PASS
- `Organization` schema with address, contactPoint, foundingDate, logo -- PASS
- `CollectionPage` with `ItemList` (numberOfItems: 143) -- PASS

### Article Pages
- `Article` schema with headline, description, datePublished, dateModified, author, publisher, keywords, articleSection -- PASS
- `BreadcrumbList` with 3 levels (Home > Category > Article) -- PASS
- `SpeakableSpecification` targeting `.article-content` and `h1` -- PASS
- Image uses absolute URL in JSON-LD (`https://kakiokosi.com/uploads/...`) -- PASS (note: this is correct in JSON-LD even though og:image is relative)

### Pagination Pages
- `WebSite` + `Organization` schema present -- PASS

---

## 10. Core Web Vitals (Source Inspection)

| Metric | Assessment | Risk |
|--------|-----------|------|
| **LCP** | Hero image uses `fetchPriority="high"` and `<link rel="preload" as="image">`. Good. | Low |
| **INP** | Minimal JS: only React Router hydration + theme toggle. No heavy event handlers visible. | Low |
| **CLS** | Images have explicit `width`/`height` attributes. `aspect-[16/9]` container prevents layout shift. Google Fonts use `display=swap` (potential FOIT flash but not CLS). | Low |

No critical CWV risks identified from source inspection.

---

## 11. JavaScript Rendering

- **Rendering:** Server-Side Rendered (SSR) via React Router v7 on Cloudflare Workers
- Full HTML content is present in the initial response (verified by curl)
- Client-side hydration via `entry.client-*.js` with `modulepreload` hints
- No JavaScript-dependent content blocking -- search engines receive complete HTML

**Verdict: PASS.** No CSR-only content issues.

---

## 12. Mobile Friendliness

- `<meta name="viewport" content="width=device-width, initial-scale=1">` -- PASS
- Responsive grid: `grid-cols-1 md:grid-cols-2` -- PASS
- Mobile hamburger menu with `md:hidden` / `md:flex` breakpoints -- PASS
- Touch targets: navigation links have adequate padding (`px-6 py-2`, `p-2`) -- PASS
- Font sizes appear adequate (no `text-[8px]` or similar)

---

## Issue Summary (Prioritized)

### Critical
1. **Cloudflare Managed robots.txt overrides AI crawler Allow directives** -- GPTBot, ClaudeBot, CCBot, Google-Extended, Bytespider are effectively blocked from the entire site. Disable Cloudflare's "Block AI Scrapers" managed rules in Dashboard.

### Medium
2. **og:image / twitter:image use relative URLs on article pages** -- Social preview images may fail on some platforms. Prepend the domain to make URLs absolute.

### Low
3. **HTML Content-Type missing charset=utf-8** -- Add charset to the HTTP Content-Type header for HTML responses in the worker.

---

## Comparison: v2 to v3

| Item | v2 Status | v3 Status | Change |
|------|-----------|-----------|--------|
| Homepage size | 445 KB (FAIL) | 50 KB (PASS) | Fixed |
| Pagination size | 557 KB (FAIL) | 47 KB (PASS) | Fixed |
| Security headers | Partial | Complete | Fixed |
| Asset caching | Not verified | immutable, 1yr | Fixed |
| Static pages 200 | Some missing | All 200 | Fixed |
| robots.txt AI crawlers | Custom Allow | Cloudflare overrides | **Regressed** |
| og:image absolute URLs | -- | Relative on articles | **New issue** |
| Structured data | Basic | Rich (Article, Breadcrumb, Speakable) | Improved |
| RSS feed | Not present | Valid RSS 2.0 | New |

---

## Files Referenced

- `/Users/hajimeataka/kakiokosi/workers/app.ts` -- Worker with security headers and asset caching
- `/Users/hajimeataka/kakiokosi/public/_headers` -- Cloudflare Pages static headers fallback
- `/Users/hajimeataka/kakiokosi/public/robots.txt` -- Custom robots.txt (overridden by CF managed rules)
