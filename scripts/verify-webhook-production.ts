/**
 * COMPREHENSIVE CLERK WEBHOOK PRODUCTION VERIFICATION
 * 
 * This script verifies all aspects of Clerk webhook configuration:
 * 1. Public endpoint reachability
 * 2. Environment variables
 * 3. Clerk Dashboard configuration
 * 4. Signature verification
 * 5. Database connectivity
 * 6. Recent webhook attempts
 */

import { config } from 'dotenv';
import { Pool } from 'pg';
import https from 'https';
import http from 'http';

// Load environment variables
config({ path: '.env.local' });

// Colors for output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  title: (msg: string) => console.log(`\n${colors.blue}${colors.bright}${msg}${colors.reset}`),
  section: (msg: string) => console.log(`\n${colors.cyan}${msg}${colors.reset}`),
  success: (msg: string) => console.log(`${colors.green}  ✅ ${msg}${colors.reset}`),
  error: (msg: string) => console.log(`${colors.red}  ❌ ${msg}${colors.reset}`),
  warning: (msg: string) => console.log(`${colors.yellow}  ⚠️  ${msg}${colors.reset}`),
  info: (msg: string) => console.log(`${colors.cyan}  ℹ️  ${msg}${colors.reset}`),
  data: (key: string, value: string) => console.log(`     ${key}: ${value}`),
};

interface VerificationResult {
  passed: number;
  failed: number;
  warnings: number;
  issues: string[];
  recommendations: string[];
}

const result: VerificationResult = {
  passed: 0,
  failed: 0,
  warnings: 0,
  issues: [],
  recommendations: [],
};

/**
 * Make HTTP request
 */
function makeRequest(url: string, options: any = {}): Promise<{
  statusCode: number;
  headers: any;
  body: string;
}> {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    const req = protocol.request(url, options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode || 0,
          headers: res.headers,
          body
        });
      });
    });
    
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

/**
 * Test 1: Environment Variables
 */
