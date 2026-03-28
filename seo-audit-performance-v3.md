# Core Web Vitals & Performance Audit v3

**Site**: https://kakiokosi.com
**Date**: 2026-03-28
**Tested from**: Japan (NRT edge)

---

## Executive Summary

The listing query optimization was successful -- homepage HTML dropped from ~445KB to ~50KB (89% reduction). TTFB is excellent at ~80-130ms from Japan. Asset caching is correctly configured with immutable headers. Material Symbols font has been removed. Two significant issues remain: uploaded images (`/uploads/*`) have no cache duration, and images are served as unoptimized PNG/JPEG without modern formats.

**Overall estimated Lighthouse score: 80-88**

---

## 1. HTML Size

| Page | Uncompressed | Gzip | Status |
|------|-------------|------|--------|
| Homepage `/share` | 50,053 bytes (~49KB) | 10,417 bytes (~10KB) | PASS -- was 445KB |
| Page 2 `/share/page/2` | 47,127 bytes (~46KB) | -- | PASS |
| Article `/share/society/936` | 61,499 bytes (~60KB) | -- | PASS |
| Article `/share/business/881` | 89,140 bytes (~87KB) | -- | OK (article content) |
| Article `/share/politics/643` | 29,971 bytes (~29KB) | -- | PASS |

The homepage size is now within the target of ~50KB. Article pages vary by content length, which is expected.

---

## 2. TTFB (Time to First Byte)

| Page | TTFB | Rating |
|------|------|--------|
| Homepage (run 1) | 82ms | Excellent |
| Homepage (run 2) | 82ms | Excellent |
| Homepage (run 3) | 131ms | Excellent |
| Page 2 | 105ms | Excellent |
| Article /society/936 | 146ms | Excellent |
| Article /business/881 | 200ms | Good |
| Article /politics/643 | 108ms | Excellent |

All pages are well under the 200ms TTFB target. Cloudflare edge (NRT) is serving from the nearest PoP.

---

## 3. Asset Caching

### /assets/* (JS, CSS) -- PASS

```
cache-control: public, max-age=31536000, immutable
```

All hashed assets correctly use 1-year immutable caching.

| Asset | Uncompressed | Gzip |
|-------|-------------|------|
| entry.client.js | 187KB | 59KB |
| chunk-UVKPFVEO.js | 126KB | 43KB |
| root.js | 7KB | -- |
| root.css | 36KB | -- |
| Other route JS | ~12KB total | -- |

Total JS transferred (gzip): ~105KB. This is acceptable for a React Router SSR app but could benefit from further code splitting if the React runtime grows.

### /uploads/* (Images) -- FAIL

```
cache-control: public, max-age=0, must-revalidate
```

Uploaded images have **zero cache duration**. Every page visit re-validates every image. This wastes bandwidth and increases LCP on repeat visits.

**Fix**: Add `/uploads/*` cache rule to `public/_headers`:

```
/uploads/*
  Cache-Control: public, max-age=31536000, immutable
```

Since these are content-addressed legacy WordPress uploads that never change at the same URL, immutable caching is safe.

---

## 4. Font Loading

### Material Symbols -- REMOVED (PASS)

No references to Material Symbols found in any page HTML. This removes ~100KB+ of unnecessary font downloads.

### Google Fonts -- Loaded (Acceptable)

Currently loading:
- Noto Serif JP (wght 700, 900)
- Work Sans (wght 400, 600, 700)
- Noto Sans JP (wght 400, 700)

With `display=swap` and `preconnect` to `fonts.googleapis.com` and `fonts.gstatic.com`.

**Concern**: Three font families with multiple weights means several round-trips to Google. Japanese fonts (Noto Serif JP, Noto Sans JP) are particularly large even with subsetting. This is the biggest LCP delay risk after TTFB.

**Recommendation (medium priority)**: Consider self-hosting the fonts with only the needed subsets, or reducing to two families. The `preconnect` hints are already in place which helps.

---

## 5. Image Optimization

### Dimensions (width/height) -- PASS

All images on the homepage have explicit `width` and `height` attributes:
- Hero: 640x360 with `fetchPriority="high"` and `loading="eager"`
- Cards: 400x250 with `loading="lazy"`

Article hero images also have dimensions (800x450) with `fetchPriority="high"`.

This prevents CLS from image loading.

### LCP Image Preload -- PASS

Hero image is preloaded in `<head>`:
```html
<link rel="preload" as="image" href="/uploads/2017/07/...png" fetchPriority="high"/>
```

### Image Format -- NEEDS IMPROVEMENT

All images are served as original PNG/JPEG. No WebP or AVIF conversion is in place. The hero image is an 800x450 PNG which is likely 100KB+ when it could be 20-30KB as WebP.

**Fix (high impact)**: Use Cloudflare Image Resizing or cf-image-resizing to serve WebP/AVIF automatically. Alternatively, implement an image transformation worker that converts on the fly.

