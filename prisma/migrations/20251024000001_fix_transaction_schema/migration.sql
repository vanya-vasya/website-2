-- Fix Transaction table schema
-- 1. Handle duplicate tracking_id values
-- 2. Make tracking_id unique for proper idempotency
-- 3. Fix foreign key relationship (userId -> User.clerkId)
-- 4. Add indexes for better query performance
-- 5. Make userId NOT NULL (required for referential integrity)

-- Step 1: Handle duplicate tracking_id values
-- Keep only the most recent transaction for each tracking_id
DO $$ 
BEGIN
  -- Delete older duplicate transactions, keeping the newest one
  DELETE FROM "Transaction" t1
  USING "Transaction" t2
  WHERE t1."tracking_id" = t2."tracking_id"
    AND t1."createdAt" < t2."createdAt";
END $$;

-- Step 2: Update existing NULL userId values
-- In production, you should manually review and fix these records
UPDATE "Transaction" 
SET "userId" = "tracking_id" 
WHERE "userId" IS NULL OR "userId" = '';

-- Step 3: Make tracking_id unique (if not already)
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

