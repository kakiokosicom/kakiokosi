# kakiokosi.com SEOアクションプラン

**更新:** 2026-06-18
**現在スコア:** 86/100（6/11: 79 / 3/28: 74）→ HIGH#1-2 修正済みで Schema 91→96 相当
**目標スコア:** 90/100+

PR #38（出典遡及・ピラー増強・OG画像・リダイレクト・schema・フォント）はマージ＆本番デプロイ済み。本プランは再監査(2026-06-16)で残った取りこぼしと新規発見。致命的問題はゼロ。

---

## ✅ 完了済み（2026-06-18、ブランチ seo/schema-cleanup-followup・本番デプロイ済み）

### 1. ✅ CollectionPageスキーマの匿名WebSite重複を解消【完了】
`app/lib/schema.ts` の `collectionPageSchema` を `isPartOf:{ "@id": ".../#website" }` に修正。
本番確認: home/category/tag すべてWebSiteノードが2→**1個**に（約314ページに波及）。

### 2. ✅ FAQPage埋め込みの除去（4記事）【完了】
migration 0032 で id 1380-1383 の `posts.content` 末尾の `<script>FAQPage` を切除（本番適用済み）。
本番確認: FAQPage=0、可視「よくある質問」本文は保持、末尾`</section>`で正常終端。

### 3. ✅ 法務ページの代表者名「AI ATAKA」【誤検知・対応不要】
**監査の誤検知**。「AI ATAKA」は株式会社ユリカの**正式な代表者名**とオーナー確認済み（2026-06-18）。変更不要。
※記事著者バイライン「安宅 基（パジ）」とは表記が異なるが、法人代表名 vs 著者ペンネームとして意図的。

## HIGH / MEDIUM（残作業）

### 4. img alt欠落12件の補完【旧business記事中心】
**影響:** a11y・画像SEO。例: /share/business/157 等。WP移行残骸。

---

## ✅ 完了済み（2026-06-18、ブランチ seo/sources-and-selfhost-fonts・本番デプロイ済み）

### 5. ✅ 旧第三者スピーチの出典付与【完了: 22本に検証済URL】
migration 0033。出典対象39本を4調査エージェントで原典特定→**筆者がcurl/oEmbedで最終200を独立再検証**し、**22本**に source_url を付与（TED 8 / 著名スピーチ10 / 国内2 / 国内その他2）。例: 87=Jobs Stanford公式YouTube、91=TED JR、93=オバマ大統領公式アーカイブ、643=UN Web TV(ムヒカ)、881=Berkeley公式PDF。記事テンプレが「出典」ボックス + Article schema `isBasedOn` を自動表示（本番確認済み）。
残16本（72,73,76,77,78,79,84,86,175,185,311,323,325,641,936,82）は**原典が実際に消失**（Ustream閉鎖・YouTube動画削除・ニコ生タイムシフト終了）で確証URLなし→捏造せず付与見送り。あわせて1380-1383（paji原作のhow-to）に著者付与。
※調査で年号誤りも検出（id133タイトル「Yes We Can」は実際2008シカゴ勝利演説、id85は2011-02-09、id185は2012）— 本文修正は将来タスク。

### 6. ✅ フォントのセルフホスト化【完了: 1.7MB・3rd-party撤廃】
`scripts/generate-fonts.py`。Noto Sans JP 400/700 + Noto Serif JP 900 を、**サイト全コンテンツ実使用グリフ＋常用漢字2,136＋仮名/約物/ラテン/IPA基底レンジ**(計4,929字)にサブセットし content-hash 付き woff2 を出力（計**1.74MB**、全サブセット自前ホスト時の18MBを回避）。@font-faceは `app/lib/font-manifest.ts` 経由で `root.tsx` の`<head>`にインライン、Sans400をpreload。Google Fonts css2 の **344KB render-blocking CSS + fonts.googleapis/gstatic 接続を完全撤廃**、CSPを `font-src 'self'` に厳格化、`/fonts/*` を `public/_headers` で immutable キャッシュ。**現行コンテンツのCJK/仮名tofuゼロ**を実検証（残欠落は元々Noto JPに無いIPA/アラビアのみ＝退行なし）。本番確認済み。
※真の「ページ別動的サブセット(0.1-0.4MB)」は3日毎cronの新規記事でtofuリスクがあり不採用。常用漢字込みの固定サブセットで将来記事も概ね保護し、グリフ網羅は維持。新記事で稀字が増えたら `python3 scripts/generate-fonts.py` 再実行→コミット。

## MEDIUM（残作業・1ヶ月以内）

### 7. ハイドレーションのメインスレッド負荷削減【INP/TBT・Performance残課題の本丸】
**影響:** INPの余裕・Performanceスコアを高80s帯へ
読み取り中心ページ（約90%が静的テキスト）。インタラクティブ島の選択的/遅延ハイドレーション + 111-116KB(gzip)バンドルのコード分割でロングタスク400-785msを<50msチャンクに分割。フォント対応が済んだので、Performance改善の残る最大レバーはこれ。

### 8. category economy/culture の増強 or 整理
1,053/1,056字（記事3-4本ゆえの構造的thin）。記事増加まで現状維持でも可。

---

## LOW（バックログ）

| # | タスク | 影響 |
|---|---|---|
| 9 | **ゾーン側リダイレクト修正**: `http://kakiokosi.com/`→`/share`→`/`の2ホップ解消。Cloudflareダッシュボード(kakiokosiゾーン)で`/→/share`ルールを`/→/`に。**コード外・手動** | 入口リダイレクトの最適化 |
| 10 | guide比較表に `overflow-x-auto` ラッパー（モバイル約17px見切れ） | モバイルUX |
| 11 | 長いタイトル12件(>60字)の短縮（business/881=76字 等） | SERP見切れ |
| 12 | タップターゲット<44px（ハンバーガー40×40、インラインリンク17-20px、ロゴ32px） | モバイルa11y |
| 13 | isBasedOn の型付け（CreativeWork化、可能ならAudioObject）+ 話者Personに安定@id・Wikidata sameAs | AI検索/Knowledge Graph |
| 14 | `/share/tag/*` 空タグの応答（502/200ゆらぎ→404が理想） | クローラ効率 |

---

## スコア予測

| アクション群 | 期待効果 |
|---|---|
| HIGH 1-4（軽量・即日） | Schema 91→96, Content +2, On-Page +1 → 総合 **87-88** |
| MEDIUM 5-7（出典・フォント・ハイドレーション） | Content 78→82, Performance 75→85 → 総合 **89-91** |
| LOW 8-14 | 微増・体験改善 → **91-92** |

---

*2026-06-16 / 6専門サブエージェント再監査より生成。前回プランはgit履歴参照。*
