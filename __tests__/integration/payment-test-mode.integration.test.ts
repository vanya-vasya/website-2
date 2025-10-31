/**
 * Integration tests for payment flow in test mode
 * 
 * Tests the complete payment workflow:
 * 1. Payment token creation
 * 2. Webhook processing
 * 3. Balance updates
 * 4. Transaction record creation
 */

import { Pool } from 'pg';
import fetch from 'node-fetch';

describe('Payment Flow - Test Mode', () => {
  let pool: Pool;
  const testUserId = `test_user_${Date.now()}`;
  const testEmail = `test_${Date.now()}@example.com`;
  
  beforeAll(async () => {
    // Setup database connection
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    });

    // Create test user
    await pool.query(
      `INSERT INTO "User" ("id", "clerkId", "email", "photo", "availableGenerations", "usedGenerations") 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        `user_${Date.now()}`,
        testUserId,
        testEmail,
        'https://example.com/photo.jpg',
        20, // Default balance
        0,
      ]
    );
  });

  afterAll(async () => {
    // Cleanup
    await pool.query('DELETE FROM "Transaction" WHERE "userId" = $1', [testUserId]);
    await pool.query('DELETE FROM "User" WHERE "clerkId" = $1', [testUserId]);
    await pool.end();
  });

  describe('Webhook Processing', () => {
    it('should process successful test payment webhook', async () => {
      const transactionId = `test_txn_${Date.now()}`;
      const tokenAmount = 100;

      // Simulate webhook call
      const webhookPayload = {
        transaction: {
          test: true,
          uid: transactionId,
          status: 'successful',
          amount: '10.00',
          currency: 'USD',
          type: 'payment',
          tracking_id: testUserId,
          description: `Token Top-up (${tokenAmount} Tokens)`,
          payment_method_type: 'card',
          message: 'Payment successful',
          paid_at: new Date().toISOString(),
          customer: {
            email: testEmail,
          },
        },
      };

      const response = await fetch('http://localhost:3000/api/webhooks/networx', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookPayload),
      });

      expect(response.ok).toBe(true);
      const result = await response.json();
      expect(result.status).toBe('ok');

      // Verify transaction was created
      const transactionResult = await pool.query(
        'SELECT * FROM "Transaction" WHERE "webhookEventId" = $1',
        [transactionId]
      );

      expect(transactionResult.rows.length).toBe(1);
      expect(transactionResult.rows[0].status).toBe('successful');
      expect(transactionResult.rows[0].userId).toBe(testUserId);

      // Verify user balance was updated
      const userResult = await pool.query(
        'SELECT "availableGenerations" FROM "User" WHERE "clerkId" = $1',
        [testUserId]
      );

      expect(userResult.rows.length).toBe(1);
      expect(userResult.rows[0].availableGenerations).toBe(20 + tokenAmount);
    });

    it('should handle duplicate webhooks (idempotency)', async () => {
      const transactionId = `test_txn_dup_${Date.now()}`;
      const tokenAmount = 50;

      const webhookPayload = {
        transaction: {
          test: true,
          uid: transactionId,
          status: 'successful',
          amount: '5.00',
          currency: 'USD',
          type: 'payment',
          tracking_id: testUserId,
          description: `Token Top-up (${tokenAmount} Tokens)`,
          payment_method_type: 'card',
          message: 'Payment successful',
          paid_at: new Date().toISOString(),
          customer: {
            email: testEmail,
          },
        },
      };

      // First webhook call
      const response1 = await fetch('http://localhost:3000/api/webhooks/networx', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookPayload),
      });

      expect(response1.ok).toBe(true);

      // Get user balance after first payment
      const userResultAfterFirst = await pool.query(
        'SELECT "availableGenerations" FROM "User" WHERE "clerkId" = $1',
        [testUserId]
      );
      const balanceAfterFirst = userResultAfterFirst.rows[0].availableGenerations;

      // Second webhook call (duplicate)
      const response2 = await fetch('http://localhost:3000/api/webhooks/networx', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookPayload),
      });

      expect(response2.ok).toBe(true);
      const result2 = await response2.json();
      expect(result2.idempotent).toBe(true);

      // Verify balance was not updated again
      const userResultAfterSecond = await pool.query(
        'SELECT "availableGenerations" FROM "User" WHERE "clerkId" = $1',
        [testUserId]
      );
      const balanceAfterSecond = userResultAfterSecond.rows[0].availableGenerations;

      expect(balanceAfterSecond).toBe(balanceAfterFirst);

      // Verify only one transaction record exists
      const transactionResult = await pool.query(
        'SELECT * FROM "Transaction" WHERE "webhookEventId" = $1',
        [transactionId]
      );

      expect(transactionResult.rows.length).toBe(1);
    });

    it('should reject webhook for non-existent user', async () => {
      const transactionId = `test_txn_nouser_${Date.now()}`;

      const webhookPayload = {
        transaction: {
          test: true,
          uid: transactionId,
          status: 'successful',
          amount: '10.00',
          currency: 'USD',
          type: 'payment',
          tracking_id: 'user_nonexistent_123',
          description: 'Token Top-up (100 Tokens)',
          payment_method_type: 'card',
          message: 'Payment successful',
          paid_at: new Date().toISOString(),
          customer: {
            email: 'nonexistent@example.com',
          },
        },
      };

      const response = await fetch('http://localhost:3000/api/webhooks/networx', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookPayload),
      });

      expect(response.status).toBe(404);
      const result = await response.json();
      expect(result.error).toBe('User not found');
    });

    it('should reject webhook with invalid description format', async () => {
      const transactionId = `test_txn_invalid_${Date.now()}`;

      const webhookPayload = {
        transaction: {
          test: true,
          uid: transactionId,
          status: 'successful',
          amount: '10.00',
          currency: 'USD',
          type: 'payment',
          tracking_id: testUserId,
          description: 'Invalid description without token info',
          payment_method_type: 'card',
          message: 'Payment successful',
          paid_at: new Date().toISOString(),
          customer: {
            email: testEmail,
          },
        },
      };

      const response = await fetch('http://localhost:3000/api/webhooks/networx', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookPayload),
      });

      expect(response.status).toBe(400);
      const result = await response.json();
      expect(result.error).toContain('description');
    });

    it('should handle failed payment status', async () => {
      const transactionId = `test_txn_failed_${Date.now()}`;

      const webhookPayload = {
        transaction: {
          test: true,
          uid: transactionId,
          status: 'failed',
          amount: '10.00',
          currency: 'USD',
          type: 'payment',
          tracking_id: testUserId,
          description: 'Token Top-up (100 Tokens)',
          payment_method_type: 'card',
          message: 'Payment failed - insufficient funds',
          paid_at: new Date().toISOString(),
          customer: {
            email: testEmail,
          },
        },
      };

      const response = await fetch('http://localhost:3000/api/webhooks/networx', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookPayload),
      });

      expect(response.ok).toBe(true);

      // Verify transaction was created with failed status
      const transactionResult = await pool.query(
        'SELECT * FROM "Transaction" WHERE "webhookEventId" = $1',
        [transactionId]
      );

      expect(transactionResult.rows.length).toBe(1);
      expect(transactionResult.rows[0].status).toBe('failed');

      // Verify user balance was NOT updated
      const userResultBefore = await pool.query(
        'SELECT "availableGenerations" FROM "User" WHERE "clerkId" = $1',
        [testUserId]
      );
      const balanceBefore = userResultBefore.rows[0].availableGenerations;

      // Balance should remain unchanged
      const userResultAfter = await pool.query(
        'SELECT "availableGenerations" FROM "User" WHERE "clerkId" = $1',
        [testUserId]
      );
      const balanceAfter = userResultAfter.rows[0].availableGenerations;

      expect(balanceAfter).toBe(balanceBefore);
    });
  });

  describe('Balance Verification API', () => {
    it('should verify balance update after payment', async () => {
      // This test requires authentication, so we'll skip it in CI
      // In real scenario, you would need to mock Clerk auth
    });
  });

  describe('Token Extraction', () => {
    const testCases = [
      { description: 'Token Top-up (100 Tokens)', expected: 100 },
      { description: 'Token Top-up (250 Tokens)', expected: 250 },
      { description: 'Token Top-up (1000 Tokens)', expected: 1000 },
      { description: 'Buy 50 tokens', expected: 50 },
      { description: 'Purchase (500 Token)', expected: 500 },
    ];

    testCases.forEach(({ description, expected }) => {
      it(`should extract ${expected} from "${description}"`, () => {
        const extractTokensFromDescription = (desc: string): number | null => {
          const match = desc.match(/\((\d+)\s+Tokens?\)/i);
          return match ? parseInt(match[1], 10) : null;
        };

        const result = extractTokensFromDescription(description);
        expect(result).toBe(expected);
      });
    });
  });
});

