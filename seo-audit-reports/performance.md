# Core Web Vitals / Performance Audit — kakiokosi.com

Date: 2026-06-11
Stack: React Router v7 SSR on Cloudflare Pages (D1/R2)
Method: Lab measurements only (no CrUX API key — field data unavailable; site likely below CrUX traffic threshold anyway).

- **Playwright 1.59.1** (global), Chromium, Moto G4 mobile emulation, **4x CPU throttle via CDP** (`Emulation.setCPUThrottlingRate`). **No network throttling** — measured on fast local connection, so LCP/FCP are best-case; field values on 4G will be higher.
- PerformanceObserver injection (`largest-contentful-paint`, `layout-shift`, `longtask`, buffered) via `addInitScript`.
- TTFB distribution from crawler `ms` field across 498 pages (single location, local crawler — not a field distribution).

Raw data: `/tmp/seo-audit-kakiokosi/cwv-results.json`, script: `/tmp/seo-audit-kakiokosi/measure-cwv.mjs`

---

## 1. Estimated Performance Score: **85 / 100** (mobile, lab-based estimate)

Strong server + zero CLS + small DOM, held back by a 1.0–1.6 MB web-font payload, render-blocking third-party font CSS, and ~500–700 ms of hydration long tasks.

## 2. Core Web Vitals vs Thresholds

| Metric | Threshold (good) | Homepage | Article (/share/it/1388) | Guide (/share/kakiokoshi-toha) | Status |
|---|---|---|---|---|---|
| LCP | ≤ 2,500 ms | **552 ms** | **660 ms** | **1,140 ms** | PASS (lab; no net throttle — field est. 1.5–2.5 s on 4G) |
| CLS | ≤ 0.1 | **0.000** | **0.000** | **0.000** | PASS |
| INP | ≤ 200 ms | n/a (lab proxy: long tasks, see §5) | | | MODERATE RISK |
| TTFB | ≤ 800 ms | 136 ms | 165 ms | 189 ms | PASS |

LCP elements (all text — no hero images exist; cards are CSS gradients + emoji):
- Homepage: `<p>` intro paragraph (69.8 KB render size), 552 ms
- Article: `<h1>` title, 660 ms
- Guide: `<p>` lead paragraph, **1,140 ms — LCP re-fired on web-font swap** (FCP was 560 ms). The Noto Serif/Sans JP swap doubles effective LCP on text-LCP pages.

Other lab timings: FCP 552/660/560 ms · DCL 545/656/558 ms · load 1,135–1,161 ms · DOM nodes 348/177/150 (excellent, far below 1,500).

## 3. TTFB Distribution (498 pages, status 200, crawler-local single location)

| min | p25 | p50 | p75 | p90 | p95 | p99 | max | mean |
|---|---|---|---|---|---|---|---|---|
| 96 ms | 138 ms | **168 ms** | 248 ms | **363 ms** | 440 ms | 1,125 ms | 1,276 ms | 221 ms |

- Only 1.4% of pages > 800 ms, 3.2% > 500 ms. p75 = 248 ms — comfortably passes.
- The p99 tail (>1.1 s) is likely D1 cold queries / uncached SSR renders; not a priority.
- Cloudflare edge SSR is doing its job. TTFB is NOT the bottleneck.

## 4. Resource Breakdown (per page load, mobile)

| Type | Files | Transfer (compressed) | Decoded | Notes |
|---|---|---|---|---|
| HTML doc | 1 | 8.6–12 KB | 28–57 KB | SSR, fully rendered — good |
| JS | 8–10 | **~112–115 KB** | 335–347 KB | RR7 hydration bundles, all modulepreloaded |
| First-party CSS | 1 | 9 KB | 41 KB | `root-*.css` (Tailwind), render-blocking 42–199 ms |
| Google Fonts CSS | 1 | **119 KB** | 453 KB | **render-blocking**, third-party, 150–278 ms |
| Font files (woff2) | **48–73** | — | **1.07–1.60 MB** | fonts.gstatic.com, unicode-range JP slices |
| Images | 0 | 0 | 0 | No `<img>` on any tested page (CSS-gradient cards) |
| ahrefs analytics | 1 | 7 KB | — | `async` — correctly non-blocking |

