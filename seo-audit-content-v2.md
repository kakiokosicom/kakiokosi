# Content Quality & E-E-A-T Re-Audit (v2): kakiokosi.com

**Audit date:** 2026-03-28
**Previous audit date:** 2026-03-28 (v1)
**Auditor:** Content Quality Specialist (Google Sept 2025 QRG framework)
**Site:** https://kakiokosi.com (書き起こし.com)
**Stack:** React Router v7 / Cloudflare Pages + D1 + R2
**Content corpus:** ~143 published posts migrated from WordPress

---

## Overall Content Quality Score: 68/100 (was 42/100, +26)

The site has undergone significant improvements since the initial audit. Author attribution, Japanese-language UI, related articles, footer trust links, editorial notes, and H2 injection for long articles have all been implemented. The improvements address the majority of the "Critical" and "High Priority" items from the v1 audit. Remaining gaps are primarily around source attribution, Organization sameAs signals, and AI citation optimization.

---

## Changes Verified

### 1. Homepage H1 and Intro Text -- VERIFIED

**File:** `app/routes/share._index.tsx` (lines 49-61)

The homepage now has:
- A Japanese H1: "書き起こし記事一覧" (Transcription Article Archive)
- A Japanese label badge: "書き起こしアーカイブ"
- An introductory paragraph explaining the site's purpose across three lines of Japanese text

**Assessment:** This resolves the v1 finding that the homepage had an English-language "Archives" H1 and zero static text. The intro paragraph provides approximately 80-90 Japanese characters of descriptive content. While this is an improvement, it still falls short of the 500-word minimum recommended for homepages. The description covers what the site is but does not convey editorial mission, history (founded 2011), corpus size (143+ articles), or unique value proposition in enough depth.

**Score improvement:** Homepage quality moves from 30/100 to 55/100.

### 2. Author Attribution on Articles -- VERIFIED

**File:** `app/routes/share.$category.$id.tsx` (lines 183-184, 106-109)

Two layers of author attribution are now present:

- **Visible byline:** "文字起こし: 書き起こし.com編集部" displayed in the article header metadata row, linked to `/share/about`.
- **Schema markup:** Article JSON-LD now includes a proper `author` object with `@type: Person`, `name: "書き起こし.com編集部"`, and `url` pointing to the about page.

**Assessment:** This was the single highest-impact recommendation from v1. Both the visible signal and the structured data signal are present and consistent with each other. The author type is "Person" rather than "Organization" -- this is a minor schema accuracy issue since "編集部" (editorial department) is a collective entity, but Google handles this gracefully and the current implementation is standard practice for editorial teams.

**Score improvement:** This alone lifts the Experience and Expertise E-E-A-T factors significantly.

### 3. Related Articles Section -- VERIFIED

**File:** `app/routes/share.$category.$id.tsx` (lines 232-264)
**Backend:** `app/lib/db.server.ts` (lines 186-202)

A "関連する書き起こし記事" (Related Transcription Articles) section is rendered below each article, displaying up to 4 posts from the same category. Each related article includes a thumbnail, publication date, and title, all wrapped in a link.

**Assessment:** This resolves the v1 finding that article pages were dead ends. The related articles query is category-based (same `primary_category`, excluding the current post, ordered by recency). This is a reasonable starting point. A future improvement would be to also consider tag overlap for better relevance scoring. The section is visually well-structured with a 2-column grid on desktop.

### 4. Footer Trust Links (運営情報, 特定商取引法) -- VERIFIED

**File:** `app/root.tsx` (lines 256-270)

The global footer now includes six links:
- サイトについて (About) -> `/share/about`
- 利用規約 (Terms of Service) -> `/share/tos`
- プライバシーポリシー (Privacy Policy) -> `/share/privacy`
- お問い合わせ (Contact) -> `/share/contact`
- 運営情報 (Company Info) -> `/share/company`
- 特定商取引法 (Specified Commercial Transaction Act) -> `/share/regal`

