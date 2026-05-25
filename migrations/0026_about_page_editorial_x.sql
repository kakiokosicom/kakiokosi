-- /share/about の「編集部について」セクションに編集部公式 X アカウント
-- (@kakiokosi) のメンションを 1 行追加。
--
-- 背景:
--  従来 Organization.sameAs と DEFAULT_AUTHOR.sameAs にはパジ個人の x.com/paji_a が
--  入っていたが、編集部公式アカウント https://x.com/kakiokosi が運用開始したため、
--  サイトの「編集部」アイデンティティを正しいアカウントに紐付け直す。
--
--  同 PR 内の root.tsx / authors.ts で JSON-LD 側の sameAs は更新済み。
--  ここでは可視メンションを about ページ本文にも 1 行入れて、ユーザーが
--  辿れる導線も整える（rel="me" で X 側との双方向 identity を成立させる）。
--
--  挿入位置: 「<h2>運営会社</h2>」 の直前（編集部について セクション末尾）
--  挿入位置に上記アンカーが必ず単一行で存在するため、シングルライン REPLACE
--  で whitespace 一致の懸念をゼロにする。

UPDATE pages
SET content = REPLACE(
    content,
    '<h2>運営会社</h2>',
    '<p>編集部の最新動向や記事更新情報は <a href="https://x.com/kakiokosi" rel="me noopener" target="_blank">X (@kakiokosi)</a> でも発信しています。</p>

<h2>運営会社</h2>'
  ),
  updated_at = datetime('now')
WHERE slug = 'about'
  AND content NOT LIKE '%x.com/kakiokosi%';
