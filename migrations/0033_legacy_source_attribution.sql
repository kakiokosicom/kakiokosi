-- ============================================================================
-- 0033: 旧第三者スピーチ/講演記事への原典URL付与 + IT原作記事への著者付与
--   (SEO監査 2026-06-16 Medium / 「無付加価値の複製」リスク低減・出典明示・E-E-A-T)
--
-- 出典URLは全て調査エージェントが特定→筆者が curl/oEmbed で最終200を独立再検証した
-- 実在URLのみ。原典が消失(Ustream閉鎖/動画削除)で確証が得られなかった記事は付与せず
-- (72,73,76,77,78,79,84,86,175,185,311,323,325,641,936,82 等)。
-- source_url が入ると記事テンプレートが「出典」ボックス + Article schema isBasedOn を
-- 自動表示する。idempotent: source_url IS NULL ガードで再実行時は no-op。
-- ============================================================================

UPDATE posts SET source_url='https://group.softbank/philosophy/message/2010/20100519_01', updated_at=datetime('now','+9 hours') WHERE id=75 AND source_url IS NULL;
UPDATE posts SET source_url='https://www.youtube.com/watch?v=OHbrrnmEdbU', updated_at=datetime('now','+9 hours') WHERE id=85 AND source_url IS NULL;
UPDATE posts SET source_url='https://www.youtube.com/watch?v=UF8uR6Z6KLc', updated_at=datetime('now','+9 hours') WHERE id=87 AND source_url IS NULL;
UPDATE posts SET source_url='https://www.haaretz.com/israel-news/culture/2009-02-17/ty-article/always-on-the-side-of-the-egg/0000017f-db26-d3ff-a7ff-fba694020000', updated_at=datetime('now','+9 hours') WHERE id=89 AND source_url IS NULL;
UPDATE posts SET source_url='https://www.ted.com/talks/jr_one_year_of_turning_the_world_inside_out', updated_at=datetime('now','+9 hours') WHERE id=91 AND source_url IS NULL;
UPDATE posts SET source_url='https://obamawhitehouse.archives.gov/the-press-office/2012/11/07/remarks-president-election-night/', updated_at=datetime('now','+9 hours') WHERE id=93 AND source_url IS NULL;
UPDATE posts SET source_url='https://www.ted.com/talks/jason_fried_why_work_doesn_t_happen_at_work', updated_at=datetime('now','+9 hours') WHERE id=102 AND source_url IS NULL;
UPDATE posts SET source_url='https://stvp.stanford.edu/videos/team-dynamics/', updated_at=datetime('now','+9 hours') WHERE id=119 AND source_url IS NULL;
UPDATE posts SET source_url='https://www.ted.com/talks/derek_sivers_how_to_start_a_movement', updated_at=datetime('now','+9 hours') WHERE id=121 AND source_url IS NULL;
UPDATE posts SET source_url='https://www.ted.com/talks/sebastian_thrun_google_s_driverless_car', updated_at=datetime('now','+9 hours') WHERE id=123 AND source_url IS NULL;
UPDATE posts SET source_url='https://blog.alexmaccaw.com/traveling-writing-and-programming-2011/', updated_at=datetime('now','+9 hours') WHERE id=125 AND source_url IS NULL;
UPDATE posts SET source_url='https://www.youtube.com/watch?v=j-Yk4k2tG4A', updated_at=datetime('now','+9 hours') WHERE id=127 AND source_url IS NULL;
UPDATE posts SET source_url='https://www.youtube.com/watch?v=j-Yk4k2tG4A', updated_at=datetime('now','+9 hours') WHERE id=129 AND source_url IS NULL;
UPDATE posts SET source_url='https://www.c-span.org/program/public-affairs-event/barack-obama-2008-victory-speech/196672', updated_at=datetime('now','+9 hours') WHERE id=133 AND source_url IS NULL;
UPDATE posts SET source_url='https://www.ted.com/talks/julian_assange_why_the_world_needs_wikileaks', updated_at=datetime('now','+9 hours') WHERE id=135 AND source_url IS NULL;
UPDATE posts SET source_url='https://www.ted.com/talks/don_norman_3_ways_good_design_makes_you_happy', updated_at=datetime('now','+9 hours') WHERE id=153 AND source_url IS NULL;
UPDATE posts SET source_url='https://www.youtube.com/watch?v=VQKMoT-6XSg', updated_at=datetime('now','+9 hours') WHERE id=157 AND source_url IS NULL;
UPDATE posts SET source_url='https://www.ted.com/talks/cameron_herold_let_s_raise_kids_to_be_entrepreneurs', updated_at=datetime('now','+9 hours') WHERE id=202 AND source_url IS NULL;
UPDATE posts SET source_url='https://www.ted.com/talks/jean_baptiste_michel_erez_lieberman_aiden_what_we_learned_from_5_million_books', updated_at=datetime('now','+9 hours') WHERE id=211 AND source_url IS NULL;
UPDATE posts SET source_url='https://www.youtube.com/watch?v=meU3OjbsX4w', updated_at=datetime('now','+9 hours') WHERE id=213 AND source_url IS NULL;
UPDATE posts SET source_url='https://webtv.un.org/en/asset/k1d/k1dwcjjovl', updated_at=datetime('now','+9 hours') WHERE id=643 AND source_url IS NULL;
UPDATE posts SET source_url='https://news.berkeley.edu/wp-content/uploads/archive/2016/05/Sheryl-Sandberg-Berkeley-commencement-speech.pdf', updated_at=datetime('now','+9 hours') WHERE id=881 AND source_url IS NULL;

-- IT原作の how-to 記事(Captio/メモ系, 0017-0021生成)は第三者書き起こしではなく
-- サイト運営者(paji)のオリジナル。著者エンティティを付与(E-E-A-T)。
UPDATE posts SET author_id=(SELECT id FROM users WHERE email='hajimeataka@gmail.com'),
  updated_at=datetime('now','+9 hours')
WHERE id IN (1380,1381,1382,1383) AND author_id IS NULL;
