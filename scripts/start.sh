#!/bin/sh
# Container entrypoint: prepare the SQLite database, then start the server.
set -e

# Hosts such as Render publish the public URL; NextAuth needs it for sign-in.
export NEXTAUTH_URL="${NEXTAUTH_URL:-$RENDER_EXTERNAL_URL}"

mkdir -p /app/data
npx prisma db push --skip-generate
npx prisma db seed
exec node server.js
