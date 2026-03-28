# Visual & Mobile Rendering Audit - kakiokosi.com

**Date:** 2026-03-28
**Pages Tested:**
- Homepage: https://kakiokosi.com
- Article: https://kakiokosi.com/share/society/936

**Viewports Tested:** Desktop (1920x1080), Laptop (1366x768), Tablet (768x1024), Mobile (375x812)

---

## 1. Desktop Homepage Rendering

**Status: Good**

- Clean, editorial-style layout with a dark navy header/footer and off-white content area
- Navigation bar displays all 6 category links (Business, Politics, Society, Foreign, IT, Entertainment) in a single horizontal row
- The "Archives" H1 heading is prominent and uses a serif font (editorial style)
- Two-column grid layout for post cards below the featured post
- Featured post (TED Talks) is displayed prominently with a "READ THE TRANSCRIPT" CTA
- No horizontal overflow detected
- Font stack: "Noto Sans JP", "Work Sans", system sans-serif -- appropriate for Japanese content
- Base font size: 16px, line-height: 24px (1.5 ratio) -- good readability

**Issues Found:**
- The homepage H1 says "Archives" which is generic and not SEO-friendly; a descriptive site heading would be stronger
- No hero image or visual element above the fold -- the page is entirely text-based
- Post cards have no thumbnails or images, which reduces visual engagement
- Large whitespace gaps between the section heading area and the first post cards

---

## 2. Mobile Homepage Rendering

**Status: Acceptable with Issues**

- Single-column layout adapts correctly on 375px width
- No horizontal scroll detected
- Viewport meta tag correctly set: `width=device-width, initial-scale=1`
- H1 "Archives" is visible above the fold
- Font size remains 16px -- readable without zooming

**Issues Found:**
- **No hamburger menu:** Navigation links are displayed inline even on mobile. On the tablet view (768px), the nav wraps to two lines, causing the site title and nav links to overlap. On mobile (375px), the nav links disappear entirely from view -- they are not in the mobile above-the-fold screenshot. This is a significant usability issue.
- **9 out of 36 interactive elements have touch targets below 44x44px.** This violates Google's mobile usability guidelines (minimum 48x48px recommended, 44x44px minimum).
- Excessive vertical spacing between post entries wastes valuable mobile screen real estate
- Only 2 post titles are visible above the fold on mobile; improving density could increase engagement

---

## 3. Desktop Article Page Rendering

**Status: Good**

- Clean two-column layout: main content (left) + sidebar (right)
- Sidebar contains category widget and newsletter signup form
- Breadcrumb navigation present at the top (Home > Category > Article)
- H1 title renders at 60px -- large and readable
- Featured image loads correctly below the title
- Content width constrained to 1280px max -- appropriate for readability
- Article body text is well-spaced with clear paragraph separation

**Issues Found:**
- H1 at 60px may be excessively large for desktop -- 36-48px would be more standard for article titles
- The breadcrumb renders as plain text links without structured visual formatting
- Newsletter CTA in sidebar is small and may be missed by users

---

## 4. Mobile Article Page Rendering

**Status: Acceptable with Issues**

- Content properly stacks into a single column
- Featured image scales responsively to the full width
- H1 renders at 36px on mobile -- appropriate size
- Body text at 16px with 24px line-height -- good readability
- No horizontal overflow or elements breaking out of the viewport
- No overflowing elements detected

**Issues Found:**
- **Breadcrumb layout is broken on mobile.** The breadcrumb items are arranged in a confusing layout where path segments wrap oddly (the text wraps with "/", causing "Home" and category names to be misaligned)
- The sidebar content (category widget, newsletter) is pushed far below the article -- users may never see it
- No sticky navigation or back-to-top button for the long article content
- No table of contents or progress indicator for long-form content

---

## 5. Above-the-Fold Content Analysis

### Homepage (Desktop 1920x1080)
| Element | Visible | Notes |
|---------|---------|-------|
| Site title | Yes | "書き起こし.com" in top-left |
| Navigation | Yes | Full horizontal nav bar |
| H1 heading | Yes | "Archives" -- generic title |
| Featured post | Yes | TED Talks title visible |
| CTA | Yes | "READ THE TRANSCRIPT" link |
| Post grid | Partially | Top 2 cards visible |

### Homepage (Mobile 375x812)
| Element | Visible | Notes |
|---------|---------|-------|
| Site title | Yes | Rendered correctly |
| Navigation | Hidden | Nav links not visible on mobile |
| H1 heading | Yes | "Archives" visible |
| Featured post | Yes | Title visible but takes most of viewport |
| CTA | Yes | "READ THE TRANSCRIPT" visible |

