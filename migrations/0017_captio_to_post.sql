-- Captio代替記事を pages → posts に昇格
-- /share/captio-alternative-email-memo (page) → /share/it/1380 (post)
-- 通常記事として、トップ・カテゴリ一覧・関連記事・RSS・サイトマップに乗る扱いにする。

-- 1. 必要なタグを追加（既存ならスキップ）
INSERT OR IGNORE INTO tags (slug, name) VALUES ('メモ', 'メモ');
INSERT OR IGNORE INTO tags (slug, name) VALUES ('iphone', 'iPhone');
INSERT OR IGNORE INTO tags (slug, name) VALUES ('議事録', '議事録');
INSERT OR IGNORE INTO tags (slug, name) VALUES ('生産性', '生産性');
INSERT OR IGNORE INTO tags (slug, name) VALUES ('文字起こし', '文字起こし');

-- 2. 旧 pages 行から content を引っ張りつつ posts に id=1380 で挿入
--    INSERT OR REPLACE で再実行可能。FAQ の構造化データを inline script で content に同梱し、
--    通常の記事ルート (share.$category.$id.tsx) でも検索結果リッチリザルト対象になるようにする。
INSERT OR REPLACE INTO posts (
  id, author_id, title, content, excerpt,
  status, primary_category, thumbnail_url,
  published_at, updated_at, created_at
)
SELECT
  1380,
  NULL,
  title,
  content || '<script type="application/ld+json">{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[{"@type":"Question","name":"Captioはもう使えないのですか？","acceptedAnswer":{"@type":"Answer","text":"Captioは以前のようなクラウド同期・メール送信サービスとしては従来通りに利用できないという報告があり、同じ体験を求める人は代替手段を探す必要があります。"}},{"@type":"Question","name":"Captioの代替には何が必要ですか？","acceptedAnswer":{"@type":"Answer","text":"「すぐ書ける」「自分にメールできる」「あとで受信箱で処理できる」の3つが揃っていることが重要です。機能数の多さよりも、起動から送信までの動線の短さで選ぶのが向いています。"}},{"@type":"Question","name":"Apple純正メモではだめですか？","acceptedAnswer":{"@type":"Answer","text":"長文メモや整理用途には十分使えますが、メールの受信箱で処理したい短いメモ用途には保存先が分散しやすく、向かない場合があります。"}},{"@type":"Question","name":"自分にメールするメモは何が便利ですか？","acceptedAnswer":{"@type":"Answer","text":"メールの受信箱をそのままToDoリストとして使えるため、あとで返信・転送・検索・アーカイブしやすくなります。複数の媒体への展開もメールから始められます。"}},{"@type":"Question","name":"会議メモや文字起こし用途にも使えますか？","acceptedAnswer":{"@type":"Answer","text":"録音や文字起こしそのものではなく、あとで文字起こしを見るときの目印や、会議中の短い宿題メモとして向いています。録音とは別レイヤーの一時メモとして併用するのがおすすめです。"}},{"@type":"Question","name":"シンプルメモはCaptioと同じアプリですか？","acceptedAnswer":{"@type":"Answer","text":"同じアプリではありません。Captioの公式後継でもありません。Captioに近い書いて自分にメールするという体験を、iPhone向けに別開発で再現したアプリです。"}}]}</script>',
  'Captio終了後に自分にメールするタイプのメモアプリを探している人向けに、iPhoneで使える代替手段を比較。会議中の一時メモ、文字起こし前の要点メモ、議事録化前のフックという観点から、書き起こし.com編集部視点で整理した。',
  'published',
  'it',
  NULL,
  '2026-04-28 14:00:00',
  '2026-04-28 14:00:00',
  '2026-04-28 14:00:00'
FROM pages WHERE slug = 'captio-alternative-email-memo';

-- 3. カテゴリ・タグ紐付け
INSERT OR IGNORE INTO post_categories (post_id, category_slug) VALUES (1380, 'it');
INSERT OR IGNORE INTO post_tags (post_id, tag_slug) VALUES (1380, 'メモ');
INSERT OR IGNORE INTO post_tags (post_id, tag_slug) VALUES (1380, 'iphone');
INSERT OR IGNORE INTO post_tags (post_id, tag_slug) VALUES (1380, '議事録');
INSERT OR IGNORE INTO post_tags (post_id, tag_slug) VALUES (1380, '生産性');
INSERT OR IGNORE INTO post_tags (post_id, tag_slug) VALUES (1380, '文字起こし');

-- 4. ピラーページから相互リンク
--    既存 content の末尾に、関連記事への導線セクションを追記する。
--    再実行時に重複しないよう、マーカーコメントの存在を WHERE で確認する。

-- gijiroku（議事録）に追加
UPDATE pages
SET content = content || '<!--captio-cross-link-start--><h2>合わせて読みたい：会議中の一時メモを「自分にメール」で残す</h2><p>議事録の品質は、会議中に残せたメモの精度にも左右されます。録音や文字起こしとは別レイヤーで、その瞬間の宿題・確認事項をどこに置いておくか――Captio終了後の代替を含めた整理を別記事で扱っています。</p><p><a href="/share/it/1380">Captio終了後、「自分にメールするメモ」をどう代替するか</a></p>',
    updated_at = datetime('now')
WHERE slug = 'gijiroku' AND content NOT LIKE '%<!--captio-cross-link-start-->%';

-- mojikoshi-tool（文字起こしツール比較）に追加
UPDATE pages
SET content = content || '<!--captio-cross-link-start--><h2>合わせて読みたい：文字起こし前後の「一時メモ」をどう残すか</h2><p>文字起こしツールは録音から文字データへの変換を担いますが、会議中・移動中に「あとで処理したい一言」を残すには別の道具が必要です。Captio終了後の代替を含めた整理を別記事で扱っています。</p><p><a href="/share/it/1380">Captio終了後、「自分にメールするメモ」をどう代替するか</a></p>',
    updated_at = datetime('now')
WHERE slug = 'mojikoshi-tool' AND content NOT LIKE '%<!--captio-cross-link-start-->%';

-- 5. 旧 pages 行を削除（pages テーブルからは消す。記事は posts.id=1380 に存在）
DELETE FROM pages WHERE slug = 'captio-alternative-email-memo';
