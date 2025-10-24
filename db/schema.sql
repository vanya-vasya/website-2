-- Drop existing tables if they exist
DROP TABLE IF EXISTS "Transaction" CASCADE;
DROP TABLE IF EXISTS "WebhookEvent" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

-- Create User table
CREATE TABLE "User" (
    "id" TEXT PRIMARY KEY,
    "clerkId" TEXT UNIQUE NOT NULL,
    "email" TEXT UNIQUE NOT NULL,
    "photo" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "usedGenerations" INTEGER NOT NULL DEFAULT 0,
    "availableGenerations" INTEGER NOT NULL DEFAULT 20,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create Transaction table
CREATE TABLE "Transaction" (
    "id" TEXT PRIMARY KEY,
    "tracking_id" TEXT NOT NULL,
    "userId" TEXT,
    "status" TEXT,
    "amount" INTEGER,
    "currency" TEXT,
    "description" TEXT,
    "type" TEXT,
    "payment_method_type" TEXT,
    "message" TEXT,
    "paid_at" TIMESTAMP,
    "receipt_url" TEXT,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reason" TEXT,
    "webhookEventId" TEXT UNIQUE
);

-- Create WebhookEvent table
CREATE TABLE "WebhookEvent" (
    "id" TEXT PRIMARY KEY,
    "eventId" TEXT UNIQUE NOT NULL,
    "eventType" TEXT NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "processedAt" TIMESTAMP,
    "createdAt" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX "idx_user_clerkId" ON "User"("clerkId");
CREATE INDEX "idx_user_email" ON "User"("email");
CREATE INDEX "idx_transaction_userId" ON "Transaction"("userId");
CREATE INDEX "idx_transaction_tracking_id" ON "Transaction"("tracking_id");
CREATE INDEX "idx_transaction_webhookEventId" ON "Transaction"("webhookEventId");
CREATE INDEX "idx_webhookEvent_eventId" ON "WebhookEvent"("eventId");
CREATE INDEX "idx_webhookEvent_processed" ON "WebhookEvent"("processed");

-- Create function to auto-update updatedAt timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to auto-update updatedAt on User table
CREATE TRIGGER update_user_updated_at BEFORE UPDATE ON "User"
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions (adjust if needed based on your database role)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_database_user;

