#!/bin/bash
set -e

echo "========================================="
echo "Starting RPO-SaaS Backend"
echo "========================================="

echo "Checking Prisma Client..."
if [ ! -d "node_modules/.prisma/client" ]; then
  echo "ERROR: Prisma Client not found!"
  exit 1
fi

echo "Running Prisma DB push..."
if ! npx prisma db push --accept-data-loss --skip-generate; then
  echo "WARNING: Prisma DB push failed, but continuing..."
fi

echo "Starting application..."
exec npm run start:prod
