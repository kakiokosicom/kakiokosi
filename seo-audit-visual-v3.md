# Visual Rendering Audit v3 -- kakiokosi.com

**Date:** 2026-03-28
**Screenshots:** `/Users/hajimeataka/kakiokosi/screenshots-v3/`

---

## 1. Homepage -- Desktop (1920x1080)

**Screenshot:** `homepage-desktop.png`

### Above-the-Fold Content
- **H1 "書き起こし記事一覧"** -- PASS. Visible above the fold, large bold serif font, visually prominent.
- **Intro text** -- PASS. Paragraph reads: "講演・インタビュー・スピーチの書き起こし記事を掲載しています。ビジネス、政治、社会、IT、エンターテイメントなど幅広いジャンルのトークを文字で読むことができます。"
- **Category labels in Japanese** -- PASS. Navigation bar shows all 6 categories: ビジネス, 政治, 社会, 海外, IT, エンタメ
- **First article card** -- PASS. Featured article card with thumbnail image visible above the fold.
- **Layout** -- Clean two-column layout for article cards below the hero section. No overlapping elements.

### Issues
- None observed. Layout is clean and well-structured.

---

## 2. Homepage -- Mobile (375x812)

**Screenshot:** `homepage-mobile.png`

### Above-the-Fold Content
- **H1 "書き起こし記事一覧"** -- PASS. Visible, appropriately sized for mobile.
- **Intro text** -- PASS. Readable, properly wrapping within viewport.
- **Category badge** -- "書き起こしアーカイブ" label visible above the H1.
- **First article card** -- Partially visible; the category tag "社会" and date "2017/7/19" appear along with the article title.

### Mobile Responsiveness
- **No horizontal scroll** -- PASS.
- **Text readable without zooming** -- PASS. Base font appears 16px or larger.
- **Single-column layout** -- PASS. Cards stack vertically.

### Issues
- None observed.

---

## 3. Mobile Hamburger Menu

**Screenshot:** `homepage-mobile-menu-opened.png`

- **Hamburger button** -- PASS. Visible in top-right corner of mobile header.
- **Menu opens** -- PASS. Full-screen overlay with close (X) button.
- **All 6 category links displayed:** ビジネス, 政治, 社会, 海外, IT, エンタメ
- **Touch targets** -- PASS. Each menu item is displayed as a large block with generous spacing (~70px+ per item), well exceeding 48x48px minimum.
- **Close button** -- PASS. X icon in top-right corner, adequate size.

### Issues
- None observed. Menu is clean and functional.

---

## 4. Article Page -- Desktop (1920x1080)

**Screenshot:** `article-desktop.png`, `article-desktop-full.png`

**Test URL:** `/share/society/936` -- "【TED Talks】"ママ抱っこしてよ"闇の中でもがく子供たち（登丸賢美）"

### Content Structure
- **H1** -- PASS. Article title displayed prominently.
- **Breadcrumbs** -- PASS. "ホーム > 社会" navigation path visible.
- **Category tag** -- "社会" category displayed with "SOCIETY" English label.
- **Date info** -- PASS. "2017/7/19" original date + "更新: 2026/3/28" update date shown.
- **Author byline** -- PASS. "文字起こし: 書き起こし.com編集部" displayed.
- **Editorial note (blockquote)** -- PASS. "【編集部注・2026年3月更新】" prominently displayed in a styled blockquote before the article body.
- **Editorial addendum** -- PASS. "【2026年3月 編集部追記】" appears at the end of the article with updated statistics.
- **Sidebar** -- PASS. Right sidebar contains "カテゴリ" and "書き起こし.comとは" widget.
- **Tags** -- PASS. Article tags displayed: TED, TED Talks, プレゼンテーション, 児童虐待, etc.
- **Related articles** -- PASS. "関連する書き起こし記事" section with 4 related article links at the bottom.

### Issues
- None observed.

---

## 5. Article Page -- Mobile (375x812)

**Screenshot:** `article-mobile.png`, `article-mobile-full.png`

### Content Structure
- **H1** -- PASS. Title wraps naturally, readable.
- **Breadcrumbs** -- PASS. "ホ... 社会" abbreviated but functional.
- **Byline** -- PASS. "文字起こし: 書き起こし.com編集部" visible.
- **Date** -- PASS. Both original and update dates displayed.
- **Hero image** -- PASS. Full-width, properly scaled.
- **Text readability** -- PASS. Body text is appropriately sized for mobile.

