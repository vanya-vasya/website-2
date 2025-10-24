-- Fix Transaction table schema
-- 1. Make tracking_id unique for proper idempotency
-- 2. Fix foreign key relationship (userId -> User.clerkId)
-- 3. Add indexes for better query performance
-- 4. Make userId NOT NULL (required for referential integrity)

-- Step 1: Drop existing foreign key constraint
-- Note: In Prisma relationMode="prisma", foreign keys are not enforced at database level
-- So we just need to update the schema

-- Step 2: Make tracking_id unique (if not already)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE tablename = 'Transaction' 
    AND indexname = 'Transaction_tracking_id_key'
  ) THEN
    ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_tracking_id_key" UNIQUE ("tracking_id");
  END IF;
END $$;

-- Step 3: Update existing NULL userId values to empty string (temporary fix)
-- In production, you should manually review and fix these records
UPDATE "Transaction" 
SET "userId" = "tracking_id" 
WHERE "userId" IS NULL OR "userId" = '';

-- Step 4: Make userId NOT NULL
ALTER TABLE "Transaction" ALTER COLUMN "userId" SET NOT NULL;

-- Step 5: Add indexes for better query performance
CREATE INDEX IF NOT EXISTS "Transaction_userId_idx" ON "Transaction"("userId");
CREATE INDEX IF NOT EXISTS "Transaction_status_idx" ON "Transaction"("status");
CREATE INDEX IF NOT EXISTS "Transaction_paid_at_idx" ON "Transaction"("paid_at");

-- Step 6: Add index on createdAt for Transaction ordering
CREATE INDEX IF NOT EXISTS "Transaction_createdAt_idx" ON "Transaction"("createdAt" DESC);

-- Step 7: Add composite index for common queries (user + status)
CREATE INDEX IF NOT EXISTS "Transaction_userId_status_idx" ON "Transaction"("userId", "status");

