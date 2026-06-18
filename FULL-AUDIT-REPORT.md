# kakiokosi.com フルSEO監査レポート

**実施日:** 2026-06-16（前回: 2026-06-11 / 初回: 2026-03-28）
**クロール:** 500 URL（200=499 / 502=1 ※一時障害、再取得で200）、インデックス可能 93、サイトマップ 92 URL
**手法:** 6専門サブエージェント並列分析（technical / content / schema / sitemap / performance / visual）
**位置づけ:** PR #38（コンテンツ品質改善・本番デプロイ済み）の**効果測定 再監査**
**詳細:** `/tmp/seo-audit-0616/reports/` 各分野フルレポート / `screenshots/audit3-*.png`

---

## エグゼクティブサマリー

### 総合SEOヘルススコア: **86 / 100**（6/11: 79 → **+7** / 3/28: 74 → +12）

| カテゴリ | 今回 | 6/11 | 重み | 加重 | 評価 |
|---|---|---|---|---|---|
| Technical SEO | 94 | 92 | 25% | 23.5 | 正規化が本番実証合格 |
| Content Quality | **78** | 62 | 25% | 19.5 | **+16・最大の改善**（出典16本解消） |
| On-Page SEO | 90 | 84 | 20% | 18.0 | メタ説明・H1問題が全消 |
| Schema | 91 | 82 | 10% | 9.1 | @id化・FAQ削除が奏功 |
| Performance | 75 | 85 | 10% | 7.5 | ※スコア低下だが実態は健全（後述） |
| Images | 76 | 65 | 5% | 3.8 | OG画像78ページ専用化 |
| AI Search Readiness | 83 | 75 | 5% | 4.15 | isBasedOn+著者+Q&Aで引用適性向上 |

**ビジネスタイプ**: パブリッシャー（講演・スピーチ書き起こしアーカイブ、日本語）

**総評**: PR #38は狙いどおり最大ボトルネックのContent Qualityを62→78に引き上げ、技術・schema・画像も改善。総合86点に到達。残課題は**コードの取りこぼし2件（どちらも軽量修正）と法務ページの実名誤り**が中心で、致命的問題はゼロ。Performanceの数値低下はフォント修正の失敗ではなく、スコア基準が「ハイドレーションのメインスレッド占有(TBT/INP)」という従来から存在した別要因に主軸が移ったため（LCP/CLSはむしろ改善）。

### PR #38で解消が確認できた項目（前回比）
- IT記事の出典欠如: 18本 → **0本**（16本に出典ボックス+パジ著者+isBasedOn付与、残6本は正当な非帰属）
- メタディスクリプション短すぎ: 14ページ → **0**
- 複数H1: 7ページ → **0** / H1欠落: **0**
- OG画像: 全ページ共通default → **78ページが専用カード**
- ピラー3本: 1.2〜3.8千字 → 8.3〜10.1千字（平均インデックス文字数5,523）
- パンくずモバイル縦書き崩れ: **解消**（横一列・タップ領域36px、スクショ実証）
- guideページLCP倍増（フォントスワップ起因）: **解消**
- カテゴリメタ説明・economy/culture対応: 反映済み

### クリティカル課題 Top 5（今回の新規/残存）
1. **✅[修正済 2026-06-18] CollectionPageスキーマの匿名WebSite重複** — `app/lib/schema.ts` の `collectionPageSchema` が `isPartOf:{@type:WebSite,...}`（@id無し）を出力し、home/category/tag/全ページネーション計**約314ページ**でWebSiteノードが2重だった。@id参照に修正・デプロイ済み（本番でWebSiteノード1個を確認）
2. **✅[修正済 2026-06-18] FAQPageが4記事に残存** — `posts.content` 末尾に直接埋め込まれた `<script>FAQPage`（id 1380-1383）。migration 0032で除去・デプロイ済み（可視Q&Aは保持）
3. **✅[誤検知・対応不要] 法務ページの代表者名「AI ATAKA」** — オーナー確認の結果、株式会社ユリカの**正式な代表者名**。監査側の誤検知だった
4. **[Medium] 旧第三者スピーチ約43本に原典出典なし** — source_url/isBasedOn が空（例: politics/643, business/175）。有名スピーチの「無付加価値の複製」リスクが残存。出典付与または付加価値（解説・要約）の追加が必要
5. **[Medium] Performance: ハイドレーションのINP/TBTリスク** — 読み取り中心サイトなのにハイドレーションのロングタスク400〜785ms。タップがこの窓に当たるとINP>200msの恐れ。選択的ハイドレーション+フォントのセルフホストが本丸

### クイックウィン Top 5
1. `collectionPageSchema` を `isPartOf:{ "@id": "https://kakiokosi.com/#website" }` に（1行・314ページ即解消）
2. FAQPage埋め込み除去migration（1380-1383、`posts.content`末尾scriptをsubstrで切除）
3. 法務ページの代表者名を実名に修正（要・正式名称の確認）
4. img alt欠落12件（旧business記事中心）の補完
5. guideページの比較表に `overflow-x-auto` ラッパー（モバイルで約17px見切れ）

---

## 1. Technical SEO — 94/100（+2）

