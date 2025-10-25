import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import db from '@/lib/db';

/**
 * Networx Payment Webhook Handler
 * 
 * DATA SEPARATION POLICY:
 * ========================
 * 1. Transaction table: Stores ALL transaction data (payments, refunds, etc.)
 * 2. User table: Stores ONLY user profile and token balance (availableGenerations, usedGenerations)
 * 3. Users are created ONLY via Clerk webhook (user.created event)
 * 4. Payment webhook ONLY updates existing users' balance
 * 5. All transaction writes go exclusively to Transaction table with idempotency (webhookEventId)
 * 
 * IMPORTANT RULES:
 * - Never create users in payment webhook
 * - Never store transaction data in User table
 * - Always check idempotency before processing
 * - Only update User table for balance changes on successful payments
 */

// Verify webhook signature according to Networx documentation
function verifyWebhookSignature(data: Record<string, any>, signature: string, secretKey: string): boolean {
  const { signature: _, ...dataForSignature } = data;

  const sortedParams = Object.keys(dataForSignature)
    .sort()
    .reduce((obj: Record<string, any>, key) => {
      obj[key] = dataForSignature[key];
      return obj;
    }, {});

  const signString = Object.entries(sortedParams)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  const expectedSignature = crypto
    .createHmac('sha256', secretKey)
    .update(signString)
    .digest('hex');

  return expectedSignature === signature;
}

// Extract token amount from payment description
function extractTokensFromDescription(description: string): number | null {
  const match = description.match(/\((\d+)\s+Tokens?\)/i);
  return match ? parseInt(match[1], 10) : null;
}

