# Environment Variables Migration Guide

## Secure-processor Rebrand - Environment Variables Update

As part of the rebranding from "Networx" to "Secure-processor", all environment variable names have been updated. **Use the same values as before, just with new variable names.**

---

## 🔄 Environment Variable Mapping

| Old Variable Name | New Variable Name | Value |
|------------------|-------------------|-------|
| `NETWORX_SHOP_ID` | `SECURE_PROCESSOR_SHOP_ID` | **Use the same value** |
| `NETWORX_SECRET_KEY` | `SECURE_PROCESSOR_SECRET_KEY` | **Use the same value** |
| `NETWORX_RETURN_URL` | `SECURE_PROCESSOR_RETURN_URL` | **Use the same value** |
| `NETWORX_WEBHOOK_URL` | `SECURE_PROCESSOR_WEBHOOK_URL` | **Use the same value** |
| `NETWORX_TEST_MODE` | `SECURE_PROCESSOR_TEST_MODE` | **Use the same value** |

---

## 📝 Quick Migration Steps

### Step 1: Copy Your Current Values

If you have existing `NETWORX_*` variables configured, simply rename them:

```bash
# Example current values (DO NOT SHARE REAL VALUES)
NETWORX_SHOP_ID=29959
NETWORX_SECRET_KEY=dbfb6f4e977f49880a6ce3c939f1e7be645a5bb2596c04d9a3a7b32d52378950
NETWORX_RETURN_URL=https://www.nerbixa.com/dashboard
NETWORX_WEBHOOK_URL=https://nerbixa.com/api/webhooks/networx
NETWORX_TEST_MODE=true
```

### Step 2: Update Variable Names

Rename to new format (keep the same values):

```bash
SECURE_PROCESSOR_SHOP_ID=29959
SECURE_PROCESSOR_SECRET_KEY=dbfb6f4e977f49880a6ce3c939f1e7be645a5bb2596c04d9a3a7b32d52378950
SECURE_PROCESSOR_RETURN_URL=https://www.nerbixa.com/dashboard
SECURE_PROCESSOR_WEBHOOK_URL=https://nerbixa.com/api/webhooks/secure-processor
SECURE_PROCESSOR_TEST_MODE=true
```

### Step 3: Update Webhook URL Path

**Note:** The webhook URL path has changed:
- Old: `https://nerbixa.com/api/webhooks/networx`
- New: `https://nerbixa.com/api/webhooks/secure-processor`

---

## 🔧 Configuration by Environment

### Local Development (.env.local)

```bash
# Database
DATABASE_URL=your_database_url

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
CLERK_WEBHOOK_SECRET=your_webhook_secret

# Secure-processor Payment Gateway (renamed from Networx)
SECURE_PROCESSOR_SHOP_ID=your_shop_id
SECURE_PROCESSOR_SECRET_KEY=your_secret_key
SECURE_PROCESSOR_RETURN_URL=http://localhost:3000/dashboard
SECURE_PROCESSOR_WEBHOOK_URL=http://localhost:3000/api/webhooks/secure-processor
SECURE_PROCESSOR_TEST_MODE=true

# OpenAI
OPENAI_API_KEY=your_openai_key

# Replicate
REPLICATE_API_TOKEN=your_replicate_token
```

### Production (Vercel)

```bash
SECURE_PROCESSOR_SHOP_ID=your_shop_id
SECURE_PROCESSOR_SECRET_KEY=your_secret_key
SECURE_PROCESSOR_RETURN_URL=https://www.nerbixa.com/dashboard
SECURE_PROCESSOR_WEBHOOK_URL=https://nerbixa.com/api/webhooks/secure-processor
SECURE_PROCESSOR_TEST_MODE=false
```

---

## 🚀 Vercel Deployment Steps

