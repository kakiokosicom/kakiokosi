# Technical SEO Audit — kakiokosi.com

Audit date: 2026-06-11. Crawl basis: 500 URLs (/tmp/seo-audit-kakiokosi/pages.jsonl) + live curl verification.
Site: Japanese transcription-article archive, React Router v7 SSR on Cloudflare Pages.

**Technical Score: 92/100**

| Category | Status |
|---|---|
| Crawlability | PASS (with 2 broken-link findings) |
| Indexability | PASS — noindex strategy verified consistent |
| Canonicals | PASS |
| Security headers | PASS |
| URL structure | PASS (minor duplicates) |
| Mobile viewport | PASS (100%) |
| Structured data | PASS |
| JS rendering | PASS (full SSR) |

---

## Findings

### 1. Crawlability

**robots.txt — PASS.** Valid syntax. `User-agent: *` allows all public content, blocks `/auth/`, `/dashboard/`, `/admin/`. Dedicated allow groups for AI crawlers (GPTBot, ClaudeBot, Google-Extended, PerplexityBot, Bytespider, CCBot). Sitemap declared (`Sitemap: https://kakiokosi.com/sitemap.xml`, returns 200, `application/xml`). Note: the per-bot `Allow: /share/` lines are redundant (default is allow) but harmless.

**404s found — 2, both from broken internal links:**
- `https://kakiokosi.com/%E3%83%9C%E3%83%A9%E3%83%B3...%E3%83%95%E3%82%A9%E3%83%BC%E3%83%A0/` (ボランティアスタッフの応募フォーム) → 404. Linked from `/share/politics/86` (pages/6536e735507a2bbf.html). Legacy WP link to a page that no longer exists.
- `https://kakiokosi.com/share/business/ https:/gigazine.net/news/20110123_mark_zuckerberg/` → 404. Malformed href (space + relative-ified external URL) present in **3 articles**: `/share/business/80`, `/share/business/81`, `/share/business/82` (pages/f36d1531e14b1601.html, f24b55bbe90716cf.html, d69308717086ca89.html). Migration artifact — the gigazine.net link was not preserved as an absolute external URL.

**Redirect behavior (live curl, 2026-06-11):**
- `http://kakiokosi.com/share/it/1385` → 301 → `https://kakiokosi.com/share/it/1385` — correct, path-preserving, single hop.
- `https://www.kakiokosi.com/` → 301 → `https://kakiokosi.com/` — correct.
- `http://www.kakiokosi.com/` → 301 → `https://www.kakiokosi.com/` → 301 → apex. Two hops; normal pattern, acceptable.
- **Anomaly:** `http://kakiokosi.com/` → 301 → `https://kakiokosi.com/share` (NOT `https://kakiokosi.com/`). The HTTP root redirects to `/share`, an indexable duplicate of the homepage (same title, canonical → `/`). Looks like a leftover redirect rule. Should 301 to `https://kakiokosi.com/`.
- Legacy WP URLs `/2010/05/…光の道…/` now return **301** to `/share/business/310` and `/share/business/309` respectively (crawl snapshot showed 200 + noindex + cross-canonical; live behavior is the correct 301 — fixed since crawl).
- Hard 404 behavior correct: `/share/it/999999` returns real HTTP 404 (no soft-404).

### 2. Indexability map

498 OK pages: **95 indexable / 403 noindex**. All noindex values are `noindex, follow` (correct variant — link equity still flows).

| Pattern | Indexable | Noindex | Verdict |
|---|---|---|---|
| `/` (home) | 1 | 0 | OK |
| `/share` | 1 | 0 | Duplicate of home; canonical → `/` (OK) |
| `/share/tag/*` | 0 | 292 | Intentional — 100% consistent |
| `/share/page/*` | 0 | 7 | Intentional — 100% consistent |
| `/share/category/<name>` (page 1) | 8 | 0 | Correct: category roots indexable |
| `/share/category/<name>/page/N` | 0 | 9 | Intentional pagination noindex — consistent |
| Article pages `/share/<cat>/<id>` | 59 | 93 | 93 = Block C set, as designed |
| `/share/<static>` (about, tos, etc.) | 24 | 0 | OK |
| `/2010/*` legacy WP | 0 | 2 | Now 301s live (resolved) |
| `/uploads/*` (images) | 2 | 0 | Image files, N/A |

