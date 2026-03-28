# Sitemap Audit Report: kakiokosi.com

**Date:** 2026-03-28
**Source file:** `app/routes/sitemap[.]xml.tsx`
**Live URL:** https://kakiokosi.com/sitemap.xml

---

## Summary

| Metric | Value |
|--------|-------|
| Total `<url>` entries | 546 |
| Post URLs | 148 |
| Category URLs | 9 |
| Tag URLs | 380 |
| Static page URLs | 13 (+ 1 top page) |
| URLs without `<lastmod>` | 389 (all categories + tags) |
| Duplicate URLs | 3 |

---

## Validation Results

| # | Check | Result | Severity | Notes |
|---|-------|--------|----------|-------|
| 1 | XML well-formed | PASS | -- | Parses without errors |
| 2 | 50,000 URL limit | PASS | -- | 546 URLs, well under limit |
| 3 | Sitemap declared in robots.txt | PASS | -- | Line 30 of robots.txt |
| 4 | HTTP 200 for /sitemap.xml | PASS | -- | Returns 200 with correct Content-Type |
| 5 | All static pages return 200 | **FAIL** | Critical | All 13 static pages return HTTP 500 |
| 6 | Root URL (/) in sitemap | **FAIL** | High | / redirects 301 to /share but neither / nor canonical is listed properly |
| 7 | Deprecated tags (priority, changefreq) | **INFO** | Low | Both are present; Google ignores them |
| 8 | lastmod accuracy | **FAIL** | Medium | 76 posts share identical lastmod 2014-10-29 (likely a bulk migration artifact) |
| 9 | Duplicate URLs in sitemap | **FAIL** | Medium | 3 duplicate tag entries |
| 10 | Non-ASCII characters in URLs | **WARN** | Medium | 328 tag URLs contain unencoded Japanese characters |
| 11 | Location/doorway page check | PASS | -- | No location pages; quality gate not triggered |

---

## Critical Issues

### C1: All 13 static pages return HTTP 500

Every static page included in the sitemap is returning a server error:

- https://kakiokosi.com/share/about (500)
- https://kakiokosi.com/share/tos (500)
- https://kakiokosi.com/share/privacy (500)
- https://kakiokosi.com/share/contact (500)
- https://kakiokosi.com/share/company (500)
- https://kakiokosi.com/share/regal (500)
- https://kakiokosi.com/share/technique (500)
- https://kakiokosi.com/share/tapeokoshi (500)
- https://kakiokosi.com/share/jirei (500)
- https://kakiokosi.com/share/nagare (500)
- https://kakiokosi.com/share/omitsumori (500)
- https://kakiokosi.com/share/point (500)
- https://kakiokosi.com/share/webmeeting (500)

**Impact:** Google will log crawl errors for all these URLs, which harms overall site quality signals. Including 500-status URLs in a sitemap signals to Google that the site is poorly maintained.

**Action:** Fix the `share.static.tsx` route (likely a D1 query or data issue), then verify all pages return 200 before keeping them in the sitemap. Until fixed, remove them from sitemap output.

---

## High-Severity Issues

### H1: Root/homepage URL missing from sitemap

The sitemap lists `https://kakiokosi.com/share` as the top page, but the actual root `https://kakiokosi.com/` returns a 301 redirect to `/share`. The sitemap entry is acceptable as long as the canonical URL is `/share`. However, if users or external links point to `/`, Google may treat them as separate pages.

**Action:** Confirm that the canonical for the homepage is consistently `https://kakiokosi.com/share`. No change needed if so.

### H2: Deprecated `<changefreq>` and `<priority>` tags

Both tags are present on every entry. Google has officially stated these are ignored. They add unnecessary bytes to the response (roughly 50 bytes per URL x 546 = ~27 KB of dead weight).

**Action:** Remove both tags from the `entry()` function. The function signature can be simplified to only accept `base`, `path`, and `lastmod`.

---

## Medium-Severity Issues

### M1: 76 posts share identical lastmod date (2014-10-29)

This is almost certainly a WordPress migration artifact where `updated_at` was set to the migration date rather than the true last-modified date. When Google sees large clusters of identical lastmod values, it reduces trust in the lastmod signal and may ignore it entirely.

**Lastmod distribution (top 5):**

| Date | Count |
|------|-------|
| 2014-10-29 | 76 |
| 2014-11-01 | 38 |
| 2014-08-29 | 7 |
| 2014-10-16 | 5 |
| 2014-09-12 | 5 |

