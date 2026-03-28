# Content Quality & E-E-A-T Audit: kakiokosi.com

**Audit date:** 2026-03-28
**Auditor:** Content Quality Specialist (Google Sept 2025 QRG framework)
**Site:** https://kakiokosi.com (書き起こし.com)
**Stack:** React Router v7 / Cloudflare Pages + D1 + R2
**Content corpus:** ~143 published posts migrated from WordPress

---

## Overall Content Quality Score: 42/100

This score reflects significant structural E-E-A-T gaps that limit the site's ability to rank competitively and be cited by AI systems. The underlying content (transcriptions of speeches, interviews, lectures) has inherent value, but the presentation layer strips away most trust and authority signals.

---

## 1. E-E-A-T Breakdown

### Experience: 25/100 (Weight: 20%)

**Findings:**
- No author bylines on any article page. The `Post` data model has `author_id` but this is never surfaced to readers.
- No author bio, photo, or credentials displayed anywhere on article pages.
- No editorial notes explaining the transcription process, quality assurance steps, or source verification.
- No "I was at this event" or "We transcribed this from the original recording" signals that would demonstrate first-hand involvement.
- The content itself (transcriptions) implies some level of direct experience with source material, but this is never explicitly communicated to readers or search engines.

**Impact:** Google's quality raters look for demonstrable first-hand experience. A transcription site has a natural advantage here (you worked with the original audio/video), but this is entirely unexploited.

### Expertise: 35/100 (Weight: 25%)

**Findings:**
- No author schema markup. The Article JSON-LD in `share.$category.$id.tsx` (lines 86-112) defines a publisher Organization but has no `author` field at all.
- No editorial standards page explaining transcription methodology, accuracy commitments, or correction policies.
- The static pages (about, technique, tapeokoshi, point, webmeeting) registered in `share.static.tsx` suggest supporting content exists, but these are served from the legacy WordPress database with no visible integration into article pages.
- Category taxonomy is present (Business, Politics, Society, Foreign, IT, Entertainment) which signals topical organization, but there is no evidence of subject-matter expertise per vertical.
- No credentials or qualifications are displayed anywhere on the site.

**Impact:** For YMYL-adjacent topics (politics, business), the absence of demonstrated expertise is a significant ranking liability under the September 2025 QRG criteria.

### Authoritativeness: 30/100 (Weight: 25%)

**Findings:**
- Organization schema in `schema.ts` (line 26) has an empty `sameAs` array -- no social profiles, Wikipedia entries, or external authority signals linked.
- No external citations, references, or links to source material within articles.
- No "as seen in" or media mention signals.
- The `robots.txt` blocks all major AI crawlers (ClaudeBot, GPTBot, Google-Extended, CCBot, Applebot-Extended, Amazonbot, Bytespider, meta-externalagent). While this protects content from AI training, it also prevents AI citation/attribution systems from indexing the content. This is a deliberate trade-off but should be noted.
- No backlink-worthy assets (tools, original research, data visualizations, embeddable widgets).
- Logo referenced in schema (`/logo.png`) does not exist in the public directory (only `favicon.ico`, `robots.txt`, `_headers`, and `uploads/` are present).

**Impact:** The site presents itself as an anonymous content aggregator rather than an authoritative transcription source.

### Trustworthiness: 45/100 (Weight: 30%)

**Positives:**
- HTTPS enforced via `upgrade-insecure-requests` CSP header and HSTS in `_headers`.
- Security headers present: X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy.
- Footer links to About, Terms of Use, Privacy Policy, and Contact pages.
- Canonical URLs properly set on all article and listing pages.
- Copyright notice with date range (2024-current year).

**Negatives:**
- No visible company/operator information on article pages (the `company` and `regal` static pages exist in the sitemap but are not linked from the main navigation or footer).
- No physical address or business registration number displayed.
- Newsletter signup in sidebar collects email but shows no privacy disclosure adjacent to the form.
- No GDPR/cookie consent mechanism visible in the codebase.
- Contact page exists but is not prominently accessible from article pages.