### Article (Desktop 1920x1080)
| Element | Visible | Notes |
|---------|---------|-------|
| Breadcrumb | Yes | Path navigation at top |
| H1 title | Yes | Full title visible |
| Featured image | Yes | Loaded correctly |
| Article intro | Partially | First paragraph visible |
| Sidebar | Yes | Category + Newsletter |

### Article (Mobile 375x812)
| Element | Visible | Notes |
|---------|---------|-------|
| Breadcrumb | Yes | Layout broken/awkward |
| H1 title | Yes | Full title visible |
| Featured image | Yes | Responsive scaling |
| Article intro | No | Below the fold |

---

## 6. Mobile Usability Issues (Prioritized)

### Critical
1. **Missing mobile navigation (hamburger menu):** On mobile viewports, category navigation links are either hidden or extremely hard to access. There is no hamburger menu toggle. Users cannot browse by category on mobile.

2. **Small touch targets:** 25% of interactive elements (9 out of 36) are smaller than the recommended 44x44px minimum. This impacts tappability on touch devices.

### High
3. **Tablet nav wrapping (768px):** At 768px width, navigation links wrap to a second line and the site title overlaps with nav links, creating a messy header.

4. **Breadcrumb layout broken on mobile article pages:** Path segments wrap in a confusing manner with misaligned text.

### Medium
5. **No sticky header or mobile-friendly navigation pattern:** Long articles have no way to navigate back or access the menu without scrolling to the top.

6. **Excessive whitespace on mobile homepage:** Large gaps between post entries reduce content density and require excessive scrolling.

7. **No "scroll to top" button:** Long articles on mobile require extensive scrolling with no shortcut back.

---

## 7. Font Rendering, Spacing & Readability

### Fonts
- **Primary fonts:** "Noto Sans JP" + "Work Sans" -- excellent choice for Japanese/English bilingual content
- **Fallbacks:** ui-sans-serif, system-ui, sans-serif -- appropriate
- **Base size:** 16px -- meets accessibility standards
- **Line height:** 24px (1.5x) -- good for body text readability

### Headings
- **H1 (Desktop homepage):** Large serif "Archives" heading -- visually striking but generic
- **H1 (Desktop article):** 60px -- oversized, may cause visual imbalance
- **H1 (Mobile article):** 36px -- appropriate for mobile

### Spacing Assessment
- Body text paragraph spacing is adequate
- Post card spacing on desktop uses generous whitespace (editorial feel)
- Post card spacing on mobile is too generous, reducing content density
- Article body text has good paragraph separation

### Readability Score
- **Desktop:** Good. Content width is constrained, font sizes are appropriate, line lengths are manageable
- **Mobile:** Good. 16px base font with 1.5 line-height is readable without zooming
- **Contrast:** Dark text (#1a1a2e range) on light background (#f5f0e8 range) -- appears to meet WCAG AA standards

---

## 8. Summary of Findings

### What Works Well
- Clean editorial design with consistent typography
- Responsive single-column stacking on mobile
- No horizontal overflow at any viewport
- Proper viewport meta tag
- Good font choices for Japanese content (Noto Sans JP)
- Adequate base font size (16px) and line-height (1.5)
- Article page has sidebar with useful widgets (categories, newsletter)
- Featured images scale properly on mobile

### What Needs Improvement

| Priority | Issue | Impact |
|----------|-------|--------|
| Critical | No hamburger menu on mobile | Users cannot navigate categories on mobile |
| Critical | Small touch targets (9 elements) | Poor mobile tappability, Google penalty risk |
| High | Tablet nav wrapping/overlap at 768px | Broken header layout |
| High | Mobile breadcrumb layout broken | Confusing navigation path display |
| Medium | H1 "Archives" is generic | Weak SEO signal for homepage |
| Medium | Desktop article H1 at 60px too large | Visual imbalance |
| Medium | No back-to-top or sticky nav | Poor UX on long articles |
| Low | No post thumbnails on homepage | Reduced visual engagement |
| Low | Excessive mobile whitespace | Reduced content density |

---

## Screenshots Reference

All screenshots saved to `/Users/hajimeataka/kakiokosi/screenshots/`:

| File | Description |
|------|-------------|
| `homepage-desktop-1920.png` | Homepage at 1920x1080 (above fold) |
| `homepage-desktop-full.png` | Homepage at 1920x1080 (full page) |
| `homepage-laptop-1366.png` | Homepage at 1366x768 (above fold) |
| `homepage-tablet-768.png` | Homepage at 768x1024 (above fold) |
| `homepage-mobile-375.png` | Homepage at 375x812 (above fold) |
| `homepage-mobile-full.png` | Homepage at 375x812 (full page) |
| `article-desktop-1920.png` | Article at 1920x1080 (above fold) |
| `article-desktop-full.png` | Article at 1920x1080 (full page) |
| `article-mobile-375.png` | Article at 375x812 (above fold) |
| `article-mobile-full.png` | Article at 375x812 (full page) |