**Action:** If the original `published_at` dates are accurate, prefer using those for posts that have not been genuinely updated. Only use `updated_at` when it differs meaningfully from `published_at`.

### M2: 3 duplicate tag URLs

The following tags appear twice in the sitemap:

- `https://kakiokosi.com/share/tag/旅`
- `https://kakiokosi.com/share/tag/30日`
- `https://kakiokosi.com/share/tag/web`

**Action:** This is a database-level issue. Check the `tags` table for duplicate slug entries and deduplicate.

### M3: 328 tag URLs contain unencoded non-ASCII characters

Sitemap URLs should be entity-escaped or percent-encoded per the Sitemaps protocol specification. Raw Japanese characters in `<loc>` tags may cause parsing issues in some crawlers.

Example: `https://kakiokosi.com/share/tag/3-11震災` should be `https://kakiokosi.com/share/tag/3-11%E9%9C%87%E7%81%BD`

**Action:** Apply `encodeURI()` or `encodeURIComponent()` to the tag slug in the sitemap generation code.

### M4: 389 URLs have no `<lastmod>` tag

All 9 category pages and 380 tag pages lack lastmod. While not strictly required, providing lastmod helps Google prioritize crawling.

**Action:** Consider querying the most recent `published_at` from posts in each category/tag to populate lastmod.

---

## Missing Pages (in routes but not in sitemap)

| Page | Route File | Notes |
|------|-----------|-------|
| Pagination pages (`/share/page/2`, etc.) | `share.page.$page.tsx` | Google generally recommends including paginated pages; currently returns 404 on live site |
| Root `/` | `home.tsx` | 301 redirects to /share; acceptable to omit |

---

## Post Count Discrepancy

The sitemap contains **148** post URLs, but the expected count is **~143**. This suggests either:
- 5 additional posts have been published since the 143 count was established, or
- 5 draft/unpublished posts are incorrectly included

**Action:** Verify the query `WHERE status = 'published'` is filtering correctly. Run `SELECT COUNT(*) FROM posts WHERE status = 'published'` to confirm the actual count.

---

## Recommended Code Changes

### 1. Remove deprecated tags and encode URLs

In `app/routes/sitemap[.]xml.tsx`, update the `entry()` function:

```typescript
function entry(base: string, path: string, lastmod: string | null): string {
  const encodedPath = encodeURI(path);
  const lastmodTag = lastmod
    ? `\n    <lastmod>${lastmod.substring(0, 10)}</lastmod>`
    : "";
  return `  <url>
    <loc>${base}${encodedPath}</loc>${lastmodTag}
  </url>`;
}
```

### 2. Conditionally include static pages

Only include static pages when they are confirmed to return 200:

```typescript
// Remove static pages from sitemap until the 500 errors are resolved
// Or add a health check before including them
```

### 3. Add lastmod to category/tag pages

```sql
-- For categories:
SELECT c.slug, MAX(p.published_at) as lastmod
FROM categories c
LEFT JOIN posts p ON p.primary_category = c.slug AND p.status = 'published'
GROUP BY c.slug

-- For tags:
SELECT t.slug, MAX(p.published_at) as lastmod
FROM tags t
LEFT JOIN post_tags pt ON pt.tag_id = t.id
LEFT JOIN posts p ON p.id = pt.post_id AND p.status = 'published'
GROUP BY t.slug
```

---

## Quality Gate Assessment

- **Location pages:** None detected. No doorway page risk.
- **Tag pages (380):** High volume but these are legitimate taxonomy pages, not programmatic doorway pages. However, 380 tags for 148 posts means an average of 2.6 tags per entry -- many tag pages likely contain only 1 post. Consider adding a `noindex` meta or excluding tags with fewer than 2-3 posts from the sitemap.
- **Content type:** Transcript archive (safe at scale with unique content per post).

---

## Priority Action Items

1. **[Critical]** Fix HTTP 500 on all static pages, or remove them from sitemap immediately
2. **[High]** Remove `<changefreq>` and `<priority>` tags
3. **[Medium]** URL-encode non-ASCII characters in tag slugs
4. **[Medium]** Deduplicate 3 tag entries in the database
5. **[Medium]** Review lastmod dates for migration-era accuracy
6. **[Low]** Consider excluding thin tag pages (1 post) from sitemap
7. **[Low]** Add lastmod to category and tag URLs
