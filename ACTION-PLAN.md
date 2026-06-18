# kakiokosi.com SEOアクションプラン

**更新:** 2026-06-18
**現在スコア:** 91/100（6/16: 86 / 6/11: 79 / 初回: 74）
**状態:** 致命的問題ゼロ。PR #38-#41 で主要課題は解消済み。残りは Low〜中の磨き込み。

---

## ✅ 完了済み（PR #38-#41・全て本番デプロイ＆検証済み）
- コンテンツ品質: IT記事の出典・著者、ピラー3本増強、薄ページ増強
- 出典付与: 旧第三者スピーチ22本に検証済み原典URL（+isBasedOn）
- Schema: FAQPage除去、CollectionPage @id化（WebSite重複解消）、isBasedOn CreativeWork型
- Performance: **フォントセルフホスト化**（render-blocking CSS撤去→TBT 400-785ms→56-66ms、LCP<1s）
- Technical: /share→/ 301統合、末尾スラッシュ301、パンくず修正
- 画像: OG専用カード78ページ、旧WP画像11枚に記述的alt
- a11y: guide表の横スクロール化、ハンバーガー44px
- 正確性: 年号誤り訂正（id85/185）

---

## 残作業

### MEDIUM（schema完全性・低工数・高効果）

#### 1. Article schemaを#websiteグラフに連結
**影響:** 構造化データの完全性（159記事が現在rootグラフから孤立）
**対象:** `app/routes/share.$category.$id.tsx`（Article定義）
Articleに `@id`（記事URL#article等）と `isPartOf: { "@id": "https://kakiokosi.com/#website" }` を追加。PR #40で実証済みの`schema.ts`パターンを流用。これで#website参照が339→498に連結。

#### 2. isBasedOnの音声/動画型化
**影響:** エンティティ精度・リッチ表示
**対象:** `app/routes/share.$category.$id.tsx:162-169`
ソース型は自明（voicy.jp 16=AudioObject / youtube・ted 14=VideoObject / それ以外=CreativeWith据置）。既存の`post.voicy_url`/`spotify_url`判定を流用して分岐。

#### 3. society/936（登丸賢美 TED）の出典付与
**影響:** 出典カバレッジ（残16本中、唯一回収可能とcontent agentが判定）
TEDトークURLを調査・curl検証して付与（migration）。

### LOW

| # | タスク | 状態/メモ |
|---|---|---|
| 4 | **入口2ホップ301**（`http://→/share→/`） | ⚠️**要手動**: Cloudflareダッシュボード(kakiokosiゾーン)で`/→/share`ルールを`/→/`に。wrangler権限外 |
| 5 | /aboutに運営者バイオ段落（paji/安宅基の実績） | E-E-A-T。content/about本文の追記（migration） |
| 6 | ホームのサイトマップlastmodを子記事にcascade | 現在7日stale。`sitemap[.]xml.tsx`でホームのlastmodを最新記事から算出 |
| 7 | パンくず等リンクのタップ領域<44px | モバイルa11y。py拡張 |
| 8 | 話者Person+Wikidata sameAs（Articleのabout） | 差別化大だが話者→QIDデータ整備が前提 |
| 9 | Serif900サブセットを見出し用に縮小 | 初回フォント1.66MBの内668KB。見出し実使用字に絞れば削減 |
| 10 | CSP `'unsafe-inline'`のnonce/hash化 | セキュリティ硬化 |

### 判断保留（やらない理由あり）
- **長いタイトル3本の短縮**: index済みタイトル改変のSEOリスク＞効果
- **ピラーへのFAQPage schema再追加**: 可視Q&Aは既にあるが、FAQPageは2023年8月以降リッチリザルト対象外。再追加の実益が薄く、除去方針との一貫性を優先
- **/companyの代表者「AI ATAKA」**: 正式名称（オーナー確認済み・誤検知ではない）

---

## スコア内訳と予測
| カテゴリ | 現在 | 上限到達に必要な作業 |
|---|---|---|
| Technical 95 | 入口2ホップ301（手動）で97+ |
| Content 84 | /about運営者バイオ + 出典936 で 86-87 |
| Schema 95 | Article @id連結 + isBasedOn型化 で 98 |
| Performance 93 | ほぼ天井（Serif縮小で微増） |
| **総合 91** | 上記MEDIUM 3件で **92-93**、手動301含めて **93-94** |

---

*2026-06-18 第4回監査。改善履歴 PR #38-#41 は git 参照。*
