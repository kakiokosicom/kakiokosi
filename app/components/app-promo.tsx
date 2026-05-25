/**
 * Simple Memo Fast — inline app promo. Embedded only into articles whose
 * topic is genuinely relevant. There is **no automatic site-wide placement**:
 * GSC flagged the prior 143× "SPONSORED" pattern as unnatural, so the promo
 * is now opt-in per article via an HTML marker.
 *
 * Usage — drop this inside the article body in `posts.content`:
 *
 *   <!-- promo:simplememofast -->
 *
 * `formatArticleContent` (app/lib/format-content.ts) substitutes the marker
 * with the HTML returned by `getAppPromoHtml()`. Tailwind classes are styled
 * identically whether rendered via React or inserted as raw HTML.
 */

const APP_STORE_URL =
  "https://apps.apple.com/jp/app/captio%E5%BC%8F%E3%82%B7%E3%83%B3%E3%83%97%E3%83%AB%E3%83%A1%E3%83%A2/id6758438948";
const BRAND_URL = "https://simplememofast.com/";

/** Source of truth for the marker token. Used by format-content + this module. */
export const PROMO_MARKER_TOKEN = "promo:simplememofast";

/** Matches `<!-- promo:simplememofast -->` with optional whitespace. */
export const PROMO_MARKER_REGEX = /<!--\s*promo:simplememofast\s*-->/g;

export function getAppPromoHtml(): string {
  return `<aside aria-label="スポンサー" class="my-16 relative overflow-hidden rounded-2xl bg-[#0A1628] text-white">
  <div aria-hidden="true" class="pointer-events-none absolute inset-x-0 -top-24 h-64 bg-[radial-gradient(ellipse_at_center,rgba(120,170,255,0.18),transparent_60%)]"></div>
  <div class="absolute top-4 right-4 z-10">
    <span class="font-label text-[10px] tracking-[0.25em] uppercase text-white/40 border border-white/15 rounded-full px-2.5 py-1">Sponsored / PR</span>
  </div>
  <div class="relative grid md:grid-cols-[1.05fr_1fr] gap-0 items-center">
    <div class="p-8 md:p-10 lg:p-12 flex flex-col justify-center">
      <p class="font-label text-[11px] tracking-[0.3em] uppercase text-white/50 mb-4">Featured App</p>
      <h2 class="font-serif font-black text-3xl md:text-4xl leading-[1.2] text-white mb-4">書く、送る、<br class="hidden sm:inline">メールに届く。</h2>
      <p class="text-sm md:text-[15px] leading-relaxed text-white/75 mb-6">思いついた瞬間にメモして、ワンタップで自分のメールへ。会議の発言、読書のメモ、講演の要点──<span class="text-white/90">書き起こしのあとに残したい言葉</span>を、摩擦ゼロで未来の自分に届ける iOS アプリ。</p>
      <ul class="space-y-2 mb-8 text-[13px] text-white/70">
        <li class="flex items-start gap-2"><span aria-hidden="true" class="text-white/40 mt-0.5">—</span><span>起動して書き、送信ボタンひとつで完結</span></li>
        <li class="flex items-start gap-2"><span aria-hidden="true" class="text-white/40 mt-0.5">—</span><span>宛先・件名・署名を事前に固定、毎回の手間ゼロ</span></li>
        <li class="flex items-start gap-2"><span aria-hidden="true" class="text-white/40 mt-0.5">—</span><span>送信履歴を端末内に保持、あとから検索も可能</span></li>
      </ul>
      <div class="flex flex-wrap items-center gap-4">
        <a href="${APP_STORE_URL}" target="_blank" rel="sponsored noopener noreferrer" class="inline-flex items-center gap-2.5 bg-white text-[#0A1628] no-underline rounded-full px-6 py-3 text-sm font-bold transition-transform hover:scale-[1.02] hover:bg-white/95" aria-label="App Store で Simple Memo Fast をダウンロード">
          <svg viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5" aria-hidden="true"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/></svg>
          <span>App Store でダウンロード</span>
        </a>
        <a href="${BRAND_URL}" target="_blank" rel="sponsored noopener noreferrer" class="inline-flex items-center gap-1.5 text-sm text-white/80 no-underline hover:text-white transition-colors group">
          <span>simplememofast.com</span>
          <svg viewBox="0 0 24 24" fill="currentColor" class="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg>
        </a>
      </div>
    </div>
    <div class="relative bg-[#050E1C]">
      <picture>
        <source media="(min-width: 768px)" srcset="/images/promo/simplememofast.webp">
        <img src="/images/promo/simplememofast-720.webp" alt="Simple Memo Fast — 思いついた瞬間にメモして、ワンタップで自分のメールへ送るiOSアプリ" width="1200" height="868" loading="lazy" decoding="async" class="block w-full h-auto">
      </picture>
    </div>
  </div>
</aside>`;
}