### Option 1: Via Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings → Environment Variables**
4. **Add new variables** (or update existing ones):
   - `SECURE_PROCESSOR_SHOP_ID`
   - `SECURE_PROCESSOR_SECRET_KEY`
   - `SECURE_PROCESSOR_RETURN_URL`
   - `SECURE_PROCESSOR_WEBHOOK_URL`
   - `SECURE_PROCESSOR_TEST_MODE`
5. Select environments: Production, Preview, Development
6. Click **Save**
7. Redeploy your application

### Option 2: Via Vercel CLI

```bash
# Production
vercel env add SECURE_PROCESSOR_SHOP_ID production
vercel env add SECURE_PROCESSOR_SECRET_KEY production
vercel env add SECURE_PROCESSOR_RETURN_URL production
vercel env add SECURE_PROCESSOR_WEBHOOK_URL production
vercel env add SECURE_PROCESSOR_TEST_MODE production

# Preview
vercel env add SECURE_PROCESSOR_RETURN_URL preview
vercel env add SECURE_PROCESSOR_WEBHOOK_URL preview
vercel env add SECURE_PROCESSOR_TEST_MODE preview

# Development
vercel env add SECURE_PROCESSOR_RETURN_URL development
vercel env add SECURE_PROCESSOR_WEBHOOK_URL development
vercel env add SECURE_PROCESSOR_TEST_MODE development
```

---

## ✅ Verification Checklist

After updating environment variables:

- [ ] All `SECURE_PROCESSOR_*` variables are set
- [ ] Webhook URL path updated to `/api/webhooks/secure-processor`
- [ ] Return URL points to `/dashboard`
- [ ] Test mode is configured correctly (`true` for testing, `false` for production)
- [ ] Application redeployed in Vercel
- [ ] Payment flow tested end-to-end
- [ ] Webhook receiving notifications correctly

---

## 🔍 Testing

### Test Payment Flow

1. Visit your application
2. Navigate to token purchase page
3. Initiate a test payment
4. Complete payment on secure-processor hosted page
5. Verify redirect back to dashboard
6. Verify token balance updated
7. Check payment history

### Check Webhook

```bash
# View webhook logs in Vercel
vercel logs --follow

# Or check your database for transaction records
# Look for recent transactions with status='successful'
```

---

## ⚠️ Important Notes

1. **Keep the same credentials** - The payment processor is the same, only the variable names changed
2. **Update webhook path** - Make sure to update the webhook URL path from `/networx` to `/secure-processor`
3. **Redeploy after changes** - Environment variable changes require redeployment
4. **No downtime** - You can add new variables before removing old ones for zero-downtime migration
5. **Documentation updates** - Update any internal documentation referencing old variable names

---

## 🆘 Troubleshooting

### Issue: Payment not working after migration

**Solution:** Verify all environment variables are set correctly

```bash
# Check Vercel environment variables
vercel env ls

# Should show all SECURE_PROCESSOR_* variables
```

### Issue: Webhook not receiving notifications

**Solution:** Update webhook URL in payment processor dashboard
- Old: `https://nerbixa.com/api/webhooks/networx`
- New: `https://nerbixa.com/api/webhooks/secure-processor`

### Issue: TypeScript build errors

**Solution:** Ensure you're building from the latest commit with camelCase property names fixed.

---

## 📚 Related Documentation

- `SECURE_PROCESSOR_ENV_SETUP.md` - Detailed environment setup
- `SECURE_PROCESSOR_AUTH_FIX.md` - Authentication troubleshooting
- `SECURE_PROCESSOR_WEBHOOK_FIX_SUMMARY.md` - Webhook configuration
- `SECURE_PROCESSOR_SETUP_LOCALHOST.md` - Local development setup

---

## 🎯 Summary

**Simple 3-step migration:**

1. ✅ Copy your existing `NETWORX_*` values
2. ✅ Create new `SECURE_PROCESSOR_*` variables with the same values
3. ✅ Update webhook URL path and redeploy

**The payment gateway credentials remain exactly the same - only the variable names changed!**