**Weighted E-E-A-T Total: 34.75/100**

| Factor | Score | Weight | Weighted |
|--------|-------|--------|----------|
| Experience | 25 | 20% | 5.0 |
| Expertise | 35 | 25% | 8.75 |
| Authoritativeness | 30 | 25% | 7.5 |
| Trustworthiness | 45 | 30% | 13.5 |
| **Total** | | | **34.75** |

---

## 2. Homepage Content Quality

**Route:** `share._index.tsx` (redirected from `/` via `home.tsx` 301)

**Issues identified:**

- **Below minimum word count.** The homepage renders only a post listing (featured card + grid). There is zero static text content -- no site description, no value proposition, no editorial introduction. The minimum recommended for a homepage is 500 words of meaningful content. Current estimate: fewer than 50 words of static text (just "Latest Transcripts" and "Archives").
- **No H1 optimization.** The H1 is simply "Archives" -- an English word on a Japanese-language site targeting Japanese search queries. This is a significant keyword mismatch.
- **Meta description** is adequate: "講演・インタビュー・スピーチの書き起こし記事を共有するサイト" but could be more specific about the corpus size and value.
- **No FAQ or introductory content** to serve as featured snippet material.
- **No internal linking strategy** beyond the post cards themselves.

**Homepage Score: 30/100**

---

## 3. Article Page Content Quality

**Route:** `share.$category.$id.tsx`

**Structural assessment:**

**Positives:**
- Proper semantic HTML: `<article>`, `<header>`, `<nav>` (breadcrumb), `<footer>` (tags), `<aside>` (sidebar).
- Breadcrumb navigation with matching JSON-LD BreadcrumbList schema.
- Article JSON-LD with datePublished, dateModified, publisher, headline, description.
- Category and tag taxonomy displayed and linked.
- Responsive image handling with aspect ratio containers.
- Excerpt displayed as a styled pull-quote (`<p>` with `border-l-2`).
- `<time>` element with `dateTime` attribute for publication date.
- Content formatting handles WordPress migration edge cases (double newlines to paragraphs, Unicode decoding).

**Negatives:**
- **No author attribution.** The most critical missing element. No byline, no author schema, no author page link.
- **No dateModified visible to users.** The schema has it, but users only see `published_at`. Google prefers visible date signals that match schema.
- **No related articles section.** After reading an article, users hit a dead end (only sidebar categories and a newsletter CTA).
- **No table of contents** for long transcription content.
- **No source attribution.** For transcriptions, linking to the original speech/interview source (video URL, event page, speaker bio) is essential for both E-E-A-T and citation.
- **No word count or reading time estimate** displayed.
- **No comments or engagement signals.**
- **No social sharing buttons** (minor, but signals engagement potential).

**Article Page Score: 48/100**

---

## 4. Readability Assessment

**Typography and layout (from `app.css`):**

**Positives:**
- Base font size 1rem (16px), scaling to 1.125rem (18px) on desktop. This meets accessibility standards.
- Line height of 2.0-2.1 -- generous for Japanese text, which benefits from wider line spacing.
- `word-break: auto-phrase` and `font-feature-settings: "palt" 1` -- excellent Japanese typography optimization.
- `max-width: 42em` on article content constrains line length to readable levels.
- Heading hierarchy (H2, H3, H4) with clear visual differentiation.
- Blockquote styling with left border and background color.
- Responsive breakpoints adjust font sizes and margins.

**Concerns:**
- Mixed language UI labels (English category labels like "Business", "READ THE TRANSCRIPT" on a Japanese-language site). This creates cognitive friction for native Japanese readers.
- The `article-content` styles handle WordPress-migrated content well, but the `formatArticleContent` function (format-content.ts) applies paragraph wrapping only when `<p>` tags are absent. Content quality depends heavily on how well the original WordPress export preserved structure.
- No dark mode support, which is increasingly expected.

**Readability Score: 65/100**

---

## 5. Thin Content Detection

**Risk factors identified:**

