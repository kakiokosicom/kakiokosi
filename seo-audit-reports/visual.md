# Visual / Mobile Rendering Audit — kakiokosi.com

Date: 2026-06-11
Tool: Playwright 1.59.1 (Chromium), screenshots in `/Users/hajimeataka/kakiokosi/screenshots/`
Raw metrics JSON: `/tmp/seo-audit-kakiokosi/audit2-metrics.json`
Capture script: `/Users/hajimeataka/kakiokosi/scripts/audit2_capture.mjs`

Viewports: Desktop 1920x1080, Mobile 375x812 (iPhone UA, DPR 3, touch enabled).
Each page captured at `load` and again at +3s (`*-plus3s.png`) for layout-shift comparison; CLS measured via PerformanceObserver (buffered).

---

## 1. Homepage — Desktop 1920x1080
Screenshot: `audit2-home-desktop.png` (+3s: `audit2-home-desktop-plus3s.png`)

- H1 「書き起こし記事一覧」 at y=154–214, 60px serif — visible immediately. Value-proposition paragraph (163本以上のアーカイブ…) directly below. Good.
- No horizontal overflow (scrollWidth 1920 = innerWidth 1920). CLS 0.0017 (excellent). Load vs +3s screenshots byte-identical.
- **[MEDIUM] Sparse / empty-feeling layout at 1920px.** Article cards are large flat navy rectangles with no thumbnail imagery (`document.images` is empty — zero `<img>` on the page). The first card occupies a huge dark block with only small text in the corner, and the title is duplicated in the adjacent text column. Lots of unused whitespace right of ~1280px.
- **[LOW] Desktop header nav links are small targets**: 7 links at 28px height (IT link only 20x28). Minor on desktop (mouse), but they appear to be the same component used near breakpoints.
- No hero CTA (archive site — acceptable; primary action is reading articles, and cards are above the fold).

## 2. Homepage — Mobile 375x812
Screenshot: `audit2-home-mobile.png` (+3s identical)

- Above-the-fold: site logo + hamburger (sticky-style header ~64px), category badge 「書き起こしアーカイブ」, H1 at y=162–202 (36px), full value-prop paragraph, and the start of the first article card. **Excellent content-to-chrome ratio** — header chrome is only ~8% of viewport.
- H1 + value proposition fully visible without scrolling. First content card enters at ~y=410.
- No horizontal overflow (375/375). CLS 0.0000.
- Fonts: body/p 16px, line-height 26px — Japanese text comfortably legible, no zoom needed. Serif (明朝系) headings render crisply at DPR 3.
- **[LOW] Hamburger button is 40x40px** — below the 44–48px recommended minimum, though padding may extend the effective hit area slightly.
- **[LOW] Logo link 182x32px** (height under 44px).
- No images at all — page is pure text/CSS cards. No broken or mis-scaled image risk, but also no visual anchor.

## 3. Article page /share/it/1388 — Mobile 375x812
Screenshot: `audit2-article-mobile.png` (+3s identical)

- **[HIGH] Breadcrumb bug: 「ホーム」 renders vertically** (one character per line: ホ/ー/ム), squeezed to 14px wide x 60px tall. Visible at top-left of the screenshot. Cause confirmed in code — `app/routes/share.$category.$id.tsx:189-190`: the breadcrumb `<ol>` is `flex items-center gap-2` and the long truncated title `<li>` (`truncate max-w-xs`) pushes siblings; the 「ホーム」/category `<li>`s have no `shrink-0` / `whitespace-nowrap`, so flexbox compresses them and CJK text wraps per character. Affects **every article page** (this is the shared article route). Fix: add `shrink-0 whitespace-nowrap` to the first two `<li>` elements (and `min-w-0` on the truncating item).
- **[MEDIUM] Tap targets too small in article header**:
  - Category link 「IT」: 13x20px (breadcrumb) — far below 44px minimum.
  - Author link 「書き起こし.com（編集部）」: 149x14px height.
  - Vertical 「ホーム」 link: 14px wide — practically untappable.
