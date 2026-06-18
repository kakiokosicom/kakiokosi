// 自動生成: scripts/generate-fonts.py。手で編集しない。
// content-hash 付きURLなので /fonts/*.woff2 を immutable キャッシュできる。
export type FontFace = { family: string; weight: number; url: string };
export const FONT_FACES: FontFace[] = [
  {
    "family": "\"Noto Sans JP\"",
    "weight": 400,
    "url": "/fonts/NotoSansJP-400.99192b34.woff2"
  },
  {
    "family": "\"Noto Sans JP\"",
    "weight": 700,
    "url": "/fonts/NotoSansJP-700.91c9f39a.woff2"
  },
  {
    "family": "\"Noto Serif JP\"",
    "weight": 900,
    "url": "/fonts/NotoSerifJP-900.ef0de7eb.woff2"
  }
];
/** above-the-fold の本文フォント（preload 対象） */
export const PRELOAD_FONT = "/fonts/NotoSansJP-400.99192b34.woff2";
/** <style> に流し込む @font-face CSS（display:swap） */
export const FONT_FACE_CSS = FONT_FACES.map(
  (f) => `@font-face{font-family:${f.family};font-style:normal;font-weight:${f.weight};font-display:swap;src:url(${f.url}) format('woff2')}`
).join("");