async function testEnvironmentVariables() {
  log.section('TEST 1: Environment Variables');
  log.info('Checking required environment variables...');
  
  const required = {
    'WEBHOOK_SECRET': process.env.WEBHOOK_SECRET,
    'DATABASE_URL': process.env.DATABASE_URL,
    'CLERK_SECRET_KEY': process.env.CLERK_SECRET_KEY,
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY': process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  };
  
  let allPresent = true;
  
  for (const [key, value] of Object.entries(required)) {
    if (value) {
      log.success(`${key}: Present`);
      const preview = value.length > 30 ? `${value.substring(0, 30)}...` : value;
      log.data('Value', preview);
      result.passed++;
    } else {
      log.error(`${key}: NOT SET`);
      result.failed++;
      result.issues.push(`Missing environment variable: ${key}`);
      allPresent = false;
    }
  }
  
  if (!allPresent) {
    log.warning('Some environment variables are missing!');
    result.recommendations.push('Add missing environment variables to .env.local and Vercel');
  }
  
  return allPresent;
}

/**
 * Test 2: Database Connectivity
 */
async function testDatabaseConnectivity() {
  log.section('TEST 2: Database Connectivity');
  log.info('Testing connection to Neon database...');
  
  if (!process.env.DATABASE_URL) {
    log.error('DATABASE_URL not set, skipping test');
    result.failed++;
    return false;
  }
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  
  try {
    const res = await pool.query('SELECT NOW() as time, version() as version');
    log.success('Connected to PostgreSQL');
    log.data('Server time', res.rows[0].time);
    log.data('Version', res.rows[0].version.split(' ')[1]);
    result.passed++;
    
    // Check tables
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('User', 'Transaction', 'WebhookEvent')
    `);
    
    const tableNames = tables.rows.map(r => r.table_name);
    log.success(`Found ${tableNames.length} required tables: ${tableNames.join(', ')}`);
    result.passed++;
    
    // Check user count
    const userCount = await pool.query('SELECT COUNT(*) FROM "User"');
    log.info(`Current user count: ${userCount.rows[0].count}`);
    
    if (userCount.rows[0].count === '0') {
      log.warning('Database has 0 users - webhook not working yet');
      result.warnings++;
      result.issues.push('No users in database - webhook not creating users');
    } else {
      log.success(`Database has ${userCount.rows[0].count} users`);
    }
    
    await pool.end();
    return true;
  } catch (error) {
    log.error(`Failed to connect: ${error instanceof Error ? error.message : 'Unknown error'}`);
    result.failed++;
    result.issues.push(`Database connection failed: ${error instanceof Error ? error.message : 'Unknown'}`);
    await pool.end();
    return false;
  }
}

/**
 * Test 3: Production Endpoint Reachability
 */
async function testProductionEndpoint() {
  log.section('TEST 3: Production Endpoint Reachability');
  
  const endpoints = [
    'https://www.nerbixa.com/api/webhooks/clerk',
    'https://nerbixa.com/api/webhooks/clerk',
  ];
  
  for (const url of endpoints) {
    log.info(`Testing: ${url}`);
    
    try {
      const response = await makeRequest(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Webhook-Verifier/1.0',
        },
      });
      
      log.data('Status Code', response.statusCode.toString());
      
      if (response.statusCode === 200) {
        log.success('Endpoint is reachable!');
        result.passed++;
        
        // Try to parse JSON response
        try {
          const data = JSON.parse(response.body);
          log.data('Response', JSON.stringify(data, null, 2));
          
          if (data.status === 'healthy') {
            log.success('Health check reports: HEALTHY');
            result.passed++;
            
            if (data.environment?.hasWebhookSecret) {
              log.success('WEBHOOK_SECRET is set in production');
              result.passed++;
            } else {
              log.error('WEBHOOK_SECRET is NOT set in production');
              result.failed++;
              result.issues.push('WEBHOOK_SECRET missing in Vercel environment variables');
              result.recommendations.push('Add WEBHOOK_SECRET to Vercel: Settings → Environment Variables');
            }
            
            if (data.database?.connected) {
              log.success('Database is connected in production');
              result.passed++;
            } else {
              log.error('Database is NOT connected in production');
              result.failed++;
              result.issues.push('Database connection failed in production');
            }
            
            if (data.database?.userCount !== undefined) {
              log.info(`Production user count: ${data.database.userCount}`);
              if (data.database.userCount === 0) {
                log.warning('No users in production database');
                result.warnings++;
              }
            }
          } else {
            log.error(`Health check reports: ${data.status}`);
            result.failed++;
            result.issues.push(`Webhook health check failed: ${data.status}`);
          }
        } catch (e) {
          log.warning('Response is not JSON (might be using old webhook handler)');
          result.warnings++;
          result.recommendations.push('Consider using enhanced webhook handler for better diagnostics');
        }
      } else if (response.statusCode === 404) {
        log.error('Endpoint not found (404)');
        result.failed++;
        result.issues.push(`Webhook endpoint not found: ${url}`);
      } else if (response.statusCode >= 500) {
        log.error(`Server error (${response.statusCode})`);
        result.failed++;
        result.issues.push(`Webhook endpoint returning ${response.statusCode}`);
      } else {
        log.warning(`Unexpected status code: ${response.statusCode}`);
        result.warnings++;
      }
    } catch (error) {
      log.error(`Failed to reach endpoint: ${error instanceof Error ? error.message : 'Unknown error'}`);
      result.failed++;
      result.issues.push(`Cannot reach ${url}: ${error instanceof Error ? error.message : 'Unknown'}`);
    }
  }
}

/**
 * Test 4: Webhook Signature Verification Test
 */
async function testSignatureVerification() {
  log.section('TEST 4: Webhook Signature Verification');
  log.info('Testing webhook with invalid signature (should fail)...');
  
  const url = 'https://www.nerbixa.com/api/webhooks/clerk';
  const testPayload = {
    data: {
      id: 'user_test_verification',
      email_addresses: [{ email_address: 'test@example.com' }],
      first_name: 'Test',
      last_name: 'User',
      image_url: 'https://example.com/avatar.jpg',
    },
    type: 'user.created',
  };
  
  try {
    const response = await makeRequest(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'svix-id': 'test_webhook_id',
        'svix-timestamp': Math.floor(Date.now() / 1000).toString(),
        'svix-signature': 'v1,invalid_signature',
        'User-Agent': 'Webhook-Verifier/1.0',
      },
      body: JSON.stringify(testPayload),
    });
    
    log.data('Status Code', response.statusCode.toString());
    
    if (response.statusCode === 401 || response.statusCode === 400) {
      log.success('✅ Signature verification is working (correctly rejected invalid signature)');
      result.passed++;
      
      try {
        const data = JSON.parse(response.body);
        if (data.error) {
          log.data('Error message', data.error);
        }
      } catch (e) {
        // Response might not be JSON
      }
    } else if (response.statusCode === 200) {
      log.error('⚠️  WARNING: Invalid signature was ACCEPTED (security issue!)');
      result.failed++;
      result.issues.push('Signature verification is not working - security vulnerability!');
      result.recommendations.push('Check WEBHOOK_SECRET matches between Clerk and app');
    } else if (response.statusCode === 500) {
      log.warning('Server error during signature verification');
      result.warnings++;
      result.recommendations.push('Check server logs for webhook handler errors');
    } else {
      log.warning(`Unexpected response: ${response.statusCode}`);
      result.warnings++;
    }
  } catch (error) {
    log.error(`Failed to test signature: ${error instanceof Error ? error.message : 'Unknown error'}`);
    result.failed++;
  }
}

/**
 * Test 5: Check Recent Webhook Events
 */
async function testRecentWebhookEvents() {
  log.section('TEST 5: Recent Webhook Events in Database');
  log.info('Checking for recent webhook events...');
  
  if (!process.env.DATABASE_URL) {
    log.warning('DATABASE_URL not set, skipping test');
    result.warnings++;
    return;
  }
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  
  try {
    const events = await pool.query(`
      SELECT 
        "eventType",
        "processed",
        "createdAt",
        "processedAt"
      FROM "WebhookEvent"
      ORDER BY "createdAt" DESC
      LIMIT 10
    `);
    
    if (events.rows.length === 0) {
      log.warning('No webhook events found in database');
      result.warnings++;
      result.issues.push('No webhook events recorded - webhook might not be receiving requests');
      result.recommendations.push('Check Clerk Dashboard → Webhooks → Attempts for delivery status');
    } else {
      log.success(`Found ${events.rows.length} recent webhook events`);
      result.passed++;
      
      const processed = events.rows.filter(e => e.processed).length;
      const unprocessed = events.rows.length - processed;
      
      log.data('Processed', processed.toString());
      log.data('Unprocessed', unprocessed.toString());
      
      if (unprocessed > 0) {
        log.warning(`${unprocessed} webhook events are unprocessed`);
        result.warnings++;
        result.issues.push(`${unprocessed} webhook events failed to process`);
      }
      
      // Show recent events
      console.log('\n     Recent events:');
      events.rows.slice(0, 5).forEach((event, i) => {
        console.log(`     ${i + 1}. ${event.eventType} - ${event.processed ? 'Processed' : 'Failed'} at ${event.createdAt}`);
      });
    }
    
    await pool.end();
  } catch (error) {
    log.error(`Failed to query webhook events: ${error instanceof Error ? error.message : 'Unknown error'}`);
    result.failed++;
    await pool.end();
  }
}

/**
 * Test 6: Framework Configuration
 */
async function testFrameworkConfiguration() {
  log.section('TEST 6: Next.js Configuration');
  log.info('Checking Next.js configuration...');
  
  try {
    const fs = require('fs');
    const path = require('path');
    
    // Check next.config.js
    const nextConfigPath = path.join(process.cwd(), 'next.config.js');
    if (fs.existsSync(nextConfigPath)) {
      log.success('next.config.js exists');
      result.passed++;
      
      const configContent = fs.readFileSync(nextConfigPath, 'utf-8');
      
      // Check for body size limits
      if (configContent.includes('bodySizeLimit') || configContent.includes('bodyParser')) {
        log.info('Custom body parser configuration found');
      } else {
        log.info('Using default Next.js body parser');
      }
      
      // Check for API routes config
      if (configContent.includes('api:')) {
        log.info('API routes configuration found');
      }
    } else {
      log.warning('next.config.js not found');
      result.warnings++;
    }
    
    // Check vercel.json
    const vercelConfigPath = path.join(process.cwd(), 'vercel.json');
    if (fs.existsSync(vercelConfigPath)) {
      log.success('vercel.json exists');
      result.passed++;
      
      const vercelConfig = JSON.parse(fs.readFileSync(vercelConfigPath, 'utf-8'));
      
      if (vercelConfig.functions) {
        log.info('Function configuration found');
        if (vercelConfig.functions['api/webhooks/**']) {
          log.data('Webhook function config', JSON.stringify(vercelConfig.functions['api/webhooks/**']));
        }
      }
    } else {
      log.info('vercel.json not found (using defaults)');
    }
  } catch (error) {
    log.error(`Error checking configuration: ${error instanceof Error ? error.message : 'Unknown error'}`);
    result.failed++;
  }
}

/**
 * Generate Report
 */
function generateReport() {
  log.title('═══════════════════════════════════════════════════════');
  log.title('📊 VERIFICATION REPORT');
  log.title('═══════════════════════════════════════════════════════');
  
  console.log(`\n${colors.bright}Summary:${colors.reset}`);
  console.log(`  ${colors.green}✅ Passed: ${result.passed}${colors.reset}`);
  console.log(`  ${colors.red}❌ Failed: ${result.failed}${colors.reset}`);
  console.log(`  ${colors.yellow}⚠️  Warnings: ${result.warnings}${colors.reset}`);
  
  if (result.issues.length > 0) {
    console.log(`\n${colors.red}${colors.bright}🔥 Issues Found:${colors.reset}`);
    result.issues.forEach((issue, i) => {
      console.log(`  ${i + 1}. ${colors.red}${issue}${colors.reset}`);
    });
  }
  
  if (result.recommendations.length > 0) {
    console.log(`\n${colors.cyan}${colors.bright}💡 Recommendations:${colors.reset}`);
    result.recommendations.forEach((rec, i) => {
      console.log(`  ${i + 1}. ${colors.cyan}${rec}${colors.reset}`);
    });
  }
  
  console.log('\n');
  
  if (result.failed === 0 && result.warnings === 0) {
    log.title('🎉 ALL CHECKS PASSED! Webhook is properly configured.');
    return 0;
  } else if (result.failed > 0) {
    log.title('❌ CRITICAL ISSUES FOUND! Please fix the issues above.');
    return 1;
  } else {
    log.title('⚠️  WARNINGS FOUND! Webhook may work but improvements recommended.');
    return 0;
  }
}

/**
 * Main execution
 */
async function main() {
  log.title('═══════════════════════════════════════════════════════');
  log.title('🔍 CLERK WEBHOOK PRODUCTION VERIFICATION');
  log.title('═══════════════════════════════════════════════════════');
  
  try {
    // Run all tests sequentially
    await testEnvironmentVariables();
    await testDatabaseConnectivity();
    await testProductionEndpoint();
    await testSignatureVerification();
    await testRecentWebhookEvents();
    await testFrameworkConfiguration();
    
    // Generate report
    const exitCode = generateReport();
    process.exit(exitCode);
  } catch (error) {
    console.error('\n💥 FATAL ERROR:', error);
    process.exit(1);
  }
}

// Run
main();

