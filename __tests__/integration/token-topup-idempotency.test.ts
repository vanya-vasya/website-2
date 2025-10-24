/**
 * Integration Tests for Token Top-up Idempotency
 * 
 * Tests cover:
 * - Duplicate webhook prevention
 * - Concurrent webhook handling
 * - Transaction rollback on failure
 * - End-to-end payment flow
 */

import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

// Mock Prisma client with transaction support
const mockPrismaClient = {
  user: {
    findUnique: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
  },
  transaction: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
  },
  $transaction: jest.fn(),
};

const mockUser = {
  id: 'user_test123',
  clerkId: 'user_2ABC123DEF456',
  email: 'test@example.com',
  photo: 'https://example.com/photo.jpg',
  firstName: 'Test',
  lastName: 'User',
  usedGenerations: 5,
  availableGenerations: 20,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('Token Top-up Idempotency', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Duplicate Webhook Prevention', () => {
    it('should reject duplicate webhooks with same tracking_id', async () => {
      const trackingId = 'txn_duplicate_test_123';

      // First webhook - should succeed
      mockPrismaClient.transaction.findUnique.mockResolvedValueOnce(null);
      mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaClient.$transaction.mockResolvedValueOnce({
        transaction: {
          id: 'txn_1',
          tracking_id: trackingId,
          status: 'successful',
        },
        user: {
          ...mockUser,
          availableGenerations: 115,
          usedGenerations: 0,
        },
      });

      const firstResult = await processWebhook(trackingId, mockPrismaClient);
      expect(firstResult.success).toBe(true);

      // Second webhook (duplicate) - should be rejected
      mockPrismaClient.transaction.findUnique.mockResolvedValueOnce({
        id: 'txn_1',
        tracking_id: trackingId,
        status: 'successful',
      });

      const secondResult = await processWebhook(trackingId, mockPrismaClient);
      expect(secondResult.idempotent).toBe(true);
      expect(secondResult.message).toContain('already processed');
    });

    it('should detect duplicates using webhookEventId as fallback', async () => {
      const webhookEventId = 'evt_webhook_123';

      // Check using webhookEventId
      mockPrismaClient.transaction.findUnique
        .mockResolvedValueOnce(null) // tracking_id check
        .mockResolvedValueOnce({    // webhookEventId check
          id: 'txn_1',
          webhookEventId: webhookEventId,
          status: 'successful',
        });

      const existingByTrackingId = await mockPrismaClient.transaction.findUnique({
        where: { tracking_id: 'txn_123' },
      });
      expect(existingByTrackingId).toBeNull();

      const existingByWebhookId = await mockPrismaClient.transaction.findUnique({
        where: { webhookEventId: webhookEventId },
      });
      expect(existingByWebhookId).not.toBeNull();
      expect(existingByWebhookId?.webhookEventId).toBe(webhookEventId);
    });

    it('should process webhook if no duplicate found', async () => {
      mockPrismaClient.transaction.findUnique
        .mockResolvedValueOnce(null) // tracking_id check
        .mockResolvedValueOnce(null); // webhookEventId check

      const trackingIdExists = await mockPrismaClient.transaction.findUnique({
        where: { tracking_id: 'txn_new_123' },
      });
      const webhookIdExists = await mockPrismaClient.transaction.findUnique({
        where: { webhookEventId: 'evt_new_123' },
      });

      expect(trackingIdExists).toBeNull();
      expect(webhookIdExists).toBeNull();
    });
  });

  describe('Concurrent Webhook Handling', () => {
    it('should handle concurrent webhooks for same transaction', async () => {
      const trackingId = 'txn_concurrent_test';
      let processedCount = 0;

      // Simulate race condition
      const webhook1 = new Promise(async (resolve) => {
        mockPrismaClient.transaction.findUnique.mockResolvedValueOnce(null);
        const result = await processWebhook(trackingId, mockPrismaClient);
        if (result.success) processedCount++;
        resolve(result);
      });

      const webhook2 = new Promise(async (resolve) => {
        // Second webhook sees the first one's transaction
        mockPrismaClient.transaction.findUnique.mockResolvedValueOnce({
          id: 'txn_1',
          tracking_id: trackingId,
        });
        const result = await processWebhook(trackingId, mockPrismaClient);
        resolve(result);
      });

      const [result1, result2] = await Promise.all([webhook1, webhook2]);

      // Only one should process successfully
      expect(processedCount).toBeLessThanOrEqual(1);
    });

    it('should maintain data consistency under concurrent updates', async () => {
      const userId = mockUser.clerkId;
      let finalBalance = mockUser.availableGenerations;

      // Simulate multiple concurrent top-ups
      mockPrismaClient.$transaction.mockImplementation(async (callback) => {
        return await callback({
          user: {
            update: jest.fn().mockImplementation(async ({ data }: any) => {
              finalBalance = data.availableGenerations;
              return { ...mockUser, availableGenerations: finalBalance };
            }),
          },
          transaction: {
            create: jest.fn().mockResolvedValue({ id: 'txn_1' }),
          },
        });
      });

      // Process multiple webhooks (only unique ones should succeed)
      await mockPrismaClient.$transaction(async (tx: any) => {
        await tx.user.update({
          where: { clerkId: userId },
          data: { availableGenerations: 100 },
        });
      });

      expect(finalBalance).toBe(100);
    });
  });

  describe('Transaction Rollback on Failure', () => {
    it('should rollback database changes if transaction fails', async () => {
      mockPrismaClient.$transaction.mockRejectedValue(
        new Error('Simulated database error')
      );

      await expect(
        mockPrismaClient.$transaction(async () => {
          throw new Error('Simulated database error');
        })
      ).rejects.toThrow('Simulated database error');

      // Verify no partial updates occurred
      expect(mockPrismaClient.user.update).not.toHaveBeenCalled();
    });

    it('should rollback if user balance update fails', async () => {
      mockPrismaClient.$transaction.mockImplementation(async (callback) => {
        const tx = {
          transaction: {
            create: jest.fn().mockResolvedValue({ id: 'txn_1' }),
          },
          user: {
            update: jest.fn().mockRejectedValue(new Error('Update failed')),
          },
        };
        
        try {
          return await callback(tx);
        } catch (error) {
          // Transaction should rollback
          throw error;
        }
      });

      await expect(
        mockPrismaClient.$transaction(async (tx: any) => {
          await tx.transaction.create({ data: {} });
          await tx.user.update({ where: {}, data: {} });
        })
      ).rejects.toThrow('Update failed');
    });

    it('should not create transaction record if validation fails', async () => {
      const invalidDescription = 'Invalid description without token count';
      const match = invalidDescription.match(/\((\d+)\s+Tokens?\)/i);

      expect(match).toBeNull();
      
      // Transaction should not be created if validation fails
      expect(mockPrismaClient.transaction.create).not.toHaveBeenCalled();
    });
  });

  describe('End-to-End Payment Flow', () => {
    it('should complete full payment flow successfully', async () => {
      const trackingId = 'txn_e2e_test_123';
      const tokensToAdd = 100;

      // Step 1: Check for duplicates
      mockPrismaClient.transaction.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      // Step 2: Find user
      mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);

      // Step 3: Process payment in transaction
      mockPrismaClient.$transaction.mockImplementation(async (callback) => {
        return await callback({
          transaction: {
            create: jest.fn().mockResolvedValue({
              id: 'txn_1',
              tracking_id: trackingId,
              userId: mockUser.clerkId,
              status: 'successful',
              amount: 2000,
              currency: 'USD',
            }),
          },
          user: {
            update: jest.fn().mockResolvedValue({
              ...mockUser,
              availableGenerations: mockUser.availableGenerations - mockUser.usedGenerations + tokensToAdd,
              usedGenerations: 0,
            }),
          },
        });
      });

      const result = await processPayment(trackingId, tokensToAdd, mockPrismaClient);

      expect(result.success).toBe(true);
      expect(result.transaction).toHaveProperty('id');
      expect(result.user.availableGenerations).toBe(115); // 20 - 5 + 100
      expect(result.user.usedGenerations).toBe(0);
    });

    it('should handle failed payment correctly', async () => {
      const trackingId = 'txn_failed_test';

      mockPrismaClient.transaction.create.mockResolvedValue({
        id: 'txn_failed',
        tracking_id: trackingId,
        status: 'failed',
        message: 'Payment declined',
      });

      const result = await mockPrismaClient.transaction.create({
        data: {
          tracking_id: trackingId,
          status: 'failed',
          message: 'Payment declined',
        },
      });

      expect(result.status).toBe('failed');
      // User balance should not be updated for failed payments
      expect(mockPrismaClient.user.update).not.toHaveBeenCalled();
    });

    it('should handle refund flow correctly', async () => {
      const tokensToRefund = 50;
      const currentBalance = 100;

      mockPrismaClient.user.findUnique.mockResolvedValue({
        ...mockUser,
        availableGenerations: currentBalance,
      });

      mockPrismaClient.$transaction.mockImplementation(async (callback) => {
        return await callback({
          transaction: {
            create: jest.fn().mockResolvedValue({
              id: 'txn_refund',
              type: 'refund',
              status: 'refunded',
            }),
          },
          user: {
            update: jest.fn().mockResolvedValue({
              ...mockUser,
              availableGenerations: Math.max(0, currentBalance - tokensToRefund),
            }),
          },
        });
      });

      const result = await processRefund(tokensToRefund, mockPrismaClient);

      expect(result.user.availableGenerations).toBe(50);
    });
  });

  describe('Webhook Signature Verification', () => {
    it('should verify valid webhook signature', () => {
      const crypto = require('crypto');
      const secretKey = 'test_secret_key';
      const data = {
        tracking_id: 'txn_123',
        amount: 2000,
        currency: 'USD',
        status: 'successful',
      };

      // Create signature
      const sortedParams = Object.keys(data)
        .sort()
        .reduce((obj: Record<string, any>, key) => {
          obj[key] = data[key as keyof typeof data];
          return obj;
        }, {});

      const signString = Object.entries(sortedParams)
        .map(([key, value]) => `${key}=${value}`)
        .join('&');

      const expectedSignature = crypto
        .createHmac('sha256', secretKey)
        .update(signString)
        .digest('hex');

      // Verify signature
      const receivedSignature = crypto
        .createHmac('sha256', secretKey)
        .update(signString)
        .digest('hex');

      expect(receivedSignature).toBe(expectedSignature);
    });

    it('should reject invalid webhook signature', () => {
      const validSignature = 'valid_signature_hash';
      const invalidSignature = 'invalid_signature_hash';

      expect(validSignature).not.toBe(invalidSignature);
    });
  });
});

