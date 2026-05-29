-- 壊れた内部リンク・参照の修正（Ahrefs Site Audit 2026-05-23 / GSC 起因）
--
-- 背景:
--  Ahrefs クロールで以下の内部リンク不全を検出した。いずれもメタ修正では消えず、
--  コンテンツ実体（pages.content / posts.content）に残った WordPress 移行時の
--  レガシー URL が原因。article route は formatArticleContent() で www→非www /
--  http→https を描画時に正規化するが、(1) 静的ページ(share.static.tsx)は
--  正規化を通さず content をそのまま出力する、(2) 正規化しても参照先スラッグが
--  存在しない（404）リンクは残る、ため DB 実体を直接書き換える。
--
--  対象:
--   A. 静的ページの問い合わせボタン → 画像 /img/top/btn_contact_l.jpg が 404
--      （public/img/top は空）。リンク先 /#caption04_r_form_2 も実体なし。
--   B. 静的ページの料金サンプル等リンク caption03_clip01/02/03 が 404（スラッグ廃止）。
--   C. 静的ページ webmeeting 等が www.kakiokosi.com への絶対リンク（301）。
--   D. 記事の /volunteer/（ボランティア募集ページ）が 404（廃止）。
--   E. 記事 178/180 が誤カテゴリ /share/world/ へリンク（実体は society = 301）。
--   F. 記事 106 が WP 添付ページ /article/13523/iwakami1/ へリンク（404）。

-- ============================================================================
-- A. 問い合わせボタン（画像 404）→ /share/contact へのテキストリンクに置換
--    全静的ページ共通の同一マークアップ（width="270px"）。
-- ============================================================================
UPDATE pages
SET content = REPLACE(
  content,
  '<a title="お問い合わせ" href="/#caption04_r_form_2"><img src="/img/top/btn_contact_l.jpg" alt="お問い合わせ" width="270px" /></a>',
  '<a href="/share/contact">お問い合わせ・お見積もりはこちら</a>'
)
WHERE content LIKE '%/img/top/btn_contact_l.jpg%';

-- ============================================================================
-- B. 廃止サンプルリンク caption03_clip01/02/03 を除去（テキストごと削除。
--    周辺本文に料金・方法の説明は残るため意味は損なわれない）。
-- ============================================================================
UPDATE pages
SET content = REPLACE(content, '<a href="https://www.kakiokosi.com/caption03_clip01" target="_blank">分数別のお見積もり例はこちらから</a>', '')
WHERE content LIKE '%caption03_clip01%';
UPDATE pages
SET content = REPLACE(content, '<a href="https://www.kakiokosi.com/caption03_clip02" target="_blank">書き起こし方法についてはこちらから</a>', '')
WHERE content LIKE '%caption03_clip02%';
UPDATE pages
SET content = REPLACE(content, '<a href="https://www.kakiokosi.com/caption03_clip03" target="_blank">データの送付方法についてはこちらから</a>', '')
WHERE content LIKE '%caption03_clip03%';

-- ============================================================================
-- C. 静的ページ内の www. 絶対リンクを非www へ正規化（描画時正規化を通らないため）。
--    http://www. / https://www. の両形を吸収。
-- ============================================================================
UPDATE pages
SET content = REPLACE(content, 'https://www.kakiokosi.com/', 'https://kakiokosi.com/')
WHERE content LIKE '%https://www.kakiokosi.com/%';
UPDATE pages
SET content = REPLACE(content, 'http://www.kakiokosi.com/', 'https://kakiokosi.com/')
WHERE content LIKE '%http://www.kakiokosi.com/%';

-- ============================================================================
-- D. 記事の廃止 /volunteer/ リンク → /share/contact（anchor テキストは温存）。
--    対象: 279,280,282,284,285（いずれも noindex）。href 部分文字列で一括置換。
-- ============================================================================
UPDATE posts
SET content = REPLACE(content, 'http://www.kakiokosi.com/volunteer/', '/share/contact')
WHERE content LIKE '%/volunteer/%';

-- ============================================================================
-- E. 記事 178/180 の誤カテゴリリンク /share/world/ → /share/society/（301 解消）。
-- ============================================================================
UPDATE posts
SET content = REPLACE(content, 'http://kakiokosi.com/share/world/180', '/share/society/180')
WHERE content LIKE '%/share/world/180%';
UPDATE posts
SET content = REPLACE(content, 'http://kakiokosi.com/share/world/178', '/share/society/178')
WHERE content LIKE '%/share/world/178%';

-- ============================================================================
-- F. 記事 106 の WP 添付ページリンク（404）→ 自記事 URL（200）に向ける。
-- ============================================================================
UPDATE posts
SET content = REPLACE(content, 'href="http://kakiokosi.com/article/13523/iwakami1/" rel="attachment wp-att-13575"', 'href="/share/society/106"')
WHERE content LIKE '%article/13523/iwakami1%';
