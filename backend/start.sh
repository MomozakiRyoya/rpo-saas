#!/bin/bash
set -e

echo "Running Prisma DB push..."
npx prisma db push --accept-data-loss

echo "Starting application..."
npm run start:prod
