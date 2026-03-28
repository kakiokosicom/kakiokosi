# Core Web Vitals & Performance Audit — kakiokosi.com

**Date**: 2026-03-28
**Audited URLs**: Homepage (`/share`), Article page (`/share/society/936`)
**Stack**: React Router v7 + Cloudflare Workers (edge SSR) + D1 + Tailwind CSS v4
**Method**: Manual analysis (PageSpeed Insights API quota exhausted — used curl timing, HTML source inspection, and asset profiling)

---

## 1. Executive Summary

| Area | Status | Notes |
|------|--------|-------|
| **TTFB** | GOOD | 93-280ms edge-rendered from Cloudflare |
| **LCP** | NEEDS WORK | Font-blocked text render; homepage 410KB HTML |
| **INP** | GOOD (estimated) | Minimal JS; text-heavy content |
| **CLS** | NEEDS WORK | Article images lack explicit dimensions; font FOUT risk |
| **Caching** | POOR | All hashed assets served with `max-age=0` |
| **Font loading** | POOR | 3 Google Font families + Material Symbols blocking render |
| **Compression** | GOOD | Brotli compression active (410KB -> 116KB) |

**Estimated Lighthouse Score**: 65-75 (mobile), 80-90 (desktop)

---

## 2. Server Response (TTFB)

| Page | TTFB (avg 3 runs) | Verdict |
|------|--------------------|---------|
| Homepage `/share` | ~146ms | GOOD (< 200ms target) |
| Article `/share/society/936` | ~178ms | GOOD (< 200ms target) |

Cloudflare Workers edge-rendering is performing well. The TTFB is consistently under the 200ms threshold. No server-side optimization needed.

---

## 3. Largest Contentful Paint (LCP)

### 3.1 Homepage

**Likely LCP element**: The `<h1>Archives</h1>` heading (font-serif text-5xl/7xl)

**LCP subpart analysis**:
- **TTFB**: ~146ms (good)
- **Resource load delay**: HIGH — LCP is text rendered with `Noto Serif JP` loaded from Google Fonts. The font CSS is render-blocking.
- **Resource load time**: Google Fonts CSS (2.7KB) -> then font binary download (Noto Serif JP 900 weight, likely 500KB+ for Japanese glyphs)
- **Element render delay**: Text invisible until font loads (FOIT) or flashes (FOUT depending on `display=swap`)

**Estimated LCP**: 2.0-3.5s mobile (NEEDS IMPROVEMENT range)

**Key issue**: The homepage HTML is **409,585 bytes** uncompressed (116KB Brotli-compressed). This is very large for a listing page with 20 post cards and no images. The entire HTML payload is SSR'd inline. This inflates time-to-first-meaningful-render.

### 3.2 Article Page

**Likely LCP element**: The `<h1>` title text OR the article image (`fc6927a4cd7fc6f068de9eb5d3ae4aff-800x450.png`)

**Key issues**:
- Article image is **484KB PNG** with no next-gen format (WebP/AVIF)
- Image has no `<link rel="preload">` hint
- Image `src` uses old WordPress-migrated paths (`/uploads/2017/07/...`)
- The image is embedded inside `dangerouslySetInnerHTML` content, so React cannot optimize it
- HTML size is reasonable: 50KB

**Estimated LCP**: 1.5-3.0s mobile depending on image vs text LCP

---

## 4. Interaction to Next Paint (INP)

**Estimated INP**: < 100ms (GOOD)

**Rationale**: The site is primarily text content with minimal interactive JavaScript. The JS bundle breakdown:

| Asset | Size (uncompressed) | Purpose |
|-------|---------------------|---------|
| `entry.client-CS2_CXNr.js` | 187KB | React Router client entry |
| `chunk-UVKPFVEO-CA_hvMfz.js` | 126KB | React + React DOM shared chunk |
| `index-rRQckzwd.js` | 3.7KB | React Router runtime |
| `root-xGVKLQqZ.js` | 5.4KB | Root layout component |
| `share._index-MZcw32kP.js` | 1.7KB | Homepage route |
| `pagination-BKXXFmCC.js` | 4.1KB | Pagination component |
| **Total JS** | **~329KB** | |

The JS is loaded via `modulepreload` hints, which is correct. Route-level code splitting is in place (each route loads its own module). No heavy event handlers or third-party scripts detected. INP should pass comfortably.

**Risk**: The 313KB of React runtime (entry + chunk) must parse and hydrate on every page load. On low-end mobile devices, hydration could briefly block interactivity. However, with SSR in place, this is mitigated.

---

## 5. Cumulative Layout Shift (CLS)

### 5.1 Font-Induced Layout Shifts

**CRITICAL ISSUE**: Three Google Font families + Material Symbols icon font are loaded:

