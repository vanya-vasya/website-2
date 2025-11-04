#!/usr/bin/env ts-node
/**
 * Payment Reconciliation Script
 * 
 * Reconciles missing payment records by:
 * 1. Checking for payments that should exist but don't
 * 2. Backfilling missing DB records
 * 3. Updating user balances
 */

import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as readline from 'readline';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

interface MissingPayment {
  transactionId: string;
  userId: string;
  amount: number;
  currency: string;
  tokenAmount: number;
  description: string;
  paidAt: Date;
}

class PaymentReconciliation {
  private pool: Pool;
  private dryRun: boolean;

  constructor(dryRun: boolean = true) {
    this.dryRun = dryRun;
    
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL not set in environment');
    }

    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    });

    console.log('═══════════════════════════════════════════════════════');
    console.log('💰 Payment Reconciliation Script');
    console.log('═══════════════════════════════════════════════════════\n');
    console.log(`Mode: ${this.dryRun ? '🔍 DRY RUN (no changes)' : '✍️  LIVE RUN (will make changes)'}\n`);
  }

  /**
   * Extract token amount from description
   */
  private extractTokensFromDescription(description: string): number | null {
    const match = description.match(/\((\d+)\s+Tokens?\)/i);
    return match ? parseInt(match[1], 10) : null;
  }

  /**
   * Manually add missing payments
   * This function allows you to manually specify payments that should be reconciled
   */
  async addMissingPayments(payments: MissingPayment[]): Promise<void> {
    console.log(`📋 Processing ${payments.length} missing payment(s)...\n`);

    for (let i = 0; i < payments.length; i++) {
      const payment = payments[i];
      console.log(`─`.repeat(60));
      console.log(`Payment ${i + 1}/${payments.length}`);
      console.log(`─`.repeat(60));
      console.log(`Transaction ID: ${payment.transactionId}`);
      console.log(`User ID: ${payment.userId}`);
      console.log(`Amount: ${payment.amount} ${payment.currency}`);
      console.log(`Tokens: ${payment.tokenAmount}`);
      console.log(`Description: ${payment.description}`);
      console.log(`Paid At: ${payment.paidAt.toISOString()}\n`);

      try {
        // Check if transaction already exists
        const existingTransaction = await this.pool.query(
          'SELECT * FROM "Transaction" WHERE "webhookEventId" = $1',
          [payment.transactionId]
        );

        if (existingTransaction.rows.length > 0) {
          console.log('⚠️  Transaction already exists in database\n');
          continue;
        }

        // Check if user exists
        const userResult = await this.pool.query(
          'SELECT * FROM "User" WHERE "clerkId" = $1',
          [payment.userId]
        );

        if (userResult.rows.length === 0) {
          console.log(`❌ User not found: ${payment.userId}`);
          console.log('   Cannot reconcile payment for non-existent user\n');
          continue;
        }

        const user = userResult.rows[0];
        console.log(`✅ User found: ${user.email}`);
        console.log(`   Current balance: ${user.availableGenerations} tokens\n`);

        if (this.dryRun) {
          console.log('🔍 DRY RUN - Would perform these actions:');
          console.log(`   1. Create transaction record with ID: ${payment.transactionId}`);
          console.log(`   2. Update user balance from ${user.availableGenerations} to ${user.availableGenerations + payment.tokenAmount} tokens\n`);
        } else {
          // Execute in transaction
          const client = await this.pool.connect();
          try {
            await client.query('BEGIN');

            // Generate a unique ID for the transaction record
            const timestamp = Date.now().toString(36);
            const randomPart = Math.random().toString(36).substring(2, 15);
            const transactionRecordId = `${timestamp}${randomPart}`;

            // Create transaction record
            await client.query(
              `INSERT INTO "Transaction" 
                ("id", "tracking_id", "userId", "status", "amount", "currency", "description", 
                 "type", "payment_method_type", "message", "paid_at", "webhookEventId") 
               VALUES ($1, $2, $3, 'successful', $4, $5, $6, 'payment', 'card', $7, $8, $9)`,
              [
                transactionRecordId,
                payment.transactionId,
                payment.userId,
                payment.amount,
                payment.currency,
                payment.description,
                'Payment reconciled manually',
                payment.paidAt,
                payment.transactionId,
              ]
            );

            console.log(`✅ Transaction record created: ${transactionRecordId}`);

            // Update user balance
            const newBalance = user.availableGenerations + payment.tokenAmount;
            await client.query(
              'UPDATE "User" SET "availableGenerations" = $1 WHERE "clerkId" = $2',
              [newBalance, payment.userId]
            );

            console.log(`✅ User balance updated: ${user.availableGenerations} → ${newBalance} tokens`);

            await client.query('COMMIT');
            console.log('✅ Payment reconciled successfully\n');
          } catch (error) {
            await client.query('ROLLBACK');
            console.log(`❌ Failed to reconcile payment: ${error}\n`);
            throw error;
          } finally {
            client.release();
          }
        }
      } catch (error) {
        console.log(`❌ Error processing payment: ${error}\n`);
      }
    }

    console.log('═══════════════════════════════════════════════════════');
    console.log(`${this.dryRun ? '🔍 DRY RUN COMPLETE' : '✅ RECONCILIATION COMPLETE'}`);
    console.log('═══════════════════════════════════════════════════════\n');
  }

  /**
   * Interactive mode to add payments manually
   */
  async interactiveMode(): Promise<void> {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const question = (prompt: string): Promise<string> => {
      return new Promise(resolve => {
        rl.question(prompt, resolve);
      });
    };

    console.log('📝 Interactive Payment Reconciliation\n');
    console.log('Enter payment details (or type "done" to finish)\n');

    const payments: MissingPayment[] = [];

    while (true) {
      const transactionId = await question('Transaction ID (or "done"): ');
      if (transactionId.toLowerCase() === 'done') break;

      const userId = await question('User ID (Clerk ID): ');
      const amountStr = await question('Amount (e.g., 10.00): ');
      const currency = await question('Currency (default: USD): ') || 'USD';
      const tokenAmountStr = await question('Token Amount: ');
      const description = await question('Description (e.g., "Token Top-up (100 Tokens)"): ');
      const paidAtStr = await question('Paid At (ISO date, or press Enter for now): ');

      const amount = parseFloat(amountStr);
      const tokenAmount = parseInt(tokenAmountStr);
      const paidAt = paidAtStr ? new Date(paidAtStr) : new Date();

      if (isNaN(amount) || isNaN(tokenAmount)) {
        console.log('❌ Invalid amount or token amount. Skipping...\n');
        continue;
      }

      payments.push({
        transactionId,
        userId,
        amount,
        currency,
        tokenAmount,
        description,
        paidAt,
      });

      console.log('✅ Payment added\n');
    }

    rl.close();

    if (payments.length > 0) {
      console.log(`\n📋 Summary: ${payments.length} payment(s) to reconcile\n`);
      
      if (!this.dryRun) {
        const confirm = await question('Are you sure you want to proceed? (yes/no): ');
        if (confirm.toLowerCase() !== 'yes') {
          console.log('❌ Cancelled\n');
          return;
        }
      }

      await this.addMissingPayments(payments);
    } else {
      console.log('No payments to reconcile\n');
    }
  }

  /**
   * Find orphaned transactions (transactions without user balance updates)
   */
  async findOrphanedTransactions(): Promise<void> {
    console.log('🔍 Searching for orphaned transactions...\n');
    console.log('─'.repeat(60) + '\n');

    try {
      // Find successful transactions where user balance might not have been updated
      const result = await this.pool.query(`
        SELECT 
          t.id,
          t."webhookEventId",
          t."userId",
          t.amount,
          t.currency,
          t.description,
          t."paid_at",
          t."createdAt",
          u.email,
          u."availableGenerations",
          u."createdAt" as user_created_at
        FROM "Transaction" t
        LEFT JOIN "User" u ON t."userId" = u."clerkId"
        WHERE 
          t.status = 'successful' 
          AND t."createdAt" > NOW() - INTERVAL '30 days'
        ORDER BY t."createdAt" DESC
      `);

      if (result.rows.length === 0) {
        console.log('No successful transactions found in the last 30 days\n');
        return;
      }

      console.log(`Found ${result.rows.length} successful transaction(s) in the last 30 days:\n`);

      for (const row of result.rows) {
        console.log(`─`.repeat(60));
        console.log(`Transaction: ${row.id}`);
        console.log(`Webhook ID: ${row.webhookEventId}`);
        console.log(`User: ${row.email || row.userId || 'N/A'}`);
        console.log(`Amount: ${row.amount} ${row.currency}`);
        console.log(`Description: ${row.description}`);
        console.log(`Paid At: ${row.paid_at}`);
        console.log(`Created At: ${row.createdAt}`);
        console.log(`User Balance: ${row.availableGenerations || 'N/A'} tokens`);

        // Extract expected token amount
        const expectedTokens = this.extractTokensFromDescription(row.description || '');
        if (expectedTokens) {
          console.log(`Expected Tokens: ${expectedTokens}`);
          
          // Check if balance looks suspicious (still at default 20)
          if (row.availableGenerations === 20) {
            console.log('⚠️  WARNING: User balance is at default (20 tokens)');
            console.log('   This might indicate the balance was not updated after payment');
          }
        }
        
        console.log('');
      }

      console.log('─'.repeat(60) + '\n');
    } catch (error) {
      console.log(`❌ Error searching for orphaned transactions: ${error}\n`);
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const dryRun = !args.includes('--live');

  const reconciler = new PaymentReconciliation(dryRun);

  try {
    switch (command) {
      case 'interactive':
        await reconciler.interactiveMode();
        break;

      case 'find-orphaned':
        await reconciler.findOrphanedTransactions();
        break;

      case 'add':
        // Example: ts-node reconcile-missing-payments.ts add txn_123 user_abc 10.00 USD 100 "Token Top-up (100 Tokens)" "2025-01-01T00:00:00Z"
        if (args.length < 7) {
          console.log('Usage: ts-node reconcile-missing-payments.ts add <txnId> <userId> <amount> <currency> <tokens> <description> [paidAt]');
          process.exit(1);
        }

        const [, transactionId, userId, amountStr, currency, tokenAmountStr, description, paidAtStr] = args;
        const payment: MissingPayment = {
          transactionId,
          userId,
          amount: parseFloat(amountStr),
          currency,
          tokenAmount: parseInt(tokenAmountStr),
          description,
          paidAt: paidAtStr ? new Date(paidAtStr) : new Date(),
        };

        await reconciler.addMissingPayments([payment]);
        break;

      default:
        console.log('Usage: ts-node reconcile-missing-payments.ts <command> [options]\n');
        console.log('Commands:');
        console.log('  interactive                - Interactive mode to add payments manually');
        console.log('  find-orphaned              - Find transactions that might not have updated balances');
        console.log('  add <args>                 - Add a single payment manually');
        console.log('\nOptions:');
        console.log('  --live                     - Actually make changes (default is dry-run)');
        console.log('\nExamples:');
        console.log('  npm run reconcile interactive');
        console.log('  npm run reconcile find-orphaned');
        console.log('  npm run reconcile add txn_123 user_abc 10.00 USD 100 "Token Top-up (100 Tokens)" --live');
        process.exit(1);
    }
  } finally {
    await reconciler.close();
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});







