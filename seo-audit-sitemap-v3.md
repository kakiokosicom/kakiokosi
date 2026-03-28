# Sitemap v3 Audit Report

**URL:** https://kakiokosi.com/sitemap.xml
**Date:** 2026-03-28
**Source file:** `app/routes/sitemap[.]xml.tsx`

---

## Summary

| Metric | Value |
|--------|-------|
| Total URLs | 214 |
| Articles | 143 |
| Category pages | 9 |
| Tag pages (5+ articles) | 48 |
| Static pages | 13 |
| Top page | 1 |

**Verdict: PASS** -- all critical and high-severity checks pass. One low-severity issue found (category/etc missing lastmod).

---

## Validation Checks

### 1. Top page lastmod -- updated_at instead of published_at

**PASS**

The top page `<loc>https://kakiokosi.com/share</loc>` now uses `updated_at` from the most recent post:

```xml
<lastmod>2026-03-28</lastmod>
```

The code correctly uses `posts.results[0]?.updated_at || posts.results[0]?.published_at` (line 40 of sitemap route). The old value of `2017-07-19` (which was from `published_at`) is no longer present.

### 2. Total URL count

**PASS** -- 214 URLs

Breakdown:
- 1 top page (`/share`)
- 143 article pages (`/share/{category}/{id}`)
- 9 category pages (`/share/category/{slug}`)
- 48 tag pages (`/share/tag/{slug}`)
- 13 static pages (about, tos, privacy, regal, company, contact, technique, tapeokoshi, jirei, nagare, omitsumori, point, webmeeting)

Well under the 50,000 URL per-file limit. No sitemap index needed.

### 3. No changefreq or priority tags

**PASS** -- zero instances of `changefreq` or `priority` found in the output XML. These deprecated tags (ignored by Google) have been correctly omitted.

### 4. URL encoding for Japanese characters

**PASS** -- The `entry()` function (lines 82-97) applies `encodeURIComponent(decodeURIComponent(segment))` per path segment. Japanese tag slugs are properly percent-encoded in the output:

```
/share/tag/%E3%82%B9%E3%82%BF%E3%83%BC%E3%83%88%E3%82%A2%E3%83%83%E3%83%97
/share/tag/%E3%82%B7%E3%83%AA%E3%82%B3%E3%83%B3%E3%83%90%E3%83%AC%E3%83%BC
```

This is compliant with the sitemap protocol requirement that `<loc>` values be entity-escaped and properly encoded.

### 5. Category pages have lastmod

**WARNING** -- 8 of 9 category pages have `<lastmod>`. One category is missing it:

```
https://kakiokosi.com/share/category/etc  -- NO lastmod
```

This occurs because the `etc` category has no published posts linked via `post_categories`, so the `MAX(COALESCE(p.updated_at, p.published_at))` returns NULL. The entry function correctly omits the tag when null rather than outputting an empty tag.

**Severity:** Low. Google will still crawl the page; it just will not know when it last changed.

**Fix suggestion:** If `etc` is truly empty, consider removing it from the sitemap. If it has posts, check the `post_categories` join data.

### 6. Tag pages filtered to 5+ articles

**PASS** -- The SQL query uses `HAVING COUNT(pt.post_id) >= 5`, producing 48 tag pages. Tags with fewer than 5 articles are correctly excluded. This avoids thin index pages.

### 7. HTTP 200 status check (sample)

**PASS** -- All 15 sampled URLs returned HTTP 200:

| Status | URL |
|--------|-----|
| 200 | https://kakiokosi.com/share |
| 200 | https://kakiokosi.com/share/society/936 |
| 200 | https://kakiokosi.com/share/business/881 |
| 200 | https://kakiokosi.com/share/category/business |
| 200 | https://kakiokosi.com/share/tag/vc |
| 200 | https://kakiokosi.com/share/about |
| 200 | https://kakiokosi.com/share/tos |
| 200 | https://kakiokosi.com/share/tag/%E3%82%B9%E3%82%BF%E3%83%BC%E3%83%88%E3%82%A2%E3%83%83%E3%83%97 |
| 200 | https://kakiokosi.com/share/category/world |
| 200 | https://kakiokosi.com/share/category/etc |
| 200 | https://kakiokosi.com/share/tag/exit |
| 200 | https://kakiokosi.com/share/society/240 |
| 200 | https://kakiokosi.com/share/business/72 |
| 200 | https://kakiokosi.com/share/business/293 |
| 200 | https://kakiokosi.com/share/webmeeting |

No 404s, no redirects among sitemap URLs.

### 8. RSS feed at /share/feed.xml

**PASS**

- HTTP status: **200**
- Content-Type: `application/rss+xml; charset=utf-8`
- Valid RSS 2.0 with `xmlns:atom` namespace
- Channel title: "書き起こし.com"
- Self-referencing `<atom:link>` present (required for valid RSS)
- Items include title, link, guid (isPermaLink), description, pubDate, and category

---

## lastmod Distribution

| Date | Count |
|------|-------|
| 2026-03-28 | 204 |
| 2020-07-28 | 4 |
| 2020-04-16 | 1 |
| 2020-04-11 | 1 |
| 2016-08-02 | 2 |
| 2014-11-02 | 1 |
| (none) | 1 |

204 of 214 URLs share the same `2026-03-28` lastmod. This is because all 143 posts were migrated/updated in the recent platform rewrite, plus category, tag, and static pages derive their lastmod from the most recently updated post. While technically accurate (content was re-rendered on the new platform), Google may treat a bulk lastmod update with lower trust. This will self-correct as posts are individually updated over time.

---

## Quality Gate Assessment

| Gate | Status |
|------|--------|
| Location pages (30+ threshold) | N/A -- no location pages |
| Doorway page risk | CLEAR -- no programmatic city/industry pages |
| 50k URL limit | CLEAR (214 / 50,000) |
| Noindex in sitemap | CLEAR -- robots.txt only blocks /auth/, /dashboard/, /admin/ |

---

## robots.txt Alignment

The `robots.txt` at `/public/robots.txt` correctly:
- References `Sitemap: https://kakiokosi.com/sitemap.xml`
- Blocks `/auth/`, `/dashboard/`, `/admin/` for all user agents
- Explicitly allows `/share/` and `/sitemap.xml` for AI crawlers (GPTBot, ClaudeBot, Google-Extended, PerplexityBot, Bytespider, CCBot)

No sitemap URLs conflict with robots.txt Disallow rules.

---

## Recommendations

1. **Low priority** -- Investigate why `/share/category/etc` has no lastmod. If the category has zero published posts, remove it from the sitemap to keep it clean.

2. **Informational** -- The bulk `2026-03-28` lastmod across 204 URLs is expected after the platform migration. No action needed now, but future updates should only touch the lastmod of genuinely changed pages (the code already handles this correctly via `updated_at`).

3. **Informational** -- Consider adding the RSS feed URL to `robots.txt` or the sitemap for discovery, though this is not required since it is linked from the site.
