#!/usr/bin/env ts-node
/**
 * Payment Flow Diagnostic Tool - Test Mode
 * 
 * This script diagnoses issues with test mode payment processing where:
 * - Token is created and payment marked successful
 * - But token balance not updated
 * - No payment history entry
 * - No DB changes in Neon
 */

import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

interface DiagnosticResults {
  environment: {
    databaseUrl: boolean;
    secure-processorShopId: boolean;
    secure-processorSecretKey: boolean;
    secure-processorTestMode: string | undefined;
    nodeEnv: string;
  };
  database: {
    connected: boolean;
    userTableExists: boolean;
    transactionTableExists: boolean;
    userCount: number;
    transactionCount: number;
    recentTransactions: any[];
  };
  testData: {
    testUsers: any[];
    testTransactions: any[];
  };
  issues: string[];
  recommendations: string[];
}

class PaymentFlowDiagnostic {
  private pool: Pool | null = null;
  private results: DiagnosticResults = {
    environment: {
      databaseUrl: false,
      secure-processorShopId: false,
      secure-processorSecretKey: false,
      secure-processorTestMode: undefined,
      nodeEnv: process.env.NODE_ENV || 'development',
    },
    database: {
      connected: false,
      userTableExists: false,
      transactionTableExists: false,
      userCount: 0,
      transactionCount: 0,
      recentTransactions: [],
    },
    testData: {
      testUsers: [],
      testTransactions: [],
    },
    issues: [],
    recommendations: [],
  };

