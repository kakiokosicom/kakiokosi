# GSC「クロール済み - インデックス未登録」対応ブリーフ — 戦略転換版（品質集中 / noindex）

## これまでの経緯と方針転換

| 回 | 期間 | 対応 | 結果 |
|---|---|---|---|
| 1 | 2026-04-06〜04-11 | — | 失敗 |
| 2 | 2026-05-07〜05-09 | excerpt書換30件(0022) | 失敗 |
| (準備) | 2026-05-12 | excerpt書換+62件(0023) | 件数 30→62→**71** に拡大 |

excerpt（メタディスクリプション）書き換えを2回行っても再検証は失敗し、対象は
**減るどころか増え続けた**。これは「excerpt の機械切り出しが原因」という仮説が
実証的に否定されたことを意味する。

GSC-flagged 71件の実査結果:
- 60件が `/share/{cat}/{id}` 記事 = **TED Talks / TV・ラジオ放送 / 国会質疑 /
  企業プレゼンの逐語転載**、かつ**多パート分割の断片**（その①②③, パート1-4 等）
- flagged の本文平均 7,239字 < Google がインデックス済みの非flag記事 8,733〜19,225字
- 「ニコニコより転載」のようにタイトルに転載と明記したものも含む

→ Google の "クロール済み-インデックス未登録" 判定は**正しい**。一次ソースに対する
独自付加価値が薄い派生コンテンツで、メタ修正では永久にインデックスされない。

**方針転換: メタ修正の繰り返しを止め、品質集中（quality concentration）に切替。**
派生・断片を noindex してクロール budget と内部リンク評価を keeper に集中させる。

## 実装内容（このブリーフのコミットに含まれる）

| 変更 | 内容 |
|---|---|
| `migrations/0024_noindex_derivative_transcripts.sql` | `posts.noindex` カラム追加 + 93件を noindex=1 |
| `app/lib/db.server.ts` | `Post` 型に `noindex` 追加（`SELECT *` なので query変更不要） |
| `app/routes/share.$category.$id.tsx` | `post.noindex===1` で `<meta name="robots" content="noindex, follow">` |
| `app/routes/sitemap[.]xml.tsx` | `AND noindex = 0` で sitemap から除外 |

`follow` を残すため keeper への内部リンク評価は温存。Google は noindex を
「意図された除外」と認識し、再検証では合格扱いになる見込み。

### noindex 対象 93件の内訳

- **Block A (60件)**: GSC が実際に弾いた60件。監査ソースは GSC レポート自体（推測ゼロ）。
- **Block B (33件)**: Block A と同一シリーズ／同一パターンの未flag断片
  （孫正義LIVEその1-2, 国会事故調パート1, 大前研一Part1-3, 菅・孫懇談会Part1-5 等）。
  件数が 30→62→71 と増え続けた**再発源**。多パート逐語転載のみで誤検知リスク極小。
  保守的に始めたい場合は migration 0024 の Block B UPDATE をコメントアウトして
  Block A のみ適用も可。

結果: 公開147件中 **noindex 93 / keeper 54**。keeper はオリジナルSEO記事
（it クラスタ等）＋ Google が既にインデックス済みの単発スピーチ
（村上春樹カタルーニャ賞, オバマ Yes We Can, サンドバーグ Lean In 等）。

## デプロイ手順

1. このブランチ `seo/noindex-derivative-transcripts` を PR → merge → 本番反映
2. **本番 D1 にマイグレーション 0024 を適用（手動・要 Cloudflare 認証）**
   ```bash
   npx wrangler d1 execute kakiokosi-db --remote \
     --file=migrations/0024_noindex_derivative_transcripts.sql
   ```
   ※ この環境では wrangler が未認可（API code 7403）。実行はアカウント所有者が行う。
3. 反映確認:
   ```bash
   # noindex 記事に robots が出る
   curl -s "https://kakiokosi.com/share/business/163" | grep -oiE '<meta[^>]*robots[^>]*>'
   # → <meta name="robots" content="noindex, follow"/>

   # keeper には robots が出ない（= index 可能）
   curl -s "https://kakiokosi.com/share/it/1380" | grep -ciE '<meta[^>]*robots[^>]*>'
   # → 0

   # sitemap から noindex 記事が消えている
   curl -s "https://kakiokosi.com/sitemap.xml" | grep -c '/share/business/163'
   # → 0
   ```
4. GSC で再検証を申請（下記）

## GSC 操作手順

1. Search Console → プロパティ `https://kakiokosi.com/`
2. 「ページのインデックス登録」→「クロール済み - インデックス未登録」を開く
3. 「修正を検証」をクリック → ステータスが「検証: 開始済み」に変わる
4. 数日〜2週間で自動検証。noindex は明示シグナルなので、対象は「合格（意図的除外）」
   または「除外」へ移行する見込み。

## 期待される結果と次の一手

- noindex 93件 → 再検証で「クロール済み-インデックス未登録」から外れる（高確度）
- 残る keeper 54件で Google の評価が回復するかを次の指標として観測:
  - keeper のインデックス率（GSC「ページ」）
  - 表示回数・クリック（GSC「検索パフォーマンス」）
- **次のループ**: GSC が新たに別シリーズ（例: 孫vs佐々木対談 3-1/3-2/3-3 = id
  306-310, 現在 keeper）を flag した場合、それは想定内。次バッチで Block に追加する
  反復運用とする。over-flag より under-flag を許容する保守運用。
- keeper 側で表示回数が伸びない記事は、内部リンク密度・編集要約・スキーマ完全性の
  個別強化（品質集中フェーズ2）へ。
