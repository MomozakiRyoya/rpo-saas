#!/bin/bash

echo "========================================="
echo "Starting RPO-SaaS Backend - SIMPLIFIED"
echo "========================================="

# Don't exit on errors - continue even if commands fail
set +e

echo "Environment check:"
echo "  NODE_ENV: ${NODE_ENV}"
echo "  DATABASE_URL: ${DATABASE_URL:0:30}..."
echo "  PORT: ${PORT}"

echo ""
echo "Checking Prisma Client..."
if [ -d "node_modules/.prisma/client" ]; then
  echo "✅ Prisma Client found"
else
  echo "⚠️  Prisma Client NOT found - may cause issues"
fi

echo ""
echo "Attempting Prisma DB push (non-blocking)..."
npx prisma db push --accept-data-loss --skip-generate 2>&1 | head -10 || echo "⚠️  DB push failed (continuing anyway)"

echo ""
echo "========================================="
echo "Starting Node application..."
echo "========================================="

# Use exec to replace shell process with node process
# Note: NestJS outputs to dist/src/main.js, not dist/main.js
exec node dist/src/main.js
