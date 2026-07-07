# Cloudflare アカウント統合 移行手順書

**作成:** 2026-07-07（監査v5フォロー）
**目的:** Worker + D1 を Humanadsai アカウントから kakiokosi.com ゾーンのあるアカウントへ移し、ねじれ構造を解消する
**状態:** Phase 0 完了。**Phase 1 の認証情報待ちでブロック中**（下記2択のどちらかをユーザーが用意した時点で、以降は Claude Code が実行可能）

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
