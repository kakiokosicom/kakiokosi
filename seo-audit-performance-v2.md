# Core Web Vitals & Performance Audit v2

**Date**: 2026-03-28
**URL**: https://kakiokosi.com
**Method**: curl measurements from NRT (Tokyo), source code analysis
**Previous audit**: seo-audit-performance.md

---

## Executive Summary

Several improvements were applied since v1 (inline SVG icons, image dimensions, fetchpriority, security headers). However, the most impactful issues remain. The homepage still weighs 445KB uncompressed (124KB gzip) due to full article `content` being serialized in loader data. Material Symbols font is still loading in the deployed build (code was updated but not redeployed). Static asset Cache-Control headers are not taking effect due to Cloudflare Pages overriding the Worker.

---

## 1. Response Sizes

### Homepage `/share`

| Metric | Value | Assessment |
|--------|-------|------------|
| Uncompressed HTML | 445 KB | POOR -- was 401KB, now larger |
| Gzip-compressed | 124 KB | POOR for an index page |
| Inline script data (loader) | 167 KB | ROOT CAUSE -- full post `content` for 20 posts |
| Actual page markup (non-script) | 25 KB | Good |

**Root cause**: `getPublishedPosts()` in `db.server.ts` line 44 uses `SELECT *` which returns the full `content` column for all 20 posts. This content is serialized twice in the HTML -- once for SSR rendering (even though it is not displayed on the listing page) and once as hydration data in `window.__reactRouterContext`. The listing page only uses `title`, `excerpt`, `thumbnail_url`, `published_at`, `primary_category`, and `id`.

### Article page `/share/business/1`

| Metric | Value | Assessment |
|--------|-------|------------|
| Uncompressed HTML | 161 KB | Acceptable for article content |
| Gzip-compressed | 49 KB | OK |

---

## 2. TTFB (Time to First Byte)

Measured from Tokyo (NRT) over 5 requests:

| Run | TTFB | Note |
|-----|------|------|
| 1 (cold) | 1,327ms | Worker cold start |
| 2 | 138ms | Good |
| 3 | 109ms | Good |
| 4 | 156ms | Good |
| 5 | 106ms | Good |

**Assessment**: Warm TTFB is excellent (~110-160ms). Cold start of 1.3s is a concern for the 75th percentile in CrUX -- if traffic is low enough for Workers to go cold frequently, this will hurt LCP. Target is under 200ms for "good" TTFB subpart.

---

## 3. Cache-Control Headers on Static Assets

**CRITICAL FINDING**: The Worker's `Cache-Control: public, max-age=31536000, immutable` header for `/assets/*` is NOT taking effect.

Actual response on `/assets/root-CtvcvV4p.css`:
```
cache-control: public, max-age=0, must-revalidate
```

**Why**: Cloudflare Pages serves static assets from its own edge cache before the Worker runs. The `_headers` file only sets security headers, not Cache-Control. The Worker code at `workers/app.ts` line 26-30 sets Cache-Control, but for static assets, Cloudflare Pages responds directly and the Worker's `fetch()` handler processes the _response_ -- however, the CDN's own cache layer may override it on the way out, or more likely, Cloudflare Pages has its own default cache behavior that takes precedence.

**Impact**: Every page visit re-validates all JS/CSS assets (304 requests), adding unnecessary round-trips. Assets have content-hashed filenames so `immutable` caching is safe and correct.

**Fix options**:
1. Add to `public/_headers`:
   ```
   /assets/*
     Cache-Control: public, max-age=31536000, immutable
   ```
2. Or configure in `wrangler.toml` under `[assets]`

---

## 4. Font Loading

### Current state (DEPLOYED -- not yet reflecting source changes)

The deployed build loads TWO Google Fonts stylesheet requests:

1. `Noto Serif JP:wght@700;900 + Work Sans:wght@400;600;700 + Noto Sans JP:wght@400;700` -- 6 weights total
2. `Material Symbols Outlined:opsz,wght,FILL@24,400,0` -- STILL LOADING

**Material Symbols is still in the deployed JS bundle** (`/assets/root-Bs1f_BzG.js`). The source code in `app/root.tsx` no longer includes this link, but the live site was not redeployed after the change.

### Font weight summary (source code -- after redeploy)

