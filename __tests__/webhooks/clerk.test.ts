/**
 * Clerk Webhook Handler Tests
 * 
 * Tests cover:
 * 1. Successful user creation with 20 credits
 * 2. Transaction record creation for signup bonus
 * 3. Idempotency - duplicate webhooks don't double-credit
 * 4. DB failure rollback - atomic transaction behavior
 */

import { POST } from "@/app/api/webhooks/clerk/route";
import prismadb from "@/lib/prismadb";
import { Webhook } from "svix";
import { clerkClient } from "@clerk/nextjs/server";

// Mock dependencies
jest.mock("@/lib/prismadb", () => ({
  __esModule: true,
  default: {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    transaction: {
      create: jest.fn(),
    },
    webhookEvent: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  },
}));

jest.mock("svix");
jest.mock("@clerk/nextjs/server", () => ({
  clerkClient: {
    users: {
      updateUserMetadata: jest.fn(),
    },
  },
}));

jest.mock("next/headers", () => ({
  headers: jest.fn(() => new Map([
    ["svix-id", "test-svix-id"],
    ["svix-timestamp", "1234567890"],
    ["svix-signature", "test-signature"],
  ])),
}));

describe("Clerk Webhook - user.created", () => {
  const mockClerkUserId = "user_test123";
  const mockSvixId = "test-svix-id";
  const mockEmail = "test@example.com";
  
  const mockWebhookPayload = {
    data: {
      id: mockClerkUserId,
      email_addresses: [{ email_address: mockEmail }],
      image_url: "https://example.com/photo.jpg",
      first_name: "Test",
      last_name: "User",
    },
    type: "user.created",
  };

  const mockCreatedUser = {
    id: "db_user_123",
    clerkId: mockClerkUserId,
    email: mockEmail,
    photo: "https://example.com/photo.jpg",
    firstName: "Test",
    lastName: "User",
    availableGenerations: 20,
    usedGenerations: 0,
  };

  const mockTransaction = {
    id: "txn_123",
    tracking_id: mockClerkUserId,
    userId: "db_user_123",
    amount: 20,
    type: "credit",
    reason: "signup bonus",
    status: "completed",
    webhookEventId: mockSvixId,
    paid_at: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.WEBHOOK_SECRET = "test-webhook-secret";

    // Mock Svix verification to always succeed
    (Webhook as jest.MockedClass<typeof Webhook>).mockImplementation(() => ({
      verify: jest.fn().mockReturnValue(mockWebhookPayload),
    } as any));
  });

  afterEach(() => {
    delete process.env.WEBHOOK_SECRET;
  });

  describe("Successful User Creation", () => {
    it("should create user with 20 initial credits", async () => {
      // Mock no existing webhook event (first time processing)
      (prismadb.webhookEvent.findUnique as jest.Mock).mockResolvedValue(null);

      // Mock successful transaction
      (prismadb.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return callback({
          webhookEvent: {
            create: jest.fn().mockResolvedValue({}),
            update: jest.fn().mockResolvedValue({}),
          },
          user: {
            create: jest.fn().mockResolvedValue(mockCreatedUser),
          },
          transaction: {
            create: jest.fn().mockResolvedValue(mockTransaction),
          },
        });
      });

      const request = new Request("http://localhost/api/webhooks/clerk", {
        method: "POST",
        body: JSON.stringify(mockWebhookPayload),
        headers: {
          "svix-id": mockSvixId,
          "svix-timestamp": "1234567890",
          "svix-signature": "test-signature",
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe("OK");
      expect(data.user).toBeDefined();
      expect(data.transaction).toBeDefined();
      expect(clerkClient.users.updateUserMetadata).toHaveBeenCalledWith(
        mockClerkUserId,
        {
          publicMetadata: {
            userId: mockCreatedUser.id,
          },
        }
      );
    });

    it("should create transaction record for signup bonus", async () => {
      (prismadb.webhookEvent.findUnique as jest.Mock).mockResolvedValue(null);

      let capturedTransactionData: any = null;

      (prismadb.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return callback({
          webhookEvent: {
            create: jest.fn().mockResolvedValue({}),
            update: jest.fn().mockResolvedValue({}),
          },
          user: {
            create: jest.fn().mockResolvedValue(mockCreatedUser),
          },
          transaction: {
            create: jest.fn().mockImplementation((data) => {
              capturedTransactionData = data.data;
              return Promise.resolve(mockTransaction);
            }),
          },
        });
      });

      const request = new Request("http://localhost/api/webhooks/clerk", {
        method: "POST",
        body: JSON.stringify(mockWebhookPayload),
      });

      await POST(request);

      expect(capturedTransactionData).toMatchObject({
        tracking_id: mockClerkUserId,
        amount: 20,
        type: "credit",
        reason: "signup bonus",
        status: "completed",
      });
    });
  });

  describe("Idempotency", () => {
    it("should not double-credit on duplicate webhook", async () => {
      // Mock existing processed webhook event
      const processedEvent = {
        id: "event_123",
        eventId: mockSvixId,
        eventType: "user.created",
        processed: true,
        processedAt: new Date(),
      };

      (prismadb.webhookEvent.findUnique as jest.Mock).mockResolvedValue(processedEvent);
      (prismadb.user.findUnique as jest.Mock).mockResolvedValue(mockCreatedUser);

      const request = new Request("http://localhost/api/webhooks/clerk", {
        method: "POST",
        body: JSON.stringify(mockWebhookPayload),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.message).toBe("Already processed");
      expect(data.idempotent).toBe(true);
      expect(data.user).toEqual(mockCreatedUser);
      
      // Verify no new user or transaction was created
      expect(prismadb.$transaction).not.toHaveBeenCalled();
      expect(clerkClient.users.updateUserMetadata).not.toHaveBeenCalled();
    });

    it("should handle rapid duplicate webhooks correctly", async () => {
      // First call - no existing event
      (prismadb.webhookEvent.findUnique as jest.Mock)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({
          eventId: mockSvixId,
          processed: true,
        });

      (prismadb.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return callback({
          webhookEvent: {
            create: jest.fn().mockResolvedValue({}),
            update: jest.fn().mockResolvedValue({}),
          },
          user: {
            create: jest.fn().mockResolvedValue(mockCreatedUser),
          },
          transaction: {
            create: jest.fn().mockResolvedValue(mockTransaction),
          },
        });
      });

      const request1 = new Request("http://localhost/api/webhooks/clerk", {
        method: "POST",
        body: JSON.stringify(mockWebhookPayload),
      });

      const request2 = new Request("http://localhost/api/webhooks/clerk", {
        method: "POST",
        body: JSON.stringify(mockWebhookPayload),
      });

      // First request should succeed
      const response1 = await POST(request1);
      expect(response1.status).toBe(200);

      // Second request should be caught by idempotency check
      (prismadb.user.findUnique as jest.Mock).mockResolvedValue(mockCreatedUser);
      const response2 = await POST(request2);
      const data2 = await response2.json();
      
      expect(data2.idempotent).toBe(true);
    });
  });

  describe("Database Transaction Rollback", () => {
    it("should rollback on user creation failure", async () => {
      (prismadb.webhookEvent.findUnique as jest.Mock).mockResolvedValue(null);

      // Mock transaction failure during user creation
      (prismadb.$transaction as jest.Mock).mockRejectedValue(
        new Error("User creation failed")
      );

      const request = new Request("http://localhost/api/webhooks/clerk", {
        method: "POST",
        body: JSON.stringify(mockWebhookPayload),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.message).toBe("Error creating user");
      expect(data.error).toBe("User creation failed");
      
      // Clerk metadata should not be updated
      expect(clerkClient.users.updateUserMetadata).not.toHaveBeenCalled();
    });

    it("should rollback on transaction record creation failure", async () => {
      (prismadb.webhookEvent.findUnique as jest.Mock).mockResolvedValue(null);

      // Mock transaction failure during transaction record creation
      (prismadb.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return callback({
          webhookEvent: {
            create: jest.fn().mockResolvedValue({}),
            update: jest.fn().mockResolvedValue({}),
          },
          user: {
            create: jest.fn().mockResolvedValue(mockCreatedUser),
          },
          transaction: {
            create: jest.fn().mockRejectedValue(new Error("Transaction record failed")),
          },
        });
      });

      const request = new Request("http://localhost/api/webhooks/clerk", {
        method: "POST",
        body: JSON.stringify(mockWebhookPayload),
      });

      const response = await POST(request);
      
      expect(response.status).toBe(500);
      expect(clerkClient.users.updateUserMetadata).not.toHaveBeenCalled();
    });

    it("should allow retry after failed transaction", async () => {
      // First attempt - transaction fails
      (prismadb.webhookEvent.findUnique as jest.Mock).mockResolvedValueOnce(null);
      (prismadb.$transaction as jest.Mock).mockRejectedValueOnce(
        new Error("Database connection lost")
      );

      const request1 = new Request("http://localhost/api/webhooks/clerk", {
        method: "POST",
        body: JSON.stringify(mockWebhookPayload),
      });

      const response1 = await POST(request1);
      expect(response1.status).toBe(500);

      // Second attempt - should succeed (webhook event not marked as processed)
      (prismadb.webhookEvent.findUnique as jest.Mock).mockResolvedValueOnce(null);
      (prismadb.$transaction as jest.Mock).mockImplementation(async (callback) => {
        return callback({
          webhookEvent: {
            create: jest.fn().mockResolvedValue({}),
            update: jest.fn().mockResolvedValue({}),
          },
          user: {
            create: jest.fn().mockResolvedValue(mockCreatedUser),
          },
          transaction: {
            create: jest.fn().mockResolvedValue(mockTransaction),
          },
        });
      });

      const request2 = new Request("http://localhost/api/webhooks/clerk", {
        method: "POST",
        body: JSON.stringify(mockWebhookPayload),
      });

      const response2 = await POST(request2);
      expect(response2.status).toBe(200);
    });
  });

  describe("Edge Cases", () => {
    it("should handle missing webhook secret", async () => {
      delete process.env.WEBHOOK_SECRET;

      const request = new Request("http://localhost/api/webhooks/clerk", {
        method: "POST",
        body: JSON.stringify(mockWebhookPayload),
      });

      await expect(POST(request)).rejects.toThrow(
        "Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
      );
    });

    it("should handle missing svix headers", async () => {
      jest.spyOn(require("next/headers"), "headers").mockReturnValue(
        new Map([["svix-id", null]])
      );

      const request = new Request("http://localhost/api/webhooks/clerk", {
        method: "POST",
        body: JSON.stringify(mockWebhookPayload),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it("should handle invalid webhook signature", async () => {
      (Webhook as jest.MockedClass<typeof Webhook>).mockImplementation(() => ({
        verify: jest.fn().mockImplementation(() => {
          throw new Error("Invalid signature");
        }),
      } as any));

      const request = new Request("http://localhost/api/webhooks/clerk", {
        method: "POST",
        body: JSON.stringify(mockWebhookPayload),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });
  });
});

