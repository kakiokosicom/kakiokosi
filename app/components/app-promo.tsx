const APP_STORE_URL =
  "https://apps.apple.com/jp/app/captio%E5%BC%8F%E3%82%B7%E3%83%B3%E3%83%97%E3%83%AB%E3%83%A1%E3%83%A2/id6758438948";
const BRAND_URL = "https://simplememofast.com/";

/**
 * Sponsored app promotion shown in the latter half of every article.
 * Uses rel="sponsored" per Google's guidelines for paid/affiliate links.
 */
export function AppPromo() {
  const appStoreUrl = APP_STORE_URL;
  const brandUrl = BRAND_URL;

  return (
    <aside
      aria-label="スポンサー"
      className="mt-20 relative overflow-hidden rounded-2xl bg-[#0A1628] text-white"
    >
      {/* Subtle spotlight glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-24 h-64 bg-[radial-gradient(ellipse_at_center,rgba(120,170,255,0.18),transparent_60%)]"
      />
      {/* Disclosure label */}
      <div className="absolute top-4 right-4 z-10">
        <span className="font-label text-[10px] tracking-[0.25em] uppercase text-white/40 border border-white/15 rounded-full px-2.5 py-1">
          Sponsored / PR
        </span>
      </div>

      <div className="relative grid md:grid-cols-[1.05fr_1fr] gap-0 items-stretch">
        {/* Copy */}
        <div className="p-8 md:p-10 lg:p-12 flex flex-col justify-center">
          <p className="font-label text-[11px] tracking-[0.3em] uppercase text-white/50 mb-4">
            Featured App
          </p>
          <h2 className="font-serif font-black text-3xl md:text-4xl leading-[1.2] text-white mb-4">
            書く、送る、<br className="hidden sm:inline" />メールに届く。
          </h2>
          <p className="text-sm md:text-[15px] leading-relaxed text-white/75 mb-6">
            思いついた瞬間にメモして、ワンタップで自分のメールへ。
            会議の発言、読書のメモ、講演の要点──
            <span className="text-white/90">書き起こしのあとに残したい言葉</span>
            を、摩擦ゼロで未来の自分に届ける iOS アプリ。
          </p>

          <ul className="space-y-2 mb-8 text-[13px] text-white/70">
            <li className="flex items-start gap-2">
              <span aria-hidden="true" className="text-white/40 mt-0.5">—</span>
              <span>起動して書き、送信ボタンひとつで完結</span>
            </li>
            <li className="flex items-start gap-2">
              <span aria-hidden="true" className="text-white/40 mt-0.5">—</span>
              <span>宛先・件名・署名を事前に固定、毎回の手間ゼロ</span>
            </li>
            <li className="flex items-start gap-2">
              <span aria-hidden="true" className="text-white/40 mt-0.5">—</span>
              <span>送信履歴を端末内に保持、あとから検索も可能</span>
            </li>
          </ul>

          <div className="flex flex-wrap items-center gap-4">
            <a
              href={appStoreUrl}
              target="_blank"
              rel="sponsored noopener noreferrer"
              className="inline-flex items-center gap-2.5 bg-white text-[#0A1628] no-underline rounded-full px-6 py-3 text-sm font-bold transition-transform hover:scale-[1.02] hover:bg-white/95"
              aria-label="App Store で Simple Memo Fast をダウンロード"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5"
                aria-hidden="true"
              >
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
              </svg>
              <span>App Store でダウンロード</span>
            </a>
            <a
              href={brandUrl}
              target="_blank"
              rel="sponsored noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-white/80 no-underline hover:text-white transition-colors group"
            >
              <span>simplememofast.com</span>
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              >
                <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Image */}
        <div className="relative bg-[#050E1C] md:min-h-[360px]">
          <picture>
            <source
              media="(min-width: 768px)"
              srcSet="/images/promo/simplememofast.webp"
            />
            <img
              src="/images/promo/simplememofast-720.webp"
              alt="Simple Memo Fast — 思いついた瞬間にメモして、ワンタップで自分のメールへ送るiOSアプリ"
              width={1200}
              height={868}
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover md:object-center"
            />
          </picture>
        </div>
      </div>
    </aside>
  );
}

/**
 * Compact vertical variant for the desktop sidebar.
 * Sits inside an already-sticky container, so it scroll-follows the reader.
 */
export function AppPromoSidebar() {
  return (
    <aside
      aria-label="スポンサー"
      className="relative overflow-hidden rounded-xl bg-[#0A1628] text-white"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-16 h-40 bg-[radial-gradient(ellipse_at_center,rgba(120,170,255,0.22),transparent_65%)]"
      />

      {/* Image header */}
      <a
        href={APP_STORE_URL}
        target="_blank"
        rel="sponsored noopener noreferrer"
        className="block relative aspect-[4/3] overflow-hidden bg-[#050E1C]"
        aria-label="App Store で Simple Memo Fast をダウンロード"
      >
        <img
          src="/images/promo/simplememofast-720.webp"
          alt="Simple Memo Fast のプロダクト画像"
          width={720}
          height={521}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover"
        />
        <span className="absolute top-3 right-3 font-label text-[9px] tracking-[0.25em] uppercase text-white/50 border border-white/15 rounded-full px-2 py-0.5 bg-black/30 backdrop-blur-sm">
          PR
        </span>
      </a>

      {/* Copy */}
      <div className="relative p-6">
        <p className="font-label text-[10px] tracking-[0.3em] uppercase text-white/50 mb-2">
          Featured App
        </p>
        <h3 className="font-serif font-black text-xl leading-[1.25] text-white mb-2">
          書く、送る、<br />メールに届く。
        </h3>
        <p className="text-[12.5px] leading-relaxed text-white/70 mb-5">
          思いついた瞬間にメモし、ワンタップで自分のメールへ送る iOS アプリ。
        </p>

        <a
          href={APP_STORE_URL}
          target="_blank"
          rel="sponsored noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-white text-[#0A1628] no-underline rounded-full px-4 py-2.5 text-[13px] font-bold transition-transform hover:scale-[1.02]"
          aria-label="App Store で Simple Memo Fast をダウンロード"
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-4 h-4"
            aria-hidden="true"
          >
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
          </svg>
          <span>App Store で入手</span>
        </a>

        <a
          href={BRAND_URL}
          target="_blank"
          rel="sponsored noopener noreferrer"
          className="mt-3 flex items-center justify-center gap-1 text-[11px] text-white/55 no-underline hover:text-white/90 transition-colors"
        >
          <span>simplememofast.com</span>
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-3 h-3"
            aria-hidden="true"
          >
            <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
          </svg>
        </a>
      </div>
    </aside>
  );
}