1. `Noto Serif JP` (weights: 400, 700, 900) — Japanese serif, large file
2. `Work Sans` (weights: 300, 400, 500, 600, 700) — Latin sans-serif
3. `Noto Sans JP` (weights: 300, 400, 500, 700) — Japanese sans-serif
4. `Material Symbols Outlined` (variable weight 100-700, FILL 0-1) — Icon font

All loaded with `display=swap`, which means text renders immediately in fallback font, then shifts when the web font loads (FOUT). Japanese fonts are particularly large (often 1-5MB per weight), causing late swaps and CLS.

**Estimated CLS contribution**: 0.05-0.15 from font swaps alone

### 5.2 Image Layout Shifts

In the article page template (`share.$category.$id.tsx`), the header thumbnail image correctly specifies `width={800} height={450}` with a `aspect-[16/9]` container. This is good.

However, images inside `dangerouslySetInnerHTML` article content (migrated from WordPress) have inconsistent dimension handling:
```html
<img class="alignnone wp-image-937 size-large"
     src="/uploads/2017/07/...800x450.png"
     alt="サムネイル" width="620" height="349" />
```
These DO have width/height attributes, but the CSS may override them without maintaining aspect ratio, causing shifts when images load.

### 5.3 No Dynamic Content Injection

No ads, pop-ups, or dynamically injected banners detected. The newsletter CTA in the sidebar is statically rendered. Good.

**Estimated total CLS**: 0.08-0.15 (borderline GOOD/NEEDS IMPROVEMENT)

---

## 6. Resource Size & Optimization Analysis

### 6.1 HTML Payload

| Page | Raw Size | Brotli Size | Verdict |
|------|----------|-------------|---------|
| Homepage `/share` | 410KB | 116KB | BLOATED — contains full React Router manifest inline |
| Article `/share/society/936` | 50KB | ~15KB (est.) | Good |

The homepage HTML includes the full React Router manifest, scroll restoration scripts, and SSR'd content for 20 post cards. The 410KB raw HTML is excessive.

### 6.2 CSS

| File | Size | Notes |
|------|------|-------|
| `root-C2ovrjkM.css` | 32KB | Tailwind CSS output — reasonable |

### 6.3 JavaScript (Total)

| | Uncompressed | Estimated Brotli |
|-|-------------|-----------------|
| All JS | ~329KB | ~90-100KB |

This is acceptable for a React SSR application. Code splitting is working correctly.

### 6.4 Images

| Image | Format | Size | Issue |
|-------|--------|------|-------|
| Article thumbnail | PNG | 485KB | Should be WebP/AVIF (~50-80KB) |

No hero images on the homepage (text-only listing). Article images are migrated WordPress assets served as PNG.

### 6.5 Fonts (External)

| Font | Estimated Total Download |
|------|--------------------------|
| Noto Serif JP (3 weights) | ~3-6MB (Japanese font) |
| Work Sans (5 weights) | ~200KB |
| Noto Sans JP (4 weights) | ~4-8MB (Japanese font) |
| Material Symbols Outlined | ~300KB |

**Total estimated font download: 7-15MB** (Google Fonts serves subset ranges, but Japanese requires many codepoints)

This is the single largest performance bottleneck on the site.

---

## 7. Caching Analysis

**CRITICAL ISSUE**: All static assets use `cache-control: public, max-age=0, must-revalidate`

This means every visit revalidates every asset, even though the filenames contain content hashes (e.g., `root-C2ovrjkM.css`). Hashed assets should be immutably cached.

**Current headers** (`public/_headers`):
```
/*
  X-Frame-Options: SAMEORIGIN
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  Strict-Transport-Security: max-age=31536000; includeSubDomains
```

Missing: Cache-Control directives for static assets.

---

## 8. Third-Party Script Impact

| Third Party | Type | Impact |
|-------------|------|--------|
| Google Fonts (`fonts.googleapis.com`) | Render-blocking CSS | HIGH — blocks text paint |
| Google Fonts (`fonts.gstatic.com`) | Font binaries | HIGH — large downloads |

**No other third-party scripts detected.** No analytics, no ads, no tag managers. This is excellent for performance.

---

## 9. Prioritized Recommendations

### P0 — Critical (expected LCP improvement: 1-2s)

#### 9.1 Fix static asset caching

Add long-term cache headers for hashed assets. Update `public/_headers`:

```
/assets/*
  Cache-Control: public, max-age=31536000, immutable

/uploads/*
  Cache-Control: public, max-age=2592000
```

**Impact**: Eliminates revalidation round-trips on repeat visits. Every JS, CSS, and image asset currently requires a server round-trip even when cached.

#### 9.2 Reduce font weight/family count

The site loads **3 font families + 1 icon font** with **16 total weights**. Reduce to:

- `Noto Serif JP`: Keep 700 and 900 only (used for headings)
- `Noto Sans JP`: Keep 400 and 700 only (body text)
- Remove `Work Sans` entirely (Noto Sans JP can serve the same role, or use system fonts for labels)
- Replace Material Symbols with inline SVGs for the 3-4 icons used (menu_book, arrow_forward, mail)

