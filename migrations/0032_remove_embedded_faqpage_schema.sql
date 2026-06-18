-- ============================================================================
-- 0032: 記事本文に埋め込まれた FAQPage JSON-LD の除去（SEO監査 2026-06-16）
--
-- 背景: PR #38 で about/記事テンプレートからは FAQPage schema を削除したが、
-- migration 0017-0021 で投入された Captio/メモ系記事(1380-1383)は posts.content
-- カラムの末尾に <script type="application/ld+json">{...FAQPage...}</script> を
-- 直書きしており、テンプレ削除の対象外だった。FAQPage リッチリザルトは2023年8月
-- 以降ガバメント/医療系以外では対象外で schema としては無価値、かつテンプレ方針と
-- 不整合なため除去する。
--
-- 安全性（本番データで検証済み 2026-06-16）:
--  - 各記事で FAQPage script は content の「末尾」にあり、直前は </section> で
--    綺麗に閉じている（可視コンテンツを途中で切らない）
--  - 可視の「よくある質問」見出し・本文は script より前に存在するため、
--    script だけ除去しても読者向けQ&Aはそのまま残る
--  - LIKE ガードにより再実行は no-op（冪等）
-- ============================================================================

UPDATE posts SET
  content = substr(
    content, 1,
    instr(content, '<script type="application/ld+json">{"@context":"https://schema.org","@type":"FAQPage"') - 1
  ),
  updated_at = datetime('now', '+9 hours')
WHERE id IN (1380, 1381, 1382, 1383)
  AND content LIKE '%"@type":"FAQPage"%';
