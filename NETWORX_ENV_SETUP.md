# NetworkPay Environment Variables Setup

This file contains the environment variables configuration for the NetworkPay payment gateway integration.

## Required Environment Variables

For production deployment on Vercel, add these environment variables to your Vercel project settings:

### Server-side Variables (Private)
```
NETWORX_SHOP_ID=29959
NETWORX_SECRET_KEY=<your_networx_secret_key>
NETWORX_API_URL=https://gateway.networxpay.com
NETWORX_TEST_MODE=false
NETWORX_RETURN_URL=https://nerbixa.com/payment/success
NETWORX_CANCEL_URL=https://nerbixa.com/payment/cancel
NETWORX_WEBHOOK_URL=https://nerbixa.com/api/webhooks/networx
```

### Client-side Variables (Public)
```
NEXT_PUBLIC_NETWORX_SHOP_ID=29959
NEXT_PUBLIC_NETWORX_TEST_MODE=false
NEXT_PUBLIC_NETWORX_WIDGET_URL=https://checkout.networxpay.com
```

## How to Add Environment Variables to Vercel

1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add each variable with its corresponding value
4. Make sure to select the appropriate environments (Production, Preview, Development)
5. Redeploy your application for the changes to take effect

## Fallback Configuration

The code has been updated to include fallback values for all environment variables, so the payment system will work even if environment variables are not set, using the credentials provided:

- Shop ID: 29959
- Secret Key: <your_networx_secret_key>

## Changes Made

1. ✅ Updated payment API to use real NetworkPay endpoints
2. ✅ Removed mock responses and demo mode indicators
3. ✅ Configured proper return URLs for the deployed website
4. ✅ Updated webhook handler with new credentials
5. ✅ Modified payment widget UI to reflect production mode
6. ✅ Updated test page to show production configuration

## Testing

You can test the payment integration at:
https://nerbixa.com/payment/test

## Important Notes

- The system is now configured for production mode with real payments
- All URLs are set to use your deployed Vercel domain
- The webhook endpoint is configured to receive payment notifications
- The payment widget will open NetworkPay's checkout page for processing payments
