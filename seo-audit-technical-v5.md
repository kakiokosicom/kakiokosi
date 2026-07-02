# テクニカルSEO監査 v5 — kakiokosi.com

**日付:** 2026-07-02
**監査:** Claude (自動監査 / Fable 5)
**対象:** https://kakiokosi.com
**データソース:** 全量クロール 500 URL（pages_final.jsonl）+ ライブ確認 11 リクエスト
**前回:** v4（2026-03-28 文書、その後 06-23 までの修正反映でスコア 97）

---

## 総合スコア: 98 / 100（v4 比 +1）

| カテゴリ | 判定 | スコア |
|------------------------|--------|-------|
| 1. クロール可能性       | PASS   | 10/10 |
| 2. インデックス制御      | PASS   | 10/10 |
| 3. セキュリティヘッダー  | PASS   | 10/10 |
| 4. URL構造              | WARN   | 9/10  |
| 5. モバイル              | PASS   | 10/10 |
| 6. Core Web Vitals      | PASS   | 9/10  |
| 7. 構造化データ          | PASS   | 10/10 |
| 8. JSレンダリング (SSR)  | PASS   | 10/10 |
| 9. キャッシュ            | PASS   | 10/10 |
| 10. RSSフィード          | PASS   | 6/6   |

**合計 104/106 → 正規化 98/100**

### +1 の根拠

- **解消（加点要因）**: v4 唯一の Medium だった robots.txt の Cloudflare 管理ブロック（AIボット全面 Disallow がサイト側 Allow を上書き）が完全に消滅。root `/` が 301 だった問題も「`/` をホーム化・`/share` を 301」で解消。http→https の 2 ホップ修正（06-23）も維持を実測確認。
- **減点要因（新規債務）**: `/share`→`/` 移行の残骸として内部リンク 16 本がリダイレクト経由（URL構造 -1）。CWV はフィールドデータ未確認のため v4 同様 -1。
- 404 ページの `<title>` 欠落、タグページの permissions-policy 欠落、HTML の Cache-Control 未設定は Low としてスコア外の指摘に留めた。

---

## 1. クロールデータ検証（500 URL 全量）

事前分析の主張を pages_final.jsonl に対して独立に検証した。