### Issues
- Breadcrumb text appears truncated ("ホ..." for "ホーム"). This is minor but could benefit from showing the full word or using a home icon.

---

## 6. Footer -- Desktop and Mobile

### Desktop (`footer-desktop.png`)
- **Site name** -- "書き起こし.com" prominently centered.
- **6 links in Japanese** -- PASS. All present in a single row:
  1. サイトについて (/share/about)
  2. 利用規約 (/share/tos)
  3. プライバシーポリシー (/share/privacy)
  4. お問い合わせ (/share/contact)
  5. 運営情報 (/share/company)
  6. 特定商取引法 (/share/regal)
- **Copyright** -- "(c) 2011-2026 書き起こし.COM. ALL RIGHTS RESERVED."
- **Dark navy background** with white text. Clean and professional.

### Mobile (`footer-mobile.png`)
- **6 links** -- PASS. Arranged in a 2-column grid:
  - Row 1: サイトについて | 利用規約
  - Row 2: プライバシーポリシー | お問い合わせ
  - Row 3: 運営情報 | 特定商取引法
- **Touch targets** -- PASS. Links are well-spaced.
- **Pagination** -- PASS. Page numbers (1, 2, 3, ..., 8) with "次へ" button visible above footer.
- **Copyright** -- PASS. Same as desktop.

### Issues
- None observed.

---

## 7. Visual Regression Check (from Latest Changes)

Comparing against the latest commits (rewrite of about/tos/privacy/contact pages, design sync, editorial intelligence design system):

| Check | Status | Notes |
|-------|--------|-------|
| Header navigation | PASS | All 6 category links render correctly in Japanese |
| Homepage card layout | PASS | Two-column grid on desktop, single column on mobile |
| Article editorial notes | PASS | Blockquote styling for editorial notes works correctly |
| Sidebar widgets | PASS | "カテゴリ" and "書き起こし.comとは" render correctly |
| Footer 6 links | PASS | All links present with correct Japanese text and paths |
| Pagination | PASS | Numbered pagination with "次へ" button functional |
| Typography | PASS | Serif headings, clean body text, consistent font sizing |
| Color scheme | PASS | Dark navy (#1a1a2e-like) for header/footer, white content area |
| Images | PASS | Article thumbnails loading correctly, proper aspect ratios |
| Mobile responsiveness | PASS | No horizontal scroll, proper stacking, readable text |

### Potential Concerns
1. **Footer link path typo:** The "特定商取引法" link points to `/share/regal` -- this may be a typo for `/share/legal`. Worth verifying the intended path.
2. **Breadcrumb truncation on mobile:** "ホーム" is cut to "ホ..." on narrow viewports. Consider using a home icon instead.

---

## Summary

| Area | Score |
|------|-------|
| Homepage desktop | PASS |
| Homepage mobile | PASS |
| Article desktop | PASS |
| Article mobile | PASS |
| Hamburger menu | PASS |
| Footer (6 links) | PASS |
| Visual regressions | NONE DETECTED |

**Overall:** The site renders cleanly across desktop and mobile viewports. All Japanese content displays correctly, the editorial design system is visually consistent, and the mobile experience is well-optimized with proper touch targets and no layout issues.

**Action items:**
1. Verify `/share/regal` path -- likely should be `/share/legal` for the specified commercial transactions page.
2. Consider improving breadcrumb display on mobile to avoid truncation.

---

## Screenshot Inventory

| File | Description |
|------|-------------|
| `homepage-desktop.png` | Homepage above-the-fold, 1920x1080 |
| `homepage-desktop-full.png` | Homepage full page, 1920x1080 |
| `homepage-desktop-bottom.png` | Homepage bottom with footer, 1920x1080 |
| `homepage-mobile.png` | Homepage above-the-fold, 375x812 |
| `homepage-mobile-full.png` | Homepage full page, 375x812 |
| `homepage-mobile-menu-opened.png` | Mobile hamburger menu expanded |
| `article-desktop.png` | Article above-the-fold, 1920x1080 |
| `article-desktop-full.png` | Article full page, 1920x1080 |
| `article-desktop-bottom.png` | Article bottom with related articles, 1920x1080 |
| `article-mobile.png` | Article above-the-fold, 375x812 |
| `article-mobile-full.png` | Article full page, 375x812 |
| `footer-desktop.png` | Footer isolated, desktop |
| `footer-mobile.png` | Footer with pagination, mobile |
