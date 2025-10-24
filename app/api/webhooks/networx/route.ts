import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import prismadb from '@/lib/prismadb';
import { transporter } from '@/config/nodemailer';
import { generatePdfReceipt } from '@/lib/receiptGeneration';

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
 * - Generate and email PDF receipts for successful payments
 * - Use tracking_id for idempotency checks (primary)
 * - Use webhookEventId as fallback idempotency check
 */

// Функция для верификации подписи webhook согласно документации Networx
function verifyWebhookSignature(data: Record<string, any>, signature: string, secretKey: string): boolean {
  // Удаляем подпись из данных для верификации
  const { signature: _, ...dataForSignature } = data;

  // Сортируем параметры по ключу
  const sortedParams = Object.keys(dataForSignature)
    .sort()
    .reduce((obj: Record<string, any>, key) => {
      obj[key] = dataForSignature[key];
      return obj;
    }, {});

  // Создаем строку для подписи
  const signString = Object.entries(sortedParams)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  // Создаем подпись HMAC SHA256
  const expectedSignature = crypto
    .createHmac('sha256', secretKey)
    .update(signString)
    .digest('hex');

  return expectedSignature === signature;
}

// Извлечение количества токенов из описания платежа
function extractTokensFromDescription(description: string): number | null {
  const match = description.match(/\((\d+)\s+Tokens?\)/i);
  return match ? parseInt(match[1], 10) : null;
}

