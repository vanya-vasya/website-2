/**
 * Integration Tests for Payment Redirect Flow
 * 
 * These tests verify:
 * - Balance verification after payment
 * - Automatic redirect to dashboard after successful payment
 * - Polling mechanism for balance updates
 * - Proper error handling
 */

import { GET } from "@/app/api/payment/verify-balance/route";
import prismadb from "@/lib/prismadb";
import { NextRequest } from "next/server";

// Mock Clerk auth
jest.mock("@clerk/nextjs/server", () => ({
  auth: jest.fn(),
}));

const { auth } = require("@clerk/nextjs/server");

describe("Payment Redirect Integration Tests", () => {
  const testClerkId = `test_payment_user_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const testEmail = `payment-test-${Date.now()}@example.com`;
  const testTransactionId = `txn_test_${Date.now()}`;

  beforeAll(() => {
    // Mock auth to return test user ID
    auth.mockReturnValue({ userId: testClerkId });
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
    await cleanupTestData();
  });

  describe("Balance Verification", () => {
    it("should verify balance has been updated after payment", async () => {
      // Create test user with initial balance
      await prismadb.user.create({
        data: {
          clerkId: testClerkId,
          email: testEmail,
          photo: "https://example.com/test.jpg",
          firstName: "Payment",
          lastName: "Test",
          availableGenerations: 50,
          usedGenerations: 0,
        },
      });

      // Create successful transaction
      await prismadb.transaction.create({
        data: {
          tracking_id: testTransactionId,
          userId: testClerkId,
          status: "successful",
          amount: "10.00",
          currency: "USD",
          description: "Test payment (100 Tokens)",
          type: "payment",
          payment_method_type: "card",
          message: "Payment successful",
        },
      });

      const request = new NextRequest(
        `http://localhost/api/payment/verify-balance?transactionId=${testTransactionId}`
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.balanceUpdated).toBe(true);
      expect(data.currentBalance).toBe(50);
      expect(data.transaction).toBeDefined();
      expect(data.transaction.status).toBe("successful");
    });

    it("should return balanceUpdated false when transaction not found", async () => {
      // Create test user
      await prismadb.user.create({
        data: {
          clerkId: testClerkId,
          email: testEmail,
          photo: "https://example.com/test.jpg",
          firstName: "Payment",
          lastName: "Test",
          availableGenerations: 20,
          usedGenerations: 0,
        },
      });

      const request = new NextRequest(
        `http://localhost/api/payment/verify-balance?transactionId=non_existent_txn`
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.balanceUpdated).toBe(false);
      expect(data.currentBalance).toBe(20);
    });

    it("should verify balance meets expected minimum", async () => {
      // Create test user with specific balance
      await prismadb.user.create({
        data: {
          clerkId: testClerkId,
          email: testEmail,
          photo: "https://example.com/test.jpg",
          firstName: "Payment",
          lastName: "Test",
          availableGenerations: 150,
          usedGenerations: 0,
        },
      });

      const request = new NextRequest(
        `http://localhost/api/payment/verify-balance?expectedMinBalance=100`
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.balanceUpdated).toBe(true);
      expect(data.currentBalance).toBe(150);
      expect(data.expectedMinBalance).toBe(100);
    });

    it("should return false when balance below expected minimum", async () => {
      // Create test user with low balance
      await prismadb.user.create({
        data: {
          clerkId: testClerkId,
          email: testEmail,
          photo: "https://example.com/test.jpg",
          firstName: "Payment",
          lastName: "Test",
          availableGenerations: 50,
          usedGenerations: 0,
        },
      });

      const request = new NextRequest(
        `http://localhost/api/payment/verify-balance?expectedMinBalance=100`
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.balanceUpdated).toBe(false);
      expect(data.currentBalance).toBe(50);
      expect(data.expectedMinBalance).toBe(100);
    });

    it("should return current balance only when no parameters provided", async () => {
      // Create test user
      await prismadb.user.create({
        data: {
          clerkId: testClerkId,
          email: testEmail,
          photo: "https://example.com/test.jpg",
          firstName: "Payment",
          lastName: "Test",
          availableGenerations: 75,
          usedGenerations: 0,
        },
      });

      const request = new NextRequest(
        `http://localhost/api/payment/verify-balance`
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.balanceUpdated).toBe(false);
      expect(data.currentBalance).toBe(75);
    });

    it("should return 401 when user is not authenticated", async () => {
      // Mock auth to return no user
      auth.mockReturnValueOnce({ userId: null });

      const request = new NextRequest(
        `http://localhost/api/payment/verify-balance`
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    it("should return 404 when user not found in database", async () => {
      // Auth returns userId but user doesn't exist in DB
      auth.mockReturnValueOnce({ userId: "non_existent_user" });

      const request = new NextRequest(
        `http://localhost/api/payment/verify-balance`
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("User not found");
      expect(data.balanceUpdated).toBe(false);
    });
  });

  describe("Transaction Verification", () => {
    it("should find transaction by tracking_id matching userId", async () => {
      // Create test user
      await prismadb.user.create({
        data: {
          clerkId: testClerkId,
          email: testEmail,
          photo: "https://example.com/test.jpg",
          firstName: "Payment",
          lastName: "Test",
          availableGenerations: 120,
          usedGenerations: 0,
        },
      });

      // Create transaction with userId as tracking_id (new flow)
      await prismadb.transaction.create({
        data: {
          tracking_id: testClerkId, // userId is now tracking_id
          userId: testClerkId,
          status: "successful",
          amount: "25.00",
          currency: "EUR",
          description: "Test payment (250 Tokens)",
          type: "payment",
          payment_method_type: "card",
          message: "Payment successful",
        },
      });

      const request = new NextRequest(
        `http://localhost/api/payment/verify-balance?transactionId=${testClerkId}`
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.balanceUpdated).toBe(true);
      expect(data.transaction).toBeDefined();
      expect(data.transaction.status).toBe("successful");
      expect(data.transaction.amount).toBe("25.00");
    });

    it("should not verify balance when transaction status is not successful", async () => {
      // Create test user
      await prismadb.user.create({
        data: {
          clerkId: testClerkId,
          email: testEmail,
          photo: "https://example.com/test.jpg",
          firstName: "Payment",
          lastName: "Test",
          availableGenerations: 50,
          usedGenerations: 0,
        },
      });

      // Create failed transaction
      await prismadb.transaction.create({
        data: {
          tracking_id: testTransactionId,
          userId: testClerkId,
          status: "failed",
          amount: "10.00",
          currency: "USD",
          description: "Test payment (100 Tokens)",
          type: "payment",
          payment_method_type: "card",
          message: "Payment failed",
        },
      });

      const request = new NextRequest(
        `http://localhost/api/payment/verify-balance?transactionId=${testTransactionId}`
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.balanceUpdated).toBe(false);
      expect(data.transaction).toBeUndefined();
    });
  });

  describe("Polling Behavior Simulation", () => {
    it("should handle repeated polling requests efficiently", async () => {
      // Create test user
      await prismadb.user.create({
        data: {
          clerkId: testClerkId,
          email: testEmail,
          photo: "https://example.com/test.jpg",
          firstName: "Payment",
          lastName: "Test",
          availableGenerations: 20,
          usedGenerations: 0,
        },
      });

      // Simulate polling before transaction is created
      const request1 = new NextRequest(
        `http://localhost/api/payment/verify-balance?transactionId=${testTransactionId}`
      );

      const response1 = await GET(request1);
      const data1 = await response1.json();

      expect(data1.balanceUpdated).toBe(false);

      // Create transaction (simulating webhook completion)
      await prismadb.user.update({
        where: { clerkId: testClerkId },
        data: { availableGenerations: 120 },
      });

      await prismadb.transaction.create({
        data: {
          tracking_id: testTransactionId,
          userId: testClerkId,
          status: "successful",
          amount: "10.00",
          currency: "USD",
          description: "Test payment (100 Tokens)",
          type: "payment",
          payment_method_type: "card",
          message: "Payment successful",
        },
      });

      // Poll again after transaction is created
      const request2 = new NextRequest(
        `http://localhost/api/payment/verify-balance?transactionId=${testTransactionId}`
      );

      const response2 = await GET(request2);
      const data2 = await response2.json();

      expect(data2.balanceUpdated).toBe(true);
      expect(data2.currentBalance).toBe(120);
    });
  });
});

