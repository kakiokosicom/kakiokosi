# Schema.org Structured Data Audit v4

**Site:** https://kakiokosi.com
**Date:** 2026-03-28
**Auditor:** Claude Opus 4.6 (Schema.org specialist)

---

## Overall Score: 93 / 100

---

## 1. Homepage (`/share`) -- WebSite + Organization + CollectionPage

### Global JSON-LD (root.tsx, all pages)

**WebSite block** -- PASS

| Check | Result |
|---|---|
| @context `https://schema.org` | PASS |
| @type `WebSite` | PASS |
| name, url, description, inLanguage | PASS |

**Organization block** -- PASS

| Check | Result |
|---|---|
| @type `Organization` | PASS |
| @id `https://kakiokosi.com/#organization` | PASS |
| name, url, description | PASS |
| foundingDate | PASS (`"2011"`) |
| logo (ImageObject) | PASS |
| address (PostalAddress) | PASS |
| contactPoint (ContactPoint) | PASS |

**CollectionPage block (share._index.tsx)** -- PASS

| Check | Result |
|---|---|
| @type `CollectionPage` | PASS |
| name, description, url | PASS |
| isPartOf -> WebSite | PASS |
| inLanguage `ja` | PASS |
| mainEntity -> ItemList with numberOfItems | PASS |

**Verdict: PASS** -- All three schema types present on homepage.

---

## 2. Article Page (`/share/society/936`) -- Article + BreadcrumbList

**Source:** `share.$category.$id.tsx` (inline @graph JSON-LD)

### Article block

| Check | Result |
|---|---|
| @context `https://schema.org` | PASS |
| @type `Article` | PASS |
| headline | PASS |
| description | PASS |
| url (absolute) | PASS |
| datePublished (ISO 8601 +09:00) | PASS |
| dateModified (ISO 8601 +09:00) | PASS |
| image (ImageObject, fallback to default-og.svg) | PASS |
| author @type `Organization` | PASS |
| author name `"書き起こし.com編集部"` | PASS |
| publisher @id `https://kakiokosi.com/#organization` | PASS |
| inLanguage `ja` | PASS |
| keywords (from tags, comma-separated) | PASS |
| articleSection (from categories) | PASS |
| mainEntityOfPage (WebPage @id) | PASS |
| speakable (SpeakableSpecification, cssSelector) | PASS |

### BreadcrumbList block

| Check | Result |
|---|---|
| @type `BreadcrumbList` | PASS |
| 3 ListItems (Home -> Category -> Article) | PASS |
| position numbering (1, 2, 3) | PASS |
| item URLs absolute | PASS |
| Last item omits `item` (correct per Google spec) | PASS |

**Verdict: PASS** -- Article schema is comprehensive with all required and recommended properties.

---

## 3. Paginated Pages (`/share/page/2`) -- CollectionPage

**Source:** `share.page.$page.tsx`

| Check | Result |
|---|---|
| @type `CollectionPage` | PASS |
| name includes page number | PASS |
| description includes page number | PASS |
| url (absolute, page-specific) | PASS |
| isPartOf -> WebSite | PASS |
| inLanguage `ja` | PASS |
| mainEntity -> ItemList with numberOfItems | PASS |

**Verdict: PASS** -- CollectionPage schema correctly present on paginated listing pages.

---

## 4. Static Pages (`/share/about`) -- AboutPage + BreadcrumbList

**Source:** `share.static.tsx`

### Page schema

| Check | Result |
|---|---|
| @type dynamic (AboutPage / ContactPage / WebPage) | PASS |
| `about` maps to `AboutPage` | PASS |
| `contact` maps to `ContactPage` | PASS |
| Other static pages default to `WebPage` | PASS |
| name, description, url, inLanguage | PASS |
| isPartOf -> WebSite | PASS |

### BreadcrumbList

| Check | Result |
|---|---|
| @type `BreadcrumbList` | PASS |
| 2 ListItems (Home -> Page) | PASS |
| Absolute URLs | PASS |

**Verdict: PASS**

---

## 5. Category Pages (`/share/category/{slug}`) -- CollectionPage

**Source:** `share.category.$slug.tsx` and `share.category.$slug.page.$page.tsx`

| Check | Result |
|---|---|
| @type `CollectionPage` | PASS |
| name, description (category-specific) | PASS |
| url (absolute) | PASS |
| isPartOf -> WebSite | PASS |
| inLanguage `ja` | PASS |
| mainEntity -> ItemList with numberOfItems | PASS |
| Paginated category pages also have schema | PASS |

