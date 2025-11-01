# Clerk Webhook - Quick Reference

## 🚀 Deployment Checklist

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma client
npx prisma generate

# 3. Apply database migration
npx prisma migrate deploy

# 4. Run tests
npm run test:ci

# 5. Build and deploy
npm run build
```

## 🔧 Environment Variables

```env
# Required
DATABASE_URL="postgresql://..."
WEBHOOK_SECRET="whsec_..."
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_..."
CLERK_SECRET_KEY="sk_..."
```

## 📝 Common Commands

```bash
# Testing
npm test                    # Run all tests (watch mode)
npm run test:unit           # Unit tests only
npm run test:integration    # Integration tests only
npm run test:ci             # CI mode with coverage

# Database
npx prisma migrate dev      # Create and apply migration
npx prisma migrate deploy   # Apply pending migrations
npx prisma generate         # Regenerate Prisma client
npx prisma studio           # Open database GUI

# Development
npm run dev                 # Start dev server
npm run build               # Build for production
npm run lint                # Run ESLint
```

## 🔍 Verification Queries

```sql
-- Check user credits
SELECT "clerkId", email, "availableGenerations", "usedGenerations"
FROM "User"
WHERE email = 'user@example.com';

-- Check transactions
SELECT t.amount, t.type, t.reason, t.status, t."createdAt"
FROM "Transaction" t
JOIN "User" u ON t.tracking_id = u."clerkId"
WHERE u.email = 'user@example.com';

-- Check processed webhooks
SELECT "eventId", "eventType", processed, "processedAt"
FROM "WebhookEvent"
ORDER BY "createdAt" DESC
LIMIT 10;

-- Find users without signup bonus
SELECT u."clerkId", u.email
FROM "User" u
LEFT JOIN "Transaction" t ON t.tracking_id = u."clerkId" AND t.reason = 'signup bonus'
WHERE t.id IS NULL;
```

## 🐛 Debugging

### Enable Debug Logging
Add to webhook handler:
```typescript
console.log('Webhook event:', JSON.stringify(evt, null, 2));
console.log('Database result:', JSON.stringify(result, null, 2));
```

### Check Webhook Logs
1. Go to Clerk Dashboard → Webhooks
2. Click on your endpoint
3. View "Recent Attempts" tab
4. Check status codes and response bodies

### Common Log Messages

| Message | Meaning | Action |
|---------|---------|--------|
| "Successfully created user..." | ✅ Success | None |
| "Already processed, skipping..." | ⚠️ Duplicate webhook | Normal, verify credits are correct |
| "Error creating user..." | ❌ Failed | Check error details, webhook will retry |

## 🔄 Webhook Lifecycle

```
POST /api/webhooks/clerk
  ↓
Verify signature
  ↓
Check idempotency
  ├─ Already processed → Return existing user
  └─ Not processed ↓
     Start transaction
       ↓
     Create WebhookEvent
       ↓
     Create User (20 credits)
       ↓
     Create Transaction
       ↓
     Mark processed
       ↓
     Update Clerk metadata
       ↓
     Return success
```

## 🧪 Manual Testing

### Test with Clerk Dashboard
1. Go to Webhooks → Your endpoint
2. Click "Testing" tab
3. Send `user.created` example
4. Check response and database

### Test Idempotency
```bash
# In Clerk Dashboard
1. Find a successful webhook event
2. Click "Resend"
3. Should return 200 with idempotent: true
4. Verify user still has exactly 20 credits
```

### Test Failure Recovery
```sql
-- 1. Break the transaction (set user email to duplicate)
UPDATE "User" SET email = 'existing@example.com' 
WHERE "clerkId" = 'test_user';

-- 2. Resend webhook
-- Should fail with 500

-- 3. Fix the issue
UPDATE "User" SET email = 'unique@example.com' 
WHERE "clerkId" = 'test_user';

-- 4. Resend webhook again
-- Should succeed this time
```

## 📊 Monitoring Queries

### Daily Signup Stats
```sql
SELECT 
  DATE("createdAt") as date,
  COUNT(*) as new_users,
  SUM("availableGenerations") as total_credits_allocated
