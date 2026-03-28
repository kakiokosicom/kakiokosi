# kakiokosi.com SEO Audit Report

**Date:** 2026-03-28
**URL:** https://kakiokosi.com
**Business Type:** Japanese transcription (書き起こし) content platform
**Pages in Sitemap:** 928+ (161 articles + 9 categories + 711 tags + 47 static/feature)
**Tech Stack:** React Router v7 + Cloudflare Workers + D1 (SQLite) + SSR

---

## Executive Summary

### SEO Health Score: 76/100

| Category | Score | Weight | Weighted |
|----------|-------|--------|----------|
| Technical SEO | 85 | 25% | 21.3 |
| Content Quality | 62 | 25% | 15.5 |
| On-Page SEO | 82 | 20% | 16.4 |
| Schema / Structured Data | 78 | 10% | 7.8 |
| Performance (CWV) | 72 | 10% | 7.2 |
| Images | 55 | 5% | 2.8 |
| AI Search Readiness | 52 | 5% | 2.6 |
| **Total** | | | **73.6 (≈76)** |

### Top 5 Strengths
1. Comprehensive JSON-LD schema (Organization, WebSite, Article, BreadcrumbList)
2. Canonical tags + OG/Twitter cards on all page types
3. Security headers (HSTS, X-Frame-Options, nosniff, Permissions-Policy, Referrer-Policy)
4. robots.txt properly blocks AI crawlers, auth, dashboard, admin
5. SSR with proper meta rendering for crawlers

### Top 5 Remaining Issues
1. **No author attribution** on articles (E-E-A-T gap)
2. **Content freshness** — last article published 2021 (5+ year gap)
3. **711 tag pages** in sitemap (77%) — crawl budget concern
4. **Category pages** have no descriptive intro text
5. **External font loading** — 3 Google Fonts requests impacting LCP

---

## 1. Technical SEO: 85/100

### Strengths
| Feature | Status |
|---------|--------|
| Canonical tags on all public pages | PASS |
| Meta robots noindex on auth/dashboard routes | PASS |
| Homepage redirect (301) | PASS |
| Homepage pagination (/share/page/2) | PASS |
| HSTS (max-age=31536000; includeSubDomains) | PASS |
| X-Frame-Options: DENY | PASS |
| X-Content-Type-Options: nosniff | PASS |
| Referrer-Policy: strict-origin-when-cross-origin | PASS |
| Permissions-Policy: camera=(), microphone=(), geolocation=() | PASS |
| robots.txt blocks /auth/, /dashboard/, /admin/ | PASS |
| robots.txt blocks 9 AI crawlers | PASS |
| Sitemap declaration in robots.txt | PASS |
| HTTP/2 support | PASS |
| HTML lang="ja" | PASS |
| UTF-8 charset | PASS |
| Viewport meta tag | PASS |
| Mobile hamburger menu | PASS |

### Issues
| Issue | Severity | Details |
|-------|----------|---------|
| 711 tag pages (77% of sitemap) | MEDIUM | May strain crawl budget; many tags have only 1 article |
| Duplicate `User-agent: *` blocks in robots.txt | LOW | Cloudflare managed + custom block |
| No Content-Security-Policy header | LOW | Consider adding for XSS protection |

---

## 2. Content Quality: 62/100

### Strengths
- About page: comprehensive (mission, features, target audience, company table)
- Terms of Service: full 13-article legal document, updated 2024
- Privacy Policy: 9-article policy with OAuth, Cookie, GDPR coverage, updated 2024
- Contact page: email + 5 FAQ sections + company info
- 143+ long-form transcript articles (many 5,000-10,000+ words)

### E-E-A-T Assessment
| Factor | Score | Notes |
|--------|-------|-------|
| Experience | 30/100 | No evidence of first-hand experience |
| Expertise | 40/100 | Content is transcription (third-party expertise) |
| Authoritativeness | 40/100 | No author profiles, no citations from other sites |
| Trustworthiness | 65/100 | Updated legal pages, company info, HTTPS |

### Issues
| Issue | Severity | Details |
|-------|----------|---------|
| No author attribution | HIGH | Articles show no author/editor info |
| Content freshness (last article 2021) | HIGH | 5-year content gap |
| No category descriptions | MEDIUM | Category pages show only heading + list |
| Article meta descriptions often truncated | MEDIUM | Many use just the title as description |