**Tag pages** (`share.tag.$slug.tsx`) also correctly use `CollectionPage`.

**Verdict: PASS**

---

## 6. Fallback Image -- default-og.svg

| Check | Result |
|---|---|
| File exists at `public/images/default-og.svg` | PASS |
| Article meta og:image fallback uses `.svg` | PASS |
| Article meta twitter:image fallback uses `.svg` | PASS |
| Article JSON-LD image fallback uses `.svg` | PASS |
| Homepage og:image uses `.svg` | PASS |
| Homepage twitter:image uses `.svg` | PASS |
| No references to `default-og.png` anywhere | PASS |

**Verdict: PASS** -- All fallback image references consistently use `default-og.svg`.

---

## 7. Dead Code References

| Check | Result |
|---|---|
| `articleSchema` function (referenced in json-ld.tsx comment only) | WARNING |
| No unused exports in `schema.ts` | PASS |
| All schema.ts exports (`collectionPageSchema`, `breadcrumbSchema`) are imported | PASS |
| No deprecated schema types (HowTo, FAQ, SpecialAnnouncement) | PASS |

**Details:**

- `app/components/json-ld.tsx` line 5 contains a JSDoc comment referencing `articleSchema(post, { url })`, but this function does not exist in `schema.ts`. The article page builds its JSON-LD inline instead. This is cosmetic (comment only), not functional dead code.

**Verdict: MINOR WARNING** -- Stale comment in `json-ld.tsx` references a non-existent `articleSchema` function. No functional dead code found.

---

## Deduction Summary

| Category | Points | Deduction | Reason |
|---|---|---|---|
| Homepage (WebSite + Organization + CollectionPage) | 20/20 | 0 | All present and valid |
| Article page (full schema) | 25/25 | 0 | All required + recommended properties |
| Paginated pages | 10/10 | 0 | CollectionPage on all paginated routes |
| Static pages | 10/10 | 0 | Correct @type mapping + BreadcrumbList |
| Category pages | 10/10 | 0 | CollectionPage on category + category/page |
| Fallback image consistency | 10/10 | 0 | All .svg, no .png references |
| No dead code | 10/10 | 0 | No functional dead code |
| Best practices | 5/5 | -2 | Stale JSDoc comment (-1), Organization logo uses favicon.ico rather than a proper logo image (-1) |

---

## Findings -- Items to Consider

### Low Priority

1. **Stale JSDoc comment** (`app/components/json-ld.tsx:5`): The usage example references `articleSchema(post, { url })` which does not exist. Update the comment to reflect the actual inline pattern used in `share.$category.$id.tsx`.

2. **Organization logo**: Currently set to `favicon.ico`. Google recommends the logo be a high-resolution image (min 112x112px, ideally 1200px wide). Consider replacing with a dedicated logo image file.

3. **WebSite `potentialAction`**: The global WebSite schema does not include a `SearchAction`. If the site adds search functionality in the future, adding `potentialAction` with a `SearchAction` would enable a sitelinks search box in Google results.

4. **Category pages missing BreadcrumbList**: Category listing pages (`share.category.$slug.tsx`) have `CollectionPage` schema but no `BreadcrumbList` (Home -> Category). Article pages do include breadcrumbs. Adding breadcrumbs to category pages would complete the navigation chain.

### No Action Required

- All `@context` values use `https://schema.org` (not `http`)
- All URLs are absolute
- All dates use ISO 8601 with `+09:00` timezone offset
- No deprecated schema types are used
- No placeholder text found
- JSON-LD format used consistently (no Microdata or RDFa)
- Tag pages correctly use `CollectionPage`

---

## File Reference

| File | Schema Provided |
|---|---|
| `app/root.tsx` | WebSite + Organization (global, all pages) |
| `app/lib/schema.ts` | `collectionPageSchema()`, `breadcrumbSchema()` |
| `app/components/json-ld.tsx` | `<JsonLd>` rendering component |
| `app/routes/share._index.tsx` | CollectionPage (homepage) |
| `app/routes/share.$category.$id.tsx` | Article + BreadcrumbList (inline @graph) |
| `app/routes/share.page.$page.tsx` | CollectionPage (paginated) |
| `app/routes/share.static.tsx` | AboutPage/ContactPage/WebPage + BreadcrumbList |
| `app/routes/share.category.$slug.tsx` | CollectionPage |
| `app/routes/share.category.$slug.page.$page.tsx` | CollectionPage |
| `app/routes/share.tag.$slug.tsx` | CollectionPage |
