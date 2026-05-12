-- 旧WP移行記事37件の excerpt（メタディスクリプション）を再生成
--
-- 背景:
--  2026-05-08 のGSC「クロール済み - インデックス未登録」レポートに、追加で37記事が
--  含まれていた。0022 と同じ根本原因で、excerpt が「本文冒頭150文字の機械切り出し」
--  になっており、検索結果スニペットとして機能していない。
--  例: 「皆さんにみてもらいたいので拡散させてもらいます。 ※問題あったら消して下さい。」
--      「I don't know how many of you really love to interview people...」
--      「【おぎ】はい。 【やはぎ】約束してるのに、死んじゃうわけ。」など。
--
-- 対応:
--  0022 と同じ方針で、各記事の <title> ・editorial-note（2026年3月更新時に追加された
--  エディトリアル要約）・記事本文から、100〜130字の SEO 向けメタディスクリプションを
--  書き起こし.com 編集部視点で書き下ろした。文字数は全件 100〜130 字に収めている。
--
-- 反映後:
--  share.$category.$id.tsx の `post.excerpt || generateExcerpt(...)` フォールバック
--  により、HTML <meta name="description"> と OG description が直接置き換わる。

-- business カテゴリ (10件)

UPDATE posts SET excerpt = 'ハーバード・ビジネス・スクール教授ウィリアム・A・サールマン氏の講演「Challenges of Hiring Good People」全文書き起こし（英語）。スタートアップに不可欠な採用面接の難しさと評価基準を、教育者の視点から論じる名講義。', updated_at = datetime('now') WHERE id = 117;

UPDATE posts SET excerpt = 'イスラエルの指揮者イタイ・タルガム氏のTED Talk「偉大な指揮者に学ぶリーダーシップ」全文書き起こし。クライバーやムーティら歴代マエストロ6人の対照的な指揮スタイルから、組織を率いる多様なリーダー像を導く。', updated_at = datetime('now') WHERE id = 130;

UPDATE posts SET excerpt = 'ベンチャー支援家・合田ジョージ氏らによる連続セッション「バイアウトからの逆算、誰があなたの会社を買うか？」Part4全文書き起こし。財務諸表とIR資料の読み方を、起業家・経営者向けに実例を交えて解説するパート。', updated_at = datetime('now') WHERE id = 146;

UPDATE posts SET excerpt = 'btraxのブランドン・片山氏「アメリカ式成功するプレゼンのコツ」Part1書き起こし。サンフランシスコ発のデザインエージェンシー代表が、日本人エンジニア・起業家向けに米国流プレゼン技法の基本を語った講演。', updated_at = datetime('now') WHERE id = 174;

UPDATE posts SET excerpt = 'ハーバード講師・ポジティブ心理学者ショーン・エイカー氏のTED Talk「幸福と成功の意外な関係」全文書き起こし。成功すれば幸せになるのではなく幸福が成功を生む、という脳科学の知見と実践法を語る人気講演。', updated_at = datetime('now') WHERE id = 217;

UPDATE posts SET excerpt = '作家ダニエル・ピンク氏のTED Talk「やる気に関する驚きの科学」全文書き起こし。報酬で釣る古典的アプローチを超え、自律性・熟達・目的こそが人を動かすという、行動経済学の知見にもとづくモチベーション論。', updated_at = datetime('now') WHERE id = 222;

UPDATE posts SET excerpt = 'クラウドファンディング起業家・家入一真氏とMOND創業者・鶴田浩之氏の対談Part1書き起こし。「拝借と熟成」の掛け合わせを軸に、面白いWebサービスを生み出すアイデアの源泉と、日々の発想・思考プロセスを語る。', updated_at = datetime('now') WHERE id = 239;

UPDATE posts SET excerpt = '孫正義氏×経済学者・池田信夫氏の対談「光の道」（夏野剛氏司会）Part4・最終回書き起こし。NTT分割や光ファイバ全戸配備の是非を巡る議論の終盤と、会場参加者からの質疑応答までを収録した完結編パート。', updated_at = datetime('now') WHERE id = 286;

UPDATE posts SET excerpt = '経営コンサルタント大前研一氏の「イノベーション講座」書き起こし（2009年8月16日 大前研一ライブ放送より）。SDF（戦略的自由度）というアイデア発想フレームワークを、ライブ放送で具体例を交えて解説した一本。', updated_at = datetime('now') WHERE id = 293;

UPDATE posts SET excerpt = '孫正義氏×ジャーナリスト佐々木俊尚氏の討論「光の道は必要か？」Part4・質疑応答書き起こし。光ファイバ全戸配備を巡る議論の終盤、会場と参加者からの率直な質問に両者が直接答える最終セッションを編集部が記録。', updated_at = datetime('now') WHERE id = 305;

-- politics カテゴリ (11件)

