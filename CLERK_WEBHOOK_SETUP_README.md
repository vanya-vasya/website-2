# 🔧 Clerk Webhook Complete Setup & Troubleshooting Guide

**Last Updated:** October 24, 2025  
**Status:** Production-Ready Implementation

---

## 📋 TABLE OF CONTENTS

1. [Overview](#overview)
2. [Requirements](#requirements)
3. [Step-by-Step Setup](#step-by-step-setup)
4. [Testing & Verification](#testing--verification)
5. [Troubleshooting Matrix](#troubleshooting-matrix)
6. [Code Reference](#code-reference)
7. [FAQ](#faq)

---

## 🎯 OVERVIEW

This guide provides complete instructions for setting up and debugging the Clerk webhook handler that creates users in your Neon PostgreSQL database.

### What the Webhook Does

When a user signs up via Clerk:
1. ✅ Clerk sends `user.created` event to your webhook
2. ✅ Webhook verifies signature for security
3. ✅ Creates user in database with 20 free credits
4. ✅ Records transaction for audit trail
5. ✅ Updates Clerk metadata with internal user ID

### Current Issue

**Problem:** Users are registering in Clerk but NOT being created in database  
**Symptom:** Database has 0 users despite signups  
**Root Cause:** Missing `WEBHOOK_SECRET` environment variable or misconfigured webhook

---

## 📦 REQUIREMENTS

### Environment Variables (REQUIRED)

```bash
# Clerk Webhook Secret
WEBHOOK_SECRET=whsec_...  # From Clerk Dashboard → Webhooks → Signing Secret

# Database Connection
DATABASE_URL=postgresql://...  # Your Neon connection string

# Clerk API Keys
CLERK_SECRET_KEY=sk_...  # For Clerk API calls
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...  # Public key
```

### Database Tables (REQUIRED)

Your Neon database must have these tables:
- `User` - Stores user profiles and credits
- `Transaction` - Audit trail of credits
- `WebhookEvent` - Idempotency tracking

**Verify with:**
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('User', 'Transaction', 'WebhookEvent');
```

### Software Requirements

- Node.js 18+ (for testing scripts)
- PostgreSQL client (for manual verification)
- curl (for endpoint testing)

---

## 🚀 STEP-BY-STEP SETUP

### STEP 1: Configure Clerk Dashboard

#### 1.1 Navigate to Webhooks

1. Go to https://dashboard.clerk.com
2. Select your application
3. Click **"Webhooks"** in left sidebar

#### 1.2 Add Endpoint

Click **"Add Endpoint"** and configure:

```
Endpoint URL: https://www.nerbixa.com/api/webhooks/clerk
Description: User creation webhook
```

**Important:** Use your actual domain (e.g., `nerbixa.com` or `your-domain.vercel.app`)

#### 1.3 Subscribe to Events

Check these events:
- ☑️ **user.created** (REQUIRED)
- ☐ user.updated (optional)
- ☐ user.deleted (optional)

#### 1.4 Save and Get Secret

1. Click **"Create"**
2. **Copy the Signing Secret** (starts with `whsec_`)
3. Store it safely - you'll need it in Step 2

---

### STEP 2: Configure Environment Variables

#### 2.1 Local Development (.env.local)

Create/edit `.env.local` in project root:

```bash
# Clerk Webhook
WEBHOOK_SECRET=whsec_Evuu+3/9O3LgKvhQQ/AyJc6hIlC2pmUj

# Database
DATABASE_URL=postgresql://neondb_owner:***@ep-floral-hill-a2w6wrew-pooler.eu-central-1.aws.neon.tech/neondb?sslmode=require

# Clerk API
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
```

#### 2.2 Production (Vercel)

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add each variable:

| Name | Value | Environments |
|------|-------|--------------|
| `WEBHOOK_SECRET` | `whsec_...` from Clerk | ☑️ Production ☑️ Preview ☑️ Development |
| `DATABASE_URL` | Your Neon connection string | ☑️ Production ☑️ Preview ☑️ Development |
| `CLERK_SECRET_KEY` | `sk_...` from Clerk | ☑️ Production ☑️ Preview ☑️ Development |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_...` from Clerk | ☑️ Production ☑️ Preview ☑️ Development |

5. Click **"Save"** for each
6. Go to **Deployments** → Latest → **"Redeploy"**

---

### STEP 3: Verify Database Schema

#### 3.1 Check Tables Exist

```bash
# Using node script
npx tsx scripts/test-clerk-webhook.ts
```

Or manually:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public';

-- Expected output: Transaction, User, WebhookEvent
```

#### 3.2 Verify User Table Structure

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'User'
ORDER BY ordinal_position;
```

**Required columns:**
- `id` (TEXT, NOT NULL)
- `clerkId` (TEXT, NOT NULL, UNIQUE)
- `email` (TEXT, NOT NULL, UNIQUE)
- `photo` (TEXT, NOT NULL)
- `firstName` (TEXT, NULL)
- `lastName` (TEXT, NULL)
- `availableGenerations` (INTEGER, NOT NULL, DEFAULT 20)
- `usedGenerations` (INTEGER, NOT NULL, DEFAULT 0)
- `createdAt` (TIMESTAMP, NOT NULL, DEFAULT NOW())
- `updatedAt` (TIMESTAMP, NOT NULL, DEFAULT NOW())

---

### STEP 4: Test Webhook Locally

#### 4.1 Run Diagnostic Script

```bash
# Install dependencies if needed
npm install

# Run diagnostic test
npx tsx scripts/test-clerk-webhook.ts
```

**Expected Output:**
```
✅ PASSED: All environment variables present
✅ PASSED: Database connection successful
✅ PASSED: All required tables exist
✅ PASSED: User table structure correct
✅ PASSED: User creation flow works
```

#### 4.2 Test Endpoint with Curl

```bash
# Make script executable
chmod +x scripts/test-webhook-curl.sh

# Test health check
./scripts/test-webhook-curl.sh GET

# Test full flow (will fail signature - expected)
./scripts/test-webhook-curl.sh ALL
```

---

### STEP 5: Test with Real Clerk Webhook

#### 5.1 Send Test Event

1. Go to Clerk Dashboard → Webhooks
2. Click on your webhook endpoint
3. Go to **"Testing"** tab
4. Select event type: `user.created`
5. Click **"Send Example"**

#### 5.2 Check Response

**Success (200 OK):**
```json
{
  "message": "OK",
  "user": {
    "id": "...",
    "clerkId": "...",
    "email": "...",
    "availableGenerations": 20
  },
  "transaction": {
    "id": "...",
    "amount": 20
  }
}
```

**Failure:** See [Troubleshooting Matrix](#troubleshooting-matrix)

#### 5.3 Verify in Database

```bash
# Check if user was created
node --require dotenv/config -e "
const {Pool} = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {rejectUnauthorized: false}
});
pool.query('SELECT * FROM \"User\" ORDER BY \"createdAt\" DESC LIMIT 1')
  .then(r => console.table(r.rows))
  .finally(() => pool.end());
" dotenv_config_path=.env.local
```

---

### STEP 6: Test Real User Signup

#### 6.1 Create Test Account

1. Go to your application (e.g., https://www.nerbixa.com)
2. Click **"Sign Up"**
3. Create account with test email

#### 6.2 Monitor Webhook Delivery

1. Clerk Dashboard → Webhooks → Your Endpoint
2. Go to **"Attempts"** tab
3. Look for the recent webhook delivery

**Success indicators:**
- 🟢 Status: 200 OK
- 🟢 Response time: < 1s
- 🟢 No errors in response body

#### 6.3 Verify User in Database

```sql
-- Check if user exists
SELECT 
  email,
  "availableGenerations",
  "usedGenerations",
  "createdAt"
FROM "User"
WHERE email = 'your-test-email@example.com';

-- Expected: 1 row with 20 availableGenerations
```

#### 6.4 Verify Transaction Record

```sql
-- Check signup bonus transaction
SELECT 
  type,
  reason,
  amount,
  status,
  "createdAt"
FROM "Transaction"
WHERE type = 'credit' AND reason = 'signup bonus'
ORDER BY "createdAt" DESC
LIMIT 1;

-- Expected: 1 row with amount=20, status='completed'
```

---

## 🧪 TESTING & VERIFICATION

### Automated Tests

```bash
# Full diagnostic suite
npm run test:webhook

# Or manually:
npx tsx scripts/test-clerk-webhook.ts
```

### Manual Verification Commands

```bash
# 1. Check environment variables
echo $WEBHOOK_SECRET
echo $DATABASE_URL

# 2. Test database connection
node --require dotenv/config -e "
const {Pool} = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {rejectUnauthorized: false}
});
pool.query('SELECT NOW()')
  .then(() => console.log('✅ Connected'))
  .catch(e => console.error('❌ Failed:', e.message))
  .finally(() => pool.end());
" dotenv_config_path=.env.local

# 3. Count users
node --require dotenv/config -e "
const {Pool} = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {rejectUnauthorized: false}
});
pool.query('SELECT COUNT(*) FROM \"User\"')
  .then(r => console.log('Users:', r.rows[0].count))
  .finally(() => pool.end());
" dotenv_config_path=.env.local

# 4. Test webhook endpoint health
curl https://www.nerbixa.com/api/webhooks/clerk

# 5. Check Vercel function logs
# Go to: Vercel Dashboard → Deployments → Latest → Functions → /api/webhooks/clerk
```

### Health Check Endpoint

```bash
# Local
curl http://localhost:3000/api/webhooks/clerk

# Production
curl https://www.nerbixa.com/api/webhooks/clerk
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2025-10-24T...",
  "environment": {
    "valid": true,
    "hasWebhookSecret": true,
    "hasDatabaseUrl": true
  },
  "database": {
    "connected": true,
    "userCount": 0
  }
}
```

---

## 🔍 TROUBLESHOOTING MATRIX

### Error 400: Missing Svix Headers

**Symptom:**
```json
{
  "error": "Missing Svix headers",
  "details": {
    "svix_id": false,
    "svix_timestamp": false,
    "svix_signature": false
  }
}
```

**Cause:** Request not coming from Clerk or missing headers

**Fix:**
1. Verify webhook is configured in Clerk Dashboard
2. Test using Clerk Dashboard → Testing tab (not curl)
3. Check that Clerk webhook URL matches your endpoint

---

### Error 401: Signature Verification Failed

**Symptom:**
```json
{
  "error": "Signature verification failed",
  "message": "Invalid webhook signature"
}
```

**Cause:** `WEBHOOK_SECRET` doesn't match Clerk's signing secret

**Fix:**
1. Go to Clerk Dashboard → Webhooks → Your endpoint
2. Click "Show" on Signing Secret
3. Copy the value (starts with `whsec_`)
4. Update environment variable:
   - **Local:** `.env.local` → `WEBHOOK_SECRET=whsec_...`
   - **Vercel:** Settings → Environment Variables → Update `WEBHOOK_SECRET`
5. Redeploy (Vercel) or restart dev server (local)

---

### Error 500: Missing Environment Variables

**Symptom:**
```json
{
  "error": "Server configuration error",
  "message": "Missing required environment variables",
  "missing": ["WEBHOOK_SECRET"]
}
```

**Cause:** `WEBHOOK_SECRET` not set in environment

**Fix:**

**Local Development:**
```bash
# Create/edit .env.local
echo "WEBHOOK_SECRET=whsec_your_secret_here" >> .env.local

# Restart dev server
npm run dev
```

**Production (Vercel):**
1. Vercel Dashboard → Your Project
2. Settings → Environment Variables
3. Add: `WEBHOOK_SECRET` = `whsec_...`
4. Select all environments (Production, Preview, Development)
5. Save
6. Deployments → Latest → Redeploy

---

### Error 500: Database Connection Failed

**Symptom:**
```json
{
  "error": "Database connection failed",
  "details": "connection refused"
}
```

**Cause:** Cannot connect to Neon database

**Fixes:**

**1. Verify DATABASE_URL:**
```bash
node --require dotenv/config -e "
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
" dotenv_config_path=.env.local
```

**2. Test connection manually:**
```bash
node --require dotenv/config -e "
const {Pool} = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {rejectUnauthorized: false}
});
pool.connect()
  .then(() => console.log('✅ Connected'))
  .catch(e => console.error('❌ Error:', e.message))
  .finally(() => pool.end());
" dotenv_config_path=.env.local
```

**3. Check Neon Dashboard:**
- Go to https://console.neon.tech
- Verify database is Active (not Suspended)
- Check connection string is correct

**4. Verify SSL settings:**
```javascript
// Connection must include SSL
ssl: {
  rejectUnauthorized: false
}
```

---

### Error 500: Database Operation Failed (Table Missing)

**Symptom:**
```json
{
  "error": "Database operation failed",
  "message": "relation \"User\" does not exist"
}
```

**Cause:** Database tables not created

**Fix:**

```bash
# Run database setup
npm run db:setup

# Or manually execute schema
node --require dotenv/config -e "
const {Pool} = require('pg');
const fs = require('fs');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {rejectUnauthorized: false}
});
const schema = fs.readFileSync('db/schema.sql', 'utf8');
pool.query(schema)
  .then(() => console.log('✅ Schema created'))
  .catch(e => console.error('❌ Error:', e.message))
  .finally(() => pool.end());
" dotenv_config_path=.env.local
```

---

### Symptom: Webhook Delivered but No User Created

**Symptom:**
- Clerk shows 200 OK in webhook attempts
- No errors in logs
- Database still empty

**Diagnosis:**

1. **Check Vercel function logs:**
   - Vercel Dashboard → Functions → `/api/webhooks/clerk`
   - Look for error messages

2. **Enable debug logging:**
   ```bash
   # Add to .env.local or Vercel
   DEBUG_WEBHOOKS=true
   ```

3. **Check if idempotency is blocking:**
   ```sql
   SELECT * FROM "WebhookEvent" WHERE processed = false;
   ```
   If you see stuck events, clear them:
   ```sql
   DELETE FROM "WebhookEvent" WHERE processed = false;
   ```

4. **Verify transaction didn't rollback:**
   - Check logs for "Transaction rolled back" or "ROLLBACK"
   - Look for database errors in transaction block

---

### Symptom: Users Created but Missing Credits

**Symptom:**
- User exists in database
- `availableGenerations` is 0 or NULL
- No transaction record

**Fix:**

```sql
-- Check user credits
SELECT email, "availableGenerations", "usedGenerations" 
FROM "User" 
WHERE "availableGenerations" IS NULL OR "availableGenerations" = 0;

-- Manually fix (if needed)
UPDATE "User" 
SET "availableGenerations" = 20 
WHERE "availableGenerations" = 0;

-- Create missing transaction
INSERT INTO "Transaction" (
  "id", "tracking_id", "userId", 
  "amount", "type", "reason", "status", "paid_at"
)
SELECT 
  'txn_' || substr(md5(random()::text), 1, 20),
  "clerkId",
  "id",
  20,
  'credit',
  'signup bonus (backfill)',
  'completed',
  NOW()
FROM "User"
WHERE NOT EXISTS (
  SELECT 1 FROM "Transaction" 
  WHERE "Transaction"."userId" = "User"."id" 
  AND "type" = 'credit'
);
```

---

## 📚 CODE REFERENCE

### Current Implementation

**Location:** `app/api/webhooks/clerk/route.ts`

**Key Features:**
- ✅ Svix signature verification
- ✅ Idempotency protection
- ✅ Atomic database transactions
- ✅ Error handling with rollback
- ✅ Comprehensive logging

### Enhanced Version (With Extra Diagnostics)

**Location:** `app/api/webhooks/clerk/route.enhanced.ts`

**Additional Features:**
- ✅ Request ID tracking
- ✅ Performance timing
- ✅ Environment validation
- ✅ Database health checks
- ✅ Structured debug logging
- ✅ Detailed error responses

To use enhanced version:
```bash
# Backup current version
mv app/api/webhooks/clerk/route.ts app/api/webhooks/clerk/route.backup.ts

# Use enhanced version
mv app/api/webhooks/clerk/route.enhanced.ts app/api/webhooks/clerk/route.ts

# Redeploy
git add app/api/webhooks/clerk/route.ts
git commit -m "feat: Use enhanced webhook handler with diagnostics"
git push
```

### Database Client

**Location:** `lib/db.ts`

**Features:**
- Connection pooling (max 20)
- SSL support for Neon
- Transaction wrapper
- Auto-generated IDs
- Query logging in dev mode

### Testing Scripts

1. **`scripts/test-clerk-webhook.ts`** - Comprehensive diagnostic suite
2. **`scripts/test-webhook-curl.sh`** - Curl-based endpoint testing
3. **`create-vladimir-user.js`** - Manual user creation for recovery

---

## ❓ FAQ

### Q: How do I know if the webhook is working?

**A:** Check three places:

1. **Clerk Dashboard:**
   - Webhooks → Attempts
   - Look for green 200 OK status

2. **Database:**
   ```sql
   SELECT COUNT(*) FROM "User";
   ```
   Should be > 0 after signups

3. **Vercel Logs:**
   - Functions → `/api/webhooks/clerk`
   - Look for "[Clerk Webhook] Transaction completed successfully"

---

### Q: Why do I see "Already processed (idempotent)" messages?

**A:** This is NORMAL and GOOD! It means:
- Clerk retried the webhook (expected behavior)
- Your system correctly detected the duplicate
- No double-crediting occurred

---

### Q: Can I test without signing up a real user?

**A:** Yes! Use Clerk Dashboard:
1. Webhooks → Your Endpoint → Testing
2. Select `user.created` event
3. Click "Send Example"
4. Check response and database

---

### Q: What if I have existing users who didn't get credits?

**A:** Run the manual user creation script:

```bash
# Edit create-vladimir-user.js with correct Clerk IDs
# Then run:
node create-vladimir-user.js
```

Or use SQL:
```sql
-- Add credits to existing users
UPDATE "User" 
SET "availableGenerations" = "availableGenerations" + 20 
WHERE "availableGenerations" = 0;

-- Create transaction records
INSERT INTO "Transaction" (
  "id", "tracking_id", "userId", 
  "amount", "type", "reason", "status", "paid_at"
)
SELECT 
  'txn_' || substr(md5(random()::text), 1, 20),
  "clerkId",
  "id",
  20,
  'credit',
  'signup bonus (backfill)',
  'completed',
  NOW()
FROM "User"
WHERE NOT EXISTS (
  SELECT 1 FROM "Transaction" t 
  WHERE t."userId" = "User"."id" 
  AND t."type" = 'credit' 
  AND t."reason" = 'signup bonus'
);
```

---

### Q: How do I enable debug logging?

**A:** Set environment variable:

```bash
# .env.local
DEBUG_WEBHOOKS=true
```

Then check logs for detailed `[DEBUG]` messages.

---

### Q: What's the difference between route.ts and route.enhanced.ts?

**A:**

| Feature | route.ts | route.enhanced.ts |
|---------|----------|-------------------|
| Basic functionality | ✅ | ✅ |
| Signature verification | ✅ | ✅ |
| User creation | ✅ | ✅ |
| Error handling | ✅ | ✅ |
| Request ID tracking | ❌ | ✅ |
| Performance timing | ❌ | ✅ |
| Health check endpoint | ❌ | ✅ |
| Environment validation | ❌ | ✅ |
| Detailed error responses | ❌ | ✅ |
| Debug logging | ❌ | ✅ |

**Recommendation:** Use `route.enhanced.ts` for easier debugging, then switch back to `route.ts` for production if you want cleaner logs.

---

## 📞 SUPPORT

### Still Having Issues?

1. **Run diagnostics:**
   ```bash
   npx tsx scripts/test-clerk-webhook.ts
   ```

2. **Check all logs:**
   - Local: Terminal output
   - Production: Vercel Functions logs
   - Clerk: Webhook Attempts tab

3. **Collect information:**
   - HTTP status code from webhook attempt
   - Error message from response
   - Vercel function logs
   - Database user count

4. **Common fixes checklist:**
   - [ ] `WEBHOOK_SECRET` set in Vercel
   - [ ] Database schema created (`npm run db:setup`)
   - [ ] Clerk webhook URL matches deployment
   - [ ] `user.created` event subscribed
   - [ ] Database connection working
   - [ ] Neon database not suspended

---

## ✅ SUCCESS CHECKLIST

After completing setup, verify:

- [ ] **Clerk Dashboard:** Webhook configured with correct URL
- [ ] **Clerk Dashboard:** `user.created` event subscribed
- [ ] **Vercel:** `WEBHOOK_SECRET` environment variable set
- [ ] **Vercel:** `DATABASE_URL` environment variable set
- [ ] **Database:** Tables exist (User, Transaction, WebhookEvent)
- [ ] **Test:** Health check returns status: "healthy"
- [ ] **Test:** Diagnostic script passes all tests
- [ ] **Test:** Clerk test webhook returns 200 OK
- [ ] **Test:** New signup creates user in database
- [ ] **Test:** New user has 20 credits
- [ ] **Test:** Transaction record created for signup bonus

---

**🎉 If all checkboxes are ticked, your webhook is fully operational!**

For the complete diagnostic report, see: `DIAGNOSTIC_REPORT_USER_TRANSACTION_WRITES.md`

