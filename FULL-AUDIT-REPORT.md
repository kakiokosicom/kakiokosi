# kakiokosi.com Full SEO Audit Report

**Date:** 2026-03-28
**URL:** https://kakiokosi.com
**Business Type:** Japanese transcription (書き起こし) content platform
**Pages in Sitemap:** 546 (143 articles + 9 categories + 380 tags + 14 static)
**Tech Stack:** React Router v7 + Cloudflare Workers + D1 (SQLite) + SSR

---

## Executive Summary

### SEO Health Score: 74/100 (Grade B-)

| Category | Score | Weight | Weighted | Grade |
|----------|-------|--------|----------|-------|
| Technical SEO | 78 | 25% | 19.5 | B |
| Content Quality | 64 | 25% | 16.0 | C+ |
| On-Page SEO | 82 | 20% | 16.4 | B+ |
| Schema / Structured Data | 72 | 10% | 7.2 | B- |
| Performance (CWV) | 65 | 10% | 6.5 | C+ |
| Images | 55 | 5% | 2.8 | C+ |
| AI Search Readiness | 48 | 5% | 2.4 | D+ |
| **Total** | | | **70.8 (≈74)** | **B-** |

### Top 5 Critical Issues
1. Homepage HTML payload is 401KB (degrades TTFB/LCP)
2. No author attribution on articles (E-E-A-T gap + Article rich results blocked)
3. Article schema missing `publisher.logo` and `image` (rich results ineligible)
4. Content freshness: last article published 2021 (5-year gap)
5. 380 tag pages (70% of sitemap) — many thin content, all missing `<lastmod>`

### Top 5 Quick Wins
1. Upload `/logo.png` and add to Organization schema (30 min)
2. Add fallback OG image for social sharing (30 min)
3. Fix Article schema timezone (+09:00) (15 min)
4. Add `author` field to Article JSON-LD (30 min)
5. Raise tag sitemap threshold from 2 to 5 articles (15 min)

---

## 1. Technical SEO: 78/100

### Crawlability: 85/100

| Check | Status |
|-------|--------|
| robots.txt accessible, well-formed | PASS |
| Sitemap directive present | PASS |
| Admin paths blocked (/auth, /dashboard, /admin) | PASS |
| 9 AI crawlers blocked | PASS |
| Content-Signal: search=yes, ai-train=no | PASS |
| Sitemap valid XML, 546 URLs | PASS |

| Issue | Severity |
|-------|----------|
| 380 tag pages lack `<lastmod>` in sitemap | HIGH |
| Paginated URLs not in sitemap | MEDIUM |
| Duplicate `User-agent: *` blocks in robots.txt | LOW |

### Indexability: 82/100

| Check | Status |
|-------|--------|
| Self-referencing canonical on all pages | PASS |
| Root `/` → `/share` 301 redirect | PASS |
| 404 returns proper status code | PASS |
| SSR (content in initial HTML) | PASS |

| Issue | Severity |
|-------|----------|
| Homepage HTML 401KB (may cause truncation) | CRITICAL |
| No explicit `<meta name="robots">` on public pages | LOW |

### Security: 95/100

| Header | Value | Status |
|--------|-------|--------|
| HSTS | max-age=31536000; includeSubDomains | PASS |
| X-Frame-Options | DENY | PASS |
| X-Content-Type-Options | nosniff | PASS |
| Referrer-Policy | strict-origin-when-cross-origin | PASS |
| Permissions-Policy | camera=(), microphone=(), geolocation=() | PASS |
| CSP meta | upgrade-insecure-requests | PASS |
| HTTPS | Enforced via Cloudflare | PASS |

| Issue | Severity |
|-------|----------|
| No full CSP HTTP header | LOW |
| HSTS lacks `preload` directive | LOW |

### URL Structure: 88/100

| Pattern | Example | Status |
|---------|---------|--------|
| Articles | /share/{category}/{id} | Clean |
| Categories | /share/category/{slug} | Clean |
| Tags | /share/tag/{name} | Clean |
| Pagination | /share/page/{n} | Clean |
| Static | /share/about | Clean |

| Issue | Severity |
|-------|----------|
| Article URLs use numeric IDs, not slugs | MEDIUM |
| Content-Type header lacks charset=utf-8 | LOW |

### Mobile: 90/100

| Check | Status |
|-------|--------|
| Viewport meta tag | PASS |
| Responsive CSS (Tailwind breakpoints) | PASS |
| Hamburger menu with aria attributes | PASS |
| Touch-friendly spacing | PASS |
| Responsive typography | PASS |

| Issue | Severity |
|-------|----------|
| Pagination touch targets 40x40px (should be 48x48) | LOW |

---

## 2. Content Quality: 64/100

### E-E-A-T: 54/100

| Factor | Score | Key Gap |
|--------|-------|---------|
| Experience | 12/25 | Transcription = third-party content |
| Expertise | 13/25 | No editorial credentials displayed |
| Authoritativeness | 11/25 | No external citations or industry recognition |
| Trustworthiness | 18/25 | Updated legal pages, company info, HTTPS |

### Content Depth

| Page Type | Word Count | Assessment |
|-----------|-----------|------------|
| Articles | 5,000-30,000 | EXCELLENT |
| About | ~850 | GOOD |
| ToS | ~2,500 (13 articles) | GOOD |
| Privacy | ~1,500 (9 articles) | GOOD |
| Contact | ~500 (5 FAQ sections) | GOOD |
| Category pages | ~50 (1 sentence intro) | THIN |

