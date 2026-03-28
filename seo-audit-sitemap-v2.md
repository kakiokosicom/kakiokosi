# Sitemap Re-Audit Report v2

**Site:** https://kakiokosi.com
**Date:** 2026-03-28
**Scope:** Post-improvement validation of /sitemap.xml
**Source file:** `app/routes/sitemap[.]xml.tsx`

---

## Executive Summary

The sitemap has improved significantly from v1 (546 URLs down to 214). Deprecated tags are removed, Japanese tag slugs are properly URL-encoded, and the tag list is correctly filtered to 5+ articles. Three minor issues remain.

---

## Validation Results

| # | Check | Result | Severity | Notes |
|---|-------|--------|----------|-------|
| 1 | XML validity (xmllint) | PASS | -- | Well-formed XML, correct namespace |
| 2 | Total URL count | PASS | -- | 214 URLs (was 546). Well under 50,000 limit |
| 3 | HTTP status (9 URLs sampled) | PASS | -- | All returned 200 (see details below) |
| 4 | lastmod format | PASS | -- | All use YYYY-MM-DD (W3C date format) |
| 5 | lastmod presence | WARN | Low | 1 URL missing lastmod: `/share/category/etc` |
| 6 | No changefreq tags | PASS | -- | 0 occurrences |
| 7 | No priority tags | PASS | -- | 0 occurrences |
| 8 | URL encoding (Japanese) | PASS | -- | Tag slugs properly percent-encoded |
| 9 | RSS feed exists | PASS | -- | /share/feed.xml returns 200, valid RSS 2.0 |
| 10 | RSS autodiscovery in HTML | PASS | -- | `<link rel="alternate" type="application/rss+xml">` present in `<head>` |
| 11 | RSS in robots.txt | FAIL | Low | No RSS reference in robots.txt |
| 12 | lastmod accuracy | WARN | Medium | 203/213 URLs share the same date (2026-03-28) |
| 13 | Top page lastmod | WARN | Low | Shows 2017-07-19 (oldest post date), not site activity date |

---

## URL Breakdown (214 total)

| Type | Count | Notes |
|------|-------|-------|
| Top page (`/share`) | 1 | |
| Article pages | 144 | Posts with `status = 'published'` |
| Category pages | 9 | All categories including `etc` |
| Tag pages | 48 | Filtered to tags with 5+ articles (was ~380) |
| Static pages | 12 | about, tos, privacy, regal, company, contact, technique, tapeokoshi, jirei, nagare, omitsumori, point, webmeeting |

**Reduction:** 546 -> 214 URLs (61% reduction). The tag filtering accounts for most of the improvement.

---

## Sample URL Checks

| URL | Status |
|-----|--------|
| /share | 200 |
| /share/society/936 | 200 |
| /share/business/881 | 200 |
| /share/category/society | 200 |
| /share/about | 200 |
| /share/contact | 200 |
| /share/webmeeting | 200 |
| /share/tag/500startups | 200 |
| /share/tag/%E3%82%B5%E3%83%A0%E3%83%A9%E3%82%A4... (Japanese encoded) | 200 |

---

## Issues Found

### 1. WARN -- lastmod homogeneity (Medium)

**Problem:** 203 out of 213 URLs with lastmod all show `2026-03-28`. This likely results from a bulk `updated_at` write during migration or a recent batch operation. Google may interpret this as "all pages were freshly updated" and, upon crawling, find that content has not actually changed. This can erode trust in the lastmod signal over time.

**Recommendation:** If possible, restore original `updated_at` timestamps for posts that were not actually edited. For posts truly bulk-updated (e.g., URL scheme change), the current date is acceptable but should not be refreshed again unless content changes.

### 2. WARN -- Missing lastmod on `/share/category/etc` (Low)

**Problem:** The `etc` category has no published posts, so the `MAX(updated_at)` query returns NULL and no `<lastmod>` tag is emitted.

**Recommendation:** Either:
- (a) Exclude empty categories from the sitemap (preferred -- no content to index), or
- (b) Fall back to a default date

### 3. WARN -- Top page lastmod is stale (Low)

**Problem:** `/share` shows `lastmod: 2017-07-19`, derived from `posts.results[0]?.published_at`. The top page is a listing page that effectively changes whenever any post is published or updated. The most recent post update is 2026-03-28.

**Recommendation:** Use `MAX(updated_at, published_at)` across all posts for the top page lastmod, not just the first result's `published_at`. The source code on line 40 uses `posts.results[0]?.published_at` but should use `posts.results[0]?.updated_at || posts.results[0]?.published_at` (or better, a dedicated MAX query).

### 4. FAIL -- RSS feed not in robots.txt (Low)

**Problem:** The RSS feed at `/share/feed.xml` is correctly discoverable via HTML `<link>` autodiscovery, but is not listed in `robots.txt`. While not strictly required, adding it helps crawlers that check robots.txt before parsing HTML.

**Recommendation:** Add the following line to `public/robots.txt`:
```
# RSS Feed
Sitemap: https://kakiokosi.com/share/feed.xml
```
Note: While `Sitemap:` is technically for XML sitemaps, some crawlers also accept RSS URLs here. Alternatively, the HTML autodiscovery tag is sufficient for most modern crawlers, so this is low priority.

---

## Improvements Confirmed Since v1

1. **changefreq/priority removed** -- Zero occurrences. Clean.
2. **Tag URLs URL-encoded** -- Japanese characters properly percent-encoded (e.g., `%E3%82%B5%E3%83%A0%E3%83%A9%E3%82%A4...`).
3. **Tag count reduced** -- From ~380 to 48 (tags with 5+ articles only). Major improvement.
4. **Category lastmod added** -- 8 of 9 categories now have lastmod dates derived from their newest post.
5. **RSS feed** -- Valid RSS 2.0 at `/share/feed.xml` with HTML autodiscovery.
6. **Static page filtering** -- Only public-facing pages included (login, registration, etc. excluded).
7. **URL encoding function** -- The `entry()` helper properly splits path segments and encodes each individually, avoiding double-encoding.

---

## Code Review Notes

Source: `app/routes/sitemap[.]xml.tsx`

- **Line 40:** `entry(baseUrl, "/share", posts.results[0]?.published_at)` -- Should use `updated_at` fallback or a MAX query for the listing page.
- **Lines 18-24:** Category query correctly uses `LEFT JOIN` to handle empty categories, but the empty result (NULL lastmod) should be filtered or handled.
- **Lines 27-34:** Tag query uses `HAVING COUNT(pt.post_id) >= 5` -- correct implementation of the 5-article threshold.
- **Lines 87-90:** URL encoding splits on `/` and encodes each segment -- correct approach for path encoding.

---

## Quality Gates

- **Location pages:** Not applicable (no programmatic city/location pages).
- **50,000 URL limit:** 214 URLs, well within limit. No sitemap index needed.
- **Doorway page risk:** None detected. Tag pages are filtered to 5+ articles, reducing thin-content risk.

---

## Action Items (Priority Order)

| Priority | Action | Effort |
|----------|--------|--------|
| Medium | Investigate if bulk `updated_at` can be reverted to original dates for unmodified posts | Medium |
| Low | Fix top page lastmod to use latest post update date | Small (1 line) |
| Low | Exclude `/share/category/etc` if it has zero posts, or add fallback date | Small |
| Low | Optionally add RSS URL to robots.txt | Trivial |