UPDATE posts SET excerpt = '原子力安全委員会・斑目春樹委員長への国会事故調による参考人聴取Part4書き起こし。ストレステストの実効性、大飯原発3・4号機の再稼働判断の根拠を巡り、石橋委員から向けられた厳しい質疑の全記録を収録。', updated_at = datetime('now') WHERE id = 224;

UPDATE posts SET excerpt = '原子力安全委員会・斑目春樹委員長への国会事故調による参考人聴取Part3書き起こし。大島委員から、原子力安全の国際的視野、規制機関の独立性、原子力安全と核セキュリティの両立について向けられた質疑の記録。', updated_at = datetime('now') WHERE id = 226;

UPDATE posts SET excerpt = '原子力安全委員会・斑目春樹委員長への国会事故調による参考人聴取Part2書き起こし。海水注入時の再臨界可能性を巡る斑目氏自身の発言の真偽について、野村委員からの追及に答える緊迫した質疑応答パートを収録。', updated_at = datetime('now') WHERE id = 227;

UPDATE posts SET excerpt = '参議院議員・西田昌司氏のWeb番組書き起こし「外国人献金不起訴で安心するな菅前総理。本丸は市民の会」。菅直人前総理の外国人献金問題と関連政治団体「草志会」の構造を整理し、追及すべき本丸の論点を提示する論考。', updated_at = datetime('now') WHERE id = 244;

UPDATE posts SET excerpt = 'たちあがれ日本代表・平沼赳夫氏の出演書き起こし（ニコニコ動画より転載）。八木キャスターを相手に、野田佳彦内閣の閣僚人事評価と既存メディア各社の報道姿勢を率直に「ぶった切る」スタイルで語ったインタビュー。', updated_at = datetime('now') WHERE id = 248;

UPDATE posts SET excerpt = '荒川区議・小坂英二氏の講演「パチンコ違法化に向けて」書き起こし。ギャンブル依存症がもたらす家族の被害事例を多数紹介しながら、政治がこの問題に切り込まないのは職務放棄である、と訴えた現場発信の論考記録。', updated_at = datetime('now') WHERE id = 250;

UPDATE posts SET excerpt = '参議院議員・西田昌司氏のWeb番組「目覚めよ!日本人」書き起こし。「米・中に振り回されるTPP　日本の自主独立精神を捨ててはいけない」を主題に、野田政権発足直後の通商政策スタンスを保守の立場から論じる回。', updated_at = datetime('now') WHERE id = 252;

UPDATE posts SET excerpt = '元東京大学総長・小宮山宏氏の国会参考人意見陳述「日本『再創造』」書き起こし。資源・エネルギーの自給と「プラチナ社会」構想を、スライドを交えながら議員に向けて説明した参考人質疑の全記録を編集部が整理した一本。', updated_at = datetime('now') WHERE id = 253;

UPDATE posts SET excerpt = '2011年8月11日、参議院予算委員会での西田昌司議員（自民党）による菅直人総理への質疑全文書き起こし。退陣表明後の菅総理に対し、外国人献金など二つの政治資金問題の真相を最後まで問い詰めた論戦の記録。', updated_at = datetime('now') WHERE id = 255;

UPDATE posts SET excerpt = '2011年8月9日、衆議院法務委員会での城内実議員による江田五月法務大臣（兼環境大臣）への質疑書き起こし。人権救済機関設置法案を巡る制度設計上の問題点を、論点ごとに整理して問いただす緊迫した論戦の全記録。', updated_at = datetime('now') WHERE id = 256;

UPDATE posts SET excerpt = '2011年8月11日、参議院予算委員会・中山恭子議員（たちあがれ日本）の菅直人総理への質疑書き起こし。震災対応と三権分立の理解を巡る、国民にも分かりやすい論戦の記録を編集部が整理した国会答弁の代表的な一本。', updated_at = datetime('now') WHERE id = 258;

-- society カテゴリ (7件)

UPDATE posts SET excerpt = '池上彰氏×上杉隆氏「東京ディスカッション第2章 我々市民とメディアのあり方」第2部その②書き起こし。NHKをはじめ大手メディアの「誤報」と、それを過剰に受け止める受け手の反応との構造的な関係を率直に議論する。', updated_at = datetime('now') WHERE id = 209;

UPDATE posts SET excerpt = 'ドイツZDFテレビのドキュメンタリー「フクシマのうそ」全文書き起こし。立ち入り禁止区域に取材班が独自に入り、福島第一原発事故の現場と日本政府発表との乖離を欧州メディアの視点で報じた骨太な報道番組の記録。', updated_at = datetime('now') WHERE id = 215;

UPDATE posts SET excerpt = '2011年3月26日放送「朝まで生テレビ！」での経済評論家・勝間和代氏の発言書き起こし。福島第一原発の見通しを巡る田原総一朗氏との応酬を、当時のブログ転載元から編集部が改めて整理した震災直後の議論の記録。', updated_at = datetime('now') WHERE id = 219;

