# Secure-processor Pay Integration Setup for localhost:3001

## Overview
Complete setup guide for integrating Secure-processor Pay payment system with your Next.js application running on localhost:3001.

## ✅ Current Implementation Status

Your project already includes:
- ✅ Payment API routes (`/api/payment/secure-processor`)
- ✅ Webhook handler (`/api/webhooks/secure-processor`) 
- ✅ Payment widget component (`NetworkPaymentWidget`)
- ✅ Success/Cancel result pages
- ✅ HMAC SHA256 signature security
- ✅ Test page for payment integration

## 🚀 Quick Setup Steps

### 1. Create Environment Variables

Create a `.env.local` file in your project root:

```bash
# Secure-processor Pay Configuration
SECURE_PROCESSOR_SHOP_ID=29959
SECURE_PROCESSOR_SECRET_KEY=dbfb6f4e977f49880a6ce3c939f1e7be645a5bb2596c04d9a3a7b32d52378950

# API Configuration  
SECURE_PROCESSOR_API_URL=https://gateway.secure-processorpay.com
SECURE_PROCESSOR_TEST_MODE=true

# localhost:3001 URLs
SECURE_PROCESSOR_RETURN_URL=http://localhost:3001/payment/success
SECURE_PROCESSOR_CANCEL_URL=http://localhost:3001/payment/cancel
SECURE_PROCESSOR_WEBHOOK_URL=http://localhost:3001/api/webhooks/secure-processor

# Client-side variables
NEXT_PUBLIC_SECURE_PROCESSOR_SHOP_ID=29959
NEXT_PUBLIC_SECURE_PROCESSOR_TEST_MODE=true
NEXT_PUBLIC_SECURE_PROCESSOR_WIDGET_URL=https://checkout.networxpay.com
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### 2. Install Dependencies

All required dependencies are already in your package.json. Just run:

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

This will start the server on http://localhost:3001

### 4. Test Payment Integration

Visit: http://localhost:3001/payment/test

## 📋 API Endpoints

### Payment Creation
- **Endpoint**: `POST /api/payment/secure-processor`
- **Purpose**: Creates payment tokens and initiates payment process
- **Security**: HMAC SHA256 signature verification

### Webhook Handler  
- **Endpoint**: `POST /api/webhooks/secure-processor`
- **Purpose**: Processes payment notifications from Secure-processor
- **Security**: Webhook signature validation

### Payment Status Check
- **Endpoint**: `GET /api/payment/secure-processor?token={token}`
- **Purpose**: Checks current payment status

## 🎯 Result Pages

### Success Page
- **URL**: http://localhost:3001/payment/success
- **Purpose**: Displays successful payment confirmation
- **Features**: Transaction details, navigation back to dashboard

### Cancel/Failed Page
- **URL**: http://localhost:3001/payment/cancel  
- **Purpose**: Handles failed or cancelled payments
- **Features**: Error details, retry options

### Test Page
- **URL**: http://localhost:3001/payment/test
- **Purpose**: Complete payment integration testing
- **Features**: Configurable amounts, real payment processing

## 🔒 Security Implementation

### HMAC SHA256 Signatures
All requests to/from Secure-processor are secured with HMAC SHA256 signatures:

```javascript
// Signature creation (in payment API)
function createSignature(data, secretKey) {
  const sortedParams = Object.keys(data).sort().reduce((obj, key) => {
    obj[key] = data[key];
    return obj;
  }, {});
  
  const signString = Object.entries(sortedParams)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');
    
  return crypto.createHmac('sha256', secretKey)
    .update(signString)
    .digest('hex');
}

// Signature verification (in webhook handler) 
function verifyWebhookSignature(data, signature, secretKey) {
  const { signature: _, ...dataForSignature } = data;
  // ... same sorting and signing process
  return expectedSignature === signature;
}
```

### Environment Variable Protection
- Secret keys are stored in environment variables
- Fallback values ensure system works even without env vars
- Client-side variables are properly prefixed with `NEXT_PUBLIC_`

## 🧪 Testing Instructions

### 1. Basic Integration Test
1. Navigate to http://localhost:3001/payment/test
2. Configure test payment parameters
3. Click "Show Payment Widget"
4. Enter test email and create payment token
5. Click "Open Payment Window" 
6. Use real bank card for testing (test mode enabled)

### 2. Webhook Testing
Webhooks will be automatically called by Secure-processor when payments complete. Check server logs to see webhook processing.

### 3. API Testing
You can test the API directly:

```bash
# Test payment creation
curl -X POST http://localhost:3001/api/payment/secure-processor \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 10.00,
    "currency": "USD", 
    "orderId": "test_order_123",
    "description": "Test payment",
    "customerEmail": "test@example.com"
  }'

# Test webhook endpoint status
curl http://localhost:3001/api/webhooks/secure-processor
```

## ⚡ Component Usage

### NetworkPaymentWidget Component

```jsx
import { NetworkPaymentWidget } from '@/components/secure-processor-payment-widget';

function MyPaymentPage() {
  return (
    <NetworkPaymentWidget
      amount={25.00}
      currency="USD"
      orderId="order_12345"
      description="Premium subscription"
      customerEmail="user@example.com"
      onSuccess={(data) => console.log('Payment successful:', data)}
      onError={(error) => console.log('Payment failed:', error)}
      onCancel={() => console.log('Payment cancelled')}
    />
  );
}
```

## 🐛 Troubleshooting

### Common Issues

1. **Environment Variables Not Loading**
   - Ensure `.env.local` is in project root
   - Restart development server after changes
   - Check variable names match exactly

2. **Payment Window Not Opening**
   - Check browser popup settings
   - Verify `NEXT_PUBLIC_SECURE_PROCESSOR_WIDGET_URL` is set correctly

3. **Webhook Not Receiving Notifications**
   - Ensure `SECURE_PROCESSOR_WEBHOOK_URL` points to correct localhost URL
   - Check firewall settings for port 3001
   - Verify webhook endpoint is accessible externally (use ngrok for testing)

4. **Signature Verification Failing**
   - Verify `SECURE_PROCESSOR_SECRET_KEY` matches exactly
   - Check parameter sorting in signature creation
   - Ensure no extra whitespace in environment variables

### Development with External Webhooks

For webhook testing with external services, use ngrok:

```bash
# Install ngrok
npm install -g ngrok

# Expose localhost:3001 
ngrok http 3001

# Update webhook URL in .env.local
SECURE_PROCESSOR_WEBHOOK_URL=https://your-ngrok-url.ngrok.io/api/webhooks/secure-processor
```

## 🎉 Ready to Use!

Your Secure-processor Pay integration is now fully configured and ready for use on localhost:3001. The system includes:

- ✅ Complete payment processing
- ✅ Secure signature verification  
- ✅ Webhook handling
- ✅ Error handling and retry logic
- ✅ User-friendly payment interface
- ✅ Transaction status tracking
- ✅ Comprehensive testing tools

Visit http://localhost:3001/payment/test to start testing your payment integration!