- **No content length validation at publish time.** The `db-dashboard.server.ts` accepts any content length. There is no minimum word count enforcement.
- **143 migrated posts with unknown quality distribution.** WordPress migrations often include stub posts, redirect placeholders, or posts with only embedded media (YouTube iframes) and minimal text.
- **The `formatArticleContent` function** has a threshold: text segments under 80 characters are not wrapped in `<p>` tags (line 41). This suggests awareness that some content chunks are very short, but it does not flag or filter thin content.
- **Category and tag pages** render only post listings with no additional descriptive content. These are functionally thin pages.
- **Pagination pages** (`share.page.$page.tsx`) generate additional listing pages that are all structurally identical to the homepage with different post subsets.
- **No noindex on potentially thin pages** (empty tag pages, categories with very few posts).

**Thin Content Risk: HIGH**

Recommended action: Query the D1 database to identify posts with content shorter than 300 characters (approximately 150 Japanese characters). These should either be expanded, consolidated, or noindexed.

---

## 6. AI Citation Readiness Score: 28/100

AI citation readiness measures how well content can be extracted, attributed, and quoted by AI systems (Google AI Overviews, ChatGPT citations, Perplexity, etc.).

**Positive signals:**
- Structured data (Article schema) with headline, description, dates, and publisher.
- Breadcrumb schema provides topical context.
- Clean URL structure (`/share/{category}/{id}`).
- Category taxonomy provides topical clustering.
- Canonical URLs properly set.

**Negative signals:**
- **robots.txt blocks all major AI crawlers.** This is the single biggest factor. Google-Extended, GPTBot, ClaudeBot, CCBot, and others are all blocked. While Googlebot itself is allowed (so content can rank in search), the explicit AI-crawler blocks prevent inclusion in AI Overview citations and third-party AI systems.
- **No quotable facts or statistics.** Transcription content is long-form dialogue, which is difficult for AI systems to extract discrete facts from without explicit highlights, summaries, or key takeaways sections.
- **No FAQ schema** or Q&A structured data, which AI systems heavily favor for citation.
- **No summary/key points section** at the top or bottom of articles.
- **No named entities markup** (Person, Event, etc.) for speakers or events being transcribed.
- **No `speakable` schema** -- this is specifically designed for content that voice assistants can read aloud, and is directly applicable to transcription content.
- **Missing author schema** means AI systems cannot attribute quotes to a specific editorial voice.

---

## 7. AI-Generated Content Assessment

Based on code analysis (not live content inspection), the following observations apply:

- The site's 143 posts were migrated from WordPress, suggesting they are human-created transcriptions rather than AI-generated content.
- The dashboard (`dashboard.posts.new.tsx`, `dashboard.posts.$id.edit.tsx`) provides a Tiptap rich text editor for new content creation. There is no visible AI content generation integration.
- The static pages (about, tos, privacy, contact) were recently rewritten (commit `7a5df38`: "rewrite about, tos, privacy, contact pages with complete content"). These should be spot-checked for generic AI phrasing.
- **No content provenance signals.** There is no indication of whether content is human-transcribed, AI-assisted, or auto-generated from speech-to-text tools.

**Risk level for AI content flags: LOW-MEDIUM**

The content type (transcription) is inherently human-derived, but without explicit process transparency, quality raters may question whether it is automated speech-to-text output (lower quality) versus human-verified transcription (higher quality).

---

## Priority Improvement Recommendations

### Critical (Impact: High, Effort: Low-Medium)

1. **Add author attribution to article pages and schema.**
   - Display author name and brief bio on each article.
   - Add `author` field to Article JSON-LD with `@type: Person`, `name`, and `url`.
   - File: `app/routes/share.$category.$id.tsx` (lines 86-112 for schema, lines 135-167 for header display).

2. **Add visible dateModified to article pages.**
   - Show "Last updated: YYYY/MM/DD" when `updated_at` differs from `published_at`.
   - File: `app/routes/share.$category.$id.tsx` (line 78 area).

3. **Create homepage introductory content.**
   - Add 300-500 words of Japanese editorial content above the post listing explaining what the site is, what topics it covers, and its editorial mission.
   - File: `app/routes/share._index.tsx`.

