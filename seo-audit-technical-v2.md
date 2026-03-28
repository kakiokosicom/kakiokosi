# Technical SEO Audit v2 -- kakiokosi.com

**Date:** 2026-03-28
**Auditor:** Claude Opus 4.6 (automated)
**Scope:** Post-improvement re-audit of https://kakiokosi.com
**Overall Score: 82 / 100**

---

## Summary of Improvements Since v1

The following items have been successfully implemented:

- robots.txt with AI crawler directives (GPTBot, ClaudeBot, Google-Extended, PerplexityBot, Bytespider, CCBot)
- Security headers (HSTS, X-Frame-Options, X-Content-Type-Options, CSP, Permissions-Policy, Referrer-Policy) all present
- Sitemap cleaned: no `changefreq` or `priority` tags, proper URL encoding, `lastmod` dates present
- Static pages (/share/about, /share/tos, /share/privacy, /share/company, /share/regal) all return HTTP 200
- Pagination route (/share/page/2) working, returns HTTP 200
- RSS feed at /share/feed.xml working, correct `application/rss+xml; charset=utf-8` Content-Type
- Canonical tags present on all page types (homepage, articles, static pages, pagination)
- Structured data (JSON-LD) present: CollectionPage on listing, Article + BreadcrumbList on articles
- Images have width/height attributes and proper lazy/eager loading

---

## 1. Crawlability

**Status: PASS (with one issue)**

### robots.txt

| Check | Result |
|-------|--------|
| HTTP status | 200 |
| Sitemap directive | Present: `https://kakiokosi.com/sitemap.xml` |
| Auth/Dashboard blocked | Yes: `/auth/`, `/dashboard/`, `/admin/` |
| AI crawlers configured | Yes: GPTBot, ClaudeBot, Google-Extended, PerplexityBot, Bytespider, CCBot |
| AI crawlers Allow /share/ | Yes |

**CRITICAL -- Cloudflare Managed robots.txt Conflict**

The live robots.txt served at `https://kakiokosi.com/robots.txt` contains **two conflicting directive blocks**. Cloudflare has prepended its own "Managed Content" section that issues `Disallow: /` for GPTBot, ClaudeBot, Google-Extended, Bytespider, and CCBot. This **directly contradicts** the custom directives that follow with `Allow: /share/`.

