# kakiokosi.com SEO Re-Audit Report (Post-Fix)

**Date:** 2026-03-28
**URL:** https://kakiokosi.com
**Business Type:** Japanese transcription (書き起こし) content platform
**Pages in Sitemap:** 928 (161 articles + 9 categories + 711 tags + 47 static/feature)
**Tech Stack:** React Router v7 + Cloudflare Pages + D1 (SQLite) + SSR

---

## Executive Summary

### SEO Health Score: 72/100 (was 42/100 — +30 points)

| Category | Before | After | Weight | Weighted |
|----------|--------|-------|--------|----------|
| Technical SEO | 55 | 82 | 25% | 20.5 |
| Content Quality | 45 | 58 | 25% | 14.5 |
| On-Page SEO | 35 | 78 | 20% | 15.6 |
| Schema / Structured Data | 5 | 75 | 10% | 7.5 |
| Performance (CWV) | 60 | 72 | 10% | 7.2 |
| Images | 15 | 55 | 5% | 2.8 |
| AI Search Readiness | 25 | 50 | 5% | 2.5 |
| **Total** | **42** | **72** | | **70.6** |

### All Fixes Verified Live

| Fix | Status |
|-----|--------|
| Canonical tags on all pages | LIVE |
| Article JSON-LD (Article + BreadcrumbList) | LIVE |
| WebSite/Organization JSON-LD (global) | LIVE |
| Homepage pagination (/share/page/2) | FIXED (was 404) |
| Homepage redirect 301 | LIVE |
| Security headers (HSTS, nosniff, X-Frame) | LIVE |
| robots.txt (disallow auth/dashboard + AI blocks) | LIVE |
| noindex on auth/dashboard pages | LIVE |
| Image alt text (post title) | LIVE |
| Image dimensions (width/height) | LIVE |
| Featured image LCP (eager + fetchPriority) | LIVE |
| OG tags on all page types | LIVE |
| Twitter cards on all page types | LIVE |
| Tag pages in sitemap (711 URLs) | LIVE |
| priority/changefreq removed from sitemap | LIVE |
| Japanese category H1s | LIVE |
| Breadcrumb navigation on articles | LIVE |
| Mobile hamburger menu | LIVE |
| About page expanded (~550 words) | LIVE |
| Contact page fixed (email + FAQ) | LIVE |
| Copyright year dynamic (2024–2026) | LIVE |
| Article CSS formatting for WP content | LIVE |

### Top 5 Remaining Issues
1. No author attribution on articles (E-E-A-T gap)
2. Content freshness — last article published 2021 (5+ year gap)
3. 711 tag pages in sitemap (77%) — potential crawl budget concern
4. Category pages have no descriptive intro text
5. Privacy policy still outdated (2011)

---

## 1. Technical SEO: 82/100 (was 55, +27)

### Verified Fixes
- Canonical tags on all public pages
- Meta robots noindex on auth/dashboard routes
- Homepage redirect changed from 302 to 301
- Homepage pagination route created (`/share/page/2` returns 200)
- Security headers via Cloudflare Worker (HSTS, X-Frame-Options: DENY, nosniff, Referrer-Policy, Permissions-Policy)
- robots.txt blocks /auth/, /dashboard/, /admin/ + 9 AI crawlers
- Mobile hamburger menu for category navigation

### Remaining Issues
| Issue | Severity |
|-------|----------|
| 711 tag pages may strain crawl budget | MEDIUM |
| Category pages lack lastmod in sitemap | LOW |
| Duplicate `User-agent: *` blocks in robots.txt | LOW |

---

## 2. Content Quality: 58/100 (was 45, +13)

### Verified Fixes
- About page expanded to ~550 words with mission, features, target audience
- Contact page fixed — email + FAQ (no broken shortcode)
- Japanese category labels in headings
- Article CSS formatting improved for WordPress content

### E-E-A-T Scores
| Factor | Before | After |
|--------|--------|-------|
| Experience | 25 | 30 |
| Expertise | 30 | 35 |
| Authoritativeness | 25 | 35 |
| Trustworthiness | 40 | 55 |

### Remaining Issues
| Issue | Severity |
|-------|----------|
| No author attribution on articles | HIGH |
| Content freshness (last article 2021) | HIGH |
| No category descriptions | MEDIUM |
| Privacy policy outdated | MEDIUM |

---

## 3. On-Page SEO: 78/100 (was 35, +43)

### Verified Fixes
- Descriptive title tags on all page types
- Meta descriptions on all page types
- Self-referencing canonical tags
- OG tags (title, description, url, site_name, type, image)
- Twitter cards (card, title, description, image)
- article:published_time on articles
- Visual breadcrumbs on article pages
- Japanese H1 headings for categories

### Remaining Issues
| Issue | Severity |
|-------|----------|
| Legacy images in content lack alt text | MEDIUM |
| No og:locale tag | LOW |
| Tag page H1 is just the tag name | LOW |

---

## 4. Schema / Structured Data: 75/100 (was 5, +70)

### Current Implementation
| Schema Type | Scope | Status |
|-------------|-------|--------|
| WebSite | Global (root layout) | LIVE |
| Organization | Global (root layout) | LIVE |
| Article | All article pages | LIVE |
| BreadcrumbList | All article pages | LIVE |

### Article Schema Fields Verified
headline, datePublished, dateModified, publisher, keywords, articleSection, mainEntityOfPage, url

### Remaining Gaps
| Missing | Severity |
|---------|----------|
| Article `author` field | HIGH |
| Organization `logo` | LOW |
| CollectionPage on category pages | LOW |

---

## 5. Performance (CWV): 72/100 (was 60, +12)

### Verified Fixes
- Featured image: `loading="eager"` + `fetchPriority="high"`
- Image dimensions prevent CLS
- Font weights subset (fewer variants loaded)

### Remaining Concerns
| Issue | Severity |
|-------|----------|
| External Google Fonts (2 requests) | MEDIUM |
| Material Symbols icon font | MEDIUM |

---

## 6. Images: 55/100 (was 15, +40)

### Verified Fixes
- `alt={post.title}` on all thumbnail/hero images
- width/height attributes on featured and card images
- Featured image eager loading for LCP

### Remaining Issues
| Issue | Severity |
|-------|----------|
| Legacy images in post.content lack alt/dimensions | MEDIUM |
| No responsive images (srcset) | MEDIUM |
| No modern formats (WebP/AVIF) | LOW |

---

## 7. AI Search Readiness: 50/100 (was 25, +25)

### Verified Fixes
- Structured data for AI parsing (Article, BreadcrumbList, WebSite)
- Canonical URLs for citation targeting
- Date metadata (schema + meta tags)
- AI crawler policy in robots.txt

### Remaining Gaps
| Issue | Severity |
|-------|----------|
| No author info for citation | MEDIUM |
| AI crawler blocking prevents citation | INFO |
| No llms.txt | LOW |

---

## Score Summary

| Category | Before | After | Change | Grade |
|----------|--------|-------|--------|-------|
| Technical SEO | 55 | 82 | +27 | B+ |
| Content Quality | 45 | 58 | +13 | C+ |
| On-Page SEO | 35 | 78 | +43 | B+ |
| Schema / Structured Data | 5 | 75 | +70 | B |
| Performance (CWV) | 60 | 72 | +12 | B- |
| Images | 15 | 55 | +40 | C+ |
| AI Search Readiness | 25 | 50 | +25 | C |
| **Overall** | **42** | **72** | **+30** | **B-** |

---

*Re-audit report generated 2026-03-28*
*Previous audit: 42/100 (Grade D) → Current: 72/100 (Grade B-)*
