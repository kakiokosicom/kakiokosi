# Schema.org 構造化データ監査 v5

**サイト:** https://kakiokosi.com
**日付:** 2026-07-02
**監査:** Claude (Schema.org specialist)
**前回:** v4 (2026-03) スコア 97 — `/Users/hajimeataka/kakiokosi/seo-audit-schema-v4.md`
**データ:** 全クロール済みスナップショット（インデックス可能 95 HTMLページ、ld+json 222ブロック）を全数検証。サンプリングなし。

---

## 総合スコア: 98 / 100（v4比 +1）

**+1 の根拠:** v4 の最重要推奨だった「登壇者エンティティ（Person + Wikidata sameAs）」が PR #44 で出荷され、実装品質が検証で満点（QID 5件をWikidata本体と突合し全件正解、配置・グラフ接続も正しい）。加えて Organization sameAs（X @kakiokosi ほか）と著者 Person の sameAs/E-E-A-T 情報も新規に整備済み。
**残る -2:** ① Organization logo が専用ロゴでなく 1200x630 の OG バナー画像（v4 の favicon.ico からは改善したが未完） ② 回復の主戦場であるピラーガイド18ページの WebPage スキーマが最小構成（日付・著者・publisher なし）。

---

## 0. 全数検証サマリ（インデックス可能 95ページ）

| 項目 | 結果 |
|---|---|
| ld+json ブロック総数 | **222** |
| JSON パース失敗 | **0** |
| 廃止・制限タイプ（HowTo / FAQPage / SpecialAnnouncement 等） | **0（なし）** |
| @context が `https://schema.org` 以外 | 0 |
| 相対URL・プレースホルダ・非ISO8601日付 | 0 |

**タイプ別出現ページ数（実測）:**

| タイプ | ページ数 | 備考 |
|---|---|---|
| WebSite / Organization / ImageObject / PostalAddress / ContactPoint | 95 | 全ページ（root.tsx グローバル） |
| BreadcrumbList | 94 | 欠落はトップページのみ（階層ルートのため不要、問題なし） |
| WebPage | 84 | ガイド・静的ページ + 記事の mainEntityOfPage |
| Article + Person + SpeakableSpecification | 62 | 全記事 |
| AudioObject | 19 / VideoObject | 14 / CreativeWork | 8 — すべて isBasedOn 内 |
| CollectionPage + ItemList | 9 | トップ + カテゴリ8（v4時点の10との差は `/share` が `/` へ canonical 統合されたため） |
| AboutPage / ContactPage | 各1 | 正しいマッピング |

---

## 1. Article 必須・推奨プロパティ（62記事 全数）

| チェック | 結果 |
|---|---|
| headline / description / url | 62/62 PASS |
| image（ImageObject, 絶対URL） | 62/62 PASS |
| datePublished / dateModified（ISO 8601 +09:00） | 62/62 PASS |
| author（name あり） | 62/62 PASS |
| publisher（`#organization` @id 参照） | 62/62 PASS |
| mainEntityOfPage / inLanguage | 62/62 PASS |
| speakable（SpeakableSpecification, cssSelector） | 62/62 PASS |
| headline 110字超過 | 0件 |

**欠落プロパティ: ゼロ。** 全62記事が必須＋推奨を満たす。

**著者は v4 の Organization から Person に進化（改善）:**

| 著者 | 記事数 | sameAs |
|---|---|---|
| 書き起こし.com（編集部） | 39 | `https://x.com/kakiokosi` + url=/share/about + description |
| 安宅 基（パジ） | 23 | `https://x.com/paji_a`, `https://note.com/hajimeataka`, thekeyperson.biz インタビュー + url + 実績 description |

→ 著者 E-E-A-T シグナルとしてはほぼ理想形。v5 で新たに推奨すべき著者施策は残っていない。

---

## 2. 登壇者エンティティ（NEW / PR #44）— 深掘り検証

**実装:** Article の **`about`** 配列に `Person`（name + Wikidata sameAs）。author とは分離 — **配置は正しい**（登壇者を author に入れる誤実装はゼロ）。

| 項目 | 結果 |
|---|---|
| Wikidata sameAs を持つページ | 36 / 62 |
| 登壇者 Person ノード総数 | 44（複数登壇者ページあり: 例 孫正義×佐々木俊尚 討論） |
| 配置 | 44/44 が `about`（author 混入 0） |
| sameAs 形式 | 44/44 が `https://www.wikidata.org/wiki/Qxxx`（ページURL形式） |
| author Person との @id 衝突 | 0（登壇者 Person は @id 未使用のため衝突不可） |

