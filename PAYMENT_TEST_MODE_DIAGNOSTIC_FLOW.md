# Payment Test Mode - Diagnostic Flow Chart

## 🔍 Quick Diagnostic Decision Tree

```
Payment Issue Reported
         │
         ▼
┌─────────────────────┐
│ Run Diagnostic      │
│ npm run             │
│ payment:diagnose    │
└──────────┬──────────┘
           │
           ▼
     ┌─────────┐
     │ Result? │
     └────┬────┘
          │
    ┌─────┴─────┐
    │           │
    ▼           ▼
DATABASE    TEST MODE
  ERROR      NOT SET
    │           │
    │           ▼
    │      Set SECURE_PROCESSOR_
    │      TEST_MODE=true
    │           │
    │           ▼
    │      Redeploy
    │           │
    └────┬──────┘
         │
         ▼
┌─────────────────────┐
│ Test Locally        │
│ npm run             │
│ payment:webhook-sim │
│ success <userId> 100│
└──────────┬──────────┘
           │
           ▼
     ┌─────────┐
     │ Works?  │
     └────┬────┘
          │
    ┌─────┴──────┐
    │            │
   YES           NO
    │            │
    ▼            ▼
CODE OK      CHECK
LOCAL        CODE
ISSUE        LOGIC
    │            │
    ▼            ▼
WEBHOOK     FIX &
  NOT       TEST
FIRING      AGAIN
    │
    ▼
┌─────────────────────┐
│ Check Secure-processor       │
│ Dashboard:          │
│ - Webhook URL       │
│ - Test webhooks on  │
│ - Shop ID correct   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Fix & Test in Prod  │
└──────────┬──────────┘
           │
           ▼
     ┌─────────┐
     │ Fixed?  │
     └────┬────┘
          │
    ┌─────┴──────┐
    │            │
   YES           NO
    │            │
    ▼            ▼
RECONCILE  ESCALATE
MISSING    TO TEAM
PAYMENTS
    │
    ▼
┌─────────────────────┐
│ npm run             │
│ payment:reconcile   │
│ interactive --live  │
└──────────┬──────────┘
           │
           ▼
       ✅ DONE
```

---

## 🎯 Symptom-Based Diagnostic

### Symptom: Payment Successful, No Balance Update

```bash
# 1. Check if webhook received (30s)
npm run payment:diagnose
# Look for: Recent transactions in last 7 days

# If NO transactions:
#   → Webhook not firing
#   → Check Secure-processor dashboard config

# If HAS transactions:
#   → Proceed to step 2

# 2. Test locally (1min)
npm run payment:webhook-sim success <userId> 100

# If local works:
#   → Webhook URL issue or not configured
#   → Fix Secure-processor dashboard

# If local fails:
#   → Code issue or environment issue
#   → Check logs for errors

# 3. Find orphaned payments (1min)
npm run payment:reconcile find-orphaned

# If found orphaned:
#   → Reconcile them
#   → Investigate why they're orphaned

# 4. Reconcile missing payments (5min)
npm run payment:reconcile interactive --live
```

### Symptom: Test Mode Not Working

```bash
# 1. Check environment (30s)
npm run payment:diagnose
# Look for: SECURE_PROCESSOR_TEST_MODE

# If not "true":
#   → Set SECURE_PROCESSOR_TEST_MODE=true
#   → Redeploy

# If "true":
#   → Test locally
npm run payment:webhook-sim success <userId> 100

# Check logs for:
🧪 TEST MODE TRANSACTION DETECTED
# If missing, signature verification failing
```

### Symptom: Webhook Not Firing

```bash
# 1. Test locally (1min)
npm run payment:webhook-sim success <userId> 100

# If works locally:
#   → Secure-processor config issue

# 2. Check Secure-processor Dashboard:
✓ Webhook URL: https://nerbixa.com/api/webhooks/secure-processor
✓ Test webhooks: ENABLED
✓ Shop ID: 29959
✓ Endpoint: Active

# 3. Test webhook endpoint (30s)
curl https://nerbixa.com/api/webhooks/secure-processor
# Should return: "Secure-processor webhook endpoint is active"

# 4. Check Vercel logs (realtime)
vercel logs --follow
# Make test payment, watch for incoming webhook
```

---

## 📊 Log Indicators Reference

### ✅ Successful Flow

