/**
 * Unit Tests for Balance Verification API
 * 
 * These tests verify:
 * - API endpoint behavior
 * - Parameter validation
 * - Response structure
 * - Error handling
 */

import { GET } from "@/app/api/payment/verify-balance/route";
import prismadb from "@/lib/prismadb";
import { NextRequest } from "next/server";

// Mock Clerk auth
jest.mock("@clerk/nextjs/server", () => ({
  auth: jest.fn(),
}));

// Mock Prisma
jest.mock("@/lib/prismadb", () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
    },
    transaction: {
      findFirst: jest.fn(),
    },
  },
}));

const { auth } = require("@clerk/nextjs/server");

describe("Balance Verification API Unit Tests", () => {
  const mockUserId = "test_user_123";
  const mockTransactionId = "txn_test_456";

  beforeEach(() => {
    jest.clearAllMocks();
    auth.mockReturnValue({ userId: mockUserId });
  });

  describe("Authentication", () => {
    it("should return 401 when user is not authenticated", async () => {
      auth.mockReturnValue({ userId: null });

      const request = new NextRequest(
        "http://localhost/api/payment/verify-balance"
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    it("should proceed when user is authenticated", async () => {
      auth.mockReturnValue({ userId: mockUserId });

      (prismadb.user.findUnique as jest.Mock).mockResolvedValue({
        clerkId: mockUserId,
        availableGenerations: 50,
        usedGenerations: 0,
      });

      const request = new NextRequest(
        "http://localhost/api/payment/verify-balance"
      );

      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(prismadb.user.findUnique).toHaveBeenCalledWith({
        where: { clerkId: mockUserId },
        select: {
          availableGenerations: true,
          usedGenerations: true,
        },
      });
    });
  });

  describe("User Lookup", () => {
    it("should return 404 when user not found", async () => {
      (prismadb.user.findUnique as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest(
        "http://localhost/api/payment/verify-balance"
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("User not found");
      expect(data.balanceUpdated).toBe(false);
    });

    it("should return user balance when user found", async () => {
      (prismadb.user.findUnique as jest.Mock).mockResolvedValue({
        clerkId: mockUserId,
        availableGenerations: 100,
        usedGenerations: 10,
      });

      const request = new NextRequest(
        "http://localhost/api/payment/verify-balance"
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.currentBalance).toBe(100);
    });
  });

  describe("Transaction Verification", () => {
    beforeEach(() => {
      (prismadb.user.findUnique as jest.Mock).mockResolvedValue({
        clerkId: mockUserId,
        availableGenerations: 150,
        usedGenerations: 0,
      });
    });

    it("should verify transaction when transactionId provided and found", async () => {
      const mockTransaction = {
        id: "trans_123",
        amount: "20.00",
        status: "successful",
        paid_at: new Date("2024-01-01"),
      };

      (prismadb.transaction.findFirst as jest.Mock).mockResolvedValue(
        mockTransaction
      );

      const request = new NextRequest(
        `http://localhost/api/payment/verify-balance?transactionId=${mockTransactionId}`
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.balanceUpdated).toBe(true);
      expect(data.transaction).toBeDefined();
      expect(data.transaction.id).toBe(mockTransaction.id);
      expect(data.transaction.status).toBe("successful");

      expect(prismadb.transaction.findFirst).toHaveBeenCalledWith({
        where: {
          userId: mockUserId,
          tracking_id: mockTransactionId,
          status: "successful",
        },
      });
    });

    it("should return balanceUpdated false when transaction not found", async () => {
      (prismadb.transaction.findFirst as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest(
        `http://localhost/api/payment/verify-balance?transactionId=${mockTransactionId}`
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.balanceUpdated).toBe(false);
      expect(data.transaction).toBeUndefined();
    });
  });

  describe("Expected Balance Verification", () => {
    it("should verify balance meets expected minimum", async () => {
      (prismadb.user.findUnique as jest.Mock).mockResolvedValue({
        clerkId: mockUserId,
        availableGenerations: 200,
        usedGenerations: 0,
      });

      const request = new NextRequest(
        "http://localhost/api/payment/verify-balance?expectedMinBalance=150"
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.balanceUpdated).toBe(true);
      expect(data.currentBalance).toBe(200);
      expect(data.expectedMinBalance).toBe(150);
    });

    it("should return false when balance below expected minimum", async () => {
      (prismadb.user.findUnique as jest.Mock).mockResolvedValue({
        clerkId: mockUserId,
        availableGenerations: 50,
        usedGenerations: 0,
      });

      const request = new NextRequest(
        "http://localhost/api/payment/verify-balance?expectedMinBalance=100"
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.balanceUpdated).toBe(false);
      expect(data.currentBalance).toBe(50);
      expect(data.expectedMinBalance).toBe(100);
    });

    it("should handle invalid expectedMinBalance gracefully", async () => {
      (prismadb.user.findUnique as jest.Mock).mockResolvedValue({
        clerkId: mockUserId,
        availableGenerations: 100,
        usedGenerations: 0,
      });

      const request = new NextRequest(
        "http://localhost/api/payment/verify-balance?expectedMinBalance=invalid"
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      // NaN comparison will fail, so balanceUpdated should be false
      expect(data.balanceUpdated).toBe(false);
    });
  });

  describe("Response Structure", () => {
    beforeEach(() => {
      (prismadb.user.findUnique as jest.Mock).mockResolvedValue({
        clerkId: mockUserId,
        availableGenerations: 75,
        usedGenerations: 5,
      });
    });

    it("should return correct structure for basic request", async () => {
      const request = new NextRequest(
        "http://localhost/api/payment/verify-balance"
      );

      const response = await GET(request);
      const data = await response.json();

      expect(data).toHaveProperty("success");
      expect(data).toHaveProperty("balanceUpdated");
      expect(data).toHaveProperty("currentBalance");
      expect(data.success).toBe(true);
      expect(data.currentBalance).toBe(75);
    });

    it("should include transaction data when found", async () => {
      const mockTransaction = {
        id: "trans_123",
        amount: "15.00",
        status: "successful",
        paid_at: new Date("2024-01-01"),
      };

      (prismadb.transaction.findFirst as jest.Mock).mockResolvedValue(
        mockTransaction
      );

      const request = new NextRequest(
        `http://localhost/api/payment/verify-balance?transactionId=${mockTransactionId}`
      );

      const response = await GET(request);
      const data = await response.json();

      expect(data.transaction).toBeDefined();
      expect(data.transaction).toHaveProperty("id");
      expect(data.transaction).toHaveProperty("amount");
      expect(data.transaction).toHaveProperty("status");
      expect(data.transaction).toHaveProperty("paid_at");
    });

    it("should include expectedMinBalance in response when provided", async () => {
      const request = new NextRequest(
        "http://localhost/api/payment/verify-balance?expectedMinBalance=50"
      );

      const response = await GET(request);
      const data = await response.json();

      expect(data).toHaveProperty("expectedMinBalance");
      expect(data.expectedMinBalance).toBe(50);
    });
  });

  describe("Error Handling", () => {
    it("should return 500 when database error occurs", async () => {
      (prismadb.user.findUnique as jest.Mock).mockRejectedValue(
        new Error("Database connection failed")
      );

      const request = new NextRequest(
        "http://localhost/api/payment/verify-balance"
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Internal server error");
      expect(data.details).toBe("Database connection failed");
    });

    it("should handle transaction lookup errors gracefully", async () => {
      (prismadb.user.findUnique as jest.Mock).mockResolvedValue({
        clerkId: mockUserId,
        availableGenerations: 100,
        usedGenerations: 0,
      });

      (prismadb.transaction.findFirst as jest.Mock).mockRejectedValue(
        new Error("Transaction query failed")
      );

      const request = new NextRequest(
        `http://localhost/api/payment/verify-balance?transactionId=${mockTransactionId}`
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Internal server error");
    });

    it("should handle unknown errors gracefully", async () => {
      (prismadb.user.findUnique as jest.Mock).mockRejectedValue(
        "Unknown error string"
      );

      const request = new NextRequest(
        "http://localhost/api/payment/verify-balance"
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Internal server error");
      expect(data.details).toBe("Unknown error");
    });
  });

  describe("URL Parameter Parsing", () => {
    beforeEach(() => {
      (prismadb.user.findUnique as jest.Mock).mockResolvedValue({
        clerkId: mockUserId,
        availableGenerations: 100,
        usedGenerations: 0,
      });
    });

    it("should handle empty query parameters", async () => {
      const request = new NextRequest(
        "http://localhost/api/payment/verify-balance?"
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.balanceUpdated).toBe(false);
    });

    it("should handle multiple query parameters", async () => {
      (prismadb.transaction.findFirst as jest.Mock).mockResolvedValue({
        id: "trans_123",
        amount: "10.00",
        status: "successful",
        paid_at: new Date(),
      });

      const request = new NextRequest(
        `http://localhost/api/payment/verify-balance?transactionId=${mockTransactionId}&expectedMinBalance=50`
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      // Transaction verification takes precedence
      expect(data.balanceUpdated).toBe(true);
      expect(data.transaction).toBeDefined();
    });

    it("should handle URL-encoded parameters", async () => {
      const encodedTransactionId = encodeURIComponent("txn_test_123");

      (prismadb.transaction.findFirst as jest.Mock).mockResolvedValue({
        id: "trans_123",
        amount: "10.00",
        status: "successful",
        paid_at: new Date(),
      });

      const request = new NextRequest(
        `http://localhost/api/payment/verify-balance?transactionId=${encodedTransactionId}`
      );

      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(prismadb.transaction.findFirst).toHaveBeenCalled();
    });
  });
});

