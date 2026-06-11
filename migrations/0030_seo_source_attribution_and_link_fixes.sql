-- ============================================================================
-- 0030: SEO監査(2026-06-11) Critical対応 — 出典・著者の遡及付与とリンク修正
--
-- 背景: 自動生成パイプライン産のIT記事が、原液(etc)側に存在する出典メタデータ
-- (voicy_url等)を引き継いでおらず、「出典なしのAI記事」に見える状態だった。
-- 記事テンプレートは voicy_url/spotify_url/source_url/author_id が入っていれば
-- 出典ボックス・音声プレイヤー・著者プロフィール・Article schema(isBasedOn/
-- author Person)を自動表示するため、本マイグレーションでデータ側を埋める。
-- ============================================================================

-- 1. source_id で原液に繋がるIT記事へ、原液の出典メタデータをコピー
--    （published/draft 両方。既に値がある記事は触らない）
UPDATE posts SET
  voicy_url   = (SELECT s.voicy_url   FROM posts s WHERE s.id = posts.source_id),
  spotify_url = (SELECT s.spotify_url FROM posts s WHERE s.id = posts.source_id),
  source_url  = (SELECT s.source_url  FROM posts s WHERE s.id = posts.source_id),
  updated_at  = datetime('now', '+9 hours')
WHERE primary_category = 'it'
  AND source_id IS NOT NULL
  AND voicy_url IS NULL AND spotify_url IS NULL AND source_url IS NULL;

-- 2. 音声配信由来のIT記事に著者（サイトオーナー）を遡及設定
--    author_id は users(id) へのFKのため、email から解決する
UPDATE posts SET
  author_id  = (SELECT id FROM users WHERE email = 'hajimeataka@gmail.com'),
  updated_at = datetime('now', '+9 hours')
WHERE primary_category = 'it'
  AND author_id IS NULL
  AND (voicy_url IS NOT NULL OR spotify_url IS NOT NULL OR source_id IS NOT NULL);

-- 3. post 82: gigazine参考リンクの href 内空白を除去し https 化
--    （href=" http://… " の形でクローラ・一部パーサが相対URLと誤解釈する）
UPDATE posts SET
  content = REPLACE(
    content,
    'href=" http://gigazine.net/news/20110123_mark_zuckerberg/ "',
    'href="https://gigazine.net/news/20110123_mark_zuckerberg/"'
  ),
  updated_at = datetime('now', '+9 hours')
WHERE id = 82
  AND instr(content, 'href=" http://gigazine.net/news/20110123_mark_zuckerberg/ "') > 0;

-- 4. post 86: 消滅したWP時代のボランティア応募フォーム(404)への導線を
--    現行のお問い合わせフォームへの導線に置換
UPDATE posts SET
  content = REPLACE(
    content,
    'このサイトの趣旨に賛同してくださるボランティア・スタッフを募集しておりますので、どうぞお気軽にご応募ください。<a href="http://www.kakiokosi.com/%E3%83%9C%E3%83%A9%E3%83%B3%E3%83%86%E3%82%A3%E3%82%A2%E3%82%B9%E3%82%BF%E3%83%83%E3%83%95%E3%81%AE%E5%BF%9C%E5%8B%9F%E3%83%95%E3%82%A9%E3%83%BC%E3%83%A0/" target="_blank">応募フォームはこちら</a>。',
    '記事内容に関するご指摘・ご要望は<a href="/share/contact">お問い合わせフォーム</a>からお寄せください。'
  ),
  updated_at = datetime('now', '+9 hours')
WHERE id = 86
  AND instr(content, '%E3%83%9C%E3%83%A9%E3%83%B3%E3%83%86%E3%82%A3%E3%82%A2') > 0;

-- 5. 本文内の <h1> を <h2> に降格（ページH1はテンプレートが出力するため、
--    本文内H1は1ページ複数H1の原因になっていた）
--    ※ jirei は 0031 で本文全体を差し替えるため対象外
UPDATE posts SET
  content    = REPLACE(REPLACE(content, '<h1', '<h2'), '</h1>', '</h2>'),
  updated_at = datetime('now', '+9 hours')
WHERE id = 881
  AND instr(content, '<h1') > 0;

UPDATE pages SET
  content    = REPLACE(REPLACE(content, '<h1', '<h2'), '</h1>', '</h2>'),
  updated_at = datetime('now', '+9 hours')
WHERE slug IN ('tapeokoshi', 'nagare', 'omitsumori', 'point', 'webmeeting')
  AND instr(content, '<h1') > 0;
