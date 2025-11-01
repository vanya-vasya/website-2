# Clerk Webhook Implementation Guide

## Overview

This implementation provides a production-ready Clerk webhook handler for user registration with:
- ✅ Automatic 20 credit allocation on signup
- ✅ Transaction tracking for all credit operations
- ✅ Idempotency to prevent double-crediting
- ✅ Atomic database operations with automatic rollback
- ✅ Comprehensive test coverage

## What Was Implemented

### 1. Database Schema Updates

**Updated Models:**

```prisma
model User {
  id                   String        @id @default(cuid())
  clerkId              String        @unique
  email                String        @unique
  photo                String
  firstName            String?
  lastName             String?
  usedGenerations      Int           @default(0)
  availableGenerations Int           @default(20)
  transactions         Transaction[]
  createdAt            DateTime      @default(now())
  updatedAt            DateTime      @updatedAt
}

model Transaction {
  id                  String    @id @default(cuid())
  tracking_id         String
  userId              String?
  amount              Int?
  type                String?
  reason              String?
  status              String?
  webhookEventId      String?   @unique
  createdAt           DateTime  @default(now())
  // ... other fields
}

model WebhookEvent {
  id             String   @id @default(cuid())
  eventId        String   @unique
  eventType      String
  processed      Boolean  @default(false)
  processedAt    DateTime?
  createdAt      DateTime @default(now())
}
```

### 2. Enhanced Webhook Handler

**File:** `app/api/webhooks/clerk/route.ts`

**Key Features:**
- Idempotency check using `WebhookEvent` table
- Atomic transaction wrapping User + Transaction creation
- Proper error handling with rollback support
- Detailed logging for debugging

**Flow:**
1. Verify webhook signature (Svix)
2. Check if event already processed (idempotency)
3. Start database transaction
4. Create `WebhookEvent` record
5. Create `User` with 20 credits
6. Create `Transaction` record for signup bonus
7. Mark `WebhookEvent` as processed
8. Update Clerk metadata
9. Return success response

### 3. Comprehensive Test Suite

**Unit Tests:** `__tests__/webhooks/clerk.test.ts`
- Mocked dependencies
- Fast execution
- Tests all code paths

**Integration Tests:** `__tests__/integration/clerk-webhook.integration.test.ts`
- Real database operations
- Tests actual transaction behavior
- Verifies idempotency in production-like scenario

## Setup Instructions

### Step 1: Install Dependencies

```bash
npm install
```

This will install the new test dependencies:
- `jest` - Test framework
- `@types/jest` - TypeScript support
- `@testing-library/react` - Component testing utilities
- `dotenv` - Environment variable management

### Step 2: Run Database Migration

Generate and apply the schema changes:

```bash
# Generate Prisma client with new schema
npx prisma generate

# Create and apply migration
npx prisma migrate dev --name add-webhook-idempotency

# Or if you want to reset the database completely:
npx prisma migrate reset
```

**Important:** This will add the `WebhookEvent` table and update existing tables. Backup your production database before applying!

### Step 3: Configure Environment Variables

Ensure these are set in your `.env` file:

```env
# Existing
DATABASE_URL="your_neon_postgres_url"
WEBHOOK_SECRET="your_clerk_webhook_secret"

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."
```

For testing, create `.env.test`:

```env
DATABASE_URL="your_test_database_url"
WEBHOOK_SECRET="test_webhook_secret"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
```

### Step 4: Configure Clerk Webhook

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to **Webhooks** section
3. Click **Add Endpoint**
4. Set URL: `https://your-domain.com/api/webhooks/clerk`
5. Subscribe to event: `user.created`
6. Copy the **Signing Secret** to your `WEBHOOK_SECRET` env var

### Step 5: Run Tests

```bash
# Run all tests
npm test

# Run unit tests only (fast, no DB required)
npm run test:unit

# Run integration tests (requires test DB)
npm run test:integration

# Run with coverage report
npm run test:ci
```

## Verification Checklist

After deployment, verify the implementation:

### ✅ Database Check

```sql
-- Check User was created with correct credits
SELECT "clerkId", email, "availableGenerations" 
FROM "User" 
WHERE "clerkId" = 'user_xxx';

-- Should show 20 availableGenerations

-- Check Transaction was recorded
SELECT amount, type, reason, status, "webhookEventId"
FROM "Transaction"
WHERE tracking_id = 'user_xxx';

-- Should show: amount=20, type='credit', reason='signup bonus'

-- Check WebhookEvent was logged
SELECT "eventId", "eventType", processed, "processedAt"
FROM "WebhookEvent"
WHERE "eventType" = 'user.created'
ORDER BY "createdAt" DESC
LIMIT 5;

-- Should show processed=true for successful webhooks
```

