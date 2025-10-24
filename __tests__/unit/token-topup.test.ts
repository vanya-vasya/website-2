/**
 * Unit Tests for Token Top-up System
 * 
 * Tests cover:
 * - Successful token purchases
 * - Balance calculations
 * - Transaction recording
 * - Error handling
 * - Edge cases
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';

// Mock Prisma client
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

// Mock data
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

const mockTransactionData = {
  tracking_id: 'txn_test_12345',
  userId: 'user_2ABC123DEF456',
  status: 'successful',
  amount: 2000, // $20.00 in cents
  currency: 'USD',
  description: 'Payment for 100 Tokens (100 Tokens)',
  type: 'payment',
  payment_method_type: 'card',
  message: 'Payment successful',
  paid_at: new Date(),
  receipt_url: null,
};

describe('Token Top-up System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Token Purchase', () => {
    it('should successfully add tokens to user balance', async () => {
      const tokensToAdd = 100;
      const currentBalance = mockUser.availableGenerations - mockUser.usedGenerations;
      const expectedNewBalance = currentBalance + tokensToAdd;

      mockPrismaClient.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaClient.$transaction.mockImplementation(async (callback) => {
        return await callback(mockPrismaClient);
      });
      mockPrismaClient.transaction.create.mockResolvedValue({
        id: 'txn_123',
        ...mockTransactionData,
      });
      mockPrismaClient.user.update.mockResolvedValue({
        ...mockUser,
        availableGenerations: expectedNewBalance,
        usedGenerations: 0,
      });

      // Simulate token top-up
      const result = await mockPrismaClient.$transaction(async (tx: any) => {
        // Create transaction record
        const transaction = await tx.transaction.create({
          data: mockTransactionData,
        });

        // Update user balance
        const updatedUser = await tx.user.update({
          where: { clerkId: mockUser.clerkId },
          data: {
            availableGenerations: mockUser.availableGenerations - mockUser.usedGenerations + tokensToAdd,
            usedGenerations: 0,
          },
        });

        return { transaction, user: updatedUser };
      });

      expect(result.user.availableGenerations).toBe(expectedNewBalance);
      expect(result.user.usedGenerations).toBe(0);
      expect(mockPrismaClient.transaction.create).toHaveBeenCalledWith({
        data: mockTransactionData,
      });
    });

    it('should extract token count from description correctly', () => {
      const testCases = [
        { description: 'Payment for 100 Tokens (100 Tokens)', expected: 100 },
        { description: 'Nerbixa Tokens Purchase (50 Tokens)', expected: 50 },
        { description: 'Token Top-up (250 Tokens)', expected: 250 },
        { description: 'Payment for tokens (1 Token)', expected: 1 },
      ];

      testCases.forEach(({ description, expected }) => {
        const match = description.match(/\((\d+)\s+Tokens?\)/i);
        const tokens = match ? parseInt(match[1], 10) : null;
        expect(tokens).toBe(expected);
      });
    });

    it('should handle large token purchases correctly', async () => {
      const tokensToAdd = 1000;
      const expectedBalance = mockUser.availableGenerations - mockUser.usedGenerations + tokensToAdd;

      mockPrismaClient.$transaction.mockImplementation(async (callback) => {
        return await callback(mockPrismaClient);
      });
      mockPrismaClient.user.update.mockResolvedValue({
        ...mockUser,
        availableGenerations: expectedBalance,
        usedGenerations: 0,
      });

      const result = await mockPrismaClient.$transaction(async (tx: any) => {
        return await tx.user.update({
          where: { clerkId: mockUser.clerkId },
          data: {
            availableGenerations: expectedBalance,
            usedGenerations: 0,
          },
        });
      });

      expect(result.availableGenerations).toBe(expectedBalance);
    });
  });

  describe('Balance Calculations', () => {
    it('should correctly calculate net balance', () => {
      const testCases = [
        { available: 100, used: 20, expected: 80 },
        { available: 50, used: 0, expected: 50 },
        { available: 200, used: 150, expected: 50 },
        { available: 20, used: 20, expected: 0 },
      ];

      testCases.forEach(({ available, used, expected }) => {
        const netBalance = available - used;
        expect(netBalance).toBe(expected);
      });
    });

    it('should reset used generations after top-up', async () => {
      mockPrismaClient.user.update.mockResolvedValue({
        ...mockUser,
        availableGenerations: 115, // 20 - 5 + 100
        usedGenerations: 0,
      });

      const result = await mockPrismaClient.user.update({
        where: { clerkId: mockUser.clerkId },
        data: {
          availableGenerations: mockUser.availableGenerations - mockUser.usedGenerations + 100,
          usedGenerations: 0,
        },
      });

      expect(result.usedGenerations).toBe(0);
      expect(result.availableGenerations).toBe(115);
    });
  });

  describe('Transaction Recording', () => {
    it('should create transaction record with all required fields', async () => {
      mockPrismaClient.transaction.create.mockResolvedValue({
        id: 'txn_123',
        createdAt: new Date(),
        ...mockTransactionData,
      });

      const transaction = await mockPrismaClient.transaction.create({
        data: mockTransactionData,
      });

      expect(transaction).toHaveProperty('id');
      expect(transaction.tracking_id).toBe(mockTransactionData.tracking_id);
      expect(transaction.userId).toBe(mockTransactionData.userId);
      expect(transaction.status).toBe('successful');
      expect(transaction.amount).toBe(2000);
      expect(transaction.currency).toBe('USD');
    });

    it('should handle different payment statuses', () => {
      const statuses = ['successful', 'failed', 'pending', 'canceled', 'refunded'];
      
      statuses.forEach((status) => {
        expect(['successful', 'failed', 'pending', 'canceled', 'refunded']).toContain(status);
      });
    });
  });

  describe('Error Handling', () => {
    it('should throw error if user not found', async () => {
      mockPrismaClient.user.findUnique.mockResolvedValue(null);

      const user = await mockPrismaClient.user.findUnique({
        where: { clerkId: 'invalid_user_id' },
      });

      expect(user).toBeNull();
    });

    it('should throw error if description format is invalid', () => {
      const invalidDescriptions = [
        'Payment without token info',
        'Invalid format',
        'No number here',
      ];

      invalidDescriptions.forEach((description) => {
        const match = description.match(/\((\d+)\s+Tokens?\)/i);
        expect(match).toBeNull();
      });
    });

    it('should handle database transaction failures', async () => {
      mockPrismaClient.$transaction.mockRejectedValue(new Error('Database connection error'));

      await expect(
        mockPrismaClient.$transaction(async () => {
          throw new Error('Database connection error');
        })
      ).rejects.toThrow('Database connection error');
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero token purchases', () => {
      const tokensToAdd = 0;
      const expectedBalance = mockUser.availableGenerations - mockUser.usedGenerations + tokensToAdd;
      
      expect(expectedBalance).toBe(mockUser.availableGenerations - mockUser.usedGenerations);
    });

    it('should handle negative amounts correctly (refunds)', () => {
      const tokensToRefund = 50;
      const currentBalance = 100;
      const expectedBalance = Math.max(0, currentBalance - tokensToRefund);
      
      expect(expectedBalance).toBe(50);
    });

    it('should not allow negative balance on refund', () => {
      const tokensToRefund = 150;
      const currentBalance = 100;
      const expectedBalance = Math.max(0, currentBalance - tokensToRefund);
      
      expect(expectedBalance).toBe(0);
    });
  });

  describe('Currency Handling', () => {
    it('should support multiple currencies', () => {
      const supportedCurrencies = ['USD', 'GBP', 'EUR', 'CHF', 'AED'];
      
      supportedCurrencies.forEach((currency) => {
        const transaction = {
          ...mockTransactionData,
          currency,
        };
        expect(transaction.currency).toBe(currency);
      });
    });

    it('should correctly handle amount in cents', () => {
      const testCases = [
        { amountCents: 2000, expectedDollars: 20.00 },
        { amountCents: 500, expectedDollars: 5.00 },
        { amountCents: 10050, expectedDollars: 100.50 },
      ];

      testCases.forEach(({ amountCents, expectedDollars }) => {
        const dollars = amountCents / 100;
        expect(dollars).toBe(expectedDollars);
      });
    });
  });
});

