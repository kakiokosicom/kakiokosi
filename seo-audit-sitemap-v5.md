# Sitemap v5 監査レポート

**URL:** https://kakiokosi.com/sitemap.xml
**日付:** 2026-07-02
**ソースファイル:** `app/routes/sitemap[.]xml.tsx`
**前回:** v3 (2026-03-28, `seo-audit-sitemap-v3.md`) — サイトマップ専門レポートとしては前回。v4 (06-23) 時点は 92 URL、以降 IT 記事 3 本 (1389/1390/1391) 追加で 95 URL。

---

## スコア: 97 / 100（v3 比 +9）

v3 レポートには数値スコアがなく「Verdict: PASS（low 1 件）」のみ。v3 の実態（etc カテゴリの lastmod 欠落、214 URL 中 204 が同一 lastmod = 95.3%、当時タグページ 48 件を収載）から遡及ベースラインを **88** と算定し、v5 は **97（+9）**。

| 増減要因 | 影響 |
|---------|------|
| etc カテゴリ lastmod 欠落 → HAVING >= 1 で空カテゴリ自体を除外（v3 唯一の指摘が解消） | + |
| 同一 lastmod 95.3% → 最大クラスタ 28.4%（11 種の実日付に分散） | + |
| 記事 lastmod と JSON-LD dateModified が 62/62 完全一致（実測検証） | + |
| noindex 化したタグ 291 件・Block C 記事 100 件・ページネーション 16 件を漏れなく除外、混合シグナルゼロ | + |
| インデックス可能ページ ⇔ サイトマップの双方向整合 0 欠落・0 過剰 | + |
| 静的ページが `publicPages` ハードコード allow-list（新規静的ページ追加時に手動更新が必要 = 将来ドリフトのプロセスリスク） | -1 |
| IndexNow 未実装（Bing → ChatGPT/Copilot 経路が未活用。AI 引用性重視の方針に対する機会損失） | -1 |
| RSS の軽微な不足（lastBuildDate なし、20 件上限、抜粋のみ配信） | -1 |

---

## サマリー

| 指標 | 値 | v3 (03-28) |
|------|-----|------------|
| 総 URL 数 | **95** | 214 |
| 記事ページ | 62 | 143 |
| カテゴリページ | 8 | 9 |
| タグページ | 0（noindex 化に伴い除外） | 48 |
| 静的ページ | 24 | 13 |
| トップページ | 1（`/`。v3 時は `/share`） | 1 |

URL 数減はコンテンツ削除ではなく、**noindex 記事（Block C・逐語転載系 100 件）とタグページ 291 件の意図的除外**による。インデックスさせたいページだけを載せる「クリーンな」サイトマップに転換済み。

**判定: PASS** — 全 Critical / High / Medium チェック合格。改善提案 3 件（いずれもサイトマップ仕様違反ではない）。

---

## 検証チェック

### 1. XML 構造

**PASS**

- well-formed（パースエラーなし）
- ルート要素 `urlset`、名前空間 `http://www.sitemaps.org/schemas/sitemap/0.9` 正しい
- `<loc>` 重複なし（95 件ユニーク）
- `priority` / `changefreq` は 0 件（非推奨タグの排除を維持）
- 50,000 URL 制限に対し 95 件（0.19%）— **分割・サイトマップインデックスは不要**

### 2. lastmod 形式・欠落・未来日（95 件全数チェック）

**PASS**

- 形式: 95/95 が `YYYY-MM-DD`（ISO 8601 日付）
- 欠落: 0 件（v3 で唯一の指摘だった `/share/category/etc` の欠落は、`HAVING COUNT(pc.post_id) >= 1` により空カテゴリごと除外され解消）
- 未来日（> 2026-07-02）: 0 件
- 異常に古い日付: `/share/company` と `/share/regal` の 2016-08-02 のみ。実際に更新されていない会社概要・特商法ページであり**正直な値**（問題なし）

### 3. トップページ lastmod = 最新記事

**PASS**

```xml
<loc>https://kakiokosi.com/</loc>
<lastmod>2026-06-28</lastmod>
```

最新記事 it/1391（6/28 公開）の lastmod `2026-06-28` と一致。コードは v3 当時の `results[0]?.updated_at`（最新「公開」記事に依存）から、**全記事の MAX(updated_at) を reduce で取る方式**に改善されており、「古い記事だけ更新した場合」もトップの lastmod が正しく動く。

### 4. 記事 lastmod = JSON-LD dateModified（62 件全数照合）

**PASS — 62/62 完全一致、不一致 0 件**

各記事の保存 HTML から JSON-LD `Article.dateModified` を抽出し、サイトマップ lastmod と照合。全件一致（datePublished フォールバックの使用も 0 件 = 全記事が dateModified を持つ）。構造化データとサイトマップのシグナルが完全に揃っている。

### 5. HTTP ステータス / リダイレクト / noindex / canonical（95 件全数、クロールデータ照合）