### og:image Uses Relative URL -- BUG

```html
<meta property="og:image" content="/uploads/2017/07/...png"/>
```

This should be an absolute URL (`https://kakiokosi.com/uploads/...`). Social platforms may fail to fetch the image.

---

## 6. Core Web Vitals Estimates

### LCP (Largest Contentful Paint) -- Estimated: 1.5-2.5s

| Factor | Time | Status |
|--------|------|--------|
| TTFB | ~100ms | Excellent |
| Resource load delay | ~50ms (preloaded) | Good |
| Resource load time | ~200-500ms (PNG, no cache) | Needs improvement |
| Element render delay | ~100ms (font swap) | Good |

The hero image preload and fast TTFB are strong. The main drag is the unoptimized image format (PNG) and zero cache on `/uploads/*`. With WebP conversion and proper caching, LCP should consistently be under 2.0s.

**Rating: GOOD (borderline)** -- likely passes at p75 but could fail on slower connections.

### INP (Interaction to Next Paint) -- Estimated: <100ms

The site is primarily a content/reading site with minimal interactivity:
- No heavy JavaScript event handlers visible
- Total JS is ~105KB gzip (React + router)
- No third-party scripts blocking the main thread
- DOM size is small (SSR-rendered content)

**Rating: GOOD** -- very low risk for INP issues.

### CLS (Cumulative Layout Shift) -- Estimated: <0.05

- All images have explicit dimensions -- PASS
- Font loading uses `display=swap` which can cause minor FOUT -- but with preconnect this is minimal
- No dynamically injected ads or embeds
- No late-loading elements observed

**Rating: GOOD** -- should pass easily.

---

## 7. Prioritized Recommendations

### P0 -- Critical (do now)

1. **Add `/uploads/*` cache headers** -- Images currently have `max-age=0`. Add to `public/_headers`:
   ```
   /uploads/*
     Cache-Control: public, max-age=31536000, immutable
   ```
   **Impact**: Eliminates re-downloads on repeat visits. Reduces LCP by 200-400ms for returning users.

2. **Fix og:image to use absolute URLs** -- Currently `/uploads/...` (relative). Social crawlers need `https://kakiokosi.com/uploads/...`.
   **Impact**: Fixes social sharing previews.

### P1 -- High (this sprint)

3. **Convert images to WebP/AVIF** -- Serve modern formats via Cloudflare Polish (if on Pro plan) or implement a Cloudflare Worker that transforms images. PNG hero images are 3-5x larger than needed.
   **Impact**: Reduces LCP image load time by 60-80%. Saves bandwidth.

### P2 -- Medium (next sprint)

4. **Self-host fonts or reduce font families** -- Three Google Font families with Japanese subsets create multiple round-trips. Consider:
   - Self-hosting with `font-display: swap` and `preload` on critical weights
   - Dropping Work Sans (use system font for body copy)
   **Impact**: Reduces render-blocking time by 100-300ms.

5. **Add `Content-Security-Policy` font-src for self-hosted fonts** -- If self-hosting, update CSP accordingly.

### P3 -- Low (backlog)

6. **Lazy-load inline article images** -- Images inside article `<div class="article-content">` from WordPress content lack `loading="lazy"`. These are below the fold.
   **Impact**: Minor bandwidth saving on article pages.

7. **Consider Brotli compression** -- Cloudflare provides this automatically on Pro plans. The homepage gzips to 10KB; Brotli would bring it to ~8-9KB.

---

## 8. Before vs After Comparison

| Metric | v2 (previous) | v3 (current) | Change |
|--------|--------------|--------------|--------|
| Homepage HTML | ~445KB | 50KB | -89% |
| Homepage gzip | ~85KB (est) | 10KB | -88% |
| TTFB | ~100ms | ~80-130ms | Same |
| Material Symbols | Loaded (~100KB+) | Removed | -100KB |
| /assets/* caching | immutable | immutable | Same |
| /uploads/* caching | max-age=0 | max-age=0 | NOT FIXED |
| Image format | PNG/JPEG | PNG/JPEG | NOT FIXED |
| Image dimensions | Present | Present | Same |
| LCP preload | Present | Present | Same |

---

## 9. Pass/Fail Summary

| Metric | Threshold | Estimated | Status |
|--------|-----------|-----------|--------|
| LCP | <=2.5s | 1.5-2.5s | PASS (borderline) |
| INP | <=200ms | <100ms | PASS |
| CLS | <=0.1 | <0.05 | PASS |
| TTFB | <=200ms | 80-130ms | PASS |

**All three Core Web Vitals are estimated to pass at p75.** The site should qualify for the "Good" badge in CrUX once sufficient field data is collected. The two remaining actions (image caching and WebP conversion) would move LCP from borderline to comfortably passing.
