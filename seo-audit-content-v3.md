# Content Quality & E-E-A-T Audit v3 -- kakiokosi.com

**Audit date:** 2026-03-28
**Auditor:** Claude Content Quality Specialist (Sept 2025 QRG framework)
**Codebase revision:** `7a5df38` (main branch)

---

## Overall Content Quality Score: 74 / 100

| Area | Score | Status |
|------|-------|--------|
| Homepage content | 78 | Satisfactory |
| Article page (E-E-A-T) | 72 | Needs improvement |
| About page | 70 | Needs improvement |
| Footer trust links | 90 | Good |
| Category pages | 76 | Satisfactory |
| RSS feed discoverability | 88 | Good |
| AI citation readiness | 80 | Good |

---

## 1. Homepage (`/share`) -- Score: 78/100

### What is implemented

- **H1 present:** `<h1>` renders "書き起こし記事一覧" -- clear, keyword-rich heading.
- **Intro paragraph present:** Three-line description covering site purpose, genres, and value proposition ("文字で読むことができます").
- **CollectionPage schema:** Correctly outputs `CollectionPage` via `collectionPageSchema()` with `numberOfItems` and `ItemList` mainEntity.
- **Meta tags:** Title, description, canonical, OG, Twitter Card all present and correctly formed.
- **Global JSON-LD:** `@graph` in root layout includes `WebSite` + `Organization` with physical address (渋谷区道玄坂), contact email, and foundingDate.

### Issues found

| # | Severity | Issue | Recommendation |
|---|----------|-------|----------------|
| H-1 | Medium | Intro text is only ~80 characters (Japanese). Homepage content minimum is 500 words for comprehensive topical coverage. The page body depends entirely on dynamic PostCard listings with no static editorial content. | Add a 200-300 character editorial introduction below the H1 explaining what 書き起こし.com is, its history (since 2011), and the value of transcript archives. This also improves AI citation readiness. |
| H-2 | Low | CollectionPage schema lacks `itemListElement` array -- only `numberOfItems` is present. Search engines benefit from seeing the first few items enumerated. | Add `itemListElement` with the first 5-10 post URLs to the schema. |
| H-3 | Low | No `WebPage`/`CollectionPage` `@id` anchor. The article page references `publisher: { "@id": "https://kakiokosi.com/#organization" }` but the homepage schema does not use matching `@id` patterns. | Add `"@id": "https://kakiokosi.com/share#collection"` to the CollectionPage schema for graph linkability. |

---

## 2. Article Page (`/share/society/936`) -- Score: 72/100

### What is implemented

- **Author byline:** Displays "文字起こし: 書き起こし.com編集部" with link to `/share/about`. Schema.org `author` is `Person` type with name and URL.
- **Related articles:** `getRelatedPosts()` fetches up to 4 related posts from same category. Renders with thumbnails and titles under an H2 heading "関連する書き起こし記事".
- **H2 headings auto-injection:** `formatArticleContent()` injects H2 headings every ~3000 characters for long articles (>5000 chars) that lack them. Extracts heading text from first sentence of the section.
- **Speakable schema:** Present as `SpeakableSpecification` with `cssSelector: [".article-content", "h1"]`.
- **Breadcrumb:** Both visual breadcrumb and `BreadcrumbList` JSON-LD with 3 levels (Home > Category > Article).
- **Date signals:** Both `published_at` and `updated_at` displayed visually and in `article:published_time` / `article:modified_time` meta tags plus `datePublished` / `dateModified` in schema.
- **Tags:** Rendered as linked chips in the footer area.

### Issues found

| # | Severity | Issue | Recommendation |
|---|----------|-------|
| A-1 | High | **Author type is `Person` but represents an editorial team.** "書き起こし.com編集部" is not a person -- it should be `@type: "Organization"` or at minimum link to an author profile page with editorial team bios. Google's Sept 2025 QRG specifically checks for identifiable authorship for YMYL-adjacent content. | Change `author` to `@type: "Organization"` or create individual author profiles. Best: add a dedicated `/share/editors` page with team member names, roles, and credentials. |
| A-2 | High | **No editorial notes or context.** Transcript articles are reproductions of speeches. There is no editor's note explaining the source event, date, speaker credentials, or transcript methodology. This is a critical E-E-A-T gap -- readers and quality raters cannot assess provenance. | Add an editorial header box before the transcript body: "This is a transcript of [speaker]'s [event] on [date]. Transcribed by [method]." |
| A-3 | Medium | **Auto-generated H2 headings derive from first sentence of text blocks.** These are not semantically meaningful section headings -- they are arbitrary text fragments (e.g., first 30 chars + "..."). This hurts both readability and AI citation extraction. | Invest in editorial H2s during content creation. For legacy content, consider AI-assisted heading generation that produces topic-based labels rather than truncated sentences. |
| A-4 | Medium | **No `article-content` CSS class for readability.** The `.article-content` div lacks typography styles visible in the route file (styles may exist in `app.css`). Verify that font-size, line-height, and paragraph spacing meet readability standards for long transcripts. | Ensure `.article-content` has `font-size: 1rem+`, `line-height: 1.8+`, and adequate `margin-bottom` on `<p>` elements. |
| A-5 | Low | **Speakable cssSelector targets entire `.article-content`.** Google recommends targeting specific, concise sections -- not the entire article body. For transcripts that may be 5000+ characters, this is too broad. | Target the excerpt (`.article-content > p:first-of-type`) and the H1 only, or add a dedicated `.speakable-summary` element. |
| A-6 | Low | **No `wordCount` or `timeRequired` in Article schema.** These are useful signals for long-form content and improve AI citation extraction. | Add `wordCount` and `timeRequired` (ISO 8601 duration) to the Article JSON-LD. |

