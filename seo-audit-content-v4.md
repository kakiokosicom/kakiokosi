# Content Quality Audit v4 -- kakiokosi.com

**Date:** 2026-03-28
**Auditor:** Content Quality Specialist (Google Sept 2025 QRG)
**Site:** https://kakiokosi.com

---

## Overall Score: 82 / 100

---

## 1. Homepage Content Quality (`/share`)

### H1
- **Present:** Yes -- `書き起こし記事一覧`
- **Quality:** Clear, descriptive, matches page intent. Includes Japanese keyword for transcription articles.
- **Issue:** H1 is functional but lacks differentiation. Consider adding the founding year or article count (e.g., "2011年からの書き起こし記事アーカイブ") to strengthen E-E-A-T signals.

### Intro Paragraph
- **Present:** Yes -- 3-line description covering genres (business, politics, society, IT, entertainment).
- **Quality:** Adequate. Covers what the site does and its scope.
- **Issue:** Intro is short (~80 characters). For a homepage, this falls below the 500-word minimum for comprehensive topical coverage. The homepage relies heavily on dynamically loaded PostCard components, but lacks any static editorial content (editor's picks rationale, site mission statement, recent highlights commentary).

### CollectionPage Schema
- **Present:** Yes -- `collectionPageSchema()` from `~/lib/schema.ts`
- **Includes:** `@type: CollectionPage`, `name`, `description`, `url`, `isPartOf` (WebSite), `inLanguage: ja`, `mainEntity` with `ItemList` and `numberOfItems`.
- **Status:** PASS -- properly structured.

### Homepage Verdict: 7/10
- Schema is solid.
- H1 and intro are present but thin.
- No static body content to meet 500-word minimum for topical depth.

---

## 2. Article Page (`/share/society/936`)

### Author Attribution
- **Present:** Yes -- inline byline: "文字起こし: 書き起こし.com編集部" with link to `/share/about`.
- **JSON-LD author:** `{ "@type": "Organization", "name": "書き起こし.com編集部", "url": "https://kakiokosi.com/share/about" }`
- **Issue:** Author is organizational, not individual. For YMYL-adjacent transcription content this is acceptable, but adding individual editor names (even as "reviewed by") would strengthen E-E-A-T.

### Related Articles
- **Present:** Yes -- `getRelatedPosts(db, id, post.primary_category, 4)` loads up to 4 related articles displayed in a 2-column grid.
- **Quality:** Good internal linking with thumbnails, dates, and titles.
- **Status:** PASS

### H2 Headings
- **Present:** Conditionally via `formatArticleContent()`.
- **Logic:** If article is >5000 chars and has no existing `<h2>` tags, headings are auto-injected every ~3000 characters using the first sentence of the next paragraph.
- **Quality:** This is a reasonable fallback for WordPress-migrated content lacking structure. However, auto-generated headings from first sentences may not always be semantically ideal.
- **Issue:** The heading extraction (`extractHeadingText`) falls back to truncating at 30 characters with "..." which produces weak headings. Consider using NLP or manual curation for high-traffic articles.

### Speakable Schema
- **Present:** Yes -- `SpeakableSpecification` with `cssSelector: [".article-content", "h1"]`.
- **Status:** PASS -- correctly targets the article body and title.

### BreadcrumbList
- **Present:** Yes -- 3-level breadcrumb (Home > Category > Article title).
- **Status:** PASS

### Article Verdict: 9/10
- Comprehensive structured data (Article, BreadcrumbList, Speakable).
- Author attribution present.
- Related articles present.
- Auto-injected H2s are a pragmatic solution; could be improved with manual curation.

---

## 3. About Page JSON-LD

### AboutPage Schema
- **Present:** Yes -- `PAGE_SCHEMA_TYPES["about"] = "AboutPage"` in `share.static.tsx`.
- **Output:** `{ "@type": "AboutPage", name, description, url, inLanguage: "ja", isPartOf: { "@type": "WebSite" } }`
- **Status:** PASS

### BreadcrumbList
- **Present:** Yes -- via `breadcrumbSchema()` with 2 levels (Home > About page title).
- **Status:** PASS

### Issue
- The AboutPage schema does not include `mainEntity` pointing to the Organization or `author`. Consider adding `mainEntity: { "@id": "https://kakiokosi.com/#organization" }` to connect the about page to the Organization entity defined in root.tsx.

### About Page Verdict: 8/10

---

## 4. Category Descriptions

### Present
Yes -- `CATEGORY_DESCRIPTIONS` object with unique descriptions for all 6 categories:
- business: Covers CEO lectures, startup pitches, TED Talks (~50 chars JP)
- politics: Press conferences, parliamentary answers, policy announcements
- society: Social issues lectures, TED Talks, press conferences
- world: Foreign VIP speeches, international conferences, overseas media interviews
- it: Tech company presentations, IT conferences, engineer lectures
- entertainment: Celebrity press conferences, artist interviews

### Quality
Each description is specific and differentiating, mentioning concrete content types. They are rendered in the `<header>` and also used in CollectionPage schema descriptions.

### Issue
Descriptions are single sentences (~60-80 JP characters each). For category landing pages targeting topical authority, consider expanding to 2-3 sentences that include the number of articles and date range (e.g., "2011年から現在まで XX 件のビジネス関連書き起こしを掲載").

### Category Verdict: 8/10

---

## 5. Footer Trust Links

### Links Present
1. サイトについて (`/share/about`) -- About page
2. 利用規約 (`/share/tos`) -- Terms of Service
3. プライバシーポリシー (`/share/privacy`) -- Privacy Policy
4. お問い合わせ (`/share/contact`) -- Contact page
5. 運営情報 (`/share/company`) -- Company info
6. 特定商取引法 (`/share/regal`) -- Specified Commercial Transactions Act

### Quality
All six essential trust links are present. The inclusion of 特定商取引法 (tokutei sho-torihiki) is particularly important for Japanese E-E-A-T compliance and is often missing on smaller sites.

### Issue
- The link path `/share/regal` appears to be a typo. The English word should be "legal" not "regal". While this does not affect users (the Japanese label is correct), it is a minor professionalism issue in the URL structure.
- Copyright notice includes founding year: "2011-{currentYear}". Good.

### Footer Verdict: 9/10

---

## 6. AI Citation Readiness

### robots.txt AI Crawler Access
- **GPTBot:** Allow /share/, /sitemap.xml -- PASS
- **ClaudeBot:** Allow /share/, /sitemap.xml -- PASS
- **Google-Extended:** Allow /share/, /sitemap.xml -- PASS
- **PerplexityBot:** Allow /share/, /sitemap.xml -- PASS
- **Bytespider (TikTok/Doubao):** Allow /share/, /sitemap.xml -- PASS
- **CCBot (Common Crawl):** Allow /share/, /sitemap.xml -- PASS
- **All bots:** Disallow /auth/, /dashboard/, /admin/ -- Correct

### Structured Data for Citation
- Article schema with headline, description, datePublished, dateModified -- PASS
- Organization entity with address, contactPoint, foundingDate -- PASS
- Speakable specification for voice assistants -- PASS
- BreadcrumbList on all page types -- PASS
- CollectionPage with ItemList count -- PASS

### Missing for Optimal Citation
1. **No `sameAs` on Organization** -- Add social media profiles and Wikipedia link if available to strengthen entity recognition.
2. **No `FAQPage` schema** -- For articles that contain Q&A-style transcriptions, adding FAQ schema would improve AI citation extraction.
3. **No `ClaimReview` or `Quotation` markup** -- For a transcription site, marking up direct quotes with `<blockquote cite="">` and potentially `Quotation` schema would significantly improve AI citation accuracy.
4. **No RSS autodiscovery in robots.txt** -- While RSS is linked in `<head>`, AI crawlers that start from robots.txt would benefit from an explicit reference.

### AI Citation Verdict: 8/10

---

## 7. E-E-A-T Score

| Factor | Weight | Score | Weighted | Notes |
|---|---|---|---|---|
| Experience | 20% | 7/10 | 1.4 | Site operating since 2011 (foundingDate in schema). Original transcription work. No individual author bylines or "how we transcribe" methodology page visible in main routes. |
| Expertise | 25% | 7/10 | 1.75 | Organizational expertise claimed. Category-specific descriptions show domain knowledge. No editor bios or credentials. |
| Authoritativeness | 25% | 7/10 | 1.75 | 143 migrated posts across 6 categories. No `sameAs` links to establish external authority. No press mentions or awards. |
| Trustworthiness | 30% | 9/10 | 2.7 | All 6 trust pages present. Physical address in schema (Shibuya, Tokyo). Contact email. HSTS with preload. X-Frame-Options DENY. CSP upgrade-insecure-requests. Strict referrer policy. |

**E-E-A-T Total: 7.6 / 10 (76%)**

---

## Summary of Findings

### Strengths (What Is Working Well)
1. Comprehensive structured data across all page types (Article, CollectionPage, AboutPage, BreadcrumbList, Speakable, Organization, WebSite)
2. All six essential trust/legal footer links present
3. Robust AI crawler access configuration in robots.txt covering 6 major AI bots
4. Strong security headers (HSTS preload, X-Frame-Options, CSP, Referrer-Policy)
5. Auto-generated H2 headings for long migrated content lacking structure
6. Related articles with up to 4 recommendations per article
7. Physical business address and contact info in Organization schema
8. Content freshness signals via datePublished and dateModified in article schema

### Issues Requiring Attention

| Priority | Issue | Impact | Effort |
|---|---|---|---|
| HIGH | Homepage lacks static body content (currently ~80 chars intro only; 500-word minimum recommended) | Thin content signal on main landing page | Medium |
| HIGH | No individual author bylines or editor bio pages | Weakens E-E-A-T expertise signals | Medium |
| MEDIUM | No `sameAs` property on Organization schema | Limits entity disambiguation for AI and Knowledge Graph | Low |
| MEDIUM | AboutPage schema missing `mainEntity` link to Organization `@id` | Missed entity connection | Low |
| MEDIUM | Auto-generated H2 headings can be semantically weak (30-char truncation with "...") | Suboptimal heading quality on migrated content | High |
| MEDIUM | Category descriptions are single-sentence; no article count or date range | Missed topical authority signals on listing pages | Low |
| LOW | Footer link path `/share/regal` should be `/share/legal` | Minor URL professionalism issue | Low (redirect needed) |
| LOW | No FAQ or Quotation schema for Q&A-style transcriptions | Missed rich result and citation opportunities | Medium |
| LOW | No `sameAs` or social profile links anywhere | Limits cross-platform authority signals | Low |

### Recommended Priority Actions

1. **Add 500+ words of static editorial content to the homepage** -- mission statement, methodology, featured categories overview, site history. This transforms the homepage from a thin listing page into a topical authority signal.

2. **Create an editor/author system** -- even a single "About the Editorial Team" page linked from article bylines, describing transcription methodology, editorial standards, and team qualifications.

3. **Add `sameAs` to Organization schema** in `root.tsx` -- link to any social profiles, Wikipedia, or external directories where kakiokosi.com is listed.

4. **Connect AboutPage schema to Organization** -- add `mainEntity: { "@id": "https://kakiokosi.com/#organization" }` in `share.static.tsx` for the about page.

5. **Enrich category page headers** -- add article count and date range dynamically to category descriptions.

---

## Score Breakdown

| Audit Area | Score | Weight | Weighted |
|---|---|---|---|
| 1. Homepage content quality | 7/10 | 15% | 1.05 |
| 2. Article page quality | 9/10 | 25% | 2.25 |
| 3. About page JSON-LD | 8/10 | 10% | 0.80 |
| 4. Category descriptions | 8/10 | 10% | 0.80 |
| 5. Footer trust links | 9/10 | 10% | 0.90 |
| 6. AI citation readiness | 8/10 | 15% | 1.20 |
| 7. E-E-A-T score | 7.6/10 | 15% | 1.14 |

**Final Weighted Score: 81.4 / 100 -- rounded to 82/100**

---

*Audit conducted against Google September 2025 Quality Rater Guidelines and March 2024 Helpful Content System (now integrated into core ranking).*