**Noindex consistency: VERIFIED.** No tag, pagination, or page/N URL escaped the noindex rule; no indexable article was accidentally noindexed (IT category, the active auto-publish target, is 22/22 indexable).

**Sitemap cross-check: NO CRITICAL BUG.** 92 sitemap URLs; **0 are noindex**; all return 200. Arithmetic confirms exact alignment: 95 indexable − 2 image files − `/share` (canonicalized duplicate) = 92 = sitemap count. Sitemap contains exactly the indexable page set.

### 3. Canonicals

- All 496 HTML pages have a canonical tag (the 2 missing are raw image files).
- Self-referencing on every page including noindexed ones, except two deliberate cases: `/share` → `/` (correct) and legacy WP URLs → new article URLs (now superseded by 301s).
- Trailing-slash variants of article URLs return **200** (e.g. `/share/it/1385/` serves the page) but canonical correctly self-corrects to the non-slash URL. Duplicate-URL surface exists; canonical mitigates. Recommend 301 slash → non-slash.

### 4. Security headers (live homepage)

All present — strongest configuration seen in this class of site:
- `strict-transport-security: max-age=31536000; includeSubDomains; preload` — PASS
- `content-security-policy` — present, restrictive default-src 'self', `frame-ancestors 'none'`, `upgrade-insecure-requests`. Note: `script-src` includes `'unsafe-inline'` (common SSR-hydration tradeoff; consider nonces).
- `x-content-type-options: nosniff` — PASS
- `x-frame-options: DENY` — PASS
- Bonus: `referrer-policy: strict-origin-when-cross-origin`, `permissions-policy` locked down.

### 5. URL structure

- Clean, short, lowercase, ID-based: `/share/<category>/<id>`. No parameters, no session IDs.
- Minor asymmetry: article URLs use `/share/business/<id>` while category listings use `/share/category/business`. Cosmetic only.
- Duplicate-host/protocol handled by 301s (except root anomaly above).
- 2 legacy percent-encoded WP URLs remain in internal link graph but now 301 correctly.

### 6. Mobile

- `viewport` (`width=device-width, initial-scale=1`) present on **all** 496 HTML pages. PASS.

### 7. Structured data

- WebSite + Organization sitewide (496), Article on 154, BreadcrumbList on 178, CollectionPage on 318, FAQPage on 5. Coverage appropriate per template. No missing JSON-LD on HTML pages.

### 8. JavaScript rendering

- Full SSR confirmed: titles, meta, canonical, JSON-LD, and body content (avg 4,773 chars) all present in raw HTML. No CSR dependency for indexing. PASS.

---

## Issues table

| # | Severity | Issue | Evidence | Recommendation |
|---|---|---|---|---|
| 1 | High | Malformed internal link generating 404, repeated on 3 articles | `/share/business/80`, `/81`, `/82` contain href `"/share/business/ https:/gigazine.net/news/20110123_mark_zuckerberg/"` | Fix migration artifact: restore absolute `https://gigazine.net/...` href in those 3 posts |
| 2 | High | Dead internal link to removed WP page (404) | `/share/politics/86` links to `/ボランティアスタッフの応募フォーム/` | Remove link or 301 the old slug to a relevant page |
| 3 | Medium | `http://kakiokosi.com/` 301s to `https://kakiokosi.com/share` instead of `/` | curl -sI http root: `Location: https://kakiokosi.com/share` | Update Cloudflare redirect rule to target `https://kakiokosi.com/$1` path-preserving; root → `/` |
| 4 | Medium | Trailing-slash article URLs return 200 (duplicate URLs) | `/share/it/1385/` = 200, canonical self-corrects | Add 301 slash → non-slash in the router/edge |
| 5 | Low | `/share` is an indexable full duplicate of homepage (canonical → `/` mitigates) | Same title as `/`, canonical `https://kakiokosi.com/` | Optionally 301 `/share` → `/` (would also resolve issue 3) |
| 6 | Low | CSP `script-src` allows `'unsafe-inline'` | Live header | Move to nonce/hash-based CSP when feasible |
| 7 | Low | 12 images without alt text (of 630) | summary.json `imgs_noalt` | Add alt attributes |

**Critical bugs: NONE.** Sitemap/noindex integrity verified — 0 noindex URLs in the 92-URL sitemap, exact 1:1 alignment with the indexable page set. The deliberate noindex strategy (tags, pagination, Block C) is applied with 100% consistency.