### ✅ Idempotency Test

1. Trigger the same webhook twice (Clerk Dashboard -> Webhooks -> Resend)
2. Check logs - second attempt should log "Already processed"
3. Verify user still has exactly 20 credits
4. Verify only one Transaction record exists

### ✅ Error Recovery Test

1. Temporarily break the database connection
2. Trigger webhook - should fail with 500 error
3. Restore database connection
4. Clerk will retry webhook automatically
5. Verify user is created successfully on retry

## Monitoring & Debugging

### Logs to Watch

```javascript
// Success log
"Successfully created user user_xxx with 20 signup credits"

// Idempotency log
"Webhook event evt_xxx already processed, skipping..."

// Error log
"Error creating user: [error details]"
```

### Common Issues

**Issue:** Duplicate key error on `webhookEventId`
- **Cause:** Webhook processing was interrupted after WebhookEvent created but before marking as processed
- **Fix:** Check WebhookEvent table, mark as processed or delete the record

**Issue:** User has 0 credits after signup
- **Cause:** Transaction rolled back, webhook not marked as processed
- **Fix:** Resend webhook from Clerk dashboard

**Issue:** Multiple transactions for same user
- **Cause:** Idempotency check not working (different webhook IDs)
- **Fix:** Check that `svixEventId` is being captured correctly

## Production Considerations

### 1. Webhook Retries

Clerk automatically retries failed webhooks with exponential backoff:
- 1st retry: after 5 seconds
- 2nd retry: after 5 minutes
- 3rd retry: after 30 minutes
- 4th retry: after 2 hours
- 5th retry: after 5 hours

Your implementation handles this gracefully with idempotency.

### 2. Database Transactions

All operations are wrapped in Prisma's `$transaction`:
```typescript
await prismadb.$transaction(async (tx) => {
  // All operations here succeed or fail together
});
```

If any operation fails, everything rolls back automatically.

### 3. Monitoring

Set up alerts for:
- Webhook endpoint returning 500 errors
- Webhooks taking > 5 seconds to process
- Users created without corresponding Transaction records (should be 0)

### 4. Scaling

This implementation handles:
- ✅ High webhook volume (async processing)
- ✅ Concurrent webhooks for different users
- ✅ Duplicate webhooks (idempotency)
- ✅ Database connection pooling (Prisma + Neon)

## Testing in Development

### Manual Test with cURL

```bash
# Get your webhook secret
WEBHOOK_SECRET="your_secret_here"

# Send test webhook (you'll need to generate proper Svix signature)
curl -X POST http://localhost:3000/api/webhooks/clerk \
  -H "Content-Type: application/json" \
  -H "svix-id: test_evt_123" \
  -H "svix-timestamp: $(date +%s)" \
  -H "svix-signature: v1,test_signature" \
  -d '{
    "data": {
      "id": "user_test123",
      "email_addresses": [{"email_address": "test@example.com"}],
      "first_name": "Test",
      "last_name": "User",
      "image_url": "https://example.com/photo.jpg"
    },
    "type": "user.created"
  }'
```

### Using Clerk Dashboard

1. Go to Clerk Dashboard → Webhooks
2. Click on your webhook endpoint
3. Go to "Testing" tab
4. Click "Send Example" for `user.created` event
5. Check your local logs and database

## Rollback Plan

If you need to rollback:

### Option 1: Rollback Migration Only

```bash
# Revert the last migration
npx prisma migrate resolve --rolled-back 20250124_add_webhook_idempotency

# Apply old schema
npx prisma migrate deploy
```

### Option 2: Revert Code Changes

```bash
# Revert webhook handler
git checkout HEAD~1 app/api/webhooks/clerk/route.ts

# Revert schema
git checkout HEAD~1 prisma/schema.prisma

# Redeploy
npm run build
```

The old code will continue to work (users get 20 credits by default from schema), but without idempotency protection.

## Support

For issues or questions:
1. Check test output: `npm run test:ci`
2. Review logs in your hosting platform
3. Check Clerk webhook logs in dashboard
4. Query database to verify state

## Next Steps

Consider these enhancements:
- [ ] Add webhook for `user.deleted` to clean up transactions
- [ ] Implement credit purchase tracking
- [ ] Add webhook monitoring dashboard
- [ ] Set up Sentry/DataDog for error tracking
- [ ] Add rate limiting for webhook endpoint
- [ ] Implement webhook event replay for recovery

