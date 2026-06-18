# kakiokosi.com フルSEO監査レポート

**実施日:** 2026-06-18（前回: 2026-06-16 / 06-11 / 初回: 03-28）
**クロール:** 500 URL（**全200・エラー0**）、インデックス可能 93、サイトマップ 92 URL
**手法:** 6専門サブエージェント並列分析（technical / content / schema / sitemap / performance / visual）
**位置づけ:** PR #39/#40/#41（schema整理・フォントセルフホスト・出典付与・alt/年号/a11y）の**累積効果測定**
**詳細:** `/tmp/seo-audit-0618/reports/` / `screenshots/audit4-*.png`

---

## エグゼクティブサマリー

### 総合SEOヘルススコア: **91 / 100**（6/16: 86 → **+5** / 初回比 +17）

| カテゴリ | 今回 | 6/16 | 重み | 加重 |
|---|---|---|---|---|
| Technical SEO | 95 | 94 | 25% | 23.75 |
| Content Quality | 84 | 78 | 25% | 21.0 |
| On-Page SEO | 92 | 90 | 20% | 18.4 |
| Schema | 95 | 91 | 10% | 9.5 |
| Performance | **93** | 75 | 10% | 9.3 |
| Images | 87 | 76 | 5% | 4.35 |
| AI Search Readiness | 86 | 83 | 5% | 4.30 |

**ビジネスタイプ**: パブリッシャー（講演・スピーチ書き起こしアーカイブ、日本語）

**総評**: 一連の改善で総合91点（A-相当）に到達。**最大の伸びはPerformance（75→93）**で、フォントのセルフホスト化が render-blocking CSS を撤去した結果、ハイドレーション時のメインスレッド競合まで解消し、**TBTが400-785ms→56-66msに激減**（前回先送りしたINP課題が副次的に解決）。残る課題はすべてLow〜中で、致命的問題ゼロ。クロール500URL全200・エラー0。

### この期間（PR #39/#40/#41）で解消が確認できた項目
- Performance: LCP 0.89-0.98s / CLS 0.003-0.006 / TTFB p75 173ms、ハイドレーションTBT 56-66ms（render-blocking CSS撤去の波及効果）
- Schema: FAQPage **0**、INVALID_JSON **0**、匿名WebSite重複 **0**（CollectionPage 315/315が@id参照）、isBasedOn 38/38が`CreativeWork`型、dangling @id **0**
- 出典: 旧第三者スピーチ **22本に検証済み原典URL**（出典ボックス+isBasedOn表示）、著者バイライン 59記事100%
- 画像: 空alt **0**（旧WP画像11枚に実画像確認済みの記述的alt）、OG専用カード78ページ
- フォント: Google Fonts完全撤廃（自ドメインwoff2・immutable・サイト共有、2回目遷移は0バイト再取得）
- a11y/モバイル: guide比較表の横スクロール化（見切れ解消）、ハンバーガー44px
- 正確性: 年号誤り訂正（id85/185）

### クリティカル課題 Top 5（残存・全てLow〜中）
1. **[Medium] Article schemaが#websiteグラフから孤立** — 159 Articleに `@id`・`isPartOf:{@id:#website}` が無く root グラフと未連結。`app/lib/schema.ts`のパターン流用で低工数。schema完全性の最後のピース
2. **[Medium] isBasedOnの音声/動画型化** — voicy 16→AudioObject / youtube・ted 14→VideoObject に分岐（現状CreativeWork一律）。エンティティ精度・リッチ化に有効、低工数
3. **[Low] 入口の2ホップ301**（`http://→/share→/`）— Cloudflareゾーン側ルール起因。ダッシュボードでターゲットを`/`直指定に。**コード外・手動**（wrangler権限外）
4. **[Low] /aboutに運営者バイオ不在** — paji/安宅基の実績（元livedoor）が可視ページに出ていない（JSON-LD sameAsのみ）。E-E-A-Tの伸びしろ
5. **[Low] 出典なお16本**（うち society/936 TEDのみ回収可能、他は孫正義決算会見・小沢会見等の一次ライブ記録/まとめで原典消失）— 「一次記録」明記で Experience 資産として再フレーム可

### クイックウィン Top 5
1. Article schemaに`@id`+`isPartOf:{@id:#website}`追加（159記事をグラフ連結）
2. isBasedOnをvoicy→AudioObject / youtube・ted→VideoObjectに分岐
3. society/936（登丸賢美 TED）の原典URL再調査・付与
4. ホームページのサイトマップlastmodを子記事にcascade（現在7日stale）
5. /aboutに運営者プロフィール段落を追加（E-E-A-T）