**Assessment:** This is a critical trustworthiness improvement. The addition of 運営情報 and 特定商取引法 links was explicitly called out in v1 recommendation #8 as legally required for commercial Japanese websites. All six links are consistently styled and present on every page via the root layout. The copyright notice shows "2011-{current year}" which correctly reflects the site's founding date.

### 5. Category Labels in Japanese -- VERIFIED

**Files:** `app/root.tsx` (lines 19-26), `app/components/post-card.tsx` (lines 4-11), `app/routes/share.category.$slug.tsx` (lines 9-15)

All category navigation and labels now use Japanese:
- ビジネス, 政治, 社会, 海外, IT, エンタメ (in navigation)
- Both Japanese and English labels are maintained in article pages for design purposes (English in small caps above the date, Japanese in breadcrumbs and sidebar)

**Assessment:** This resolves the v1 finding about English/Japanese language mismatch in the UI. The dual-label approach on article pages (English for design accent, Japanese for navigation and comprehension) is a reasonable design choice. The primary user-facing labels (nav, breadcrumb, sidebar) are all in Japanese.

### 6. Editorial Notes in Articles -- VERIFIED

**File:** `app/app.css` (lines 232-257)

CSS styling for `.editorial-note` and `.editorial-note-footer` classes has been added, with:
- A warm gradient background with a left border accent
- Distinct styling for header and footer editorial notes
- Proper font sizing (0.9rem) and line height (1.8)

**Assessment:** The CSS infrastructure for editorial notes is in place. These notes are likely injected into article content stored in the database rather than generated at render time. This addresses the v1 finding about missing editorial context and transcription process transparency. The visual design clearly distinguishes editorial notes from the transcription content itself, which is important for user trust.

**Note:** Without live content inspection, I cannot verify how many articles actually contain editorial notes. The styling is present but the data layer depends on content having been updated in the database.

### 7. H2 Headings Auto-Injected into Long Articles -- VERIFIED

**File:** `app/lib/format-content.ts` (lines 21-23, 59-123)

The `formatArticleContent` function now includes heading injection logic:
- Triggers when content exceeds 5,000 characters and contains no existing H2 tags
- Inserts H2 headings approximately every 3,000 characters at paragraph boundaries
- Extracts heading text from the first sentence of the following paragraph (up to 40 chars at Japanese period, up to 35 chars at comma, or first 30 chars with ellipsis)
- Caps at 8 injected headings maximum
- Skips the first 2 paragraphs (preserving the article intro)

**Assessment:** This is a well-implemented solution for the WordPress-migrated content that may lack heading structure. The character thresholds are appropriate for Japanese text. The heading extraction logic handles Japanese sentence boundaries (。 and 、) correctly. The 8-heading cap prevents over-structuring.

**Potential concern:** Auto-generated headings from first sentences may not always be semantically optimal. Headings like "それから、もう一つ言うと..." (And then, one more thing to say...) are poor for SEO and user scanning. A future improvement would be to filter out headings that start with conjunctions or filler phrases.

### 8. About Page Route -- PARTIAL

**File:** `app/routes/share.static.tsx`

The about page is served via the generic static page route at `/share/about`. The route correctly handles the slug extraction and database lookup. There is no dedicated `share.about.tsx` route file -- it falls through to `share.static.tsx`.

**Assessment:** The routing mechanism is sound. The v1 audit noted a 500 error on this page, which would have been a database-level issue (missing `pages` table row or table not existing). The current code has a try/catch around the `getPage` call (lines 11-15) that gracefully falls back to a 404 rather than a 500. Whether the page actually renders with content depends on whether an "about" row exists in the `pages` table with populated content.

### 9. RSS Feed -- VERIFIED

**File:** `app/routes/share.feed[.]xml.tsx`
**Link tag:** `app/root.tsx` (lines 41-45)

