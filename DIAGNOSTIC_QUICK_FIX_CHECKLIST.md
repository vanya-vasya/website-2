# ✅ QUICK FIX CHECKLIST - User & Transaction Write Failures

**PRINT THIS AND CHECK OFF AS YOU GO** ✓

---

## 🚨 PRIORITY 1: UNBLOCK USER SIGNUPS (30 minutes)

### Task 1.1: Get Clerk Webhook Secret
- [ ] Go to https://dashboard.clerk.com
- [ ] Click on your application
- [ ] Navigate to **Webhooks** in sidebar
- [ ] Find webhook endpoint (should end with `/api/webhooks/clerk`)
- [ ] Click on the webhook
- [ ] Copy **"Signing Secret"** (starts with `whsec_`)
- [ ] ✏️ Write it here for reference: `whsec_________________________________`

### Task 1.2: Add to Local Environment
- [ ] Open `.env.local` in your editor
- [ ] Add this line:
  ```bash
  WEBHOOK_SECRET=whsec_your_copied_secret
  ```
- [ ] Save file
- [ ] Restart dev server if running: `npm run dev`

### Task 1.3: Add to Production (Vercel)
- [ ] Go to https://vercel.com/dashboard
- [ ] Select your project
- [ ] Go to **Settings** → **Environment Variables**
- [ ] Click **Add New**
- [ ] Name: `WEBHOOK_SECRET`
- [ ] Value: (paste the `whsec_` secret)
- [ ] Environment: Check ALL boxes (Production, Preview, Development)
- [ ] Click **Save**
- [ ] Go to **Deployments** tab
- [ ] Click **...** menu on latest deployment
- [ ] Click **Redeploy**
- [ ] Wait for deployment to complete

### Task 1.4: Test User Signup
- [ ] Open terminal
- [ ] Run: `npm run dev`
- [ ] Open browser to `http://localhost:3000/sign-up`
- [ ] Fill out signup form
- [ ] Submit
- [ ] Check terminal logs for:
  ```
  ✓ "[Clerk Webhook] Starting transaction for user creation"
  ✓ "[Clerk Webhook] User created"
  ✓ "[Clerk Webhook] Transaction completed successfully"
  ✓ "Successfully created user [id] with 20 signup credits"
  ```
- [ ] **If you see these ✓, SUCCESS! User creation is working**
- [ ] **If you see errors ✗, check the Troubleshooting section below**

### Task 1.5: Verify in Database
- [ ] Install psql if not available: `brew install postgresql` (Mac)
- [ ] Run:
  ```bash
  node --require dotenv/config -e "
  const {Pool} = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {rejectUnauthorized: false}
  });
  pool.query('SELECT COUNT(*) as total FROM \"User\"')
    .then(r => console.log('Total users:', r.rows[0].total))
    .finally(() => pool.end());
  " dotenv_config_path=.env.local
  ```
- [ ] **Expected:** Should show count > 0
- [ ] **If 0 or error:** Database not receiving writes, see Troubleshooting

---

## 🟡 PRIORITY 2: FIX TESTS (2-4 hours)

### Task 2.1: Update Test File #1
- [ ] Open `__tests__/integration/user-insert.integration.test.ts`
- [ ] Find: `import prismadb from '@/lib/prismadb';`
- [ ] Replace with: `import db from '@/lib/db';`
- [ ] Find all `prismadb.` references
- [ ] Replace with raw SQL using `db.query()`
- [ ] Example:
  ```typescript
  // Before
  await prismadb.user.create({ data: { clerkId, email, ... } });
  
  // After
  await db.query(
    'INSERT INTO "User" ("id", "clerkId", "email", "photo") VALUES ($1, $2, $3, $4)',
    [db.generateId(), clerkId, email, photo]
  );
  ```
- [ ] Save file

### Task 2.2: Update Test File #2
- [ ] Open `__tests__/webhooks/clerk.test.ts`
- [ ] Repeat steps from Task 2.1

### Task 2.3: Update Test File #3
- [ ] Open `__tests__/unit/verify-balance.unit.test.ts`
- [ ] Repeat steps from Task 2.1

### Task 2.4: Update Test File #4
- [ ] Open `__tests__/integration/payment-redirect.integration.test.ts`
- [ ] Repeat steps from Task 2.1

### Task 2.5: Update Test File #5
- [ ] Open `__tests__/integration/networx-webhook.integration.test.ts`
- [ ] Repeat steps from Task 2.1

### Task 2.6: Update Test File #6
- [ ] Open `__tests__/integration/clerk-webhook.integration.test.ts`
- [ ] Repeat steps from Task 2.1

### Task 2.7: Run Tests
- [ ] Run: `npm run test:unit`
- [ ] **Expected:** Tests should pass or show different errors (not "Module not found")
- [ ] Run: `npm run test:integration`
- [ ] Fix any remaining issues
- [ ] All tests green ✓

---

## 🟢 PRIORITY 3: VERIFY PAYMENT FLOW (30 minutes)

### Task 3.1: Test Payment
- [ ] Log in to your app
- [ ] Navigate to billing/payment page
- [ ] Select a package (e.g., 100 tokens)
- [ ] Complete payment with test card
- [ ] Wait for redirect to success page

### Task 3.2: Check Logs
- [ ] Check terminal logs for:
  ```
  ✓ "📥 Networx Webhook Received"
  ✓ "✅ Webhook signature verified"
  ✓ "✅ User found"
  ✓ "✅ Transaction record created"
  ✓ "✅ User balance updated"
  ✓ "✅ Payment processed successfully"
  ```

