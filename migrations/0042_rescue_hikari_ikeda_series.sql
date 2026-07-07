-- 2026-07-07: 王冠資産の救出・第2弾 — 孫正義VS池田信夫「光の道」対談（夏野剛司会）全4パート
--
-- 背景: 0040 は孫vs佐々木「光の道は必要か？」シリーズ(74, 305-311)を救出したが、
-- もう一方の「光の道」一次記録である池田信夫対談 Part1-4 (286/288/291/292) は
-- 0024 の noindex のまま残っていた。
-- 2026-07-07 のレガシー301正常化（ゾーン誤301の解消）により、旧WP URL
-- 「孫正義vs池田信夫「光の道」対談(-4)」からの外部リンクエクイティが 292/286 に
-- 正しく流入するようになった一方、行き先が noindex ではエクイティが死蔵される。
-- 0040 と同一の論理（独自性×検索需要×物語性を持つ一次記録 + 301流入先）による例外救出。
-- ユーザー承認: 2026-07-07「おすすめのほうで」= 選択的救出。

-- 1) noindex 解除（sitemap には自動復帰: sitemap[.]xml.tsx は WHERE noindex=0）
UPDATE posts SET noindex = 0, updated_at = datetime('now')
WHERE id IN (286, 288, 291, 292);

-- 2) 編集部注を一次記録ラベル(0038形式) + シリーズ内導線 + 関連討論(ハブ311)導線付きに更新
UPDATE posts SET content = REPLACE(content,
  '<strong>【編集部注・2026年3月更新】</strong>孫正義氏VS池田信夫氏の「光の道」対談（Part1）の書き起こしです。通信インフラ政策をめぐる白熱した議論です。',
  '<strong>【編集部注・2026年7月更新】</strong>孫正義氏VS池田信夫氏の「光の道」対談（Part1、夏野剛氏司会）の書き起こしです。本記事は、当時の発言を書き起こした一次記録です。元の発言を正確にテキスト化し、検索・引用・参照できる形でアーカイブしています。全4パート: <a href="/share/business/292">Part1</a>・<a href="/share/business/291">Part2</a>・<a href="/share/business/288">Part3</a>・<a href="/share/business/286">Part4</a>。同時期の討論<a href="/share/business/311">孫正義vs佐々木俊尚「光の道は必要か？」全文まとめ</a>もあわせてどうぞ。')
WHERE id = 292;

UPDATE posts SET content = REPLACE(content,
  '<strong>【編集部注・2026年3月更新】</strong>「光の道」対談（Part2）の書き起こしです。',
  '<strong>【編集部注・2026年7月更新】</strong>孫正義氏VS池田信夫氏の「光の道」対談（Part2、夏野剛氏司会）の書き起こしです。本記事は、当時の発言を書き起こした一次記録です。元の発言を正確にテキスト化し、検索・引用・参照できる形でアーカイブしています。全4パート: <a href="/share/business/292">Part1</a>・<a href="/share/business/291">Part2</a>・<a href="/share/business/288">Part3</a>・<a href="/share/business/286">Part4</a>。同時期の討論<a href="/share/business/311">孫正義vs佐々木俊尚「光の道は必要か？」全文まとめ</a>もあわせてどうぞ。')
WHERE id = 291;

UPDATE posts SET content = REPLACE(content,
  '<strong>【編集部注・2026年3月更新】</strong>「光の道」対談（Part3）の書き起こしです。',
  '<strong>【編集部注・2026年7月更新】</strong>孫正義氏VS池田信夫氏の「光の道」対談（Part3、夏野剛氏司会）の書き起こしです。本記事は、当時の発言を書き起こした一次記録です。元の発言を正確にテキスト化し、検索・引用・参照できる形でアーカイブしています。全4パート: <a href="/share/business/292">Part1</a>・<a href="/share/business/291">Part2</a>・<a href="/share/business/288">Part3</a>・<a href="/share/business/286">Part4</a>。同時期の討論<a href="/share/business/311">孫正義vs佐々木俊尚「光の道は必要か？」全文まとめ</a>もあわせてどうぞ。')
WHERE id = 288;

UPDATE posts SET content = REPLACE(content,
  '<strong>【編集部注・2026年3月更新】</strong>孫正義氏VS池田信夫氏の「光の道」対談（Part4、夏野剛氏司会）の書き起こしです。',
  '<strong>【編集部注・2026年7月更新】</strong>孫正義氏VS池田信夫氏の「光の道」対談（Part4、夏野剛氏司会）の書き起こしです。本記事は、当時の発言を書き起こした一次記録です。元の発言を正確にテキスト化し、検索・引用・参照できる形でアーカイブしています。全4パート: <a href="/share/business/292">Part1</a>・<a href="/share/business/291">Part2</a>・<a href="/share/business/288">Part3</a>・<a href="/share/business/286">Part4</a>。同時期の討論<a href="/share/business/311">孫正義vs佐々木俊尚「光の道は必要か？」全文まとめ</a>もあわせてどうぞ。')
WHERE id = 286;
