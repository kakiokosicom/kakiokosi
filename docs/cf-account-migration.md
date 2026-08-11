# Cloudflare アカウント統合 移行手順書

**作成:** 2026-07-07（監査v5フォロー）
**目的:** Worker + D1 を Humanadsai アカウントから kakiokosi.com ゾーンのあるアカウントへ移し、ねじれ構造を解消する
**状態:** 2026-07-07 13:40 — **Phase 3 カットオーバー完了（本番は新アカウント配信中）**。残り: Phase 4 後片付け（7/10以降）と、必要になった時のSecrets投入（下記）

## 認証：`scripts/cf.sh` を使う（2026-08-11 確立）

新アカウントへの wrangler 操作は、**必ず `scripts/cf.sh` 経由**で行う。

```bash
bash scripts/cf.sh d1 execute kakiokosi-db --remote --command "SELECT 1"
bash scripts/cf.sh d1 execute kakiokosi-db --remote --file migrations/00XX_....sql
bash scripts/cf.sh deploy
```

**なぜラッパーが要るか（実際に起きた障害）:** `CLOUDFLARE_API_TOKEN` をシェルのプロファイルでグローバルに export していると、別アカウントのプロジェクトにも同じトークンが効く。7/7 のカットオーバー後も `~/.zshenv` と `~/.zshrc` の**両方**に旧 Humanadsai のトークンが残っていた（重複しているので片方だけ直しても効かない）ため、本番 D1 への問い合わせが `code: 7404 database not found` で全滅し、`env -u CLOUDFLARE_API_TOKEN` の OAuth フォールバックも失効していた。結果、キュー補充が実行できないまま 7/22 以降のcronが7回連続で空撃ちし、サイトが23日間更新停止した（0044 で復旧）。

`cf.sh` は継承した `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` を必ず unset してから、このプロジェクト専用の認証ファイルだけを読む。アカウント取り違えが構造的に起きない。

**セットアップ（1回だけ）:**

```bash
mkdir -p ~/.config/cloudflare
printf 'CLOUDFLARE_API_TOKEN=<token>\n' > ~/.config/cloudflare/kakiokosi.env
chmod 600 ~/.config/cloudflare/kakiokosi.env
```

トークンは **info@kakiokosi.com アカウント**で発行し、権限は以下に絞る:

| 種別 | 権限 | レベル |
|---|---|---|
| Account | Workers Scripts | Edit |
| Account | D1 | Edit |
| Account | Account Settings | Read |
| Zone (kakiokosi.com) | Workers Routes | Edit |
| Zone (kakiokosi.com) | Zone | Read |

**やってはいけないこと:** `~/.zshrc` / `~/.zshenv` へのグローバル export（上記の障害の原因）。プロジェクトの `.env` に置くのも不可 — wrangler の `.env` サポートは Worker のローカル実行時の変数用で、wrangler 自身の認証には効かない。

## Phase 3 実施記録（2026-07-07 13:35 JST）

- Secrets 3件（ANTHROPIC_API_KEY / GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET）は**投入せずにカットオーバー**。使用箇所を確認した結果、前者=dashboardのAI執筆（現運用はClaude Code直接執筆で不使用）、後者=dashboardのGoogleログインのみで、公開サイト・cron・IndexNowは非依存。**dashboardログインを使う時に `env -u CLOUDFLARE_API_TOKEN npx wrangler secret put GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET` を投入すること**
- カットオーバー方式: 手順書のDNS手動切替ではなく、`wrangler.jsonc` に routes（custom_domain: true × kakiokosi.com / www）を追加して deploy。**注意: RR7ビルドが設定を `build/server/wrangler.json` にコピーするため、wrangler.jsonc 変更後は `npm run build` 必須**（ビルドせず deploy すると旧設定で飛ぶ）
- カットオーバー前差分チェック: 旧D1 max(updated_at)=07-07 09:00:27（バックアップ09:47より前）で差分ゼロ → 再インポート省略
- 検証済み: 本番 root 200 / http→https 301 / www→apex 301 / sitemap 104 / 記事200+schema / 404、`wrangler tail` でマーク付きリクエストが新Worker到達を確認
- 副次効果: workers.dev は自動無効化（404、重複ホスト解消）。**ゾーン側誤301も解消** — 光の道対談-4 が worker側マップの正しい /share/business/286 に1ホップで到達（付録1は完了扱い）
- wranglerの罠: 旧アカウントのトークンでコマンドを実行すると `node_modules/.cache/wrangler/wrangler-account.json` にaccount_idがキャッシュされ、以後のOAuth実行が旧アカウントに向く。**新アカウント操作は `CLOUDFLARE_ACCOUNT_ID=8798d5a0bf5bab82c8f0d1e3a9087374` を明示**（→ 2026-08-11 以降は上記「認証：`scripts/cf.sh` を使う」に集約。cf.sh がこのIDを既定で渡す）