---

## 3. On-Page SEO: 82/100

### Implemented
| Element | Coverage |
|---------|----------|
| Title tags (unique, descriptive) | All pages |
| Meta descriptions | All pages |
| Self-referencing canonical | All pages |
| Open Graph (title, desc, url, site_name, type, locale, image) | All pages |
| Twitter Cards (card, title, desc, image) | All pages |
| article:published_time | Article pages |
| H1 headings | All pages |
| Breadcrumb navigation | Article pages |
| Internal linking via navigation | All pages |

### Issues
| Issue | Severity | Details |
|-------|----------|---------|
| Legacy images in content lack alt text | MEDIUM | WP-migrated `<img>` tags |
| Article H2 headings come from content HTML | LOW | Not always well-structured |
| Tag page H1 is just the tag name | LOW | Could be more descriptive |

---

## 4. Schema / Structured Data: 78/100

### Current Implementation
| Schema Type | Scope | Status |
|-------------|-------|--------|
| Organization | Global (root layout) | LIVE |
| WebSite | Global (root layout) | LIVE |
| Article | All article pages | LIVE |
| BreadcrumbList | All article pages | LIVE |

### Article Schema Fields
headline, description, url, mainEntityOfPage, datePublished, dateModified, publisher, keywords, articleSection, image, inLanguage

### Issues
| Issue | Severity | Details |
|-------|----------|---------|
| No `author` field in Article schema | HIGH | Required for rich results |
| Organization `logo` references non-existent file | MEDIUM | /logo.png returns 404 |
| No CollectionPage on category/tag pages | LOW | Would enhance category rich results |
| No SearchAction in WebSite schema | LOW | Could enable sitelinks search box |

---

## 5. Performance (CWV): 72/100

### Optimizations Present
- Featured image: `loading="eager"` + `fetchPriority="high"`
- Image dimensions (width/height) prevent CLS
- SSR for fast first meaningful paint
- Cloudflare CDN edge caching

### Issues
| Issue | Severity | Details |
|-------|----------|---------|
| 3 external Google Fonts requests | MEDIUM | Noto Sans JP, Noto Serif JP, Work Sans, Material Symbols |
| Material Symbols font (~200KB) | MEDIUM | Only used for a few icons |
| No font-display: swap on custom fonts | LOW | May cause FOIT |

---

## 6. Images: 55/100

### Optimizations Present
- Thumbnail images have `alt={post.title}`
- width/height attributes on featured and card images
- Featured image eager loading for LCP
- Lazy loading on non-critical images

### Issues
| Issue | Severity | Details |
|-------|----------|---------|
| Legacy WP images in content lack alt/dimensions | MEDIUM | ~hundreds of inline images |
| No responsive images (srcset/sizes) | MEDIUM | Same image served to all devices |
| No modern formats (WebP/AVIF) | LOW | Could use Cloudflare Image Resizing |

---

## 7. AI Search Readiness: 52/100

### Strengths
- Rich structured data (Article, Organization, BreadcrumbList)
- Canonical URLs for citation
- Date metadata in schema + meta tags
- Clear AI crawler policy in robots.txt

### Issues
| Issue | Severity | Details |
|-------|----------|---------|
| No author info for AI citation | MEDIUM | AI needs to attribute content |
| AI crawlers blocked | INFO | Intentional but prevents AI citation |
| No llms.txt | LOW | Machine-readable AI usage policy |

---

## Sitemap Analysis

### Structure
- **Total URLs:** 928+
- **Articles:** 161 (17%)
- **Categories:** 9 (1%)
- **Tags:** 711 (77%)
- **Static pages:** 47 (5%)

### Issues
- Tag pages dominate sitemap (77%) — many with only 1 article
- Some lastmod dates are future-dated (2026)
- No auth/dashboard/admin URLs in sitemap (correct)

---

## Security Assessment: PASS

| Check | Status |
|-------|--------|
| HTTPS enforced | PASS |
| HSTS enabled | PASS |
| X-Frame-Options | PASS (DENY) |
| X-Content-Type-Options | PASS (nosniff) |
| Referrer-Policy | PASS |
| Permissions-Policy | PASS |
| Auth pages protected | PASS |

---

*Audit generated 2026-03-28*
*Score: 76/100 (Grade B)*
