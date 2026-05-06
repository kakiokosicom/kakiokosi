# GSC「クロール済み - インデックス未登録」再検証申請ブリーフ

## 背景

Google Search Console の「ページのインデックス登録」レポートで、`クロール済み - インデックス未登録` が **30件** 検出された。前回の検証期間（2026-04-06 〜 2026-04-11）は失敗扱いになっている。

このブリーフでは、そのうち **5件** を対象に GSC で再検証申請を行う作業を依頼する。残り 25件 は内容側の改善が必要なため、別タスク（excerpt再生成 migration）で対応する。

## 対象URL（5件）

すでにコード/設定で対応済みなので、再検証ボタンを押すだけで「合格」になる見込み。

### バケット① ページネーション・タグページ（3件）

該当URLには `<meta name="robots" content="noindex, follow">` がすでに設定されている。これは意図された設定であり、Google がインデックスしないのは正しい挙動。再検証申請で「合格」扱いに切り替わる。

- `https://kakiokosi.com/share/category/business/page/3`
- `https://kakiokosi.com/share/tag/文字おこし`
- `https://kakiokosi.com/share/tag/三木谷浩史`

確認方法（任意）:
```bash
curl -s "https://kakiokosi.com/share/category/business/page/3" | grep -oE '<meta[^>]*name="robots"[^>]*>'
# → <meta name="robots" content="noindex, follow"/>
```

### バケット② www サブドメイン（2件）

`www.kakiokosi.com` への 301 リダイレクトを Worker 側で実装済み（コミット `bb4e030`）。Google は最終的に正規の `kakiokosi.com` を辿るため、`www` 版の「インデックス未登録」は正しい挙動。

- `https://www.kakiokosi.com/share/business/293`
- `https://www.kakiokosi.com/share/business/305`

確認方法（任意）:
```bash
curl -s -o /dev/null -w "HTTP %{http_code} -> %{redirect_url}\n" "https://www.kakiokosi.com/share/business/293"
# → HTTP 301 -> https://kakiokosi.com/share/business/293
```

## GSC での操作手順

1. Google Search Console を `kakiokosi.com` プロパティで開く
2. 左メニュー「ページのインデックス登録」を開く
3. 「クロール済み - インデックス未登録」を開く
4. 「**検証: 失敗しました**」と書かれているステータス欄の右側にある「**修正を検証**」または「**再検証を申請**」ボタンをクリック
5. 申請後、ステータスが「検証: 開始済み」に変わる
6. 数日〜2週間で Google 側の自動検証が走り、上記5件分は「合格」に切り替わる見込み

## 注意

- バケット③ の 25件（旧WP記事の `/share/business/*` `/share/society/*` `/share/politics/*`）はこのブリーフの対象外。これらは excerpt（メタディスクリプション）品質が低いため、別の migration で改善する。
- 再検証申請は1回しか押せない。先に上記5件のステータスを確認したうえで、必要なら25件の excerpt 改善 migration を本番反映してから再検証を申請したほうが、検証成功率が上がる可能性がある。
- バケット③の25件は時間（信頼度の蓄積）+ excerpt改善で自然回復する見込み。緊急度は低い。

## バケット③（参考・対象外の25件）

| カテゴリ | URL例 |
|---|---|
| /share/business/* | 102, 119, 309, 45, 280, 220, 306, 81, 77, 279, 37, 153, 115, 109, 74, 113, 111 |
| /share/society/* | 105, 106, 207, 275, 277, 263, 300 |
| /share/politics/* | 93 |

これらは「内容は十分だが、excerpt が冒頭150文字の機械切り出しで品質が低い」ことが主因と判断している。
