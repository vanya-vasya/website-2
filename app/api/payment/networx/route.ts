import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Функция для создания подписи согласно документации Networx
function createSignature(data: Record<string, any>, secretKey: string): string {
  // Сортируем параметры по ключу
  const sortedParams = Object.keys(data)
    .sort()
    .reduce((obj: Record<string, any>, key) => {
      obj[key] = data[key];
      return obj;
    }, {});

  // Создаем строку для подписи
  const signString = Object.entries(sortedParams)
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  // Создаем подпись HMAC SHA256
  return crypto
    .createHmac('sha256', secretKey)
    .update(signString)
    .digest('hex');
}

// POST - Создание токена для платежа
export async function POST(request: NextRequest) {
  try {
    console.log('=== Networx Payment API Called ===');
    const body = await request.json();
    console.log('Request body:', body);
    
    const { amount, currency = 'USD', orderId, description, customerEmail, userId } = body;
    
    if (!amount || !orderId) {
      console.log('Missing required fields:', { amount, orderId });
      return NextResponse.json(
        { error: 'Amount and orderId are required' },
        { status: 400 }
      );
    }

    if (!userId) {
      console.log('Missing userId');
      return NextResponse.json(
        { error: 'UserId is required for tracking' },
        { status: 400 }
      );
    }

    // Networx Pay API credentials and configuration
    const shopId = process.env.NETWORX_SHOP_ID || '29959';
    const secretKey = process.env.NETWORX_SECRET_KEY || 'dbfb6f4e977f49880a6ce3c939f1e7be645a5bb2596c04d9a3a7b32d52378950';
    // Force correct API URL for hosted payment page - override any incorrect environment variable
    const apiUrl = 'https://checkout.networxpay.com';  // Correct API URL for hosted payment page
    const returnUrl = process.env.NETWORX_RETURN_URL || 'https://nerbixa.com/payment/success';
    const notificationUrl = process.env.NETWORX_WEBHOOK_URL || 'https://nerbixa.com/api/webhooks/networx';
    const testMode = false; // Use real NetworkX Pay API
    
    console.log('Environment variables:', {
      shopId: shopId ? 'SET' : 'MISSING',
      secretKey: secretKey ? 'SET' : 'MISSING',
      apiUrl,
      testMode
    });
    
    console.log('API Version: 2, Authentication: HTTP Basic, Using Hosted Payment Page');

    // Request structure for hosted payment page according to working NetworkX Pay example
    const requestData = {
      checkout: {
        test: true, // Always use NetworkX Pay test mode for development
        transaction_type: "payment",
        order: {
          amount: amount * 100, // Amount in cents (EUR 2.50 = 250)
          currency: currency,
          description: description || 'Payment for order',
          tracking_id: userId // Use userId for tracking to match user in webhook
        },
        customer: {
          email: customerEmail || 'test@example.com' // Always include customer email
        },
        settings: {
          return_url: `${returnUrl}?order_id=${orderId}`, // Pass orderId in return URL
          notification_url: notificationUrl // URL для получения webhook уведомлений
        }
      }
    };

    console.log('Final request data:', requestData);
    
    // FOR DEVELOPMENT: Use test mode implementation until correct API endpoints are confirmed
    if (testMode) {
      console.log('🧪 TEST MODE: Simulating payment token creation');
      
      // Generate a test token for development
      const testToken = `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const testTransactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      console.log('✅ TEST MODE: Token created successfully:', testToken);
      
      return NextResponse.json({
        success: true,
        token: testToken,
        payment_url: `https://checkout.networxpay.com/ctp/pay/${testToken}`,
        checkout_id: testTransactionId,
        test_mode: true,
        message: 'Test payment checkout created successfully (development mode)'
      });
    }
    
    // Make real API call to Networx Pay (Production mode)
    const networxApiUrl = `${apiUrl}/ctp/api/checkouts`;  // Correct endpoint for hosted payment page
    console.log('Making request to:', networxApiUrl);

    try {
      const networxResponse = await fetch(networxApiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${shopId}:${secretKey}`).toString('base64')}`,
          'X-API-Version': '2',
        },
        body: JSON.stringify(requestData),
      });

      if (!networxResponse.ok) {
        const errorData = await networxResponse.text();
        console.error('Networx API Error Response:', errorData);
        return NextResponse.json(
          { 
            error: 'Failed to create payment token',
            details: `API returned ${networxResponse.status}: ${errorData}`
          },
          { status: 400 }
        );
      }

      const networxResult = await networxResponse.json();
      console.log('Networx API Success Response:', networxResult);

      // Проверяем успешность ответа от Networx hosted payment page
      if (networxResult.checkout && networxResult.checkout.token && networxResult.checkout.redirect_url) {
        return NextResponse.json({
          success: true,
          token: networxResult.checkout.token,
          payment_url: networxResult.checkout.redirect_url,
          checkout_id: networxResult.checkout.token, // Используем token как идентификатор
        });
      } else {
        console.error('Networx API returned unsuccessful response:', networxResult);
        return NextResponse.json(
          { 
            error: 'Payment checkout creation failed',
            details: networxResult.error || networxResult.message || 'Unknown error'
          },
          { status: 400 }
        );
      }

    } catch (fetchError) {
      console.error('Network error calling Networx API:', fetchError);
      return NextResponse.json(
        { 
          error: 'Failed to connect to payment gateway',
          details: fetchError instanceof Error ? fetchError.message : 'Network error'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Payment creation error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET - Проверка статуса платежа через HPP API
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Payment token is required' },
        { status: 400 }
      );
    }

    const shopId = process.env.NETWORX_SHOP_ID || '29959';
    const secretKey = process.env.NETWORX_SECRET_KEY || 'dbfb6f4e977f49880a6ce3c939f1e7be645a5bb2596c04d9a3a7b32d52378950';
    const apiUrl = 'https://checkout.networxpay.com'; // HPP API URL

    // Send request to Networx HPP API for status check
    const networxResponse = await fetch(`${apiUrl}/ctp/api/checkouts/${token}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${shopId}:${secretKey}`).toString('base64')}`,
        'X-API-Version': '2',
      },
    });

    const networxResult = await networxResponse.json();

    if (!networxResponse.ok) {
      console.error('Networx HPP Status API Error:', networxResult);
      return NextResponse.json(
        { error: 'Failed to check payment status', details: networxResult },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      status: networxResult.status,
      transaction: networxResult,
    });

  } catch (error) {
    console.error('Payment status check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