**PASS**

| チェック | 結果 |
|---------|------|
| 非 200 | 0 件 |
| リダイレクト | 0 件 |
| noindex ページの混入 | 0 件 |
| canonical 不一致 | 0 件（全 URL が自己 canonical） |

### 6. クロール ⇔ サイトマップ整合（500 ページクロールと双方向照合）

**PASS — 双方向 0 欠落**

- サイトマップにあってクロールで問題のある URL: 0
- インデックス可能（200・非 noindex・自己 canonical・HTML）なのにサイトマップにない URL: **0**
- `/share`（一覧トップ）は canonical が `https://kakiokosi.com/` を指すため除外が正しい

### 7. RSS フィード /share/feed.xml（ライブ取得）

**PASS**

- HTTP **200**、Content-Type: `application/rss+xml; charset=utf-8`
- RSS 2.0 として正常にパース、自己参照 `<atom:link rel="self">` あり
- アイテム 20 件。**最新アイテム = it/1391「NFTの投機はなぜ…」 Sun, 28 Jun 2026 09:00:57 GMT（6/28 記事あり）**
- 各 item: title / link / guid (isPermaLink) / description / pubDate / category

軽微な不足（減点対象だが低優先）:
- `lastBuildDate` なし
- description が抜粋のみ（約 118 字）。AI クローラー向けには `content:encoded` での全文配信が引用材料として有利（逐語書き起こしの全文を出す判断はコンテンツ戦略次第）
- カテゴリ別フィード（`share.category.$slug.feed[.]xml.tsx`）もルートとして存在

### 8. robots.txt

**PASS**

- 最終行に `Sitemap: https://kakiokosi.com/sitemap.xml` あり
- Disallow は `/auth/` `/dashboard/` `/admin/` のみ — サイトマップ URL との競合なし
- GPTBot / ClaudeBot / Google-Extended / PerplexityBot / Bytespider / CCBot に `/share/` と `/sitemap.xml` を明示 Allow（AI 引用戦略と整合）

### 9. ホスト変種の到達性

**PASS（リダイレクトで到達可能）**

| URL | 結果 |
|-----|------|
| `http://kakiokosi.com/sitemap.xml` | 301 → https（1 ホップ） |
| `https://www.kakiokosi.com/sitemap.xml` | 301 → apex（1 ホップ） |
| `http://www.kakiokosi.com/sitemap.xml` | 301 → `https://www` → apex（2 ホップ。実流入がほぼない組み合わせで許容範囲） |

---

## ジェネレーター（ソースコード）と出力の整合

**判定: 完全一致** — `app/routes/sitemap[.]xml.tsx` のロジックと観測された出力 XML の間に乖離なし。

| コードのロジック | 観測された出力 | 一致 |
|-----------------|---------------|------|
| `WHERE status='published' AND noindex=0`（migration 0024 の Block C 除外コメントあり） | 記事 62 件収載。クロールで確認した noindex 記事 100 件はすべて不収載 | 一致 |
| タグページはサイト全体で noindex のため除外（コードコメントに明記） | タグ URL 0 件（クロール上のタグ 291 件は全て noindex を確認） | 一致 |
| ページネーションを出力するコードパスなし | `/share/page/N` 等 0 件（クロール上の 16 件は noindex,follow で整合） | 一致 |
| カテゴリは `HAVING COUNT >= 1` | 8 カテゴリ（business/culture/economy/entertainment/it/politics/society/world）。空の `etc` は消滅 | 一致 |
| 静的ページは `publicPages` Set（24 slug）∩ DB `pages` テーブル | 24 件全て出力に存在 | 一致 |
| トップは `/` のみ（`/share` は push しない） | `/share` 不収載、`/` 収載。`/share` の canonical は `/` | 一致 |

**新規ルートの自動反映性:**
- 記事: `posts` テーブル駆動 → 公開すれば自動で収載される
- カテゴリ: `categories` × 記事存在で自動
- **静的ページ: ハードコードされた allow-list のため自動反映されない。** DB の `pages` に新規行を足しても `publicPages` Set に slug を追記しない限りサイトマップに出ない（逆に Set にだけ足しても DB になければ出ない）。現時点で 24/24 一致しており実害ゼロだが、将来の追加時に漏れやすい構造（プロセスリスクとして -1）

---

## lastmod 分布

| 日付 | 件数 | 中身 |
|------|------|------|
| 2026-06-28 | 2 | `/`＋it/1391（最新公開） |
| 2026-06-25 | 1 | it/1390 |
| 2026-06-23 | 23 | 記事群（品質改修バッチ） |
| 2026-06-19 | 1 | /share/about |
| 2026-06-18 | 27 | 記事群（品質改修バッチ） |
| 2026-06-11 | 25 | 記事群＋ガイド系静的 10 件 |
| 2026-05-25 | 1 | /share/interview-kakiokoshi |
| 2026-05-12 | 1 | /share/category/economy |
| 2026-03-29 | 7 | 静的（meispeech, ted-talks ほか） |
| 2026-03-28 | 5 | 静的（tos, privacy, contact ほか） |
| 2016-08-02 | 2 | company, regal（真に未更新） |