```
═══════════════════════════════════════════════════════
📥 Secure-processor Webhook Received - RAW BODY:
═══════════════════════════════════════════════════════
↓
🧪 TEST MODE TRANSACTION DETECTED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  TEST MODE ENABLED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
↓
✅ User found
↓
🎟️  Tokens to add: 100
↓
🧪 TEST MODE: Starting Database Transaction
↓
✅ Transaction record created
↓
✅ User balance updated
↓
🧪 TEST MODE: Database Transaction Successful!
✅ Transaction record: CREATED
✅ User balance: UPDATED
↓
═══════════════════════════════════════════════════════
✅ Payment processed successfully
🧪 TEST MODE: All database changes committed
═══════════════════════════════════════════════════════
```

### ❌ Common Error Patterns

**Pattern 1: Missing Transaction Object**
```
❌ Missing transaction object in webhook payload
→ Webhook payload format incorrect
→ Check Secure-processor API version
```

**Pattern 2: User Not Found**
```
❌ User not found: user_xyz
⚠️  Payment received for non-existent user
→ User not created via Clerk webhook yet
→ Check Clerk webhook setup
```

**Pattern 3: Token Extraction Failed**
```
❌ Could not extract token amount from description: "..."
→ Description format incorrect
→ Must match: "... (XXX Tokens)"
```

**Pattern 4: Database Error**
```
❌ Database transaction failed: ...
→ Check DATABASE_URL
→ Check Neon connection
→ Check table schema
```

**Pattern 5: Signature Error (Production Only)**
```
❌ Missing signature in webhook (not a test transaction)
OR
❌ Invalid webhook signature
→ Signature required in production
→ Check SECURE_PROCESSOR_SECRET_KEY
→ For test mode: set transaction.test = true
```

---

## 🛠️ Command Quick Reference

```bash
# === DIAGNOSTIC ===
npm run payment:diagnose                    # Full diagnostic
npm run payment:reconcile find-orphaned     # Find issues

# === TESTING ===
npm run payment:webhook-sim success <userId> <tokens>  # Test success
npm run payment:webhook-sim failed <userId>            # Test failure
npm run payment:webhook-sim duplicate <userId>         # Test idempotency
npm run payment:webhook-sim all <userId>               # Test all

# === RECONCILIATION ===
npm run payment:reconcile interactive         # Dry run
npm run payment:reconcile interactive --live  # Apply fixes

# === VERIFICATION ===
vercel logs --follow                         # Watch logs
curl https://nerbixa.com/api/webhooks/secure-processor  # Test endpoint
npm run test:integration payment-test-mode   # Run tests
```

---

## 🎯 Expected Timings

| Action | Expected Time |
|--------|--------------|
| Run diagnostic | 30 seconds |
| Test webhook locally | 10 seconds |
| Find orphaned transactions | 1 minute |
| Reconcile 1 payment | 30 seconds |
| Full investigation | 5-10 minutes |
| Production deployment check | 3-5 minutes |

---

## 📈 Success Indicators

After running tools, you should see:

```
✅ DIAGNOSTIC PASSED
   ├─ Environment: ✅
   ├─ Database: ✅
   ├─ Test Mode: ✅
   └─ Recent Transactions: Found

✅ LOCAL TEST PASSED
   ├─ Webhook: 200 OK
   ├─ Transaction: Created
   └─ Balance: Updated

✅ NO ORPHANED TRANSACTIONS
   All successful transactions have updated balances

✅ PRODUCTION VERIFIED
   Test payment processed correctly
```

---

## 🚨 Escalation Criteria

Escalate to team lead if:
- [ ] Diagnostic fails after fixing environment
- [ ] Local webhook test fails consistently
- [ ] Database schema is corrupted
- [ ] Secure-processor API not responding
- [ ] Multiple orphaned transactions daily
- [ ] Data integrity issues detected

---

## 📝 Investigation Checklist

Copy and paste this for each investigation:

```
[ ] Ran diagnostic: npm run payment:diagnose
[ ] Result: _______________
[ ] Tested locally: npm run payment:webhook-sim success <userId> 100
[ ] Result: _______________
[ ] Checked for orphaned transactions
[ ] Result: _______________
[ ] Verified environment variables
[ ] Checked Secure-processor dashboard configuration
[ ] Monitored Vercel logs
[ ] Applied fixes (if any): _______________
[ ] Reconciled missing payments (if needed)
[ ] Verified fix in production
[ ] Updated documentation (if needed)
```

---

## 💡 Pro Tips

1. **Always start with diagnostic** - Saves 90% of investigation time
2. **Test locally first** - Isolates environment vs code issues  
3. **Check for 🧪 emoji** in logs - Easy to spot test mode
4. **Use dry-run before reconciling** - Safety first
5. **Monitor logs during test** - Real-time issue detection

---

**Last Updated:** October 31, 2025













