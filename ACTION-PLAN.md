# kakiokosi.com SEO Action Plan

**Updated:** 2026-03-28
**Current Score:** 76/100 (Grade B)
**Target Score:** 85/100+ (Grade A-)

---

## Completed (25+ fixes deployed)

- Canonical tags on all pages
- JSON-LD: Article, BreadcrumbList, Organization, WebSite
- OG tags + Twitter Cards on all page types
- Security headers (HSTS, X-Frame, nosniff, Referrer-Policy, Permissions-Policy)
- robots.txt: blocks auth/dashboard/admin + 9 AI crawlers
- Meta robots noindex on auth/dashboard pages
- Homepage 301 redirect + pagination
- Featured image LCP optimization (eager + fetchPriority)
- Image alt text + dimensions on thumbnails
- About page: mission, features, target audience, company info
- Terms of Service: modernized 13-article document (2024 revision)
- Privacy Policy: 9-article policy with OAuth/Cookie/GDPR (2024 revision)
- Contact page: email + 5 FAQ sections + company info
- Mobile hamburger menu
- Breadcrumb navigation on articles
- Dynamic copyright year
- Article CSS formatting for legacy WordPress content
- Japanese category H1 headings
- Tag pages in sitemap

---

## Remaining: CRITICAL (fix immediately)

*None — all critical issues resolved*

---

## Remaining: HIGH Priority (fix within 1 week)

### 1. Add Author Attribution to Articles
**Impact:** E-E-A-T, Article schema completeness, rich results eligibility
**Effort:** 2-3 hours

- Display "書き起こし.com編集部" as author on article pages
- Add `author` field to Article JSON-LD schema
- Link author name to /share/about page
- This is the #1 gap for Google rich results

### 2. Publish New Content
**Impact:** Content freshness — the single biggest remaining gap
**Effort:** Ongoing

Last article is from 2021. A 5-year content gap signals an abandoned site. Even 1-2 new transcripts per month would dramatically improve freshness signals and indexing frequency.

### 3. Optimize Tag Pages in Sitemap
**Impact:** Crawl budget optimization
**Effort:** 1 hour

711 tag pages = 77% of sitemap. Filter to tags with 3+ articles to reduce sitemap size and focus crawl budget on high-value pages.

### 4. Upload Organization Logo
**Impact:** Schema validation, brand visibility
**Effort:** 30 minutes

Organization schema references `/logo.png` which returns 404. Upload a logo image file.

---

## Remaining: MEDIUM Priority (fix within 1 month)

### 5. Add Category Descriptions
**Impact:** Thin content elimination, keyword targeting
**Effort:** 2 hours

Each category page shows only a heading + article grid. Add 100-200 words of intro text per category explaining the content scope.

### 6. Self-Host Critical Fonts
**Impact:** LCP improvement, fewer render-blocking requests
**Effort:** 2-3 hours

Replace 3 Google Fonts requests with self-hosted font files. Replace Material Symbols Outlined (~200KB) with inline SVG icons (only ~5 icons used).

### 7. Improve Article Meta Descriptions
**Impact:** CTR from search results
**Effort:** 3-4 hours

Many articles use just the title as meta description. Generate meaningful excerpt-based descriptions (120-160 chars) from article content.

### 8. Add Related Articles Component
**Impact:** Internal linking, engagement, bounce rate
**Effort:** 3-4 hours

Show 3-4 related articles by category/tag at the bottom of each article page.

### 9. Add SearchAction to WebSite Schema
**Impact:** Sitelinks search box in Google results
**Effort:** 30 minutes

Add `potentialAction: { "@type": "SearchAction" }` to WebSite JSON-LD if search functionality is added.

---

## Remaining: LOW Priority (backlog)

### 10. Consolidate robots.txt Blocks
Merge the two `User-agent: *` blocks into one.

### 11. Add CollectionPage Schema to Categories
Enhances category page structured data.

### 12. Implement Responsive Images
srcset/sizes + Cloudflare Image Resizing for mobile.

### 13. Add llms.txt
Machine-readable AI usage policy file.

### 14. Fix Legacy Image Alt Text
WordPress-migrated `<img>` tags in post.content lack proper alt text.

### 15. Add Content-Security-Policy Header
Additional XSS protection.

---

## Score Projection

| Action Group | Expected Impact |
|-------------|----------------|
| Items 1-4 (HIGH) | +5-7 points → 81-83 |
| Items 5-9 (MEDIUM) | +5-7 points → 86-90 |
| Items 10-15 (LOW) | +2-3 points → 88-93 |

---

*Action plan updated 2026-03-28*