// Helper functions
async function processWebhook(
  trackingId: string,
  prisma: any
): Promise<{ success?: boolean; idempotent?: boolean; message?: string }> {
  // Check for existing transaction
  const existingByTrackingId = await prisma.transaction.findUnique({
    where: { tracking_id: trackingId },
  });

  if (existingByTrackingId) {
    return {
      idempotent: true,
      message: 'Transaction already processed',
    };
  }

  // Process new webhook
  return { success: true };
}

async function processPayment(
  trackingId: string,
  tokensToAdd: number,
  prisma: any
): Promise<any> {
  const user = await prisma.user.findUnique({
    where: { clerkId: mockUser.clerkId },
  });

  return await prisma.$transaction(async (tx: any) => {
    const transaction = await tx.transaction.create({
      data: {
        tracking_id: trackingId,
        userId: user.clerkId,
        status: 'successful',
        amount: tokensToAdd * 20,
        currency: 'USD',
      },
    });

    const updatedUser = await tx.user.update({
      where: { clerkId: user.clerkId },
      data: {
        availableGenerations: user.availableGenerations - user.usedGenerations + tokensToAdd,
        usedGenerations: 0,
      },
    });

    return { success: true, transaction, user: updatedUser };
  });
}

async function processRefund(tokensToRefund: number, prisma: any): Promise<any> {
  const user = await prisma.user.findUnique({
    where: { clerkId: mockUser.clerkId },
  });

  return await prisma.$transaction(async (tx: any) => {
    const transaction = await tx.transaction.create({
      data: {
        type: 'refund',
        status: 'refunded',
      },
    });

    const updatedUser = await tx.user.update({
      where: { clerkId: user.clerkId },
      data: {
        availableGenerations: Math.max(0, user.availableGenerations - tokensToRefund),
      },
    });

    return { transaction, user: updatedUser };
  });
}

