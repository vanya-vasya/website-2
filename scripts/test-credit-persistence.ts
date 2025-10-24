/**
 * Credit Persistence Diagnostic Script
 * 
 * Tests the complete flow of credit operations in Neon DB:
 * 1. User signup with 20 credits
 * 2. Payment webhook processing and credit increment
 * 3. Credit deduction on generation usage
 * 4. Read-after-write consistency
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

interface TestResult {
  test: string;
  passed: boolean;
  details: any;
  error?: string;
}

const results: TestResult[] = [];

function logTest(test: string, passed: boolean, details: any, error?: string) {
  results.push({ test, passed, details, error });
  console.log(`\n${passed ? '✅' : '❌'} ${test}`);
  if (details) console.log('   Details:', JSON.stringify(details, null, 2));
  if (error) console.error('   Error:', error);
}

async function runTests() {
  console.log('='.repeat(80));
  console.log('CREDIT PERSISTENCE DIAGNOSTIC - NEON DB');
  console.log('='.repeat(80));

  const testClerkId = `test_credit_${Date.now()}`;
  const testEmail = `test_credit_${Date.now()}@example.com`;
  let userId: string | undefined;

  try {
    // Test 1: Database Connection
    console.log('\n📊 TEST 1: Database Connection');
    try {
      await prisma.$connect();
      const dbVersion: any = await prisma.$queryRaw`SELECT version()`;
      logTest('Database Connection', true, {
        version: dbVersion[0].version,
        url: process.env.DATABASE_URL?.replace(/:[^:@]+@/, ':****@'),
      });
    } catch (error) {
      logTest('Database Connection', false, null, String(error));
      await cleanup();
      return;
    }

    // Test 2: User Creation with Initial 20 Credits (Signup Flow)
    console.log('\n📊 TEST 2: User Signup - Initial 20 Credits');
    try {
      const signupResult = await prisma.$transaction(async (tx) => {
        // Simulate Clerk webhook: Create user with 20 credits
        const newUser = await tx.user.create({
          data: {
            clerkId: testClerkId,
            email: testEmail,
            photo: 'https://example.com/photo.jpg',
            firstName: 'Test',
            lastName: 'User',
            availableGenerations: 20,
            usedGenerations: 0,
          },
        });

        // Create signup bonus transaction record
        const transaction = await tx.transaction.create({
          data: {
            tracking_id: testClerkId,
            userId: testClerkId,
            amount: 20,
            type: 'credit',
            reason: 'signup bonus',
            status: 'completed',
            webhookEventId: `signup_${testClerkId}`,
            paid_at: new Date(),
          },
        });

        return { user: newUser, transaction };
      });

      userId = signupResult.user.id;

      logTest('User Signup with 20 Credits', true, {
        userId: signupResult.user.id,
        clerkId: signupResult.user.clerkId,
        initialCredits: signupResult.user.availableGenerations,
        transactionId: signupResult.transaction.id,
      });
    } catch (error: any) {
      logTest('User Signup with 20 Credits', false, null, error.message);
      await cleanup();
      return;
    }

    // Test 3: Verify Credits Persisted (Read-After-Write)
    console.log('\n📊 TEST 3: Verify Credits Persisted');
    try {
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay for consistency

      const userAfterSignup = await prisma.user.findUnique({
        where: { clerkId: testClerkId },
        select: {
          id: true,
          clerkId: true,
          availableGenerations: true,
          usedGenerations: true,
        },
      });

      if (!userAfterSignup) {
        throw new Error('User not found after creation');
      }

      const isPersisted = userAfterSignup.availableGenerations === 20;
      logTest('Credits Persisted After Signup', isPersisted, {
        userId: userAfterSignup.id,
        availableGenerations: userAfterSignup.availableGenerations,
        usedGenerations: userAfterSignup.usedGenerations,
      });

      if (!isPersisted) {
        throw new Error(`Expected 20 credits, found ${userAfterSignup.availableGenerations}`);
      }
    } catch (error: any) {
      logTest('Credits Persisted After Signup', false, null, error.message);
    }

    // Test 4: Payment Webhook - Credit Purchase (50 tokens)
    console.log('\n📊 TEST 4: Payment Webhook - Purchase 50 Credits');
    try {
      const webhookTransactionId = `txn_${Date.now()}`;
      const tokensToPurchase = 50;

      // First check for idempotency (should not exist)
      const existingTxn = await prisma.transaction.findUnique({
        where: { webhookEventId: webhookTransactionId },
      });

      if (existingTxn) {
        throw new Error('Duplicate transaction detected');
      }

      const paymentResult = await prisma.$transaction(async (tx) => {
        // Get current user state
        const currentUser = await tx.user.findUnique({
          where: { clerkId: testClerkId },
          select: {
            availableGenerations: true,
            usedGenerations: true,
          },
        });

        if (!currentUser) {
          throw new Error('User not found');
        }

        // Create payment transaction record
        const transaction = await tx.transaction.create({
          data: {
            tracking_id: webhookTransactionId,
            userId: testClerkId,
            status: 'successful',
            amount: 1000, // $10.00 in cents
            currency: 'USD',
            description: `Payment for ${tokensToPurchase} tokens (50 Tokens)`,
            type: 'payment',
            payment_method_type: 'card',
            message: 'Payment successful',
            paid_at: new Date(),
            webhookEventId: webhookTransactionId,
          },
        });

        // Update user balance (simulate webhook logic)
        const updatedUser = await tx.user.update({
          where: { clerkId: testClerkId },
          data: {
            availableGenerations: currentUser.availableGenerations - currentUser.usedGenerations + tokensToPurchase,
            usedGenerations: 0, // Reset used after purchase
          },
        });

        return { transaction, updatedUser, previousBalance: currentUser.availableGenerations };
      });

      logTest('Payment Webhook Processing', true, {
        transactionId: paymentResult.transaction.id,
        webhookEventId: webhookTransactionId,
        previousBalance: paymentResult.previousBalance,
        newBalance: paymentResult.updatedUser.availableGenerations,
        tokensAdded: tokensToPurchase,
        expectedBalance: 20 + tokensToPurchase,
      });
    } catch (error: any) {
      logTest('Payment Webhook Processing', false, null, error.message);
    }

    // Test 5: Verify Credit Increment Persisted
    console.log('\n📊 TEST 5: Verify Credit Increment Persisted');
    try {
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay for consistency

      const userAfterPayment = await prisma.user.findUnique({
        where: { clerkId: testClerkId },
        select: {
          availableGenerations: true,
          usedGenerations: true,
        },
      });

      if (!userAfterPayment) {
        throw new Error('User not found after payment');
      }

      const expectedBalance = 70; // 20 initial + 50 purchased
      const isPersisted = userAfterPayment.availableGenerations === expectedBalance;

      logTest('Credit Increment Persisted', isPersisted, {
        availableGenerations: userAfterPayment.availableGenerations,
        usedGenerations: userAfterPayment.usedGenerations,
        expected: expectedBalance,
        actual: userAfterPayment.availableGenerations,
      });

      if (!isPersisted) {
        throw new Error(`Expected ${expectedBalance} credits, found ${userAfterPayment.availableGenerations}`);
      }
    } catch (error: any) {
      logTest('Credit Increment Persisted', false, null, error.message);
    }

    // Test 6: Credit Deduction on Usage
    console.log('\n📊 TEST 6: Credit Deduction on Usage');
    try {
      const creditsToUse = 10;

      const usageResult = await prisma.user.update({
        where: { clerkId: testClerkId },
        data: {
          usedGenerations: { increment: creditsToUse },
        },
        select: {
          availableGenerations: true,
          usedGenerations: true,
        },
      });

      logTest('Credit Deduction on Usage', true, {
        availableGenerations: usageResult.availableGenerations,
        usedGenerations: usageResult.usedGenerations,
        remainingCredits: usageResult.availableGenerations - usageResult.usedGenerations,
      });
    } catch (error: any) {
      logTest('Credit Deduction on Usage', false, null, error.message);
    }

    // Test 7: Verify Deduction Persisted
    console.log('\n📊 TEST 7: Verify Deduction Persisted');
    try {
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay for consistency

      const userAfterUsage = await prisma.user.findUnique({
        where: { clerkId: testClerkId },
        select: {
          availableGenerations: true,
          usedGenerations: true,
        },
      });

      if (!userAfterUsage) {
        throw new Error('User not found after usage');
      }

      const isPersisted = userAfterUsage.usedGenerations === 10;
      logTest('Credit Deduction Persisted', isPersisted, {
        availableGenerations: userAfterUsage.availableGenerations,
        usedGenerations: userAfterUsage.usedGenerations,
        remainingCredits: userAfterUsage.availableGenerations - userAfterUsage.usedGenerations,
      });

      if (!isPersisted) {
        throw new Error(`Expected 10 used credits, found ${userAfterUsage.usedGenerations}`);
      }
    } catch (error: any) {
      logTest('Credit Deduction Persisted', false, null, error.message);
    }

    // Test 8: Idempotency Check
    console.log('\n📊 TEST 8: Webhook Idempotency');
    try {
      const duplicateTransactionId = `txn_${Date.now()}`;

      // Create first transaction
      await prisma.transaction.create({
        data: {
          tracking_id: duplicateTransactionId,
          userId: testClerkId,
          status: 'successful',
          webhookEventId: duplicateTransactionId,
        },
      });

      // Try to create duplicate
      try {
        await prisma.transaction.create({
          data: {
            tracking_id: `${duplicateTransactionId}_2`,
            userId: testClerkId,
            status: 'successful',
            webhookEventId: duplicateTransactionId, // Same webhookEventId
          },
        });
        logTest('Webhook Idempotency', false, null, 'Duplicate transaction was allowed');
      } catch (error: any) {
        if (error.code === 'P2002') {
          logTest('Webhook Idempotency', true, {
            message: 'Duplicate webhook correctly rejected',
            constraint: 'webhookEventId unique constraint',
          });
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      logTest('Webhook Idempotency', false, null, error.message);
    }

    // Test 9: Transaction History
    console.log('\n📊 TEST 9: Transaction History');
    try {
      const transactions = await prisma.transaction.findMany({
        where: { userId: testClerkId },
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          type: true,
          amount: true,
          status: true,
          reason: true,
          createdAt: true,
        },
      });

      logTest('Transaction History', true, {
        transactionCount: transactions.length,
        transactions: transactions.map(t => ({
          type: t.type,
          amount: t.amount,
          status: t.status,
          reason: t.reason,
        })),
      });
    } catch (error: any) {
      logTest('Transaction History', false, null, error.message);
    }

    // Test 10: Connection Pool Status
    console.log('\n📊 TEST 10: Connection Pool Status');
    try {
      const poolStatus: any = await prisma.$queryRaw`
        SELECT 
          count(*) as total_connections,
          count(*) FILTER (WHERE state = 'active') as active_connections,
          count(*) FILTER (WHERE state = 'idle') as idle_connections
        FROM pg_stat_activity
        WHERE datname = current_database();
      `;
      logTest('Connection Pool Status', true, poolStatus[0]);
    } catch (error: any) {
      logTest('Connection Pool Status', false, null, error.message);
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  } finally {
    await cleanup();
  }
}

async function cleanup() {
  console.log('\n' + '='.repeat(80));
  console.log('CLEANUP');
  console.log('='.repeat(80));

  try {
    // Delete test transactions
    const deletedTransactions = await prisma.transaction.deleteMany({
      where: {
        OR: [
          { userId: { startsWith: 'test_credit_' } },
          { tracking_id: { startsWith: 'test_credit_' } },
          { tracking_id: { startsWith: 'txn_' } },
          { webhookEventId: { startsWith: 'signup_' } },
        ],
      },
    });
    console.log(`Deleted ${deletedTransactions.count} test transactions`);

    // Delete test users
    const deletedUsers = await prisma.user.deleteMany({
      where: {
        email: { startsWith: 'test_credit_' },
      },
    });
    console.log(`Deleted ${deletedUsers.count} test users`);
  } catch (error) {
    console.error('Cleanup error:', error);
  }

  await prisma.$disconnect();
  console.log('Disconnected from database');

  // Print Summary
  console.log('\n' + '='.repeat(80));
  console.log('TEST SUMMARY');
  console.log('='.repeat(80));

  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;

  console.log(`Total Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

  console.log('\n' + '-'.repeat(80));
  results.forEach((r, i) => {
    console.log(`${i + 1}. ${r.passed ? '✅' : '❌'} ${r.test}`);
    if (r.error) console.log(`   Error: ${r.error}`);
  });

  process.exit(failed > 0 ? 1 : 0);
}

// Handle errors
process.on('unhandledRejection', async (error) => {
  console.error('Unhandled rejection:', error);
  await cleanup();
});

// Run tests
runTests().catch(async (error) => {
  console.error('Fatal error:', error);
  await cleanup();
});