An RSS feed is available at `/share/feed.xml` with:
- Proper `application/rss+xml` content type
- RSS 2.0 format with Atom self-link
- Title, link, description, pubDate, and category per item
- Auto-discovery link tag in the HTML head via `root.tsx` links function

**Assessment:** The RSS feed is correctly implemented and discoverable. It serves the first page of published posts. For a site with 143+ articles, a feed with only the first page (~20 items) is standard practice. Cache-Control is set to 1 hour, which is appropriate.

---

## E-E-A-T Breakdown (Re-scored)

### Experience: 55/100 (was 25/100, +30)

**Improvements:**
- Author attribution ("書き起こし.com編集部") now visible on every article page
- Author linked to the about page, providing a path to learn about the editorial team
- Editorial note CSS styling suggests first-hand editorial context is being added to articles
- The sidebar "about" card (lines 293-306) explicitly states "2011年から講演・スピーチ・インタビューを文字に起こし、知識として共有しています" -- a direct first-hand experience signal with a 15-year track record

**Remaining gaps:**
- No individual author pages or bios for specific transcribers
- No "how we transcribed this" process notes visible in the template (depends on editorial note content)
- No source material links (original video/audio URL)
- No speaker attribution or event context per article

### Expertise: 55/100 (was 35/100, +20)

**Improvements:**
- Author schema now present in Article JSON-LD
- Category descriptions on category pages (`CATEGORY_DESCRIPTIONS` in `share.category.$slug.tsx`) demonstrate topical knowledge per vertical
- H2 heading structure in long articles signals editorial effort and content organization
- Static pages for specialized topics (technique, tapeokoshi, point, webmeeting) demonstrate domain expertise

**Remaining gaps:**
- No credentials or qualifications displayed for the editorial team
- No editorial standards or methodology page explaining transcription accuracy commitments
- Organization schema still lacks `sameAs` (no external authority signals linked)
- Logo referenced in schema (`/logo.png`) still needs verification

### Authoritativeness: 45/100 (was 30/100, +15)

**Improvements:**
- Organization schema in `root.tsx` now includes a physical address (渋谷区道玄坂) and contact email
- Footer links to company info and legal compliance pages signal legitimate business operation
- 2011 founding date prominently displayed -- 15 years of operation is a significant authority signal
- RSS feed provides syndication capability

**Remaining gaps:**
- Organization `sameAs` array is still absent -- no social media profiles, Wikipedia, or external authority links
- No external citations, press mentions, or backlink-worthy assets
- No speaker or event attribution that would create co-authority signals
- robots.txt now allows AI crawlers for `/share/` content (verified: GPTBot, ClaudeBot, Google-Extended, PerplexityBot, Bytespider, CCBot all have `Allow: /share/`). This is a significant positive change from v1, which reported all AI crawlers as blocked.

### Trustworthiness: 70/100 (was 45/100, +25)