---

## 3. About Page (`/share/about`) -- Score: 70/100

### What is implemented

- **Static page rendering** via `share.static.tsx` with H1, content div, canonical URL, meta description, OG tags.
- **Content stored in DB** (pages table, slug="about").

### Issues found

| # | Severity | Issue | Recommendation |
|---|----------|-------|
| AB-1 | High | **No structured data on the About page.** The static page route (`share.static.tsx`) does not output any JSON-LD. The About page should have `AboutPage` schema or at minimum `WebPage` with `mainEntity` pointing to the Organization. | Add `WebPage` or `AboutPage` JSON-LD to `share.static.tsx` for the "about" slug specifically. |
| AB-2 | High | **No author/team bios visible in template.** The About page content is entirely DB-driven -- we cannot verify from code whether it contains team member names, credentials, or photos. Without these, E-E-A-T Experience and Expertise signals are weak. | Ensure the About page DB content includes: founding story, team member names with roles, editorial methodology description, and a photo of the team or founder. |
| AB-3 | Medium | **No `sameAs` links in Organization schema.** The global Organization JSON-LD in `root.tsx` lacks `sameAs` references to social media profiles (Twitter/X, note, LinkedIn, etc.). | Add `sameAs: [...]` array to the Organization schema with all official social profiles. |

---

## 4. Footer Trust Links -- Score: 90/100

### What is implemented

Six trust-building footer links, all present and correctly routed:

| Link | Route | Status |
|------|-------|--------|
| サイトについて (About) | `/share/about` | Present |
| 利用規約 (Terms of Service) | `/share/tos` | Present |
| プライバシーポリシー | `/share/privacy` | Present |
| お問い合わせ (Contact) | `/share/contact` | Present |
| 運営情報 (Company Info) | `/share/company` | Present |
| 特定商取引法 (Specified Commercial Transactions) | `/share/regal` | Present |

Copyright notice includes `2011-{currentYear}` -- correctly reflects site history.

### Issues found

| # | Severity | Issue | Recommendation |
|---|----------|-------|
| F-1 | Low | Footer slug is `/share/regal` -- the standard Japanese convention is "tokushoho" or "tokutei-shotorihiki". The slug "regal" may confuse users expecting a Japanese URL. | Consider a redirect from a more standard slug, or keep as-is since it is an internal implementation detail. |
| F-2 | Low | No RSS icon/link in footer. While RSS is discoverable via `<link rel="alternate">` in `<head>`, power users and crawlers benefit from a visible footer link. | Add an RSS feed link to the footer navigation. |

---

## 5. Category Page (`/share/category/business`) -- Score: 76/100

### What is implemented

- **Description text present:** Each of the 6 categories has a unique description in `CATEGORY_DESCRIPTIONS`. For business: "経営者の講演、スタートアップのピッチ、TED Talksのビジネス系プレゼンテーションなど、ビジネスに関する書き起こし記事をまとめています。"
- **CollectionPage schema** with `numberOfItems`.
- **Bilingual labels** (Japanese + English category names).
- **Per-category RSS feeds** at `/share/category/{slug}/feed.xml`.
- **Canonical URLs** and full OG/Twitter meta tags.

### Issues found

