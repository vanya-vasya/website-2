# Secure-processor Webhook - Quick Fix Guide

**TL;DR:** Fixed webhook handler to actually update database when payments succeed.

---

## What Was Broken?

```typescript
// BEFORE: Just logging, no DB updates 🔴
case 'success':
  console.log('Payment successful');
  // TODO: Update database
  break;
```

## What's Fixed?

```typescript
// AFTER: Creates transaction + updates credits ✅
case 'success':
case 'successful':
  // 1. Find user
  const user = await prismadb.user.findUnique({ where: { clerkId: tracking_id } });
  
  // 2. Extract token amount from description
  const tokensToAdd = extractTokensFromDescription(description);
  
  // 3. Database transaction (atomic)
  await prismadb.$transaction(async (tx) => {
    // Create transaction record
    await tx.transaction.create({ /* payment details */ });
    
    // Update user balance
    await tx.user.update({
      where: { clerkId: tracking_id },
      data: {
        availableGenerations: user.availableGenerations - user.usedGenerations + tokensToAdd,
        usedGenerations: 0,
      },
    });
  });
  break;
```

---

## Key Features Added

### 1. Idempotency ✅
Prevents duplicate processing:
```typescript
const existingTransaction = await prismadb.transaction.findFirst({
  where: { tracking_id: transaction_id }
});

if (existingTransaction) {
  return NextResponse.json({ status: 'ok', message: 'Already processed' });
}
```

### 2. Atomic Operations ✅
Uses Prisma transactions:
```typescript
await prismadb.$transaction(async (tx) => {
  await tx.transaction.create({ /* ... */ });
  await tx.user.update({ /* ... */ });
});
// Either both succeed or both fail
```

### 3. Comprehensive Logging ✅
```typescript
console.log('═══════════════════════════════════════════════════════');
console.log('📥 Secure-processor Webhook Received');
console.log('Transaction ID:', transaction_id);
console.log('User ID:', tracking_id);
console.log('Amount:', amount, currency);
console.log('═══════════════════════════════════════════════════════');
```

---

## Testing

### Run Tests
```bash
npm test -- secure-processor-webhook.integration.test.ts
```

### Manual Test
```bash
# 1. Check webhook is alive
curl https://nerbixa.com/api/webhooks/secure-processor

# 2. Make a test payment
# (Use Secure-processor test mode with SECURE_PROCESSOR_TEST_MODE=true)

# 3. Check logs
vercel logs --follow

# 4. Verify in database
psql $DATABASE_URL -c "SELECT * FROM \"Transaction\" ORDER BY \"createdAt\" DESC LIMIT 5;"
```

---

## Monitoring

### Check Webhook Processing
```bash
# Successful payments
grep "✅ Payment processed successfully" production.log

# Failed processing
grep "❌ Webhook Processing Error" production.log

# Duplicates (expected, not an error)
grep "⚠️  Duplicate webhook detected" production.log

# Average processing time
grep "Processing time:" production.log | awk '{sum+=$NF; count++} END {print sum/count " ms"}'
```

---

## Payment Flow

```
User → Payment Widget → Secure-processor Hosted Page
                              ↓
                        [Payment Success]
                              ↓
                    ┌─────────┴─────────┐
                    ↓                   ↓
            Webhook (async)      User Redirect
                    ↓                   ↓
          [DB Update] ✅         /payment/success
                    ↓                   ↓
          Transaction Created    Poll verify-balance
          Credits Added                ↓
                              [Balance Updated] ✅
                                      ↓
                              Redirect to /dashboard
```

---

## Troubleshooting

### User didn't receive credits

1. **Check webhook was received:**
```bash
grep "transaction_id_here" production.log
```

2. **Check transaction in DB:**
```sql
SELECT * FROM "Transaction" WHERE "tracking_id" = 'transaction_id_here';
```

3. **Check user balance:**
```sql
SELECT "availableGenerations", "usedGenerations" 
FROM "User" 
WHERE "clerkId" = 'user_id_here';
```

### Webhook failed

1. **Check logs for error:**
```bash
grep "❌ Webhook Processing Error" production.log | tail -5
```

2. **Common issues:**
   - Missing tracking_id → Check payment API sends userId
   - Invalid signature → Check SECURE_PROCESSOR_SECRET_KEY
   - User not found → Check clerkId matches
   - Invalid description → Must include "(X Tokens)"

---

## Environment Variables

```bash
SECURE_PROCESSOR_SHOP_ID=29959
SECURE_PROCESSOR_SECRET_KEY=dbfb6f...
SECURE_PROCESSOR_RETURN_URL=https://nerbixa.com/payment/success
SECURE_PROCESSOR_WEBHOOK_URL=https://nerbixa.com/api/webhooks/secure-processor
SECURE_PROCESSOR_TEST_MODE=false  # Set to true for testing
```

---

## Files Changed

- `app/api/webhooks/secure-processor/route.ts` - Main fix
- `__tests__/integration/secure-processor-webhook.integration.test.ts` - New tests

---

## Quick Checks

✅ Webhook endpoint active:
```bash
curl https://nerbixa.com/api/webhooks/secure-processor
# Should return: {"message":"Secure-processor webhook endpoint is active",...}
```

✅ Recent transactions:
```sql
SELECT COUNT(*) FROM "Transaction" 
WHERE "createdAt" > NOW() - INTERVAL '1 hour';
```

✅ Recent credit additions:
```sql
SELECT u."email", t."amount", t."description", t."createdAt"
FROM "Transaction" t
JOIN "User" u ON t."userId" = u."clerkId"
WHERE t."status" = 'successful'
AND t."createdAt" > NOW() - INTERVAL '1 hour'
ORDER BY t."createdAt" DESC;
```

---

## Need Help?

1. Check logs: `vercel logs --follow`
2. Check database: Use queries above
3. Review full docs: `POST_TRANSACTION_FIX_ANALYSIS.md`
4. Contact: [Your team contact]

---

**Status:** ✅ Fixed and ready for production  
**Version:** 1.0  
**Updated:** October 24, 2025