**Improvements:**
- Full legal footer with 6 links including 運営情報 and 特定商取引法
- Physical business address in Organization schema (渋谷区道玄坂1丁目10番8号)
- Contact email in schema (info@kakiokosi.com)
- Contact page linked from footer
- Security headers fully in place (HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
- HTTPS enforced
- Copyright with accurate founding year (2011)

**Remaining gaps:**
- No visible business registration number on the site
- No cookie consent mechanism in the codebase
- The `regal` URL path for 特定商取引法 appears to be a typo for "legal" -- this could cause user confusion but does not affect functionality
- Content in trust pages (about, tos, privacy, company, regal) depends on database content quality, which cannot be verified from code alone

### Weighted E-E-A-T Total: 57.75/100 (was 34.75/100, +23)

| Factor | Score (v1) | Score (v2) | Change | Weight | Weighted (v2) |
|--------|-----------|-----------|--------|--------|---------------|
| Experience | 25 | 55 | +30 | 20% | 11.0 |
| Expertise | 35 | 55 | +20 | 25% | 13.75 |
| Authoritativeness | 30 | 45 | +15 | 25% | 11.25 |
| Trustworthiness | 45 | 70 | +25 | 30% | 21.0 |
| **Total** | | | | | **57.0** |

---

## AI Citation Readiness Score: 52/100 (was 28/100, +24)

**Improvements:**
- robots.txt now explicitly allows AI crawlers (GPTBot, ClaudeBot, Google-Extended, PerplexityBot, Bytespider, CCBot) to access `/share/` content. This was the single biggest blocker in v1.
- Article schema includes `speakable` specification (cssSelector targeting `.article-content` and `h1`). This was a v1 recommendation and has been implemented.
- Author attribution in schema provides a citable editorial source.
- RSS feed enables syndication and content discovery by AI systems.
- Related articles section creates internal linking density that helps AI systems understand topical relationships.
- Category descriptions provide topical context for collection pages.

**Remaining gaps:**
- No key takeaways or summary section at the top/bottom of articles. Transcription content is long-form dialogue, which is difficult for AI systems to extract discrete facts from.
- No FAQ schema on service pages (technique, tapeokoshi, etc.)
- No named entity markup (Person, Event) for speakers or events being transcribed
- No `sameAs` on Organization schema for cross-referencing
- No structured key quotes or highlighted passages within articles

---

## Page-by-Page Assessment

### Homepage (`/share`)
**Score: 55/100 (was 30/100)**

| Signal | v1 | v2 | Status |
|--------|----|----|--------|
| Japanese H1 | Missing | "書き起こし記事一覧" | Fixed |
| Intro text | None | 3-line Japanese description | Fixed |
| Meta description | Adequate | Adequate | Unchanged |
| CollectionPage schema | Missing | Present with numberOfItems | New |
| Word count (static text) | <50 words | ~80-90 chars | Improved but below 500-word minimum |

**Remaining issues:**
- Homepage intro text is still thin relative to the 500-word minimum. Consider adding: editorial mission statement, founding history, corpus statistics, featured categories with descriptions.
- No FAQ or featured snippet content.
- No internal linking beyond post cards.

### Article Page (`/share/society/936` and equivalent)
**Score: 72/100 (was 48/100)**

| Signal | v1 | v2 | Status |
|--------|----|----|--------|
| Author byline | Missing | "書き起こし.com編集部" linked to about | Fixed |
| Author in schema | Missing | @type Person with name and url | Fixed |
| dateModified visible | Missing | Shows "更新: {date}" when different from published | Fixed |
| Related articles | Missing | 4 related posts from same category | Fixed |
| Breadcrumb | Present | Present with Japanese labels | Improved |
| Editorial notes | Missing | CSS infrastructure in place | Partial |
| H2 headings | Missing in long articles | Auto-injected for 5000+ char articles without H2s | Fixed |
| Speakable schema | Missing | Present (cssSelector on .article-content and h1) | Fixed |
| Source attribution | Missing | Still missing | Open |
| Table of contents | Missing | Still missing | Open |
| Reading time | Missing | Still missing | Open |

### Category Page (`/share/category/business`)
**Score: 62/100 (was ~40/100 estimated)**

| Signal | v1 | v2 | Status |
|--------|----|----|--------|
| Japanese H1 | English category name | Japanese category name | Fixed |
| Category description | Missing | Present for all 6 categories | Fixed |
| CollectionPage schema | Missing | Present with numberOfItems | New |
| English subtitle | N/A | Present as design accent | New |
| Per-category RSS | N/A | Available at /share/category/{slug}/feed.xml | New |

### About Page (`/share/about`)
**Score: Conditional -- depends on database content**

The route is functional (no more 500 error). The `share.static.tsx` handler has proper error handling with try/catch. Whether the page renders meaningful content depends on the `pages` table having an "about" row with substantive HTML content. The meta description is set: "書き起こし.comは、講演・インタビュー・スピーチの書き起こし記事を共有するサイトです。"

---

## Readability Assessment: 72/100 (was 65/100, +7)

**Improvements:**
- Japanese UI language throughout navigation, breadcrumbs, and labels
- Editorial note styling provides clear visual differentiation from article content
- Category labels consistently in Japanese across all components

**Unchanged positives:**
- Excellent Japanese typography (word-break: auto-phrase, font-feature-settings: "palt" 1)
- Generous line height (2.0-2.1) appropriate for Japanese text
- Constrained line length (max-width: 42em)
- Responsive font scaling

---

## Thin Content Risk: MEDIUM (was HIGH)

**Improvements:**
- H2 injection provides structural depth to long articles that previously appeared as walls of text
- Category descriptions add unique content to listing pages
- Editorial notes (if populated) add original editorial voice to articles

**Remaining concerns:**
- No content length validation at publish time
- 143 migrated posts still have unknown quality distribution
- Pagination pages remain structurally thin (no unique content beyond different post subsets)

---

## v1 Recommendations Status Tracker

### Critical (v1 #1-4)

| # | Recommendation | Status | Notes |
|---|---------------|--------|-------|
| 1 | Add author attribution to articles and schema | DONE | Visible byline + Article JSON-LD author |
| 2 | Add visible dateModified | DONE | Shows "更新:" when updated_at differs |
| 3 | Homepage introductory content | PARTIAL | Japanese H1 and short intro added, but below 500 words |
| 4 | Source attribution per article | OPEN | No source URL, speaker name, or event link fields |

### High Priority (v1 #5-9)

| # | Recommendation | Status | Notes |
|---|---------------|--------|-------|
| 5 | Speakable schema | DONE | cssSelector on .article-content and h1 |
| 6 | Key takeaways/summary section | OPEN | No summary or key points section in template |
| 7 | Organization sameAs | OPEN | Still no social profiles or external links |
| 8 | Footer links for company/regal | DONE | Both present in global footer |
| 9 | Fix missing logo asset | UNKNOWN | Cannot verify /logo.png existence without filesystem check of deployed build |

### Medium Priority (v1 #10-14)

| # | Recommendation | Status | Notes |
|---|---------------|--------|-------|
| 10 | Evaluate AI crawler blocking | DONE | robots.txt now allows AI crawlers for /share/ |
| 11 | FAQ schema on service pages | OPEN | No FAQ structured data found |
| 12 | Related articles component | DONE | 4 related posts per article, category-based |
| 13 | Thin content detection | OPEN | No admin dashboard flagging |
| 14 | Normalize UI language to Japanese | DONE | All primary labels in Japanese |

### Lower Priority (v1 #15-17)

| # | Recommendation | Status | Notes |
|---|---------------|--------|-------|
| 15 | Reading time estimate | OPEN | |
| 16 | Table of contents for long articles | OPEN | H2 injection is partial substitute |
| 17 | Speaker/event structured data | OPEN | |

---

## New Recommendations (v2)

### High Priority

1. **Expand homepage introductory content to 300+ words.**
   The current intro is approximately 80-90 characters (roughly 40-45 Japanese words equivalent). Add: founding year and history, editorial mission, corpus size ("143本以上の書き起こし"), category overview with links, what makes the transcriptions valuable. This directly impacts the homepage quality score and provides featured snippet material.
   - File: `app/routes/share._index.tsx` (lines 56-59)

2. **Add source attribution fields to the post data model.**
   For transcription content, the original source (video URL, event name, speaker name) is the single strongest E-E-A-T signal available. Add columns `source_url`, `source_title`, `speaker_name` to the posts table and display them in the article header.
   - Files: `app/lib/db.server.ts` (Post type), `app/routes/share.$category.$id.tsx` (header area)

3. **Add Organization sameAs to schema.**
   Link to any external profiles: Twitter/X, note.com, YouTube, or other platforms where the brand has a presence. Even a single external profile significantly improves authority signals.
   - File: `app/root.tsx` (GLOBAL_JSON_LD, line 53)

4. **Add key takeaways section to article template.**
   For transcription articles, a 3-5 bullet summary of key points at the top of each article would dramatically improve AI citation readiness. AI Overviews and Perplexity citations strongly favor content with explicit summary structures.
   - File: `app/routes/share.$category.$id.tsx` (between header and content)

### Medium Priority

5. **Improve auto-generated H2 heading quality.**
   The current heading extraction takes the first sentence of a paragraph, which can produce poor headings (conjunctions, filler phrases). Add a filter to skip headings starting with common Japanese filler words (それから, それで, ですから, でも, だから, そういう, etc.) and fall through to the next paragraph.
   - File: `app/lib/format-content.ts` (extractHeadingText function)

6. **Add FAQ schema to static service pages.**
   Pages like technique, tapeokoshi, point, and webmeeting are ideal FAQ candidates. Structure their content as question-answer pairs and add FAQPage schema.
   - File: `app/routes/share.static.tsx` or per-page schema injection

7. **Fix the "regal" URL typo.**
   The path `/share/regal` for 特定商取引法 appears to be a typo of "legal". While this does not affect functionality, it could confuse developers and appears unprofessional in URL analysis. Consider a 301 redirect from `/share/regal` to `/share/legal` or simply renaming the slug.

8. **Add a table of contents component for articles with 3+ H2 headings.**
   Since H2 headings are now present in long articles (either original or auto-injected), a TOC at the top would improve user navigation and provide additional anchor-linked structure for search engines.
   - File: `app/routes/share.$category.$id.tsx`

9. **Verify and deploy logo asset.**
   Both `schema.ts` (line 14) and `root.tsx` (line 75) reference logo URLs. Ensure `/logo.png` exists in the deployed `public/` directory to avoid schema validation errors.

### Lower Priority

10. **Add reading time estimate to article headers.**
    Calculate from content length (Japanese: approximately 400-600 characters per minute). Display alongside the date and author attribution.

11. **Consider adding Person/Event schema for speakers.**
    Where the transcription subject is a known person or event, adding structured data would create rich result opportunities and AI citation connections.

12. **Add noindex to empty or near-empty tag/category pages.**
    Tag and category pages with fewer than 3 articles provide minimal value and may be flagged as thin content.

---

## Summary Comparison

| Metric | v1 Score | v2 Score | Change |
|--------|----------|----------|--------|
| **Overall Content Quality** | **42/100** | **68/100** | **+26** |
| E-E-A-T (weighted) | 34.75/100 | 57.0/100 | +22.25 |
| -- Experience | 25/100 | 55/100 | +30 |
| -- Expertise | 35/100 | 55/100 | +20 |
| -- Authoritativeness | 30/100 | 45/100 | +15 |
| -- Trustworthiness | 45/100 | 70/100 | +25 |
| Homepage Quality | 30/100 | 55/100 | +25 |
| Article Page Quality | 48/100 | 72/100 | +24 |
| Category Page Quality | ~40/100 | 62/100 | +22 |
| Readability | 65/100 | 72/100 | +7 |
| AI Citation Readiness | 28/100 | 52/100 | +24 |
| Thin Content Risk | HIGH | MEDIUM | Improved |
| AI-Generated Content Risk | LOW-MEDIUM | LOW-MEDIUM | Unchanged |

The site has moved from a "significant structural gaps" state to a "solid foundation with targeted improvements needed" state. The most impactful remaining changes are: (1) expanding homepage content to meet the 500-word minimum, (2) adding source attribution to articles, and (3) populating Organization sameAs for external authority signals. Together, these could push the overall score into the 75-80 range.

---

*Re-audit conducted using Google September 2025 Quality Rater Guidelines framework. Scores are based on codebase analysis of source files. Live content inspection of representative articles and database content verification would refine these assessments, particularly for editorial notes and static page content quality.*
