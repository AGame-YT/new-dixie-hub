#!/usr/bin/env bash
# One-off setup for a fresh checkout, including GitHub Codespaces.
# Creates .env with random secrets, installs packages and seeds demo data.
set -euo pipefail
cd "$(dirname "$0")/.."

random() {
  node -e "console.log(require('crypto').randomBytes($1).toString('base64url'))"
}

if [ ! -f .env ]; then
  cp .env.example .env
  sed -i "s#^NEXTAUTH_SECRET=.*#NEXTAUTH_SECRET=$(random 32)#" .env
  sed -i "s#^ADMIN_LOCAL_PASSWORD=.*#ADMIN_LOCAL_PASSWORD=$(random 12)#" .env
fi

# In a codespace, sign-in must redirect to the forwarded https address.
if [ -n "${CODESPACE_NAME:-}" ]; then
  url="https://${CODESPACE_NAME}-3000.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"
  sed -i "s#^NEXTAUTH_URL=.*#NEXTAUTH_URL=${url}#" .env
fi

npm install
npx prisma db push
npm run db:seed

echo
echo "Dixie Hub is ready. Start it with: npm run dev"
echo "Local admin login (/admin/login): $(grep '^ADMIN_LOCAL_USERNAME=' .env | cut -d= -f2) / $(grep '^ADMIN_LOCAL_PASSWORD=' .env | cut -d= -f2)"