## Phase 2 実施記録（2026-07-07）

- 移行先D1: 既存の空 `kakiokosi-db`（uuid `a5cb03d2-44eb-4d43-9c1c-90782ffe06a7`、2026-03-28作成の残骸）を全テーブルDROPして再利用。`wrangler.jsonc` の database_id 差し替え済み
- インポート注意点: D1は1ステートメント100KB制限。巨大記事3件（posts id=79,234,307）のINSERTが超過するため、`backups/kakiokosi-db-2026-07-07-split.sql` を生成（INSERT+content追記UPDATE分割、スクリプトはセッションscratchpadの split_big_inserts.py）して投入。**今後の再インポートも split 版を使うこと**
- 検証済み: posts 598 / pages 30 / tags 385（バックアップと完全一致）、分割3記事の本文長一致
- デプロイ済み: `https://kakiokosi.royal-surf-4665.workers.dev`（cron登録済み）。トップ200 / 記事200 / sitemap 104 / robots / 404 / Article schema 確認済み
- Secrets: APP_URL 設定済み。残り3件はユーザーが投入

## 現状の構成（ねじれ）

```
[ゾーンアカウント(別)]  kakiokosi.com ゾーン
   ├─ DNS: kakiokosi.com / www → (おそらく proxied CNAME) → kakiokosi.humanadsai.workers.dev
   └─ リダイレクトルール（http→https、旧WP URL群のレガシー301）
[Humanadsai]  Worker "kakiokosi"（cron 0 0 */3 * *）+ D1 "kakiokosi-db"（8.45MB/10テーブル）
   └─ Secrets: ANTHROPIC_API_KEY / APP_URL / GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET
[Simplememo]  MCP接続のみ（kakiokosiとは無関係）
```

- 元々のねじれの理由は「使用量制限の分散」。Workers無料枠(10万req/日)はアカウント単位だが、現在のkakiokosi トラフィックはごく小（クローラ中心）のため、統合の枠リスクは実質なし。**移行先アカウントに既存の高トラフィックWorkerがある場合のみ要確認**
- Google OAuth のリダイレクトURIは `kakiokosi.com` ドメインのままなので Google Cloud 側の変更は不要（Secretsの再設定のみ）

## Phase 0 — 準備（✅ 2026-07-07 完了）

- ✅ D1フルバックアップ: `backups/kakiokosi-db-2026-07-07.sql`（7.6MB・gitignore済み）
- ✅ Secrets名の棚卸し: 上記4件（**値は読み出し不可** — ユーザーが1Password等から再供給）
- ✅ wrangler.jsonc 確認（`d1_databases[0].database_id` の差し替えが必要になる）

## Phase 1 — 移行先アカウントへの認証（← いまここ・要ユーザー）

**A案（推奨・トークン作成不要）:** プロンプトに `! npx wrangler login` と入力 → ブラウザで**移行先アカウントのCloudflareユーザー**として承認。
以降のコマンドは既存トークンを回避するため `env -u CLOUDFLARE_API_TOKEN npx wrangler ...` で実行する。

**B案:** 移行先アカウントでAPIトークンを作成して渡す。必要権限:
`Account > Workers Scripts:Edit` / `Account > D1:Edit` / `Zone > DNS:Edit`（対象: kakiokosi.com）/ `Account > Workers Custom Domains（またはZone設定編集）`