// POST - Handle webhook notifications from Networx
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let transactionId: string | undefined;
  let userId: string | undefined;
  
  try {
    const body = await request.json();
    
    // LOG RAW BODY FOR DEBUGGING
    console.log('═══════════════════════════════════════════════════════');
    console.log('📥 Networx Webhook Received - RAW BODY:');
    console.log(JSON.stringify(body, null, 2));
    console.log('═══════════════════════════════════════════════════════');
    
    const { 
      status, 
      order_id, 
      transaction_id, 
      amount, 
      currency, 
      type,
      customer_email,
      error_message,
      tracking_id,
      description,
      payment_method_type,
      message,
      paid_at
    } = body;

    transactionId = transaction_id;
    userId = tracking_id;

    console.log('═══════════════════════════════════════════════════════');
    console.log('📥 Networx Webhook Parsed Data:');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Transaction ID:', transaction_id);
    console.log('Order ID:', order_id);
    console.log('Status:', status);
    console.log('Type:', type);
    console.log('Amount:', amount, currency);
    console.log('Tracking ID (User ID):', tracking_id);
    console.log('═══════════════════════════════════════════════════════');

    const secretKey = process.env.NETWORX_SECRET_KEY || 'dbfb6f4e977f49880a6ce3c939f1e7be645a5bb2596c04d9a3a7b32d52378950';
    if (!secretKey) {
      console.error('❌ NETWORX_SECRET_KEY not configured');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    // Verify webhook signature
    const signature = body.signature;
    if (!signature) {
      console.error('❌ Missing signature in webhook');
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    const isValidSignature = verifyWebhookSignature(body, signature, secretKey);
    if (!isValidSignature) {
      console.error('❌ Invalid webhook signature');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 403 }
      );
    }

    console.log('✅ Webhook signature verified');

    // Idempotency: Check for duplicates via webhookEventId
    if (transaction_id) {
      const existingTransaction = await db.query(
        'SELECT * FROM "Transaction" WHERE "webhookEventId" = $1',
        [transaction_id]
      );

      if (existingTransaction.rows.length > 0) {
        console.log('⚠️  Duplicate webhook detected - transaction already processed:', transaction_id);
        return NextResponse.json({ 
          status: 'ok',
          message: 'Transaction already processed',
          idempotent: true
        }, { status: 200 });
      }
    }

    // Process statuses according to Networx documentation
    switch (status) {
      case 'success':
      case 'successful':
        console.log(`💰 Processing successful payment for order ${order_id}`);
        
        if (!tracking_id) {
          console.error('❌ Missing tracking_id (userId) in successful payment webhook');
          return NextResponse.json(
            { error: 'Missing tracking_id for successful payment' },
            { status: 400 }
          );
        }

        // CRITICAL: Check user existence
        // We DO NOT create users in payment webhook
        // Users must be created only via Clerk webhook
        const userResult = await db.query(
          'SELECT * FROM "User" WHERE "clerkId" = $1',
          [tracking_id]
        );

        if (userResult.rows.length === 0) {
          console.error('❌ User not found:', tracking_id);
          console.error('⚠️  Payment received for non-existent user. User must be created via Clerk webhook first.');
          return NextResponse.json(
            { 
              error: 'User not found',
              message: 'User must be created before processing payments' 
            },
            { status: 404 }
          );
        }

        const user = userResult.rows[0];
        console.log('✅ User found:', user.email);
        console.log('Current balance:', user.availableGenerations);
        console.log('Used generations:', user.usedGenerations);

        // Extract token amount from description
        const tokensToAdd = description ? extractTokensFromDescription(description) : null;
        
        if (!tokensToAdd) {
          console.error('❌ Could not extract token amount from description:', description);
          return NextResponse.json(
            { error: 'Invalid payment description format' },
            { status: 400 }
          );
        }

        console.log('🎟️  Tokens to add:', tokensToAdd);

        // Execute operations in database transaction
        // IMPORTANT: All transaction data goes ONLY to Transaction table
        // In User table we update ONLY token balance (availableGenerations, usedGenerations)
        try {
          await db.transaction(async (client) => {
            // 1. Create transaction record in Transaction table
            const newTransactionId = db.generateId();
            await client.query(
              `INSERT INTO "Transaction" 
                ("id", "tracking_id", "userId", "status", "amount", "currency", "description", 
                 "type", "payment_method_type", "message", "paid_at", "webhookEventId") 
               VALUES ($1, $2, $3, 'successful', $4, $5, $6, $7, $8, $9, $10, $11)`,
              [
                newTransactionId,
                transaction_id || tracking_id,
                tracking_id,
                amount ? parseInt(amount) : null,
                currency || 'USD',
                description || `Payment for ${tokensToAdd} tokens`,
                type || 'payment',
                payment_method_type || 'card',
                message || 'Payment successful',
                paid_at ? new Date(paid_at) : new Date(),
                transaction_id
              ]
            );

            console.log('✅ Transaction record created in Transaction table:', newTransactionId);
            console.log('   Transaction ID:', transaction_id);
            console.log('   Amount:', amount, currency);
            console.log('   Tokens:', tokensToAdd);

            // 2. Update ONLY user balance (DO NOT create new user)
            // User table contains ONLY profile and balance, NOT transaction data
            const newBalance = user.availableGenerations - user.usedGenerations + tokensToAdd;
            await client.query(
              'UPDATE "User" SET "availableGenerations" = $1, "usedGenerations" = 0 WHERE "clerkId" = $2',
              [newBalance, tracking_id]
            );

            console.log('✅ User balance updated in User table');
            console.log('   Previous balance:', user.availableGenerations);
            console.log('   Used generations:', user.usedGenerations);
            console.log('   New available generations:', newBalance);
            console.log('   Reset used generations:', 0);
          });

          const processingTime = Date.now() - startTime;
          console.log('═══════════════════════════════════════════════════════');
          console.log('✅ Payment processed successfully');
          console.log('Processing time:', processingTime, 'ms');
          console.log('User ID:', tracking_id);
          console.log('Transaction ID:', transaction_id);
          console.log('Tokens added:', tokensToAdd);
          console.log('═══════════════════════════════════════════════════════');

        } catch (dbError) {
          console.error('❌ Database transaction failed:', dbError);
          throw dbError;
        }

        break;

      case 'failed':
        console.log(`❌ Payment failed for order ${order_id}`);
        console.log('Error message:', error_message);
        
        // Write ONLY to Transaction table, DO NOT update User
        if (transaction_id) {
          const failedTransactionId = db.generateId();
          await db.query(
            `INSERT INTO "Transaction" 
              ("id", "tracking_id", "userId", "status", "amount", "currency", "description", 
               "type", "payment_method_type", "message", "reason", "webhookEventId") 
             VALUES ($1, $2, $3, 'failed', $4, $5, $6, $7, $8, $9, $10, $11)`,
            [
              failedTransactionId,
              transaction_id,
              tracking_id || null,
              amount ? parseInt(amount) : null,
              currency || 'USD',
              description || 'Payment failed',
              type || 'payment',
              payment_method_type || 'card',
              error_message || 'Payment failed',
              error_message,
              transaction_id
            ]
          );
          console.log('✅ Failed transaction record created in Transaction table');
        }
        break;

      case 'pending':
        console.log(`⏳ Payment pending for order ${order_id}`);
        
        // Write ONLY to Transaction table, DO NOT update User
        if (transaction_id) {
          const pendingTransactionId = db.generateId();
          await db.query(
            `INSERT INTO "Transaction" 
              ("id", "tracking_id", "userId", "status", "amount", "currency", "description", 
               "type", "payment_method_type", "message", "webhookEventId") 
             VALUES ($1, $2, $3, 'pending', $4, $5, $6, $7, $8, $9, $10)`,
            [
              pendingTransactionId,
              transaction_id,
              tracking_id || null,
              amount ? parseInt(amount) : null,
              currency || 'USD',
              description || 'Payment pending',
              type || 'payment',
              payment_method_type || 'card',
              message || 'Payment pending',
              transaction_id
            ]
          );
          console.log('✅ Pending transaction record created in Transaction table');
        }
        break;

      case 'canceled':
        console.log(`🚫 Payment canceled for order ${order_id}`);
        
        // Write ONLY to Transaction table, DO NOT update User
        if (transaction_id) {
          const canceledTransactionId = db.generateId();
          await db.query(
            `INSERT INTO "Transaction" 
              ("id", "tracking_id", "userId", "status", "amount", "currency", "description", 
               "type", "payment_method_type", "message", "webhookEventId") 
             VALUES ($1, $2, $3, 'canceled', $4, $5, $6, $7, $8, $9, $10)`,
            [
              canceledTransactionId,
              transaction_id,
              tracking_id || null,
              amount ? parseInt(amount) : null,
              currency || 'USD',
              description || 'Payment canceled',
              type || 'payment',
              payment_method_type || 'card',
              message || 'Payment canceled',
              transaction_id
            ]
          );
          console.log('✅ Canceled transaction record created in Transaction table');
        }
        break;

      case 'refunded':
        console.log(`💰 Payment refunded for order ${order_id}`);
        
        if (transaction_id && tracking_id) {
          // Extract tokens for refund
          const tokensToRefund = description ? extractTokensFromDescription(description) : null;
          
          if (tokensToRefund) {
            // Process refund in transaction
            await db.transaction(async (client) => {
              // 1. Create refund record in Transaction table
              const refundTransactionId = db.generateId();
              await client.query(
                `INSERT INTO "Transaction" 
                  ("id", "tracking_id", "userId", "status", "amount", "currency", "description", 
                   "type", "payment_method_type", "message", "webhookEventId") 
                 VALUES ($1, $2, $3, 'refunded', $4, $5, $6, 'refund', $7, $8, $9)`,
                [
                  refundTransactionId,
                  transaction_id,
                  tracking_id,
                  amount ? parseInt(amount) : null,
                  currency || 'USD',
                  description || 'Payment refunded',
                  payment_method_type || 'card',
                  message || 'Payment refunded',
                  transaction_id
                ]
              );
              console.log('✅ Refund transaction record created in Transaction table');

              // 2. Subtract tokens from user balance (ONLY balance update)
              const userResult = await client.query(
                'SELECT "availableGenerations" FROM "User" WHERE "clerkId" = $1',
                [tracking_id]
              );

              if (userResult.rows.length > 0) {
                const currentBalance = userResult.rows[0].availableGenerations;
                const newBalance = Math.max(0, currentBalance - tokensToRefund);
                
                await client.query(
                  'UPDATE "User" SET "availableGenerations" = $1 WHERE "clerkId" = $2',
                  [newBalance, tracking_id]
                );
                console.log('✅ User balance adjusted for refund in User table');
                console.log('   Tokens refunded:', tokensToRefund);
                console.log('   New balance:', newBalance);
              }
            });
          }
        }
        break;

      default:
        console.log(`❓ Unknown payment status: ${status} for order ${order_id}`);
    }

    // Return successful response according to Networx requirements
    return NextResponse.json({ status: 'ok' }, { status: 200 });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('═══════════════════════════════════════════════════════');
    console.error('❌ Webhook Processing Error');
    console.error('Timestamp:', new Date().toISOString());
    console.error('Processing time:', processingTime, 'ms');
    console.error('Transaction ID:', transactionId);
    console.error('User ID:', userId);
    console.error('Error:', error);
    console.error('Stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('═══════════════════════════════════════════════════════');
    
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// GET - For checking endpoint availability
export async function GET() {
  return NextResponse.json({
    message: 'Networx webhook endpoint is active',
    timestamp: new Date().toISOString(),
  });
}