| Family | Weights | Purpose |
|--------|---------|---------|
| Noto Serif JP | 700, 900 | Headings, logo |
| Work Sans | 400, 600, 700 | Labels, body (Latin) |
| Noto Sans JP | 400, 700 | Body text (Japanese) |
| **Total** | **6 weights** | Down from ~16 + Material Symbols |

### Font CSS size concern

The Google Fonts CSS response for the 3-family request is **464KB** uncompressed (contains 505 `@font-face` declarations with unicode-range subsets for CJK fonts). Only a small subset is actually downloaded based on page characters, but the CSS itself is render-blocking.

**Recommendation**: The `display=swap` parameter is already set, which is correct. The `preconnect` hints to `fonts.googleapis.com` and `fonts.gstatic.com` are present. No further action needed on font loading strategy unless self-hosting is considered.

---

## 5. LCP (Largest Contentful Paint) Estimate

### LCP Element
The featured post image: `/uploads/2017/07/fc6927a4cd7fc6f068de9eb5d3ae4aff-800x450.png`

| Factor | Value | Status |
|--------|-------|--------|
| Image preloaded | Yes (`<link rel="preload" as="image" fetchPriority="high">`) | GOOD |
| fetchpriority="high" on img | Yes | GOOD |
| loading="eager" on img | Yes | GOOD |
| Image format | PNG | NEEDS IMPROVEMENT (485KB) |
| Image size | 484,585 bytes (485KB) | POOR |
| Image cache | `max-age=0, must-revalidate` | POOR |
| Image dimensions in HTML | `width=640 height=360` | GOOD (CLS fix) |

### LCP subpart estimates (warm visit)

| Subpart | Estimate | Target |
|---------|----------|--------|
| TTFB | ~150ms | <200ms -- GOOD |
| Resource load delay | ~100ms (preload in place) | <50ms -- OK |
| Resource load time | ~200-500ms (485KB image) | Depends on connection |
| Element render delay | ~100ms (font CSS blocking) | <50ms -- NEEDS WORK |
| **Total LCP** | **~550-950ms** (fast connection) | <2,500ms -- GOOD |

**On slower connections (3G)**: The 485KB PNG hero image would push LCP well above 4s. This is the single biggest LCP risk.

### LCP Recommendations (by priority)

1. **Convert hero images to WebP/AVIF** -- Expected savings: 60-80% (485KB -> ~100-150KB). This is the highest-impact change.
2. **Fix image cache headers** -- Currently `max-age=0`. Returning visitors re-download the full image every time.
3. **Redeploy to remove Material Symbols** -- Eliminates one render-blocking font CSS request.

---

## 6. CLS (Cumulative Layout Shift) Estimate

| Factor | Status |
|--------|--------|
| Featured image has width/height | GOOD (640x360) |
| Card images have width/height | GOOD (400x250) |
| `aspect-ratio` via CSS class | GOOD (`aspect-[16/9]`, `aspect-[16/10]`) |
| Font `display=swap` | GOOD (prevents FOIT but allows FOUT) |
| No ads/embeds | GOOD |
| No dynamically injected content above fold | GOOD |

**Estimated CLS: ~0.02-0.05** -- GOOD (below 0.1 threshold)

The main CLS risk is font swap (FOUT) when Noto Serif JP loads and replaces the fallback serif. This is minor and acceptable.

---

## 7. INP (Interaction to Next Paint) Estimate

| Factor | Status |
|--------|--------|
| JS bundle size (total) | ~109KB gzip | OK |
| No heavy event handlers | GOOD |
| Inline SVG icons (no icon font) | GOOD (in source, pending deploy) |
| DOM element count | ~243 elements | GOOD (well under 1,500) |
| No third-party scripts | GOOD |
| React hydration | Minimal interactivity | GOOD |

**Estimated INP: <100ms** -- GOOD

---

## 8. Security Headers

All present and correct:

| Header | Value | Status |
|--------|-------|--------|
| Strict-Transport-Security | max-age=31536000; includeSubDomains; preload | GOOD |
| X-Content-Type-Options | nosniff | GOOD |
| X-Frame-Options | DENY | GOOD |
| Referrer-Policy | strict-origin-when-cross-origin | GOOD |
| Permissions-Policy | camera=(), microphone=(), geolocation=() | GOOD |
| Content-Security-Policy | Full policy with frame-ancestors 'none' | GOOD |

