-- 原液(etc draft)→ AI記事化バッチの来歴追跡用カラム
--
-- scripts/generate-it-drafts.mjs が原液ドラフト(primary_category='etc')を
-- パジ文体IT記事に変換して it draft を作る際、どの原液から生成したかを記録する。
-- 監査・再生成・重複防止に使用。生成元の原液は status='archived' に退避され、
-- 未処理プール（status='draft' AND primary_category='etc'）が自然に縮む設計。

ALTER TABLE posts ADD COLUMN source_id INTEGER;