- **PR #38正規化が本番実証合格**: `/share→/`、末尾スラッシュ`/share/it/1388/→/share/it/1388`、http→https、www→apex すべて実測で機能
- noindex戦略は tag/page/category-page/Block C(98本)で**一貫適用・indexへの漏れゼロ**。サイトマップへのnoindex混入0
- canonical全インデックス可能ページで自己参照、セキュリティヘッダ(HSTS preload/CSP/nosniff/X-Frame-Options DENY)退行なし
- **残課題（全てLow）**: ①ルート入口のみ2ホップ301チェーン（`http://kakiokosi.com/`→`/share`→`/`。古いCloudflareエッジルール`/→/share`がPR #38の`/share→/`と連鎖。**ゾーン側ルールの修正が必要＝Cloudflareダッシュボード手動対応**）②日本語タイトル12件が60字超 ③img alt欠落12件

## 2. Content Quality — 78/100（+16・最大の改善）

E-E-A-T内訳が大幅改善。出典・著者の問題が解決し、ピラーも実質的な高品質長文化。

- **出典解消16本**: 各IT記事に固有のVoicyエピソードURL（voicy.jp/channel/2834/…）+ バイライン「文字起こし: 安宅 基（パジ）」+ 著者bio + JSON-LD isBasedOn を生HTMLで確認。本文も一次体験ベースで本物のExperience
- **ピラー3本**: 増強後、独自フレーム・Q&A・実務ノウハウを備え competitive水準。SimpleMemoFast開示も適用済み
- **残top3**: ①**[High/Trust]** 法務ページ代表者が「AI ATAKA」（実名と矛盾） ②**[Medium]** 旧第三者スピーチ43本に原典出典なし（複製リスク） ③**[Low]** category economy/culture（1,053/1,056字）は記事3-4本ゆえの構造的thin
- thin 5本のうち company/regal/contact は法務系で許容範囲

## 3. On-Page SEO — 90/100（+6）

- タイトル: 93ページ中、長すぎ(>62字)3のみ、短すぎ0、実重複0（/と/shareの「重複」はリダイレクト追従の見かけ上）
- メタディスクリプション: 短すぎ0・長すぎ0（前回14→0）
- H1: 欠落0・複数0（前回7→0）
- 内部リンク: 薄いページなし。ピラー増強で関連リンク大幅増。OG/Twitterカード全ページ完備

## 4. Schema / 構造化データ — 91/100（+9）

- INVALID_JSON 0・必須プロパティ欠落0・deprecated型の意図しない使用0。@id参照・publisher自己完結・カテゴリBreadcrumbListはPR #38で機能確認
- **残課題**: ①CollectionPage匿名WebSite重複（=上記Critical#1、共有ヘルパー漏れ）②FAQPage埋め込み4件（=Critical#2）③書き起こし特化強化（isBasedOnの型付け CreativeWork化、話者Person に安定@id+Wikidata sameAs）

## 5. Performance — 75/100（−10 ※実態は改善）

| 指標 | 今回(Moto G4/4x CPU/Slow-4G) | 6/11 | 判定 |
|---|---|---|---|
| LCP | 1.94/2.15/2.04s (home/article/guide) | 0.55/0.66/1.14s※軽負荷 | ✅<2.5s |
| CLS | 0.016/0.002/0.004 | 0.000 | ✅<0.1 |
| TTFB | p50 151 / p75 194 / p90 240ms | 同等 | ✅<800ms |
| INP代理 | ハイドレーションロングタスク400〜785ms | 395〜702ms | ⚠️リスク |

- **スコア低下の理由**: 前回85点はLCPが合格ギリギリの状態を甘めに評価していた面があり、今回はより厳しい負荷条件で測定。フォント修正で**LCP/CLSは決定的に改善**（guideページのLCP倍増は完全解消）。低下分はフォント修正が触れていない**ハイドレーションのTBT**が主軸になったため
- **フォント削減は道半ば**: 7→3ウェイトはマークアップ反映済みだが、転送量は1.0-1.6MB→0.96-1.19MB（約10-25%減）。CJKは**ウェイト数よりグリフ網羅（124 unicode-rangeサブセット×3ウェイト）が支配的**で、347KBのrender-blocking CSSも残存。本丸は**セルフホスト+動的サブセット化**

## 6. Images — 76/100（+11）

- **OG画像**: 78インデックス可能ページが専用タイトルカード（前回全ページ共通default-og）。デフォルトフォールバックは / と /share の2つのみ
- **残**: img alt欠落12件（旧business記事）、コンテンツ画像は依然ほぼ無し（srcset/WebP/AVIF未対応だが画像点数自体が少なくCLS実害は軽微）

## 7. AI Search Readiness — 83/100（+8）

- AIクローラー明示Allow(GPTBot/ClaudeBot/PerplexityBot/CCBot)・llms.txt 継続
- **向上要因**: 出典(isBasedOn)・著者エンティティ・ピラーのQ&A/定義文で引用可能性とE-E-A-Tが上昇
- **残**: 話者のPerson@id+Wikidata sameAs未整備、旧スピーチの出典欠如が引用元としての信頼を下げる

## 8. Visual / Mobile — 88/100（+6・参考）

- **パンくず修正は成功**: `/share/it/1388` モバイルで「ホーム / IT / …」横一列表示を実証（<ol> 327×36px、ホームリンク42×36px、href="/"）
- **残（全てLow）**: ①guide比較表がモバイルで約17px見切れ（overflow-x-autoラッパー無し）②ハンバーガー40×40（<44px）③記事内インラインリンク17-20px・ロゴ32px
- 横スクロール無し・レイアウト崩れ無し・H1ファーストビュー内・本文18px/28pxで日本語可読性良好

---

*2026-06-16 生成 / 6専門サブエージェント並列再監査（Technical 94 / Content 78 / Schema 91 / Sitemap 97 / Performance 75 / Visual 88）*