// POST - Обработка webhook уведомлений от Networx
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  let transactionId: string | undefined;
  let userId: string | undefined;
  
  try {
    const body = await request.json();
    
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
    console.log('📥 Networx Webhook Received');
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

    // Верифицируем подпись webhook
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

    // Идемпотентность: Проверка на дубликаты через tracking_id (PRIMARY) и webhookEventId (FALLBACK)
    if (transaction_id) {
      // Check using tracking_id first (more reliable for idempotency)
      const existingByTrackingId = await prismadb.transaction.findUnique({
        where: {
          tracking_id: transaction_id
        }
      });

      if (existingByTrackingId) {
        console.log('⚠️  Duplicate webhook detected (via tracking_id) - transaction already processed:', transaction_id);
        return NextResponse.json({ 
          status: 'ok',
          message: 'Transaction already processed',
          idempotent: true,
          method: 'tracking_id'
        }, { status: 200 });
      }

      // Fallback: Check using webhookEventId
      const existingByWebhookId = await prismadb.transaction.findUnique({
        where: {
          webhookEventId: transaction_id
        }
      });

      if (existingByWebhookId) {
        console.log('⚠️  Duplicate webhook detected (via webhookEventId) - transaction already processed:', transaction_id);
        return NextResponse.json({ 
          status: 'ok',
          message: 'Transaction already processed',
          idempotent: true,
          method: 'webhookEventId'
        }, { status: 200 });
      }
    }

    // Обработка статусов согласно документации Networx
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

        // CRITICAL: Проверяем существование пользователя
        // Мы НЕ создаем пользователей в webhook платежей
        // Пользователи должны быть созданы только через Clerk webhook
        const user = await prismadb.user.findUnique({
          where: {
            clerkId: tracking_id,
          },
          select: {
            id: true,
            clerkId: true,
            email: true,
            usedGenerations: true,
            availableGenerations: true,
          },
        });

        if (!user) {
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

        console.log('✅ User found:', user.email);
        console.log('Current balance:', user.availableGenerations);
        console.log('Used generations:', user.usedGenerations);

        // Извлекаем количество токенов из описания
        const tokensToAdd = description ? extractTokensFromDescription(description) : null;
        
        if (!tokensToAdd) {
          console.error('❌ Could not extract token amount from description:', description);
          return NextResponse.json(
            { error: 'Invalid payment description format' },
            { status: 400 }
          );
        }

        console.log('🎟️  Tokens to add:', tokensToAdd);

        // Выполняем операции в транзакции базы данных
        // ВАЖНО: Все данные о транзакциях идут ТОЛЬКО в таблицу Transaction
        // В таблице User обновляется ТОЛЬКО баланс токенов (availableGenerations, usedGenerations)
        try {
          await prismadb.$transaction(async (tx) => {
            // 1. Создаем запись о транзакции в таблице Transaction
            const newTransaction = await tx.transaction.create({
              data: {
                tracking_id: transaction_id || tracking_id,
                userId: tracking_id, // Clerk user ID для связи
                status: 'successful',
                amount: amount ? parseInt(amount) : null,
                currency: currency || 'USD',
                description: description || `Payment for ${tokensToAdd} tokens`,
                type: type || 'payment',
                payment_method_type: payment_method_type || 'card',
                message: message || 'Payment successful',
                paid_at: paid_at ? new Date(paid_at) : new Date(),
                receipt_url: null,
                webhookEventId: transaction_id, // Для идемпотентности
              },
            });

            console.log('✅ Transaction record created in Transaction table:', newTransaction.id);
            console.log('   Transaction ID:', transaction_id);
            console.log('   Amount:', amount, currency);
            console.log('   Tokens:', tokensToAdd);

            // 2. Обновляем ТОЛЬКО баланс пользователя (НЕ создаем нового пользователя)
            // User table содержит ТОЛЬКО профиль и баланс, НЕ данные транзакций
            const updatedUser = await tx.user.update({
              where: {
                clerkId: tracking_id,
              },
              data: {
                // Формула: новый баланс = текущий доступный - использованный + купленные токены
                availableGenerations: user.availableGenerations - user.usedGenerations + tokensToAdd,
                usedGenerations: 0, // Сброс использованных после пополнения
              },
            });

            console.log('✅ User balance updated in User table');
            console.log('   Previous balance:', user.availableGenerations);
            console.log('   Used generations:', user.usedGenerations);
            console.log('   New available generations:', updatedUser.availableGenerations);
            console.log('   Reset used generations:', updatedUser.usedGenerations);
          });

          // Generate and send receipt email
          try {
            console.log('📧 Generating PDF receipt and sending email...');
            
            const receiptId = transaction_id?.slice(-12) || Date.now().toString().slice(-12);
            const receiptDate = new Date().toLocaleDateString('en-US', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            });
            
            const pdfBuffer = await generatePdfReceipt(
              receiptId,
              customer_email || user.email,
              receiptDate,
              tokensToAdd,
              description || `Payment for ${tokensToAdd} tokens`,
              amount ? parseInt(amount) : 0,
              currency || 'USD'
            );

            await transporter.sendMail({
              from: process.env.OUTBOX_EMAIL,
              to: customer_email || user.email,
              subject: `Receipt #${receiptId} - Nerbixa Token Purchase`,
              text: `Hi there,

We're excited to welcome you to Nerbixa — thanks so much for your recent order on nerbixa.com!

You'll find your transaction receipt attached to this message. Be sure to keep it in case you need it later.

Transaction Details:
- Receipt ID: ${receiptId}
- Tokens Purchased: ${tokensToAdd}
- Amount: ${((amount ? parseInt(amount) : 0) / 100).toFixed(2)} ${currency || 'USD'}
- Date: ${receiptDate}

If you run into any issues, have questions about your token usage, or need guidance, our support team is just an email away at support@nerbixa.com. We're always ready to help.

We're honored to be part of your creative journey.

With appreciation,
The Nerbixa Team
nerbixa.com
support@nerbixa.com`,
              attachments: [
                {
                  filename: `receipt-${receiptId}.pdf`,
                  content: pdfBuffer,
                  contentType: 'application/pdf',
                },
              ],
            });
            
            console.log('✅ Receipt email sent to:', customer_email || user.email);
          } catch (emailError) {
            console.error('⚠️  Failed to send receipt email:', emailError);
            console.error('   Email error details:', emailError instanceof Error ? emailError.message : 'Unknown error');
            // Don't fail the webhook if email fails - payment is already processed
          }

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
        
        // Записываем ТОЛЬКО в таблицу Transaction, НЕ обновляем User
        if (transaction_id) {
          await prismadb.transaction.create({
            data: {
              tracking_id: transaction_id,
              userId: tracking_id || null,
              status: 'failed',
              amount: amount ? parseInt(amount) : null,
              currency: currency || 'USD',
              description: description || 'Payment failed',
              type: type || 'payment',
              payment_method_type: payment_method_type || 'card',
              message: error_message || 'Payment failed',
              reason: error_message,
              webhookEventId: transaction_id,
            },
          });
          console.log('✅ Failed transaction record created in Transaction table');
        }
        break;

      case 'pending':
        console.log(`⏳ Payment pending for order ${order_id}`);
        
        // Записываем ТОЛЬКО в таблицу Transaction, НЕ обновляем User
        if (transaction_id) {
          await prismadb.transaction.create({
            data: {
              tracking_id: transaction_id,
              userId: tracking_id || null,
              status: 'pending',
              amount: amount ? parseInt(amount) : null,
              currency: currency || 'USD',
              description: description || 'Payment pending',
              type: type || 'payment',
              payment_method_type: payment_method_type || 'card',
              message: message || 'Payment pending',
              webhookEventId: transaction_id,
            },
          });
          console.log('✅ Pending transaction record created in Transaction table');
        }
        break;

      case 'canceled':
        console.log(`🚫 Payment canceled for order ${order_id}`);
        
        // Записываем ТОЛЬКО в таблицу Transaction, НЕ обновляем User
        if (transaction_id) {
          await prismadb.transaction.create({
            data: {
              tracking_id: transaction_id,
              userId: tracking_id || null,
              status: 'canceled',
              amount: amount ? parseInt(amount) : null,
              currency: currency || 'USD',
              description: description || 'Payment canceled',
              type: type || 'payment',
              payment_method_type: payment_method_type || 'card',
              message: message || 'Payment canceled',
              webhookEventId: transaction_id,
            },
          });
          console.log('✅ Canceled transaction record created in Transaction table');
        }
        break;

      case 'refunded':
        console.log(`💰 Payment refunded for order ${order_id}`);
        
        if (transaction_id && tracking_id) {
          // Извлекаем количество токенов для возврата
          const tokensToRefund = description ? extractTokensFromDescription(description) : null;
          
          if (tokensToRefund) {
            // Обрабатываем возврат в транзакции
            await prismadb.$transaction(async (tx) => {
              // 1. Создаем запись о возврате в Transaction table
              await tx.transaction.create({
                data: {
                  tracking_id: transaction_id,
                  userId: tracking_id,
                  status: 'refunded',
                  amount: amount ? parseInt(amount) : null,
                  currency: currency || 'USD',
                  description: description || 'Payment refunded',
                  type: 'refund',
                  payment_method_type: payment_method_type || 'card',
                  message: message || 'Payment refunded',
                  webhookEventId: transaction_id,
                },
              });
              console.log('✅ Refund transaction record created in Transaction table');

              // 2. Вычитаем токены из баланса пользователя (ТОЛЬКО обновление баланса)
              const user = await tx.user.findUnique({
                where: { clerkId: tracking_id },
                select: { availableGenerations: true }
              });

              if (user) {
                await tx.user.update({
                  where: { clerkId: tracking_id },
                  data: {
                    // Вычитаем возвращенные токены, но не уходим в минус
                    availableGenerations: Math.max(0, user.availableGenerations - tokensToRefund),
                  },
                });
                console.log('✅ User balance adjusted for refund in User table');
                console.log('   Tokens refunded:', tokensToRefund);
                console.log('   New balance:', Math.max(0, user.availableGenerations - tokensToRefund));
              }
            });
          }
        }
        break;

      default:
        console.log(`❓ Unknown payment status: ${status} for order ${order_id}`);
    }

    // Возвращаем успешный ответ согласно требованиям Networx
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

// GET - Для проверки доступности endpoint'а
export async function GET() {
  return NextResponse.json({
    message: 'Networx webhook endpoint is active',
    timestamp: new Date().toISOString(),
  });
}