FROM "User"
WHERE "createdAt" >= NOW() - INTERVAL '7 days'
GROUP BY DATE("createdAt")
ORDER BY date DESC;
```

### Webhook Success Rate
```sql
SELECT 
  "eventType",
  COUNT(*) as total,
  SUM(CASE WHEN processed THEN 1 ELSE 0 END) as successful,
  ROUND(100.0 * SUM(CASE WHEN processed THEN 1 ELSE 0 END) / COUNT(*), 2) as success_rate
FROM "WebhookEvent"
WHERE "createdAt" >= NOW() - INTERVAL '24 hours'
GROUP BY "eventType";
```

### Credit Distribution
```sql
SELECT 
  "availableGenerations" as credits,
  COUNT(*) as user_count
FROM "User"
GROUP BY "availableGenerations"
ORDER BY credits DESC;
```

## 🚨 Troubleshooting

### Problem: User has 0 credits
```sql
-- Check if transaction was created
SELECT * FROM "Transaction" 
WHERE tracking_id = 'user_xxx' AND reason = 'signup bonus';

-- If missing, check webhook event
SELECT * FROM "WebhookEvent" 
WHERE "eventType" = 'user.created' 
ORDER BY "createdAt" DESC LIMIT 10;

-- Resend webhook from Clerk dashboard
```

### Problem: Duplicate credits
```sql
-- Check for duplicate transactions
SELECT tracking_id, COUNT(*) as count
FROM "Transaction"
WHERE reason = 'signup bonus'
GROUP BY tracking_id
HAVING COUNT(*) > 1;

-- If found, investigate webhook events
SELECT * FROM "WebhookEvent"
WHERE "eventId" IN (
  SELECT "webhookEventId" FROM "Transaction"
  WHERE tracking_id = 'user_with_duplicates'
);
```

### Problem: Webhook always fails
```bash
# 1. Check environment variables
echo $WEBHOOK_SECRET
echo $DATABASE_URL

# 2. Test database connection
npx prisma db pull

# 3. Check Clerk signature
# In webhook handler, log the verification error
```

## 🔐 Security Checklist

- [ ] `WEBHOOK_SECRET` is set and matches Clerk dashboard
- [ ] Webhook endpoint is HTTPS in production
- [ ] Database credentials are secure
- [ ] No sensitive data in logs
- [ ] Error messages don't expose internals
- [ ] Rate limiting is configured (if applicable)

## 📈 Performance Benchmarks

| Metric | Target | Typical |
|--------|--------|---------|
| Webhook processing | < 1s | 200-500ms |
| Database transaction | < 500ms | 100-300ms |
| Idempotency check | < 100ms | 20-50ms |
| Total webhook time | < 2s | 300-700ms |

## 🔄 Rollback Procedure

```bash
# 1. Revert code changes
git revert <commit-hash>

# 2. Rollback database migration (if needed)
npx prisma migrate resolve --rolled-back 20250124000000_add_webhook_idempotency_and_tracking

# 3. Redeploy
npm run build && <deploy-command>
```

## 📞 Quick Links

- [Clerk Dashboard](https://dashboard.clerk.com)
- [Neon Console](https://console.neon.tech)
- [Full Implementation Guide](./WEBHOOK_IMPLEMENTATION_GUIDE.md)
- [Test Documentation](./__tests__/README.md)
- [Implementation Summary](./IMPLEMENTATION_SUMMARY.md)

## 💡 Tips

1. **Always test in staging first** before deploying to production
2. **Monitor webhook logs** in Clerk dashboard regularly
3. **Set up alerts** for failed webhooks
4. **Back up database** before migrations
5. **Keep test database separate** from production
6. **Document any custom changes** to webhook logic
7. **Review failed webhooks** weekly and investigate patterns

---

**Last Updated:** 2025-01-24  
**Implementation Version:** 1.0.0  
**Status:** ✅ Production Ready