| # | Severity | Issue | Recommendation |
|---|----------|-------|
| C-1 | Medium | Category descriptions are only 1-2 sentences (~60-80 chars). For category landing pages, 150-300 characters of unique descriptive text improves topical coverage and AI citability. | Expand each category description to 2-3 sentences covering what types of speakers, events, and topics are included. |
| C-2 | Medium | **Meta description is generic template:** `${name}カテゴリの書き起こし記事一覧 -- 講演・インタビュー・スピーチのテキスト`. This does not incorporate the richer `CATEGORY_DESCRIPTIONS` content. | Use `CATEGORY_DESCRIPTIONS[slug]` as the meta description instead of the generic template. |
| C-3 | Low | No `<link rel="alternate" type="application/rss+xml">` in the `<head>` for per-category feeds. Only the global feed is declared in `root.tsx` links. | Add category-specific RSS `<link>` in the category page meta export. |

---

## 6. RSS Feed Discoverability -- Score: 88/100

### What is implemented

- **Global RSS feed** at `/share/feed.xml` -- proper RSS 2.0 with `atom:link` self-reference.
- **`<link rel="alternate">` in `<head>`** declared in `root.tsx` links function -- discoverable by all browsers and crawlers.
- **Per-category feeds** at `/share/category/{slug}/feed.xml` -- functional with correct structure.
- **Content-Type** correctly set to `application/rss+xml; charset=utf-8`.
- **Cache-Control** set to `public, max-age=3600` (1 hour).

### Issues found

| # | Severity | Issue | Recommendation |
|---|----------|-------|
| R-1 | Medium | RSS items lack `<content:encoded>` element. Only `<description>` (excerpt) is included. Full-content feeds improve AI training data extraction and reader experience. | Add `xmlns:content` namespace and `<content:encoded>` with full article HTML (or first 500 chars). |
| R-2 | Low | No `<lastBuildDate>` in the channel element. | Add `<lastBuildDate>` using the most recent post's `published_at`. |
| R-3 | Low | Per-category feeds are not listed in `robots.txt` or discoverable via `<link>` in `<head>`. | Add per-category feed autodiscovery on category pages. |

---

## 7. AI Citation Readiness -- Score: 80/100

### robots.txt AI Crawler Configuration

All major AI crawlers are explicitly allowed for `/share/` content:

| Bot | Allow `/share/` | Allow `/sitemap.xml` | Block `/auth/`, `/dashboard/`, `/admin/` |
|-----|-----------------|---------------------|------------------------------------------|
| GPTBot (OpenAI) | Yes | Yes | Yes |
| ClaudeBot (Anthropic) | Yes | Yes | Yes |
| Google-Extended | Yes | Yes | Yes |
| PerplexityBot | Yes | Yes | Yes |
| Bytespider (ByteDance) | Yes | Yes | Yes |
| CCBot (Common Crawl) | Yes | Yes | Yes |

### AI Citation Readiness Strengths

1. **Speakable schema** on article pages enables voice assistant citation.
2. **Clear heading hierarchy** (H1 > H2 > H3) with auto-injection for legacy content.
3. **Structured data graph** linking Organization, WebSite, Article, and BreadcrumbList.
4. **Canonical URLs** consistently applied across all page types.
5. **Clean URL structure** (`/share/{category}/{id}`) is stable and citable.
6. **Security headers** in `_headers` file (HSTS, X-Frame-Options, CSP upgrade-insecure-requests).

### AI Citation Readiness Gaps

| # | Severity | Issue | Recommendation |
|---|----------|-------|
| AI-1 | High | **No `TL;DR` or summary block at article top.** AI systems extract the first paragraph for citation snippets. Transcript articles often start mid-conversation without a summary. | Add a structured summary block (2-3 sentences) at the top of each article, wrapped in a `<div class="article-summary">` with schema `abstract` property. |
| AI-2 | Medium | **No FAQ schema on any page type.** FAQ structured data is one of the highest-impact citation triggers for AI search engines. | Add FAQ schema to service pages (technique, tapeokoshi, jirei, etc.) and potentially to articles where Q&A content exists. |
| AI-3 | Medium | **No `dateCreated` distinct from `datePublished`.** For migrated WordPress content, the original creation date may differ from the migration publish date. | Add `dateCreated` to Article schema when available from WP migration data. |
| AI-4 | Low | **Missing `Cohere` and `Meta-ExternalAgent` in robots.txt.** These AI crawlers are increasingly active in 2026. | Add rules for `cohere-ai`, `Meta-ExternalAgent`, `Applebot-Extended`, and `anthropic-ai`. |

---

## E-E-A-T Breakdown

### Experience (20% weight) -- Score: 55/100

| Signal | Present | Notes |
|--------|---------|-------|
| First-hand content | Partial | Transcripts are primary-source reproductions, which is valuable, but no editorial commentary demonstrates the transcriber's experience |
| Original content | Yes | 143 migrated articles from 2011+ |
| Case studies / examples | No | No editorial case studies about transcription quality or methodology |
| Author bios with experience | No | "書き起こし.com編集部" is anonymous -- no individual experience signals |

