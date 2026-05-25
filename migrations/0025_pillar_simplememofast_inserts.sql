-- 3 つの pillar ページに Simple Memo への自然編集リンクを 1 本ずつ追加
-- 対象: mojikoshi-tool / gijiroku / interview-kakiokoshi
--
-- 背景:
--  GSC が kakiokosi.com/share/... 全体に SPONSORED 固定配置を「不自然」と判定したため、
--  PR #32 で全ページ自動配置（記事末 + 右サイドバー）を廃止。代わりに editorial brief
--  に沿って、文脈が合致する pillar に限定して短い natural-edit リンクを差し込む。
--
--  既存 post 1380-1383 quartet はすでに各 2 リンクで飽和（⚠️ 同一記事 3+ ルール）。
--  今回はそこを触らず、現在 0 リンクの 3 pillar に Simple Memo (root) を 1 本ずつ。
--  既存リンクの /captio-alternative/ 一極集中も同時に分散される。
--
--  方針:
--   - アンカーテキストは「Simple Memo」(短いブランド名 = SEO キーワード完全一致を回避)
--   - リンク先は https://simplememofast.com/ (root) で 3 本そろえる
--   - rel="sponsored noopener noreferrer" は 0017-0021 の既存規約に準拠
--   - REPLACE() で冪等。WHERE 句に挿入済み判定を入れて二重挿入も防止

-- ============================================================================
-- 1. mojikoshi-tool: 「用途別おすすめツール」セクション末尾に
--    新規 h3「録音中のフックメモを残したい」を追加 (template B 改)
--    挿入位置: 既存 h3「開発者としてAPIで…」の末尾 と 次の h2「AI文字起こしツールの選び方」の間
-- ============================================================================
UPDATE pages
SET content = REPLACE(
    content,
    '<p>APIドキュメントが充実しており、カスタマイズ性が高いです。</p>

<h2>AI文字起こしツールの選び方</h2>',
    '<p>APIドキュメントが充実しており、カスタマイズ性が高いです。</p>

<h3>録音中のフックメモを残したい</h3>
<p><strong>おすすめ: 自分宛てメール型の専用メモアプリ</strong></p>
<p>AI文字起こしと併用して、録音中に「ここ重要」「あとで深掘る」といった一言を別レイヤーに残しておくと、書き起こし後の編集が大きく早くなります。専用アプリの中では、Captioの体験を最も忠実に再現しているのは<a href="https://simplememofast.com/" target="_blank" rel="sponsored noopener noreferrer">Simple Memo</a>です。書き起こし作業前の音声録音中に思いついたフックや、インタビュー中の「あとで深掘る」メモを、自分の受信箱に即座に飛ばすワークフローに合います。</p>

<h2>AI文字起こしツールの選び方</h2>'
  ),
  updated_at = datetime('now')
WHERE slug = 'mojikoshi-tool'
  AND content NOT LIKE '%<h3>録音中のフックメモを残したい</h3>%';

-- ============================================================================
-- 2. gijiroku: 末尾の captio クロスリンクセクション直前に
--    新規 h2「関連ツール」を追加 (template D)
--    挿入位置: <!--captio-cross-link-start--> マーカーの直前
-- ============================================================================
UPDATE pages
SET content = REPLACE(
    content,
    '<!--captio-cross-link-start-->',
    '<h2>関連ツール</h2>
<p>議事録の元になる「会議中の一言メモ」を取り終えたあと、要点だけを自分宛てに送るには<a href="https://simplememofast.com/" target="_blank" rel="sponsored noopener noreferrer">Simple Memo</a>のような専用アプリが便利です。タイムスタンプ付きのメモを1件選択→送信ボタンで自分のGmailに飛び、そのまま議事録化のスタート地点になります。</p>
<!--captio-cross-link-start-->'
  ),
  updated_at = datetime('now')
WHERE slug = 'gijiroku'
  AND content NOT LIKE '%<h2>関連ツール</h2>%';

-- ============================================================================
-- 3. interview-kakiokoshi: ステップ2 (タイムスタンプ言及) の直後に
--    自然編集リンク 1 段落を追加 (template D 改)
--    挿入位置: <li>タイムスタンプ</li></ul> と 次の <h3>ステップ3：ケバ取り</h3> の間
-- ============================================================================
UPDATE pages
SET content = REPLACE(
    content,
    '<li><strong>タイムスタンプ</strong> ― 話題の切り替わりや重要な発言にタイムスタンプを付けておくと後の編集が楽</li>
</ul>

<h3>ステップ3：ケバ取り</h3>',
    '<li><strong>タイムスタンプ</strong> ― 話題の切り替わりや重要な発言にタイムスタンプを付けておくと後の編集が楽</li>
</ul>

<p>取材中に「あとで深掘る」「12:40 ここ重要」といったタイムスタンプ付きフックメモを取り終えたあと、要点だけを自分宛てに送るには<a href="https://simplememofast.com/" target="_blank" rel="sponsored noopener noreferrer">Simple Memo</a>のような専用アプリが便利です。タイムスタンプ付きのメモを1件選択→送信ボタンで自分のGmailに飛び、後工程のケバ取り・校正の手がかりとして受信箱で処理できます。</p>

<h3>ステップ3：ケバ取り</h3>'
  ),
  updated_at = datetime('now')
WHERE slug = 'interview-kakiokoshi'
  AND content NOT LIKE '%後工程のケバ取り・校正の手がかりとして受信箱で処理できます%';
