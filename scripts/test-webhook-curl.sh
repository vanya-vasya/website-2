#!/bin/bash

###############################################################################
# CLERK WEBHOOK CURL TESTER
# 
# This script tests the Clerk webhook endpoint using curl
# It can test both local (dev) and production endpoints
###############################################################################

set -e

# Colors for output
RED='\033[0:31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default configuration
ENDPOINT="${WEBHOOK_URL:-http://localhost:3000/api/webhooks/clerk}"
METHOD="${1:-GET}"  # GET or POST

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}🧪 CLERK WEBHOOK CURL TESTER${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""

###############################################################################
# TEST 1: Health Check (GET)
###############################################################################

if [ "$METHOD" == "GET" ] || [ "$METHOD" == "ALL" ]; then
  echo -e "${YELLOW}TEST 1: Health Check (GET Request)${NC}"
  echo "─────────────────────────────────────────────────────"
  echo "Endpoint: $ENDPOINT"
  echo ""
  
  RESPONSE=$(curl -s -w "\n%{http_code}" "$ENDPOINT")
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | head -n-1)
  
  echo "HTTP Status: $HTTP_CODE"
  echo "Response Body:"
  echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
  echo ""
  
  if [ "$HTTP_CODE" == "200" ]; then
    echo -e "${GREEN}✅ PASSED: Health check successful${NC}"
    
    # Parse JSON response
    STATUS=$(echo "$BODY" | jq -r '.status' 2>/dev/null || echo "unknown")
    DB_CONNECTED=$(echo "$BODY" | jq -r '.database.connected' 2>/dev/null || echo "unknown")
    USER_COUNT=$(echo "$BODY" | jq -r '.database.userCount' 2>/dev/null || echo "unknown")
    
    echo "  Status: $STATUS"
    echo "  Database Connected: $DB_CONNECTED"
    echo "  User Count: $USER_COUNT"
  else
    echo -e "${RED}❌ FAILED: Health check returned $HTTP_CODE${NC}"
  fi
  echo ""
fi

###############################################################################
# TEST 2: Webhook Simulation (POST)
###############################################################################

if [ "$METHOD" == "POST" ] || [ "$METHOD" == "ALL" ]; then
  echo -e "${YELLOW}TEST 2: Webhook Simulation (POST Request)${NC}"
  echo "─────────────────────────────────────────────────────"
  echo "⚠️  Note: This will fail signature verification (expected)"
  echo "   It's testing the endpoint structure, not auth"
  echo ""
  
  # Sample Clerk webhook payload
  PAYLOAD='{
    "data": {
      "id": "user_test123",
      "email_addresses": [
        {
          "email_address": "test@example.com"
        }
      ],
      "first_name": "Test",
      "last_name": "User",
      "image_url": "https://example.com/avatar.jpg"
    },
    "type": "user.created"
  }'
  
  echo "Payload:"
  echo "$PAYLOAD" | jq '.'
  echo ""
  
  RESPONSE=$(curl -s -w "\n%{http_code}" \
    -X POST \
    -H "Content-Type: application/json" \
    -H "svix-id: test_webhook_id" \
    -H "svix-timestamp: 1234567890" \
    -H "svix-signature: test_signature" \
    -d "$PAYLOAD" \
    "$ENDPOINT")
  
  HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
  BODY=$(echo "$RESPONSE" | head -n-1)
  
  echo "HTTP Status: $HTTP_CODE"
  echo "Response Body:"
  echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
  echo ""
  
  case $HTTP_CODE in
    200)
      echo -e "${GREEN}✅ Unexpected: Request succeeded (signature should fail)${NC}"
      ;;
    400)
      ERROR=$(echo "$BODY" | jq -r '.error' 2>/dev/null || echo "unknown")
      if [[ "$ERROR" == *"Svix"* ]] || [[ "$ERROR" == *"headers"* ]]; then
        echo -e "${GREEN}✅ EXPECTED: Missing Svix headers detected${NC}"
      else
        echo -e "${YELLOW}⚠️  Got 400 but unexpected error: $ERROR${NC}"
      fi
      ;;
    401)
      echo -e "${GREEN}✅ EXPECTED: Signature verification failed (401)${NC}"
      echo "   This is correct - invalid signature rejected"
      ;;
    500)
      ERROR=$(echo "$BODY" | jq -r '.error' 2>/dev/null || echo "unknown")
      if [[ "$ERROR" == *"WEBHOOK_SECRET"* ]] || [[ "$ERROR" == *"environment"* ]]; then
        echo -e "${RED}❌ FAILED: Environment variable missing${NC}"
        echo "   Fix: Add WEBHOOK_SECRET to environment"
      else
        echo -e "${RED}❌ FAILED: Internal server error${NC}"
        echo "   Error: $ERROR"
      fi
      ;;
    *)
      echo -e "${RED}❌ FAILED: Unexpected status code${NC}"
      ;;
  esac
  echo ""
fi

###############################################################################
# SUMMARY
###############################################################################

echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}📊 TEST SUMMARY${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════${NC}"
echo ""
echo "Endpoint tested: $ENDPOINT"
echo ""
echo "Next steps:"
echo "  1. If health check passes, webhook is reachable"
echo "  2. Configure WEBHOOK_SECRET in environment"
echo "  3. Set up webhook in Clerk Dashboard"
echo "  4. Test with real Clerk webhook (use Testing tab)"
echo ""
echo "For detailed setup instructions, see:"
echo "  CLERK_WEBHOOK_SETUP_README.md"
echo ""

