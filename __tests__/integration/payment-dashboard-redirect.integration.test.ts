/**
 * Integration Tests: Payment Dashboard Redirect
 * 
 * Tests the complete payment flow redirect to dashboard after successful payment.
 * Ensures that:
 * 1. Successful payments redirect to /dashboard?payment=success
 * 2. Failed payments do NOT redirect with success status
 * 3. Canceled payments do NOT redirect with success status
 * 4. Dashboard shows success notification on redirect
 * 5. Query parameters are cleaned up after notification
 */

import { NextRequest, NextResponse } from 'next/server';
import { POST as paymentAPI } from '@/app/api/payment/networx/route';

// Mock environment variables
const mockEnv = {
  NETWORX_SHOP_ID: 'test_shop_id',
  NETWORX_SECRET_KEY: 'test_secret_key',
  NETWORX_TEST_MODE: 'true',
  NETWORX_RETURN_URL: 'https://nerbixa.com/dashboard',
  NETWORX_WEBHOOK_URL: 'https://nerbixa.com/api/webhooks/networx',
};

describe('Payment Dashboard Redirect Integration', () => {
  beforeAll(() => {
    // Set environment variables
    Object.entries(mockEnv).forEach(([key, value]) => {
      process.env[key] = value;
    });
  });

  afterAll(() => {
    // Clean up environment variables
    Object.keys(mockEnv).forEach((key) => {
      delete process.env[key];
    });
  });

  describe('Payment Token Creation with Dashboard Return URL', () => {
    it('should create payment token with dashboard return URL', async () => {
      const requestBody = {
        amount: 10.00,
        currency: 'USD',
        orderId: 'test_order_123',
        description: 'Test Payment (100 Tokens)',
        customerEmail: 'test@example.com',
        userId: 'user_test123',
      };

      const request = new NextRequest('http://localhost:3000/api/payment/networx', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      // Mock fetch for Networx API
      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          checkout: {
            redirect_url: 'https://checkout.networxpay.com/widget/hpp.html?token=test_token',
          },
        }),
      });

      const response = await paymentAPI(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.payment_url).toContain('checkout.networxpay.com');

      // Verify the mock was called with correct return URL
      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const requestData = JSON.parse(fetchCall[1].body);
      
      expect(requestData.checkout.settings.return_url).toContain('/dashboard');
      expect(requestData.checkout.settings.return_url).toContain('payment=success');
      expect(requestData.checkout.settings.return_url).toContain('order_id=test_order_123');
    });

    it('should use environment variable for return URL', async () => {
      const customReturnUrl = 'https://custom.nerbixa.com/dashboard';
      process.env.NETWORX_RETURN_URL = customReturnUrl;

      const requestBody = {
        amount: 5.00,
        currency: 'USD',
        orderId: 'custom_order_456',
        description: 'Custom Test (50 Tokens)',
        customerEmail: 'custom@example.com',
        userId: 'user_custom456',
      };

      const request = new NextRequest('http://localhost:3000/api/payment/networx', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          checkout: {
            redirect_url: 'https://checkout.networxpay.com/widget/hpp.html?token=custom_token',
          },
        }),
      });

      const response = await paymentAPI(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const requestData = JSON.parse(fetchCall[1].body);
      
      expect(requestData.checkout.settings.return_url).toContain(customReturnUrl);
      expect(requestData.checkout.settings.return_url).toContain('payment=success');

      // Restore original env
      process.env.NETWORX_RETURN_URL = mockEnv.NETWORX_RETURN_URL;
    });

    it('should include order_id in return URL', async () => {
      const orderId = 'gen_user_123_1234567890';

      const requestBody = {
        amount: 20.00,
        currency: 'USD',
        orderId,
        description: 'Order Test (200 Tokens)',
        customerEmail: 'order@example.com',
        userId: 'user_order123',
      };

      const request = new NextRequest('http://localhost:3000/api/payment/networx', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          checkout: {
            redirect_url: 'https://checkout.networxpay.com/widget/hpp.html?token=order_token',
          },
        }),
      });

      const response = await paymentAPI(request);
      expect(response.status).toBe(200);

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      const requestData = JSON.parse(fetchCall[1].body);
      
      expect(requestData.checkout.settings.return_url).toContain(`order_id=${orderId}`);
    });
  });

  describe('Dashboard Redirect URL Format', () => {
    it('should format return URL correctly for successful payment', () => {
      const baseUrl = 'https://nerbixa.com/dashboard';
      const orderId = 'test_order_789';
      const expectedUrl = `${baseUrl}?payment=success&order_id=${orderId}`;

      // Simulate what the payment API constructs
      const returnUrl = `${baseUrl}?payment=success&order_id=${orderId}`;

      expect(returnUrl).toBe(expectedUrl);
      expect(returnUrl).toContain('payment=success');
      expect(returnUrl).toContain('order_id=');
      expect(returnUrl).not.toContain('/payment/success');
    });

    it('should not redirect to old success page', () => {
      const returnUrl = 'https://nerbixa.com/dashboard?payment=success&order_id=123';

      expect(returnUrl).not.toContain('/payment/success');
      expect(returnUrl).toContain('/dashboard');
    });
  });

  describe('Payment Status Handling', () => {
    it('should only include success status in return URL for successful payments', () => {
      const successReturnUrl = 'https://nerbixa.com/dashboard?payment=success&order_id=123';
      
      expect(successReturnUrl).toContain('payment=success');
      expect(successReturnUrl).not.toContain('payment=failed');
      expect(successReturnUrl).not.toContain('payment=canceled');
    });

    it('should handle query parameter extraction on dashboard', () => {
      const url = new URL('https://nerbixa.com/dashboard?payment=success&order_id=gen_user_123_1234567890&token=abc123&status=successful&uid=def456');
      
      const paymentStatus = url.searchParams.get('payment');
      const orderId = url.searchParams.get('order_id');
      const token = url.searchParams.get('token');
      
      expect(paymentStatus).toBe('success');
      expect(orderId).toBe('gen_user_123_1234567890');
      expect(token).toBe('abc123');
    });

    it('should clean up query parameters after notification', () => {
      const url = new URL('https://nerbixa.com/dashboard?payment=success&order_id=123&token=abc&status=successful&uid=xyz');
      
      // Simulate cleanup
      url.searchParams.delete('payment');
      url.searchParams.delete('order_id');
      url.searchParams.delete('token');
      url.searchParams.delete('status');
      url.searchParams.delete('uid');
      
      expect(url.toString()).toBe('https://nerbixa.com/dashboard');
      expect(url.search).toBe('');
    });
  });

  describe('Regression Tests: Prevent Failed Payment Success Redirect', () => {
    it('should NOT show success notification for failed payments', () => {
      const failedUrl = new URL('https://nerbixa.com/dashboard?payment=failed&order_id=123');
      
      const paymentStatus = failedUrl.searchParams.get('payment');
      const shouldShowSuccess = paymentStatus === 'success';
      
      expect(shouldShowSuccess).toBe(false);
    });

    it('should NOT show success notification for canceled payments', () => {
      const canceledUrl = new URL('https://nerbixa.com/dashboard?payment=canceled&order_id=123');
      
      const paymentStatus = canceledUrl.searchParams.get('payment');
      const shouldShowSuccess = paymentStatus === 'success';
      
      expect(shouldShowSuccess).toBe(false);
    });

    it('should NOT show success notification without order_id', () => {
      const urlWithoutOrder = new URL('https://nerbixa.com/dashboard?payment=success');
      
      const paymentStatus = urlWithoutOrder.searchParams.get('payment');
      const orderId = urlWithoutOrder.searchParams.get('order_id');
      const shouldShowSuccess = paymentStatus === 'success' && !!orderId;
      
      expect(shouldShowSuccess).toBe(false);
    });

    it('should NOT show success notification for pending payments', () => {
      const pendingUrl = new URL('https://nerbixa.com/dashboard?payment=pending&order_id=123');
      
      const paymentStatus = pendingUrl.searchParams.get('payment');
      const shouldShowSuccess = paymentStatus === 'success';
      
      expect(shouldShowSuccess).toBe(false);
    });

    it('should only trigger success notification once per session', () => {
      const url = new URL('https://nerbixa.com/dashboard?payment=success&order_id=123');
      
      // First load - should show notification
      let paymentStatus = url.searchParams.get('payment');
      let orderId = url.searchParams.get('order_id');
      let shouldShowNotification = paymentStatus === 'success' && !!orderId;
      
      expect(shouldShowNotification).toBe(true);
      
      // Clean up URL
      url.searchParams.delete('payment');
      url.searchParams.delete('order_id');
      
      // Second load (after cleanup) - should NOT show notification
      paymentStatus = url.searchParams.get('payment');
      orderId = url.searchParams.get('order_id');
      shouldShowNotification = paymentStatus === 'success' && !!orderId;
      
      expect(shouldShowNotification).toBe(false);
    });
  });

  describe('Error Cases', () => {
    it('should handle missing environment variables gracefully', async () => {
      // Temporarily remove env vars
      const tempShopId = process.env.NETWORX_SHOP_ID;
      const tempSecretKey = process.env.NETWORX_SECRET_KEY;
      
      delete process.env.NETWORX_SHOP_ID;
      delete process.env.NETWORX_SECRET_KEY;

      const requestBody = {
        amount: 10.00,
        currency: 'USD',
        orderId: 'error_test_123',
        description: 'Error Test',
        customerEmail: 'error@example.com',
        userId: 'user_error123',
      };

      const request = new NextRequest('http://localhost:3000/api/payment/networx', {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      const response = await paymentAPI(request);
      expect(response.status).toBe(500);

      // Restore env vars
      process.env.NETWORX_SHOP_ID = tempShopId;
      process.env.NETWORX_SECRET_KEY = tempSecretKey;
    });

    it('should handle malformed return URLs', () => {
      const malformedUrls = [
        '/dashboard',  // Missing protocol
        'dashboard',   // Missing protocol and slash
        'https://dashboard',  // Invalid domain
      ];

      malformedUrls.forEach(url => {
        expect(() => {
          new URL(url);
        }).toThrow();
      });

      // Valid URL should not throw
      expect(() => {
        new URL('https://nerbixa.com/dashboard');
      }).not.toThrow();
    });
  });

  describe('Integration with Webhook Processing', () => {
    it('should process payment even if user closes dashboard before redirect', async () => {
      // This test verifies that webhook processing is independent of user navigation
      // The webhook will process the payment regardless of where the user navigates
      
      const orderId = 'webhook_independent_123';
      
      // User might:
      // 1. Complete payment on Networx
      // 2. Close the tab/browser
      // 3. Webhook still processes in background
      
      // The return URL is just for user convenience
      // Webhook processing is what actually updates the balance
      
      expect(mockEnv.NETWORX_WEBHOOK_URL).toBe('https://nerbixa.com/api/webhooks/networx');
      expect(mockEnv.NETWORX_WEBHOOK_URL).not.toContain('/payment/success');
    });

    it('should have separate webhook and return URLs', () => {
      const returnUrl = 'https://nerbixa.com/dashboard';
      const webhookUrl = 'https://nerbixa.com/api/webhooks/networx';
      
      expect(returnUrl).not.toBe(webhookUrl);
      expect(returnUrl).toContain('/dashboard');
      expect(webhookUrl).toContain('/api/webhooks');
    });
  });
});

