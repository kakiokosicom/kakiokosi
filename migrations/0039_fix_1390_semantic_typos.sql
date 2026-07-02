-- 監査v5 (2026-07-02): 記事1390の意味レベル欠陥を修正
-- 品質ゲート(qualityGate)は決定的・形式検査のみのため、以下は素通しで公開された:
--   1. 非実在語「主宗（しゅそう）」(創作ふりがな付き) → 慣用句「掌中に収める」が正
--   2. 誤字「使用通り」 → 「仕様通り」
--   3. 内部用語「原液」(Voicy元素材を指す編集部ジャーゴン) が読者向け本文に2箇所露出
-- 教訓: 生成時のLLM校正パスを必須化（ACTION-PLAN #1 生成ルール）

UPDATE posts SET
  content = REPLACE(content,
    '自社の主宗（しゅそう）に収めている',
    '自社の掌中に収めている'),
  updated_at = datetime('now')
WHERE id = 1390;

UPDATE posts SET
  content = REPLACE(content,
    '言っても使用通りには仕上がらず',
    '言っても仕様通りには仕上がらず')
WHERE id = 1390;

UPDATE posts SET
  content = REPLACE(content,
    '元々、原液でパジが',
    '元々、元のVoicy配信でパジが')
WHERE id = 1390;

UPDATE posts SET
  content = REPLACE(content,
    '。原液でパジが最後に語った',
    '。元のVoicy配信でパジが最後に語った')
WHERE id = 1390;