**QID 実在照合（Wikidata Special:EntityData を live 取得、5件）:**

| QID | サイト側の name | Wikidata 正解 | 判定 |
|---|---|---|---|
| Q9094 | ホセ・ムヒカ | José Mujica / ホセ・ムヒカ | **正** |
| Q717038 | 孫正義 | Masayoshi Son / 孫正義 | **正** |
| Q1312565 | JR | JR（仏の匿名アーティスト、TED登壇者） | **正** |
| Q19837 | スティーブ・ジョブズ | Steve Jobs | **正** |
| Q134798 | 村上春樹 | Haruki Murakami | **正** |

5/5 正解。ページタイトルの実際の登壇者とも全件一致（オバマ勝利宣言=Q76、光の道討論=孫+佐々木 等、5ページで突合済み）。

**ベストプラクティス注記（減点なし）:**
- sameAs はページURL形式（`/wiki/Qxxx`）。エンティティURI（`http://www.wikidata.org/entity/Qxxx`)が Linked Data 上の正準識別子だが、Google は両形式を受理するため現状で問題なし。統一するなら次回改修時にで十分。
- 登壇者 Person に `@id`（例 `https://kakiokosi.com/#speaker-q717038`）を付与すると複数記事間で同一人物ノードを共有できるが、Wikidata sameAs が既にグローバル同定を提供しており効果は限定的。

**about なし26記事の内訳:** 23件はパジ音声記事（登壇者=著者本人で author が充足）、3件は単独登壇者なし or Wikidata 項目なし（例 society/936 の登丸賢美）。実質的なカバレッジ漏れはごく僅か。

---

## 3. @id グラフ接続性

| チェック | 結果 |
|---|---|
| Article に @id | 62/62 PASS |
| Article → isPartOf（直接 or mainEntityOfPage→WebPage 経由）→ `https://kakiokosi.com/#website` | 62/62 PASS |
| WebSite `#website` → publisher → `#organization` | PASS（全ページ） |
| @id の重複・衝突 | 0 |

v4 で確立したルートグラフ接続は**維持**。登壇者 Person 追加によるグラフ破壊なし。

---

## 4. isBasedOn タイプ分割（AudioObject / VideoObject / CreativeWork）

| ソース種別 | 記事数 | 例 |
|---|---|---|
| AudioObject | 19 | `https://voicy.jp/channel/2834/...`（Voicy） |
| VideoObject | 14 | `https://www.ted.com/talks/...`（TED/YouTube） |
| CreativeWork | 8 | Stanford eCorner 等の講義ページ |

v4 検証時の 38ページ → **41ページに増加（+3 = 新記事）**。分割ロジックは無傷。

**新記事 1389 / 1390 / 1391（IT自動公開パイプライン産）:**

| 記事 | Article | isBasedOn | 著者 |
|---|---|---|---|
| /share/it/1389 | PASS（全プロパティ充足） | AudioObject（Voicy） | 安宅 基（パジ） |
| /share/it/1390 | PASS | AudioObject | 安宅 基（パジ） |
| /share/it/1391 | PASS | AudioObject | 安宅 基（パジ） |

自動公開パイプラインはスキーマ品質を劣化させていない。

**注記:** isBasedOn 内の VideoObject/AudioObject は `{@type, url}` の最小構成。参照ノードなのでリッチリザルト要件（name / thumbnailUrl / uploadDate）は必須ではないが、GSC の動画レポートが不完全な VideoObject を警告する可能性はゼロではない（後述の機会3）。

---

## 5. 機会（この状況——6ヶ月停止からの回復・AI検索被引用性——に効くもののみ、最大3件）

**既に完了済みで推奨不要（v5で確認）:**
- Organization sameAs → `x.com/kakiokosi`, `x.com/paji_a`, `note.com/hajimeataka` **設定済み**
- 著者 Person sameAs/url/description **設定済み**（§1）
- speakable **62/62 全記事カバー済み**

### 機会1（最重要）: ピラーガイド18ページの WebPage スキーマ強化

gijiroku / mojikoshi-tool / ai-hatarakikata 等の回復主力ページは現在 `WebPage` に name/description/url/inLanguage/isPartOf のみ。**datePublished / dateModified / author / publisher / speakable がゼロ**で、サイト内で最も薄いマークアップが最も重要な商用ページに載っている状態。記事と同水準（dateModified で鮮度、author=編集部 Person、publisher 参照、speakable）を追加する。再クロール時の鮮度・信頼シグナルと AI 検索での出典属性付けに直結。

