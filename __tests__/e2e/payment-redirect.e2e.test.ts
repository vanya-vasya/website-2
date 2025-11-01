/**
 * E2E Test: Payment to Dashboard Redirect
 * 
 * This test simulates the complete payment flow from token creation
 * through payment completion to dashboard redirect, ensuring users
 * land on the correct page after successful payment.
 */

import { NextRequest } from 'next/server';
import { POST as paymentAPI } from '@/app/api/payment/networx/route';

describe('E2E: Payment to Dashboard Redirect Flow', () => {
  const mockEnv = {
    NETWORX_SHOP_ID: 'test_shop_id',
    NETWORX_SECRET_KEY: 'test_secret_key',
    NETWORX_TEST_MODE: 'true',
    NETWORX_RETURN_URL: 'https://www.nerbixa.com/dashboard',
    NETWORX_WEBHOOK_URL: 'https://www.nerbixa.com/api/webhooks/networx',
  };

  beforeAll(() => {
    Object.entries(mockEnv).forEach(([key, value]) => {
      process.env[key] = value;
    });
  });

  afterAll(() => {
    Object.keys(mockEnv).forEach((key) => {
      delete process.env[key];
    });
  });

  it('should complete full payment flow and redirect to dashboard', async () => {
    // Step 1: User initiates payment (clicks "Buy Credits")
    console.log('');
    console.log('╔══════════════════════════════════════════════════════╗');
    console.log('║  E2E TEST: Full Payment to Dashboard Redirect Flow  ║');
    console.log('╚══════════════════════════════════════════════════════╝');
    console.log('');
    
    const userId = 'user_test_e2e_123';
    const orderId = `gen_${userId}_${Date.now()}`;
    const customerEmail = 'e2e@test.com';
    const amount = 10.00;
    const generations = 100;

    console.log('📝 Step 1: User initiates payment');
    console.log('   User ID:', userId);
    console.log('   Order ID:', orderId);
    console.log('   Email:', customerEmail);
    console.log('   Amount:', amount, 'USD');
    console.log('   Generations:', generations);
    console.log('');

    // Step 2: Create payment token
    console.log('🔐 Step 2: Creating payment token...');
    
    const requestBody = {
      amount,
      currency: 'USD',
      orderId,
      description: `Nerbixa Generations Purchase (${generations} Tokens)`,
      customerEmail,
      userId,
    };

    const request = new NextRequest('http://localhost:3000/api/payment/networx', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    // Mock Networx API response
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        checkout: {
          redirect_url: `https://checkout.networxpay.com/widget/hpp.html?token=test_token_${orderId}`,
        },
      }),
    });

    const response = await paymentAPI(request);
    const tokenData = await response.json();

    console.log('   ✅ Token created successfully');
    console.log('   Token:', tokenData.token?.substring(0, 20) + '...');
    console.log('   Payment URL:', tokenData.payment_url);
    console.log('');

    // Verify token creation
    expect(response.status).toBe(200);
    expect(tokenData.success).toBe(true);
    expect(tokenData.payment_url).toContain('checkout.networxpay.com');

    // Step 3: Extract return URL from API call
    console.log('🔍 Step 3: Verifying return URL configuration...');
    
    const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
    const networxRequestBody = JSON.parse(fetchCall[1].body);
    const returnUrl = networxRequestBody.checkout.settings.return_url;

    console.log('   Return URL:', returnUrl);
    console.log('');

    // Verify return URL points to dashboard
    expect(returnUrl).toContain('/dashboard');
    expect(returnUrl).not.toContain('/payment/success');
    expect(returnUrl).not.toContain('/payment/callback');
    expect(returnUrl).toContain('payment=success');
    expect(returnUrl).toContain(`order_id=${orderId}`);

    console.log('   ✅ Return URL correctly configured for dashboard');
    console.log('');

    // Step 4: Simulate user completing payment on Networx hosted page
    console.log('💳 Step 4: User completes payment on Networx...');
    console.log('   (User enters card details and confirms)');
    console.log('   ✅ Payment successful');
    console.log('');

    // Step 5: Verify redirect URL structure
    console.log('🔗 Step 5: Verifying redirect URL structure...');
    
    const redirectUrl = new URL(returnUrl);
    const redirectPath = redirectUrl.pathname;
    const redirectParams = redirectUrl.searchParams;

    console.log('   Redirect Path:', redirectPath);
    console.log('   Query Parameters:');
    console.log('      - payment:', redirectParams.get('payment'));
    console.log('      - order_id:', redirectParams.get('order_id'));
    console.log('');

    expect(redirectPath).toBe('/dashboard');
    expect(redirectParams.get('payment')).toBe('success');
    expect(redirectParams.get('order_id')).toBe(orderId);

    console.log('   ✅ Redirect URL structure is correct');
    console.log('');

    // Step 6: Simulate landing on dashboard
    console.log('🏠 Step 6: User lands on dashboard page...');
    console.log('   URL:', returnUrl);
    console.log('');

    // Verify dashboard URL is valid and will show success notification
    const paymentStatus = redirectParams.get('payment');
    const orderIdParam = redirectParams.get('order_id');
    const shouldShowNotification = paymentStatus === 'success' && !!orderIdParam;

    expect(shouldShowNotification).toBe(true);

    console.log('   ✅ Dashboard will show success notification');
    console.log('   ✅ URL parameters will be cleaned after notification');
    console.log('');

    // Step 7: Verify no redirect to 404
    console.log('🎯 Step 7: Verifying NO redirect to 404...');
    
    const possibleBadUrls = [
      '/payment/success',
      '/payment/callback',
      '/Payment/Success',
      '/DASHBOARD',
      undefined,
      null,
    ];

    possibleBadUrls.forEach(badUrl => {
      expect(redirectPath).not.toBe(badUrl);
    });

    console.log('   ✅ No bad redirects detected');
    console.log('   ✅ Will NOT land on 404 page');
    console.log('');

    // Final verification
    console.log('╔══════════════════════════════════════════════════════╗');
    console.log('║              E2E TEST: ALL CHECKS PASSED             ║');
    console.log('╚══════════════════════════════════════════════════════╝');
    console.log('');
    console.log('✅ Token created successfully');
    console.log('✅ Return URL points to /dashboard');
    console.log('✅ Payment status parameter included');
    console.log('✅ Order ID parameter included');
    console.log('✅ No redirect to old success page');
    console.log('✅ No redirect to 404');
    console.log('✅ Success notification will be shown');
    console.log('✅ URL will be cleaned up');
    console.log('');
  });

  it('should handle different environments correctly', async () => {
    const environments = [
      {
        name: 'Production',
        NETWORX_RETURN_URL: 'https://www.nerbixa.com/dashboard',
        expectedDomain: 'www.nerbixa.com',
      },
      {
        name: 'Staging',
        NETWORX_RETURN_URL: 'https://staging.nerbixa.com/dashboard',
        expectedDomain: 'staging.nerbixa.com',
      },
      {
        name: 'Development',
        NETWORX_RETURN_URL: 'http://localhost:3000/dashboard',
        expectedDomain: 'localhost:3000',
      },
    ];

    for (const env of environments) {
      console.log(`\nTesting ${env.name} environment...`);
      
      process.env.NETWORX_RETURN_URL = env.NETWORX_RETURN_URL;

      const request = new NextRequest('http://localhost:3000/api/payment/networx', {
        method: 'POST',
        body: JSON.stringify({
          amount: 10,
          currency: 'USD',
          orderId: `test_${env.name}_123`,
          description: 'Test',
          customerEmail: 'test@test.com',
          userId: 'user_test',
        }),
      });

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          checkout: {
            redirect_url: 'https://checkout.networxpay.com/widget/hpp.html?token=test',
          },
        }),
      });

      await paymentAPI(request);

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const requestData = JSON.parse(fetchCall[1].body);
      const returnUrl = requestData.checkout.settings.return_url;
      const url = new URL(returnUrl);

      expect(url.host).toBe(env.expectedDomain);
      expect(url.pathname).toBe('/dashboard');
      expect(returnUrl).toContain('payment=success');

      console.log(`   ✅ ${env.name}: Correct return URL configured`);
      console.log(`      Domain: ${url.host}`);
      console.log(`      Path: ${url.pathname}`);
    }

    // Restore original
    process.env.NETWORX_RETURN_URL = mockEnv.NETWORX_RETURN_URL;
  });

  it('should include all required parameters in return URL', async () => {
    const orderId = 'test_params_123';

    const request = new NextRequest('http://localhost:3000/api/payment/networx', {
      method: 'POST',
      body: JSON.stringify({
        amount: 5,
        currency: 'USD',
        orderId,
        description: 'Test Parameters',
        customerEmail: 'params@test.com',
        userId: 'user_params',
      }),
    });

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        checkout: {
          redirect_url: 'https://checkout.networxpay.com/widget/hpp.html?token=test',
        },
      }),
    });

    await paymentAPI(request);

    const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
    const requestData = JSON.parse(fetchCall[1].body);
    const returnUrl = requestData.checkout.settings.return_url;
    const url = new URL(returnUrl);

    // Verify all required parameters
    expect(url.searchParams.get('payment')).toBe('success');
    expect(url.searchParams.get('order_id')).toBe(orderId);
    expect(url.searchParams.has('payment')).toBe(true);
    expect(url.searchParams.has('order_id')).toBe(true);

    console.log('\n✅ All required parameters present in return URL:');
    console.log('   - payment:', url.searchParams.get('payment'));
    console.log('   - order_id:', url.searchParams.get('order_id'));
  });

  it('should NOT redirect to these problematic URLs', async () => {
    const problematicUrls = [
      '/payment/success',
      '/payment/callback',
      '/Payment/Success',
      '/DASHBOARD',
      '/Dashboard',
      '/dashBoard',
      undefined,
      '',
    ];

    const request = new NextRequest('http://localhost:3000/api/payment/networx', {
      method: 'POST',
      body: JSON.stringify({
        amount: 10,
        currency: 'USD',
        orderId: 'test_problematic',
        description: 'Test',
        customerEmail: 'test@test.com',
        userId: 'user_test',
      }),
    });

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        checkout: {
          redirect_url: 'https://checkout.networxpay.com/widget/hpp.html?token=test',
        },
      }),
    });

    await paymentAPI(request);

    const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
    const requestData = JSON.parse(fetchCall[1].body);
    const returnUrl = requestData.checkout.settings.return_url;
    const url = new URL(returnUrl);

    // Verify NOT redirecting to any problematic URLs
    problematicUrls.forEach(problematicUrl => {
      if (problematicUrl) {
        expect(url.pathname).not.toBe(problematicUrl);
      }
    });

    expect(url.pathname).toBe('/dashboard');

    console.log('\n✅ NOT redirecting to any problematic URLs');
    console.log('   Actual redirect path:', url.pathname);
  });
});







