/**
 * Integration Tests for Clerk Webhook Handler
 * 
 * These tests use a real database connection to verify:
 * - Atomic transactions work correctly
 * - Data integrity is maintained
 * - Rollback happens on failures
 * 
 * Setup: Configure TEST_DATABASE_URL in .env.test
 */

import { POST } from "@/app/api/webhooks/clerk/route";
import prismadb from "@/lib/prismadb";
import { Webhook } from "svix";
import { clerkClient } from "@clerk/nextjs/server";

// Mock external dependencies but use real DB
jest.mock("svix");
jest.mock("@clerk/nextjs/server", () => ({
  clerkClient: {
    users: {
      updateUserMetadata: jest.fn().mockResolvedValue({}),
    },
  },
}));

jest.mock("next/headers", () => ({
  headers: jest.fn(() => new Map([
    ["svix-id", "integration-test-svix-id"],
    ["svix-timestamp", "1234567890"],
    ["svix-signature", "test-signature"],
  ])),
}));

describe("Clerk Webhook Integration Tests", () => {
  const testClerkId = `test_user_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  const testEmail = `test-${Date.now()}@example.com`;
  const testSvixId = `svix_test_${Date.now()}`;

  const mockWebhookPayload = {
    data: {
      id: testClerkId,
      email_addresses: [{ email_address: testEmail }],
      image_url: "https://example.com/test.jpg",
      first_name: "Integration",
      last_name: "Test",
    },
    type: "user.created",
  };

  beforeAll(() => {
    process.env.WEBHOOK_SECRET = "integration-test-secret";
    
    // Mock Svix verification
    (Webhook as jest.MockedClass<typeof Webhook>).mockImplementation(() => ({
      verify: jest.fn().mockReturnValue(mockWebhookPayload),
    } as any));
  });

  afterAll(async () => {
    // Cleanup test data
    await cleanupTestData();
    await prismadb.$disconnect();
  });

  const cleanupTestData = async () => {
    try {
      // Delete in order to respect foreign key constraints
      await prismadb.transaction.deleteMany({
        where: { tracking_id: testClerkId },
      });
      await prismadb.webhookEvent.deleteMany({
        where: { eventId: testSvixId },
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

  describe("Successful Flow", () => {
    it("should create user, transaction, and webhook event atomically", async () => {
      // Override mock headers for this test
      jest.spyOn(require("next/headers"), "headers").mockReturnValue(
        new Map([
          ["svix-id", testSvixId],
          ["svix-timestamp", "1234567890"],
          ["svix-signature", "test-signature"],
        ])
      );

      const request = new Request("http://localhost/api/webhooks/clerk", {
        method: "POST",
        body: JSON.stringify(mockWebhookPayload),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe("OK");

      // Verify user was created with correct credits
      const user = await prismadb.user.findUnique({
        where: { clerkId: testClerkId },
      });
      expect(user).toBeDefined();
      expect(user!.email).toBe(testEmail);
      expect(user!.availableGenerations).toBe(20);
      expect(user!.usedGenerations).toBe(0);

      // Verify transaction was created
      const transactions = await prismadb.transaction.findMany({
        where: { tracking_id: testClerkId },
      });
      expect(transactions).toHaveLength(1);
      expect(transactions[0].amount).toBe(20);
      expect(transactions[0].type).toBe("credit");
      expect(transactions[0].reason).toBe("signup bonus");
      expect(transactions[0].status).toBe("completed");
      expect(transactions[0].webhookEventId).toBe(testSvixId);

      // Verify webhook event was marked as processed
      const webhookEvent = await prismadb.webhookEvent.findUnique({
        where: { eventId: testSvixId },
      });
      expect(webhookEvent).toBeDefined();
      expect(webhookEvent!.processed).toBe(true);
      expect(webhookEvent!.processedAt).toBeDefined();
    });
  });

  describe("Idempotency in Real DB", () => {
    it("should not create duplicate records on repeated webhook", async () => {
      jest.spyOn(require("next/headers"), "headers").mockReturnValue(
        new Map([
          ["svix-id", testSvixId],
          ["svix-timestamp", "1234567890"],
          ["svix-signature", "test-signature"],
        ])
      );

      const request1 = new Request("http://localhost/api/webhooks/clerk", {
        method: "POST",
        body: JSON.stringify(mockWebhookPayload),
      });

      // First request
      const response1 = await POST(request1);
      expect(response1.status).toBe(200);

      // Get initial counts
      const userCountAfterFirst = await prismadb.user.count({
        where: { clerkId: testClerkId },
      });
      const txnCountAfterFirst = await prismadb.transaction.count({
        where: { tracking_id: testClerkId },
      });

      expect(userCountAfterFirst).toBe(1);
      expect(txnCountAfterFirst).toBe(1);

      // Second request with same webhook ID
      const request2 = new Request("http://localhost/api/webhooks/clerk", {
        method: "POST",
        body: JSON.stringify(mockWebhookPayload),
      });

      const response2 = await POST(request2);
      const data2 = await response2.json();

      expect(response2.status).toBe(200);
      expect(data2.idempotent).toBe(true);

      // Verify counts haven't changed
      const userCountAfterSecond = await prismadb.user.count({
        where: { clerkId: testClerkId },
      });
      const txnCountAfterSecond = await prismadb.transaction.count({
        where: { tracking_id: testClerkId },
      });

      expect(userCountAfterSecond).toBe(1);
      expect(txnCountAfterSecond).toBe(1);

      // Verify user still has only 20 credits
      const user = await prismadb.user.findUnique({
        where: { clerkId: testClerkId },
      });
      expect(user!.availableGenerations).toBe(20);
    });
  });

  describe("Transaction Rollback on Failure", () => {
    it("should rollback entire transaction on failure", async () => {
      // This test simulates a failure by temporarily breaking the DB constraint
      // We'll try to create a user with a duplicate clerkId after one already exists
      
      // First, create a user manually
      await prismadb.user.create({
        data: {
          clerkId: testClerkId,
          email: testEmail,
          photo: "https://example.com/test.jpg",
          firstName: "Existing",
          lastName: "User",
          availableGenerations: 20,
        },
      });

      // Now try to process webhook for the same user with different svix ID
      const differentSvixId = `${testSvixId}_different`;
      jest.spyOn(require("next/headers"), "headers").mockReturnValue(
        new Map([
          ["svix-id", differentSvixId],
          ["svix-timestamp", "1234567890"],
          ["svix-signature", "test-signature"],
        ])
      );

      const request = new Request("http://localhost/api/webhooks/clerk", {
        method: "POST",
        body: JSON.stringify(mockWebhookPayload),
      });

      const response = await POST(request);
      expect(response.status).toBe(500);

      // Verify webhook event was NOT created (rollback happened)
      const webhookEvent = await prismadb.webhookEvent.findUnique({
        where: { eventId: differentSvixId },
      });
      expect(webhookEvent).toBeNull();

      // Verify no transaction record was created
      const transactions = await prismadb.transaction.findMany({
        where: { 
          tracking_id: testClerkId,
          webhookEventId: differentSvixId,
        },
      });
      expect(transactions).toHaveLength(0);

      // Original user should still exist with original credits
      const user = await prismadb.user.findUnique({
        where: { clerkId: testClerkId },
      });
      expect(user!.availableGenerations).toBe(20);
    });
  });

  describe("Concurrent Webhook Processing", () => {
    it("should handle concurrent webhooks gracefully", async () => {
      const uniqueSvixId = `${testSvixId}_concurrent`;
      
      jest.spyOn(require("next/headers"), "headers").mockReturnValue(
        new Map([
          ["svix-id", uniqueSvixId],
          ["svix-timestamp", "1234567890"],
          ["svix-signature", "test-signature"],
        ])
      );

      // Simulate concurrent webhook delivery
      const request1 = new Request("http://localhost/api/webhooks/clerk", {
        method: "POST",
        body: JSON.stringify(mockWebhookPayload),
      });

      const request2 = new Request("http://localhost/api/webhooks/clerk", {
        method: "POST",
        body: JSON.stringify(mockWebhookPayload),
      });

      // Fire both requests simultaneously
      const [response1, response2] = await Promise.all([
        POST(request1),
        POST(request2),
      ]);

      // One should succeed, one should be caught by idempotency
      const data1 = await response1.json();
      const data2 = await response2.json();

      const successCount = [data1, data2].filter(d => d.message === "OK").length;
      const idempotentCount = [data1, data2].filter(d => d.idempotent).length;

      // At least one should succeed, at least one should be idempotent
      expect(successCount + idempotentCount).toBe(2);

      // Verify only one user and one transaction were created
      const userCount = await prismadb.user.count({
        where: { clerkId: testClerkId },
      });
      const txnCount = await prismadb.transaction.count({
        where: { tracking_id: testClerkId },
      });

      expect(userCount).toBe(1);
      expect(txnCount).toBe(1);
    });
  });
});

