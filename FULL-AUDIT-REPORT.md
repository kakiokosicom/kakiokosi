# kakiokosi.com フルSEO監査レポート

**実施日:** 2026-06-11（前回: 2026-03-28）
**クロール:** 500 URL（200=498 / 404=2）、インデックス可能ページ 93、サイトマップ 92 URL
**手法:** 6専門サブエージェント並列分析（technical / content / schema / sitemap / performance / visual）
**詳細:** `seo-audit-reports/` 配下に各分野のフルレポート、`screenshots/audit2-*.png` にスクリーンショット

---

## エグゼクティブサマリー

### 総合SEOヘルススコア: **79 / 100**（前回 74 → **+5**）

| カテゴリ | 今回 | 前回 | 重み | 加重 |
|---|---|---|---|---|
| Technical SEO | 92 | 78 | 25% | 23.0 |
| Content Quality | **62** | 64 | 25% | 15.5 |
| On-Page SEO | 84 | 82 | 20% | 16.8 |
| Schema / 構造化データ | 82 | 72 | 10% | 8.2 |
| Performance (CWV) | 85 | 65 | 10% | 8.5 |
| Images | 65 | 55 | 5% | 3.25 |
| AI Search Readiness | 75 | 48 | 5% | 3.75 |

**ビジネスタイプ**: パブリッシャー（講演・スピーチ・インタビュー書き起こしアーカイブ、日本語）

**総評**: 3月以降の施策（ホームページ401KB→56KB、noindex戦略、llms.txt、AIクローラー開放、OG画像、サイトマップ品質ゲート）が効き、技術面はほぼ完成。**唯一かつ最大のボトルネックはContent Quality (62)**。特に自動公開パイプライン産のIT記事の出典欠如は、サイト自身が掲げる編集ポリシーと矛盾しており、品質評価上のリスクです。

### 前回からの解消済み項目
401KBホームページ / logo.png 404 / OG画像なし / llms.txtなし / AIクローラーブロック / コンテンツ鮮度（2021年止まり→IT記事パイプライン稼働中） / タグ380本のサイトマップ肥大（→noindex+サイトマップ除外） / HSTS preloadなし / タイムゾーンなし日付

### クリティカル課題 Top 5
1. **IT自動生成記事 18/22本に出典・話者・元URLが一切ない** — /share/about の「出典の明示」ポリシーと矛盾。テンプレ的AI解説と判定されるリスク（2025年9月QRGの低品質AIコンテンツ指標に合致）
2. **著者が全記事「編集部」のみ** — 運営者の実績（元livedoor・78万PV・15年アーカイブ）が可視コンテンツ・Article schemaのどちらにも不在
3. **ピラーガイド3本（kakiokoshi-toha / gijiroku / mojikoshi-tool）の深度不足** — 「徹底解説」「完全ガイド」のタイトルに対し本文1.2〜2千字（競合の1/3〜1/5）。うち2ページでSimpleMemoFast誘導が非開示
4. **WP移行起因の壊れた内部リンク** — /share/business/80・81・82 のgigazine URL連結バグ（404）、/share/politics/86 の消滅フォームへのリンク
5. **httpルートのリダイレクト先が `/share`** — `http://kakiokosi.com/` → `https://kakiokosi.com/share`（正: `/`）。末尾スラッシュURLの200応答による重複も併発

### クイックウィン Top 5
1. 壊れた内部リンク4箇所の修正（数分）
2. http→httpsリダイレクト先を `/` に修正、`/share`→`/` 301、末尾スラッシュ301
3. FAQPage schema削除（記事/aboutテンプレ。2023年8月以降リッチリザルト対象外）+ パンくず「ホーム」を全テンプレで `/` に統一
4. 記事パンくず「ホーム」の縦書き崩れ修正（`app/routes/share.$category.$id.tsx:189-196` の `<li>` に `shrink-0 whitespace-nowrap`）
5. Google Fonts 7ウェイト→4以下に削減（ページ重量の75〜80%がフォント、guideページLCP倍増の原因）

---

## 1. Technical SEO — 92/100

- **noindex戦略の検証: 100%一貫**。タグ292・ページネーション7+カテゴリページネーション9・Block C記事93本すべてに `noindex, follow`。サイトマップ92 URLへのnoindex混入ゼロ、インデックス可能93ページと1:1整合
- **クローラビリティ**: 完全SSR、robots.txt良好（AIクローラー条項付き）、ハード404適切、旧 `/2010/` WP URLは新URLへ301
- **セキュリティヘッダ**: HSTS preload / CSP / nosniff / X-Frame-Options DENY — 優秀
- **Issues**: 壊れ内部リンク4箇所（High）、httpルートの301先が `/share`（Medium）、記事URL末尾スラッシュ200（Medium、self-canonicalで緩和）

