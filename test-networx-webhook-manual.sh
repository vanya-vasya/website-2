#!/bin/bash

# Test Networx Webhook Endpoint Manually
# This simulates what Networx should send to our webhook

echo "═══════════════════════════════════════════════════════"
echo "🧪 Testing Networx Webhook Endpoint"
echo "═══════════════════════════════════════════════════════"
echo ""

# Test payload (based on your Vercel logs)
PAYLOAD='{
  "transaction": {
    "uid": "test-1134bdda-9582-4ba1-9c96-e94109a558ee",
    "status": "successful",
    "amount": 250,
    "currency": "EUR",
    "description": "Nerbixa Generations Purchase (50 Tokens)",
    "type": "payment",
    "payment_method_type": "credit_card",
    "tracking_id": "user_34WzeL7bWWVIQqzDuqgSoDDlnL8",
    "message": "Transaction is successful.",
    "test": true,
    "created_at": "2025-10-25T11:02:50.213Z",
    "updated_at": "2025-10-25T11:02:52.692Z",
    "paid_at": "2025-10-25T11:02:52.647Z",
    "customer": {
      "email": "vladimir.serushko@gmail.com",
      "ip": "188.169.169.43"
    }
  }
}'

echo "📤 Sending test webhook to production endpoint..."
echo ""
echo "URL: https://www.nerbixa.com/api/webhooks/networx"
echo ""

# Send test webhook
RESPONSE=$(curl -X POST \
  -H "Content-Type: application/json" \
  -H "X-Signature: test-signature-12345" \
  -d "$PAYLOAD" \
  -w "\n\nHTTP Status: %{http_code}\n" \
  -s \
  https://www.nerbixa.com/api/webhooks/networx)

echo "📥 Response:"
echo "$RESPONSE"
echo ""
echo "═══════════════════════════════════════════════════════"
echo ""
echo "✅ If you see 'status: ok' and HTTP 200, the endpoint works!"
echo "⚠️  Now check Vercel logs for the webhook processing"
echo ""
echo "🔍 Expected in Vercel logs:"
echo "   - 📥 Networx Webhook Received - RAW BODY"
echo "   - Transaction ID (uid): test-1134bdda-..."
echo "   - Status: successful"
echo "   - ✅ User found: vladimir.serushko@gmail.com"
echo "   - 🎟️  Tokens to add: 50"
echo "   - ✅ Transaction record created"
echo "   - ✅ User balance updated"
echo ""
echo "═══════════════════════════════════════════════════════"