UPDATE posts SET excerpt = 'OurPlanetTVの白石草氏が制作した特集「放射能で広がる異変～子どもたちに何が起きているか」書き起こし。福島第一原発事故から4ヶ月、視聴者から寄せられた証言をもとに子どもの健康異変を報告する特集番組。', updated_at = datetime('now') WHERE id = 240;

UPDATE posts SET excerpt = 'ジャーナリスト津田大介氏×児玉龍彦氏（東京大学先端研）のUstream対談Part4書き起こし。ひまわりによる除染の科学的評価や、南相馬の現場対応の遅れを率直に議論する終盤パートを編集部が整理した記録。', updated_at = datetime('now') WHERE id = 260;

UPDATE posts SET excerpt = 'ジャーナリスト津田大介氏×児玉龍彦氏（東京大学先端研）のUstream対談Part3書き起こし。南相馬など現場で線量を把握する難しさを起点に、低線量被曝対策のあり方と国の責任を議論する中盤パートの記録。', updated_at = datetime('now') WHERE id = 262;

UPDATE posts SET excerpt = 'ジャーナリスト津田大介氏×児玉龍彦氏（東京大学先端研）のUstream対談Part1書き起こし。原発事故から半年、放送開始直後から放射線防護の現状と国の対応の遅れを率直に議論する冒頭パートの全文記録。', updated_at = datetime('now') WHERE id = 264;

-- entertainment カテゴリ (5件)

UPDATE posts SET excerpt = 'お笑いコンビ・おぎやはぎの矢作兼氏が深夜アニメ「魔法少女まどか☆マギカ」を熱く語るラジオ回・Part4書き起こし。約束を破られた主人公の心理描写を、相方・小木博明氏との掛け合いを通して深く掘り下げるパート。', updated_at = datetime('now') WHERE id = 230;

UPDATE posts SET excerpt = 'お笑いコンビ・おぎやはぎの矢作兼氏が深夜アニメ「魔法少女まどか☆マギカ」を熱く語るラジオ回・Part3書き起こし。第4話の時点でまだ魔法少女にならない主人公・まどかの選択を巡る、矢作氏ならではの考察パート。', updated_at = datetime('now') WHERE id = 231;

UPDATE posts SET excerpt = 'お笑いコンビ・おぎやはぎの矢作兼氏が深夜アニメ「魔法少女まどか☆マギカ」を熱く語るラジオ回・Part2書き起こし。海外ドラマ的な伏線がないのに観る者を引き込む、本作の構造的な面白さを二人で語り合うパート。', updated_at = datetime('now') WHERE id = 232;

UPDATE posts SET excerpt = 'お笑いコンビ・おぎやはぎの矢作兼氏が深夜アニメ「魔法少女まどか☆マギカ」を熱く語るラジオ回・Part1書き起こし。深夜アニメに疎い同世代の男性リスナーに向け、矢作氏が作品の魅力を熱弁する導入パートを収録。', updated_at = datetime('now') WHERE id = 233;

UPDATE posts SET excerpt = 'モデル・歌手の土屋アンナ氏とモデル・冨永愛氏によるチャリティイベント「Hope for Mothers お母さん、がんばれ」書き起こし。母子保健への支援を呼びかけるトークと、ライブMC部分を編集部が整理した記録。', updated_at = datetime('now') WHERE id = 236;

-- economy カテゴリ (4件)

UPDATE posts SET excerpt = 'レイバーネットTVの番組「TPPってなに？」書き起こし。農業ジャーナリスト大野和興氏と医師・本田宏氏が、TPP（環太平洋パートナーシップ協定）の論点を労働者・市民の目線から解説した一本を編集部が整理した記録。', updated_at = datetime('now') WHERE id = 234;

UPDATE posts SET excerpt = '評論家・中野剛志氏（当時・経産省官僚）の講演「よくわかるTPP解説」書き起こし。シンガポール発の小規模FTAがなぜ日米交渉の枠組みへと変質したのか、構造的な背景と論点を整理して語る講義の全記録を収録。', updated_at = datetime('now') WHERE id = 237;

UPDATE posts SET excerpt = '田中康夫氏の番組「にっぽんサイコー！」ゲスト・小野寺五典衆院議員の対談書き起こし。TPPで日本が郵貯・簡保資産の無差別開放を迫られる構図を、米国側の本音を踏まえた現役政治家の視点から読み解く対談の一本。', updated_at = datetime('now') WHERE id = 242;

UPDATE posts SET excerpt = '堀江貴文氏の独占インタビュー書き起こし「当時の最大資産額を告白！あくまでお金はツール」。読売テレビ解説委員（当時）辛坊治郎氏を聞き手に、資産観・事業観を率直に語ったZIPコーナーを編集部が記録した一本。', updated_at = datetime('now') WHERE id = 278;
