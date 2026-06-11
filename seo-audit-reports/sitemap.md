# Sitemap Audit — https://kakiokosi.com/sitemap.xml

Audit date: 2026-06-11
Data: /tmp/seo-audit-kakiokosi/ (sitemap.xml 92 URLs, pages.jsonl 500 crawled URLs)

**Score: 95 / 100**

---

## 1. Format Validation

| Check | Result | Detail |
|-------|--------|--------|
| Well-formed XML | PASS | Parses cleanly |
| Namespace | PASS | `http://www.sitemaps.org/schemas/sitemap/0.9` |
| URL count | PASS | 92 / 50,000 limit |
| Duplicate `<loc>` | PASS | None |
| `lastmod` presence | PASS | 92/92 URLs have lastmod |
| `lastmod` format | PASS | All `YYYY-MM-DD` (W3C valid) |
| Future-dated lastmod | PASS | None |
| `changefreq` | PASS (Info) | Not used — correct, ignored by Google |
| `priority` | PASS (Info) | Not used — correct, ignored by Google |

## 2. Quality Gates (cross-check vs pages.jsonl)

**0 violations across all 92 sitemap URLs.**

| Gate | Result |
|------|--------|
| All sitemap URLs return 200 | PASS — 92/92 (`in_sitemap_not_crawled_ok: []`) |
| No noindexed URLs in sitemap | PASS — 0 of the site's 403 noindexed pages appear in the sitemap |
| Canonical self-referencing | PASS — 92/92 self-canonical |
| No redirected URLs | PASS — final_url == loc for all entries |

The deliberate noindex set (tag pages, pagination `/page/N`, Block C derivative transcripts) is correctly **absent** from the sitemap. Examples verified: `/share/category/*/page/2-4` (noindex, follow — correctly excluded), `/share/tag/*` (292 crawled, 0 in sitemap).

## 3. Coverage (indexable crawled pages vs sitemap)

Indexable, self-canonical, 200-status crawled pages missing from sitemap: **2 — both raw image files, not page content:**

- `https://kakiokosi.com/uploads/2014/04/ac170f47d17ffe9049332a3c00e2d90d.jpg`
- `https://kakiokosi.com/uploads/2017/07/fc6927a4cd7fc6f068de9eb5d3ae4aff.jpg`

Verdict: **do not add** as `<url>` entries (sitemaps are for HTML pages). Optional: image sitemap extension if image search traffic matters — low priority.

Pages the task asked about — all already covered:

- `/share/kakiokoshi-toha` — IN sitemap
- `/share/gijiroku` — IN sitemap
- All 16 guide/static pages (`/share/tapeokoshi`, `/share/mojikoshi-tool`, `/share/meispeech`, `/share/ted-talks`, etc.) — IN sitemap
- Category pages — all 8 first-page category URLs (`/share/category/business|it|politics|society|world|economy|entertainment|culture`) — IN sitemap; their paginated pages are noindexed and correctly excluded

Edge cases (no action needed, documented for completeness):

- `/share` — indexable but canonicals to `/`; correctly excluded from sitemap. Consider a 301 to `/` instead of canonical-only consolidation (minor).
- Two legacy `/2010/05/...` WordPress permalinks redirect to `/share/business/309` and `/310`, which are Block C noindexed — consistent with the noindex strategy, correctly out of the sitemap.
- `crawled_not_in_sitemap_count: 406` is almost entirely the intentional noindex set (403 noindexed + /share + 2 images) — not a coverage gap.

## 4. robots.txt Reference

PASS — `Sitemap: https://kakiokosi.com/sitemap.xml` present (line 50 of robots.txt). Sitemap also explicitly allowed for AI crawlers (GPTBot, ClaudeBot, Google-Extended, PerplexityBot, Bytespider, CCBot).

## 5. lastmod Accuracy Spot-Check

- 24 distinct lastmod values across 92 URLs — **not** the all-identical red-flag pattern.
- Recent IT drafts show plausible 3-day publish cadence (2026-06-10, 06-07, 06-04, 06-01...), matching the auto-publish pipeline.
- **One cluster: 42/92 URLs (46%) share `2026-03-28`** — almost certainly the WordPress→CF migration batch timestamp, not true content-modified dates.

| Check | Severity | Result |
|-------|----------|--------|
| All lastmod identical | Low | Not triggered (24 distinct values) |
| Large identical cluster (2026-03-28 x42) | Low | Flagged — migration artifact |

## 6. Quality Gate (location/doorway pages)

Not applicable — 0 location pages. Sitemap is articles (54), category hubs (8), guide/glossary pages (~24), legal/static (~6). Guide pages are the "safe at scale" type (real content, avg 4,773 chars sitewide).

## Recommendations (priority order)

1. **(Low)** Backfill real last-modified dates for the 42 URLs stamped `2026-03-28`; if unavailable, use original WP publish dates from the migrated posts (143-post migration data exists in D1).
2. **(Low)** 301-redirect `/share` to `/` instead of relying on cross-domain-style canonical consolidation.
3. **(Info)** Optional image sitemap for `/uploads/` assets if image search is a goal; otherwise ignore.
4. **(Info)** No structural changes needed — keep the current generation logic; it correctly excludes noindexed tag/pagination/Block C pages.

## Score Breakdown

- Format: 25/25
- Quality gates: 40/40
- Coverage: 20/20
- robots.txt reference: 5/5
- lastmod accuracy: 5/10 (migration-date cluster)