```json
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": "https://kakiokosi.com/share/gijiroku#webpage",
  "name": "議事録の書き方｜テンプレート・コツ・AI活用法を完全ガイド",
  "url": "https://kakiokosi.com/share/gijiroku",
  "inLanguage": "ja",
  "isPartOf": { "@id": "https://kakiokosi.com/#website" },
  "datePublished": "2026-05-25T00:00:00+09:00",
  "dateModified": "2026-07-01T00:00:00+09:00",
  "author": { "@type": "Person", "name": "書き起こし.com（編集部）", "url": "https://kakiokosi.com/share/about", "sameAs": ["https://x.com/kakiokosi"] },
  "publisher": { "@id": "https://kakiokosi.com/#organization" },
  "speakable": { "@type": "SpeakableSpecification", "cssSelector": ["h1", ".lead"] }
}
```
（日付は実際の公開・更新日に置換すること）

### 機会2: Organization logo を専用ロゴ画像に

現在 `logo` = `default-og.png`（1200x630 のOGバナー）。Google のロゴ要件は最小 112x112・ロゴ単体として成立する画像。ブランドパネルや AI 回答での発行元表示に使われるため、正方形に近い専用ロゴ（推奨 ~1200x1200 PNG/SVG）を用意して差し替える。v4 指摘（favicon.ico）から半分だけ改善した状態。

### 機会3: isBasedOn ソースノードに `name` を追加（41ノード）

`{"@type":"VideoObject","url":"..."}` → `name`（講演・エピソード題）を足すだけで、GSC 動画エンハンスメント警告の予防と、AI 検索が「何に基づく書き起こしか」を解釈する精度が上がる。一次ソース明示は書き起こしサイトの信頼性の核であり、低コストで効く。

### 推奨しないもの（明示）

- **FAQPage:** gijiroku と mojikoshi-tool に実 FAQ セクション（各6問）、kakiokoshi-toha / mojikoshi-fukugyo にも FAQ 見出しが存在するが、FAQ リッチリザルトは 2023年8月以降**政府・医療機関サイト限定**。本サイトでは表示されないためマークアップ追加は非推奨（コンテンツ自体は AI 検索に有効なのでそのまま維持）。
- **SearchAction / potentialAction:** サイト内検索 UI がない限り追加不可。
- **トップページへの BreadcrumbList:** 階層ルートには不要。

---

## 6. 誤検知ガード（変更・指摘禁止事項）

- 運営組織は**株式会社ユリカ、代表者表記「AI ATAKA」が正式**（過去監査で確認済み）。会社概要ページの当該表記をエラー扱いしないこと。
- Worker/D1 とゾーンのアカウントねじれ、セルフホストフォントはいずれも意図的構成。スキーマ監査の対象外。

---

## 減点内訳

| カテゴリ | 配点 | 減点 | 理由 |
|---|---|---|---|
| 全ページ ld+json 妥当性（222ブロック） | 20/20 | 0 | パース失敗0・廃止タイプ0 |
| Article 必須+推奨（62記事） | 25/25 | 0 | 欠落ゼロ、著者 Person 化+sameAs で v4 超え |
| 登壇者エンティティ（新規） | 15/15 | 0 | 配置・QID・グラフすべて正 |
| @id グラフ接続 | 10/10 | 0 | 62/62 |
| isBasedOn 分割 + 新記事 | 10/10 | 0 | 41ページ無傷、1389-1391 合格 |
| CollectionPage / 静的ページ | 10/10 | 0 | 変化なし・正常 |
| ベストプラクティス | 10/10 | -2 | logo が専用ロゴでない(-1)、ピラーガイドのメタデータ欠落(-1) |

**合計: 98 / 100**

---

## ファイル参照（v4 から変更なしの生成元）

| ファイル | 提供スキーマ |
|---|---|
| `app/root.tsx` | WebSite + Organization（sameAs 追加済み） |
| `app/routes/share.$category.$id.tsx` | Article + about Person + BreadcrumbList（@graph） |
| `app/routes/share.static.tsx` | WebPage/AboutPage/ContactPage + BreadcrumbList |
| `app/lib/schema.ts` | collectionPageSchema / breadcrumbSchema |
