# Performance Audit v5 -- kakiokosi.com

**日付:** 2026-07-02
**対象URL:** https://kakiokosi.com/ （ホーム） / /share/kakiokoshi-toha（ガイド） / /share/business/157（旧記事） / /share/it/1391（2026年自動公開IT記事） / /share/category/it（カテゴリ）
**手法:** curl（NRT edge、各URL 3回計測の中央値） + Playwright Chromium 実測（モバイルエミュレーション 390x844、各ページ3回、PerformanceObserver で LCP/CLS/longtask 取得） + HTMLソース解析
**前回:** v4 (2026-03-28) = 92/100（レポート記載値）

---

## 総合スコア: 97 / 100 （v4比 +5）

v4 の2大減点要因（473KB PNG の LCP ヒーロー画像、wp-content 404 画像）はいずれも解消。
サイト構造も改善（`/` が直接200を返し、301ホップが消滅）。ラボ実測で LCP 212〜320ms、
CLS ≒ 0 と、CWV は大幅な余裕をもって全緑。残る最大のコストは初回訪問時のセルフホスト
フォント 1.74MB のみ。

---

## 1. HTML サイズ

| ページ | 非圧縮 | zstd圧縮転送 | 判定 |
|--------|--------|-------------|------|
| ホーム `/` | 57,523 bytes (56KB) | 11.9KB | PASS |
| ガイド kakiokoshi-toha | 68,758 bytes | 16.5KB | PASS |
| 旧記事 business/157 | 47,718 bytes | 13.2KB | PASS |
| IT記事 it/1391 | 55,236 bytes | 14.8KB | PASS |
| カテゴリ category/it | 59,717 bytes | 12.5KB | PASS |

ホームは v4 の 50,053 bytes → 57,523 bytes（+7.5KB / +15%）。ただし v4 計測は旧 `/share`
ページであり、現ホームは紹介文・カテゴリ導線が増えた別レイアウト。圧縮転送は 12KB 弱で
問題なし。HTML は zstd 圧縮で配信されている（Content-Encoding: zstd）。

---

## 2. TTFB (Time to First Byte)

curl 3回計測の中央値（time_starttransfer、NRT edge）:

| URL | TTFB 中央値 | 閾値 | 判定 |
|-----|------------|------|------|
| `/` （ホーム） | **82.7ms** | < 200ms | PASS |
| /share/kakiokoshi-toha | 75.1ms | < 200ms | PASS |
| /share/business/157 | 88.5ms | < 200ms | PASS |
| /share/it/1391 | 84.7ms | < 200ms | PASS |
| /share/category/it | 160.6ms | < 200ms | PASS |

**改善:** v4 では `/` → 301 → `/share` のリダイレクトホップがあり実効 TTFB 159ms だったが、
現在は `/` が直接 200 を返す（`/share` が `/` へ301、旧URLの互換維持）。ホームの TTFB は
約半減。HTML は Worker が動的生成（cf-cache-status なし）だが、D1 + NRT edge で十分速い。
カテゴリページのみばらつきがやや大きい（128〜316ms、D1クエリ量による）が閾値内。

---

## 3. Cache-Control ヘッダー

