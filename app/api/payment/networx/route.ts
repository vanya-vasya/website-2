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
    const shopId = process.env.NETWORX_SHOP_ID;
    const secretKey = process.env.NETWORX_SECRET_KEY;
    
    // Check if credentials are configured
    if (!shopId || !secretKey) {
      console.error('❌ NETWORX CREDENTIALS NOT CONFIGURED');
      console.error('Please set NETWORX_SHOP_ID and NETWORX_SECRET_KEY in environment variables');
      return NextResponse.json(
        { 
          error: 'Payment gateway not configured',
          message: 'Please contact support. Payment credentials are missing.',
          details: 'NETWORX_SHOP_ID and NETWORX_SECRET_KEY must be set in environment variables'
        },
        { status: 500 }
      );
    }
    
    // Force correct API URL for hosted payment page - override any incorrect environment variable
    const apiUrl = 'https://checkout.networxpay.com';  // Correct API URL for hosted payment page
    const returnUrl = process.env.NETWORX_RETURN_URL || 'https://nerbixa.com/dashboard';
    const notificationUrl = process.env.NETWORX_WEBHOOK_URL || 'https://nerbixa.com/api/webhooks/networx';
    const useTestMode = process.env.NETWORX_TEST_MODE === 'true'; // Enable test transactions
    
    console.log('Environment variables:', {
      shopId: shopId.substring(0, 5) + '***', // Mask for security
      secretKey: '***' + secretKey.substring(secretKey.length - 4), // Mask for security
      apiUrl,
      useTestMode,
      returnUrl,
      notificationUrl
    });
    
    console.log('API Version: 2, Authentication: HTTP Basic, Using Hosted Payment Page');

    // Request structure for hosted payment page according to working NetworkX Pay example
    const requestData = {
      checkout: {
        test: useTestMode, // Use environment variable to control test mode
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
          return_url: `${returnUrl}?payment=success&order_id=${orderId}`, // Pass payment status and orderId in return URL
          notification_url: notificationUrl // URL для получения webhook уведомлений
        }
      }
    };

    console.log('Final request data:', {
      ...requestData,
      checkout: {
        ...requestData.checkout,
        customer: { email: '***@***' } // Mask email in logs
      }
    });
    
    // Make API call to Networx Pay
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
        console.error('❌ Networx API Error Response:', errorData);
        console.error('Response Status:', networxResponse.status);
        console.error('Response Headers:', Object.fromEntries(networxResponse.headers.entries()));
        
        // Try to parse error as JSON for better error messages
        let errorDetails = errorData;
        try {
          const parsedError = JSON.parse(errorData);
          errorDetails = JSON.stringify(parsedError, null, 2);
          
          // Check for specific errors
          if (parsedError.response?.message === 'Access denied') {
            console.error('🔒 ACCESS DENIED - Possible causes:');
            console.error('1. Invalid Shop ID or Secret Key');
            console.error('2. Account not activated in Networx Dashboard');
            console.error('3. API access not enabled for this account');
            console.error('4. IP whitelist restrictions');
            console.error('Current Shop ID:', shopId.substring(0, 5) + '***');
            
            return NextResponse.json(
              { 
                error: 'Payment gateway authentication failed',
                message: 'Unable to connect to payment processor. Please contact support.',
                details: 'Authentication error - credentials may be invalid or account not activated',
                supportInfo: {
                  action: 'Please verify Networx credentials in environment variables',
                  required: ['NETWORX_SHOP_ID', 'NETWORX_SECRET_KEY'],
                  documentation: 'Check NETWORX_AUTH_FIX.md for troubleshooting steps'
                }
              },
              { status: 503 }
            );
          }
        } catch (e) {
          // Error is not JSON, keep as text
        }
        
        return NextResponse.json(
          { 
            error: 'Failed to create payment checkout',
            details: `API returned ${networxResponse.status}`,
            message: 'Unable to initialize payment. Please try again or contact support.',
            errorData: errorDetails
          },
          { status: 400 }
        );
      }

      const networxResult = await networxResponse.json();
      console.log('✅ Networx API Success Response received');
      console.log('Checkout created:', {
        hasToken: !!networxResult.checkout?.token,
        hasRedirectUrl: !!networxResult.checkout?.redirect_url,
        testMode: networxResult.checkout?.test
      });

      // Проверяем успешность ответа от Networx hosted payment page
      if (networxResult.checkout && networxResult.checkout.token && networxResult.checkout.redirect_url) {
        console.log('✅ Payment checkout created successfully');
        console.log('Token:', networxResult.checkout.token);
        console.log('Redirect URL:', networxResult.checkout.redirect_url);
        
        return NextResponse.json({
          success: true,
          token: networxResult.checkout.token,
          payment_url: networxResult.checkout.redirect_url,
          checkout_id: networxResult.checkout.token, // Используем token как идентификатор
          test_mode: useTestMode
        });
      } else {
        console.error('❌ Networx API returned unexpected response format:', networxResult);
        return NextResponse.json(
          { 
            error: 'Payment checkout creation failed',
            message: 'Payment processor returned invalid response',
            details: networxResult.error || networxResult.message || 'Invalid response format'
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