## Phase 2 — 移行先に複製を構築（ダウンタイムなし・いつでも実行可）

```bash
W="env -u CLOUDFLARE_API_TOKEN npx wrangler"   # A案の場合。B案は CLOUDFLARE_API_TOKEN=<新トークン> を付ける
$W whoami                                       # 移行先アカウントが見えることを確認
$W d1 create kakiokosi-db                       # → 出力された database_id を wrangler.jsonc に反映
$W d1 execute kakiokosi-db --remote --file=backups/kakiokosi-db-2026-07-07.sql
$W secret put ANTHROPIC_API_KEY                 # 4件、値はユーザーが投入
$W secret put APP_URL                           # = https://kakiokosi.com
$W secret put GOOGLE_CLIENT_ID
$W secret put GOOGLE_CLIENT_SECRET
npm run build && $W deploy                      # → kakiokosi.<新アカウント>.workers.dev
```

動作確認（workers.dev上）: トップ200 / 記事200 / sitemap.xml / robots.txt / 404実status。
※ OAuthログインはドメイン依存のためカットオーバー後に確認。

## Phase 3 — カットオーバー（約5分・cron非発火日の実施推奨: 発火日は毎月1,4,7,10…の09:00 JST）

D1への書き込みは cron 公開（3日毎）と dashboard 操作のみ。カットオーバー直前に差分を固定する:

```bash
# 1. 直前スナップショットを旧D1から再取得 → 新D1へ再投入（数分の作業中にdashboard操作をしないこと）
CLOUDFLARE_API_TOKEN=<旧Humanadsaiトークン> npx wrangler d1 export kakiokosi-db --remote --output=backups/cutover.sql
$W d1 execute kakiokosi-db --remote --command "DROP TABLE IF EXISTS ..."   # または新D1を作り直して cutover.sql を流す方が確実
$W d1 execute kakiokosi-db --remote --file=backups/cutover.sql

# 2. ゾーン側で切替（ダッシュボード or API）
#    - DNS: kakiokosi.com / www の CNAME(→kakiokosi.humanadsai.workers.dev) を削除
#    - 新Workerの Settings > Domains & Routes > Custom Domain に kakiokosi.com と www.kakiokosi.com を追加
#      （ゾーン同居ならこれが正攻法。CFプロキシ内部の切替なのでTTL影響は実質なし）

# 3. 検証
curl -sI https://kakiokosi.com/ | head -3                     # 200
curl -sI http://kakiokosi.com/ | head -3                      # 301→https 1ホップ
curl -s https://kakiokosi.com/sitemap.xml | grep -c "<loc>"   # 104±
curl -s https://kakiokosi.com/share/it/1393 | grep -c Article # schema出力
# + ブラウザ: /auth/login → Google OAuth 一周 / /dashboard 表示
```

## Phase 4 — 後片付け（3日以上の併走後）

- 次回cron発火のログを新Worker側で確認（`$W tail` で autopublish JSON）
- 旧Humanadsai側: Worker削除 → D1削除（バックアップ保持）
- ローカルの `CLOUDFLARE_API_TOKEN` を新アカウントのトークンへ差し替え（`.env` / シェルprofile）
- メモリ/ドキュメントの「ねじれ構造」記述を更新

## ロールバック（1分）

新Workerの Custom Domain を外し、ゾーンDNSに旧CNAME（→kakiokosi.humanadsai.workers.dev）を戻す。旧側は Phase 4 まで無傷で残っているのでそのまま復旧する。

## 付録: ゾーンアカウントに触れるついでにやる小修正

1. **旧WPレガシー301ルールの1件誤り:** `…孫正義vs池田信夫「光の道」対談-4` が `/share/business/292`（Part1）に飛んでいる → 正しくは `/share/business/286`（Part4）。※worker側のフォールバックマップ（2026-07-07実装）は正しい行き先を持っているが、ゾーンルールが先に当たるため遮蔽されている
2. **レガシーリダイレクトルールの棚卸し:** worker側マップ（`workers/app.ts` の `LEGACY_REDIRECTS`）と重複するルールを整理し、二重管理を解消（移行後はどちらか一方に寄せる。推奨: リポジトリ管理できるworker側）
