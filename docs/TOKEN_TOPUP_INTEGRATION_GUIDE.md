# Token Top-up System Integration Guide

Complete guide for the integrated token replenishment system with SecureProcessor Pay.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [Migration Steps](#migration-steps)
5. [API Reference](#api-reference)
6. [Testing](#testing)
7. [Deployment](#deployment)
8. [Troubleshooting](#troubleshooting)

---

## Overview

The token top-up system enables users to purchase additional tokens for AI generation features through SecureProcessor Pay integration. The system includes:

✅ **Multi-currency support** (15+ currencies)  
✅ **Automated PDF receipt generation**  
✅ **Email confirmations with attachments**  
✅ **Payment history tracking**  
✅ **Webhook signature verification**  
✅ **Idempotency protection**  
✅ **Transaction rollback on failure**  
✅ **Concurrent request handling**

---

## Architecture

### Data Flow

```
User → Pro Modal → Payment API → SecureProcessor → Webhook → Database → Email Receipt
```

### Components

#### 1. **Database Layer**
- `User` table: Stores user profile and token balance
- `Transaction` table: Records all payment transactions
- `WebhookEvent` table: Tracks webhook processing for idempotency

#### 2. **API Routes**
- `/api/payment/secure-processor` - Creates payment checkout sessions
- `/api/webhooks/secure-processor` - Processes payment webhooks

#### 3. **Services**
- `lib/api-limit.ts` - Token balance management
- `lib/actions/user.actions.ts` - User CRUD operations
- `lib/receiptGeneration.tsx` - PDF receipt generation
- `config/nodemailer.ts` - Email configuration

#### 4. **Frontend Components**
- `components/pro-modal.tsx` - Payment modal
- `components/buy-generations.tsx` - Buy button
- `components/free-counter.tsx` - Token counter display

---

## Database Schema

### User Table

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
  createdAt            DateTime      @default(now())
  updatedAt            DateTime      @updatedAt
  transactions         Transaction[]
}
```

**Key Fields:**
- `availableGenerations`: Total tokens available
- `usedGenerations`: Tokens consumed
- **Net Balance** = `availableGenerations - usedGenerations`

### Transaction Table

```prisma
model Transaction {
  id                  String    @id @default(cuid())
  tracking_id         String    @unique // SecureProcessor transaction ID
  userId              String    // Clerk user ID (foreign key)
  status              String?   // successful, failed, pending, etc.
  amount              Int?      // Amount in cents
  currency            String?   // Currency code (USD, GBP, EUR)
  description         String?   // Payment description with token count
  type                String?   // payment, refund, credit
  payment_method_type String?   // card, bank_transfer
  message             String?   // Success/error message
  paid_at             DateTime? // Payment timestamp
  receipt_url         String?   // PDF receipt URL
  createdAt           DateTime  @default(now())
  reason              String?   // Failure/cancellation reason
  webhookEventId      String?   @unique // For legacy idempotency
  user                User      @relation(fields: [userId], references: [clerkId])
  
  @@index([userId])
  @@index([status])
  @@index([paid_at])
}
```

---

## Migration Steps

### Step 1: Database Migration

```bash
# Run the schema migration
npx prisma migrate deploy

# Or create a new migration
npx prisma migrate dev --name fix_transaction_schema
```

The migration will:
1. Make `tracking_id` unique for idempotency
2. Fix foreign key relationship (`userId` -> `User.clerkId`)
3. Add performance indexes
4. Make `userId` NOT NULL

### Step 2: Environment Variables

Add to `.env`:

```bash
# SecureProcessor Pay Configuration
SECURE_PROCESSOR_SHOP_ID=your_shop_id
SECURE_PROCESSOR_SECRET_KEY=your_secret_key
SECURE_PROCESSOR_TEST_MODE=true # Set to false for production
SECURE_PROCESSOR_RETURN_URL=https://nerbixa.com/dashboard
SECURE_PROCESSOR_WEBHOOK_URL=https://nerbixa.com/api/webhooks/secure-processor

# Email Configuration (Titan Email)
OUTBOX_EMAIL=noreply@nerbixa.com
OUTBOX_EMAIL_PASSWORD=your_email_password
INBOX_EMAIL=support@nerbixa.com
```

### Step 3: Verify Services

Check that all services are properly configured:

```typescript
// Test user creation
import { createOrGetUser } from '@/lib/actions/user.actions';

// Test API limit
import { getApiAvailableGenerations } from '@/lib/api-limit';

// Test receipt generation
import { generatePdfReceipt } from '@/lib/receiptGeneration';
```

### Step 4: Configure Webhooks

1. Go to SecureProcessor Dashboard
2. Navigate to Webhooks settings
3. Add webhook URL: `https://nerbixa.com/api/webhooks/secure-processor`
4. Select events: `payment.successful`, `payment.failed`, `payment.refunded`
5. Save and verify webhook secret

---

## API Reference

### Payment API

**Endpoint:** `POST /api/payment/secure-processor`

**Request Body:**
```json
{
  "amount": 20.00,
  "currency": "USD",
  "orderId": "gen_user_2ABC123DEF456_1234567890",
  "description": "Payment for 100 Tokens (100 Tokens)",
  "customerEmail": "user@example.com",
  "userId": "user_2ABC123DEF456"
}
```

**Response:**
```json
{
  "success": true,
  "token": "checkout_token_xyz",
  "payment_url": "https://checkout.secure-processorpay.com/...",
  "checkout_id": "checkout_token_xyz",
  "test_mode": true
}
```

### Webhook API

**Endpoint:** `POST /api/webhooks/secure-processor`

**Request Body (from SecureProcessor):**
```json
{
  "status": "successful",
  "order_id": "order_123",
  "transaction_id": "txn_abc123",
  "amount": 2000,
  "currency": "USD",
  "type": "payment",
  "customer_email": "user@example.com",
  "tracking_id": "user_2ABC123DEF456",
  "description": "Payment for 100 Tokens (100 Tokens)",
  "payment_method_type": "card",
  "message": "Payment successful",
  "paid_at": "2025-10-24T12:00:00Z",
  "signature": "hmac_signature_here"
}
```

**Response:**
```json
{
  "status": "ok"
}
```

**Idempotent Response:**
```json
{
  "status": "ok",
  "message": "Transaction already processed",
  "idempotent": true,
  "method": "tracking_id"
}
```

---

## Testing

### Unit Tests

Run unit tests for token top-up logic:

```bash
npm test __tests__/unit/token-topup.test.ts
```

**Test Coverage:**
- Token purchase calculations
- Balance updates
- Transaction recording
- Error handling
- Edge cases (zero amounts, refunds)
- Currency handling

### Integration Tests

Run integration tests for idempotency and full flow:

```bash
npm test __tests__/integration/token-topup-idempotency.test.ts
```

**Test Coverage:**
- Duplicate webhook prevention
- Concurrent webhook handling
- Transaction rollback on failure
- End-to-end payment flow
- Webhook signature verification

### Manual Testing

#### Test Successful Payment

1. Navigate to `/dashboard`
2. Click "Buy More" button
3. Select token package (e.g., 100 tokens)
4. Complete payment with test card:
   - **Card Number:** `4111 1111 1111 1111`
   - **Expiry:** Any future date
   - **CVV:** `123`
5. Verify redirect to dashboard
6. Check email for receipt
7. Verify token balance updated

#### Test Failed Payment

1. Use test card for declined payment:
   - **Card Number:** `4000 0000 0000 0002`
2. Verify payment fails
3. Verify no tokens added
4. Verify transaction recorded as failed

#### Test Idempotency

1. Send duplicate webhook using curl:

```bash
curl -X POST https://nerbixa.com/api/webhooks/secure-processor \
  -H "Content-Type: application/json" \
  -d '{
    "tracking_id": "txn_test_123",
    "status": "successful",
    "amount": 2000,
    "currency": "USD",
    "description": "Payment for 100 Tokens (100 Tokens)",
    "signature": "valid_signature_here"
  }'
```

2. Send same webhook again
3. Verify second request returns idempotent response
4. Verify tokens only added once

---

## Deployment

### Pre-deployment Checklist

- [ ] Run database migration
- [ ] Set production environment variables
- [ ] Configure SecureProcessor webhooks
- [ ] Test payment flow in staging
- [ ] Verify email sending works
- [ ] Check SSL certificate validity
- [ ] Review error logging setup

### Deployment Steps

1. **Deploy Database Migration:**
```bash
# On production server
npx prisma migrate deploy
```

2. **Deploy Application:**
```bash
git push origin main
# Or use your CI/CD pipeline
```

3. **Verify Deployment:**
```bash
# Check webhook endpoint is accessible
curl https://nerbixa.com/api/webhooks/secure-processor

# Should return:
# {"message":"Secure-processor webhook endpoint is active","timestamp":"..."}
```

4. **Monitor Initial Transactions:**
- Check logs for webhook processing
- Verify token balance updates
- Confirm receipt emails sent
- Review transaction records in database

### Production Monitoring

Monitor these metrics:
- Webhook processing time (< 2 seconds)
- Idempotent rejection rate
- Failed payment rate
- Email delivery rate
- Database transaction errors

---

## Troubleshooting

### Common Issues

#### 1. Webhook Not Receiving Events

**Symptoms:**
- Payment completes but tokens not added
- No webhook logs in console

**Solutions:**
- Verify webhook URL in SecureProcessor dashboard
- Check firewall allows SecureProcessor IPs
- Verify SSL certificate valid
- Check webhook endpoint responds with 200 OK

**Test:**
```bash
curl -X GET https://nerbixa.com/api/webhooks/secure-processor
```

#### 2. Duplicate Token Credits

**Symptoms:**
- User receives tokens twice for same payment
- Multiple transaction records with same tracking_id

**Solutions:**
- Verify `tracking_id` is unique in Transaction table
- Check idempotency logic in webhook handler
- Review database transaction isolation level

**Debug:**
```sql
-- Check for duplicate transactions
SELECT tracking_id, COUNT(*) as count
FROM "Transaction"
WHERE status = 'successful'
GROUP BY tracking_id
HAVING COUNT(*) > 1;
```

#### 3. Email Not Sending

**Symptoms:**
- Payment successful but no receipt email
- Email errors in webhook logs

**Solutions:**
- Verify SMTP credentials in environment variables
- Check OUTBOX_EMAIL and OUTBOX_EMAIL_PASSWORD
- Test email configuration:

```typescript
import { transporter } from '@/config/nodemailer';

// Send test email
await transporter.sendMail({
  from: process.env.OUTBOX_EMAIL,
  to: 'test@example.com',
  subject: 'Test Email',
  text: 'This is a test email from Nerbixa.',
});
```

#### 4. Balance Not Updating

**Symptoms:**
- Transaction recorded but balance unchanged
- User can't use purchased tokens

**Solutions:**
- Check `availableGenerations` calculation:
  ```typescript
  // Should be: oldBalance - usedGenerations + tokensAdded
  const newBalance = user.availableGenerations - user.usedGenerations + tokensToAdd;
  ```
- Verify `usedGenerations` reset to 0
- Check database transaction completed successfully

**Debug:**
```sql
-- Check user balance
SELECT clerkId, availableGenerations, usedGenerations,
       (availableGenerations - usedGenerations) as net_balance
FROM "User"
WHERE clerkId = 'user_id_here';
```

#### 5. Invalid Token Count Extraction

**Symptoms:**
- Webhook fails with "Invalid description format"
- Description doesn't match expected pattern

**Solutions:**
- Ensure description includes token count in format: `(100 Tokens)`
- Valid patterns:
  - `Payment for 100 Tokens (100 Tokens)` ✅
  - `Nerbixa Tokens Purchase (50 Tokens)` ✅
  - `Token Top-up (1 Token)` ✅
  - `Payment for tokens` ❌ (missing count)

**Fix:**
```typescript
// Robust token extraction
const match = description.match(/\((\d+)\s+Tokens?\)/i);
const tokens = match ? parseInt(match[1], 10) : null;

if (!tokens) {
  throw new Error(`Cannot extract token count from: ${description}`);
}
```

---

## Usage Examples

### Creating a Token Purchase

```typescript
// Client-side code (in a component)
const handleBuyTokens = async (packageData: {
  tokens: number;
  price: number;
  currency: string;
}) => {
  const response = await fetch('/api/payment/secure-processor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      amount: packageData.price,
      currency: packageData.currency,
      orderId: `gen_${userId}_${Date.now()}`,
      description: `Payment for ${packageData.tokens} Tokens (${packageData.tokens} Tokens)`,
      customerEmail: user.email,
      userId: userId,
    }),
  });

  const data = await response.json();
  
  if (data.success) {
    // Redirect to SecureProcessor payment page
    window.location.href = data.payment_url;
  }
};
```

### Checking User Balance

```typescript
import { getApiAvailableGenerations, getApiUsedGenerations } from '@/lib/api-limit';

// Get token balance
const availableTokens = await getApiAvailableGenerations();
const usedTokens = await getApiUsedGenerations();
const netBalance = availableTokens - usedTokens;

console.log(`Balance: ${netBalance} tokens`);
```

### Fetching Transaction History

```typescript
import { fetchPaymentHistory } from '@/lib/api-limit';

// Get user's transactions
const transactions = await fetchPaymentHistory();

transactions?.forEach((txn) => {
  console.log(`${txn.paid_at}: ${txn.description} - ${txn.status}`);
});
```

---

## API Contracts

### Token Package Structure

```typescript
interface TokenPackage {
  id: string;
  name: string;
  tokens: number;
  price: number;
  currency: Currency;
  discount?: number;
}

// Example packages
const packages: TokenPackage[] = [
  { id: 'starter', name: 'Starter', tokens: 50, price: 10.00, currency: 'USD' },
  { id: 'pro', name: 'Pro', tokens: 100, price: 18.00, currency: 'USD', discount: 10 },
  { id: 'premium', name: 'Premium', tokens: 250, price: 40.00, currency: 'USD', discount: 20 },
];
```

### Webhook Event Structure

```typescript
interface SecureProcessorWebhook {
  status: 'successful' | 'failed' | 'pending' | 'canceled' | 'refunded';
  order_id: string;
  transaction_id: string;
  amount: number; // In cents
  currency: string;
  type: 'payment' | 'refund';
  customer_email: string;
  tracking_id: string; // User Clerk ID
  description: string;
  payment_method_type: string;
  message: string;
  paid_at: string; // ISO 8601 timestamp
  error_message?: string;
  signature: string; // HMAC signature
}
```

---

## Best Practices

1. **Always use tracking_id for idempotency**
   - Primary: Check `Transaction.tracking_id`
   - Fallback: Check `Transaction.webhookEventId`

2. **Never create users in payment webhook**
   - Users must be created via Clerk webhook first
   - Payment webhook should only update existing users

3. **Use database transactions for atomicity**
   - Always wrap balance updates and transaction creation in `$transaction`
   - Rollback on any failure

4. **Handle email failures gracefully**
   - Don't fail webhook if email sending fails
   - Log email errors for manual retry
   - Payment is already processed

5. **Log everything**
   - Log webhook receipt with timestamp
   - Log idempotency checks
   - Log database operations
   - Log email sending attempts

6. **Test idempotency thoroughly**
   - Send duplicate webhooks in testing
   - Verify only one token credit per payment
   - Check database consistency

---

## Support

For issues or questions:
- **Email:** support@nerbixa.com
- **Documentation:** See other files in `/docs`
- **Tests:** Run test suite for validation

---

**Last Updated:** October 24, 2025  
**Version:** 1.0.0

