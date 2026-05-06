-- 旧WP移行記事25件の excerpt（メタディスクリプション）を再生成
--
-- 背景:
--  GSC「クロール済み - インデックス未登録」レポートに含まれていた25記事は、
--  excerpt が「本文冒頭150文字の機械切り出し」になっており、検索結果スニペット
--  として機能していなかった。例: 「（この項はツイッター総研の...をそのまま転載
--  したものです）」「みんなに見てもらいたいので拡散します。 ※問題あったら消し
--  て下さい。」「When I started off I was programming for Sygen...」など。
--
-- 対応:
--  各記事の editorial-note（2026年3月更新時に追加されたエディトリアル要約）と
--  記事本文から、110〜120字程度の SEO 向けメタディスクリプションを書き起こし.com
--  編集部視点で書き下ろした。
--
-- 反映後:
--  share.$category.$id.tsx の `post.excerpt || generateExcerpt(...)` フォールバック
--  により、HTML <meta name="description"> と OG description が直接置き換わる。

UPDATE posts SET excerpt = '「孫正義 LIVE 2011」シリーズ第2部の全文書き起こし。後払い決済を活用した創業期エピソードから、テクノロジーの指数的進化と社会変革まで、孫正義氏自身が「志」を語る。', updated_at = datetime('now') WHERE id = 37;

UPDATE posts SET excerpt = '「孫正義 LIVE 2011」第3部書き起こし。通信速度750倍・CPU500倍といった指数的進化を起点に、情報革命の未来像とソフトバンクが果たすべき役割を孫正義氏が語る。', updated_at = datetime('now') WHERE id = 45;

UPDATE posts SET excerpt = '孫正義氏×三木谷浩史氏の対談「国民の、ITによる、日本復活」全文書き起こし。15年ぶりの再会から始まる、IT政策・規制緩和・産業競争力をめぐる議論を収録。', updated_at = datetime('now') WHERE id = 74;

UPDATE posts SET excerpt = '2010年3月期ソフトバンク決算発表会の質疑応答セッション全文書き起こし。USTREAMでも生中継された、孫正義氏が業績・株主還元・通信事業の課題に直接答える時間。', updated_at = datetime('now') WHERE id = 77;

UPDATE posts SET excerpt = 'スカイプ創業者ニクラス・ゼンストローム氏の講演「起業家精神とビジネスの秘訣」Part2書き起こし。Q&Aを中心に、起業家への助言と組織運営の実践を語る。', updated_at = datetime('now') WHERE id = 81;

UPDATE posts SET excerpt = '2012年11月7日、再選を果たしたバラク・オバマ大統領の勝利演説の全文書き起こし。アメリカ団結への祈りと次の4年への決意、市民への感謝が刻まれた歴史的スピーチ。', updated_at = datetime('now') WHERE id = 93;

UPDATE posts SET excerpt = 'BasecampのジェイソンフリードがTEDで語った「なぜ職場で仕事ができないのか」全文書き起こし。会議とマネージャが集中を奪う構造を指摘し、リモートワークの示唆を与える。', updated_at = datetime('now') WHERE id = 102;

UPDATE posts SET excerpt = '西條剛央氏（早稲田大学）×岩上安身氏「津波被災地の支援について」対談Part2書き起こし。被災現場での支援のあり方、復興の課題、ボランティア組織の構造論を扱う。', updated_at = datetime('now') WHERE id = 105;

UPDATE posts SET excerpt = '西條剛央氏×岩上安身氏「津波被災地の支援について」対談Part1書き起こし。宮城県出身の研究者が語る、現場で見えた支援の構造的課題と組織化の必要性。', updated_at = datetime('now') WHERE id = 106;

UPDATE posts SET excerpt = 'ソフトバンク孫正義社長（当時）の「新30年ビジョン」プレゼンテーションPart2書き起こし。30年後の社会像、情報革命がもたらす生活と産業の変容を具体例で語る。', updated_at = datetime('now') WHERE id = 109;

UPDATE posts SET excerpt = 'ソフトバンク孫正義社長「新30年ビジョン」Part1全文書き起こし。300年後の未来まで見据えた構想と、社員2万人で1年議論したビジョン策定プロセスが明かされる壮大な講演。', updated_at = datetime('now') WHERE id = 111;

