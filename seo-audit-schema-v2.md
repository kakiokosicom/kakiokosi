# Schema.org Structured Data Audit v2 -- kakiokosi.com

**Date:** 2026-03-28
**Auditor:** Claude (Schema.org specialist)
**Scope:** JSON-LD validation on homepage and article pages after Phase 2 improvements

---

## 1. Executive Summary

The structured data implementation has improved significantly. Organization identity is well-defined with `@id`, article schema includes author/publisher/speakable/keywords, BreadcrumbList is present on article pages, and SearchAction was correctly removed. Several minor issues remain, detailed below.

**Overall grade: B+ (up from C in v1)**

| Area | Status |
|------|--------|
| Global WebSite + Organization | PASS (minor issues) |
| Homepage CollectionPage | PASS |
| Article schema | PASS (minor issues) |
| BreadcrumbList | PASS |
| SearchAction removed | PASS |
| No deprecated types used | PASS |

---

## 2. Homepage: https://kakiokosi.com/share

### Block 1 -- Global @graph (WebSite + Organization)

Rendered from `GLOBAL_JSON_LD` in `app/root.tsx` (lines 53-91).

```
@context: "https://schema.org"  -- PASS
@graph with WebSite + Organization -- PASS
```

#### WebSite node

| Property | Value | Status |
|----------|-------|--------|
| @type | WebSite | PASS |
| name | "書き起こし.com" | PASS |
| url | "https://kakiokosi.com" | PASS |
| description | Present | PASS |
| inLanguage | "ja" | PASS |
| publisher | (absent) | NOTE -- see finding W1 |

**Finding W1 (Low):** The WebSite node lacks a `publisher` reference. Google does not require this, but linking to the Organization via `{"@id": "https://kakiokosi.com/#organization"}` would improve entity resolution within the graph.

#### Organization node

| Property | Value | Status |
|----------|-------|--------|
| @type | Organization | PASS |
| @id | "https://kakiokosi.com/#organization" | PASS |
| name | "書き起こし.com" | PASS |
| url | "https://kakiokosi.com" | PASS |
| foundingDate | "2011" | PASS |
| logo | ImageObject, url: favicon.ico | WARN -- see finding O1 |
| address | PostalAddress with street/locality/region/country | PASS |
| contactPoint | ContactPoint with email + language | PASS |

**Finding O1 (Medium):** `logo.url` points to `https://kakiokosi.com/favicon.ico` (HTTP 200). While this works, Google's logo guidelines recommend a non-icon image that is at least 112x112px in PNG/JPG/WebP format. A favicon.ico may be too small or not meet Google's preferred format. Consider creating a dedicated `logo.png` (at least 112x112px, ideally 1200px wide for AMP/Discover).

**Finding O2 (Low):** `foundingDate` is "2011". ISO 8601 recommends full date format such as "2011-01-01" when the exact date is known. The year-only format is technically valid.

### Block 2 -- CollectionPage

Rendered from `collectionPageSchema()` in `app/lib/schema.ts`, invoked by `app/routes/share._index.tsx`.

| Property | Value | Status |
|----------|-------|--------|
| @type | CollectionPage | PASS |
| name | "書き起こし記事一覧" | PASS |
| description | Present | PASS |
| url | "https://kakiokosi.com/share" | PASS |
| isPartOf | WebSite reference | PASS |
| inLanguage | "ja" | PASS |
| mainEntity | ItemList, numberOfItems: 143 | PASS |

No issues found. This is well-implemented.

---

## 3. Article Page: https://kakiokosi.com/share/society/936

### Block 1 -- Global @graph

Same as homepage. PASS (same findings O1, O2, W1 apply).

### Block 2 -- Article @graph (Article + BreadcrumbList)

Rendered inline in `app/routes/share.$category.$id.tsx` (lines 93-136).

#### Article node

| Property | Value | Status |
|----------|-------|--------|
| @type | Article | PASS |
| headline | Present, under 110 chars | PASS |
| description | Present (from excerpt) | PASS |
| url | Absolute URL | PASS |
| datePublished | "2017-07-19T07:38:05+09:00" | PASS -- ISO 8601 with timezone |
| dateModified | "2026-03-28T00:00:00+09:00" | PASS -- see finding A1 |
| image | ImageObject with absolute URL | PASS |
| author | Person with name + url | PASS |
| publisher | @id reference to Organization | PASS |
| inLanguage | "ja" | PASS |
| keywords | Comma-separated tag names | PASS |
| articleSection | "社会" | PASS |
| mainEntityOfPage | WebPage with @id | PASS |
| speakable | SpeakableSpecification with cssSelector | PASS |

**Finding A1 (Medium):** `dateModified` is "2026-03-28T00:00:00+09:00". The `T00:00:00` timestamp suggests the `updated_at` field stores a date without time, which gets zero-padded. This is technically valid ISO 8601, but if the actual modification time is available, it should be used for accuracy. Also note that having `dateModified` newer than `datePublished` by ~9 years may affect Google's freshness signals. If the content has not meaningfully changed, consider preserving the original `updated_at` from the WordPress migration rather than resetting it.

**Finding A2 (Low):** The `speakable` property with `cssSelector` is a Google News-specific feature. It is only applicable to sites accepted into Google News. If kakiokosi.com is not a Google News publisher, this property will be ignored (no harm, but no benefit either).

