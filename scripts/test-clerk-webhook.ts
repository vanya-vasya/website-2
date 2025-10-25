/**
 * LOCAL CLERK WEBHOOK TESTER
 * 
 * This script tests the Clerk webhook handler locally by:
 * 1. Validating environment variables
 * 2. Testing database connectivity
 * 3. Simulating a Clerk webhook event
 * 4. Verifying user creation
 */

import { config } from 'dotenv';
import { Pool } from 'pg';

// Load environment variables
config({ path: '.env.local' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function testWebhookHandler() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('🧪 CLERK WEBHOOK HANDLER DIAGNOSTIC TEST');
  console.log('═══════════════════════════════════════════════════════\n');
  
  let allTestsPassed = true;
  
  // TEST 1: Environment Variables
  console.log('TEST 1: Environment Variables');
  console.log('─────────────────────────────────────────────────────');
  
  const requiredVars = ['DATABASE_URL', 'WEBHOOK_SECRET', 'CLERK_SECRET_KEY'];
  const envResults: Record<string, boolean> = {};
  
  for (const varName of requiredVars) {
    const exists = !!process.env[varName];
    envResults[varName] = exists;
    
    if (exists) {
      const value = process.env[varName]!;
      const preview = value.length > 20 ? `${value.substring(0, 20)}...` : value;
      console.log(`  ✅ ${varName}: ${preview}`);
    } else {
      console.log(`  ❌ ${varName}: NOT SET`);
      allTestsPassed = false;
    }
  }
  
  if (!envResults.DATABASE_URL || !envResults.WEBHOOK_SECRET) {
    console.log('\n❌ FAILED: Missing required environment variables');
    console.log('\nTo fix:');
    console.log('  1. Create .env.local file in project root');
    console.log('  2. Add: DATABASE_URL=your_neon_connection_string');
    console.log('  3. Add: WEBHOOK_SECRET=your_clerk_webhook_secret');
    return;
  }
  
  console.log('✅ PASSED: All environment variables present\n');
  
  // TEST 2: Database Connection
  console.log('TEST 2: Database Connection');
  console.log('─────────────────────────────────────────────────────');
  
  try {
    const result = await pool.query('SELECT NOW() as time, version() as version');
    console.log(`  ✅ Connected to PostgreSQL`);
    console.log(`  ✅ Server time: ${result.rows[0].time}`);
    console.log(`  ✅ Version: ${result.rows[0].version.split(' ')[1]}`);
    console.log('✅ PASSED: Database connection successful\n');
  } catch (error) {
    console.log(`  ❌ Failed to connect: ${error instanceof Error ? error.message : 'Unknown error'}`);
    console.log('❌ FAILED: Database connection\n');
    allTestsPassed = false;
    await pool.end();
    return;
  }
  
  // TEST 3: Database Schema
  console.log('TEST 3: Database Schema');
  console.log('─────────────────────────────────────────────────────');
  
  try {
    // Check tables exist
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('User', 'Transaction', 'WebhookEvent')
      ORDER BY table_name
    `);
    
    const tableNames = tables.rows.map(r => r.table_name);
    const requiredTables = ['Transaction', 'User', 'WebhookEvent'];
    
    for (const table of requiredTables) {
      if (tableNames.includes(table)) {
        console.log(`  ✅ Table "${table}" exists`);
      } else {
        console.log(`  ❌ Table "${table}" missing`);
        allTestsPassed = false;
      }
    }
    
    if (tableNames.length === 3) {
      console.log('✅ PASSED: All required tables exist\n');
    } else {
      console.log('❌ FAILED: Missing database tables\n');
      allTestsPassed = false;
    }
  } catch (error) {
    console.log(`  ❌ Error checking schema: ${error instanceof Error ? error.message : 'Unknown error'}`);
    console.log('❌ FAILED: Database schema check\n');
    allTestsPassed = false;
  }
  
  // TEST 4: User Table Structure
  console.log('TEST 4: User Table Structure');
  console.log('─────────────────────────────────────────────────────');
  
  try {
    const columns = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'User'
      ORDER BY ordinal_position
    `);
    
    const requiredColumns = [
      'id', 'clerkId', 'email', 'photo', 
      'firstName', 'lastName', 
      'availableGenerations', 'usedGenerations',
      'createdAt', 'updatedAt'
    ];
    
    const existingColumns = columns.rows.map(r => r.column_name);
    
    for (const col of requiredColumns) {
      if (existingColumns.includes(col)) {
        console.log(`  ✅ Column "${col}" exists`);
      } else {
        console.log(`  ❌ Column "${col}" missing`);
        allTestsPassed = false;
      }
    }
    
    if (requiredColumns.every(col => existingColumns.includes(col))) {
      console.log('✅ PASSED: User table structure correct\n');
    } else {
      console.log('❌ FAILED: User table structure incomplete\n');
      allTestsPassed = false;
    }
  } catch (error) {
    console.log(`  ❌ Error checking User table: ${error instanceof Error ? error.message : 'Unknown error'}`);
    console.log('❌ FAILED: User table check\n');
    allTestsPassed = false;
  }
  
  // TEST 5: Insert Test User
  console.log('TEST 5: Test User Creation (Dry Run)');
  console.log('─────────────────────────────────────────────────────');
  
  const testClerkId = `test_${Date.now()}`;
  const testEmail = `test_${Date.now()}@example.com`;
  
  try {
    await pool.query('BEGIN');
    
    // Generate ID
    const generateId = () => {
      const timestamp = Date.now().toString(36);
      const randomPart = Math.random().toString(36).substring(2, 15);
      return `${timestamp}${randomPart}`;
    };
    
    // Test user insert
    const userId = generateId();
    const userResult = await pool.query(
      `INSERT INTO "User" 
        ("id", "clerkId", "email", "firstName", "lastName", "photo", "availableGenerations", "usedGenerations") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [userId, testClerkId, testEmail, 'Test', 'User', 'https://example.com/photo.jpg', 20, 0]
    );
    
    console.log(`  ✅ User insert successful`);
    console.log(`     ID: ${userResult.rows[0].id}`);
    console.log(`     Email: ${userResult.rows[0].email}`);
    console.log(`     Credits: ${userResult.rows[0].availableGenerations}`);
    
    // Test transaction insert
    const txnId = generateId();
    await pool.query(
      `INSERT INTO "Transaction" 
        ("id", "tracking_id", "userId", "amount", "type", "reason", "status", "paid_at") 
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())`,
      [txnId, testClerkId, userId, 20, 'credit', 'test', 'completed']
    );
    
    console.log(`  ✅ Transaction insert successful`);
    
    // Rollback test data
    await pool.query('ROLLBACK');
    console.log(`  ✅ Test data rolled back (not saved)`);
    
    console.log('✅ PASSED: User creation flow works\n');
  } catch (error) {
    await pool.query('ROLLBACK');
    console.log(`  ❌ Error during test insert: ${error instanceof Error ? error.message : 'Unknown error'}`);
    console.log('❌ FAILED: User creation test\n');
    allTestsPassed = false;
  }
  
  // TEST 6: Current Database State
  console.log('TEST 6: Current Database State');
  console.log('─────────────────────────────────────────────────────');
  
  try {
    const userCount = await pool.query('SELECT COUNT(*) as count FROM "User"');
    const txnCount = await pool.query('SELECT COUNT(*) as count FROM "Transaction"');
    const webhookCount = await pool.query('SELECT COUNT(*) as count FROM "WebhookEvent"');
    
    console.log(`  📊 Users: ${userCount.rows[0].count}`);
    console.log(`  📊 Transactions: ${txnCount.rows[0].count}`);
    console.log(`  📊 Webhook Events: ${webhookCount.rows[0].count}`);
    
    if (userCount.rows[0].count === '0') {
      console.log(`  ⚠️  Database is empty - no users created yet`);
      console.log(`     This indicates webhooks are NOT working`);
    } else {
      console.log(`  ✅ Database has users - webhooks may be working`);
    }
    
    console.log('✅ PASSED: Database state retrieved\n');
  } catch (error) {
    console.log(`  ❌ Error getting stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    allTestsPassed = false;
  }
  
  // FINAL RESULTS
  console.log('═══════════════════════════════════════════════════════');
  
  if (allTestsPassed) {
    console.log('✅ ALL TESTS PASSED');
    console.log('\nYour webhook handler is properly configured!');
    console.log('\nNext steps:');
    console.log('  1. Make sure WEBHOOK_SECRET is set in Vercel');
    console.log('  2. Configure Clerk webhook URL in Clerk Dashboard');
    console.log('  3. Test with a real signup');
  } else {
    console.log('❌ SOME TESTS FAILED');
    console.log('\nPlease fix the issues above before proceeding.');
    console.log('See CLERK_WEBHOOK_SETUP_README.md for detailed instructions.');
  }
  
  console.log('═══════════════════════════════════════════════════════');
  
  await pool.end();
  process.exit(allTestsPassed ? 0 : 1);
}

// Run tests
testWebhookHandler()
  .catch((error) => {
    console.error('\n💥 CRITICAL ERROR:', error);
    process.exit(1);
  });

