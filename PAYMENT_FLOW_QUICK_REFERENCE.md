# Payment Flow - Quick Reference Guide

## User Flow

### 1. Token Creation & Payment
```
User clicks "Create Payment Token"
         ↓
Token created (500ms)
         ↓
Auto-redirect to Networx payment page
         ↓
User completes payment
         ↓
Redirect to /payment/success
         ↓
Balance verification (polling)
         ↓
5-second countdown
         ↓
Auto-redirect to /dashboard
```

**Error Cases:**
- Token creation fails → Inline error shown, no redirect
- Payment fails → Success page shows error state
- Balance verification times out → User can manually navigate to dashboard

---

## Data Flow

### User Creation (Clerk)
```
Clerk Sign Up → Clerk Webhook → Create User + Initial 20 Credits
```

### Payment Processing (Networx)
```
Payment Complete → Networx Webhook → Create Transaction + Update Balance
```

---

## Database Rules

### ✅ DO
- Create users **only** via Clerk webhook
- Store **all** transactions in Transaction table
- Update **only** balance in User table (for payments)
- Use `webhookEventId` for idempotency
- Check user exists before processing payment

### ❌ DON'T
- Never create users in payment webhook
- Never store transaction data in User table
- Never update user profile in payment webhook
- Never process duplicate webhooks (check idempotency)

---

## Key Files

### Payment Widget
**File:** `components/networx-payment-widget.tsx`
- Handles token creation
- Auto-redirects to payment page
- Shows inline errors

### Payment API
**File:** `app/api/payment/networx/route.ts`
- Creates payment tokens
- Returns payment URL for redirect

### Webhook Handler
**File:** `app/api/webhooks/networx/route.ts`
- Processes payment notifications
- Updates user balance
- Creates transaction records
- Enforces data separation

### Success Page
**File:** `app/(dashboard)/payment/success/page.tsx`
- Shows payment confirmation
- Polls for balance verification
- Auto-redirects to dashboard

---

## Environment Variables Required

```env
# Networx Payment Gateway
NETWORX_SHOP_ID=your_shop_id
NETWORX_SECRET_KEY=your_secret_key
NETWORX_TEST_MODE=true  # Set to false for production
NETWORX_RETURN_URL=https://nerbixa.com/payment/success
NETWORX_WEBHOOK_URL=https://nerbixa.com/api/webhooks/networx

# Clerk Authentication
WEBHOOK_SECRET=your_clerk_webhook_secret

# Database
DATABASE_URL=your_postgresql_connection_string
```

---

## Troubleshooting

### Payment not processing?
1. Check webhook logs in console
2. Verify `NETWORX_SECRET_KEY` is correct
3. Ensure user exists (created via Clerk)
4. Check `Transaction.webhookEventId` for duplicates

### Balance not updating?
1. Check webhook signature verification
2. Verify `tracking_id` matches `clerkId`
3. Check for transaction rollback errors
4. Verify token extraction from description

### Redirect not working?
1. Check `payment_url` in API response
2. Verify no JavaScript errors in console
3. Check network requests for token creation
4. Ensure email is provided

---

## Testing Checklist

### Happy Path
- [ ] Token creation → Auto-redirect
- [ ] Payment completion → Success page
- [ ] Balance verification → Dashboard redirect
- [ ] Transaction recorded correctly
- [ ] Balance updated correctly

### Error Handling
- [ ] Token creation failure → Inline error
- [ ] Payment failure → Proper error message
- [ ] Non-existent user → 404 response
- [ ] Duplicate webhook → Idempotent response

### Edge Cases
- [ ] Slow network → Loading states shown
- [ ] Webhook retry → No duplicate processing
- [ ] Balance verification timeout → Manual navigation available

---

## Support

For issues or questions:
1. Check console logs for error messages
2. Review webhook delivery in Networx dashboard
3. Verify environment variables are set correctly
4. Check database for transaction records

---

**Last Updated:** October 24, 2025




