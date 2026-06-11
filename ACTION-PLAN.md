# kakiokosi.com SEOアクションプラン

**更新:** 2026-06-11
**現在スコア:** 79/100（前回 74）
**目標スコア:** 88/100+

前回プラン(2026-03-28)の Critical 1〜4・High 5〜9 は概ね解消済み。今回はコンテンツ品質が主戦場。

---

## CRITICAL（即時対応 — 品質評価・ポリシー矛盾の解消）

### 1. IT自動生成記事に出典を必須化
**影響:** E-E-A-T・低品質AIコンテンツ判定リスク・自社ポリシー矛盾の解消
**工数:** パイプライン修正2h + 既存18本の遡及修正3h
**対象:** `scripts/generate-it-drafts.mjs`（生成プロンプト）+ 既存記事18本

- 生成時に元動画/記事URL・話者名・所属を必須フィールド化し、記事末尾に「出典」セクションを自動挿入
- raw-materialプールに出典メタデータがない素材は生成対象から除外
- 既存18本に出典を遡及追加（特定できないものはnoindexまたは非公開化を検討）

### 2. 壊れた内部リンク4箇所の修正
**影響:** クロール効率・UX
**工数:** 15分
**対象:** /share/business/80, 81, 82（gigazine URL連結バグ）、/share/politics/86（消滅フォームへのリンク）

DB内のhrefを修正（`"/share/business/ https:/gigazine.net/..."` → 正しい外部URL）。

### 3. 著者エンティティの確立
**影響:** E-E-A-T（最も費用対効果の高い改善）
**工数:** 2h
**対象:** `app/routes/share.$category.$id.tsx`、aboutページ

- 記事フッターに監修者として運営者プロフィール（元livedoor・78万PV実績・15年アーカイブ）を表示
- Article JSON-LDの `author` を Person（aboutページへの `url` + `sameAs`）に変更

---

## HIGH（1週間以内）

### 4. リダイレクト正規化
**工数:** 30分
- `http://kakiokosi.com/` の301先を `/share` → `/` に修正
- `/share` → `/` を301（canonical一本化）
- 記事URL末尾スラッシュを301

### 5. ピラーガイド3本の増強
**工数:** 1本あたり3〜4h
**対象:** /share/kakiokoshi-toha、/share/gijiroku、/share/mojikoshi-tool
- 本文を競合SERP水準（6千字〜）へ。一次経験（実際のツール検証・自社アーカイブからの実例引用）を追加
- SimpleMemoFast誘導に「運営会社のプロダクトです」の開示文言を追加（ステマ規制対応）

### 6. パンくず修正（schema + 表示）
**工数:** 1h
- 「ホーム」のリンク先を全テンプレで `https://kakiokosi.com/` に統一（guide系24ページが `/share` を向いている）
- 縦書き崩れ: `share.$category.$id.tsx:189-196` の最初の2つの `<li>` に `shrink-0 whitespace-nowrap`
- カテゴリ8ページに BreadcrumbList 追加

### 7. FAQPage schema削除
**工数:** 30分
記事/aboutテンプレートから削除（2023年8月以降、政府・医療系以外はリッチリザルト対象外。誤用シグナルになるだけ）。

### 8. フォント削減
**影響:** ページ重量75〜80%削減余地、guideページのLCP半減
**工数:** 3h
- 7ウェイト→3〜4ウェイトに削減、セルフホスト+unicode-rangeサブセット化
- fonts.googleapis.com CSS（119KB render-blocking）をビルド時インライン化 or 非同期化

---

## MEDIUM（1ヶ月以内）

### 9. Article schemaのエンティティ強化（書き起こしサイト固有の最高価値施策）
`isBasedOn`（元動画URL）、`about`/`mentions` に話者Person（Wikidata sameAs付き）。AI引用・エンティティSEOの両方に効く。

### 10. per-article OG画像
default-og.png共通運用をやめ、タイトル入り自動生成OG画像（16:9 / 4:3 / 1:1）。Organizationに正方形ロゴ追加。

### 11. @graph統合
ページごとに単一@graph・安定@id（匿名WebSiteノード重複とクロススクリプト参照を解消）。新パイプライン記事のkeywords/articleSection復活。

### 12. 薄いインデックス可能ページ5本の増強または整理
jirei / technique / category/culture / category/economy / entertainment/641 — 増強するか、価値が出せないならnoindexへ。

### 13. メタディスクリプション50字未満14ページの書き直し
カテゴリ・ガイド系中心。120〜160字でクリック誘因を入れる。

### 14. ハイドレーションJS削減
RR7のルート別ハイドレーション最適化（静的記事ページ）。INPロングタスク計700ms→大幅減を狙う。

### 15. タップターゲット44px化 + 複数H1の7ページ修正

---

## LOW（バックログ）

| # | タスク | 工数 |
|---|---|---|
| 16 | サイトマップlastmod: 移行バッチ一括値(2026-03-28×42件)を実際の更新日に | 30分 |
| 17 | デスクトップホームの視覚改善（タイトル二重表示解消、画像/アイキャッチ導入） | 2h |
| 18 | root.css(9KB)のインライン化 | 30分 |
| 19 | ガイドページに定義文・Q&Aパッセージ（AI引用最適化） | 2h |
| 20 | 404になっている旧ボランティアフォームURLの参照元清掃 | 15分 |

---

## スコア予測

| アクション群 | 期待効果 |
|---|---|
| Critical 1〜3 | Content 62→72前後、総合 +3〜4点 → 82〜83 |
| High 4〜8 | Technical/Schema/Perf 微増 + Content続伸 → 85〜86 |
| Medium 9〜15 | エンティティ・画像・INP改善 → 88〜90 |

---

*2026-06-11 / 6専門サブエージェント監査結果より生成。前回プランは git 履歴参照。*
