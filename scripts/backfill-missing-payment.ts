/**
 * Backfill Missing Payment Script
 * 
 * This script manually inserts a missing payment transaction that was 
 * successful in the payment gateway but not persisted to the database
 * due to webhook delivery issues.
 * 
 * Usage:
 *   npx tsx scripts/backfill-missing-payment.ts
 */

import { config } from 'dotenv';
import { Pool } from 'pg';
import * as readline from 'readline';

config({ path: '.env.local' });

// The missing transaction details from payment gateway
const MISSING_TRANSACTION = {
  uid: 'c53e702d-ae3e-43bd-804b-b85789f383e4',
  amount: 5, // 0.05 EUR = 5 cents
  currency: 'EUR',
  description: 'Nerbixa Generations Purchase (1 Tokens)',
  status: 'successful',
  type: 'payment',
  payment_method_type: 'card',
  message: 'Transaction successful (backfilled)',
  paid_at: new Date(), // Approximate - update if you have exact timestamp
  // You MUST fill in the correct userId (clerkId) for this payment
  userId: null as string | null, // Will be prompted
};

// Helper to generate CUID-like IDs
function generateId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  return `${timestamp}${randomPart}`;
}

// Extract token amount from description
function extractTokensFromDescription(description: string): number | null {
  const match = description.match(/\((\d+)\s+Tokens?\)/i);
  return match ? parseInt(match[1], 10) : null;
}

async function promptUser(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim());
    });
  });
}

async function backfillPayment() {
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL not set. Please configure .env.local');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });

  console.log('═══════════════════════════════════════════════════════');
  console.log('💰 PAYMENT BACKFILL SCRIPT');
  console.log('═══════════════════════════════════════════════════════\n');

  console.log('Transaction to backfill:');
  console.log(`  UID: ${MISSING_TRANSACTION.uid}`);
  console.log(`  Amount: ${MISSING_TRANSACTION.amount} ${MISSING_TRANSACTION.currency}`);
  console.log(`  Description: ${MISSING_TRANSACTION.description}`);
  console.log('');

  try {
    // Check if transaction already exists
    const existingTxn = await pool.query(
      'SELECT * FROM "Transaction" WHERE "webhookEventId" = $1 OR "tracking_id" = $1',
      [MISSING_TRANSACTION.uid]
    );

    if (existingTxn.rows.length > 0) {
      console.log('⚠️  Transaction already exists in database:');
      console.log(JSON.stringify(existingTxn.rows[0], null, 2));
      console.log('\n❌ Aborting to prevent duplicate entry.');
      await pool.end();
      process.exit(0);
    }

    // Get user ID
    console.log('\n📋 Step 1: Identify the user who made this payment');
    console.log('You can find the user by their email or check Clerk dashboard.\n');

    // List recent users for reference
    const recentUsers = await pool.query(
      'SELECT "clerkId", "email", "firstName", "lastName", "availableGenerations" FROM "User" ORDER BY "createdAt" DESC LIMIT 10'
    );

    console.log('Recent users in database:');
    recentUsers.rows.forEach((u, i) => {
      console.log(`  ${i + 1}. ${u.clerkId} | ${u.email} | ${u.firstName} ${u.lastName} | Balance: ${u.availableGenerations}`);
    });

    const userId = await promptUser('\nEnter the clerkId of the user who made this payment: ');
    
    if (!userId) {
      console.log('❌ No user ID provided. Aborting.');
      await pool.end();
      process.exit(1);
    }

    // Verify user exists
    const userResult = await pool.query(
      'SELECT "clerkId", "email", "availableGenerations" FROM "User" WHERE "clerkId" = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      console.log(`❌ User with clerkId "${userId}" not found in database.`);
      await pool.end();
      process.exit(1);
    }

    const user = userResult.rows[0];
    console.log(`\n✅ Found user: ${user.email} (current balance: ${user.availableGenerations} tokens)`);

    const tokensToAdd = extractTokensFromDescription(MISSING_TRANSACTION.description);
    if (!tokensToAdd) {
      console.log('❌ Could not extract token amount from description.');
      await pool.end();
      process.exit(1);
    }

    console.log(`\n📦 Will add ${tokensToAdd} tokens to user's balance.`);
    
    const confirm = await promptUser(`\nProceed with backfill? (type "yes" to confirm): `);
    
    if (confirm.toLowerCase() !== 'yes') {
      console.log('❌ Cancelled by user.');
      await pool.end();
      process.exit(0);
    }

    // Execute backfill in transaction
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Insert WebhookEvent
      const eventId = `${MISSING_TRANSACTION.uid}:successful:backfill`;
      await client.query(
        `INSERT INTO "WebhookEvent" ("id", "eventId", "eventType", "processed", "processedAt")
         VALUES ($1, $2, $3, true, NOW())`,
        [generateId(), eventId, 'secure-processor.successful.backfill']
      );
      console.log('✅ Created WebhookEvent record');

      // Insert Transaction
      await client.query(
        `INSERT INTO "Transaction"
          ("id", "tracking_id", "userId", "status", "amount", "currency", "description",
           "type", "payment_method_type", "message", "paid_at", "webhookEventId")
         VALUES ($1, $2, $3, 'successful', $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          generateId(),
          MISSING_TRANSACTION.uid,
          userId,
          MISSING_TRANSACTION.amount,
          MISSING_TRANSACTION.currency,
          MISSING_TRANSACTION.description,
          MISSING_TRANSACTION.type,
          MISSING_TRANSACTION.payment_method_type,
          MISSING_TRANSACTION.message,
          MISSING_TRANSACTION.paid_at,
          MISSING_TRANSACTION.uid,
        ]
      );
      console.log('✅ Created Transaction record');

      // Update user balance
      const newBalance = user.availableGenerations + tokensToAdd;
      await client.query(
        'UPDATE "User" SET "availableGenerations" = $1 WHERE "clerkId" = $2',
        [newBalance, userId]
      );
      console.log(`✅ Updated user balance: ${user.availableGenerations} → ${newBalance} tokens`);

      await client.query('COMMIT');
      
      console.log('\n═══════════════════════════════════════════════════════');
      console.log('✅ BACKFILL COMPLETED SUCCESSFULLY!');
      console.log('═══════════════════════════════════════════════════════\n');
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Backfill failed:', error);
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

backfillPayment();

