# kakiokosi.com SEO Action Plan

**Updated:** 2026-03-28
**Current Score:** 74/100 (Grade B-)
**Target Score:** 85/100+ (Grade A-)

---

## CRITICAL (fix immediately — blocks rich results or degrades performance)

### 1. Reduce Homepage HTML Payload (401KB → <100KB)
**Impact:** TTFB, LCP, crawl efficiency
**Effort:** 1 hour
**Files:** `app/routes/share._index.tsx`, `app/lib/db.server.ts`

Homepage SSR generates 401KB of HTML. Verify the loader returns only 20 articles (page 1). Check if article content is being included in listing queries.

### 2. Upload Logo Image
**Impact:** Organization schema validation, Article rich results
**Effort:** 30 minutes
**Files:** `public/logo.png`, `app/lib/schema.ts`

Organization schema references `/logo.png` which returns 404. Upload a logo (minimum 112x112px, recommended 600x60px for banner).

### 3. Add `publisher.logo` and Fallback `image` to Article Schema
**Impact:** Google Article rich results eligibility (REQUIRED fields)
**Effort:** 30 minutes
**Files:** `app/routes/share.$category.$id.tsx`

- Add `logo` ImageObject to publisher
- Add fallback image when `thumbnail_url` is null (e.g., `/images/default-og.png`)

### 4. Add Author Attribution to Articles
**Impact:** E-E-A-T, Article schema `author` field
**Effort:** 1 hour
**Files:** `app/routes/share.$category.$id.tsx`, Article JSON-LD

- Display "書き起こし.com編集部" on article pages
- Add `author` to Article JSON-LD with link to about page

---

## HIGH Priority (fix within 1 week)

### 5. Add Default OG Image for Social Sharing
**Impact:** Social preview on Twitter/X, Facebook, LINE
**Effort:** 1 hour
**Files:** `public/images/default-og.png`, all route meta functions

Create a 1200x630px default OG image. Add `og:image` meta to pages without thumbnails.

### 6. Fix Article Schema Timezones
**Impact:** ISO 8601 compliance
**Effort:** 15 minutes
**Files:** `app/routes/share.$category.$id.tsx`

Change `.replace(" ", "T")` to `.replace(" ", "T") + "+09:00"` for datePublished/dateModified.

### 7. Optimize Tag Pages in Sitemap
**Impact:** Crawl budget, thin content reduction
**Effort:** 30 minutes
**Files:** `app/routes/sitemap[.]xml.tsx`

- Raise `HAVING COUNT(pt.post_id) >= 2` to `>= 5` (reduces ~380 → ~50 tag pages)
- Add `<lastmod>` to tag URLs via `MAX(COALESCE(p.updated_at, p.published_at))`

### 8. Fix Category `<lastmod>` in Sitemap
**Impact:** Crawl scheduling accuracy
**Effort:** 30 minutes
**Files:** `app/routes/sitemap[.]xml.tsx`

Category lastmod returns NULL — debug the `post_categories` join table query.

### 9. Publish New Content
**Impact:** Content freshness — the biggest content quality gap
**Effort:** Ongoing

Last article is from 2021. Even 1-2 new transcripts/month would reset freshness signals.

---

## MEDIUM Priority (fix within 1 month)

### 10. Add BreadcrumbList to Category and Static Pages
**Impact:** Breadcrumb rich results on more page types
**Effort:** 1 hour
**Files:** Category and static route files, use existing `breadcrumbSchema()` from `app/lib/schema.ts`

### 11. Add CollectionPage Schema to Category Pages
**Impact:** Enhanced indexing signals
**Effort:** 30 minutes
**Files:** `app/routes/share.category.$slug.tsx`, use existing `collectionPageSchema()` from `app/lib/schema.ts`

### 12. Expand Category Descriptions
**Impact:** Thin content elimination
**Effort:** 2 hours
**Files:** DB pages or inline in category route

Add 100-200 words intro text per category.

### 13. Improve Article Meta Descriptions
**Impact:** CTR from search results
**Effort:** 3 hours
**Files:** `app/routes/share.$category.$id.tsx`

Generate excerpt-based descriptions (120-160 chars) instead of repeating titles.

### 14. Self-Host Critical Fonts / Replace Material Symbols
**Impact:** LCP, fewer render-blocking requests
**Effort:** 3 hours

Replace Material Symbols Outlined (~200KB) with inline SVG icons (only ~5 icons used). Consider self-hosting Noto fonts with unicode-range subsetting.

### 15. Increase Internal Links in Articles
**Impact:** Link equity distribution, engagement
**Effort:** 3-4 hours

Articles average 3 internal links for 8k+ words. Add related articles component showing 3-4 related transcripts by category/tag.

### 16. Merge Duplicate JSON-LD @graph Blocks
**Impact:** Cleaner schema, avoid ambiguity
**Effort:** 1 hour
**Files:** `root.tsx` + `share.$category.$id.tsx`

Use `@id` references instead of duplicating Organization data.

---

## LOW Priority (backlog)

| # | Task | Effort |
|---|------|--------|
| 17 | Consolidate robots.txt `User-agent: *` blocks | 15 min |
| 18 | Add `charset=utf-8` to Content-Type header | 15 min |
| 19 | Increase pagination touch targets to 48x48px | 15 min |
| 20 | Add HSTS `preload` directive | 15 min |
| 21 | Add llms.txt | 30 min |
| 22 | Add SearchAction to WebSite schema (requires search feature) | 1 hour |
| 23 | Implement responsive images (srcset/sizes) | 3 hours |
| 24 | Fix legacy image alt text in WP content | 2 hours |
| 25 | Add full Content-Security-Policy header | 1 hour |
| 26 | Wire up existing `JsonLd` component + `schema.ts` helpers | 1 hour |

---

## Score Projection

| Action Group | Items | Expected Impact |
|-------------|-------|----------------|
| Critical (1-4) | Fix now | +6-8 points → 80-82 |
| High (5-9) | This week | +4-6 points → 84-88 |
| Medium (10-16) | This month | +4-5 points → 88-93 |
| Low (17-26) | Backlog | +2-3 points → 90-96 |

---

*Action plan generated 2026-03-28 from 4 specialist audits*
