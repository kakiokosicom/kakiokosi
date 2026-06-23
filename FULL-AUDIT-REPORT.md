# kakiokosi.com フルSEO監査レポート

**実施日:** 2026-06-23（前回: 06-18 / 06-16 / 06-11 / 初回: 03-28）
**クロール:** 500 URL（**全200・エラー0**）、インデックス可能 93、サイトマップ 92 URL
**手法:** 差分監査 — 新規クロール全データ + 変更ディメンションの本番スポット検証。前回(06-18)の6エージェント深掘り分析が基盤（以後の変更はPR #42/#43の小規模改善2本のみで、いずれ検証済みのため再fan-outは省略）

---

## エグゼクティブサマリー

### 総合SEOヘルススコア: **92 / 100**（6/18: 91 → +1 / 初回比 +18）

| カテゴリ | 今回 | 6/18 | 重み | 加重 |
|---|---|---|---|---|
| Technical SEO | 97 | 95 | 25% | 24.25 |
| Content Quality | 85 | 84 | 25% | 21.25 |
| On-Page SEO | 92 | 92 | 20% | 18.4 |
| Schema | **97** | 95 | 10% | 9.7 |
| Performance | 93 | 93 | 10% | 9.3 |
| Images | 87 | 87 | 5% | 4.35 |
| AI Search Readiness | 87 | 86 | 5% | 4.35 |

**ビジネスタイプ**: パブリッシャー（講演・スピーチ書き起こしアーカイブ、日本語）

**総評**: PR #42/#43 でSchema（95→97）とContent/AI（+1）が微増し総合92点。**コード側で安全に対応できるSEO改善はほぼ出し切り、実質的な天井に到達**。残る伸びしろは①Cloudflareダッシュボード手動作業（2ホップ301）②話者エンティティ等のデータ整備前提タスク——いずれも本セッションのコード作業では完結できない性質。クロール500URL全200・エラー0、回帰なし。

### この期間（PR #42/#43）で解消・改善した項目
- Schema: **159 Article全てが`@id`+`isPartOf:{@id:#website}`でrootグラフに連結**（従来は孤立ノード）、isBasedOn 38本が音声/動画/著作物に**型分岐**（AudioObject/VideoObject/CreativeWork）
- Content/E-E-A-T: /about に主な執筆・編集者（安宅 基／パジ）のプロフィールを明記、外部プロフィールへリンク
- Sitemap: ホームの`<lastmod>`が最新記事更新を反映（06-11 stale → 06-18）

### ✅ 06-23に解消: 入口の2ホップ301
`http://kakiokosi.com/ → /share → /` の2ホップを解消（Cloudflareリダイレクトルール#1を無効化→ルール#3のhttp→https catch-allにフォールスルー）。本番検証済み: `http://kakiokosi.com/` → `https://kakiokosi.com/`（**1ホップ**）、www→apex・深いhttpパスも正常。Technical 95→97。

### 残課題 Top 4（全て低優先 or データ整備前提）
1. **[Low] 話者Person + Wikidata sameAs** — Articleの`about`に話者（孫正義・ジョブズ等）をエンティティ化。差別化の伸びしろ最大だが、話者→QIDの対応データ整備が前提
2. **[Low] 出典なお16本** — 大半は一次ライブ記録/原典消失で正当（society/936のみ過去に回収試行も検証可能URLなし）。「一次記録」明記でExperience資産として再フレーム可
3. **[Low] 残thin 5本** — company/regal/contact（法務系・許容）、category economy/culture（記事3-4本ゆえの構造的）
4. **[Low] 長いタイトル3本（>62字）** — index済みのため改変は見送り継続（SEOリスク＞効果）

### クイックウィン
コード側のクイックウィンは出尽くしています。次の一手で効果が大きいのは **話者Personエンティティ**（要データ整備）と **Cloudflare 2ホップ301の手動修正**（5分・ダッシュボード）。

---

## 1. Technical SEO — 97/100（+2）
- クロール500URL全200・エラー0、canonical 93自己参照、noindex 405一貫適用、サイトマップnoindex混入0、HSTS preload/CSP `font-src 'self'`/nosniff/X-Frame-Options 退行なし
- **06-23: 入口2ホップ301を解消**（リダイレクトルール#1無効化）。`http://kakiokosi.com/`→`https://kakiokosi.com/` が1ホップに
- 残: CSP `'unsafe-inline'`（将来nonce化）のみ

## 2. Content Quality — 85/100（+1）
- /about に運営者バイオ追加でE-E-A-T微増。出典22本（検証済み原典URL）・著者バイライン100%・dateModified全2026年は維持
- 残: 出典なお16本（大半正当）、残thin 5本（許容範囲）

## 3. On-Page SEO — 92/100
- タイトル長すぎ3のみ、メタ説明/H1/canonical 問題ゼロ、内部リンク良好、alt欠落0

## 4. Schema — 97/100（+2）
- **159 Article全てがrootグラフ連結**（@id + isPartOf #website）、isBasedOn 38本型分岐、FAQPage/INVALID_JSON/匿名WebSite重複/dangling @id すべて**0**（全500ページ実パース由来のクロール集計で確認）
- 残: 話者Person+Wikidata（about、要データ整備）、speakable範囲の精緻化

## 5. Performance — 93/100
- フォントセルフホスト効果を維持: LCP<1s級、CLS極小、TTFB p50 139/p90 212ms、Google Fonts参照0、woff2 immutable
- 残: 単一ハイドレーションロングタスク、Serif900サブセット縮小余地（軽微）

## 6. Images — 87/100
- インデックス可能215枚すべてalt有り、OG専用カード78ページ
- 残: コンテンツ画像のsrcset/WebP（CLS実害軽微）

## 7. AI Search Readiness — 87/100（+1）
- isBasedOnの型分岐（Audio/Video）で原典の実体がAIに伝わりやすく。AIクローラーAllow・llms.txt・出典・著者・Q&A可視コンテンツ維持
- 残: 話者エンティティ

## 8. Visual / Mobile — 92/100（前回値維持）
- guide表の横スクロール化・ハンバーガー44px・フォントtofuなしを6/18に確認済み。本監査での回帰なし

---

## 改善の軌跡
| 監査 | 総合 | 主な施策 |
|---|---|---|
| 03-28 | 74 | 初回（WP移行直後） |
| 06-11 | 79 | （ベースライン再測定） |
| 06-16 | 86 | 出典遡及・ピラー増強・OG画像・リダイレクト・フォント削減（PR #38） |
| 06-18 | 91 | schema整理・フォントセルフホスト・出典付与・alt/年号/a11y（PR #39-#41） |
| **06-23** | **92** | Article @idグラフ連結・isBasedOn型化・about bio・sitemap lastmod（PR #42/#43）＋ **入口2ホップ301解消**（Cloudflareルール#1無効化、Technical 97） |

*2026-06-23 差分監査。入口2ホップ301の手動解消によりTechnical 97。残りは話者Person等のデータ整備前提タスクと新規コンテンツ追加が主戦場。改善履歴 PR #38-#43 は git 参照。*