UPDATE posts SET excerpt = 'ジャーナリスト佐々木俊尚氏「ソーシャルとクラウド化がもたらす日本社会の変化と今後のあり方」読むセミナー試し読み版。情報流通の構造変化と日本社会の今後を考察する。', updated_at = datetime('now') WHERE id = 113;

UPDATE posts SET excerpt = 'Y Combinator共同創業者ポール・グレアム氏のエッセイ「怖いくらいに野心的なスタートアップのアイデア」全文書き起こし。なぜ大きな構想ほど怖いかを論じる起業家論。', updated_at = datetime('now') WHERE id = 115;

UPDATE posts SET excerpt = 'マーク・ザッカーバーグ氏がスタンフォード大学CS183で語った「Team Dynamics」講義の全文書き起こし（英語）。Facebook初期の創業期から学んだチーム運営論を語る。', updated_at = datetime('now') WHERE id = 119;

UPDATE posts SET excerpt = '認知科学者ドナルド・ノーマン氏「感情に訴えるデザインの3つの要素」TED Talk全文書き起こし。本能・行動・内省という3層のデザイン論を、ユーモアを交えて語る。', updated_at = datetime('now') WHERE id = 153;

UPDATE posts SET excerpt = '池上彰氏×上杉隆氏「東京ディスカッション第2章 我々市民とメディアのあり方」第2部・第4回書き起こし。若者世代と政治の距離、メディアの責任を率直に議論する。', updated_at = datetime('now') WHERE id = 207;

UPDATE posts SET excerpt = 'はてな代表取締役（当時）近藤淳也氏「Startup Workshop Vol.1」講演書き起こし。プロダクト設計・組織運営・起業家としての判断について、はてな創業期の実例で語る。', updated_at = datetime('now') WHERE id = 220;

UPDATE posts SET excerpt = 'ジャーナリスト津田大介氏×児玉龍彦氏（東大先端研）のUst対談Part2書き起こし。原発事故後の情報公開、低線量被曝の評価、政治と科学の距離を率直に議論する。', updated_at = datetime('now') WHERE id = 263;

UPDATE posts SET excerpt = '「自然エネルギーに関する総理・有識者オープン懇談会」Part3書き起こし。菅首相、孫正義氏らが自然エネルギー普及の制度設計と財源論をオープンに議論する。', updated_at = datetime('now') WHERE id = 275;

UPDATE posts SET excerpt = '「自然エネルギーに関する総理・有識者オープン懇談会」Part1書き起こし。菅首相と孫正義氏らが、原発事故後の電力政策と再生可能エネルギーへの転換を議論する記録。', updated_at = datetime('now') WHERE id = 277;

UPDATE posts SET excerpt = '堀江貴文氏の仮釈放後・自由報道協会主催「緊急記者会見」Part2全文書き起こし。事業観・刑務所での思索・今後の活動方針を本人の言葉で記録する。', updated_at = datetime('now') WHERE id = 279;

UPDATE posts SET excerpt = '堀江貴文氏の自由報道協会主催「緊急記者会見」Part1全文書き起こし。出所直後の心境、事件への見解、これからの取り組みを率直に語った会見の記録。', updated_at = datetime('now') WHERE id = 280;

UPDATE posts SET excerpt = '大前研一氏が福島原発事故をBBT757チャンネルで解説したPart3書き起こし。元日立で原子炉設計に関わった大前氏が、専門知識をもとに事故の構造を分析する。', updated_at = datetime('now') WHERE id = 300;

UPDATE posts SET excerpt = '孫正義氏×佐々木俊尚氏「光の道は必要か？」Part3-3・フリー討論書き起こし。光ファイバ全戸配備の是非を巡る議論の最終局面、論点整理と参加者からの質問を収録。', updated_at = datetime('now') WHERE id = 306;

UPDATE posts SET excerpt = '孫正義氏×佐々木俊尚氏「光の道は必要か？」Part2・佐々木俊尚プレゼンテーション書き起こし。情報通信インフラ政策への異論と代替案を提示するプレゼンの全記録。', updated_at = datetime('now') WHERE id = 309;
