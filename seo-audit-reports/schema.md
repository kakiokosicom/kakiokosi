# Schema.org Structured Data Audit — kakiokosi.com

Audit date: 2026-06-11
Crawl basis: 500 URLs (498 OK), 97 indexable HTML pages in scope (403 noindexed pages excluded per audit policy).
Format detected: JSON-LD only (no Microdata/RDFa). All blocks parse cleanly — **0 INVALID_JSON pages**.

---

## 1. Current Implementation Map (indexable pages only)

| Page type | Count | Schema present |
|---|---|---|
| Homepage `/` | 1 | WebSite + Organization (@graph), CollectionPage (+ItemList numberOfItems) |
| Article `/share/<cat>/<id>` | 59 | WebSite + Organization, Article + BreadcrumbList (@graph); 4 IT articles also FAQPage |
| Category `/share/category/<cat>` | 8 | WebSite + Organization, CollectionPage — **no BreadcrumbList** |
| Guide/static `/share/<slug>` | 24 | WebSite + Organization, WebPage (or AboutPage / ContactPage), BreadcrumbList; `/share/about` also FAQPage |
| Hub `/share` | 1 | WebSite + Organization, CollectionPage |
| Noindexed (articles 93, tag/category 301, pagination 7) | 401 | Schema present but out of scope (noindex) |

Notes:
- Only pages with zero schema are two `/uploads/...` image URLs served with HTML wrappers (also flagged elsewhere as missing canonicals) — not real content pages.
- Sitewide base block (WebSite + Organization in one @graph) is injected on every page; page-specific schema is emitted in separate `<script>` blocks.

## 2. Validation Results (sampled raw JSON-LD)

Samples extracted and parsed with python3 from raw HTML:
- Homepage (`pages/d33c114907a725f6.html`)
- Article `/share/it/1385` (`pages/ad0c6b45f897b679.html`)
- Article `/share/business/881` (`pages/fd01de78c50d1838.html`)
- Article `/share/it/1381` with FAQPage (`pages/2b42b9c5034f5ae3.html`)
- Guide `/share/gijiroku` (`pages/968609bab09f4888.html`)
- Guide `/share/about` with FAQPage (`pages/41323489d853e9f4.html`)
- Category `/share/category/it` (`pages/daf6025d8fce38a7.html`)

### 2.1 Article — PASS (all required + recommended present)

Checked on all 3 article samples:

| Property | Status |
|---|---|
| headline | PASS (within 110-char guidance on all samples) |
| datePublished / dateModified | PASS — ISO 8601 with +09:00 timezone |
| author | PASS — Person with name, url, sameAs, description (E-E-A-T friendly) |
| publisher | PASS with caveat — `{"@id": "https://kakiokosi.com/#organization"}` references a node in a *separate* `<script>` block (W1 below) |
| image | PASS structurally — ImageObject with absolute URL (W2: placeholder/single ratio) |
| mainEntityOfPage | PASS — WebPage @id = canonical URL |
| Extras | inLanguage, speakable (SpeakableSpecification with cssSelector), keywords + articleSection (older articles only — W3) |

### 2.2 BreadcrumbList — PASS (validity), WARN (consistency)

- Positions sequential from 1; all non-final items have absolute `item` URLs; final item correctly omits `item`. Valid per Google requirements.
- **W4:** Guide pages (24) use `"name": "ホーム", "item": "https://kakiokosi.com/share"` while article pages (154 occurrences incl. noindexed) use `https://kakiokosi.com/`. The breadcrumb trail labeled "Home" should resolve to one canonical home. Pick `https://kakiokosi.com/` everywhere (or relabel the `/share` crumb).

### 2.3 WebSite — PASS (minor issues)

- `@context` https ✓, absolute URL ✓, inLanguage ✓.
- **W5:** No `@id` on the WebSite node, and the homepage CollectionPage embeds a *second* inline anonymous WebSite under `isPartOf` — duplicate nodes Google must reconcile. Give WebSite `"@id": "https://kakiokosi.com/#website"` and reference it everywhere.
- No SearchAction — **correct as-is**: Google retired the sitelinks search box (Nov 2024). Do not add one for rich-result purposes.

### 2.4 Organization — PASS (minor issues)

- name, url, logo (with dimensions), address, contactPoint, sameAs, foundingDate all present. Strong block.
- **W6:** `logo.url` is `https://kakiokosi.com/images/default-og.png` (1200x630 OG banner). Google's logo guidance prefers an image that *is* the logo (min 112x112, square or clearly a logo). Serve a dedicated logo file.

### 2.5 FAQPage — INELIGIBLE (policy)

- Present on `/share/it/1380, 1381, 1382, 1383` and `/share/about`. Markup is structurally valid (Question/acceptedAnswer/text).
- **W7:** Since August 2023, FAQ rich results are shown only for government and healthcare authority sites. kakiokosi.com is neither — these blocks will never produce rich results. Not penalized, but they add page weight and audit noise. Recommendation: remove from the article template going forward (the visible FAQ content itself can stay).

### 2.6 CollectionPage (homepage, categories) — PASS

- Valid; `mainEntity.ItemList.numberOfItems` only (no itemListElement). Optional improvement: list top N article URLs as ListItem entries on the 8 indexable category pages.

### Warning summary (no blocking errors)