**Fonts are 75–80% of total page weight.** 3 families / 7 weights are loaded: Noto Serif JP 700+900, Noto Sans JP 400+700, Work Sans 400+600+700. Japanese Noto fonts ship as ~70–100 unicode-range slices per weight; the browser fetched 48–73 slice files (505 FontFace entries registered). `display=swap` is set (good — no FOIT, explains CLS 0 in lab, but causes the LCP re-fire on the guide page and swap-flash in the field).

### Static HTML analysis (homepage.html)

- Render-blocking in `<head>`: `root-03T97xZn.css` + `fonts.googleapis.com/css2?...&display=swap` stylesheet. No inline critical CSS.
- `preconnect` to fonts.googleapis.com + fonts.gstatic.com (crossorigin): present — good, but only mitigates, doesn't remove, the blocking CSS round trip.
- 9× `modulepreload` for hydration chunks: good.
- No `rel=preload` for fonts (impractical anyway with unicode-range slicing — another argument for self-hosted subsets).
- ahrefs `analytics.js` is `async` in head: acceptable; could add `preconnect`/move to body but impact is minimal (7 KB).
- No images → no width/height/loading-attr issues, no fetchpriority needed.
- Inline scripts: AI-bot UA sniffer (trivial), scroll-restoration, RR7 stream context — all small.
- CSP `upgrade-insecure-requests` only via meta — fine for perf.

## 5. INP Risk Assessment (lab proxy, 4x CPU throttle)

| Page | Long tasks | Total blocking | Max single task |
|---|---|---|---|
| Homepage | 6 | 702 ms | **200 ms** |
| Article | 6 | 521 ms | 171 ms |
| Guide | 4 | 395 ms | 172 ms |

- ~112 KB compressed (~340 KB parsed) JS is moderate; all long tasks occur during initial hydration window (~first 1–2 s). A tap landing inside hydration on a low-end device could produce a 200–400 ms interaction → **moderate INP risk**, but post-hydration the app is a mostly-static content site with trivial handlers.
- Verdict: INP probably passes at p75 in the field (~100–200 ms), but the 200 ms max task at 4x throttle leaves little headroom on genuinely slow Androids.

## 6. Prioritized Recommendations

1. **HIGH — Self-host subsetted fonts and cut weights (impact: −0.8–1.2 MB payload, removes 119 KB render-blocking third-party CSS, fixes LCP font-swap re-fire).**
   - Drop to ≤4 weights total (e.g., Noto Serif JP 900, Noto Sans JP 400+700, Work Sans 600 — or replace Work Sans with system-ui; it's only used for labels).
   - Self-host via `@fontsource` or pyftsubset-generated JP subsets on the same origin (R2/Pages assets), inline the `@font-face` CSS into `root-*.css`, `preload` the 1–2 critical subset files, keep `font-display: swap` (or `optional` for the serif display face to kill the swap entirely).
   - Eliminates the fonts.googleapis.com blocking request + DNS/TLS round trips entirely.
2. **MEDIUM — Remove render-blocking CSS round trips for first render.**
   - If fonts stay on Google: load the fonts CSS asynchronously (`media="print" onload="media='all'"` pattern or inline the css2 response at build time). First-party `root.css` is only 9 KB compressed — consider inlining it for a zero-request first paint (HTML would go ~12 → ~21 KB).
3. **MEDIUM — Trim hydration cost to protect INP.**
   - This is an almost fully static content site; audit whether article/guide routes need hydration at all (RR7 supports per-route hydration opt-out patterns / `clientLoader`-free static routes). Even halving the 340 KB parsed JS would cut the ~700 ms long-task total proportionally.
4. **LOW — TTFB tail.** Add Cloudflare cache rules / `Cache-Control: s-maxage` + stale-while-revalidate on SSR HTML for anonymous traffic to flatten the p99 (1.1 s) cold-render tail.
5. **LOW — ahrefs analytics:** add `<link rel="preconnect" href="https://analytics.ahrefs.com">` or move the tag to end of body; minor.

## 7. Caveats

- No CrUX field data (no API key; verify at https://cruxvis.withgoogle.com or PSI once available).
- Lab runs had no network throttling — LCP/FCP shown are best-case. The relative bottleneck ranking (fonts ≫ JS > CSS) holds under throttling and would widen.
- CLS 0.000 in lab; field CLS risk is essentially limited to font swap on slow connections — mitigated by recommendation #1.