11 種の実日付に分散し、最大クラスタでも 28.4%（v3 は 95.3% が同一日付）。6/11・6/18・6/23 の集中は Block C 品質改修・話者エンティティ追加など**実際の一括編集**を反映した正当な値。

---

## リカバリー文脈でのサイトマップ側レバー評価（率直な結論）

前提: サイト約 6 ヶ月超のオフライン後 2026-03 末復旧。GSC インプレッションは 6 月以降ほぼゼロ、インデックス可能 ~96 ページに「クロール済み - インデックス未登録」が蔓延。IT 下書きキューは 6/28 に枯渇（7/1 公開なし）。

| レバー | 判定 | 理由 |
|--------|------|------|
| **lastmod の規律維持** | **最重要・現状ほぼ満点** | Google が公言する再クロールスケジューリングの主要サイトマップシグナル。本サイトは dateModified と 62/62 一致・実日付分散で「信頼される lastmod」になっている。**実編集なしに lastmod だけ更新する誘惑は厳禁**（不正確と学習されると lastmod ごと無視される） |
| GSC でのサイトマップ再送信（公開のたび） | **無意味・やらない** | 一度登録されたサイトマップは Google が自動で定期再取得する。再送信ボタンは取得を早めない |
| sitemap ping エンドポイント | **死亡済み・組み込まない** | 2023-06 廃止告知、2024-01 以降 404。これに依存する実装は作らない |
| **IndexNow** | **YES — 導入推奨** | Google は無視するが、**Bing のインデックスは ChatGPT 検索 / Copilot の引用元**であり、AI 引用性を軸にする本サイトには費用対効果が高い。実装は小さい: `public/<key>.txt` を置き、自動公開パイプライン（3 日毎 cron / generate-it-drafts 系スクリプト）から `https://api.indexnow.org/indexnow` へ POST を 1 本足すだけ（~30 分）。Cloudflare の Crawler Hints 統合はゾーン別アカウントのねじれ構成のため、パイプラインからの直接 POST の方が確実。リポジトリ内に既存実装なし（grep 確認済） |
| サイトマップ分割 / インデックス化 | **無意味** | 95 / 50,000 URL。分割に SEO 効果はなく管理コストだけ増える |

**正直な総括:** サイトマップは既に律速要因ではない。発見（discovery）側は双方向整合 0 欠落で完成しており、「クロール済み - インデックス未登録」はサイトマップではなく品質・需要側の問題。サイトマップ「周辺」で最大のレバーはむしろ**公開ケイデンスの回復**である — キュー枯渇でトップの lastmod が 06-28 で凍結しており、新規 lastmod の流れが止まると Googlebot の再訪頻度は下がる方向に働く。`generate-it-drafts.mjs` でのキュー補充が、この監査から出せる実効性最大のアクション。

---

## 品質ゲート評価

| ゲート | 状態 |
|--------|------|
| ロケーションページ（30+ 閾値） | N/A — ロケーションページなし |
| ドアウェイページリスク | CLEAR — プログラマティックな都市/業種ページなし。ガイド系静的 24 件は個別コンテンツ |
| 50k URL 制限 | CLEAR（95 / 50,000） |
| サイトマップ内の noindex | CLEAR — 0 件（noindex 402 ページは全て不収載） |

---

## robots.txt 整合

- `Sitemap:` 行 正常（https://kakiokosi.com/sitemap.xml）
- Disallow（/auth/ /dashboard/ /admin/）とサイトマップ URL の競合なし
- AI クローラー 6 種への明示 Allow を維持

---

## 推奨事項

1. **（中・効果大）IndexNow を自動公開パイプラインに追加** — key ファイル設置＋公開時 POST。Bing 経由で ChatGPT/Copilot の引用面に最短で載せる。Google 向けには何も変わらない点は織り込むこと。
2. **（中・運用）IT 下書きキューの補充** — サイトマップ品質は満点近いが、供給が止まると lastmod ストリームが凍結し再クロール頻度に逆風。7/1 の公開スキップが既に発生。
3. **（低）`publicPages` allow-list の drift 防止** — 新規静的ページ追加手順に「sitemap[.]xml.tsx の Set へ slug 追記」を含める（もしくは pages テーブルに `public` フラグ列を持たせ Set を廃止）。
4. **（低）RSS の小改善** — `lastBuildDate` 追加。AI クローラー向けに `content:encoded` 全文配信は検討価値あり（逐語コンテンツの転載リスクと引用性のトレードオフを判断のうえで）。
5. **（不要と明言）** GSC 再送信の運用化・sitemap ping 実装・サイトマップ分割はいずれも効果ゼロのため着手しない。
