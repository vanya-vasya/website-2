# Test Suite for Clerk Webhook Handler

This directory contains comprehensive tests for the Clerk webhook handler that manages user registration and initial credit allocation.

## Test Structure

### Unit Tests (`/webhooks/clerk.test.ts`)
Tests the webhook handler logic in isolation with mocked dependencies:
- ✅ Successful user creation with 20 credits
- ✅ Transaction record creation for signup bonus
- ✅ Idempotency - duplicate webhooks don't double-credit
- ✅ DB failure rollback scenarios
- ✅ Edge cases (missing secrets, invalid signatures, etc.)

### Integration Tests (`/integration/clerk-webhook.integration.test.ts`)
Tests against a real database connection:
- ✅ Atomic transaction verification
- ✅ Real database idempotency checks
- ✅ Rollback on actual DB failures
- ✅ Concurrent webhook processing

## Running Tests

### Prerequisites

1. **Install dependencies:**
```bash
npm install
```

2. **Set up test database:**
Create a separate test database in your Neon console or local Postgres, then create `.env.test`:
```env
DATABASE_URL="postgresql://user:password@host/nerbixa_test?schema=public"
WEBHOOK_SECRET="test_webhook_secret_key"
```

3. **Run migrations on test database:**
```bash
DATABASE_URL="your_test_db_url" npx prisma migrate dev
```

### Test Commands

```bash
# Run all tests in watch mode
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run tests with coverage (CI mode)
npm run test:ci
```

## Test Coverage

The test suite covers:

1. **Happy Path**
   - User creation with initial 20 credits
   - Transaction record creation with correct metadata
   - Clerk metadata update

2. **Idempotency**
   - Duplicate webhook detection via `webhookEventId`
   - No double-crediting on retries
   - Graceful handling of concurrent webhooks

3. **Error Handling**
   - Database transaction rollback on failures
   - Proper error responses
   - Retry capability after failures

4. **Edge Cases**
   - Missing environment variables
   - Invalid webhook signatures
   - Missing headers
   - Database constraint violations

## Implementation Details

### Idempotency Strategy
The webhook handler uses the `WebhookEvent` model to track processed events:
- Before processing, checks if `eventId` exists and is marked as `processed`
- If already processed, returns existing user data
- Creates `WebhookEvent` record at the start of the transaction
- Marks as processed only after successful completion

### Atomic Transactions
Uses Prisma's `$transaction` API to ensure:
- User creation
- Transaction record creation
- WebhookEvent tracking

All operations succeed or fail together - no partial updates.

### Database Schema Changes

The implementation adds/modifies these fields:

**User model:**
- `createdAt`: Timestamp tracking
- `updatedAt`: Auto-updated timestamp

**Transaction model:**
- `reason`: Description of transaction (e.g., "signup bonus")
- `webhookEventId`: Links transaction to webhook event (unique)
- `createdAt`: Timestamp tracking

**WebhookEvent model (new):**
- `eventId`: Unique webhook event identifier
- `eventType`: Type of event (e.g., "user.created")
- `processed`: Boolean flag
- `processedAt`: When processing completed

## Troubleshooting

### Tests fail with "User already exists"
Run cleanup before tests:
```sql
DELETE FROM "Transaction" WHERE tracking_id LIKE 'test_%';
DELETE FROM "User" WHERE clerkId LIKE 'test_%';
DELETE FROM "WebhookEvent" WHERE eventId LIKE 'svix_test_%';
```

### Integration tests timeout
Increase timeout in `jest.setup.js` or individual test files:
```javascript
jest.setTimeout(30000); // 30 seconds
```

### Database connection issues
Verify your `DATABASE_URL` in `.env.test` is correct and the database is accessible.

## Continuous Integration

For CI/CD pipelines, use:
```bash
npm run test:ci
```

This runs tests once with coverage reporting and exits (no watch mode).

## Coverage Thresholds

Minimum coverage requirements (enforced in `jest.config.js`):
- Branches: 80%
- Functions: 80%
- Lines: 80%
- Statements: 80%

