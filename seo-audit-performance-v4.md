# Performance Audit v4 -- kakiokosi.com

**Date:** 2026-03-28
**URL tested:** https://kakiokosi.com (redirects to /share)
**Method:** curl from Tokyo (NRT edge), HTML source analysis

---

## Overall Score: 92 / 100

---

## 1. Homepage HTML Size

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| HTML size (uncompressed) | 50,053 bytes (~49KB) | ~50KB | PASS |

The HTML payload is right on target. Server-side rendered with inline data, no bloat.

---

## 2. TTFB (Time to First Byte)

| Metric | Value | Threshold | Status |
|--------|-------|-----------|--------|
| TTFB (with redirect) | 159ms | < 200ms | PASS |
| Redirect hop | 301 / -> /share | -- | OK |

The 301 redirect adds one round-trip (~7ms overhead observed). TTFB at the final
resource is well within the 200ms target. Cloudflare NRT edge is serving efficiently.

---

## 3. Cache-Control Headers

### /assets/* (JS, CSS -- fingerprinted filenames)

| Resource | Cache-Control | Status |
|----------|--------------|--------|
| entry.client-CS2_CXNr.js | `public, max-age=31536000, immutable` | PASS |
| chunk-UVKPFVEO-CA_hvMfz.js | `public, max-age=31536000, immutable` | PASS |
| root-DeQuph_I.js | `public, max-age=31536000, immutable` | PASS |
| root-MItOnp8d.css | `public, max-age=31536000, immutable` | PASS |

### /uploads/* (images)

| Resource | Cache-Control | Status |
|----------|--------------|--------|
| LCP hero image (PNG) | `public, max-age=31536000, immutable` | PASS |
| fbcoo.jpg | `public, max-age=31536000, immutable` | PASS |

Both `/assets/*` and `/uploads/*` return the correct immutable caching directive.
The `_headers` file is properly configured on Cloudflare Pages.

---

## 4. Content-Type charset

| Resource | Content-Type | Status |
|----------|-------------|--------|
| HTML (/share) | `text/html; charset=utf-8` | PASS |
| JS assets | `text/javascript` | PASS |
| CSS assets | `text/css` | PASS |
| PNG images | `image/png` | PASS |
| JPEG images | `image/jpeg` | PASS |

HTML correctly includes `charset=utf-8`. The `<meta charSet="utf-8"/>` tag is also
present in the document head.

---

## 5. Font Loading

| Check | Result | Status |
|-------|--------|--------|
| Material Symbols referenced | No | PASS |
| Google Fonts used | Noto Serif JP, Work Sans, Noto Sans JP | OK |
| `display=swap` | Yes | PASS |
| `preconnect` to fonts.googleapis.com | Yes | PASS |
| `preconnect` to fonts.gstatic.com | Yes | PASS |

Material Symbols has been fully removed. The remaining Google Fonts use `display=swap`
to avoid invisible text during loading, and both preconnect hints are in place.

---

## 6. Image Sizes and Formats

| Image | Size | Format | Dimensions attr | Loading |
|-------|------|--------|-----------------|---------|
| Hero (LCP) fc6927a4...800x450.png | **473KB** | PNG | 640x360 | eager + fetchPriority=high |
| fbcoo.jpg | 36KB | JPEG | 400x250 | lazy |
| cde366be...1.jpg | 47KB | JPEG | 400x250 | lazy |
| 4cc5561f...1.jpg | 36KB | JPEG | 400x250 | lazy |
| 73e4dfdc...9.jpg | 10KB | JPEG | 400x250 | lazy |

**LCP image is preloaded** via `<link rel="preload">` with `fetchPriority="high"` --
this is correct and optimal.

All images have explicit `width` and `height` attributes (prevents CLS).
Below-the-fold images use `loading="lazy"`.

**Issue:** The LCP hero image is 473KB PNG. Converting to WebP (~80-120KB) or
AVIF (~50-80KB) would reduce it by 70-85%.

**Issue:** Two legacy `wp-content` image URLs return 404:
- `https://kakiokosi.com/wp-content/uploads/2011/05/horiemon2-300x225.jpg`
- `https://kakiokosi.com/wp-content/uploads/2011/05/7f57401c...300x181.png`