---

## 1. Technical SEO — 95/100（+1）
- クロール500URL全200（前回の/share/tag/bkd 502は一時障害と確定）。canonical 93自己参照・cross 0、noindex 405一貫適用・双方向リーク0、サイトマップnoindex混入0
- フォントセルフホスト後も整合: CSP `font-src 'self'`一致、preconnect/gstatic残存0、woff2はimmutable+CF cache HIT、回帰なし
- 残: **入口2ホップ301**（Cloudflareゾーン側・手動）、CSP `'unsafe-inline'`（将来nonce化）、記事LCP画像preload未設定（テキスト主導で影響小）

## 2. Content Quality — 84/100（+6）
- **Trustが牽引（+10）**: 旗艦の第三者スピーチ6本を精読＋全出典URLをcurl 200で再確認（obamawhitehouse / c-span / ted.com / haaretz / Stanford公式YT）。出典ボックスUIとisBasedOnが完全同期、著者バイライン59記事100%、dateModified全2026年
- 画像215枚・alt欠落0。残thin5本は許容（法務3・カテゴリ2）。AI補助のIT記事は2025年9月QRG指標クリア
- 残: ①/about運営者バイオ不在（最大の伸びしろ。※/companyの代表者「AI ATAKA」は正式名称＝対応不要）②ピラーに可視FAQはあるがFAQPage schema無し（ただしリッチリザルト対象外のため判断保留）③出典なお16本（大半は正当な一次記録/原典消失）

## 3. On-Page SEO — 92/100（+2）
- タイトル長すぎ3のみ・短すぎ0・実重複0、メタ説明 短0/長0、H1 欠落0/複数0、canonical欠落0、内部リンク良好、alt欠落0、OG/Twitterカード完備

## 4. Schema — 95/100（+4）
- 500ページ全数実パース: FAQPage/HowTo 0、CollectionPage isPartOf 315/315が@id参照、isBasedOn 38/38 CreativeWork型、@context違反0・相対URL0・日付ISO違反0・dangling @id 0、Article必須8項目 159/159完備
- 残: ①Article を#website/mainEntityOfPageへ連結（159記事が孤立）②isBasedOnの音声/動画型化 ③話者Person+Wikidata（about、要データ整備）

## 5. Performance — 93/100（+18 ⚡最大の改善）
| 指標 | 今回(Moto G4/4x/Slow-4G) | 6/16 | 判定 |
|---|---|---|---|
| LCP | 0.89-0.98s | 1.94-2.15s | ✅ |
| CLS | 0.003-0.006 | 0.016 | ✅ |
| TTFB | p50 139 / p75 173 / p90 222ms | 同等 | ✅ |
| ハイドレーションTBT | **56-66ms** | 400-785ms | ✅ |

- **フォントセルフホスト化が決定打**: 344KB render-blocking CSS と2つのcross-origin接続を撤去 → ハイドレーション窓の競合が消えTBT激減。woff2は1.66MB（初回のみ・content-hash・immutable・2回目遷移は0バイト）、tiptap等は公開ページに不在
- 残（全て軽微・合格圏内）: 単一110-150msロングタスク、Serif900 668KB（見出し用・サブセット縮小余地）、TTFB p99 451ms（Worker/D1コールドスタート）

## 6. Images — 87/100（+11）
- インデックス可能215枚すべてalt有り（旧WP画像11枚は実画像確認の記述的alt）、OG専用カード78ページ
- 残: コンテンツ画像は依然少なめ、レガシー画像のsrcset/WebP未対応（CLS実害は軽微）

## 7. AI Search Readiness — 86/100（+3）
- AIクローラー明示Allow・llms.txt・出典(isBasedOn)・著者・ピラーのQ&A可視コンテンツで引用適性向上
- 残: 話者Personエンティティ未整備、出典16本欠如、ピラーの可視FAQをschema化するかは要判断

## 8. Visual / Mobile — 92/100（+4）
- **表見切れ解消**: mojikoshi-tool比較表は`@media`で`overflow-x:auto`化（scrollWidth 492/clientWidth 327、右端列までスクロール可、ドキュメント横スクロールは全ページ0）。ハンバーガー44px達成、フォントセルフホスト後もtofu/崩れなし、旧WP画像10枚正常表示
- 残: パンくず等の一部リンクが高さ36px（<44px）、比較表に横スクロールのアフォーダンス（影/フェード）なし

---

*2026-06-18 生成 / 6専門サブエージェント並列監査（Technical 95 / Content 84 / Schema 95 / Sitemap 99 / Performance 93 / Visual 92）。改善履歴: PR #38-#41。*
