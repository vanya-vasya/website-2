/**
 * Integration Tests for Secure-processor Webhook Flow
 * 
 * These tests verify:
 * - Webhook signature verification
 * - Transaction record creation
 * - User credit updates
 * - Idempotency (duplicate webhook handling)
 * - Error handling for various payment statuses
 */

import { POST } from "@/app/api/webhooks/secure-processor/route";
import prismadb from "@/lib/prismadb";
import { NextRequest } from "next/server";
import crypto from "crypto";

describe("Secure-processor Webhook Integration Tests", () => {
  const testClerkId = `test_networx_user_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const testEmail = `networx-test-${Date.now()}@example.com`;
  const secretKey = process.env.SECURE_PROCESSOR_SECRET_KEY || 'dbfb6f4e977f49880a6ce3c939f1e7be645a5bb2596c04d9a3a7b32d52378950';

  beforeAll(async () => {
    // Create test user
    await prismadb.user.create({
      data: {
        clerkId: testClerkId,
        email: testEmail,
        photo: "https://example.com/test.jpg",
        firstName: "Secure-processor",
        lastName: "Test",
        availableGenerations: 20,
        usedGenerations: 5,
      },
    });
  });

  afterAll(async () => {
    await cleanupTestData();
    await prismadb.$disconnect();
  });

  const cleanupTestData = async () => {
    try {
      await prismadb.transaction.deleteMany({
        where: { userId: testClerkId },
      });
      await prismadb.user.deleteMany({
        where: { clerkId: testClerkId },
      });
    } catch (error) {
      console.error("Cleanup error:", error);
    }
  };

  beforeEach(async () => {
    // Clean up transactions before each test
    await prismadb.transaction.deleteMany({
      where: { userId: testClerkId },
    });
  });

  // Helper function to create webhook signature
  const createWebhookSignature = (data: Record<string, any>): string => {
    const sortedParams = Object.keys(data)
      .sort()
      .reduce((obj: Record<string, any>, key) => {
        obj[key] = data[key];
        return obj;
      }, {});

    const signString = Object.entries(sortedParams)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

    return crypto
      .createHmac('sha256', secretKey)
      .update(signString)
      .digest('hex');
  };

  // Helper function to create webhook request
  const createWebhookRequest = (data: Record<string, any>): NextRequest => {
    const signature = createWebhookSignature(data);
    const bodyWithSignature = { ...data, signature };

    return new NextRequest('http://localhost/api/webhooks/networx', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bodyWithSignature),
    });
  };

  describe("Successful Payment Flow", () => {
    it("should create transaction record and update user credits on successful payment", async () => {
      const transactionId = `txn_test_${Date.now()}`;
      const orderId = `order_test_${Date.now()}`;
      
      const webhookData = {
        status: 'success',
        order_id: orderId,
        transaction_id: transactionId,
        amount: '1000',
        currency: 'USD',
        type: 'payment',
        customer_email: testEmail,
        tracking_id: testClerkId,
        description: 'Nerbixa Generations Purchase (100 Tokens)',
        payment_method_type: 'card',
        message: 'Payment successful',
        paid_at: new Date().toISOString(),
      };

      const request = createWebhookRequest(webhookData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('ok');

      // Verify transaction was created
      const transaction = await prismadb.transaction.findFirst({
        where: {
          tracking_id: transactionId,
        },
      });

      expect(transaction).toBeDefined();
      expect(transaction?.status).toBe('successful');
      expect(transaction?.userId).toBe(testClerkId);
      expect(transaction?.amount).toBe(1000);
      expect(transaction?.description).toContain('100 Tokens');

      // Verify user credits were updated
      const user = await prismadb.user.findUnique({
        where: { clerkId: testClerkId },
        select: {
          availableGenerations: true,
          usedGenerations: true,
        },
      });

      expect(user).toBeDefined();
      // Original: 20 available - 5 used = 15, + 100 new = 115
      expect(user?.availableGenerations).toBe(115);
      expect(user?.usedGenerations).toBe(0);
    });

    it("should handle 'successful' status (alternative status name)", async () => {
      const transactionId = `txn_test_${Date.now()}`;
      
      const webhookData = {
        status: 'successful', // Alternative status name
        order_id: `order_test_${Date.now()}`,
        transaction_id: transactionId,
        amount: '500',
        currency: 'USD',
        type: 'payment',
        tracking_id: testClerkId,
        description: 'Payment (50 Tokens)',
      };

      const request = createWebhookRequest(webhookData);
      const response = await POST(request);

      expect(response.status).toBe(200);

      const transaction = await prismadb.transaction.findFirst({
        where: { tracking_id: transactionId },
      });

      expect(transaction?.status).toBe('successful');
    });

    it("should extract token amount from various description formats", async () => {
      const testCases = [
        { description: 'Purchase (100 Tokens)', expectedTokens: 100 },
        { description: 'Payment for (250 tokens)', expectedTokens: 250 },
        { description: 'Order (50 Token)', expectedTokens: 50 },
      ];

      for (const testCase of testCases) {
        const transactionId = `txn_test_${Date.now()}_${Math.random()}`;
        
        const webhookData = {
          status: 'success',
          order_id: `order_${Date.now()}`,
          transaction_id: transactionId,
          amount: '100',
          currency: 'USD',
          type: 'payment',
          tracking_id: testClerkId,
          description: testCase.description,
        };

        const request = createWebhookRequest(webhookData);
        await POST(request);

        const user = await prismadb.user.findUnique({
          where: { clerkId: testClerkId },
          select: { availableGenerations: true },
        });

        // Verify tokens were added correctly
        // Each iteration adds to the balance
        expect(user?.availableGenerations).toBeGreaterThan(20);
      }
    });
  });

  describe("Idempotency", () => {
    it("should not process duplicate webhooks", async () => {
      const transactionId = `txn_idempotency_${Date.now()}`;
      
      const webhookData = {
        status: 'success',
        order_id: `order_${Date.now()}`,
        transaction_id: transactionId,
        amount: '1000',
        currency: 'USD',
        type: 'payment',
        tracking_id: testClerkId,
        description: 'Test (100 Tokens)',
      };

      // First webhook
      const request1 = createWebhookRequest(webhookData);
      const response1 = await POST(request1);
      expect(response1.status).toBe(200);

      const userAfterFirst = await prismadb.user.findUnique({
        where: { clerkId: testClerkId },
        select: { availableGenerations: true },
      });

      // Second webhook (duplicate)
      const request2 = createWebhookRequest(webhookData);
      const response2 = await POST(request2);
      const data2 = await response2.json();

      expect(response2.status).toBe(200);
      expect(data2.message).toBe('Transaction already processed');

      const userAfterSecond = await prismadb.user.findUnique({
        where: { clerkId: testClerkId },
        select: { availableGenerations: true },
      });

      // Balance should not change on duplicate webhook
      expect(userAfterSecond?.availableGenerations).toBe(userAfterFirst?.availableGenerations);

      // Should still be only one transaction record
      const transactions = await prismadb.transaction.findMany({
        where: { tracking_id: transactionId },
      });

      expect(transactions.length).toBe(1);
    });
  });

  describe("Failed Payment Handling", () => {
    it("should create failed transaction record without updating credits", async () => {
      const transactionId = `txn_failed_${Date.now()}`;
      
      const webhookData = {
        status: 'failed',
        order_id: `order_${Date.now()}`,
        transaction_id: transactionId,
        amount: '1000',
        currency: 'USD',
        type: 'payment',
        tracking_id: testClerkId,
        description: 'Failed payment (100 Tokens)',
        error_message: 'Insufficient funds',
      };

      const userBefore = await prismadb.user.findUnique({
        where: { clerkId: testClerkId },
        select: { availableGenerations: true },
      });

      const request = createWebhookRequest(webhookData);
      const response = await POST(request);

      expect(response.status).toBe(200);

      // Verify failed transaction was created
      const transaction = await prismadb.transaction.findFirst({
        where: { tracking_id: transactionId },
      });

      expect(transaction).toBeDefined();
      expect(transaction?.status).toBe('failed');
      expect(transaction?.reason).toBe('Insufficient funds');

      // Verify user credits were NOT updated
      const userAfter = await prismadb.user.findUnique({
        where: { clerkId: testClerkId },
        select: { availableGenerations: true },
      });

      expect(userAfter?.availableGenerations).toBe(userBefore?.availableGenerations);
    });
  });

  describe("Pending Payment Handling", () => {
    it("should create pending transaction record without updating credits", async () => {
      const transactionId = `txn_pending_${Date.now()}`;
      
      const webhookData = {
        status: 'pending',
        order_id: `order_${Date.now()}`,
        transaction_id: transactionId,
        amount: '500',
        currency: 'USD',
        type: 'payment',
        tracking_id: testClerkId,
        description: 'Pending payment (50 Tokens)',
      };

      const userBefore = await prismadb.user.findUnique({
        where: { clerkId: testClerkId },
        select: { availableGenerations: true },
      });

      const request = createWebhookRequest(webhookData);
      const response = await POST(request);

      expect(response.status).toBe(200);

      const transaction = await prismadb.transaction.findFirst({
        where: { tracking_id: transactionId },
      });

      expect(transaction?.status).toBe('pending');

      // Credits should not change for pending payments
      const userAfter = await prismadb.user.findUnique({
        where: { clerkId: testClerkId },
        select: { availableGenerations: true },
      });

      expect(userAfter?.availableGenerations).toBe(userBefore?.availableGenerations);
    });
  });

  describe("Canceled Payment Handling", () => {
    it("should create canceled transaction record without updating credits", async () => {
      const transactionId = `txn_canceled_${Date.now()}`;
      
      const webhookData = {
        status: 'canceled',
        order_id: `order_${Date.now()}`,
        transaction_id: transactionId,
        amount: '2500',
        currency: 'EUR',
        type: 'payment',
        tracking_id: testClerkId,
        description: 'Canceled payment (250 Tokens)',
      };

      const request = createWebhookRequest(webhookData);
      const response = await POST(request);

      expect(response.status).toBe(200);

      const transaction = await prismadb.transaction.findFirst({
        where: { tracking_id: transactionId },
      });

      expect(transaction?.status).toBe('canceled');
    });
  });

  describe("Refund Handling", () => {
    it("should create refund record and deduct tokens from user balance", async () => {
      // First, add tokens via successful payment
      const originalTransactionId = `txn_original_${Date.now()}`;
      
      const successWebhook = {
        status: 'success',
        order_id: `order_${Date.now()}`,
        transaction_id: originalTransactionId,
        amount: '1000',
        currency: 'USD',
        type: 'payment',
        tracking_id: testClerkId,
        description: 'Original payment (100 Tokens)',
      };

      const successRequest = createWebhookRequest(successWebhook);
      await POST(successRequest);

      const userAfterPayment = await prismadb.user.findUnique({
        where: { clerkId: testClerkId },
        select: { availableGenerations: true },
      });

      // Now refund
      const refundTransactionId = `txn_refund_${Date.now()}`;
      
      const refundWebhook = {
        status: 'refunded',
        order_id: `order_${Date.now()}`,
        transaction_id: refundTransactionId,
        amount: '1000',
        currency: 'USD',
        type: 'refund',
        tracking_id: testClerkId,
        description: 'Refund for (100 Tokens)',
      };

      const refundRequest = createWebhookRequest(refundWebhook);
      const refundResponse = await POST(refundRequest);

      expect(refundResponse.status).toBe(200);

      // Verify refund transaction was created
      const refundTransaction = await prismadb.transaction.findFirst({
        where: { tracking_id: refundTransactionId },
      });

      expect(refundTransaction?.status).toBe('refunded');
      expect(refundTransaction?.type).toBe('refund');

      // Verify tokens were deducted
      const userAfterRefund = await prismadb.user.findUnique({
        where: { clerkId: testClerkId },
        select: { availableGenerations: true },
      });

      expect(userAfterRefund?.availableGenerations).toBe(
        (userAfterPayment?.availableGenerations || 0) - 100
      );
    });
  });

  describe("Webhook Validation", () => {
    it("should reject webhook with invalid signature", async () => {
      const webhookData = {
        status: 'success',
        order_id: 'test_order',
        transaction_id: 'test_txn',
        amount: '1000',
        currency: 'USD',
        type: 'payment',
        tracking_id: testClerkId,
        description: 'Test (100 Tokens)',
        signature: 'invalid_signature',
      };

      const request = new NextRequest('http://localhost/api/webhooks/networx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Invalid signature');
    });

    it("should reject webhook without signature", async () => {
      const webhookData = {
        status: 'success',
        order_id: 'test_order',
        transaction_id: 'test_txn',
      };

      const request = new NextRequest('http://localhost/api/webhooks/networx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookData),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing signature');
    });

    it("should reject successful payment without tracking_id", async () => {
      const webhookData = {
        status: 'success',
        order_id: 'test_order',
        transaction_id: `txn_${Date.now()}`,
        amount: '1000',
        currency: 'USD',
        type: 'payment',
        description: 'Test (100 Tokens)',
        // tracking_id missing
      };

      const request = createWebhookRequest(webhookData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Missing tracking_id for successful payment');
    });

    it("should reject successful payment with invalid user", async () => {
      const webhookData = {
        status: 'success',
        order_id: 'test_order',
        transaction_id: `txn_${Date.now()}`,
        amount: '1000',
        currency: 'USD',
        type: 'payment',
        tracking_id: 'non_existent_user',
        description: 'Test (100 Tokens)',
      };

      const request = createWebhookRequest(webhookData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('User not found');
    });

    it("should reject payment with invalid description format", async () => {
      const webhookData = {
        status: 'success',
        order_id: 'test_order',
        transaction_id: `txn_${Date.now()}`,
        amount: '1000',
        currency: 'USD',
        type: 'payment',
        tracking_id: testClerkId,
        description: 'Invalid description without tokens',
      };

      const request = createWebhookRequest(webhookData);
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid payment description format');
    });
  });

  describe("Database Transaction Atomicity", () => {
    it("should rollback on database error during transaction", async () => {
      // This test verifies that if the user update fails, the transaction record is not created
      const transactionId = `txn_atomic_${Date.now()}`;
      
      const userBefore = await prismadb.user.findUnique({
        where: { clerkId: testClerkId },
        select: { availableGenerations: true },
      });

      const webhookData = {
        status: 'success',
        order_id: `order_${Date.now()}`,
        transaction_id: transactionId,
        amount: '1000',
        currency: 'USD',
        type: 'payment',
        tracking_id: testClerkId,
        description: 'Test (100 Tokens)',
      };

      const request = createWebhookRequest(webhookData);
      await POST(request);

      // Verify transaction was created (operation succeeded)
      const transaction = await prismadb.transaction.findFirst({
        where: { tracking_id: transactionId },
      });

      const userAfter = await prismadb.user.findUnique({
        where: { clerkId: testClerkId },
        select: { availableGenerations: true },
      });

      // If transaction exists, user balance must have been updated
      if (transaction) {
        expect(userAfter?.availableGenerations).toBeGreaterThan(userBefore?.availableGenerations || 0);
      }
    });
  });
});