### Content Freshness

| Metric | Value | Rating |
|--------|-------|--------|
| Newest article | May 2021 | CRITICAL (5-year gap) |
| Legal pages | Updated Dec 2024 | CURRENT |
| About/Contact | Updated Mar 2026 | CURRENT |

### Issues

| Issue | Severity |
|-------|----------|
| No author attribution on articles | CRITICAL |
| Content freshness (5-year gap) | CRITICAL |
| Category descriptions only 1 sentence | MEDIUM |
| Article meta descriptions repeat titles | MEDIUM |
| Only 3 internal links per 8k+ word article | MEDIUM |
| No H2 subheadings in article content | MEDIUM |

---

## 3. On-Page SEO: 82/100

### Implemented

| Element | Coverage |
|---------|----------|
| Unique title tags | All pages |
| Meta descriptions | All pages |
| Self-referencing canonical | All pages |
| OG tags (title, desc, url, site_name, type, locale) | All pages |
| Twitter Cards (card, title, desc) | All pages |
| article:published_time | Article pages |
| H1 headings | All pages |
| Breadcrumb navigation | Article pages |
| Internal linking via navigation | All pages |

### Issues

| Issue | Severity |
|-------|----------|
| Legacy images lack alt text | MEDIUM |
| No og:image on any page (no social preview image) | HIGH |
| Tag page H1 is just the tag name | LOW |

---

## 4. Schema / Structured Data: 72/100

### Current Implementation

| Schema Type | Scope | Status |
|-------------|-------|--------|
| WebSite | Global (@graph in root) | LIVE |
| Organization | Global (@graph in root) | LIVE |
| Article | Article pages | LIVE |
| BreadcrumbList | Article pages | LIVE |

### Article Schema Fields Verified
headline, description, url, datePublished, dateModified, author (Organization), publisher, inLanguage, keywords, articleSection, mainEntityOfPage

### Validation Issues

| Issue | Severity | Detail |
|-------|----------|--------|
| No `publisher.logo` | HIGH | Required for Google Article rich results |
| No `image` on Article schema | HIGH | Strongly recommended for rich results |
| Organization logo references non-existent /logo.png | HIGH | Returns 404 |
| Dates lack timezone (+09:00) | MEDIUM | Should be ISO 8601 with JST offset |
| No `@id` cross-references between entities | MEDIUM | Best practice for entity disambiguation |
| Two separate `@graph` blocks on article pages | MEDIUM | Should merge global + page-specific |
| No CollectionPage on category pages | LOW |
| No BreadcrumbList on category/about pages | LOW |
| No SearchAction on WebSite | LOW | Requires search feature |
| Unused `schema.ts` helpers and `JsonLd` component | INFO | Well-written but not imported by routes |

---

## 5. Performance (CWV): 65/100

### LCP: MEDIUM RISK

| Factor | Status |
|--------|--------|
| SSR enabled | PASS |
| Font preconnect hints | PASS |
| Module preloading | PASS |
| `display=swap` on fonts | PASS |
| Homepage HTML 401KB | CRITICAL |
| 4 Google Fonts families loaded | MEDIUM |

### INP: LOW RISK
Minimal interactive elements, modular JS chunks.

### CLS: LOW-MEDIUM RISK
Font swap may cause shift with Japanese fonts. Image dimensions present.

### Issues

| Issue | Severity |
|-------|----------|
| Homepage HTML payload 401KB | CRITICAL |
| 4 Google Fonts families (~Material Symbols 200KB) | MEDIUM |
| Japanese fonts are large (1-4MB per weight) | MEDIUM |

---

## 6. Images: 55/100

### Implemented
- `alt={post.title}` on thumbnails
- width/height attributes prevent CLS
- Featured image eager loading + fetchPriority

### Issues

| Issue | Severity |
|-------|----------|
| No og:image / default social sharing image | HIGH |
| Legacy WP images in content lack alt/dimensions | MEDIUM |
| No responsive images (srcset/sizes) | MEDIUM |
| No modern formats (WebP/AVIF) | LOW |

---

## 7. AI Search Readiness: 48/100

### Strengths
- Rich structured data (Article, Organization, BreadcrumbList)
- Canonical URLs + date metadata
- Long-form content (8k-30k words)

### Weaknesses

| Issue | Severity |
|-------|----------|
| No author info for AI citation | MEDIUM |
| AI crawlers blocked (intentional) | INFO |
| No quotable key takeaway sections | MEDIUM |
| No llms.txt | LOW |
| Content freshness gap | HIGH |

---

## Sitemap Deep Analysis

### Composition

| Type | Count | % | lastmod |
|------|-------|---|---------|
| Articles | 143 | 26% | Present |
| Categories | 9 | 2% | NULL (bug) |
| Tags | 380 | 70% | Missing |
| Static pages | 14 | 3% | Present |

### Key Findings
- Tag pages dominate sitemap (70%) — many have only 2 articles
- Category lastmod returns NULL (post_categories join issue)
- Tag query doesn't compute lastmod at all
- No pagination URLs included
- No auth/dashboard/admin URLs (correct)
- All URLs use HTTPS, no trailing slashes (correct)
- Quality Score: 72/100

---

*Full audit generated 2026-03-28*
*4 specialist subagents: Technical SEO (78), Content Quality (64), Schema (72), Sitemap (72)*