| ID | Issue | Scope | Severity |
|---|---|---|---|
| W1 | publisher `@id` resolves across separate script blocks — merge Article into same @graph as Organization, or verify in Rich Results Test | all 59 articles | Medium |
| W2 | Article image = shared `default-og.png` on new IT articles; single 1.91:1 ratio only (Google recommends 16:9 + 4:3 + 1:1, content-representative) | ~20+ newer articles | Medium |
| W3 | `keywords` / `articleSection` missing on newest pipeline articles (e.g. it/1385, it/1387) but present on older ones — generator inconsistency | newest articles | Low |
| W4 | Breadcrumb "ホーム" points to `/share` on guide pages vs `/` on articles | 24 guide pages | Medium |
| W5 | WebSite node lacks `@id`; duplicated inline on CollectionPage `isPartOf` | sitewide | Low |
| W6 | Organization logo is the OG banner, not a logo asset | sitewide | Medium |
| W7 | FAQPage ineligible for rich results (non-gov/health site) | 5 pages | Medium |
| W8 | Category pages have no BreadcrumbList (articles' crumbs link to them, so trail breaks at level 2) | 8 pages | Medium |

## 3. Missing Opportunities & Recommendations

### 3.1 Keep `Article` — do NOT switch to NewsArticle
Content is evergreen transcripts and commentary, not time-sensitive reporting. `Article` is the correct type. `speakable` is already implemented — ahead of the curve for a transcript site.

### 3.2 Transcript provenance: `isBasedOn`, `about`, `mentions` (highest-value addition)
A transcript archive's core entity value is *who said it and where*. Add to the Article node:

```json
{
  "@type": "Article",
  "isBasedOn": "https://www.youtube.com/watch?v=SOURCE_VIDEO_ID",
  "about": {
    "@type": "Person",
    "name": "シェリル・サンドバーグ",
    "sameAs": [
      "https://ja.wikipedia.org/wiki/シェリル・サンドバーグ",
      "https://www.wikidata.org/wiki/Q230867"
    ]
  },
  "mentions": [
    { "@type": "Organization", "name": "Facebook", "sameAs": "https://www.wikidata.org/wiki/Q380" }
  ]
}
```
The D1 posts table likely already stores speaker/source metadata from the WP migration; emit it when present. This strengthens entity association for "<speaker name> スピーチ 書き起こし" queries and LLM/AI-overview retrieval.

### 3.3 VideoObject — N/A today, ready when needed
0 of 59 indexable articles embed video (verified by regex over raw HTML). Do not add VideoObject now. If source videos are ever re-embedded, add per article:

```json
{
  "@context": "https://schema.org",
  "@type": "VideoObject",
  "name": "講演タイトル",
  "description": "講演の概要",
  "thumbnailUrl": "https://i.ytimg.com/vi/VIDEO_ID/hqdefault.jpg",
  "uploadDate": "2016-05-14T00:00:00+09:00",
  "embedUrl": "https://www.youtube.com/embed/VIDEO_ID",
  "hasPart": {
    "@type": "Clip",
    "name": "質疑応答",
    "startOffset": 1230,
    "endOffset": 1530,
    "url": "https://www.youtube.com/watch?v=VIDEO_ID&t=1230"
  }
}
```
A transcript page paired with its timestamped video is a strong Clip/SeekToAction candidate.

### 3.4 BreadcrumbList for the 8 category pages (W8)

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "ホーム", "item": "https://kakiokosi.com/" },
    { "@type": "ListItem", "position": 2, "name": "IT" }
  ]
}
```

### 3.5 Single-graph refactor with stable @ids (fixes W1 + W5)
Emit one block per page:

```json
{
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "WebSite", "@id": "https://kakiokosi.com/#website",
      "name": "書き起こし.com", "url": "https://kakiokosi.com", "inLanguage": "ja",
      "publisher": { "@id": "https://kakiokosi.com/#organization" } },
    { "@type": "Organization", "@id": "https://kakiokosi.com/#organization",
      "name": "書き起こし.com", "url": "https://kakiokosi.com",
      "logo": { "@type": "ImageObject", "url": "https://kakiokosi.com/images/logo-square-600.png", "width": 600, "height": 600 } },
    { "@type": "Article", "...": "existing article props",
      "isPartOf": { "@id": "https://kakiokosi.com/#website" },
      "publisher": { "@id": "https://kakiokosi.com/#organization" } },
    { "@type": "BreadcrumbList", "...": "existing crumbs" }
  ]
}
```

### 3.6 Article image variants (W2)
For each article emit three crops (and replace the shared default-og.png with per-article images on new IT drafts):

```json
"image": [
  "https://kakiokosi.com/images/articles/1385-16x9.png",
  "https://kakiokosi.com/images/articles/1385-4x3.png",
  "https://kakiokosi.com/images/articles/1385-1x1.png"
]
```

### 3.7 Do NOT add
- **HowTo** on guide pages (`/share/gijiroku`, `/share/tapeokoshi`, etc.) — rich results removed Sept 2023.
- **FAQPage** anywhere new — restricted to gov/health since Aug 2023 (and remove existing per W7).
- **SearchAction** — sitelinks search box retired Nov 2024.

### 3.8 Optional: upgrade guide pages from WebPage to Article
Long-form guides (`/share/gijiroku`, `/share/mojikoshi-tool`, `/share/ted-talks`, etc.) currently carry bare WebPage. Emitting Article (with author/publisher/dates, same template as posts) gives them the same E-E-A-T signals. Keep WebPage/AboutPage/ContactPage for legal/contact/company pages.

---

## 4. Score

**Schema score: 82/100**

Deductions: FAQPage ineligibility (-4), placeholder/single-ratio article images (-4), breadcrumb home inconsistency (-3), category pages missing breadcrumbs (-2), logo-as-OG-banner (-2), cross-block @id / duplicate WebSite node (-2), generator field inconsistency (-1).
Strengths: 100% JSON-LD, zero parse errors, full required+recommended Article coverage incl. speakable, correct type choices (Article not NewsArticle, no deprecated types in use), https context, absolute URLs, ISO 8601 throughout, no placeholder text.
