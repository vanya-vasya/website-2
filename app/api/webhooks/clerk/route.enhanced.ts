/* eslint-disable camelcase */

/**
 * ENHANCED CLERK WEBHOOK HANDLER WITH COMPREHENSIVE DIAGNOSTICS
 * 
 * This version includes:
 * - Detailed request logging
 * - Environment variable validation
 * - Database connectivity checks
 * - Structured error handling
 * - Performance monitoring
 */

import { clerkClient, WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Webhook } from "svix";
import { deleteUser, updateUser } from "@/lib/actions/user.actions";
import db from "@/lib/db";

// Logging utility with timestamps
const log = {
  info: (message: string, data?: any) => {
    console.log(`[${new Date().toISOString()}] [INFO] ${message}`, data || '');
  },
  error: (message: string, error?: any) => {
    console.error(`[${new Date().toISOString()}] [ERROR] ${message}`, error || '');
  },
  debug: (message: string, data?: any) => {
    if (process.env.DEBUG_WEBHOOKS === 'true') {
      console.log(`[${new Date().toISOString()}] [DEBUG] ${message}`, data || '');
    }
  },
  warn: (message: string, data?: any) => {
    console.warn(`[${new Date().toISOString()}] [WARN] ${message}`, data || '');
  }
};

/**
 * Validate environment variables
 */
function validateEnvironment(): { valid: boolean; missing: string[] } {
  const required = ['WEBHOOK_SECRET', 'DATABASE_URL'];
  const missing: string[] = [];
  
  for (const key of required) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }
  
  return {
    valid: missing.length === 0,
    missing
  };
}

/**
 * Test database connectivity
 */