**Note**: CSP includes `'unsafe-inline'` for both script-src and style-src. This is necessary for React hydration and Tailwind but weakens the CSP somewhat. Acceptable tradeoff.

---

## Prioritized Action Items

### P0 -- Critical (do before next deploy)

1. **Fix `SELECT *` in listing queries** -- Replace with explicit column list excluding `content`:
   ```sql
   SELECT id, title, excerpt, status, primary_category, thumbnail_url,
          published_at, created_at, updated_at, author_id
   FROM posts WHERE status = 'published' ...
   ```
   Affects: `getPublishedPosts()`, `getPostsByCategory()`, `getPostsByTag()`, `getRelatedPosts()` in `app/lib/db.server.ts`.
   **Expected impact**: Homepage drops from 445KB to ~30-40KB uncompressed (~10-15KB gzip). This is a 90%+ reduction.

2. **Redeploy** -- The Material Symbols removal and inline SVG icons are in source but not deployed. A fresh build and deploy will eliminate the Material Symbols font request.

### P1 -- High Priority

3. **Fix static asset Cache-Control** -- Add to `public/_headers`:
   ```
   /assets/*
     Cache-Control: public, max-age=31536000, immutable

   /uploads/*
     Cache-Control: public, max-age=604800
   ```
   **Expected impact**: Eliminates re-validation requests on repeat visits. Saves ~200-500ms on subsequent page loads.

4. **Convert uploaded images to WebP** -- The hero image is 485KB PNG. WebP at similar quality would be ~100-150KB. Consider using Cloudflare Images or a build-time conversion.
   **Expected impact**: LCP improvement of 200-500ms on typical connections.

### P2 -- Medium Priority

5. **Reduce POSTS_PER_PAGE from 20 to 12** -- Even after fixing SELECT *, 20 post cards with excerpts and thumbnails is heavy. 12 is sufficient for a listing page.

6. **Consider self-hosting critical font subsets** -- The Google Fonts CSS response for CJK fonts is 464KB (only a fraction is used). Self-hosting a subset of Noto Sans/Serif JP would eliminate the external dependency and render-blocking CSS request. However, this is complex for CJK fonts due to unicode-range subsetting.

7. **Add `stale-while-revalidate` to HTML responses** -- In the Worker, set `Cache-Control: public, max-age=60, stale-while-revalidate=3600` for public pages. This would eliminate cold-start TTFB issues.

### P3 -- Low Priority

8. **Remove duplicate CSP meta tag** -- `root.tsx` line 99 has `<meta http-equiv="Content-Security-Policy" content="upgrade-insecure-requests"/>` but the full CSP header already includes `upgrade-insecure-requests`. The meta tag is redundant (harmless but unnecessary).

---

## Before vs. After Comparison (Source Code Changes)

| Metric | Before (v1 audit) | After (source, not deployed) | After (deployed) |
|--------|-------------------|-------------------------------|-------------------|
| Font weights | ~16 + Material Symbols | 6 (no Material Symbols) | 6 + Material Symbols (stale build) |
| Image dimensions | Missing | Present (width/height) | Present |
| fetchpriority on hero | Missing | `fetchpriority="high"` | Present |
| Icon system | Material Symbols font | Inline SVG | Material Symbols (stale build) |
| Security headers | Missing | Full set in Worker | Present |
| CSP | Missing | Full CSP | Present |
| Homepage size | ~401KB | ~30-40KB (after SELECT fix) | 445KB (worse -- more data) |
| Asset caching | Not set | Worker attempts immutable | `max-age=0` (not working) |

---

## Estimated Core Web Vitals After Fixes

Assuming P0 and P1 items are completed:

| Metric | Current Estimate | After Fixes | Threshold |
|--------|-----------------|-------------|-----------|
| LCP | ~1.5-3.0s | ~0.8-1.5s | <=2.5s GOOD |
| INP | <100ms | <100ms | <=200ms GOOD |
| CLS | ~0.02-0.05 | ~0.02 | <=0.1 GOOD |

**Verdict**: The site should comfortably pass all three Core Web Vitals after the P0 and P1 fixes are deployed. The SELECT * fix alone will have the largest single impact.
