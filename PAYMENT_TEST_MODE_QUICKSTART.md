# Payment Test Mode - Quick Start Guide

**TL;DR:** Tools to diagnose and fix payment issues in test mode.

---

## 🚀 Quick Commands

```bash
# 1. Diagnose issues
npm run payment:diagnose

# 2. Test webhook locally
npm run payment:webhook-sim success <userId> 100

# 3. Find missing payments
npm run payment:reconcile find-orphaned

# 4. Fix missing payments (interactive)
npm run payment:reconcile interactive --live
```

---

## 🔍 Common Issues

### Issue: Payment successful but no balance update

**Quick Fix:**
```bash
# Step 1: Check if webhook was received
npm run payment:diagnose

# Step 2: Test webhook manually
npm run payment:webhook-sim success <your-clerk-user-id> 100

# Step 3: If manual test works, check Networx webhook configuration
# - URL: https://nerbixa.com/api/webhooks/networx
# - Test webhooks: ENABLED
```

### Issue: Test mode not working

**Quick Fix:**
```bash
# Check environment variables
npm run payment:diagnose

# Should show:
# NETWORX_TEST_MODE: true  ✅
# DATABASE_URL: Set  ✅

# If not, add to .env.local:
# NETWORX_TEST_MODE=true
```

### Issue: Webhook not firing

**Quick Fix:**
```bash
# Test locally
npm run payment:webhook-sim success <userId> 100

# If local works, check:
# 1. Vercel logs: vercel logs --follow
# 2. Networx dashboard webhook config
# 3. Webhook URL accessibility
```

---

## 📊 What Each Tool Does

### Diagnostic Script
```bash
npm run payment:diagnose
```
**Shows:**
- ✅ Environment variables
- ✅ Database connection
- ✅ Table schemas
- ✅ Recent transactions
- ✅ Common issues

### Webhook Simulator
```bash
# Test successful payment
npm run payment:webhook-sim success <userId> <tokens>

# Test all scenarios
npm run payment:webhook-sim all <userId>
```
**Does:**
- ✅ Simulates Networx webhooks
- ✅ Tests locally without real payment
- ✅ Validates entire flow
- ✅ No signature required in test mode

### Reconciliation Script
```bash
# Find problems
npm run payment:reconcile find-orphaned

# Fix problems (dry run first)
npm run payment:reconcile interactive

# Apply fixes
npm run payment:reconcile interactive --live
```
**Does:**
- ✅ Finds orphaned transactions
- ✅ Backfills missing records
- ✅ Updates balances
- ✅ Safe dry-run mode

---

## 🧪 Testing Workflow

### Before Making Changes
```bash
# 1. Check current state
npm run payment:diagnose

# 2. Note current balance
psql $DATABASE_URL -c "SELECT email, availableGenerations FROM \"User\" WHERE clerkId = '<userId>';"
```

### Test Payment Flow
```bash
# 3. Simulate webhook
npm run payment:webhook-sim success <userId> 100

# 4. Verify changes
npm run payment:diagnose

# 5. Check balance updated
psql $DATABASE_URL -c "SELECT email, availableGenerations FROM \"User\" WHERE clerkId = '<userId>';"
```

### Production Testing
```bash
# 1. Set test mode in Vercel
NETWORX_TEST_MODE=true

# 2. Make test payment

# 3. Monitor logs
vercel logs --follow

# 4. Look for: 🧪 TEST MODE TRANSACTION DETECTED
```

---

## 📝 Log Indicators

### ✅ Successful Test Payment
```
🧪 TEST MODE TRANSACTION DETECTED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  TEST MODE ENABLED - This is a test payment
   - Signature verification: SKIPPED
   - Database writes: ENABLED
   - Balance updates: ENABLED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ User found
✅ Transaction record created
✅ User balance updated

🧪 TEST MODE: All database changes committed
```

### ❌ Failed Test Payment
```
❌ Missing signature in webhook (not a test transaction)
OR
❌ User not found
OR
❌ Could not extract token amount from description
OR
❌ Database transaction failed
```

---

## 🛠️ Environment Setup

### Required Variables
```bash
# .env.local
DATABASE_URL=postgresql://user:pass@host/database
NETWORX_SHOP_ID=29959
NETWORX_SECRET_KEY=dbfb6f4e977f49880a6ce3c939f1e7be645a5bb2596c04d9a3a7b32d52378950
NETWORX_TEST_MODE=true  # IMPORTANT FOR TEST PAYMENTS
```

### Verify Setup
```bash
npm run payment:diagnose

# Should show:
# DATABASE_URL: ✅ Set
# NETWORX_SHOP_ID: ✅ Set (29959)
# NETWORX_SECRET_KEY: ✅ Set (***8950)
# NETWORX_TEST_MODE: true
```

---

## 🔧 Troubleshooting Steps

### 1. Quick Check (30 seconds)
```bash
npm run payment:diagnose
```

### 2. Test Locally (1 minute)
```bash
npm run payment:webhook-sim success <userId> 100
```

### 3. Check Database (30 seconds)
```bash
npm run payment:reconcile find-orphaned
```

### 4. Fix Issues (2-5 minutes)
```bash
# Dry run first
npm run payment:reconcile interactive

# If looks good, apply
npm run payment:reconcile interactive --live
```

---

## 📚 Full Documentation

For detailed information, see:
- **PAYMENT_TEST_MODE_INVESTIGATION.md** - Complete investigation report
- **PAYMENT_FLOW_FIXED.md** - Payment flow details
- **PAYMENT_FIXES_COMPLETE.md** - All fixes implemented

---

## 💡 Pro Tips

1. **Always test locally first** with webhook simulator
2. **Run diagnostic** before investigating issues
3. **Use dry-run** before reconciling payments
4. **Check Vercel logs** for production issues
5. **Monitor test mode indicators** in logs (🧪)

---

## ❓ Quick Reference

| Command | Purpose |
|---------|---------|
| `npm run payment:diagnose` | Check environment and database |
| `npm run payment:webhook-sim success <userId> <tokens>` | Test payment locally |
| `npm run payment:webhook-sim all <userId>` | Run all tests |
| `npm run payment:reconcile find-orphaned` | Find missing payments |
| `npm run payment:reconcile interactive` | Fix missing payments |
| `npm run test:integration payment-test-mode` | Run integration tests |

---

**Need Help?**
1. Read `PAYMENT_TEST_MODE_INVESTIGATION.md` for full details
2. Check server logs for error messages
3. Run diagnostic script for automated issue detection

---

**Last Updated:** October 31, 2025