Updated font link:
```
fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@700;900&family=Noto+Sans+JP:wght@400;700&display=swap
```

**Impact**: Reduces font download from ~7-15MB to ~2-4MB. Eliminates 2 external font requests.

#### 9.3 Convert article images to WebP/AVIF

The article thumbnail is a 485KB PNG. Converting to WebP would reduce this to ~50-80KB (85-90% reduction). Options:

- Use Cloudflare Image Resizing (already on CF infrastructure)
- Or batch-convert existing `/uploads/` PNGs to WebP and serve with `<picture>` element
- Add `loading="lazy"` to non-LCP images
- Add `fetchpriority="high"` to the article hero image

### P1 — High (expected CLS improvement + faster repeat loads)

#### 9.4 Preload the LCP font

For article pages where the `<h1>` is the LCP element, preload the specific Noto Serif JP weight:

```html
<link rel="preload" as="font" type="font/woff2" crossorigin
      href="https://fonts.gstatic.com/s/notoserifjp/v31/..." />
```

This requires extracting the exact font URL from the Google Fonts CSS response.

Alternatively, self-host the critical font weights on the Cloudflare edge for maximum control and eliminate the cross-origin dependency entirely.

#### 9.5 Add `font-display: optional` for non-critical fonts

For icon fonts and secondary font families, use `font-display: optional` instead of `swap` to prevent layout shifts. If the font does not load in time, the fallback is used permanently for that page view.

#### 9.6 Preload hero image on article pages

In `share.$category.$id.tsx`, when `post.thumbnail_url` exists, add a `<link rel="preload">` in the route's `links` export:

```tsx
export const links: Route.LinksFunction = ({ data }) => {
  if (data?.post?.thumbnail_url) {
    return [{ rel: "preload", as: "image", href: data.post.thumbnail_url }];
  }
  return [];
};
```

### P2 — Medium

#### 9.7 Reduce homepage HTML size

The homepage HTML is 410KB (116KB compressed) for 20 post listings. Investigate:

- The React Router manifest and hydration data embedded inline may be inflated
- Consider reducing the number of posts per page from 20 to 10-12
- The inline `__reactRouterManifest` JSON includes all routes — consider if lazy route discovery can reduce this

#### 9.8 Add `width` and `height` to all content images

Images inside `dangerouslySetInnerHTML` from WordPress migration need consistent dimensions. The `formatArticleContent()` function in `~/lib/format-content` should ensure all `<img>` tags have explicit `width` and `height` attributes matching their natural dimensions.

#### 9.9 Redirect chain on root URL

`https://kakiokosi.com` -> 301 -> `https://kakiokosi.com/share`

This adds ~50ms to first visit. Consider serving the listing page directly at `/` to eliminate the redirect, or at minimum ensure the redirect is cached at the edge.

### P3 — Low / Nice-to-have

#### 9.10 Self-host fonts on Cloudflare

Eliminate the two cross-origin connections to `fonts.googleapis.com` and `fonts.gstatic.com` by self-hosting the subset font files. This removes 2 DNS lookups + TLS handshakes + request waterfalls.

#### 9.11 Add resource hints

```html
<link rel="dns-prefetch" href="https://fonts.googleapis.com" />
```

Already has `preconnect` for Google Fonts (good). The `modulepreload` hints for JS bundles are correctly in place.

#### 9.12 Consider streaming SSR

React Router v7 on Cloudflare Workers supports streaming SSR. The homepage's 410KB HTML could benefit from streaming to get initial content painted faster while the remainder loads.

---

## 10. Core Web Vitals Estimated Pass/Fail

| Metric | Estimated p75 | Threshold | Verdict |
|--------|---------------|-----------|---------|
| **LCP** | 2.5-3.5s (mobile) | <= 2.5s | NEEDS IMPROVEMENT |
| **INP** | < 100ms | <= 200ms | GOOD |
| **CLS** | 0.08-0.15 | <= 0.1 | BORDERLINE |

**Overall CWV Assessment**: DOES NOT PASS (LCP is the blocker)

After implementing P0 recommendations (caching, font reduction, image optimization), estimated improvement:

| Metric | After Optimization | Verdict |
|--------|-------------------|---------|
| **LCP** | 1.5-2.2s | GOOD |
| **INP** | < 100ms | GOOD |
| **CLS** | 0.03-0.06 | GOOD |

---

## 11. What Is Already Done Well

- Server-side rendering on Cloudflare Workers edge (fast TTFB globally)
- Brotli compression enabled
- Route-level code splitting with modulepreload hints
- No third-party analytics/ad scripts
- Clean, semantic HTML structure
- Proper structured data (JSON-LD)
- `preconnect` hints for Google Fonts
- Article thumbnail has explicit width/height in template
- Reasonable total JS size (~329KB uncompressed, ~100KB compressed)
- Lazy route discovery enabled (`routeDiscovery.mode: "lazy"`)
