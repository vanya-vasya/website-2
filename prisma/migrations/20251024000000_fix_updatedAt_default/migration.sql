-- Fix updatedAt column missing default value
-- This fixes: Null constraint violation on the fields: (`updatedAt`)
-- Issue: Prisma @updatedAt directive requires database default for NOT NULL column

ALTER TABLE "User" 
ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;