These are broken images visible on the page (bottom of listing).

---

## 7. Core Web Vitals Estimates

### LCP (Largest Contentful Paint)

| Factor | Estimate | Notes |
|--------|----------|-------|
| TTFB | ~160ms | Excellent |
| Resource load delay | ~0ms | Preloaded in `<head>` |
| Resource load time | ~200-400ms | 473KB PNG over CDN |
| Element render delay | ~50ms | No render-blocking JS |
| **Estimated LCP** | **~400-600ms** | **PASS (< 2.5s)** |

The LCP image is preloaded with `fetchPriority="high"`, served from Cloudflare edge
with immutable caching. On repeat visits it will be instant from disk cache.

### INP (Interaction to Next Paint)

| Factor | Assessment | Notes |
|--------|-----------|-------|
| DOM size | ~242 elements | Excellent (well under 1,500) |
| JS bundle (entry + chunk) | 305KB | Moderate, but modulepreloaded |
| Third-party scripts | None | Excellent |
| Event handlers | Minimal (pagination, links) | Excellent |
| **Estimated INP** | **< 100ms** | **PASS (< 200ms)** |

No third-party scripts, no heavy event handlers, small DOM. INP should be excellent.

### CLS (Cumulative Layout Shift)

| Factor | Assessment | Notes |
|--------|-----------|-------|
| Image dimensions | All have width/height | PASS |
| Font loading | `display=swap` | Minor FOUT possible |
| Dynamic content injection | None observed | PASS |
| Ads/embeds | None | PASS |
| **Estimated CLS** | **< 0.05** | **PASS (< 0.1)** |

All images have explicit dimensions. No ads or late-injecting content.
The `display=swap` font strategy may cause a small layout shift from FOUT,
but with preconnect hints this should be negligible.

---

## Summary

| Check | Status | Score |
|-------|--------|-------|
| 1. HTML size ~50KB | 49KB -- on target | 10/10 |
| 2. TTFB < 200ms | 159ms | 10/10 |
| 3. Cache-Control immutable | Both /assets/* and /uploads/* correct | 10/10 |
| 4. Content-Type charset=utf-8 | Present on HTML | 10/10 |
| 5. No Material Symbols | Fully removed | 10/10 |
| 6. Image sizes and formats | LCP image too large (473KB PNG); 2 broken wp-content images | 6/10 |
| 7. CWV estimates | LCP PASS, INP PASS, CLS PASS | 10/10 |

**Deductions:**
- -4 points: LCP hero image is 473KB PNG (should be WebP/AVIF, ~80-120KB)
- -4 points: Two broken `wp-content` image URLs returning 404

---

## Remaining Recommendations (Priority Order)

### High Impact

1. **Convert LCP hero image to WebP/AVIF** (-70-85% file size).
   The 473KB PNG at `/uploads/2017/07/fc6927a4...800x450.png` is the single largest
   resource on the page. Converting to WebP would bring it to ~100KB, or AVIF to ~60KB.
   Use `<picture>` with fallback, or serve WebP from R2 with content negotiation.

2. **Fix broken wp-content image URLs.** Two posts near the bottom of the listing
   reference old WordPress paths that 404. Either migrate these images to `/uploads/`
   or add redirect rules in `_redirects` for the `/wp-content/uploads/*` path.

### Low Impact (Nice to Have)

3. **Add `decoding="async"` to images.** None of the `<img>` tags include this
   attribute. While not a CWV factor, it allows the browser to decode images off the
   main thread.

4. **Consider `font-display: optional`** instead of `swap` for Noto Serif JP (display
   font). This eliminates FOUT entirely at the cost of occasionally showing the fallback
   font, which can further reduce CLS to near zero.

---

## What Has Been Fixed Since v1

- Material Symbols icon font: removed
- Cache-Control headers: immutable on all static assets
- Content-Type charset: present
- HTML size: trimmed to ~50KB
- LCP preload: in place with fetchPriority
- Image dimensions: all images have width/height
- Lazy loading: below-fold images use loading=lazy
- Security headers: comprehensive CSP, HSTS, X-Frame-Options
- No third-party scripts blocking render