**Weighted contribution: 11/20**

### Expertise (25% weight) -- Score: 60/100

| Signal | Present | Notes |
|--------|---------|-------|
| Author credentials | No | No individual credentials displayed |
| Technical accuracy | Assumed | Cannot verify transcript accuracy from code alone |
| Depth of content | Good | Long-form transcripts are inherently detailed |
| Topic-appropriate language | Yes | Category taxonomy and descriptions show domain awareness |

**Weighted contribution: 15/25**

### Authoritativeness (25% weight) -- Score: 65/100

| Signal | Present | Notes |
|--------|---------|-------|
| External citations/references | No | No outbound links to sources, no inbound citation tracking |
| Brand recognition signals | Partial | Site operating since 2011 (14+ years), but no press mentions or awards referenced |
| `sameAs` social links | No | Missing from Organization schema |
| Domain authority signals | Good | Domain name `kakiokosi.com` is exact-match for the topic |

**Weighted contribution: 16.25/25**

### Trustworthiness (30% weight) -- Score: 82/100

| Signal | Present | Notes |
|--------|---------|-------|
| Contact information | Yes | Email, physical address (渋谷区), contact form page |
| Transparency pages | Yes | All 6 trust pages in footer (about, ToS, privacy, contact, company, tokushoho) |
| HTTPS / Security | Yes | HSTS preload, X-Frame-Options DENY, CSP upgrade, nosniff |
| Content provenance | Partial | Published dates present, but no source attribution for individual transcripts |
| Privacy compliance | Yes | Dedicated privacy policy page |

**Weighted contribution: 24.6/30**

### E-E-A-T Total: 66.85 / 100

---

## AI Content Assessment (Sept 2025 QRG Criteria)

This site does **not** appear to use AI-generated content. The content consists of human speech transcripts, which are inherently human-authored (by the speakers). The transcription process itself is manual/editorial work.

**No AI content quality flags triggered.**

However, the auto-injected H2 headings (`injectHeadings()` in `format-content.ts`) could be perceived as algorithmically generated low-quality structural elements by quality raters, since they are truncated sentence fragments rather than meaningful topic labels.

---

## Priority Action Items

### P0 -- Critical (fix within 2 weeks)

1. **Add editorial context to articles** (A-2): Source event, speaker name, date, transcription methodology
2. **Fix author schema type** (A-1): Change from `Person` to `Organization` or add real author profiles
3. **Add structured data to About page** (AB-1): `AboutPage` or `WebPage` JSON-LD

### P1 -- High (fix within 1 month)

4. **Add article summary blocks** (AI-1): 2-3 sentence TL;DR for AI citation extraction
5. **Expand homepage editorial content** (H-1): 200+ character introduction with site history and value proposition
6. **Improve auto-generated H2 quality** (A-3): Topic-based labels instead of truncated sentences
7. **Use category descriptions in meta tags** (C-2): Replace generic meta descriptions

### P2 -- Medium (fix within 2 months)

8. **Add `sameAs` to Organization schema** (AB-3)
9. **Add RSS `content:encoded`** (R-1)
10. **Add FAQ schema to service pages** (AI-2)
11. **Expand category descriptions** (C-1)
12. **Add missing AI crawlers to robots.txt** (AI-4)

### P3 -- Low (backlog)

13. Add `wordCount` and `timeRequired` to Article schema (A-6)
14. Narrow speakable cssSelector (A-5)
15. Add `lastBuildDate` to RSS feeds (R-2)
16. Add RSS link to footer (F-2)
17. Add `itemListElement` to CollectionPage schema (H-2)
18. Add per-category feed autodiscovery links (C-3, R-3)

---

## File References

| File | Relevance |
|------|-----------|
| `app/root.tsx` | Footer links, global JSON-LD, RSS autodiscovery |
| `app/routes/share._index.tsx` | Homepage H1, intro text, CollectionPage schema |
| `app/routes/share.$category.$id.tsx` | Article page: author byline, speakable, related articles, breadcrumbs |
| `app/routes/share.static.tsx` | About page rendering (no JSON-LD) |
| `app/routes/share.category.$slug.tsx` | Category descriptions, CollectionPage schema |
| `app/lib/format-content.ts` | H2 auto-injection logic for legacy articles |
| `app/lib/schema.ts` | All schema generators (Organization, Article, CollectionPage, etc.) |
| `app/routes/share.feed[.]xml.tsx` | Global RSS feed |
| `app/routes/share.category.$slug.feed[.]xml.tsx` | Per-category RSS feeds |
| `public/robots.txt` | AI crawler rules |
| `public/_headers` | Security headers (HSTS, X-Frame-Options, etc.) |