| 主張 | 検証結果 | 判定 |
|------|---------|------|
| 500/500 が最終 200 | ステータス分布 `{200: 500}`、エラー 0 | 確認 |
| マルチホップリダイレクト 0 | redirect_chain 保持行 3、全て 1 ホップ | 確認 |
| 1 ホップ 301 が 3 本 | `/share`→`/`、`/2010/05/…(孫vs佐々木対談)/`→`/share/business/309`・`/310`（旧WP URL 温存） | 確認 |
| noindex 402 | 402 行、全て `noindex, follow`（内訳: タグ 291 / Block C 記事 95 / ページネーション 16） | 確認 |
| インデックス可能 ~96 | ユニーク最終 URL 97 − 画像 2（/uploads/*.png,jpg）= **HTML 95**（ホーム1 + 記事62 + カテゴリ8 + ガイド・固定24） | 確認（95） |
| canonical 不一致 0 | 完全一致比較でも 0 | 確認 |
| canonical 欠落 0 | 欠落 2 件は画像ファイル（HTML ではないため対象外）→ HTML は 0 | 確認 |
| x-robots-tag | 全 500 行で未使用（meta robots のみで制御） | 確認 |

補足: `/`（ホーム）は `/` と `/share`（301 経由）の 2 回取得されており final_url 重複 3 件はすべてリダイレクト由来。実体の重複コンテンツは無し。

---

## 2. ライブ確認（11 リクエスト、2026-07-02 実測）

| # | リクエスト | 結果 | 判定 |
|---|-----------|------|------|
| 1 | `http://kakiokosi.com/` | **301 → `https://kakiokosi.com/`（1ホップ）** — 06-23 の 2 ホップ修正は維持 | PASS |
| 2 | `https://www.kakiokosi.com/` | 301 → apex（1ホップ） | PASS |
| 3 | `http://kakiokosi.com/share/business/309` | 301 → https 同一パスへ直行（1ホップ） | PASS |
| 4 | `/xyz-nonexistent-page-12345` | **HTTP 404**（ソフト404なし）。lang=ja・viewport あり、h1「404」あり。ただし `<title>` 無し | PASS（title は Low 指摘） |
| 5 | `/sitemap.xml`（ヘッダー） | 200、`application/xml; charset=utf-8`、`cache-control: public, max-age=3600` | PASS |
| 6 | `/sitemap.xml`（本文） | `<loc>` 95 件 | PASS |
| 7 | `/share/feed.xml` | 200、`application/rss+xml; charset=utf-8`、max-age=3600 | PASS |
| 8 | `/share/it/1391/`（末尾スラッシュ） | 301 → `/share/it/1391` に正規化 | PASS |
| 9 | `/SHARE/IT/1391`（大文字） | 301 → `/share/it/1391` に小文字正規化 | PASS |
| 10 | `/robots.txt` | **Cloudflare 管理コンテンツブロック消滅**。静的ルールのみ（`User-agent: *` Allow + GPTBot/ClaudeBot/Google-Extended/PerplexityBot/Bytespider/CCBot に `/share/` Allow）、`Sitemap:` ディレクティブあり | PASS |
| 11 | `/share` | 301 → `/`（1ホップ） | PASS |

---

## 3. robots.txt — v4 の Medium 問題は解消

v4 で警告した「Cloudflare 管理 robots.txt が AI ボットへ `Disallow: /` を前置し、サイト側の `Allow: /share/` を無効化」する競合は**完全に解消**。現在の robots.txt はサイト側の静的ルールのみが配信され、`Sitemap: https://kakiokosi.com/sitemap.xml` も宣言済み。管理画面(`/auth/` `/dashboard/` `/admin/`)のみ Disallow で適切。

**判定: PASS**（v4: WARN → 解消）

---

## 4. サイトマップ ↔ noindex 整合性（完全一致）

| チェック | 結果 |
|---------|------|
| サイトマップ URL 数 | 95 |
| うち noindex ページ | **0** |
| うちリダイレクト URL（/share 等） | 0 |
| うちクロールで未確認の URL | 0 |
| インデックス可能 95 ページのうちサイトマップ未掲載 | **0** |

サイトマップ = インデックス許可集合の **1:1 完全一致**。「品質集中」戦略（Block C 95 記事 + タグ 291 + ページネーション 16 を noindex）がサイトマップ側にも正確に反映されており、Googlebot への送信シグナルに矛盾がない。noindex ページは全て `noindex, follow` + 自己参照 canonical で統一（矛盾シグナルなし）。

**判定: PASS**

---

## 5. `/share` → `/` 301 の評価（v4 以降の構造変更）

v4 時点では `/share` がホーム（`/` は 301）。現在は **`/` がホーム（200）、`/share` が 301** に反転。

**評価: 正しい変更。** v4 の Low 指摘 #2（ネイキッドドメインが 301）の根本解決であり、canonical・サイトマップ・JSON-LD（WebSite.url、パンくず item）はすべて `https://kakiokosi.com/` を指しており整合。旧 `/share` 宛の外部リンク・ブックマークは 301 で equity を引き継ぐ。

**残骸: 内部リンク 16 本がまだ `/share`（=301）を指す。**

| 発生源 | 本数 | 箇所 |
|--------|------|------|
| ホーム `/`（インデックス可能） | 1 | ページネーションの「1」（現在ページ）ボタン `href="/share"` |
| ガイドページ 8 件（インデックス可能） | 8 | 表示パンくず `<a href="/share">トップページ</a>`（※JSON-LD パンくずは `/` を指しており正しい。HTML アンカーのみ旧 URL） |
| `/share/page/2〜9`（noindex ページネーション） | 7 | 同じく「1」ボタン |

→ **修正はテンプレート 2 箇所のみ**（ページネーションコンポーネントの 1 ページ目 href、ガイドのパンくずアンカー）で 16 本すべて解消する。インデックス可能ページ発の 2,077 本中 9 本（0.4%）なので実害は小さいが、リダイレクト経由の内部リンクはゼロにできる種類の債務。

**判定: 構造変更は GOOD / 残骸修正を Medium で推奨**

---

## 6. 内部リンクとクロールバジェット分析

### リンクグラフ実測

| 指標 | 値 |
|------|-----|
| URL 在庫 500 のうち noindex | 402（**80.4%**） |
| インデックス可能ページ発の内部リンク総数 | 2,077 |
| うち noindex ページ宛 | **457（22.0%）**（タグ 269 / Block C 記事 176 / ページネーション 12） |
| うち `/share` リダイレクト宛 | 9（0.4%） |
| 全ページ発（noindex ページ含む）では | 5,557 本中 1,410 本（25.4%）が noindex 宛 |

noindex 宛リンクの発生源（インデックス可能ページ側）: 記事 337（うちタグチップ 269）、カテゴリ 83、ガイド・固定 34、ホーム 3。**記事テンプレートのタグチップが最大の発生源（59%）**。タグページは 291 URL（サイト URL 在庫の 58%）、中央値 562 文字の薄いリスト。

### GSC回復の観点

背景: サイトは約 6 ヶ月超のオフラインを経て 2026-03 末に再公開。GSC は 6 月以降ほぼゼロインプレッション、「クロール済み - インデックス未登録」が主症状。テクニカル面から言えることは以下。

1. **クロールバジェット自体は制約ではない。** Google の公式ガイダンスではバジェットが問題になるのは概ね 100 万 URL 級（更新頻度が高くても数万 URL 級）から。500 URL のサイトは Googlebot が全量を余裕でクロールできる。402 ページの noindex にバジェット上の実害はない。

2. **ただし「構成シグナル」としては極端。** 発見可能 URL の 5 本に 4 本が noindex、インデックス可能ページ発リンクの 22% が noindex 宛。再信頼の評価フェーズにあるサイトとして、クローラーが観測するサイト像の大半が「インデックス不可の薄いページ」であるのは望ましくない。さらに長期 noindex ページは最終的に nofollow 同等の扱いになる（リンク発見への寄与が減衰する）ため、タグチップ 269 本の内部リンク価値は時間とともにゼロへ向かい、リンク equity の分配だけを薄め続ける。

3. **rel=nofollow は解ではない**（equity を捨てるだけでクロールも止まらない）。選択肢は:
   - **(a) 現状維持**: 500 URL 規模では防御可能。noindex,follow は正しい衛生管理であり、浪費は 1 クロールサイクルあたり数百フェッチ程度。
   - **(b) 記事テンプレートからタグチップを撤去（リンク削除）**: 291 タグページが孤立 → 再クロールから自然消滅。各記事の発リンクが 4〜5 本減り、残るリンク 1 本あたりの equity が約 2 割強濃くなる。ユーザー導線はカテゴリ 8 + ガイド 11 で代替済み。撤去後、必要なら将来 410 で確定させる。

   **判定: (b) を推奨（ただし優先度 Medium）。** これはバジェット対策ではなく「品質シグナル濃縮 + equity 集中」の施策。95 のインデックス可能ページに評価を集中させる現行戦略（Block C noindex）と方向が一致する。逆に言えば、(a) のままでも技術的失点にはならない — 500 URL 規模でバジェット起因のインデックス遅延は説明がつかない。

4. **「クロール済み - 未登録」の残りの技術的レバー**は小さい: HTML への Cache-Control 付与（エッジキャッシュで Googlebot の TTFB 安定化、後述 Low）、`/share` 残骸リンク 16 本の解消、以上。**テクニカルは既にほぼ満点であり、回復のボトルネックは技術外（コンテンツ品質評価・外部シグナル・再信頼の時間経過）にある**というのが本監査の結論。

---

## 7. セキュリティヘッダー

インデックス可能ページ（95/95）は 6 ヘッダー完備を全量確認:

| ヘッダー | 値 | 判定 |
|----------|-----|------|
| Strict-Transport-Security | `max-age=31536000; includeSubDomains; preload` | PASS |
| Content-Security-Policy | `default-src 'self'; script-src 'self' 'unsafe-inline' https://analytics.ahrefs.com; … font-src 'self'; … frame-ancestors 'none'; upgrade-insecure-requests` | PASS |
| X-Frame-Options | `DENY` | PASS |
| X-Content-Type-Options | `nosniff` | PASS |
| Referrer-Policy | `strict-origin-when-cross-origin` | PASS |
| Permissions-Policy | `camera=(), microphone=(), geolocation=()` | PASS |

v4 との差分: CSP から Google Fonts（fonts.googleapis.com / fonts.gstatic.com）が消え `font-src 'self'`（フォントセルフホスト化を反映）、analytics.ahrefs.com が script/connect に追加。

**新規 Low**: `permissions-policy` のみ **タグページ 252/291 で欠落**（他 5 ヘッダーは全ページ完備、インデックス可能ページは欠落ゼロ）。noindex ページ限定で SEO 影響なしだが、Worker のヘッダー付与経路が全ルートで統一されているか確認を推奨（デプロイ版差 or コードパス差の疑い）。

**判定: PASS**

---

## 8. URL構造

| チェック | 結果 | 判定 |
|---------|------|------|
| http→https | 1 ホップ 301（深層パスも直行） | PASS |
| www→apex | 1 ホップ 301 | PASS |
| 末尾スラッシュ | 301 で正規化 | PASS |
| 大文字パス | 301 で小文字に正規化 | PASS |
| 旧 WordPress URL（/2010/05/…） | 新 URL へ 1 ホップ 301（equity 温存） | PASS |
| マルチホップ | 0 | PASS |
| カテゴリ URL | `/share/category/<slug>` に統一（旧 `/share/<slug>` カテゴリはクロールグラフから消滅、衝突なし） | PASS |
| 内部リンクのリダイレクト経由 | **16 本（/share 宛）** | WARN |

**判定: WARN（9/10）** — 減点は内部リンク 16 本のみ。

---

## 9. モバイル・レンダリング・CWV

サンプル 3 ページ（`/`、`/share/gijiroku`、`/share/it/1389`）の HTML を直接検証:

- `<html lang="ja">` + `<meta name="viewport" content="width=device-width, initial-scale=1"/>` — 3/3 で確認
- SSR: `"ssr":true`・`isSpaMode":false` — 3/3 で確認。本文はサーバーレンダリング済み（記事全文が初期 HTML に含まれる）
- フォント: セルフホスト Noto Sans JP（woff2、`font-display:swap`、`<link rel="preload" as="font">`）— Google Fonts 依存の撤廃で接続コスト削減、LCP に有利
- `modulepreload` によるチャンク先読み、記事画像に `loading="lazy"`
- 404 ページですら viewport/lang 完備

| 指標 | ソースレベル評価 |
|------|----------------|
| LCP | 良好見込み（SSR + フォント preload + 外部フォント依存なし。ホームは画像 0 のテキスト LCP） |
| INP | 良好見込み（hydration のみの軽量 JS） |
| CLS | 良好見込み（フォント swap + preload、遅延画像は本文下部） |

**判定: PASS（9/10）** — v4 同様、CrUX フィールドデータ未確認のため -1。※INP は 2024-03 以降の唯一の応答性指標として評価。

---

## 10. 構造化データ

インデックス可能記事 62 本すべてに JSON-LD あり。組み合わせ:

- 基本セット（21 記事）: `Article` + `BreadcrumbList` + `Person`(著者/話者) + `SpeakableSpecification` + `WebPage` + `WebSite` + `Organization`(住所・連絡先込み)
- +`AudioObject`（19 記事）、+`VideoObject`（14 記事）、+`CreativeWork`（8 記事）— 書き起こし元メディアの明示は AI 検索・リッチリザルト双方に有効
- ホーム: `CollectionPage` + `ItemList` + `WebSite` + `Organization`
- パンくず JSON-LD の item は `https://kakiokosi.com/` → `/share/category/<cat>` → 記事 と新 URL 体系に追随済み（`/share` 残存なし）

**判定: PASS**

---

## 11. コンテンツ衛生（インデックス可能 95 ページ）

| チェック | 結果 |
|---------|------|
| h1 欠落 | 0 |
| meta description 欠落 | 0 |
| title 重複 | 実質 0（検出 1 組はホームの二重取得によるもの） |
| 1,000 文字未満の記事 | 0（薄い記事は Block C として noindex 済み） |
| hreflang | なし（ja 単一言語サイトのため N/A。多言語化時は seo-hreflang で別途検証） |

**判定: PASS**

---

## 課題サマリー

### Medium

| # | 課題 | カテゴリ | 詳細 |
|---|------|---------|------|
| 1 | 内部リンク 16 本が `/share`(301) 宛 | URL構造 | ページネーション「1」ボタン + ガイド 8 ページの表示パンくず。テンプレート 2 箇所の href を `/` に変更で全解消 |
| 2 | noindex 面が URL 在庫の 80.4%、インデックス可能ページ発リンクの 22% が noindex 宛 | クロール効率 | バジェット実害なし（500 URL 規模）だが、GSC 再信頼フェーズの品質シグナルとして記事テンプレートのタグチップ撤去（291 タグページの孤立化）を推奨。rel=nofollow は不採用 |

### Low

| # | 課題 | カテゴリ | 詳細 |
|---|------|---------|------|
| 3 | HTML ページに Cache-Control なし（498/498） | キャッシュ | v4 から継続。`public, s-maxage=60, stale-while-revalidate=86400` 等でエッジキャッシュ推奨（Googlebot の TTFB 安定化） |
| 4 | 404 ページに `<title>` がない | UX/衛生 | ステータス 404・h1 は正しい。`<title>404 - ページが見つかりません | 書き起こし.com</title>` を追加 |
| 5 | permissions-policy がタグページ 252/291 で欠落 | セキュリティ | noindex ページのみで SEO 影響なし。Worker のヘッダー付与を全ルートで統一 |

### v4 から解消済み

- **robots.txt の Cloudflare 管理 AI ボットブロック競合（v4 唯一の Medium）→ 消滅。** 静的ルール + Sitemap ディレクティブのみ配信
- **root `/` が 301 の問題 → `/` をホーム化して解消**（`/share` 側を 301 に）
- http→https 2 ホップ問題（06-23 修正）→ 1 ホップ維持を実測確認
- Google Fonts 外部依存 → セルフホスト化（CSP も `font-src 'self'` に更新）
- 大文字パス・末尾スラッシュの 301 正規化を確認（新規検証項目）

---

## スコア内訳

| 領域 | 満点 | 得点 | 備考 |
|------|-----|------|------|
| クロール可能性 | 10 | 10 | robots 競合解消、サイトマップ 1:1、Sitemap ディレクティブあり（v4: 8） |
| インデックス制御 | 10 | 10 | canonical 完備・noindex↔サイトマップ完全整合 |
| セキュリティ | 10 | 10 | インデックス可能ページは 6 ヘッダー完備（タグページの p-p 欠落は Low 扱い） |
| URL構造 | 10 | 9 | -1: 内部リンク 16 本がリダイレクト経由（v4 の root 301 問題は解消） |
| モバイル | 10 | 10 | viewport・lang・レスポンシブ確認 |
| Core Web Vitals | 10 | 9 | -1: フィールドデータ未確認（v4 と同じ） |
| 構造化データ | 10 | 10 | Article/Breadcrumb/Person/Speakable + Audio/VideoObject |
| JSレンダリング | 10 | 10 | 完全 SSR、全文が初期 HTML に存在 |
| キャッシュ | 10 | 10 | assets/uploads immutable（v4 確認済・構成不変）、sitemap/feed max-age=3600。HTML の Cache-Control 未設定は Low 継続 |
| RSSフィード | 6 | 6 | 200・正しい content-type・autodiscovery リンク全ページ確認 |
| **合計** | **106** | **104** | **正規化 98/100（v4: 97 → +1）** |

---

*監査終了。次回 v6 では CrUX フィールドデータ確認と、タグチップ撤去実施後のリンクグラフ再計測を推奨。*