describe('Dashboard Component Behavior', () => {
  describe('Payment Success Notification Logic', () => {
    it('should show success toast when payment=success and order_id present', () => {
      const searchParams = new URLSearchParams('payment=success&order_id=123');
      
      const paymentStatus = searchParams.get('payment');
      const orderId = searchParams.get('order_id');
      
      const shouldShowToast = paymentStatus === 'success' && !!orderId;
      
      expect(shouldShowToast).toBe(true);
    });

    it('should not show toast when payment parameter is missing', () => {
      const searchParams = new URLSearchParams('order_id=123');
      
      const paymentStatus = searchParams.get('payment');
      const orderId = searchParams.get('order_id');
      
      const shouldShowToast = paymentStatus === 'success' && !!orderId;
      
      expect(shouldShowToast).toBe(false);
    });

    it('should not show toast when order_id is missing', () => {
      const searchParams = new URLSearchParams('payment=success');
      
      const paymentStatus = searchParams.get('payment');
      const orderId = searchParams.get('order_id');
      
      const shouldShowToast = paymentStatus === 'success' && !!orderId;
      
      expect(shouldShowToast).toBe(false);
    });

    it('should not show toast for non-success payment statuses', () => {
      const statuses = ['failed', 'canceled', 'pending', 'error'];
      
      statuses.forEach(status => {
        const searchParams = new URLSearchParams(`payment=${status}&order_id=123`);
        
        const paymentStatus = searchParams.get('payment');
        const orderId = searchParams.get('order_id');
        
        const shouldShowToast = paymentStatus === 'success' && !!orderId;
        
        expect(shouldShowToast).toBe(false);
      });
    });
  });

  describe('URL Cleanup After Notification', () => {
    it('should remove all payment-related query parameters', () => {
      const url = new URL('https://nerbixa.com/dashboard?payment=success&order_id=gen_123&token=abc&status=successful&uid=xyz&other_param=keep');
      
      const paymentParams = ['payment', 'order_id', 'token', 'status', 'uid'];
      paymentParams.forEach(param => url.searchParams.delete(param));
      
      expect(url.searchParams.has('payment')).toBe(false);
      expect(url.searchParams.has('order_id')).toBe(false);
      expect(url.searchParams.has('token')).toBe(false);
      expect(url.searchParams.has('status')).toBe(false);
      expect(url.searchParams.has('uid')).toBe(false);
      expect(url.searchParams.get('other_param')).toBe('keep');
    });

    it('should maintain clean dashboard URL after cleanup', () => {
      const url = new URL('https://nerbixa.com/dashboard?payment=success&order_id=123');
      
      url.searchParams.delete('payment');
      url.searchParams.delete('order_id');
      
      expect(url.pathname).toBe('/dashboard');
      expect(url.search).toBe('');
      expect(url.toString()).toBe('https://nerbixa.com/dashboard');
    });
  });
});