- Above-the-fold: chrome (header + breadcrumb + meta row) consumes ~280px (~35% of viewport); H1 spans y=284–450 — **H1 visible without scroll**, plus ~3 lines of the lead summary box. Acceptable, but the broken breadcrumb wastes 2 lines of that space.
- **[LOW] H1 wraps to 5 lines** (36px font with full-width brackets 「」 and em-dashes); line starts with opening brackets look slightly ragged. Cosmetic; consider 30–32px for article H1 on mobile or `text-wrap: balance`.
- Body text 18px / line-height 28px — very good Japanese legibility. Summary blockquote in italic serif is readable.
- No horizontal overflow (375/375). CLS 0.0000. No images (no eyecatch/hero on articles).

## 4. Guide page /share/kakiokoshi-toha — Mobile 375x812
Screenshot: `audit2-guide-mobile.png` (+3s identical)

- Above-the-fold: H1 at y=120–280 (36px, 4 lines), first H2 「書き起こし（文字起こし）とは」, and two full definition paragraphs visible. **Best above-fold content density of the audited pages** — user gets the answer to the query without scrolling.
- Body 16px / line-height 32px (2.0) — excellent readability for explanatory Japanese text.
- No breadcrumb on this template, so the vertical-text bug does not appear here.
- No horizontal overflow. CLS 0.0000. No images.
- Only small targets are the shared header logo (182x32) and hamburger (40x40).
- No CTA above the fold (e.g., link to archive/category) — guide page is purely informational; an internal-link CTA after the intro could help circulation, but not a rendering issue.

---

## Cross-page summary

| Check | Result |
|---|---|
| Horizontal overflow (scrollWidth vs innerWidth) | None on any page (375=375, 1920=1920) |
| CLS / layout shift | 0.0000–0.0017; load vs +3s screenshots byte-identical on all 4 pages |
| Viewport meta | `width=device-width, initial-scale=1` everywhere — correct |
| Base font | 16px body, 16–18px paragraphs, line-height 26–32px — passes legibility |
| H1 above fold on mobile | Yes on all 3 mobile pages |
| Images | Zero `<img>` elements on all audited pages — nothing broken, but no thumbnails/eyecatch |
| Mobile nav | Hamburger present and visible (40x40, slightly undersized) |

## Issues by severity

1. **HIGH — Breadcrumb 「ホーム」 collapses to vertical per-character text** on all article pages (`share.$category.$id.tsx:189-196`, flex shrink on CJK). Looks broken in the most visible above-fold area. Screenshot: `audit2-article-mobile.png`.
2. **MEDIUM — Sub-44px tap targets** on article pages: breadcrumb links (13–14px wide), author link (14px tall); sitewide: hamburger 40x40, logo 32px tall, desktop nav links 28px tall.
3. **MEDIUM — Imageless card design makes desktop homepage feel empty** at 1920px; large flat navy blocks with duplicated titles; no OGP-style eyecatch anywhere. Screenshot: `audit2-home-desktop.png`.
4. **LOW — Article H1 wraps to 5 lines** at 36px on 375px viewport; consider smaller mobile size or `text-wrap: balance`.
5. **LOW — No above-fold CTA on guide page** (informational; internal-link CTA opportunity, not a defect).

## Score

**Visual/Mobile: 82/100.** Fundamentals are strong (no overflow, zero CLS, correct viewport, legible typography, H1 always above fold); deductions for the broken breadcrumb on every article page (-8), undersized tap targets (-6), and sparse imageless desktop presentation (-4).

## Screenshot index

- `/Users/hajimeataka/kakiokosi/screenshots/audit2-home-desktop.png` (+ `-plus3s`)
- `/Users/hajimeataka/kakiokosi/screenshots/audit2-home-mobile.png` (+ `-plus3s`)
- `/Users/hajimeataka/kakiokosi/screenshots/audit2-article-mobile.png` (+ `-plus3s`)
- `/Users/hajimeataka/kakiokosi/screenshots/audit2-guide-mobile.png` (+ `-plus3s`)
