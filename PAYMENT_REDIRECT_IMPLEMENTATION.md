# Payment Redirect Implementation

## Overview

This document describes the implementation of automatic dashboard redirect after successful payment and token balance top-up.

## Features Implemented

### 1. Balance Verification API
- **Endpoint**: `/api/payment/verify-balance`
- **Method**: GET
- **Purpose**: Verify if user's balance has been updated after payment

#### Query Parameters:
- `transactionId` (optional): Verify if a specific transaction has been processed
- `expectedMinBalance` (optional): Check if balance meets minimum threshold

#### Response Structure:
```typescript
{
  success: boolean;
  balanceUpdated: boolean;
  currentBalance: number;
  transaction?: {
    id: string;
    amount: string;
    status: string;
    paid_at: Date;
  };
  expectedMinBalance?: number;
}
```

### 2. Payment Success Page with Auto-Redirect
- **Location**: `/app/(dashboard)/payment/success/page.tsx`
- **Features**:
  - Displays transaction details
  - Polls for balance verification every 2 seconds
  - Maximum 15 polling attempts (30 seconds total)
  - Shows loading state during verification
  - 5-second countdown before redirect
  - Automatic redirect to `/dashboard` after balance confirmation
  - Manual redirect button available

#### User Experience Flow:
1. User completes payment on Networx hosted page
2. User redirected to `/payment/success?order_id=xxx`
3. Page fetches transaction details
4. Page polls balance verification endpoint
5. When balance confirmed:
   - Success message displayed
   - Countdown timer shown (5 seconds)
   - Automatic redirect to `/dashboard`
6. If verification times out:
   - User can still manually navigate to dashboard
   - Balance will be available (webhook may still be processing)

### 3. Updated Payment Flow
- **Payment API**: `/app/api/payment/networx/route.ts`
  - Now requires `userId` parameter
  - Uses `userId` as `tracking_id` (matches webhook expectation)
  - Passes `orderId` in return URL for reference
  
- **Widget Component**: `components/networx-payment-widget.tsx`
  - Accepts `userId` prop
  - Passes `userId` to payment API

- **Pro Modal**: `components/pro-modal.tsx`
  - Provides `userId` to payment widget
  - Maintains unique `orderId` format: `gen_${userId}_${Date.now()}`

### 4. Webhook Integration
- **Webhook**: `/app/api/webhooks/payment/route.ts`
- Receives `tracking_id` (userId) from payment provider
- Updates user balance in database
- Creates transaction record
- Sends receipt email

## Technical Implementation

### Polling Mechanism
```typescript
// Initial check immediately
pollBalance().then((verified) => {
  if (verified) return;

  // Poll every 2 seconds for up to 30 seconds
  const pollInterval = setInterval(async () => {
    const verified = await pollBalance();
    
    if (verified || attempts >= maxAttempts) {
      clearInterval(pollInterval);
    }
  }, 2000);
});
```

### Countdown Timer
```typescript
// Start countdown after balance verified
const countdownInterval = setInterval(() => {
  setRedirectCountdown((prev) => {
    if (prev <= 1) {
      clearInterval(countdownInterval);
      router.push('/dashboard');
      return 0;
    }
    return prev - 1;
  });
}, 1000);
```

## Testing

### Integration Tests
- **File**: `__tests__/integration/payment-redirect.integration.test.ts`
- **Coverage**:
  - Balance verification with real database
  - Transaction lookup by tracking_id
  - Expected minimum balance verification
  - Polling behavior simulation
  - Authentication checks
  - Error handling

### Unit Tests
- **File**: `__tests__/unit/verify-balance.unit.test.ts`
- **Coverage**:
  - API endpoint behavior
  - Parameter validation
  - Response structure
  - Error handling
  - URL parameter parsing
  - Edge cases

### Running Tests
```bash
# Run all tests
npm test

# Run integration tests only
npm test -- __tests__/integration/payment-redirect

# Run unit tests only
npm test -- __tests__/unit/verify-balance

# Run with coverage
npm test -- --coverage
```

## Database Schema

### Transaction Model
```prisma
model Transaction {
  id                  String   @id @default(cuid())
  tracking_id         String   // Now stores userId for matching
  userId              String
  status              String
  amount              String
  currency            String
  description         String
  type                String
  payment_method_type String?
  message             String?
  paid_at             DateTime?
  receipt_url         String?
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
}
```

## Security Considerations

1. **Authentication**: All balance verification requests require authenticated user
2. **User Isolation**: Users can only verify their own balance
3. **Transaction Validation**: Only successful transactions count toward balance
4. **Rate Limiting**: Polling is client-side limited to prevent abuse

## Error Handling

### Client-Side
- Network failures during polling are logged but don't stop the flow
- Timeout after max polling attempts shows user-friendly message
- Manual redirect button always available
- Toast notifications for all state changes

### Server-Side
- 401 for unauthorized requests
- 404 for user not found
- 500 for database errors
- Detailed error messages in response

## Future Enhancements

1. **WebSocket Support**: Real-time balance updates instead of polling
2. **Push Notifications**: Notify user when balance is updated
3. **Receipt Download**: Add button to download receipt on success page
4. **Payment History Link**: Quick access to full payment history
5. **Analytics**: Track time between payment and balance update

## API Flow Diagram

```
User → Payment Widget → Payment API → Networx
                          ↓
                     (tracking_id = userId)
                          ↓
Webhook ← Networx Payment Gateway
  ↓
Update User Balance
  ↓
Create Transaction Record
  ↓
Send Receipt Email

User → Success Page → Poll Verify Balance API
                          ↓
                    Check Transaction
                          ↓
                    Balance Updated?
                          ↓ Yes
                    Redirect to Dashboard
```

## Environment Variables

Required environment variables:
```env
# Networx Payment Gateway
NETWORX_SHOP_ID=your_shop_id
NETWORX_SECRET_KEY=your_secret_key
NETWORX_RETURN_URL=https://nerbixa.com/payment/success
NETWORX_WEBHOOK_URL=https://nerbixa.com/api/webhooks/payment

# Database
DATABASE_URL=your_database_url

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key
CLERK_SECRET_KEY=your_secret
```

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Tests passing
- [ ] Webhook endpoint accessible
- [ ] Return URL configured in Networx dashboard
- [ ] SSL certificate valid
- [ ] CORS headers configured (if needed)
- [ ] Rate limiting configured
- [ ] Error monitoring setup
- [ ] Analytics tracking added

## Support

For issues or questions:
- Check logs: `app/api/payment/verify-balance/route.ts`
- Check webhook logs: `app/api/webhooks/payment/route.ts`
- Review test cases for expected behavior
- Contact: support@nerbixa.com

