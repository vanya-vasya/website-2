/**
 * Database Insert Diagnostics Script
 * 
 * This script tests database inserts and provides detailed diagnostics
 * for troubleshooting Neon PostgreSQL User table insert failures
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

interface DiagnosticResult {
  step: string;
  success: boolean;
  error?: string;
  data?: any;
  timestamp: string;
}

const results: DiagnosticResult[] = [];

function logResult(step: string, success: boolean, data?: any, error?: string) {
  const result: DiagnosticResult = {
    step,
    success,
    timestamp: new Date().toISOString(),
    ...(data && { data }),
    ...(error && { error }),
  };
  results.push(result);
  console.log(`\n[${ success ? '✓' : '✗' }] ${step}`);
  if (data) console.log('   Data:', JSON.stringify(data, null, 2));
  if (error) console.log('   Error:', error);
}

async function runDiagnostics() {
  console.log('='.repeat(80));
  console.log('DATABASE INSERT DIAGNOSTICS - NEON POSTGRESQL');
  console.log('='.repeat(80));

  // Step 1: Test Database Connection
  console.log('\n--- STEP 1: DATABASE CONNECTION ---');
  try {
    await prisma.$connect();
    logResult('Database connection established', true);
  } catch (error) {
    logResult('Database connection failed', false, undefined, String(error));
    await cleanup();
    return;
  }

  // Step 2: Check Environment Variables
  console.log('\n--- STEP 2: ENVIRONMENT CONFIGURATION ---');
  const dbUrl = process.env.DATABASE_URL;
  const dbUrlMasked = dbUrl?.replace(/:[^:@]+@/, ':****@');
  logResult('DATABASE_URL loaded', !!dbUrl, { url: dbUrlMasked });

  // Step 3: Query Database Metadata
  console.log('\n--- STEP 3: DATABASE SCHEMA METADATA ---');
  try {
    const tableInfo: any = await prisma.$queryRaw`
      SELECT 
        table_name, 
        column_name, 
        data_type, 
        is_nullable,
        column_default
      FROM information_schema.columns 
      WHERE table_schema = 'public' AND table_name = 'User'
      ORDER BY ordinal_position;
    `;
    logResult('User table schema retrieved', true, tableInfo);
  } catch (error) {
    logResult('Failed to retrieve table schema', false, undefined, String(error));
  }

  // Step 4: Check Constraints
  console.log('\n--- STEP 4: TABLE CONSTRAINTS ---');
  try {
    const constraints: any = await prisma.$queryRaw`
      SELECT 
        conname as constraint_name,
        contype as constraint_type,
        pg_get_constraintdef(oid) as definition
      FROM pg_constraint
      WHERE conrelid = '"User"'::regclass;
    `;
    logResult('Constraints retrieved', true, constraints);
  } catch (error) {
    logResult('Failed to retrieve constraints', false, undefined, String(error));
  }

  // Step 5: Check Existing Users Count
  console.log('\n--- STEP 5: EXISTING DATA CHECK ---');
  try {
    const userCount = await prisma.user.count();
    logResult('User count retrieved', true, { count: userCount });
  } catch (error) {
    logResult('Failed to count users', false, undefined, String(error));
  }

  // Step 6: Test Simple Insert
  console.log('\n--- STEP 6: TEST INSERT (Method 1: Prisma ORM) ---');
  const testClerkId = `test_clerk_${Date.now()}`;
  const testEmail = `test_${Date.now()}@example.com`;
  
  try {
    const newUser = await prisma.user.create({
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
    logResult('Prisma insert succeeded', true, newUser);
  } catch (error: any) {
    logResult('Prisma insert failed', false, undefined, error.message);
    console.log('   Full error:', error);
  }

  // Step 7: Test Raw SQL Insert
  console.log('\n--- STEP 7: TEST INSERT (Method 2: Raw SQL) ---');
  const testClerkId2 = `test_clerk_raw_${Date.now()}`;
  const testEmail2 = `test_raw_${Date.now()}@example.com`;
  
  try {
    const rawResult: any = await prisma.$executeRaw`
      INSERT INTO "User" (
        id, "clerkId", email, photo, "firstName", "lastName", 
        "usedGenerations", "availableGenerations", "createdAt", "updatedAt"
      ) VALUES (
        gen_random_uuid()::text,
        ${testClerkId2},
        ${testEmail2},
        'https://example.com/photo2.jpg',
        'Test',
        'User',
        0,
        20,
        NOW(),
        NOW()
      )
      RETURNING *;
    `;
    logResult('Raw SQL insert succeeded', true, { affectedRows: rawResult });
  } catch (error: any) {
    logResult('Raw SQL insert failed', false, undefined, error.message);
    console.log('   Full error:', error);
  }

  // Step 8: Test Transaction Insert
  console.log('\n--- STEP 8: TEST INSERT (Method 3: Transaction) ---');
  const testClerkId3 = `test_clerk_txn_${Date.now()}`;
  const testEmail3 = `test_txn_${Date.now()}@example.com`;
  
  try {
    const txnResult = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          clerkId: testClerkId3,
          email: testEmail3,
          photo: 'https://example.com/photo3.jpg',
          firstName: 'Test',
          lastName: 'Transaction',
          availableGenerations: 20,
          usedGenerations: 0,
        },
      });
      return user;
    });
    logResult('Transaction insert succeeded', true, txnResult);
  } catch (error: any) {
    logResult('Transaction insert failed', false, undefined, error.message);
    console.log('   Full error:', error);
  }

  // Step 9: Verify Inserted Records
  console.log('\n--- STEP 9: VERIFY INSERTED RECORDS ---');
  try {
    const insertedUsers = await prisma.user.findMany({
      where: {
        OR: [
          { clerkId: testClerkId },
          { clerkId: testClerkId2 },
          { clerkId: testClerkId3 },
        ],
      },
    });
    logResult('Verification query succeeded', true, { 
      count: insertedUsers.length,
      users: insertedUsers.map(u => ({ id: u.id, clerkId: u.clerkId, email: u.email })),
    });
  } catch (error: any) {
    logResult('Verification query failed', false, undefined, error.message);
  }

  // Step 10: Test Duplicate Insert (Should Fail)
  console.log('\n--- STEP 10: TEST DUPLICATE INSERT (Expected to Fail) ---');
  try {
    await prisma.user.create({
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
    logResult('Duplicate insert unexpectedly succeeded', false);
  } catch (error: any) {
    if (error.code === 'P2002') {
      logResult('Duplicate insert correctly rejected (unique constraint)', true, { 
        errorCode: error.code,
        target: error.meta?.target,
      });
    } else {
      logResult('Duplicate insert failed with unexpected error', false, undefined, error.message);
    }
  }

  // Step 11: Connection Pool Status
  console.log('\n--- STEP 11: CONNECTION POOL STATUS ---');
  try {
    const poolStatus: any = await prisma.$queryRaw`
      SELECT 
        count(*) as total_connections,
        count(*) FILTER (WHERE state = 'active') as active_connections,
        count(*) FILTER (WHERE state = 'idle') as idle_connections
      FROM pg_stat_activity
      WHERE datname = current_database();
    `;
    logResult('Connection pool status retrieved', true, poolStatus[0]);
  } catch (error: any) {
    logResult('Failed to retrieve connection pool status', false, undefined, error.message);
  }

  await cleanup();
}

async function cleanup() {
  console.log('\n--- CLEANUP ---');
  try {
    // Clean up test users
    const deleted = await prisma.user.deleteMany({
      where: {
        email: {
          startsWith: 'test_',
        },
      },
    });
    console.log(`Deleted ${deleted.count} test users`);
  } catch (error) {
    console.log('Cleanup error:', error);
  }

  await prisma.$disconnect();
  console.log('Disconnected from database');

  // Print Summary
  console.log('\n' + '='.repeat(80));
  console.log('DIAGNOSTIC SUMMARY');
  console.log('='.repeat(80));
  const successCount = results.filter(r => r.success).length;
  const failureCount = results.filter(r => !r.success).length;
  console.log(`✓ Successful: ${successCount}`);
  console.log(`✗ Failed: ${failureCount}`);
  console.log('\nResults:');
  results.forEach((r, i) => {
    console.log(`${i + 1}. [${r.success ? '✓' : '✗'}] ${r.step}`);
    if (r.error) console.log(`   Error: ${r.error}`);
  });

  // Exit with appropriate code
  process.exit(failureCount > 0 ? 1 : 0);
}

// Handle errors
process.on('unhandledRejection', async (error) => {
  console.error('Unhandled rejection:', error);
  await cleanup();
});

// Run diagnostics
runDiagnostics().catch(async (error) => {
  console.error('Fatal error:', error);
  await cleanup();
});


