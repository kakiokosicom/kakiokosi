# Technical SEO Audit: kakiokosi.com

**Date:** 2026-03-28
**Auditor:** Automated Technical SEO Analysis
**Stack:** React Router v7 (SSR) on Cloudflare Workers + D1 + R2

---

## Overall Technical Score: 62 / 100

| Category | Score | Status |
|---|---|---|
| Crawlability | 16/20 | Needs Improvement |
| Indexability | 10/20 | Needs Improvement |
| Security | 8/15 | FAIL |
| URL Structure | 10/15 | Needs Improvement |
| Mobile Optimization | 8/10 | PASS |
| Core Web Vitals Signals | 5/10 | Needs Improvement |
| Structured Data | 8/10 | PASS |
| JavaScript Rendering | 7/10 | PASS (SSR) |

---

## 1. Crawlability (16/20)

### robots.txt -- PASS with issues

**Live URL:** https://kakiokosi.com/robots.txt returns HTTP 200.

**Issue: Duplicate directives (Medium)**
The live robots.txt contains two sets of directives -- one injected by Cloudflare ("BEGIN Cloudflare Managed content") and one from the repository's `public/robots.txt`. This causes duplicate `User-agent: *` blocks. While most crawlers will still parse it correctly, it is untidy and could cause confusion.