  constructor() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('🔍 Payment Flow Diagnostic Tool - Test Mode');
    console.log('═══════════════════════════════════════════════════════\n');
  }

  async run(): Promise<void> {
    try {
      await this.checkEnvironment();
      await this.checkDatabase();
      await this.checkTestData();
      await this.analyzeIssues();
      this.printReport();
    } catch (error) {
      console.error('❌ Diagnostic failed:', error);
      throw error;
    } finally {
      if (this.pool) {
        await this.pool.end();
      }
    }
  }

  private async checkEnvironment(): Promise<void> {
    console.log('📋 Step 1: Checking Environment Variables\n');
    console.log('─'.repeat(60));

    // Check DATABASE_URL
    this.results.environment.databaseUrl = !!process.env.DATABASE_URL;
    console.log(`DATABASE_URL: ${this.results.environment.databaseUrl ? '✅ Set' : '❌ Missing'}`);
    if (process.env.DATABASE_URL) {
      const urlParts = process.env.DATABASE_URL.match(/postgres:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
      if (urlParts) {
        console.log(`  ├─ Host: ${urlParts[3]}`);
        console.log(`  ├─ Port: ${urlParts[4]}`);
        console.log(`  ├─ Database: ${urlParts[5].split('?')[0]}`);
        console.log(`  └─ User: ${urlParts[1]}`);
      }
    } else {
      this.results.issues.push('DATABASE_URL is not set');
      this.results.recommendations.push('Set DATABASE_URL in .env.local file');
    }

    // Check Secure-processor credentials
    this.results.environment.secure-processorShopId = !!process.env.SECURE_PROCESSOR_SHOP_ID;
    console.log(`\nSECURE_PROCESSOR_SHOP_ID: ${this.results.environment.secure-processorShopId ? '✅ Set (' + process.env.SECURE_PROCESSOR_SHOP_ID + ')' : '❌ Missing'}`);
    
    this.results.environment.secure-processorSecretKey = !!process.env.SECURE_PROCESSOR_SECRET_KEY;
    console.log(`SECURE_PROCESSOR_SECRET_KEY: ${this.results.environment.secure-processorSecretKey ? '✅ Set (***' + process.env.SECURE_PROCESSOR_SECRET_KEY?.slice(-4) + ')' : '❌ Missing'}`);

    // Check test mode
    this.results.environment.secure-processorTestMode = process.env.SECURE_PROCESSOR_TEST_MODE;
    console.log(`SECURE_PROCESSOR_TEST_MODE: ${this.results.environment.secure-processorTestMode || 'not set'}`);
    if (this.results.environment.secure-processorTestMode !== 'true') {
      this.results.issues.push('SECURE_PROCESSOR_TEST_MODE is not set to "true" - test payments might not work correctly');
      this.results.recommendations.push('Set SECURE_PROCESSOR_TEST_MODE=true in .env.local for test payments');
    }

    console.log(`\nNODE_ENV: ${this.results.environment.nodeEnv}`);
    console.log('─'.repeat(60) + '\n');
  }

  private async checkDatabase(): Promise<void> {
    console.log('📋 Step 2: Checking Database Connection and Schema\n');
    console.log('─'.repeat(60));

    if (!process.env.DATABASE_URL) {
      console.log('❌ Cannot connect to database - DATABASE_URL not set\n');
      return;
    }

    try {
      // Create connection pool
      this.pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false,
        },
      });

      // Test connection
      const client = await this.pool.connect();
      this.results.database.connected = true;
      console.log('✅ Database connection successful\n');

      // Check User table
      try {
        const userTableResult = await client.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = 'User'
          ) as exists
        `);
        this.results.database.userTableExists = userTableResult.rows[0].exists;
        console.log(`User table: ${this.results.database.userTableExists ? '✅ Exists' : '❌ Missing'}`);

        if (this.results.database.userTableExists) {
          // Get User table schema
          const userSchemaResult = await client.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_name = 'User'
            ORDER BY ordinal_position
          `);
          console.log('\n  User table columns:');
          userSchemaResult.rows.forEach(col => {
            console.log(`    ├─ ${col.column_name}: ${col.data_type}${col.is_nullable === 'NO' ? ' NOT NULL' : ''}`);
          });

          // Count users
          const userCountResult = await client.query('SELECT COUNT(*) as count FROM "User"');
          this.results.database.userCount = parseInt(userCountResult.rows[0].count);
          console.log(`\n  Total users: ${this.results.database.userCount}`);
        } else {
          this.results.issues.push('User table does not exist');
          this.results.recommendations.push('Run database migrations to create User table');
        }
      } catch (error) {
        console.log(`❌ Error checking User table: ${error}`);
        this.results.issues.push(`User table check failed: ${error}`);
      }

      // Check Transaction table
      try {
        const transactionTableResult = await client.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = 'Transaction'
          ) as exists
        `);
        this.results.database.transactionTableExists = transactionTableResult.rows[0].exists;
        console.log(`\nTransaction table: ${this.results.database.transactionTableExists ? '✅ Exists' : '❌ Missing'}`);

        if (this.results.database.transactionTableExists) {
          // Get Transaction table schema
          const transactionSchemaResult = await client.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns
            WHERE table_name = 'Transaction'
            ORDER BY ordinal_position
          `);
          console.log('\n  Transaction table columns:');
          transactionSchemaResult.rows.forEach(col => {
            console.log(`    ├─ ${col.column_name}: ${col.data_type}${col.is_nullable === 'NO' ? ' NOT NULL' : ''}`);
          });

          // Count transactions
          const transactionCountResult = await client.query('SELECT COUNT(*) as count FROM "Transaction"');
          this.results.database.transactionCount = parseInt(transactionCountResult.rows[0].count);
          console.log(`\n  Total transactions: ${this.results.database.transactionCount}`);

          // Get recent transactions
          const recentTransactionsResult = await client.query(`
            SELECT 
              id, 
              "userId", 
              status, 
              amount, 
              currency, 
              description, 
              "createdAt",
              "webhookEventId"
            FROM "Transaction"
            ORDER BY "createdAt" DESC
            LIMIT 10
          `);
          this.results.database.recentTransactions = recentTransactionsResult.rows;
          
          if (recentTransactionsResult.rows.length > 0) {
            console.log('\n  Recent transactions:');
            recentTransactionsResult.rows.forEach(txn => {
              console.log(`    ├─ ${txn.id}`);
              console.log(`    │  ├─ User: ${txn.userId || 'N/A'}`);
              console.log(`    │  ├─ Status: ${txn.status}`);
              console.log(`    │  ├─ Amount: ${txn.amount} ${txn.currency}`);
              console.log(`    │  ├─ Created: ${txn.createdAt}`);
              console.log(`    │  └─ Webhook ID: ${txn.webhookEventId || 'N/A'}`);
            });
          }
        } else {
          this.results.issues.push('Transaction table does not exist');
          this.results.recommendations.push('Run database migrations to create Transaction table');
        }
      } catch (error) {
        console.log(`❌ Error checking Transaction table: ${error}`);
        this.results.issues.push(`Transaction table check failed: ${error}`);
      }

      // Check for indexes
      try {
        const indexesResult = await client.query(`
          SELECT 
            tablename, 
            indexname, 
            indexdef
          FROM pg_indexes
          WHERE tablename IN ('User', 'Transaction')
          ORDER BY tablename, indexname
        `);
        
        if (indexesResult.rows.length > 0) {
          console.log('\n  Database indexes:');
          indexesResult.rows.forEach(idx => {
            console.log(`    ├─ ${idx.tablename}.${idx.indexname}`);
          });
        }
      } catch (error) {
        console.log(`⚠️  Could not check indexes: ${error}`);
      }

      client.release();
      console.log('─'.repeat(60) + '\n');
    } catch (error) {
      console.log(`❌ Database connection failed: ${error}\n`);
      this.results.issues.push(`Database connection failed: ${error}`);
      this.results.recommendations.push('Verify DATABASE_URL is correct and database is accessible');
      console.log('─'.repeat(60) + '\n');
    }
  }

  private async checkTestData(): Promise<void> {
    console.log('📋 Step 3: Checking Test Data\n');
    console.log('─'.repeat(60));

    if (!this.pool || !this.results.database.connected) {
      console.log('⚠️  Skipping test data check - no database connection\n');
      return;
    }

    try {
      // Find test users (users created recently or with test emails)
      if (this.results.database.userTableExists) {
        const testUsersResult = await this.pool.query(`
          SELECT 
            id,
            "clerkId",
            email,
            "availableGenerations",
            "usedGenerations",
            "createdAt"
          FROM "User"
          WHERE 
            email ILIKE '%test%' OR
            email ILIKE '%example%' OR
            "createdAt" > NOW() - INTERVAL '7 days'
          ORDER BY "createdAt" DESC
          LIMIT 10
        `);
        this.results.testData.testUsers = testUsersResult.rows;

        if (testUsersResult.rows.length > 0) {
          console.log('Test users found:');
          testUsersResult.rows.forEach(user => {
            console.log(`  ├─ ${user.email}`);
            console.log(`  │  ├─ Clerk ID: ${user.clerkId}`);
            console.log(`  │  ├─ Available: ${user.availableGenerations} tokens`);
            console.log(`  │  ├─ Used: ${user.usedGenerations} tokens`);
            console.log(`  │  └─ Created: ${user.createdAt}`);
          });
        } else {
          console.log('No test users found');
        }
      }

      // Find test transactions
      if (this.results.database.transactionTableExists) {
        const testTransactionsResult = await this.pool.query(`
          SELECT 
            t.id,
            t."userId",
            t.status,
            t.amount,
            t.currency,
            t.description,
            t."webhookEventId",
            t."createdAt",
            u.email as user_email,
            u."availableGenerations" as user_balance
          FROM "Transaction" t
          LEFT JOIN "User" u ON t."userId" = u."clerkId"
          WHERE t."createdAt" > NOW() - INTERVAL '7 days'
          ORDER BY t."createdAt" DESC
          LIMIT 10
        `);
        this.results.testData.testTransactions = testTransactionsResult.rows;

        if (testTransactionsResult.rows.length > 0) {
          console.log('\nRecent test transactions (last 7 days):');
          testTransactionsResult.rows.forEach(txn => {
            console.log(`  ├─ ${txn.id} [${txn.status}]`);
            console.log(`  │  ├─ User: ${txn.user_email || txn.userId || 'N/A'}`);
            console.log(`  │  ├─ Amount: ${txn.amount} ${txn.currency}`);
            console.log(`  │  ├─ Description: ${txn.description}`);
            console.log(`  │  ├─ User Balance: ${txn.user_balance || 'N/A'} tokens`);
            console.log(`  │  ├─ Webhook ID: ${txn.webhookEventId || 'N/A'}`);
            console.log(`  │  └─ Created: ${txn.createdAt}`);
          });
        } else {
          console.log('\nNo recent transactions found (last 7 days)');
          this.results.issues.push('No recent transactions found - webhooks might not be firing');
          this.results.recommendations.push('Check webhook configuration in Secure-processor dashboard');
          this.results.recommendations.push('Verify webhook URL is publicly accessible');
        }
      }

      console.log('─'.repeat(60) + '\n');
    } catch (error) {
      console.log(`❌ Error checking test data: ${error}\n`);
      this.results.issues.push(`Test data check failed: ${error}`);
      console.log('─'.repeat(60) + '\n');
    }
  }

  private async analyzeIssues(): Promise<void> {
    console.log('📋 Step 4: Analyzing Issues\n');
    console.log('─'.repeat(60));

    // Check for common issues

    // 1. Test mode not enabled
    if (this.results.environment.secure-processorTestMode !== 'true') {
      this.results.issues.push('Test mode not enabled in environment variables');
    }

    // 2. No transactions despite having users
    if (this.results.database.userCount > 0 && this.results.database.transactionCount === 0) {
      this.results.issues.push('Users exist but no transactions found - webhook might not be working');
      this.results.recommendations.push('Test webhook manually using the webhook simulator script');
      this.results.recommendations.push('Check Vercel/server logs for webhook calls');
    }

    // 3. Transactions exist but user balances not updated
    if (this.results.testData.testTransactions.length > 0) {
      const successfulTransactions = this.results.testData.testTransactions.filter(
        txn => txn.status === 'successful' || txn.status === 'success'
      );
      
      if (successfulTransactions.length > 0) {
        console.log(`Found ${successfulTransactions.length} successful transactions`);
        
        // Check if user balances were updated
        for (const txn of successfulTransactions) {
          if (txn.user_balance !== null && txn.user_balance <= 20) {
            this.results.issues.push(`Transaction ${txn.id} marked successful but user balance (${txn.user_balance}) suggests tokens not added`);
            this.results.recommendations.push('Check webhook handler database transaction logic');
            this.results.recommendations.push('Verify token extraction from description field');
          }
        }
      }
    }

    // 4. Missing database tables
    if (!this.results.database.userTableExists || !this.results.database.transactionTableExists) {
      this.results.issues.push('Database schema incomplete');
      this.results.recommendations.push('Run: psql $DATABASE_URL -f db/schema.sql');
    }

    console.log('─'.repeat(60) + '\n');
  }

  private printReport(): void {
    console.log('═══════════════════════════════════════════════════════');
    console.log('📊 DIAGNOSTIC REPORT');
    console.log('═══════════════════════════════════════════════════════\n');

    // Summary
    console.log('🎯 SUMMARY\n');
    console.log(`Environment: ${this.results.environment.nodeEnv}`);
    console.log(`Database Connected: ${this.results.database.connected ? '✅ Yes' : '❌ No'}`);
    console.log(`Test Mode Enabled: ${this.results.environment.secure-processorTestMode === 'true' ? '✅ Yes' : '❌ No'}`);
    console.log(`Users in DB: ${this.results.database.userCount}`);
    console.log(`Transactions in DB: ${this.results.database.transactionCount}`);
    console.log(`Recent Transactions (7d): ${this.results.testData.testTransactions.length}`);

    // Issues found
    if (this.results.issues.length > 0) {
      console.log('\n❌ ISSUES FOUND:\n');
      this.results.issues.forEach((issue, index) => {
        console.log(`  ${index + 1}. ${issue}`);
      });
    } else {
      console.log('\n✅ No critical issues found');
    }

    // Recommendations
    if (this.results.recommendations.length > 0) {
      console.log('\n💡 RECOMMENDATIONS:\n');
      this.results.recommendations.forEach((rec, index) => {
        console.log(`  ${index + 1}. ${rec}`);
      });
    }

    // Next steps
    console.log('\n🔧 NEXT STEPS:\n');
    console.log('  1. Run webhook simulator: npm run test:webhook-simulator');
    console.log('  2. Check server logs for webhook calls');
    console.log('  3. Verify Secure-processor dashboard webhook configuration');
    console.log('  4. Test payment flow end-to-end');
    console.log('  5. Enable detailed logging in webhook handler');

    console.log('\n═══════════════════════════════════════════════════════\n');
  }
}

// Run diagnostic
const diagnostic = new PaymentFlowDiagnostic();
diagnostic.run().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});





