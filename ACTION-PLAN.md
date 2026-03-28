# 書き起こし.com SEO Action Plan

**Generated:** 2026-03-28
**Current Score:** 44/100
**Target Score:** 75/100+

---

## Critical — 即座に対応 (Score Impact: +15-20pt)

### C1. 静的ページの500エラーを修正
- **File:** `app/routes/share.static.tsx`
- **Issue:** 13ページ (about, tos, privacy, contact, company, regal, etc.) が本番で500エラー
- **Fix:** D1 `pages` テーブルクエリのデバッグ。テーブルが存在しないか、スキーマ不一致の可能性
- **Impact:** サイトマップ内の13 URLがエラー → Google評価低下

### C2. 静的アセットのキャッシュヘッダー追加
- **File:** Worker entry / middleware
- **Issue:** ハッシュ付きJS/CSSが `max-age=0, must-revalidate` で配信
- **Fix:** `/assets/*` パスに `Cache-Control: public, max-age=31536000, immutable` を設定
- **Impact:** LCP改善、リピートユーザーの体感速度大幅向上

### C3. セキュリティヘッダーをWorkerで設定
- **Issue:** `public/_headers` はCloudflare Workersで無視される
- **Fix:** `entry.server.tsx` またはミドルウェアで以下を設定:
  - `Strict-Transport-Security: max-age=31536000`
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `Referrer-Policy: strict-origin-when-cross-origin`

### C4. ページネーション404を修正
- **File:** `app/routes/share.page.$page.tsx`
- **Issue:** `/share/page/2` が本番で404
- **Fix:** ルートが正しくデプロイされているか確認。ビルド出力を検証

### C5. Article schemaに`author`を追加
- **File:** `app/routes/share.$category.$id.tsx` (lines 85-112)
- **Fix:** `author` フィールドを追加 (Organizationとして):
```json
"author": { "@type": "Organization", "name": "書き起こし.com" }
```
- **Impact:** Google Article rich resultsの資格要件を満たす

---

## High — 1週間以内に対応 (Score Impact: +10-15pt)

### H1. フォント読み込みの最適化
- **Current:** 4ファミリー16ウェイト (~7-15MB)
- **Fix:**
  - Noto Sans JP: 400, 700のみ
  - Noto Serif JP: 700のみ
  - Material Symbols → 使用している3-4アイコンをインラインSVGに置換
  - Work Sans削除またはサブセット化
- **Impact:** LCP 1-2秒改善の見込み

### H2. モバイルハンバーガーメニュー追加
- **File:** `app/root.tsx` (ナビゲーション部分)
- **Issue:** モバイルでカテゴリナビが完全に非表示
- **Impact:** モバイルユーザビリティ、回遊率向上

### H3. ホームページにコンテンツ追加
- **File:** `app/routes/share._index.tsx`
- **Fix:** 300-500文字の日本語紹介テキストを追加。サイトの目的・価値を説明
- **Impact:** E-E-A-T、キーワードシグナル向上

### H4. フッターに法的ページリンク追加
- **File:** `app/root.tsx`
- **Fix:** 運営情報(`/share/company`)、特定商取引法(`/share/regal`)をフッターに追加
- **Impact:** 日本の商用サイト法的要件。信頼性シグナル

### H5. Organizationに`logo`追加
- **Fix:** `/public/logo.png` を作成し、schema内で参照
- **Impact:** ナレッジパネル、ブランド認知

### H6. サイトマップから壊れたURLを除外
- **File:** `app/routes/sitemap[.]xml.tsx`
- **Fix:** 500エラーの静的ページURLを修正するまでサイトマップから除外
- **Fix:** `encodeURI()` でタグURLをエンコード
- **Fix:** `<changefreq>` と `<priority>` を削除

---

## Medium — 1ヶ月以内に対応 (Score Impact: +5-10pt)

### M1. 記事画像の最適化
- thumbnailに `fetchpriority="high"` と `width`/`height` 属性追加
- WebP/AVIFフォーマットへの変換パイプライン構築
- PostCardの画像に `width`/`height` 追加 (CLS対策)

### M2. 全ページ型にpage-specific schema追加
- Homepage: `WebPage` + `ItemList`
- Category: `CollectionPage`
- Tag: `CollectionPage`
- `app/lib/schema.ts` のヘルパー関数を活用 (現在dead code)

### M3. 著者情報の表示
- 記事ページに著者バイラインを追加
- Aboutページに編集方針・チーム情報を追記

### M4. タッチターゲットサイズ修正
- 44x44px未満の要素を修正 (全体の25%が違反)

### M5. ホームページ302 → 301リダイレクト
- **File:** `app/routes/_index.tsx`
- `redirect("/share")` → `redirect("/share", 301)`

### M6. タグページの整理
- 投稿数2件未満のタグをサイトマップから除外
- 重複タグ (`旅`, `30日`, `web`) をDB側で統合

### M7. `SearchAction` schemaの修正
- 検索機能がない場合、`SearchAction`を削除
- または検索機能を実装

---

## Low — バックログ (Score Impact: +3-5pt)

### L1. RSS/Atomフィード追加
### L2. `llms.txt` ファイル追加
### L3. `speakable` schema追加 (書き起こしコンテンツに最適)
### L4. 関連記事セクション追加
### L5. robots.txt のAIクローラーブロックを再検討
### L6. OG/Twitterカードを全ページ型に拡大
### L7. PWA manifest追加
### L8. lastmod日付の正規化 (76件が2014-10-29で固定)

---

## 実装順序の推奨

```
Week 1: C1 → C2 → C3 → C4 → C5 (Critical fixes)
Week 2: H1 → H2 → H6 (Performance + Mobile + Sitemap)
Week 3: H3 → H4 → H5 (Content + Trust)
Week 4: M1 → M2 → M5 (Images + Schema + Redirects)
Month 2: M3 → M4 → M6 → M7 (Author + UX + Cleanup)
Backlog: L1-L8
```

**Expected score after Week 1-2:** 60-65/100
**Expected score after Month 1:** 70-75/100

---

*Generated 2026-03-28 by SEO Audit*