**Finding A3 (Info):** The Article fallback image in the source code (line 105) references `https://kakiokosi.com/images/default-og.png` which returns HTTP 404. However, this particular article has a thumbnail so the fallback is not triggered here. For articles without thumbnails, Google will fail to validate the image. The OG meta tags reference `default-og.svg` (which returns 200), but SVG is not supported as a schema.org ImageObject for Google rich results.

#### BreadcrumbList node

| Property | Value | Status |
|----------|-------|--------|
| @type | BreadcrumbList | PASS |
| itemListElement[0] | position:1, name:"ホーム", item: absolute URL | PASS |
| itemListElement[1] | position:2, name:"社会", item: absolute URL | PASS |
| itemListElement[2] | position:3, name: article title, item: (absent) | PASS |

The last breadcrumb item correctly omits the `item` property (current page per Google's guidelines). Well-implemented.

---

## 4. Source Code Consistency: `app/lib/schema.ts` vs Inline Schema

The file `app/lib/schema.ts` is still used by category/tag listing pages (`share._index.tsx`, `share.category.$slug.tsx`, `share.tag.$slug.tsx`) for `collectionPageSchema()`. However, the article page (`share.$category.$id.tsx`) builds its schema inline rather than using `articleSchema()` from `schema.ts`.

**Finding S1 (Low):** The `articleSchema()` function in `schema.ts` (lines 112-177) is now dead code. It lacks `speakable`, uses `new Date().toISOString()` instead of timezone-aware dates, and embeds a full publisher object instead of the `@id` reference. The inline version in the route file is the correct, more complete implementation. Consider either removing `articleSchema()` or updating it to match the inline version to avoid future confusion.

**Finding S2 (Low):** `schema.ts` still defines `LOGO_URL` as `https://kakiokosi.com/logo.png` (HTTP 404), while `root.tsx` correctly uses `favicon.ico`. The `webSiteSchema()` and `organizationSchema()` functions in `schema.ts` are also unused dead code that references this broken URL.

---

## 5. Verification of Requested Changes

| Change | Verified | Notes |
|--------|----------|-------|
| Organization with @id | YES | `@id: "https://kakiokosi.com/#organization"` present |
| Organization logo (favicon.ico) | YES | Resolves to HTTP 200 |
| Organization address | YES | Full PostalAddress with street/locality/region/country |
| Organization contactPoint | YES | Email + availableLanguage present |
| Organization foundingDate | YES | "2011" |
| Article author (Person) | YES | Person with name + url |
| Article publisher (@id ref) | YES | `{"@id": "https://kakiokosi.com/#organization"}` |
| Article speakable | YES | SpeakableSpecification with cssSelector |
| Article keywords | YES | Comma-separated from tags |
| Article articleSection | YES | From categories |
| ISO dates with +09:00 | YES | Both datePublished and dateModified |
| Homepage CollectionPage | YES | With ItemList + numberOfItems |
| BreadcrumbList on articles | YES | 3-level breadcrumb, correct structure |
| SearchAction removed | YES | Not present in any output |

---

## 6. Action Items (Priority Order)

### Must Fix

1. **A3 -- Article fallback image returns 404.** Create `/images/default-og.png` (PNG, at least 1200x630px) so that articles without thumbnails pass Google's image requirement. SVG is not supported for rich results.

### Should Fix

2. **O1 -- Replace favicon.ico as logo.** Create a proper logo asset (PNG, minimum 112x112px, recommend 1200px wide) and update the URL in `root.tsx` line 74. Favicon.ico may be too small or wrong format for Google's Organization logo requirements.

3. **A1 -- Review dateModified values.** Audit posts whose `updated_at` was reset during migration. Artificially recent modification dates can confuse Google's freshness signals.

### Nice to Have

4. **S1/S2 -- Clean up dead code in `schema.ts`.** Remove `articleSchema()`, `organizationSchema()`, `webSiteSchema()`, and `webPageSchema()` if they are not used. Fix `LOGO_URL` if any functions are retained.

5. **W1 -- Add publisher reference to WebSite node.** Add `"publisher": {"@id": "https://kakiokosi.com/#organization"}` to the WebSite entry in the @graph.

6. **O2 -- Use full ISO date for foundingDate.** Change "2011" to "2011-01-01" or the actual founding date.

---

## 7. Google Rich Results Eligibility

| Rich Result Type | Eligible | Notes |
|------------------|----------|-------|
| Article | YES | All required properties present |
| Breadcrumb | YES | Correct structure |
| Sitelinks Search Box | N/A | Correctly removed (no search feature) |
| Logo (Organization) | PARTIAL | Needs proper image format/size |
| Speakable | CONDITIONAL | Only if accepted into Google News |

---

## 8. Files Reviewed

- `/Users/hajimeataka/kakiokosi/app/root.tsx` -- Global JSON-LD (lines 53-91, 102-104)
- `/Users/hajimeataka/kakiokosi/app/routes/share.$category.$id.tsx` -- Article + Breadcrumb inline schema (lines 93-136)
- `/Users/hajimeataka/kakiokosi/app/lib/schema.ts` -- Schema utility functions (partially dead code)
