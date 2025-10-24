#!/bin/bash

# Script to baseline existing database with Prisma migrations
# Run this once to mark all existing migrations as applied
# 
# Usage:
#   chmod +x scripts/baseline-migrations.sh
#   ./scripts/baseline-migrations.sh

echo "🔧 Baselining Prisma migrations..."
echo ""
echo "This will mark all existing migrations as applied without running them."
echo "Use this when you have an existing database that matches your schema."
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is not set"
    echo ""
    echo "Set it first:"
    echo "  export DATABASE_URL='your_neon_postgres_url'"
    echo ""
    exit 1
fi

echo "📊 Current migration status:"
npx prisma migrate status
echo ""

echo "⚠️  WARNING: This will baseline ALL migrations in prisma/migrations/"
echo ""
read -p "Continue? (y/N): " confirm

if [[ $confirm != [yY] ]]; then
    echo "Cancelled."
    exit 0
fi

echo ""
echo "🚀 Running baseline..."

# Resolve migrations as applied without running them
npx prisma migrate resolve --applied 20240826000000_init
npx prisma migrate resolve --applied 20240826000001_add_transaction_fields
npx prisma migrate resolve --applied 20240826000002_update_user_fields
npx prisma migrate resolve --applied 20250124000000_add_webhook_idempotency_and_tracking

echo ""
echo "✅ Baseline complete!"
echo ""
echo "📊 New migration status:"
npx prisma migrate status
echo ""
echo "Now you can use 'prisma migrate deploy' in your build process."

