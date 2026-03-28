# kakiokosi.com SEO Action Plan (Updated Post-Fix)

**Updated:** 2026-03-28
**Current Score:** 72/100 (was 42/100)
**Target Score:** 85/100+

---

## Completed (22 fixes deployed)

All critical and high-priority items from the initial audit have been implemented and verified live. See FULL-AUDIT-REPORT.md for the complete list.

---

## Remaining: HIGH Priority (fix within 1 week)

### 1. Add Author Attribution to Articles
**Impact:** E-E-A-T, Article schema completeness
**Effort:** 2-3 hours

Display author/editorial team info on article pages. Add `author` field to Article JSON-LD. Even a generic "書き起こし.com編集部" with link to about page would improve signals.

### 2. Publish New Content
**Impact:** Content freshness — the biggest remaining gap
**Effort:** Ongoing

Last article is from 2021. A 5-year content gap signals an abandoned site to search engines. Even 1-2 new transcripts per month would dramatically improve freshness signals.

### 3. Limit Tag Pages in Sitemap
**Impact:** Crawl budget optimization
**Effort:** 1 hour

711 tag pages = 77% of sitemap. Many tags may have only 1 article. Filter to tags with 3+ articles to reduce sitemap to a more focused set.

---

## Remaining: MEDIUM Priority (fix within 1 month)

### 4. Add Category Descriptions
**Impact:** Thin content elimination, keyword targeting
**Effort:** 2 hours

Each category page shows only a heading + listings. Add 100-200 words of intro text per category.

### 5. Update Privacy Policy
**Impact:** Trust signals, legal compliance
**Effort:** 2-3 hours (legal review)

Current policy dates from 2011. Needs GDPR-era updates.

### 6. Self-Host Critical Fonts
**Impact:** LCP improvement, fewer external requests
**Effort:** 2-3 hours

Replace Google Fonts external stylesheets with self-hosted font files. Especially Material Symbols Outlined which is ~200KB.

### 7. Add Related Articles Component
**Impact:** Internal linking, engagement, bounce rate
**Effort:** 3-4 hours

Show 3-4 related articles by category/tag at the bottom of each article.

### 8. Add `og:locale` Tag
**Impact:** Social sharing, i18n signals
**Effort:** 15 minutes

Add `{ property: "og:locale", content: "ja_JP" }` to root or per-route meta.

---

## Remaining: LOW Priority (backlog)

### 9. Consolidate robots.txt Blocks
Merge the two `User-agent: *` blocks into one clean section.

### 10. Add Organization Logo to Schema
Upload logo image and reference in Organization JSON-LD.

### 11. Add CollectionPage Schema to Categories
Enhances category page rich results.

### 12. Responsive Images via Cloudflare Image Resizing
srcset/sizes for mobile optimization.

### 13. Add llms.txt
Machine-readable AI usage policy file.

### 14. Fix Legacy Image Alt Text in Content
WordPress-migrated `<img>` tags in post.content still lack proper alt text.

---

## Score Projection

| Action | Expected Impact |
|--------|----------------|
| Items 1-3 (HIGH) | +5-7 points → 77-79 |
| Items 4-8 (MEDIUM) | +5-7 points → 82-86 |
| Items 9-14 (LOW) | +2-3 points → 84-89 |

---

*Action plan updated 2026-03-28*
