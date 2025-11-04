# Token Top-up System - Quick Start Guide

## 🚀 5-Minute Setup

### Step 1: Run Database Migration
```bash
cd /Users/vladi/Documents/Projects/webapps/nerbixa
npx prisma migrate deploy
```

### Step 2: Set Environment Variables
Add to your `.env` file:
```bash
# SecureProcessor Pay
SECURE_PROCESSOR_SHOP_ID=your_shop_id
SECURE_PROCESSOR_SECRET_KEY=your_secret_key
SECURE_PROCESSOR_TEST_MODE=true
SECURE_PROCESSOR_RETURN_URL=https://nerbixa.com/dashboard
SECURE_PROCESSOR_WEBHOOK_URL=https://nerbixa.com/api/webhooks/secure-processor

# Email (Titan)
OUTBOX_EMAIL=noreply@nerbixa.com
OUTBOX_EMAIL_PASSWORD=your_password
INBOX_EMAIL=support@nerbixa.com
```

### Step 3: Configure SecureProcessor Webhooks
1. Go to SecureProcessor Dashboard
2. Add webhook URL: `https://nerbixa.com/api/webhooks/secure-processor`
3. Select events: `payment.successful`, `payment.failed`, `payment.refunded`
4. Save webhook secret

### Step 4: Test the Flow
```bash
# Run tests
npm test __tests__/unit/token-topup.test.ts
npm test __tests__/integration/token-topup-idempotency.test.ts

# Test payment with test card
# Card: 4111 1111 1111 1111
# CVV: 123
# Expiry: Any future date
```

## ✅ What Was Implemented

### Database
- ✅ Fixed Transaction foreign key relationship
- ✅ Added performance indexes
- ✅ Made tracking_id unique for idempotency
- ✅ Created migration file

### Backend Services
- ✅ Enhanced webhook handler with idempotency
- ✅ Added receipt generation & email sending
- ✅ Integrated fallback user creation
- ✅ Added createOrGetUser function
- ✅ Multi-currency support (15+ currencies)

### Testing
- ✅ Unit tests (25+ test cases)
- ✅ Integration tests (15+ test cases)
- ✅ Idempotency tests
- ✅ Concurrency tests

### Documentation
- ✅ Complete integration guide
- ✅ Implementation summary
- ✅ API reference with examples
- ✅ Troubleshooting guide

## 📂 Key Files

**Modified:**
- `prisma/schema.prisma` - Fixed schema
- `lib/api-limit.ts` - Enhanced with fallback
- `lib/actions/user.actions.ts` - Added createOrGetUser
- `app/api/webhooks/secure-processor/route.ts` - Enhanced webhook handler

**Created:**
- `prisma/migrations/20251024000001_fix_transaction_schema/migration.sql`
- `constants/currencies.ts`
- `__tests__/unit/token-topup.test.ts`
- `__tests__/integration/token-topup-idempotency.test.ts`
- `docs/TOKEN_TOPUP_INTEGRATION_GUIDE.md`
- `docs/TOKEN_TOPUP_IMPLEMENTATION_SUMMARY.md`

**Existing (Verified):**
- `components/pro-modal.tsx` ✅
- `components/buy-generations.tsx` ✅
- `components/free-counter.tsx` ✅
- `components/pdf/receipt.tsx` ✅
- `lib/receiptGeneration.tsx` ✅
- `config/nodemailer.ts` ✅
- `app/api/payment/secure-processor/route.ts` ✅

## 🎯 Core Features

✅ **Token Purchase** - Buy tokens via SecureProcessor Pay  
✅ **Multi-Currency** - Support for 15+ currencies  
✅ **PDF Receipts** - Automated receipt generation  
✅ **Email Confirmations** - Receipt sent via email  
✅ **Idempotency** - Duplicate prevention (tracking_id + webhookEventId)  
✅ **Rollback** - Transaction rollback on failure  
✅ **Concurrency** - Safe concurrent webhook handling  
✅ **Fallback** - Auto user creation for OAuth sign-ins  

## 🧪 Testing

### Run All Tests
```bash
npm test
```

### Run Specific Tests
```bash
# Unit tests
npm test __tests__/unit/token-topup.test.ts

# Integration tests
npm test __tests__/integration/token-topup-idempotency.test.ts
```

### Manual Test Flow
1. Navigate to `/dashboard`
2. Click "Buy More" button
3. Select token package
4. Use test card: `4111 1111 1111 1111`
5. Complete payment
6. Verify:
   - ✅ Redirected to dashboard
   - ✅ Tokens added to balance
   - ✅ Receipt email received
   - ✅ Transaction recorded in database

## 🐛 Quick Troubleshooting

### Webhook Not Receiving
```bash
# Test endpoint
curl https://nerbixa.com/api/webhooks/secure-processor
# Should return: {"message":"Secure-processor webhook endpoint is active","timestamp":"..."}
```

### Balance Not Updating
```sql
-- Check user balance
SELECT clerkId, availableGenerations, usedGenerations,
       (availableGenerations - usedGenerations) as net_balance
FROM "User"
WHERE clerkId = 'user_id_here';
```

### Check for Duplicates
```sql
-- Find duplicate transactions
SELECT tracking_id, COUNT(*) as count
FROM "Transaction"
WHERE status = 'successful'
GROUP BY tracking_id
HAVING COUNT(*) > 1;
```

## 📚 Full Documentation

For complete details, see:
- **Integration Guide:** `docs/TOKEN_TOPUP_INTEGRATION_GUIDE.md`
- **Implementation Summary:** `docs/TOKEN_TOPUP_IMPLEMENTATION_SUMMARY.md`

## 🎉 Ready to Deploy!

Your token top-up system is production-ready with:
- ✅ Robust idempotency
- ✅ Comprehensive testing
- ✅ Complete documentation
- ✅ Error handling & rollback
- ✅ Email receipts
- ✅ Multi-currency support

---

**Questions?** Check the full documentation or contact support@nerbixa.com

