# Payment Webhook Fix - December 23, 2025

## Root Cause Analysis

### Problem
Successful payment transactions (e.g., `c53e702d-ae3e-43bd-804b-b85789f383e4`) were not appearing in Payment History despite being marked successful in the payment gateway.

### Root Cause
**Domain redirect was breaking webhook POST requests.**

The payment provider was configured to send webhooks to `https://nerbixa.com/api/webhooks/secure-processor` (non-www domain), but this domain returns a **307 redirect** to `https://www.nerbixa.com/...`.

Most payment gateways do NOT follow redirects for webhook POST requests properly - the POST body gets lost during the redirect, resulting in:
1. Webhook endpoint receiving malformed/empty requests
2. Signature verification failing
3. No transaction being persisted to the database

### Evidence
```bash
# Non-www returns 307 redirect
curl -v -X POST https://nerbixa.com/api/webhooks/secure-processor
< HTTP/2 307
< location: https://www.nerbixa.com/api/webhooks/secure-processor

# www subdomain works correctly
curl -X POST https://www.nerbixa.com/api/webhooks/secure-processor -d '{"transaction": {...}}'
{"status":"ok"}
```

### Database Evidence
- Last successful payment recorded: **October 31, 2025** (almost 2 months ago)
- No WebhookEvent records for recent payments
- No Transaction records for recent payments

## Fix Applied

### 1. Updated Default Webhook URL (app/api/payment/secure-processor/route.ts)
Changed from:
```typescript
const notificationUrl = process.env.SECURE_PROCESSOR_WEBHOOK_URL || 'https://nerbixa.com/api/webhooks/secure-processor';
```
To:
```typescript
const notificationUrl = process.env.SECURE_PROCESSOR_WEBHOOK_URL || 'https://www.nerbixa.com/api/webhooks/secure-processor';
```

### 2. Updated vercel.json
Added explicit webhook route configuration for proper handling.

### 3. Added Backfill Script
Created `scripts/backfill-missing-payment.ts` to manually insert missing transactions.

## Action Required: Payment Provider Configuration

⚠️ **CRITICAL**: The payment provider dashboard needs to be updated to use the correct webhook URL.

1. Log in to the payment gateway dashboard (Networx/Secure-processor)
2. Navigate to Webhook Settings
3. Update the Webhook/Notification URL from:
   - ❌ `https://nerbixa.com/api/webhooks/secure-processor`
   - ✅ `https://www.nerbixa.com/api/webhooks/secure-processor`

## Backfill Missing Transaction

To backfill the missing transaction `c53e702d-ae3e-43bd-804b-b85789f383e4`:

```bash
npx tsx scripts/backfill-missing-payment.ts
```

The script will:
1. Prompt for the user's clerkId who made the payment
2. Verify the user exists
3. Insert the transaction record
4. Credit 1 token to the user's balance
5. Mark the webhook event as processed

## Future Prevention

### 1. Domain Configuration
Consider configuring Vercel to:
- Remove the redirect from `nerbixa.com` to `www.nerbixa.com` for `/api/` routes, OR
- Set `www.nerbixa.com` as the primary domain with no redirect

### 2. Monitoring
Add alerts for:
- Webhook endpoint returning 4xx/5xx errors
- No successful transactions recorded for extended periods
- Webhook events without corresponding transaction records

### 3. Environment Variable
Set `SECURE_PROCESSOR_WEBHOOK_URL=https://www.nerbixa.com/api/webhooks/secure-processor` in Vercel environment variables to ensure consistency.

## Timeline
- **Issue started**: Likely when domain redirect was configured (unknown date)
- **Last successful webhook**: October 31, 2025
- **Missing payments**: All payments after October 31, 2025
- **Fix deployed**: December 23, 2025

## Files Changed
- `app/api/payment/secure-processor/route.ts` - Updated default webhook URL
- `vercel.json` - Added webhook route configuration
- `scripts/backfill-missing-payment.ts` - New script for backfilling missing transactions

