import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import db from '@/lib/db';
import { log } from '@/lib/log';

/**
 * Secure-processor Payment Webhook Handler
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

type SecureProcessorTransaction = Record<string, any>;

const normalizeSignatureHex = (signature: string) => signature.trim().toLowerCase();

const safeTimingEqualHex = (aHex: string, bHex: string) => {
  const a = Uint8Array.from(Buffer.from(normalizeSignatureHex(aHex), 'hex'));
  const b = Uint8Array.from(Buffer.from(normalizeSignatureHex(bHex), 'hex'));
  if (a.length === 0 || b.length === 0) return false;
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
};

const buildSignatureParams = (payload: Record<string, any>) => {
  // Secure-processor delivers most fields under `transaction`. Older/alternate payloads may be flat.
  const source: Record<string, any> = payload?.transaction && typeof payload.transaction === 'object'
    ? payload.transaction
    : payload;

  const params: Record<string, string> = {};

  for (const [key, value] of Object.entries(source)) {
    if (key === 'signature') continue;
    if (value === undefined) continue;
    if (value === null) continue;
    if (typeof value === 'object') continue; // avoid `[object Object]` mismatches
    params[key] = String(value);
  }

  // Preserve compatibility with “flat” signatures that included customer fields.
  const customer = source.customer && typeof source.customer === 'object' ? source.customer : null;
  if (customer?.email && typeof customer.email === 'string') params.customer_email = customer.email;
  if (customer?.ip && typeof customer.ip === 'string') params.customer_ip = customer.ip;

  return params;
};

const createWebhookSignature = (payload: Record<string, any>, secretKey: string) => {
  const params = buildSignatureParams(payload);
  const signString = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');

  return crypto.createHmac('sha256', secretKey).update(signString).digest('hex');
};

// Verify webhook signature according to Secure-processor documentation (HMAC SHA256)
const verifyWebhookSignature = (payload: Record<string, any>, signature: string, secretKey: string) => {
  const expected = createWebhookSignature(payload, secretKey);
  return safeTimingEqualHex(expected, signature);
};

// Extract token amount from payment description
function extractTokensFromDescription(description: string): number | null {
  const match = description.match(/\((\d+)\s+Tokens?\)/i);
  return match ? parseInt(match[1], 10) : null;
}

const normalizeAmountToInt = (rawAmount: unknown): number | null => {
  if (rawAmount === null || rawAmount === undefined) return null;

  if (typeof rawAmount === 'number') {
    if (!Number.isFinite(rawAmount)) return null;
    return Number.isInteger(rawAmount) ? rawAmount : Math.round(rawAmount * 100);
  }

  if (typeof rawAmount === 'string') {
    const trimmed = rawAmount.trim();
    if (!trimmed) return null;
    if (trimmed.includes('.')) {
      const parsed = Number.parseFloat(trimmed);
      if (!Number.isFinite(parsed)) return null;
      return Math.round(parsed * 100);
    }
    const parsedInt = Number.parseInt(trimmed, 10);
    return Number.isFinite(parsedInt) ? parsedInt : null;
  }

  return null;
};

const getWebhookSignature = (request: NextRequest, body: Record<string, any>) => {
  const headerSig = request.headers.get('x-signature') || request.headers.get('X-Signature');
  const bodySig = typeof body?.signature === 'string' ? body.signature : null;
  const transactionSig = typeof body?.transaction?.signature === 'string' ? body.transaction.signature : null;
  return headerSig || bodySig || transactionSig || null;
};

const insertWebhookEventIfNew = async (
  client: any,
  eventId: string,
  eventType: string
): Promise<{ inserted: boolean }> => {
  const res = await client.query(
    `INSERT INTO "WebhookEvent" ("id", "eventId", "eventType", "processed", "processedAt")
     VALUES ($1, $2, $3, false, NULL)
     ON CONFLICT ("eventId") DO NOTHING`,
    [db.generateId(), eventId, eventType]
  );
  return { inserted: res.rowCount > 0 };
};

const markWebhookEventProcessed = async (client: any, eventId: string) => {
  await client.query(
    `UPDATE "WebhookEvent"
     SET "processed" = true, "processedAt" = NOW()
     WHERE "eventId" = $1`,
    [eventId]
  );
};

// POST - Handle webhook notifications from Secure-processor
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let transactionId: string | undefined;
  let userId: string | undefined;
  
  try {
    const body = await request.json();
    const requestId = crypto.randomUUID();
    
    log.info('secure_processor.webhook_received', {
      requestId,
      hasTransactionObject: !!body?.transaction,
      signatureHeaderPresent: !!(request.headers.get('x-signature') || request.headers.get('X-Signature')),
    });
    
    // CRITICAL FIX: Secure-processor sends data inside "transaction" object
    const transaction = body.transaction;
    if (!transaction) {
      log.warn('secure_processor.webhook_invalid_payload_missing_transaction', { requestId });
      return NextResponse.json(
        { error: 'Invalid webhook payload: missing transaction' },
        { status: 400 }
      );
    }

    const { 
      status, 
      uid, // Secure-processor uses "uid", not "transaction_id"
      amount,
      currency, 
      type,
      tracking_id,
      description,
      payment_method_type,
      message,
      paid_at,
      customer
    } = transaction;

    const transaction_id = uid;
    const customer_email = customer?.email;
    
    transactionId = transaction_id;
    userId = tracking_id;

    log.info('secure_processor.webhook_parsed', {
      requestId,
      transactionId: transaction_id,
      status,
      type,
      amount,
      currency,
      userId: tracking_id,
      customerEmailPresent: !!customer_email,
      paymentMethodType: payment_method_type,
      paidAt: paid_at,
    });

    // Get signature from headers (Secure-processor sends it as X-Signature header)
    const signature = getWebhookSignature(request, body);
    
    // Secure-processor might not send signature for test transactions
    const isTestTransaction = transaction.test === true;
    
    if (isTestTransaction) log.info('secure_processor.webhook_test_mode', { requestId, transactionId: transaction_id });
    
    if (!signature && !isTestTransaction) {
      log.warn('secure_processor.webhook_missing_signature', { requestId, transactionId: transaction_id });
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      );
    }

    if (signature) {
      const secretKey = process.env.SECURE_PROCESSOR_SECRET_KEY;
      if (!secretKey || !secretKey.trim()) {
        log.error('secure_processor.webhook_secret_missing', { requestId });
        return NextResponse.json(
          { error: 'Server configuration error' },
          { status: 500 }
        );
      }

      const isValidSignature = verifyWebhookSignature(body, signature, secretKey);
      if (!isValidSignature) {
        log.warn('secure_processor.webhook_invalid_signature', {
          requestId,
          transactionId: transaction_id,
          signaturePresent: true,
        });
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 403 }
        );
      }

      log.info('secure_processor.webhook_signature_verified', { requestId, transactionId: transaction_id });
    } else if (isTestTransaction) {
      log.info('secure_processor.webhook_signature_skipped_test_mode', { requestId, transactionId: transaction_id });
    }

    if (!transaction_id) {
      log.warn('secure_processor.webhook_missing_transaction_id', { requestId });
      return NextResponse.json(
        { error: 'Invalid webhook payload: missing transaction uid' },
        { status: 400 }
      );
    }

    // Event-level idempotency key:
    // - `uid` alone is NOT safe (pending → successful share uid).
    // - We include status and paid_at to distinguish lifecycle events.
    // IMPORTANT: idempotency must be transactional; we only mark processed after persistence succeeds.
    const eventId = `${transaction_id}:${status || 'unknown'}:${paid_at || ''}`;

    // Process statuses according to Secure-processor documentation
    switch (status) {
      case 'success':
      case 'successful':
        log.info('secure_processor.payment_success_processing', { requestId, transactionId: transaction_id, userId: tracking_id });
        
        if (!tracking_id) {
          log.warn('secure_processor.payment_success_missing_user_id', { requestId, transactionId: transaction_id });
          return NextResponse.json(
            { error: 'Missing tracking_id for successful payment' },
            { status: 400 }
          );
        }

        // Extract token amount from description
        const tokensToAdd = description ? extractTokensFromDescription(description) : null;
        
        if (!tokensToAdd) {
          log.warn('secure_processor.payment_invalid_description', {
            requestId,
            transactionId: transaction_id,
            userId: tracking_id,
          });
          return NextResponse.json(
            { error: 'Invalid payment description format' },
            { status: 400 }
          );
        }

        const normalizedAmount = normalizeAmountToInt(amount);
        log.info('secure_processor.payment_tokens_extracted', {
          requestId,
          transactionId: transaction_id,
          userId: tracking_id,
          tokensToAdd,
          normalizedAmount,
          currency,
          eventId,
        });

        // Execute operations in database transaction
        // IMPORTANT: All transaction data goes ONLY to Transaction table
        // In User table we update ONLY token balance (availableGenerations, usedGenerations)
        try {
          const result = await db.transaction(async (client) => {
            const { inserted } = await insertWebhookEventIfNew(client, eventId, String(status || 'unknown'));
            if (!inserted) {
              return { credited: false, reason: 'event_duplicate' as const, idempotent: true };
            }

            // Lock existing transaction row (if present) to safely handle status transitions.
            const existingTxn = await client.query(
              'SELECT "id", "status" FROM "Transaction" WHERE "webhookEventId" = $1 FOR UPDATE',
              [transaction_id]
            );

            const existingStatus: string | null = existingTxn.rows.length > 0 ? existingTxn.rows[0].status : null;
            const wasAlreadySuccessful = existingStatus === 'successful';

            // Upsert/update transaction record to successful.
            if (existingTxn.rows.length === 0) {
              await client.query(
                `INSERT INTO "Transaction"
                  ("id", "tracking_id", "userId", "status", "amount", "currency", "description",
                   "type", "payment_method_type", "message", "paid_at", "webhookEventId")
                 VALUES ($1, $2, $3, 'successful', $4, $5, $6, $7, $8, $9, $10, $11)`,
                [
                  db.generateId(),
                  transaction_id,
                  tracking_id,
                  normalizedAmount,
                  currency || 'USD',
                  description || `Payment for ${tokensToAdd} tokens`,
                  type || 'payment',
                  payment_method_type || 'card',
                  message || 'Payment successful',
                  paid_at ? new Date(paid_at) : new Date(),
                  transaction_id,
                ]
              );
            } else {
              await client.query(
                `UPDATE "Transaction"
                 SET "status" = 'successful',
                     "amount" = COALESCE($2, "amount"),
                     "currency" = COALESCE($3, "currency"),
                     "description" = COALESCE($4, "description"),
                     "type" = COALESCE($5, "type"),
                     "payment_method_type" = COALESCE($6, "payment_method_type"),
                     "message" = COALESCE($7, "message"),
                     "paid_at" = COALESCE($8, "paid_at")
                 WHERE "webhookEventId" = $1`,
                [
                  transaction_id,
                  normalizedAmount,
                  currency || null,
                  description || null,
                  type || null,
                  payment_method_type || null,
                  message || null,
                  paid_at ? new Date(paid_at) : null,
                ]
              );
            }

            if (wasAlreadySuccessful) {
              await markWebhookEventProcessed(client, eventId);
              return { credited: false, reason: 'already_successful' as const, idempotent: true };
            }

            // Update user balance atomically, if user exists.
            const lockedUser = await client.query(
              'SELECT "availableGenerations", "usedGenerations" FROM "User" WHERE "clerkId" = $1 FOR UPDATE',
              [tracking_id]
            );

            if (lockedUser.rows.length === 0) {
              // Keep transaction record, but skip crediting. Do not retry forever at provider.
              await markWebhookEventProcessed(client, eventId);
              return { credited: false, reason: 'user_missing' as const };
            }

            const userRow = lockedUser.rows[0];
            const newAvailable = userRow.availableGenerations - userRow.usedGenerations + tokensToAdd;

            await client.query(
              'UPDATE "User" SET "availableGenerations" = $1, "usedGenerations" = 0 WHERE "clerkId" = $2',
              [newAvailable, tracking_id]
            );

            await markWebhookEventProcessed(client, eventId);
            return { credited: true, reason: 'credited' as const, newAvailable };
          });

          log.info('secure_processor.payment_success_processed', {
            requestId,
            transactionId: transaction_id,
            userId: tracking_id,
            credited: result.credited,
            reason: result.reason,
            idempotent: (result as any).idempotent === true,
            eventId,
            processingMs: Date.now() - startTime,
          });

        } catch (dbError) {
          log.error('secure_processor.payment_db_transaction_failed', {
            requestId,
            transactionId: transaction_id,
            userId: tracking_id,
            error: dbError instanceof Error ? dbError.message : String(dbError),
          });
          throw dbError; // ensures provider retries on transient DB issues
        }

        break;

      case 'failed':
        log.info('secure_processor.payment_failed', { requestId, transactionId: transaction_id, userId: tracking_id });
        
        // Write ONLY to Transaction table, DO NOT update User
        await db.transaction(async (client) => {
          const { inserted } = await insertWebhookEventIfNew(client, eventId, String(status || 'unknown'));
          if (!inserted) return;

          await client.query(
            `INSERT INTO "Transaction"
              ("id", "tracking_id", "userId", "status", "amount", "currency", "description",
               "type", "payment_method_type", "message", "reason", "webhookEventId")
             VALUES ($1, $2, $3, 'failed', $4, $5, $6, $7, $8, $9, $10, $11)
             ON CONFLICT ("webhookEventId") DO UPDATE
               SET "status" = 'failed',
                   "amount" = COALESCE(EXCLUDED."amount", "Transaction"."amount"),
                   "currency" = COALESCE(EXCLUDED."currency", "Transaction"."currency"),
                   "description" = COALESCE(EXCLUDED."description", "Transaction"."description"),
                   "message" = COALESCE(EXCLUDED."message", "Transaction"."message"),
                   "reason" = COALESCE(EXCLUDED."reason", "Transaction"."reason")`,
            [
              db.generateId(),
              transaction_id,
              tracking_id || null,
              normalizeAmountToInt(amount),
              currency || 'USD',
              description || 'Payment failed',
              type || 'payment',
              payment_method_type || 'card',
              message || 'Payment failed',
              message || 'Payment failed',
              transaction_id,
            ]
          );

          await markWebhookEventProcessed(client, eventId);
        });
        break;

      case 'pending':
        log.info('secure_processor.payment_pending', { requestId, transactionId: transaction_id, userId: tracking_id });
        
        // Write ONLY to Transaction table, DO NOT update User
        await db.transaction(async (client) => {
          const { inserted } = await insertWebhookEventIfNew(client, eventId, String(status || 'unknown'));
          if (!inserted) return;

          await client.query(
            `INSERT INTO "Transaction"
              ("id", "tracking_id", "userId", "status", "amount", "currency", "description",
               "type", "payment_method_type", "message", "webhookEventId")
             VALUES ($1, $2, $3, 'pending', $4, $5, $6, $7, $8, $9, $10)
             ON CONFLICT ("webhookEventId") DO UPDATE
               SET "status" = 'pending',
                   "amount" = COALESCE(EXCLUDED."amount", "Transaction"."amount"),
                   "currency" = COALESCE(EXCLUDED."currency", "Transaction"."currency"),
                   "description" = COALESCE(EXCLUDED."description", "Transaction"."description"),
                   "message" = COALESCE(EXCLUDED."message", "Transaction"."message")`,
            [
              db.generateId(),
              transaction_id,
              tracking_id || null,
              normalizeAmountToInt(amount),
              currency || 'USD',
              description || 'Payment pending',
              type || 'payment',
              payment_method_type || 'card',
              message || 'Payment pending',
              transaction_id,
            ]
          );

          await markWebhookEventProcessed(client, eventId);
        });
        break;

      case 'canceled':
        log.info('secure_processor.payment_canceled', { requestId, transactionId: transaction_id, userId: tracking_id });
        
        // Write ONLY to Transaction table, DO NOT update User
        await db.transaction(async (client) => {
          const { inserted } = await insertWebhookEventIfNew(client, eventId, String(status || 'unknown'));
          if (!inserted) return;

          await client.query(
            `INSERT INTO "Transaction"
              ("id", "tracking_id", "userId", "status", "amount", "currency", "description",
               "type", "payment_method_type", "message", "webhookEventId")
             VALUES ($1, $2, $3, 'canceled', $4, $5, $6, $7, $8, $9, $10)
             ON CONFLICT ("webhookEventId") DO UPDATE
               SET "status" = 'canceled',
                   "amount" = COALESCE(EXCLUDED."amount", "Transaction"."amount"),
                   "currency" = COALESCE(EXCLUDED."currency", "Transaction"."currency"),
                   "description" = COALESCE(EXCLUDED."description", "Transaction"."description"),
                   "message" = COALESCE(EXCLUDED."message", "Transaction"."message")`,
            [
              db.generateId(),
              transaction_id,
              tracking_id || null,
              normalizeAmountToInt(amount),
              currency || 'USD',
              description || 'Payment canceled',
              type || 'payment',
              payment_method_type || 'card',
              message || 'Payment canceled',
              transaction_id,
            ]
          );

          await markWebhookEventProcessed(client, eventId);
        });
        break;

      case 'refunded':
        log.info('secure_processor.payment_refunded', { requestId, transactionId: transaction_id, userId: tracking_id });
        
        if (transaction_id && tracking_id) {
          // Extract tokens for refund
          const tokensToRefund = description ? extractTokensFromDescription(description) : null;
          
          if (tokensToRefund) {
            // Process refund in transaction
            await db.transaction(async (client) => {
              const { inserted } = await insertWebhookEventIfNew(client, eventId, String(status || 'unknown'));
              if (!inserted) return;

              // 1. Create refund record in Transaction table
              await client.query(
                `INSERT INTO "Transaction"
                  ("id", "tracking_id", "userId", "status", "amount", "currency", "description",
                   "type", "payment_method_type", "message", "webhookEventId")
                 VALUES ($1, $2, $3, 'refunded', $4, $5, $6, 'refund', $7, $8, $9)
                 ON CONFLICT ("webhookEventId") DO UPDATE
                   SET "status" = 'refunded',
                       "amount" = COALESCE(EXCLUDED."amount", "Transaction"."amount"),
                       "currency" = COALESCE(EXCLUDED."currency", "Transaction"."currency"),
                       "description" = COALESCE(EXCLUDED."description", "Transaction"."description"),
                       "message" = COALESCE(EXCLUDED."message", "Transaction"."message")`,
                [
                  db.generateId(),
                  transaction_id,
                  tracking_id,
                  normalizeAmountToInt(amount),
                  currency || 'USD',
                  description || 'Payment refunded',
                  payment_method_type || 'card',
                  message || 'Payment refunded',
                  transaction_id,
                ]
              );

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
                log.info('secure_processor.refund_balance_updated', {
                  requestId,
                  transactionId: transaction_id,
                  userId: tracking_id,
                  tokensToRefund,
                  newBalance,
                });
              }

              await markWebhookEventProcessed(client, eventId);
            });
          }
        }
        break;

      default:
        log.warn('secure_processor.payment_unknown_status', { requestId, transactionId: transaction_id, status, eventId });
        await db.transaction(async (client) => {
          const { inserted } = await insertWebhookEventIfNew(client, eventId, String(status || 'unknown'));
          if (!inserted) return;
          await markWebhookEventProcessed(client, eventId);
        });
    }

    // Return successful response according to Secure-processor requirements
    return NextResponse.json({ status: 'ok' }, { status: 200 });

  } catch (error) {
    const processingTime = Date.now() - startTime;
    log.error('secure_processor.webhook_processing_error', {
      processingMs: processingTime,
      transactionId,
      userId,
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// GET - For checking endpoint availability
export async function GET() {
  return NextResponse.json({
    message: 'Secure-processor webhook endpoint is active',
    timestamp: new Date().toISOString(),
  });
}