Cloudflare-injected block includes:
- `Content-Signal: search=yes,ai-train=no` (Cloudflare's new content signal protocol)
- `CloudflareBrowserRenderingCrawler` block (not in local file)

Your local file's directives are appended below Cloudflare's, producing duplicates for Amazonbot, Applebot-Extended, Bytespider, CCBot, ClaudeBot, Google-Extended, GPTBot, and meta-externalagent.

**AI crawler blocking -- PASS**
All major AI training crawlers are blocked:
- GPTBot, ClaudeBot, CCBot, Google-Extended, Amazonbot, Applebot-Extended, Bytespider, meta-externalagent

**Sitemap declaration -- PASS**
`Sitemap: https://kakiokosi.com/sitemap.xml` is declared and resolves correctly.

**Auth/Dashboard blocking -- PASS**
`Disallow: /auth/` and `Disallow: /dashboard/` are correct.

### sitemap.xml -- PASS with issues

**Live URL:** https://kakiokosi.com/sitemap.xml returns HTTP 200 with correct `application/xml` content type.

**546 URLs indexed** including articles, categories, tags, and static pages.

**Issue: Stale lastmod dates (Medium)**
The homepage (`/share`) has `lastmod` of `2017-07-19`, which is nearly 9 years old. This suggests either (a) no new content has been published since then, or (b) the lastmod is incorrectly using the most recent post's `published_at` rather than a dynamic "last updated" timestamp for the index page. Google uses lastmod as a quality signal -- stale dates reduce crawl priority.

**Issue: Pagination pages not in sitemap (Low)**
Category pagination pages (`/share/category/business/page/2`, etc.) are not included. While not strictly required, including them helps discovery of deep content.

**Recommendations:**
1. Consolidate robots.txt: Work with Cloudflare settings to avoid the duplicate block, or remove the AI crawler rules from your local file since Cloudflare already injects them.
2. Update the sitemap homepage `lastmod` to use the actual last-modified date of the index (e.g., `NOW()` or the deployment date).

---

## 2. Indexability (10/20)

### Canonical Tags -- PASS

All tested pages have correct self-referencing canonical tags:
- Homepage: `<link rel="canonical" href="https://kakiokosi.com/share"/>`
- Article: `<link rel="canonical" href="https://kakiokosi.com/share/society/936"/>`
- Category: `<link rel="canonical" href="https://kakiokosi.com/share/category/business"/>`
- Paginated category: `<link rel="canonical" href="https://kakiokosi.com/share/category/business/page/2"/>` (self-referencing, correct)

### Meta Robots -- PASS
No `noindex` directives found on public pages. No `X-Robots-Tag` response headers present.

### CRITICAL: Static pages returning errors (Critical)

**`/share/about` returns a 500 error page.** The response body shows "Error - Unexpected error occurred" instead of the About page content. This means:
- The About page is broken in production
- Any other pages using the `share.static.tsx` route may also be broken (TOS, Privacy, Contact, etc.)
- These pages ARE included in the sitemap, meaning Google is discovering URLs that return errors

**`/share/page/2` returns 404.** The pagination route for the main listing is broken. This file exists locally (`app/routes/share.page.$page.tsx`) but returns a 404 in production, suggesting it may not be deployed or has a loader error.

### CRITICAL: Root domain redirects to /share (High)

`https://kakiokosi.com/` returns a 301 redirect to `/share`. This means:
- The canonical homepage is `/share`, not `/`
- The sitemap correctly lists `/share` as the top-level URL
- However, any inbound links to `https://kakiokosi.com/` require an extra redirect hop

### Wrong category redirect handling -- PASS
The article route correctly 301-redirects to the canonical category URL when accessed with a wrong category slug.

**Recommendations:**
1. **URGENT:** Fix the `/share/about` route (and likely all static pages). Check the `share.static.tsx` loader for database query errors.
2. **URGENT:** Fix the `/share/page/2` pagination route. The 404 means users cannot browse beyond page 1 from the main listing.
3. Consider making `/` serve the homepage content directly instead of redirecting to `/share` to eliminate one redirect hop.

---

## 3. Security (8/15) -- FAIL

### HTTPS -- PASS
Site serves over HTTP/2 with valid TLS via Cloudflare. HTTP to HTTPS redirect is handled by Cloudflare (confirmed: `http://kakiokosi.com/` returns 200 after redirect).

### Content-Security-Policy -- PARTIAL
Only `upgrade-insecure-requests` is set via a `<meta>` tag in HTML. No full CSP header is present.

### CRITICAL: Security headers NOT being served (Critical)

The `public/_headers` file defines:
```
X-Frame-Options: SAMEORIGIN
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

**However, NONE of these headers appear in the live HTTP response.** The response only shows Cloudflare's default headers (`cf-ray`, `server`, `nel`, `report-to`, `alt-svc`).

This means the `_headers` file is either:
- Not being picked up by Cloudflare Pages (possibly because this is a Workers site, not a Pages static site -- `_headers` only works with Cloudflare Pages static assets)
- Being overridden by the Worker response

**Missing headers (all absent from live response):**
| Header | Status | Risk |
|---|---|---|
| Strict-Transport-Security | MISSING | High - No HSTS protection |
| X-Content-Type-Options | MISSING | Medium - MIME sniffing possible |
| X-Frame-Options | MISSING | Medium - Clickjacking possible |
| Referrer-Policy | MISSING | Low |
| Permissions-Policy | MISSING | Low |
| Cache-Control | MISSING | Medium - No browser caching hints |

**Recommendations:**
1. **URGENT:** Since this is a Cloudflare Workers site, `_headers` files are ignored. You must set response headers programmatically in the Worker/React Router server handler. Add a middleware or modify the `entry.server.tsx` to inject security headers into every response.
2. Add HSTS header with `includeSubDomains` and consider `preload`.
3. Add `X-Content-Type-Options: nosniff` to all responses.
4. Add `X-Frame-Options: SAMEORIGIN` or use CSP `frame-ancestors`.

Example implementation in entry.server.tsx or a middleware:
```typescript
// In your server entry or a catch-all handler
const securityHeaders = {
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "SAMEORIGIN",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};
```

---

## 4. URL Structure (10/15)

### Clean URLs -- PASS
URL structure is clean and semantic:
- Articles: `/share/{category}/{id}` (e.g., `/share/society/936`)
- Categories: `/share/category/{slug}` (e.g., `/share/category/business`)
- Tags: `/share/tag/{slug}`
- Pagination: `/share/category/{slug}/page/{n}`
- Static pages: `/share/{slug}` (e.g., `/share/about`)

### Issue: Numeric IDs instead of slugs (Medium)
Article URLs use numeric database IDs (`/936`) instead of human-readable slugs. This is a minor SEO issue -- descriptive slugs improve click-through rates in search results and provide keyword signals.

### Issue: /share prefix on all URLs (Low)
All public content lives under `/share/`, adding an unnecessary path segment. While not harmful to SEO (the canonical tags are consistent), it is non-standard. The root `/` redirects to `/share` rather than serving content directly.

### Redirect chain -- PASS (minor)
`/ -> 301 -> /share` is a single-hop redirect. No multi-hop chains detected.

### Trailing slash consistency -- PASS
URLs are served without trailing slashes consistently.

**Recommendations:**
1. Consider adding human-readable slugs to article URLs in a future migration (e.g., `/share/society/936/mama-dakko-shiteyo`). This would require redirects from old URLs.
2. Long-term: Consider removing the `/share` prefix from public URLs.

---

## 5. Mobile Optimization (8/10) -- PASS

### Viewport Meta Tag -- PASS
```html
<meta name="viewport" content="width=device-width, initial-scale=1" />
```

### Responsive Design -- PASS
- Tailwind CSS responsive classes are used throughout (`md:`, `lg:` prefixes)
- Navigation uses `hidden md:flex` pattern for mobile/desktop switching
- Content uses responsive grid: `grid-cols-1 md:grid-cols-2`
- Max-width containers: `max-w-7xl mx-auto`
- Responsive padding: `px-6 md:px-8`
- Responsive typography: `text-4xl md:text-5xl lg:text-6xl`

### Touch Targets -- NEEDS REVIEW
- Navigation links use sufficient padding (`py-4`)
- Pagination buttons are `w-10 h-10` (40x40px) which meets the 48x48px minimum only marginally -- consider increasing to `w-12 h-12`
- Tag links use `px-4 py-2` which should be adequate

### Issue: No mobile hamburger menu detected (Low)
The mobile navigation hides the desktop nav (`hidden md:flex`) but no hamburger menu button is visible in the HTML. Mobile users may not have access to category navigation.

**Recommendations:**
1. Add a hamburger/drawer menu for mobile users to access category navigation.
2. Increase pagination touch targets to at least 48x48px.

---

## 6. Core Web Vitals Signals (5/10)

### LCP Concerns (Needs Improvement)

**Issue: Heavy font loading (High)**
The page loads 4 font families from Google Fonts:
1. Noto Serif JP (4 weights: 400, 700, 900)
2. Work Sans (5 weights: 300-700)
3. Noto Sans JP (4 weights: 300-700)
4. Material Symbols Outlined (variable weight + fill)

This is approximately 1-2MB of font data (especially Japanese fonts which contain thousands of glyphs). Japanese web fonts are notoriously large.

- `rel="preconnect"` is correctly set for `fonts.googleapis.com` and `fonts.gstatic.com`
- `display=swap` is used, which prevents invisible text but may cause layout shifts

**Issue: No image lazy loading on listing pages (Medium)**
The homepage listing does not appear to use `<img>` tags (articles are text-only cards), but article pages contain images from WordPress migration (e.g., `/uploads/2017/07/...`) without `loading="lazy"` attributes.

**Issue: No preload for LCP element (Medium)**
The largest contentful element is likely the H1 heading text, which depends on font loading. There is no `<link rel="preload">` for the primary font file.

### INP Concerns (Low Risk)

The site is primarily content-focused with minimal interactivity. React Router v7 with SSR means the page is interactive after hydration. The JavaScript bundle is code-split per route (`modulepreload` directives present), which is good.

### CLS Concerns (Medium Risk)

**Issue: Font swap causing layout shift (Medium)**
Using `display=swap` for Japanese fonts means the browser will first render with a system fallback font, then swap to the web font. Japanese text with different fonts can cause significant layout shifts due to glyph size differences.

**Issue: Images in article content lack explicit dimensions (Low)**
Article images from WordPress migration do have `width` and `height` attributes (e.g., `width="620" height="349"`), which is good for CLS.

**Recommendations:**
1. **HIGH:** Reduce font weight count. Consider loading only the weights actually used:
   - Noto Serif JP: likely only need 700 and 900
   - Work Sans: likely only need 400 and 600
   - Noto Sans JP: likely only need 400 and 700
   - Or use `font-display: optional` to prevent layout shifts entirely
2. **HIGH:** Consider self-hosting fonts on Cloudflare R2 with proper cache headers. This eliminates the Google Fonts round-trip.
3. **MEDIUM:** Add `loading="lazy"` to all article content images except the first visible image.
4. **MEDIUM:** Add `fetchpriority="high"` to the hero/above-fold content image.
5. **LOW:** Use `size-adjust` and `ascent-override` in `@font-face` declarations to create better fallback fonts that minimize CLS from font swapping.

---

## 7. Structured Data (8/10) -- PASS

### Homepage -- PASS
```json
{
  "@type": "WebSite",
  "potentialAction": { "@type": "SearchAction" }
}
{
  "@type": "Organization"
}
```
SearchAction with sitelinks search box markup is correctly implemented.

### Article Pages -- PASS
Two structured data blocks present:
1. **Global** (root layout): WebSite + Organization
2. **Article-specific**: Article + BreadcrumbList

Article schema includes:
- `headline`, `description`, `url`
- `datePublished`, `dateModified`
- `publisher` (Organization)
- `mainEntityOfPage` (WebPage)

BreadcrumbList schema includes proper hierarchy: Home > Category > Article title.

### Issue: Missing author schema (Low)
Article schema does not include an `author` field. Google recommends including author information for news/article content.

### Issue: Missing og:image on most articles (Medium)
OG image is conditionally set only when `thumbnail_url` exists. Many migrated articles may not have thumbnails, reducing social sharing appearance.

**Recommendations:**
1. Add `author` field to Article schema (even if it is the organization).
2. Create a default OG image for articles that lack thumbnails.
3. Consider adding `FAQPage` or `HowTo` schema for service pages (technique, tapeokoshi, etc.).

---

## 8. JavaScript Rendering (7/10) -- PASS (SSR)

### Server-Side Rendering -- PASS
The site uses React Router v7 with SSR on Cloudflare Workers:
```javascript
window.__reactRouterContext.ssr = true
window.__reactRouterContext.isSpaMode = false
```

This means:
- Full HTML is delivered on first load (Google can index without JS execution)
- Content is visible in `curl` responses (confirmed)
- Structured data is rendered server-side (confirmed)
- Meta tags are rendered server-side (confirmed)

### Code Splitting -- PASS
Route-level code splitting is active with `modulepreload` directives:
- `entry.client-CS2_CXNr.js` (framework entry)
- `chunk-UVKPFVEO-CA_hvMfz.js` (shared chunk)
- Route-specific: `share._index-MZcw32kP.js`, `share._category._id-5IilBnJt.js`, etc.

### Lazy Route Discovery -- PASS
```javascript
routeDiscovery: { mode: "lazy", manifestPath: "/__manifest" }
```
Routes are discovered lazily, reducing initial bundle size.

### Issue: Client hydration bundle size unknown (Low)
Without a Lighthouse run, exact JS bundle sizes cannot be confirmed. However, the code-split approach with modulepreload is best practice.

### Issue: No service worker or offline support (Low)
Not critical for a content site, but a service worker could improve repeat visit performance.

**Recommendations:**
1. Verify total JS bundle size stays under 200KB gzipped for initial load.
2. Consider implementing a service worker for repeat visit caching of static assets.

---

## Priority Summary

### Critical Issues (Fix Immediately)

1. **Security headers not being served.** The `_headers` file is ignored by Cloudflare Workers. All security headers (HSTS, X-Frame-Options, X-Content-Type-Options, etc.) are completely absent from live responses. Implement headers in the Worker/server code.

2. **`/share/about` returns 500 error.** The static pages route is broken in production. This affects About, TOS, Privacy, Contact, and other static pages that are in the sitemap. Google is discovering and indexing error pages.

3. **`/share/page/2` returns 404.** Main listing pagination is broken. Users cannot browse beyond page 1.

### High Priority

4. **Heavy font loading (~1-2MB).** Four font families with many weights are loaded from Google Fonts. Japanese fonts are especially large. This directly impacts LCP.

5. **Duplicate robots.txt directives.** Cloudflare injects its own block, resulting in duplicate rules. Clean this up by removing the local duplicates or adjusting Cloudflare settings.

### Medium Priority

6. **Stale sitemap lastmod dates.** Homepage lastmod is 2017-07-19, signaling to Google that the site is dormant.

7. **Missing og:image on articles without thumbnails.** Many articles lack social sharing images.

8. **Font swap CLS risk.** Japanese font swapping can cause measurable layout shifts.

9. **Numeric IDs in article URLs.** No keyword signals in URL paths.

10. **No mobile hamburger menu.** Category navigation inaccessible on mobile.

### Low Priority

11. Missing `author` field in Article structured data.
12. Pagination pages not in sitemap.
13. No `loading="lazy"` on article content images.
14. Consider removing `/share` prefix long-term.
15. Add service worker for repeat visit performance.

---

## Files Referenced

- `/Users/hajimeataka/kakiokosi/public/robots.txt` -- Local robots.txt (duplicated by Cloudflare in production)
- `/Users/hajimeataka/kakiokosi/public/_headers` -- Security headers file (NOT being applied in production)
- `/Users/hajimeataka/kakiokosi/app/routes/sitemap[.]xml.tsx` -- Sitemap generation logic
- `/Users/hajimeataka/kakiokosi/app/root.tsx` -- Root layout with global structured data and font loading
- `/Users/hajimeataka/kakiokosi/app/routes/share._index.tsx` -- Homepage route with meta tags
- `/Users/hajimeataka/kakiokosi/app/routes/share.$category.$id.tsx` -- Article route with canonical/OG/schema
- `/Users/hajimeataka/kakiokosi/app/routes/share.page.$page.tsx` -- Pagination route (404 in production)
- `/Users/hajimeataka/kakiokosi/app/routes/share.static.tsx` -- Static pages route (500 in production)