async function testDatabaseConnection(): Promise<{ connected: boolean; error?: string }> {
  try {
    await db.query('SELECT 1 as test');
    return { connected: true };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * GET endpoint for health checks
 */
export async function GET(req: Request) {
  log.info('=== CLERK WEBHOOK HEALTH CHECK ===');
  
  // Check environment
  const envCheck = validateEnvironment();
  
  // Check database
  const dbCheck = await testDatabaseConnection();
  
  // Get user count
  let userCount = 0;
  try {
    const result = await db.query('SELECT COUNT(*) as count FROM "User"');
    userCount = parseInt(result.rows[0].count);
  } catch (error) {
    log.error('Failed to get user count', error);
  }
  
  const health = {
    status: envCheck.valid && dbCheck.connected ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    environment: {
      valid: envCheck.valid,
      missing: envCheck.missing,
      hasWebhookSecret: !!process.env.WEBHOOK_SECRET,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
    },
    database: {
      connected: dbCheck.connected,
      error: dbCheck.error,
      userCount
    },
    endpoint: {
      method: 'POST',
      path: '/api/webhooks/clerk',
      framework: 'Next.js 14 App Router'
    }
  };
  
  log.info('Health check result', health);
  
  return NextResponse.json(health, {
    status: health.status === 'healthy' ? 200 : 503
  });
}

/**
 * POST endpoint for Clerk webhooks
 */
export async function POST(req: Request) {
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const startTime = Date.now();
  
  log.info('═══════════════════════════════════════════════════════');
  log.info(`[${requestId}] 📥 CLERK WEBHOOK RECEIVED`);
  log.info('═══════════════════════════════════════════════════════');
  
  try {
    // STEP 1: Validate Environment
    log.info(`[${requestId}] Step 1: Validating environment...`);
    const envCheck = validateEnvironment();
    
    if (!envCheck.valid) {
      log.error(`[${requestId}] ❌ Missing environment variables`, envCheck.missing);
      return NextResponse.json(
        {
          error: 'Server configuration error',
          message: 'Missing required environment variables',
          missing: envCheck.missing,
          requestId
        },
        { status: 500 }
      );
    }
    
    const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET!;
    log.info(`[${requestId}] ✅ Environment validated`);
    log.debug(`[${requestId}] WEBHOOK_SECRET present: ${WEBHOOK_SECRET.substring(0, 10)}...`);
    
    // STEP 2: Extract Headers
    log.info(`[${requestId}] Step 2: Extracting Svix headers...`);
    const headerPayload = headers();
    const svix_id = headerPayload.get("svix-id");
    const svix_timestamp = headerPayload.get("svix-timestamp");
    const svix_signature = headerPayload.get("svix-signature");
    
    log.debug(`[${requestId}] Headers extracted`, {
      svix_id,
      svix_timestamp,
      svix_signature: svix_signature ? `${svix_signature.substring(0, 20)}...` : null
    });
    
    if (!svix_id || !svix_timestamp || !svix_signature) {
      log.error(`[${requestId}] ❌ Missing Svix headers`, {
        has_svix_id: !!svix_id,
        has_svix_timestamp: !!svix_timestamp,
        has_svix_signature: !!svix_signature
      });
      return NextResponse.json(
        {
          error: 'Missing Svix headers',
          details: {
            svix_id: !!svix_id,
            svix_timestamp: !!svix_timestamp,
            svix_signature: !!svix_signature
          },
          requestId
        },
        { status: 400 }
      );
    }
    
    log.info(`[${requestId}] ✅ Svix headers present`);
    
    // STEP 3: Parse Body
    log.info(`[${requestId}] Step 3: Parsing request body...`);
    let payload: any;
    let body: string;
    
    try {
      payload = await req.json();
      body = JSON.stringify(payload);
      log.info(`[${requestId}] ✅ Body parsed (${body.length} bytes)`);
      log.debug(`[${requestId}] Payload type: ${payload.type}`);
      log.debug(`[${requestId}] Payload data.id: ${payload.data?.id}`);
    } catch (error) {
      log.error(`[${requestId}] ❌ Failed to parse body`, error);
      return NextResponse.json(
        {
          error: 'Invalid JSON payload',
          requestId
        },
        { status: 400 }
      );
    }
    
    // STEP 4: Verify Signature
    log.info(`[${requestId}] Step 4: Verifying webhook signature...`);
    const wh = new Webhook(WEBHOOK_SECRET);
    let evt: WebhookEvent;
    
    try {
      evt = wh.verify(body, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      }) as WebhookEvent;
      log.info(`[${requestId}] ✅ Signature verified successfully`);
    } catch (error) {
      log.error(`[${requestId}] ❌ Signature verification failed`, {
        error: error instanceof Error ? error.message : 'Unknown error',
        svix_id,
        body_length: body.length
      });
      return NextResponse.json(
        {
          error: 'Signature verification failed',
          message: 'Invalid webhook signature',
          requestId
        },
        { status: 401 }
      );
    }
    
    // STEP 5: Test Database Connection
    log.info(`[${requestId}] Step 5: Testing database connection...`);
    const dbCheck = await testDatabaseConnection();
    
    if (!dbCheck.connected) {
      log.error(`[${requestId}] ❌ Database not connected`, dbCheck.error);
      return NextResponse.json(
        {
          error: 'Database connection failed',
          details: dbCheck.error,
          requestId
        },
        { status: 500 }
      );
    }
    
    log.info(`[${requestId}] ✅ Database connected`);
    
    // STEP 6: Process Event
    const { id } = evt.data;
    const eventType = evt.type;
    
    log.info(`[${requestId}] Step 6: Processing event`, {
      type: eventType,
      userId: id
    });
    
    // Handle user.created event
    if (eventType === "user.created") {
      log.info(`[${requestId}] 👤 Processing user.created event`);
      
      const { id, email_addresses, image_url, first_name, last_name } = evt.data;
      const svixEventId = evt.data.id || svix_id;
      const email = email_addresses[0]?.email_address;
      
      log.info(`[${requestId}] User details`, {
        clerkId: id,
        email,
        firstName: first_name,
        lastName: last_name
      });
      
      try {
        // Check idempotency
        log.info(`[${requestId}] Checking for duplicate webhook...`);
        const existingEventResult = await db.query(
          'SELECT * FROM "WebhookEvent" WHERE "eventId" = $1',
          [svixEventId]
        );
        
        if (existingEventResult.rows.length > 0 && existingEventResult.rows[0].processed) {
          log.warn(`[${requestId}] ⚠️ Webhook already processed (idempotent)`, {
            eventId: svixEventId
          });
          
          const existingUserResult = await db.query(
            'SELECT * FROM "User" WHERE "clerkId" = $1',
            [id]
          );
          
          return NextResponse.json({
            message: "Already processed",
            user: existingUserResult.rows[0],
            idempotent: true,
            requestId
          });
        }
        
        log.info(`[${requestId}] No duplicate found, proceeding with creation...`);
        
        // Start transaction
        log.info(`[${requestId}] 🔄 Starting database transaction...`);
        const result = await db.transaction(async (client) => {
          // Create webhook event
          const webhookEventId = db.generateId();
          await client.query(
            `INSERT INTO "WebhookEvent" ("id", "eventId", "eventType", "processed") 
             VALUES ($1, $2, $3, false)`,
            [webhookEventId, svixEventId, "user.created"]
          );
          log.info(`[${requestId}]   ✓ Webhook event record created`);
          
          // Create user
          const userId = db.generateId();
          const userResult = await client.query(
            `INSERT INTO "User" 
              ("id", "clerkId", "email", "firstName", "lastName", "photo", "availableGenerations") 
             VALUES ($1, $2, $3, $4, $5, $6, 20) 
             RETURNING *`,
            [userId, id, email, first_name, last_name, image_url]
          );
          const newUser = userResult.rows[0];
          log.info(`[${requestId}]   ✓ User created`, {
            userId: newUser.id,
            email: newUser.email,
            credits: newUser.availableGenerations
          });
          
          // Create transaction record
          const transactionId = db.generateId();
          const transactionResult = await client.query(
            `INSERT INTO "Transaction" 
              ("id", "tracking_id", "userId", "amount", "type", "reason", "status", "webhookEventId", "paid_at") 
             VALUES ($1, $2, $3, 20, 'credit', 'signup bonus', 'completed', $4, NOW()) 
             RETURNING *`,
            [transactionId, id, newUser.id, svixEventId]
          );
          const transaction = transactionResult.rows[0];
          log.info(`[${requestId}]   ✓ Transaction created`, {
            transactionId: transaction.id,
            amount: transaction.amount
          });
          
          // Mark webhook as processed
          await client.query(
            'UPDATE "WebhookEvent" SET "processed" = true, "processedAt" = NOW() WHERE "eventId" = $1',
            [svixEventId]
          );
          log.info(`[${requestId}]   ✓ Webhook marked as processed`);
          
          return { user: newUser, transaction };
        });
        
        log.info(`[${requestId}] ✅ Transaction committed successfully`);
        
        // Update Clerk metadata
        log.info(`[${requestId}] Updating Clerk user metadata...`);
        try {
          await clerkClient.users.updateUserMetadata(id, {
            publicMetadata: {
              userId: result.user.id,
            },
          });
          log.info(`[${requestId}] ✅ Clerk metadata updated`);
        } catch (error) {
          log.warn(`[${requestId}] ⚠️ Failed to update Clerk metadata (non-critical)`, error);
        }
        
        const duration = Date.now() - startTime;
        log.info('═══════════════════════════════════════════════════════');
        log.info(`[${requestId}] ✅ SUCCESS: User created with 20 credits`);
        log.info(`[${requestId}] Duration: ${duration}ms`);
        log.info('═══════════════════════════════════════════════════════');
        
        return NextResponse.json({
          message: "OK",
          user: result.user,
          transaction: result.transaction,
          requestId,
          duration
        });
        
      } catch (error) {
        const duration = Date.now() - startTime;
        log.error('═══════════════════════════════════════════════════════');
        log.error(`[${requestId}] ❌ FAILED: Error creating user`);
        log.error(`[${requestId}] Error:`, error);
        log.error(`[${requestId}] Duration: ${duration}ms`);
        log.error('═══════════════════════════════════════════════════════');
        
        return NextResponse.json(
          {
            error: 'Database operation failed',
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            requestId,
            duration
          },
          { status: 500 }
        );
      }
    }
    
    // Handle user.updated event
    if (eventType === "user.updated") {
      log.info(`[${requestId}] 🔄 Processing user.updated event`);
      const { id, image_url, first_name, last_name } = evt.data;
      
      try {
        const user = {
          firstName: first_name,
          lastName: last_name,
          photo: image_url,
        };
        
        const updatedUser = await updateUser(id, user);
        log.info(`[${requestId}] ✅ User updated successfully`);
        
        return NextResponse.json({
          message: "OK",
          user: updatedUser,
          requestId
        });
      } catch (error) {
        log.error(`[${requestId}] ❌ Failed to update user`, error);
        return NextResponse.json(
          {
            error: 'Failed to update user',
            message: error instanceof Error ? error.message : 'Unknown error',
            requestId
          },
          { status: 500 }
        );
      }
    }
    
    // Handle user.deleted event
    if (eventType === "user.deleted") {
      log.info(`[${requestId}] 🗑️  Processing user.deleted event`);
      const { id } = evt.data;
      
      try {
        const deletedUser = await deleteUser(id!);
        log.info(`[${requestId}] ✅ User deleted successfully`);
        
        return NextResponse.json({
          message: "OK",
          user: deletedUser,
          requestId
        });
      } catch (error) {
        log.error(`[${requestId}] ❌ Failed to delete user`, error);
        return NextResponse.json(
          {
            error: 'Failed to delete user',
            message: error instanceof Error ? error.message : 'Unknown error',
            requestId
          },
          { status: 500 }
        );
      }
    }
    
    // Unknown event type
    log.warn(`[${requestId}] ⚠️ Unknown event type: ${eventType}`);
    return NextResponse.json({
      message: "Event type not handled",
      eventType,
      requestId
    }, { status: 200 });
    
  } catch (error) {
    const duration = Date.now() - startTime;
    log.error('═══════════════════════════════════════════════════════');
    log.error(`[${requestId}] 💥 CRITICAL ERROR`);
    log.error(`[${requestId}] Error:`, error);
    log.error(`[${requestId}] Stack:`, error instanceof Error ? error.stack : 'No stack');
    log.error(`[${requestId}] Duration: ${duration}ms`);
    log.error('═══════════════════════════════════════════════════════');
    
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        requestId,
        duration
      },
      { status: 500 }
    );
  }
}