| リソース | Cache-Control | cf-cache-status | 判定 |
|----------|--------------|-----------------|------|
| /assets/*.js（フィンガープリント付き） | `public, max-age=31536000, immutable` | HIT | PASS |
| /assets/*.css | `public, max-age=31536000, immutable` | HIT | PASS |
| /fonts/*.woff2（ハッシュ付き） | `public, max-age=31536000, immutable` | HIT | PASS |
| /uploads/*（記事画像） | `public, max-age=31536000, immutable` | HIT | PASS |
| /images/*（アバター・OG画像、非フィンガープリント） | `public, max-age=0, must-revalidate` | HIT | 許容 |

静的アセットはすべて immutable + edge HIT。`/images/*` はファイル名にハッシュがないため
max-age=0 は妥当な選択だが、64x64 アバター等は再訪ごとに再検証リクエストが飛ぶ
（304で軽微。max-age=86400 程度にする余地あり）。

---

## 4. Content-Type charset

| リソース | Content-Type | 判定 |
|----------|-------------|------|
| HTML（全5ページ） | `text/html; charset=utf-8` | PASS |
| JS | `text/javascript` | PASS |
| CSS | `text/css` | PASS |
| woff2 | `font/woff2` | PASS |
| JPEG/PNG | `image/jpeg` / `image/png` | PASS |

---

## 5. フォント読み込み（セルフホスト構成）

| チェック | 結果 | 判定 |
|----------|------|------|
| Google Fonts 参照 | なし（完全撤廃、意図した設計） | PASS |
| 形式 | woff2 のみ 3ファイル | PASS |
| @font-face | HTML にインライン（追加CSSリクエストなし） | PASS |
| font-display | 3書体すべて `swap` | PASS |
| preload | NotoSansJP-400 のみ preload（crossorigin付き、正しい） | PASS |
| キャッシュ | ハッシュ付きファイル名 + immutable + HIT | PASS |
| ファイルサイズ | 400: 529KB / 700: 540KB / 900: 668KB = **計1.74MB** | 注意 |

サブセットはサイト全コンテンツ + 常用漢字ベース（scripts/generate-fonts.py、設計通り）。
サイト全体で1回ダウンロード → immutable 永続キャッシュのため、**2回目以降のコストはゼロ**。
初回訪問時のみ全転送量の約93%（1.87MB中1.74MB）をフォントが占める。`font-display: swap`
なのでテキスト描画（=LCP）はブロックされず、実測でもフォントスワップ由来の CLS は最大
0.0029（ガイドページ1回のみ観測、NotoSerifJP-900 のロード完了時）と無視できるレベル。

---

## 6. 画像サイズ・フォーマット

| チェック | 結果 | 判定 |
|----------|------|------|
| ホームの画像 | **0枚（テキストのみのデザインに変更）** | PASS |
| 旧記事ヒーロー（LCP候補） | 10.3KB JPEG、preload + fetchPriority=high | PASS |
| width/height 属性 | 全 img に付与（10/10） | PASS |
| loading=lazy | 関連記事サムネ3枚に付与。記事本文中の画像7枚は eager | 改善余地 |
| decoding=async | 未付与（v4からの継続、優先度低） | 改善余地 |
| wp-content 404 画像 | **0件（v4の2件は解消済み）** | PASS |
| WebP/AVIF | JPEG のまま（ただし全画像 10〜53KB と小さく実害なし） | 許容 |

**v4 最大の問題だった 473KB PNG ヒーローはホームの画像レス化により消滅。**
記事ページのヒーローも 10KB 台で preload + fetchPriority=high が正しく効いている。

---

## 7. Core Web Vitals 実測（Playwright ラボ計測）

モバイルエミュレーション 390x844・コールドキャッシュ・3回中央値。
v4 は「推定」だったが v5 は PerformanceObserver による実測。

| ページ | TTFB | FCP | LCP | LCP要素 | CLS | longtask合計 | DOM要素数 |
|--------|------|-----|-----|---------|-----|-------------|-----------|
| ホーム | 44ms | 276ms | **276ms** | P（紹介文テキスト） | **0** | 0ms | 347 |
| 旧記事 business/157 | 83ms | 320ms | **320ms** | IMG（preload済ヒーロー） | **0** | 0ms | 228 |
| IT記事 it/1391 | 73ms | 296ms | **296ms** | P（リード文テキスト） | **0** | 0ms* | 221 |
| ガイド kakiokoshi-toha | 54ms | 212ms | **212ms** | P（本文テキスト） | **0**（最大0.0029） | 0ms | 300 |

*IT記事で1回だけ 53ms の longtask（ハイドレーション）を観測。50ms 閾値ぎりぎりで無害。

### LCP: PASS（閾値 2.5s に対し 0.21〜0.32s、8〜12倍の余裕）

ホーム・ガイド・IT記事の LCP 要素はテキスト（P）— フォントは swap なのでフォールバック
描画で即確定。旧記事のみ画像 LCP だが preload + fetchPriority=high + 10KB で問題なし。

### INP: PASS 見込み（< 200ms）

longtask ほぼゼロ、DOM 221〜347 要素（閾値1,500の1/4以下）、サードパーティは async の
Ahrefs analytics（6.9KB）1本のみ。ハイドレーション負荷も軽微で、実ユーザー INP が
200ms を超える要因は見当たらない。

### CLS: PASS（0〜0.0029、閾値 0.1 の 1/30 以下）

全画像に width/height、広告・埋め込みなし、フォントスワップの影響も実測でほぼゼロ。

### ページ総転送量（コールド、モバイル）

| 内訳 | ホーム | 備考 |
|------|--------|------|
| HTML | 12KB | zstd |
| JS 10ファイル | 115KB圧縮（337KB raw） | entry 61KB + chunk 44KB が主 |
| CSS 1ファイル | 9.2KB圧縮（42.7KB raw） | render-blocking はこの1本のみ |
| フォント 3ファイル | **1,738KB** | 初回のみ。immutable で以後ゼロ |
| Ahrefs analytics | 6.9KB | async、非ブロッキング |
| **合計** | **約1.87MB** | 2回目以降 ≒ 27KB |

---

## 8. PR #44/#45（話者エンティティ・品質ゲート）の影響確認

| チェック | 結果 | 判定 |
|----------|------|------|
| 話者 Person スキーマ（Wikidata sameAs） | 旧記事で確認（例: スティーブ・ジョブズ → Q19837） | 肥大なし |
| JSON-LD 合計サイズ | ホーム1.3KB / 記事2.8KB / ガイド1.6KB | PASS |
| HTML サイズへの影響 | 記事HTMLは47〜55KBで正常範囲 | PASS |

スキーマ追加による HTML 肥大は実質なし（JSON-LD は記事あたり3KB未満）。ホームの
+7.5KB はレイアウト刷新（`/` 直接配信化に伴う紹介文追加）によるもので、圧縮後12KBのため
性能影響なし。

---

## サマリー

| チェック | 状態 | スコア |
|----------|------|--------|
| 1. HTML サイズ | 47〜69KB、圧縮12〜17KB | 10/10 |
| 2. TTFB < 200ms | 75〜161ms（リダイレクトホップ解消で改善） | 10/10 |
| 3. Cache-Control immutable | assets/fonts/uploads すべて正しい | 10/10 |
| 4. Content-Type charset | 全ページ utf-8 | 10/10 |
| 5. フォント | セルフホスト・swap・preload 正しいが初回1.74MB | 8/10 |
| 6. 画像 | ヒーロー10KB・404解消。decoding/lazy に微細な改善余地 | 9/10 |
| 7. CWV 実測 | LCP 212〜320ms / CLS ≒0 / longtask ≒0 | 10/10 |

**減点:**
- -2点: 初回訪問のフォント転送 1.74MB（全転送量の93%。設計判断であり2回目以降ゼロだが、低速回線の初回訪問では体感とデータ量に影響）
- -1点: 画像の細部 — 記事本文中の画像7/10が eager、decoding=async 未付与、/images/* のブラウザTTLゼロ

---

## 残る推奨事項（優先度順）

### 中インパクト

1. **フォントの unicode-range 分割（セルフホストのまま）。** 現行の1ウェイト=1ファイル
   （計1.74MB）を、かな＋高頻度漢字（初回描画に必要な範囲）と低頻度漢字の2〜3スライスに
   分割すれば、初回訪問のクリティカルなフォント転送を数百KBまで削減できる。
   generate-fonts.py に unicode-range 出力を追加するだけで実現可能。
   ※Google Fonts への回帰は不要（現方針を維持）。

### 低インパクト

2. **記事本文中の画像（2枚目以降）に `loading="lazy"` を付与。** business/157 では
   ファーストビュー外の本文画像6枚が eager で、初回に約40KB余分に取得している。

3. **`decoding="async"` を img に付与**（v4からの継続推奨。メインスレッド外デコード）。

4. **/images/*（アバター等）に短めの max-age を設定**（例: 86400）。現状 max-age=0 で
   再訪ごとに304再検証が発生する。

5. **カテゴリページの TTFB ばらつき**（128〜316ms）はD1クエリ起因とみられる。悪化する
   ようならクエリ統合・件数制限を検討（現状は閾値内で対応不要）。

---

## v4 から修正されたもの

- LCP ヒーロー画像 473KB PNG: ホームの画像レス化により消滅（LCPはテキストに）
- wp-content の 404 画像2件: 全ページで参照ゼロ、解消
- `/` → `/share` の301ホップ: 逆転（`/` が正、`/share` → `/`）でホーム TTFB 約半減
- Google Fonts（v4時点で使用）: セルフホスト woff2 ×3 に完全移行、@font-face インライン化
- CWV: 推定から実測へ移行し、LCP 212〜320ms / CLS ≒0 を確認

## v4 から追加されたもの（悪化なしを確認）

- 話者エンティティ JSON-LD（Wikidata sameAs）: 記事あたり3KB未満、肥大なし
- Ahrefs analytics: async・6.9KB・非ブロッキング、CSP で明示許可済み
- HTML 圧縮が zstd に（従来比でわずかに転送減）