## 2. Content Quality — 62/100 ⚠️ 最優先領域

E-E-A-T内訳: Experience 70 / Expertise 55 / Authoritativeness 55 / Trust 60、AI引用準備度 72

- **ITバッチ記事の出典欠如（High)**: 18/22本が話者名・元動画/記事URLなし。「文字起こし: 編集部」バイラインのみ
- **著者シグナル不在（High)**: paji/安宅基の実績がOrganization sameAsにしか存在しない
- **ピラーガイド深度不足（High)**: 構造は正しいが本文量がタイトルの約束に未達。SimpleMemoFast誘導2件が非開示（ステマ規制リスク）
- **レガシー書き起こし記事は良好**: 導入文・2026年編集注・引用H2・出典リンクにより「無付加価値の複製」リスクは概ね回避
- インデックス可能な薄いページ: 実質5本（jirei / technique / category/culture / category/economy / entertainment/641）。重複タイトルはnoindexページのみ

## 3. On-Page SEO — 84/100

- タイトル: 93ページ中、短すぎ(<20字)3・長すぎ(>62字)3のみ。H1全ページ存在
- メタディスクリプション50字未満が14ページ（カテゴリ・ガイド系中心）
- 複数H1が7ページ（business/881、tapeokoshi、jirei、nagare、omitsumori 等）
- 内部リンク5本未満のページゼロ（noindex,followでリンクエクイティ循環は維持）

## 4. Schema / 構造化データ — 82/100

ブロッキングエラー0・パース不能JSON-LD 0。警告8クラス:
FAQPage 5ページ（対象外→削除推奨）/ 全記事共通default-og.png / パンくずHomeが guide系24ページで `/share`・記事で `/` と不統一 / カテゴリ8ページBreadcrumbListなし / OGバナーのOrganizationロゴ流用 / クロススクリプト@id参照 / 匿名WebSiteノード重複 / 新パイプライン記事でkeywords・articleSection欠落

**最高価値の推奨**: 書き起こしサイト固有のエンティティ強化 — Article に `isBasedOn`（元動画/記事URL）+ `about`/`mentions` で話者Person（Wikidata sameAs）

## 5. Performance — 85/100（Playwrightラボ計測、CrUXなし）

| 指標 | 計測値 | 閾値 | 判定 |
|---|---|---|---|
| LCP | 552ms(home) / 660ms(記事) / 1,140ms(guide) | <2.5s | ✅ |
| CLS | 0.000 全ページ | <0.1 | ✅ |
| TTFB | p50 168ms / p75 248ms / p90 363ms (n=498) | <800ms | ✅ |
| INP代理 | ハイドレーションロングタスク計395〜702ms（最大単発200ms） | <200ms | ⚠️中リスク |

- **フォントがページ重量の75〜80%**（1.0〜1.6MB、woff2スライス48〜73ファイル、7ウェイト）+ render-blocking CSS 119KB。guideページのLCP倍増（フォントスワップでLCP再発火）の直接原因
- ハイドレーションJS 112KB(gzip)/340KB(parsed) — 静的中心サイトのためRR7ルート別ハイドレーション削減が有効

## 6. Images — 65/100

- コンテンツ画像がサイト全体でほぼゼロ → alt問題は実質なしだが、視覚的リッチさとDiscover適性を欠く
- OG画像が全記事共通のdefault-og.png（per-article画像なし、16:9/4:3/1:1の複数比率もなし）
- デスクトップ1920pxのホームが平坦なネイビーブロック羅列+タイトル二重表示

## 7. AI Search Readiness — 75/100（前回48から大幅改善）

- ✅ GPTBot / ClaudeBot / PerplexityBot / CCBot等をrobots.txtで明示Allow、llms.txt設置済み
- ✅ 書き起こしフォーマット自体がAI引用と高相性（引用可能なH2パッセージ構造）
- 改善余地: 話者・出典のエンティティ明示（schema `about`/`mentions`）、ガイドページの定義文/Q&A構造、IT記事の出典（引用元として信頼されない）

## 8. Visual / Mobile — 82/100（参考）

- **High**: 記事ページのパンくず「ホーム」が1文字/行の縦並び（14px幅に圧縮）— 全記事で発生。flexの `<li>` にshrink抑止がないため
- Medium: 44px未満タップターゲット（パンくずカテゴリ13×20px、著者リンク14px、ハンバーガー40×40、ロゴ32px）
- 強み: 横スクロールゼロ、視覚的CLSなし（+3秒スクショがバイト一致）、モバイル全ページでH1がファーストビュー内、本文16〜18px

---

*2026-06-11 生成 / 6専門サブエージェント並列監査（Technical 92 / Content 62 / Schema 82 / Sitemap 95 / Performance 85 / Visual 82）*
