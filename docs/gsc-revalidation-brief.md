# GSC「クロール済み - インデックス未登録」再検証申請ブリーフ

## 概要

`kakiokosi.com` の GSC「ページのインデックス登録」レポートで、`クロール済み - インデックス未登録` が **30件** 検出された。前回の検証期間（2026-04-06 〜 2026-04-11）は失敗扱いで終わっている。

このブリーフを書いた時点（2026-05-06）で、30件全てに対して必要なコード/コンテンツ修正は **本番反映済み**。あとは GSC で再検証を申請するだけ。**30件まとめて1回の申請** で完結する。

## 修正済みの内容（背景）

3バケットそれぞれに対する対応はすでに完了している。再検証申請は、Googleが対応済みの状態を再クロールして「合格」に変えるためのトリガー。

### バケット①: ページネーション・タグページ（3件）

`<meta name="robots" content="noindex, follow">` がすでに付与されている（コミット `dfcfdf2`）。Googleがインデックスしないのは意図された挙動なので、再検証で「合格」になる。

- `https://kakiokosi.com/share/category/business/page/3`
- `https://kakiokosi.com/share/tag/文字おこし`
- `https://kakiokosi.com/share/tag/三木谷浩史`

確認方法:
```bash
curl -s "https://kakiokosi.com/share/category/business/page/3" | grep -oE '<meta[^>]*name="robots"[^>]*>'
# → <meta name="robots" content="noindex, follow"/>
```

### バケット②: www サブドメイン（2件）

`www.kakiokosi.com` への 301 リダイレクトを Worker で実装済み（コミット `bb4e030`）。Googleはリダイレクト先の正規URL（非www）を辿るので、www版の「インデックス未登録」は正しい挙動。

- `https://www.kakiokosi.com/share/business/293`
- `https://www.kakiokosi.com/share/business/305`

確認方法:
```bash
curl -s -o /dev/null -w "HTTP %{http_code} -> %{redirect_url}\n" "https://www.kakiokosi.com/share/business/293"
# → HTTP 301 -> https://kakiokosi.com/share/business/293
```

### バケット③: 旧WP記事 25件

excerpt（`<meta name="description">` の元）が「本文冒頭150文字の機械切り出し」になっており、検索結果スニペット品質が低かった。

修正内容: 各記事の `posts.excerpt` を、80〜120字の SEO向け要約（話者・イベント・主要トピック）に書き換えた（マイグレーション `0022_regenerate_excerpts_for_25_old_posts.sql`、PR #28、本番D1反映済み）。

該当URL:

| 件数 | URL |
|---|---|
| 1 | `https://kakiokosi.com/share/politics/93` |
| 7 | `https://kakiokosi.com/share/society/{105,106,207,263,275,277,300}` |
| 17 | `https://kakiokosi.com/share/business/{37,45,74,77,81,102,109,111,113,115,119,153,220,279,280,306,309}` |

確認方法（任意）:
```bash
# 例: id=119 (Mark Zuckerberg) — 旧版は英語先頭文だったが、新版は和文の要約に切り替わっている
curl -s -L "https://kakiokosi.com/share/business/119" | grep -oE 'name="description" content="[^"]*"' | head -1
# → name="description" content="マーク・ザッカーバーグ氏がスタンフォード大学CS183で語った「Team Dynamics」講義の全文書き起こし（英語）..."
```

## GSC での操作手順（30件一括）

GSC の「修正を検証」ボタンは、レポート画面の **検出ステータス全体に対して1回押すだけ** で、含まれる全URLが対象になる。30件を個別に押す必要はない。

1. Google Search Console を開き、プロパティ `https://kakiokosi.com/`（または `sc-domain:kakiokosi.com`）を選択
2. 左メニューから「**ページのインデックス登録**」を開く
3. レポート下部の「ページがインデックスに登録されなかった理由」セクションで、「**クロール済み - インデックス未登録**」をクリック
4. 詳細画面の上部、「検証: 失敗しました（2026-04-11）」のステータス表示の右側にある「**修正を検証**」ボタンをクリック
5. 申請後、ステータスが「**検証: 開始済み**」に変わる
6. 数日〜2週間で Google の自動検証が走る

## 期待される結果

- バケット①②（5件）: 高確率で「合格」になる。条件はすでに完全に満たされている。
- バケット③（25件）: excerpt は改善されたが、Googleの「クロール済み - インデックス未登録」判定はサイト全体の信頼度・内部リンク量・コンテンツの独自性など複合的な要素に依存する。一部は合格、一部は引き続き保留の可能性がある。再検証を1回トリガーすることで、Googleが新しいexcerptを再評価する機会を作る効果は大きい。

## 申請後にやること（任意）

申請から1〜2週間後にGSCで再度ステータスを確認:
- 「合格」または「合格しました」になっていればOK
- 部分的に失敗が残っている場合は、残りURLの個別調査が必要（追加の改善 → 再申請のサイクル）

## 注意事項

- GSC の「修正を検証」は同じレポートに対して **同時に1回しか走らない**。検証中に再度押せない。
- 検証が「失敗」で終わっても、コンテンツを再修正してから再申請すれば再評価される。クールダウン期間はない。
- 検証期間中は、Googleの再クロールを待つだけなので、ユーザー側で追加で必要な作業はない。

## 関連リンク

- 前提となる修正PR:
  - PR #22: noindex paginated & thin tag pages（バケット①対応）
  - PR #20: www→non-www 301（バケット②対応）
  - PR #28: 25件 excerpt 再生成（バケット③対応）
- 関連ドキュメント:
  - `migrations/0022_regenerate_excerpts_for_25_old_posts.sql` — excerpt差し替え内容
