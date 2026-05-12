# GSC「クロール済み - インデックス未登録」再検証申請ブリーフ (62件版)

## 概要

`kakiokosi.com` の GSC「ページのインデックス登録」レポートで、`クロール済み - インデックス未登録` が **62件** 検出された。

直近の検証履歴:
- 1回目: 2026-04-06 〜 2026-04-11 → 失敗
- 2回目: 2026-05-07 〜 2026-05-09 → 失敗 (前回ブリーフの30件修正後)

2回目の失敗を受けて、Google が同じ根本原因 (excerpt の機械切り出し) を持つ追加記事を発掘し、対象が30件 → 62件に拡大した。本ブリーフは、この62件すべてに対応するコード・データ修正を本番反映した上で、3回目の再検証申請を行うためのもの。

## 修正済みの内容 (本ブリーフ作成時点: 2026-05-12)

62件は以下の5バケットに分類し、それぞれ対応済み。

### バケット①: 投稿 excerpt 機械切り出し (47件)

うち PR #28 で既に curated excerpt に書き換え済み: **10件**
(business/{45, 109, 111, 113, 115, 153, 220, 279}, society/{207, 263})

今回新たに curated excerpt に書き換え: **37件**
- business: 117, 130, 146, 174, 217, 222, 239, 286, 293, 305
- politics: 224, 226, 227, 244, 248, 250, 252, 253, 255, 256, 258
- society: 209, 215, 219, 240, 260, 262, 264
- entertainment: 230, 231, 232, 233, 236
- economy: 234, 237, 242, 278

マイグレーション: `migrations/0023_regenerate_excerpts_for_37_more_posts.sql`
各 excerpt は 100〜130字、書き起こし.com 編集部視点で書き下ろし。0022 と同じ品質基準。

確認方法 (本番D1適用後):
```bash
curl -s "https://kakiokosi.com/share/business/217" | grep -oE 'name="description" content="[^"]*"' | head -1
# → name="description" content="ハーバード講師・ポジティブ心理学者ショーン・エイカー氏のTED Talk「幸福と成功の意外な関係」全文書き起こし..."
```

### バケット②: タグページ (7件)

GSC レポートに7件のタグページが含まれる:
- /share/tag/ted, 書き起こし, 原発, スタートアップ, 孫正義, 文字おこし, 三木谷浩史

PR #22 では「15件未満の薄いタグページ」のみ noindex していたが、≥15件のタグページも結局インデックスされず、定型テンプレ description (`「◯◯」に関する書き起こし記事XX件を掲載。講演...`) の問題が露呈した。

今回の修正: タグページを **サイト全体で noindex** に変更。
- `app/routes/share.tag.$slug.tsx`: `MIN_ARTICLES_FOR_INDEX` を `Number.POSITIVE_INFINITY` に
- `app/routes/sitemap[.]xml.tsx`: タグページを sitemap から除外 (混合シグナル回避)

`noindex, follow` のため内部リンク経由のクロールは維持。Googleは noindex を「意図された除外」と認識し、検証で「合格」扱いになる見込み。

確認方法:
```bash
curl -s "https://kakiokosi.com/share/tag/ted" | grep -oE '<meta[^>]*name="robots"[^>]*>'
# → <meta name="robots" content="noindex, follow"/>
```

### バケット③: ピラーページ薄い description (2件)

- `/share/jirei` → 旧 "書き起こしの事例紹介" (10字) → 100字以上のSEO品質に拡張
- `/share/tapeokoshi` → 旧 "テープ起こしの基本と方法について" (16字) → 100字以上に拡張

ついでに同様に薄かった他5ページ (technique, nagare, omitsumori, point, webmeeting) も同じ方針で拡張。

実装場所: `app/routes/share.static.tsx` の `PAGE_DESCRIPTIONS`

確認方法:
```bash
curl -s "https://kakiokosi.com/share/jirei" | grep -oE 'name="description" content="[^"]*"' | head -1
# → 100字以上の説明文が返る
```

### バケット④: www サブドメイン (2件)

- `https://www.kakiokosi.com/share/business/293`
- `https://www.kakiokosi.com/share/business/305`

301 リダイレクト動作中 (PR #20 系)。GSC再検証で合格見込み。

確認方法:
```bash
curl -s -o /dev/null -w "HTTP %{http_code} -> %{redirect_url}\n" "https://www.kakiokosi.com/share/business/293"
# → HTTP 301 -> https://kakiokosi.com/share/business/293
```

### バケット⑤: 4ピラーページ description (既にOK、念のため記載) (4件)

`/share/ai-hatarakikata, /share/kigyoka-meigen, /share/presentation, /share/ted-talks` は既に十分な description あり。クロール再評価により合格見込み。

## デプロイ手順

1. PR を merge し本番に反映
2. **本番D1 にマイグレーション 0023 を適用** (手動)
   ```bash
   npx wrangler d1 execute kakiokosi-db --remote --file=migrations/0023_regenerate_excerpts_for_37_more_posts.sql
   ```
3. 反映確認 (上記の curl コマンドで複数URLを抜き取りチェック)
4. GSC で再検証を申請

## GSC での操作手順 (62件一括)

1. Google Search Console を開き、プロパティ `https://kakiokosi.com/` を選択
2. 左メニューから「**ページのインデックス登録**」を開く
3. レポート下部の「ページがインデックスに登録されなかった理由」セクションで、「**クロール済み - インデックス未登録**」をクリック
4. 詳細画面の上部、「検証: 失敗しました (2026-05-09)」の右側にある「**修正を検証**」ボタンをクリック
5. 申請後、ステータスが「**検証: 開始済み**」に変わる
6. 数日〜2週間で Google の自動検証が走る

## 期待される結果

| バケット | 件数 | 合格見込み |
|---|---|---|
| ①: 投稿 excerpt 書き換え | 47件 | 中〜高 (PR #28経験から、curated excerptはGoogleの再評価を促す効果はあるが、保証はない) |
| ②: タグページ noindex | 7件 | 高 (noindex は明示的シグナル) |
| ③: ピラーページ description拡張 | 2件 | 中 (薄さは解消したが、他のシグナルも影響) |
| ④: www → non-www 301 | 2件 | 高 (リダイレクトは確実に動作) |
| ⑤: 既に対応済みピラー | 4件 | 中 |

合計、最低でも 11〜15件は確実に合格する見込み。残りは Google の総合判定次第。

## 失敗が続く場合の次の一手

仮に3回目の検証も部分失敗で終わった場合、残ったURLに対しては excerpt 以外の品質シグナル (内部リンク密度、E-E-A-T、本文の独自性、被リンク) を調査する必要がある。具体的には:

- 内部リンク数: 各記事に他記事から何本リンクが張られているか (4本未満は要強化)
- 関連記事ブロック / pillar pages からの言及
- スキーマ (Article, Person) の completeness
- 本文の重複度 (転載前提の記事は editorial-note の充実が鍵)

これらの調査は別ブリーフに切り出す。

## 関連リンク

- 前提となる修正PR:
  - PR #22: noindex paginated & thin tag pages (今回サイト全体noindexに拡張)
  - PR #20系: www→non-www 301
  - PR #28: 旧WP記事25件 excerpt 再生成 (今回追加37件は同じ方針)
- 関連ドキュメント:
  - `migrations/0022_regenerate_excerpts_for_25_old_posts.sql`
  - `migrations/0023_regenerate_excerpts_for_37_more_posts.sql`