Per the robots.txt specification, when multiple User-agent groups match the same crawler, the most specific group is used. However, since both groups are equally specific (both match `User-agent: GPTBot` exactly), behavior is implementation-dependent. Google will use the most permissive rule, but other crawlers may use the first matching block (Cloudflare's block), effectively **blocking all AI crawlers from the entire site**.

Live robots.txt structure:
```
# BEGIN Cloudflare Managed content
User-agent: GPTBot
Disallow: /              <-- BLOCKS EVERYTHING

...later...

# Custom rules
User-agent: GPTBot
Allow: /share/           <-- INTENDED TO ALLOW
Disallow: /auth/
Disallow: /dashboard/
Disallow: /admin/
```

Additionally, Cloudflare's managed block includes `User-agent: *` with `Content-Signal: search=yes,ai-train=no` -- these Content-Signal directives are not part of the robots.txt standard and are ignored by most crawlers, but the `Disallow` rules in the same block could cause confusion.

**Recommendation:** In Cloudflare dashboard, go to Security > Bots > AI Crawlers and disable the managed robots.txt feature, or configure it to not block the crawlers you want to allow. This is the highest priority fix.

### Sitemap

| Check | Result |
|-------|--------|
| URL | `https://kakiokosi.com/sitemap.xml` |
| HTTP status | 200 |
| Content-Type | `application/xml; charset=utf-8` |
| Cache-Control | `public, max-age=3600` |
| Total URLs | 214 |
| Has `changefreq` | No (correct -- deprecated) |
| Has `priority` | No (correct -- deprecated) |
| Has `lastmod` | 213 of 214 URLs |
| URL encoding | Proper per-segment `encodeURIComponent` |

The sitemap is well-structured. One URL (the homepage `/share`) has a `lastmod` of `2017-07-19`, which appears to be the oldest post date rather than the actual last modification date of the homepage. This is misleading.

**Medium -- Sitemap homepage lastmod** should reflect the date the latest article was published, not the first one.

**Low -- Pagination pages not in sitemap.** Pages like `/share/page/2` are not included. This is acceptable since Google can discover them via internal links, but adding them would ensure crawl coverage.

---

## 2. Indexability

**Status: PASS**

| Check | Result |
|-------|--------|
| Canonical on /share | `https://kakiokosi.com/share` |
| Canonical on /share/about | `https://kakiokosi.com/share/about` |
| Canonical on /share/page/2 | `https://kakiokosi.com/share/page/2` |
| Canonical on article | `https://kakiokosi.com/share/society/936` |
| Canonical on /share/contact | `https://kakiokosi.com/share/contact` |
| noindex detected | None on public pages |
| Pagination title | Unique: "書き起こし記事一覧 - 2ページ目 | 書き起こし.com" |

All canonical tags are self-referencing and correct. Pagination pages have unique titles.

**Low -- No rel="prev"/rel="next"** on pagination pages. While Google no longer uses these as indexing signals, they can help other search engines and crawlers understand pagination structure.

---

## 3. Security Headers

**Status: PASS**

All security headers are present on every response (including redirects):

| Header | Value | Grade |
|--------|-------|-------|
| Strict-Transport-Security | `max-age=31536000; includeSubDomains; preload` | A+ |
| X-Frame-Options | `DENY` | A |
| X-Content-Type-Options | `nosniff` | A |
| Content-Security-Policy | Full policy with `frame-ancestors 'none'`, `upgrade-insecure-requests` | A |
| Permissions-Policy | `camera=(), microphone=(), geolocation=()` | A |
| Referrer-Policy | `strict-origin-when-cross-origin` | A |

The CSP is well-configured:
```
default-src 'self';
script-src 'self' 'unsafe-inline';
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com;
img-src 'self' https: data:;
connect-src 'self';
frame-ancestors 'none';
base-uri 'self';
form-action 'self';
upgrade-insecure-requests
```

**Low -- `script-src 'unsafe-inline'`** is present because React Router injects inline scripts for hydration. This is a known tradeoff for SSR frameworks. Consider adding nonce-based CSP in the future if stricter policies are needed.

---

## 4. URL Structure

**Status: PASS**

| Check | Result |
|-------|--------|
| HTTPS enforced | Yes (Cloudflare + HSTS preload) |
| Root redirect | `/ -> /share` (301) |
| Clean URLs | Yes: `/share/{category}/{id}` |
| Trailing slashes | Not present (consistent) |
| URL depth | Max 3 segments (`/share/category/slug/page/2`) |

URL structure is clean and logical. The `/ -> /share` 301 redirect is appropriate.

---

## 5. Mobile Friendliness

**Status: PASS**

| Check | Result |
|-------|--------|
| Viewport meta | `width=device-width, initial-scale=1` |
| HTML lang | `ja` |
| charSet | `utf-8` (in HTML `<meta>` tag) |

**Medium -- Content-Type header missing `charset`.**
The HTTP `Content-Type` response header is `text/html` without `charset=utf-8`. While the HTML `<meta charSet="utf-8"/>` tag is present (which browsers will use), best practice is to also include `charset=utf-8` in the HTTP header: `text/html; charset=utf-8`. This prevents potential encoding sniffing issues.

---

## 6. Core Web Vitals (Source-Based Assessment)

**Status: NEEDS IMPROVEMENT**

### LCP (Largest Contentful Paint)

- Hero image has `fetchPriority="high"` and `loading="eager"` -- good
- `<link rel="preload" as="image">` present for hero image -- good
- 8 JS module preloads present -- helps reduce render-blocking
- Google Fonts loaded via external CSS (two separate requests) -- potential LCP delay

**Medium -- Google Fonts render-blocking.** Two separate Google Fonts CSS requests (`Noto Serif JP`, `Work Sans + Noto Sans JP`, `Material Symbols Outlined`) are loaded as `<link rel="stylesheet">`, which blocks rendering. Consider using `font-display: swap` via `&display=swap` (already present) but also add `<link rel="preconnect">` (already present -- good).

### INP (Interaction to Next Paint)

- React Router with SSR + hydration -- good baseline
- No heavy client-side JS frameworks detected beyond React
- Lazy route discovery (`"mode":"lazy"`) reduces initial JS payload

No major INP concerns from source inspection.

### CLS (Cumulative Layout Shift)

- Images have `width` and `height` attributes (7 out of ~8 images) -- good
- Fonts loaded with `display=swap` -- potential minor CLS from font swap
- No obvious layout-shifting patterns (no ads, no dynamically injected content above fold)

**Low -- Font swap CLS.** `display=swap` on Google Fonts can cause minor layout shifts when fonts load. Consider `display=optional` for non-critical fonts or using font `size-adjust` to minimize shifts.

### HTML Payload Size

| Metric | Value |
|--------|-------|
| /share HTML size (uncompressed) | **445 KB** |
| /share/page/2 HTML size | **557 KB** |

**HIGH -- Homepage HTML is 445 KB, pagination page 2 is 557 KB.** This is significantly above the recommended ~100 KB for initial HTML. The large size is likely due to:
1. Server-side rendered content for all article cards
2. React Router hydration data (`window.__reactRouterContext`) serialized inline
3. Inline route module manifest

The pagination page being even larger (557 KB) suggests the inline data payload grows with content. This directly impacts TTFB and LCP.

**Recommendations:**
- Reduce the number of articles per page (currently appears to show all or many articles)
- Strip inline hydration data for read-only listing pages if possible
- Consider streaming SSR to improve TTFB
- Compress and minimize the route manifest data

---

## 7. Structured Data

**Status: PASS**

### Homepage (/share)
```json
{
  "@type": "CollectionPage",
  "name": "書き起こし記事一覧",
  "mainEntity": {
    "@type": "ItemList",
    "numberOfItems": 143
  }
}
```

### Article Pages
```json
{
  "@graph": [
    {
      "@type": "Article",
      "headline": "...",
      "datePublished": "...",
      "dateModified": "...",
      "author": { "@type": "Person" },
      "publisher": { "@id": ".../#organization" },
      "speakable": { "@type": "SpeakableSpecification" },
      "articleSection": "...",
      "keywords": "..."
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [...]
    }
  ]
}
```

Both are well-formed. The Article schema includes `speakable`, `keywords`, `articleSection`, and proper `author`/`publisher` references. BreadcrumbList is properly nested.

---

## 8. JavaScript Rendering

**Status: PASS**

| Check | Result |
|-------|--------|
| Rendering mode | SSR (Server-Side Rendering) with client hydration |
| Framework | React Router v7 (Remix-based) |
| SPA mode | `false` (confirmed in `__reactRouterContext`) |
| Route discovery | Lazy (`"mode":"lazy"`) |
| JS entry | `/assets/entry.client-CS2_CXNr.js` |
| Module preloads | 8 modules preloaded |

The site uses SSR, meaning all content is available in the initial HTML response. Search engines can index content without JavaScript execution. Client-side hydration enables interactivity after initial render.

---

## 9. Asset Caching

**Status: FAIL**

| Asset | Cache-Control | Expected |
|-------|--------------|----------|
| `/assets/root-CtvcvV4p.css` | `public, max-age=0, must-revalidate` | `public, max-age=31536000, immutable` |

**HIGH -- Static assets have `max-age=0`.** The CSS file at `/assets/root-CtvcvV4p.css` (which has a content hash in the filename) returns `cache-control: public, max-age=0, must-revalidate`. Since the filename contains a hash, these files should be cached aggressively with `max-age=31536000, immutable`.

This means every page load re-validates CSS/JS assets, adding unnecessary latency and server load.

The `public/_headers` file exists but does not include asset-specific cache rules. Cloudflare Pages appears to be using default headers.

**Recommendation:** Add to `public/_headers`:
```
/assets/*
  Cache-Control: public, max-age=31536000, immutable
```

---

## 10. RSS Feed

**Status: PASS**

| Check | Result |
|-------|--------|
| URL | `/share/feed.xml` |
| HTTP status | 200 |
| Content-Type | `application/rss+xml; charset=utf-8` |
| Size | 15.9 KB |
| RSS version | 2.0 with Atom namespace |
| Self-referencing atom:link | Present |
| Homepage has `<link rel="alternate">` for RSS | Yes |

---

## Priority Matrix

### Critical (Fix immediately)

| # | Issue | Impact |
|---|-------|--------|
| 1 | **Cloudflare managed robots.txt overrides custom AI crawler rules** | AI crawlers (GPTBot, ClaudeBot, etc.) may be completely blocked from the site due to Cloudflare prepending `Disallow: /` for each AI crawler before the custom `Allow: /share/` rules. |

### High (Fix this week)

| # | Issue | Impact |
|---|-------|--------|
| 2 | **HTML payload size: 445-557 KB** | Degrades TTFB, LCP, and overall page speed. Well above the ~100 KB recommendation. |
| 3 | **Static assets cached with max-age=0** | CSS/JS files with content hashes are not being cached, causing unnecessary re-validation on every page load. |

### Medium (Fix this sprint)

| # | Issue | Impact |
|---|-------|--------|
| 4 | **Content-Type header missing charset** | `text/html` should be `text/html; charset=utf-8` to prevent encoding ambiguity. |
| 5 | **Sitemap homepage lastmod is 2017-07-19** | Misleading; should reflect latest content date. |

### Low (Backlog)

| # | Issue | Impact |
|---|-------|--------|
| 6 | No `rel="prev"`/`rel="next"` on pagination | Minor crawl signal for non-Google engines. |
| 7 | Font swap CLS potential | Minor layout shift from `display=swap`. |
| 8 | `script-src 'unsafe-inline'` in CSP | Inherent to React SSR; consider nonce-based CSP long-term. |
| 9 | Pagination pages not in sitemap | Minor; discoverable via internal links. |

---

## Implementation Checklist

- [ ] **Critical:** Disable Cloudflare AI Bots managed robots.txt (Dashboard > Security > Bots > AI Crawlers) or configure it to match custom rules
- [ ] **High:** Add `/assets/*` cache rules to `public/_headers`:
  ```
  /assets/*
    Cache-Control: public, max-age=31536000, immutable
  ```
- [ ] **High:** Reduce homepage HTML payload -- limit articles per page, minimize inline hydration data
- [ ] **Medium:** Set `Content-Type: text/html; charset=utf-8` in server responses
- [ ] **Medium:** Fix sitemap homepage `lastmod` to use latest article publication date instead of first article date

---

*Report generated by automated source-level and HTTP-level analysis. Core Web Vitals scores should be verified with field data (CrUX) and lab data (Lighthouse/PageSpeed Insights).*