### Task 3.3: Verify Balance Updated
- [ ] Check user's token balance in UI
- [ ] Should show new balance = (old balance + purchased tokens)

### Task 3.4: Verify in Database
- [ ] Run:
  ```bash
  node --require dotenv/config -e "
  const {Pool} = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {rejectUnauthorized: false}
  });
  pool.query('SELECT * FROM \"Transaction\" ORDER BY \"createdAt\" DESC LIMIT 5')
    .then(r => console.table(r.rows))
    .finally(() => pool.end());
  " dotenv_config_path=.env.local
  ```
- [ ] **Expected:** Should see recent payment transaction with status='successful'

---

## 🔍 TROUBLESHOOTING

### Issue: "Error: Please add WEBHOOK_SECRET"
**Cause:** WEBHOOK_SECRET not loaded  
**Fix:**
- [ ] Check `.env.local` has `WEBHOOK_SECRET=whsec_...`
- [ ] Restart dev server: Kill terminal, run `npm run dev` again
- [ ] Check for typos in variable name (must be exact: `WEBHOOK_SECRET`)

### Issue: "Error verifying webhook: Invalid signature"
**Cause:** Wrong WEBHOOK_SECRET  
**Fix:**
- [ ] Go back to Clerk Dashboard → Webhooks
- [ ] Copy secret again (maybe you copied wrong one)
- [ ] Update `.env.local` with correct secret
- [ ] Restart dev server

### Issue: "User not found" in payment webhook
**Cause:** Payment webhook received before user created  
**Fix:**
- [ ] Make sure user creation is working first (Priority 1)
- [ ] Check `tracking_id` in payment matches user's `clerkId`
- [ ] Verify user exists:
  ```bash
  node --require dotenv/config -e "
  const {Pool} = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {rejectUnauthorized: false}
  });
  pool.query('SELECT * FROM \"User\" WHERE \"clerkId\" = \$1', ['user_clerk_id_here'])
    .then(r => console.log('User:', r.rows[0] || 'NOT FOUND'))
    .finally(() => pool.end());
  " dotenv_config_path=.env.local
  ```

### Issue: "Connection timeout" / "ECONNREFUSED"
**Cause:** DATABASE_URL not set or database unreachable  
**Fix:**
- [ ] Check `.env.local` has `DATABASE_URL=postgresql://...`
- [ ] Check Neon dashboard: Is database active or suspended?
- [ ] Try connecting manually:
  ```bash
  node --require dotenv/config -e "
  const {Pool} = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {rejectUnauthorized: false}
  });
  pool.connect()
    .then(() => console.log('✓ Connected'))
    .catch(e => console.error('✗ Failed:', e.message))
    .finally(() => pool.end());
  " dotenv_config_path=.env.local
  ```

### Issue: Tests fail with "Module not found: @/lib/prismadb"
**Cause:** Tests not updated yet  
**Fix:**
- [ ] Complete Priority 2 tasks above

### Issue: Vercel deployment fails
**Cause:** Missing environment variables in Vercel  
**Fix:**
- [ ] Check Vercel Dashboard → Settings → Environment Variables
- [ ] Verify ALL required variables are set:
  - `DATABASE_URL`
  - `WEBHOOK_SECRET`
  - `CLERK_SECRET_KEY`
  - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
  - `NETWORX_SHOP_ID`
  - `NETWORX_SECRET_KEY`

---

## ✅ FINAL VERIFICATION

### Checklist
- [ ] **User Signup:** Create new test user → succeeds
- [ ] **User Credits:** New user has 20 credits → confirmed
- [ ] **Transaction Record:** Signup bonus transaction recorded → confirmed
- [ ] **Payment:** Complete test payment → succeeds
- [ ] **Balance Update:** Tokens added to account → confirmed
- [ ] **Tests:** All tests pass → confirmed
- [ ] **Production:** Deployed to Vercel → successful
- [ ] **Monitoring:** Check for errors in Vercel logs → none found

### Success Metrics
- [ ] User creation success rate: **> 95%**
- [ ] Payment processing success rate: **> 95%**
- [ ] No errors in logs for 24 hours
- [ ] All webhook events processed

---

## 📞 NEED HELP?

**Review detailed reports:**
- `DIAGNOSTIC_REPORT_USER_TRANSACTION_WRITES.md` - Full investigation
- `DIAGNOSTIC_SUMMARY_EXECUTIVE.md` - Executive summary

**Check external dashboards:**
- Clerk: https://dashboard.clerk.com → Webhooks → Attempts
- Neon: https://console.neon.tech → Your Database → Monitoring
- Vercel: https://vercel.com → Your Project → Deployments → Function Logs

**Common SQL Queries:**
```sql
-- Check recent users
SELECT * FROM "User" ORDER BY "createdAt" DESC LIMIT 10;

-- Check recent transactions
SELECT * FROM "Transaction" ORDER BY "createdAt" DESC LIMIT 10;

-- Check failed webhooks
SELECT * FROM "WebhookEvent" WHERE processed = false;

-- Check user balances
SELECT "clerkId", email, "availableGenerations", "usedGenerations" 
FROM "User" 
ORDER BY "createdAt" DESC LIMIT 10;
```

---

**GOOD LUCK! 🚀**

*Start with Priority 1. Once users can sign up, everything else will follow.*

