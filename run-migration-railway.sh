#!/bin/bash
# This script will run the migration on Railway's production database

echo "🚀 Running migration on Railway production database..."

railway run -- npx prisma migrate deploy

echo "✅ Migration complete! Restart your service in Railway dashboard."

