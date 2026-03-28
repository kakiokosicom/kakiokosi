# kakiokosi.com SEO Action Plan

**Generated:** 2026-03-28
**Current Score:** 42/100
**Target Score:** 75/100+

---

## CRITICAL (Fix Immediately) — Blocks indexing or causes penalties

### 1. Add Canonical Tags to All Pages
**Impact:** Prevents duplicate content penalties, consolidates ranking signals
**Effort:** 1-2 hours
**File:** `app/root.tsx`

Add a `<link rel="canonical">` tag in the root layout or per-route `meta()` exports. Each page must declare its own canonical URL.

```tsx
// In each route's meta() function, add:
{ tagName: "link", rel: "canonical", href: `https://kakiokosi.com${pathname}` }
```

### 2. Add Article Schema (JSON-LD) to Article Pages
**Impact:** Enables rich results, article carousels, enhanced SERP display
**Effort:** 2-3 hours
**File:** `app/routes/share.$category.$id.tsx`

Add JSON-LD `Article` schema with: headline, datePublished, dateModified, author, publisher, image, description.

### 3. Fix Image Alt Text
**Impact:** Accessibility compliance, image search visibility
**Effort:** 30 minutes
**Files:** `app/routes/share.$category.$id.tsx`, `app/components/post-card.tsx`

Replace all `alt=""` with descriptive text. At minimum, use the post title.

```tsx
// Instead of:
<img src={post.thumbnail_url} alt="" />
// Use:
<img src={post.thumbnail_url} alt={post.title} />
```

### 4. Add Image Dimensions (width/height)
**Impact:** Prevents CLS, improves Core Web Vitals
**Effort:** 1-2 hours
**Files:** `app/routes/share.$category.$id.tsx`, `app/components/post-card.tsx`

Add explicit `width` and `height` attributes or use CSS `aspect-ratio` with container sizing.

---

## HIGH (Fix Within 1 Week) — Significantly impacts rankings

### 5. Add BreadcrumbList Schema
**Impact:** Breadcrumb rich results in SERPs, better navigation signals
**Effort:** 1-2 hours
**File:** `app/routes/share.$category.$id.tsx`

Add `BreadcrumbList` JSON-LD: Home → Category → Article

### 6. Add WebSite + Organization Schema
**Impact:** Knowledge panel, sitelinks search box
**Effort:** 1 hour
**File:** `app/root.tsx`

Add global `WebSite` and `Organization` JSON-LD in the root layout.

### 7. Add Open Graph Tags to All Pages
**Impact:** Social sharing appearance, referral traffic
**Effort:** 1-2 hours
**Files:** All route `meta()` functions

Currently only article pages have OG tags. Add `og:title`, `og:description`, `og:image`, `og:url` to category, tag, archive, and static pages.

### 8. Add Twitter Card Tags
**Impact:** Twitter/X sharing appearance
**Effort:** 30 minutes
**Files:** All route `meta()` functions

Add `twitter:card: "summary_large_image"`, `twitter:title`, `twitter:description` globally.

### 9. Fix Homepage Redirect to 301
**Impact:** Preserves link equity from root URL
**Effort:** 5 minutes
**File:** `app/routes/home.tsx`

```tsx
// Change from:
return redirect("/share");
// To:
return redirect("/share", 301);
```

### 10. Add Meta Descriptions to Static Pages
**Impact:** Better SERP snippets for about/privacy/tos pages
**Effort:** 30 minutes
**File:** `app/routes/share.static.tsx`

Add page-specific descriptions in the `meta()` function.

### 11. Add Breadcrumb Navigation (Visual)
**Impact:** User experience, crawlability, complements BreadcrumbList schema
**Effort:** 2-3 hours
**File:** Create `app/components/breadcrumb.tsx`, add to article/category pages

---

## MEDIUM (Fix Within 1 Month) — Optimization opportunities

### 12. Use Japanese Category Labels in H1 Tags
**Impact:** Japanese keyword signals, language consistency
**Effort:** 30 minutes
**Files:** `app/routes/share.category.$slug.tsx`, category label mappings

Change H1 from "Business" to "ビジネス" (use Japanese names in headings, keep English as secondary labels).

### 13. Add Category Descriptions
**Impact:** Eliminates thin content on category pages, adds keyword-rich context
**Effort:** 1-2 hours
**Files:** Database + `app/routes/share.category.$slug.tsx`

Add introductory paragraph explaining what each category covers.

### 14. Reduce Google Font Payload
**Impact:** Faster load times, better LCP
**Effort:** 1-2 hours
**File:** `app/root.tsx`

- Consider self-hosting fonts or using `font-display: optional`
- Material Symbols Outlined is ~200KB+ — replace with SVG icons or subset
- Evaluate if all 4 font families are necessary

### 15. Add Responsive Images (srcset)
**Impact:** Faster mobile load, bandwidth savings
**Effort:** 3-4 hours
**Files:** `app/components/post-card.tsx`, `app/routes/share.$category.$id.tsx`

Use `srcset` and `sizes` attributes, or implement image resizing via Cloudflare Image Resizing.

### 16. Add Related Articles Component
**Impact:** Deeper engagement, better internal linking, reduced bounce rate
**Effort:** 3-4 hours
**Files:** New component + `app/routes/share.$category.$id.tsx`

Show 3-4 related articles by same category or shared tags at the end of each article.

### 17. Improve About Page (E-E-A-T)
**Impact:** Trust signals, authority indicators
**Effort:** 2-3 hours (content writing)

Expand to include: site mission, team/founder info, methodology, history, contact details.

### 18. Update Copyright Year
**Impact:** Minor trust signal
**Effort:** 5 minutes
**File:** `app/root.tsx`

Change `© 2024` to `© 2024-2026` or use dynamic year.

### 19. Add RSS/Atom Feed
**Impact:** Content syndication, subscriber engagement
**Effort:** 1-2 hours
**File:** Create `app/routes/feed[.]xml.tsx`

### 20. Fix Sitemap changefreq Values
**Impact:** Accurate crawl signals
**Effort:** 15 minutes
**File:** `app/routes/sitemap[.]xml.tsx`

Change root `changefreq` from `daily` to `weekly` or `monthly` to match actual update frequency.

---

## LOW (Backlog) — Nice to have

### 21. Add Tag Pages to Sitemap
**Effort:** 30 minutes — Query tags table and add to sitemap generation

### 22. Add `llms.txt` File
**Effort:** 15 minutes — Machine-readable AI usage policy

### 23. Add Mobile Hamburger Menu
**Effort:** 2-3 hours — Categories hidden on mobile, add responsive menu

### 24. Add Favicon and Apple Touch Icon
**Effort:** 30 minutes — Brand identity in browser tabs and bookmarks

### 25. Update Privacy Policy
**Effort:** 2-3 hours (legal review) — Current policy is from 2011

### 26. Add `rel="prev"` / `rel="next"` to Paginated Pages
**Effort:** 30 minutes — Helps Google understand pagination series

### 27. Convert Image URLs to Modern Formats
**Effort:** 4+ hours — Implement Cloudflare Image Resizing for WebP/AVIF delivery

---

## Implementation Roadmap

### Week 1: Critical + High Priority (Items 1-11)
- Estimated effort: ~12-15 hours
- Expected score improvement: +20-25 points → **62-67/100**

### Week 2-3: Medium Priority (Items 12-20)
- Estimated effort: ~15-20 hours
- Expected score improvement: +10-15 points → **72-82/100**

### Month 2: Low Priority (Items 21-27)
- Estimated effort: ~10-12 hours
- Expected score improvement: +3-5 points → **75-87/100**

---

*Action plan generated 2026-03-28 by SEO Audit Tool*