4. **Add source attribution to articles.**
   - For each transcription, link to the original speech/interview source (video URL, event page, or speaker information).
   - Requires a database schema addition (e.g., `source_url`, `source_title`, `speaker_name` columns on the posts table).

### High Priority (Impact: High, Effort: Medium)

5. **Add `speakable` schema to articles.**
   - Mark the excerpt and first paragraph as speakable content.
   - This is directly aligned with transcription content and AI citation systems.

6. **Add key takeaways / summary section to articles.**
   - Either as a manually written summary or an auto-generated excerpt at the top of each article.
   - Wrap in a clearly identified `<section>` with a heading like "要点" (Key Points).

7. **Populate Organization `sameAs` in schema.**
   - Add social media profiles, Google Business Profile, or any external presence.
   - File: `app/lib/schema.ts` (line 26).

8. **Add `company` and `regal` (特定商取引法) links to the footer.**
   - These pages exist but are not linked from the global footer in `app/root.tsx`.
   - This is legally required for commercial Japanese websites under the Tokutei Sho-torihiki Ho.

9. **Fix missing logo asset.**
   - `schema.ts` references `/logo.png` but the file does not exist in `public/`.
   - Create and deploy the logo, or remove the reference to avoid schema validation errors.

### Medium Priority (Impact: Medium, Effort: Medium)

10. **Evaluate AI crawler blocking strategy.**
    - The current `robots.txt` blocks all AI training crawlers. Consider whether allowing Google-Extended specifically would benefit AI Overview inclusion while still blocking third-party training.
    - Note: Googlebot (allowed) already feeds Google AI Overviews. Google-Extended only controls use in Gemini training. The current setup may already allow AI Overview citations.

11. **Add FAQ structured data to static service pages.**
    - Pages like `technique`, `tapeokoshi`, `point`, and `webmeeting` are ideal candidates for FAQ schema.

12. **Add related articles component.**
    - Query posts in the same category or with overlapping tags.
    - Display 3-4 related articles at the bottom of each article page.

13. **Implement thin content detection.**
    - Add a database query in the admin dashboard to flag posts with `LENGTH(content) < 600` (approximately 300 Japanese characters).
    - Add noindex meta tags to posts below the threshold until they are expanded.

14. **Normalize UI language.**
    - Replace English UI labels ("Archives", "READ THE TRANSCRIPT", "Business", "Politics", etc.) with Japanese equivalents, or provide a clear bilingual design rationale.

### Lower Priority (Impact: Low-Medium, Effort: Low)

15. **Add reading time estimate to article headers.**
    - Calculate from content length (Japanese: approximately 400-600 characters per minute).

16. **Add a table of contents for long articles.**
    - Parse H2/H3 headings from content and generate an anchor-linked TOC.

17. **Add structured data for speakers/events.**
    - Where identifiable, add Person or Event schema for the subject of each transcription.

---

## Summary

| Metric | Score |
|--------|-------|
| **Overall Content Quality** | **42/100** |
| E-E-A-T (weighted) | 34.75/100 |
| -- Experience | 25/100 |
| -- Expertise | 35/100 |
| -- Authoritativeness | 30/100 |
| -- Trustworthiness | 45/100 |
| Homepage Quality | 30/100 |
| Article Page Quality | 48/100 |
| Readability | 65/100 |
| AI Citation Readiness | 28/100 |
| Thin Content Risk | HIGH |
| AI-Generated Content Risk | LOW-MEDIUM |

The site has a solid technical foundation (proper schema, canonical URLs, semantic HTML, security headers, sitemap) but is severely lacking in the content and trust signals that drive E-E-A-T evaluation. The single highest-impact change is adding author attribution to articles. The second is creating meaningful homepage content. Together, these two changes alone could move the overall score from 42 to an estimated 55-60.

---

*Audit conducted using Google September 2025 Quality Rater Guidelines framework. Scores are directional estimates based on codebase analysis; live content inspection of representative articles would refine these assessments.*
