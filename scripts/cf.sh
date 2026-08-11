#!/usr/bin/env bash
# kakiokosi 本番（info@kakiokosi.com アカウント）向けの wrangler ラッパー。
#
# なぜ必要か:
#   CLOUDFLARE_API_TOKEN をシェルのプロファイルでグローバルに export すると、
#   別アカウントのプロジェクトにも同じトークンが効いてしまう。2026-07 の
#   アカウント統合後、旧 Humanadsai 側のトークンが効き続けた結果、本番 D1 が
#   「7404 database not found」で到達不能になり、キュー補充が止まった。
#   このラッパーは継承された認証情報を必ず捨ててから、このプロジェクト専用の
#   認証ファイルだけを読み込む。
#
# 使い方:
#   bash scripts/cf.sh d1 execute kakiokosi-db --remote --command "SELECT 1"
#   bash scripts/cf.sh d1 execute kakiokosi-db --remote --file migrations/00XX.sql
#   bash scripts/cf.sh deploy
#
# 事前準備（1回だけ）:
#   mkdir -p ~/.config/cloudflare
#   printf 'CLOUDFLARE_API_TOKEN=<token>\n' > ~/.config/cloudflare/kakiokosi.env
#   chmod 600 ~/.config/cloudflare/kakiokosi.env
#
# 必要なトークン権限（info@kakiokosi.com アカウントで発行）:
#   Account: Workers Scripts=Edit / D1=Edit / Account Settings=Read
#   Zone(kakiokosi.com): Workers Routes=Edit / Zone=Read
set -euo pipefail

CRED="${CF_CRED_FILE:-$HOME/.config/cloudflare/kakiokosi.env}"
DEFAULT_ACCOUNT_ID="8798d5a0bf5bab82c8f0d1e3a9087374" # info@kakiokosi.com アカウント

if [[ ! -f "$CRED" ]]; then
  echo "認証ファイルがありません: $CRED" >&2
  echo "Cloudflare ダッシュボードで API トークンを作成し、次のように保存してください:" >&2
  echo "  mkdir -p \"$(dirname "$CRED")\"" >&2
  echo "  printf 'CLOUDFLARE_API_TOKEN=<token>\\n' > \"$CRED\"" >&2
  echo "  chmod 600 \"$CRED\"" >&2
  exit 1
fi

# プロファイル由来（旧アカウント）の認証情報を必ず捨ててから読み込む
unset CLOUDFLARE_API_TOKEN CLOUDFLARE_ACCOUNT_ID CF_API_TOKEN CF_ACCOUNT_ID

set -a
# shellcheck disable=SC1090
source "$CRED"
set +a

export CLOUDFLARE_ACCOUNT_ID="${CLOUDFLARE_ACCOUNT_ID:-$DEFAULT_ACCOUNT_ID}"

if [[ -z "${CLOUDFLARE_API_TOKEN:-}" ]]; then
  echo "$CRED に CLOUDFLARE_API_TOKEN が設定されていません" >&2
  exit 1
fi

exec npx wrangler "$@"
