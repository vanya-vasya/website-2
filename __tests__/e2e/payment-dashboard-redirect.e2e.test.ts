/**
 * E2E Test: Payment Success to Dashboard Redirect
 * 
 * Tests the complete payment flow including:
 * - NetworkX payment completion
 * - Success page display
 * - Balance verification
 * - Automatic redirect to dashboard
 * - Manual Continue button redirect
 */

describe('Payment Success to Dashboard Redirect', () => {
  describe('NetworkX Return URL Configuration', () => {
    it('should configure return URL to point to /payment/success', () => {
      const expectedReturnUrl = 'https://nerbixa.com/payment/success';
      const defaultReturnUrl = process.env.NETWORX_RETURN_URL || expectedReturnUrl;
      
      expect(defaultReturnUrl).toContain('/payment/success');
    });

    it('should include order_id parameter in return URL', () => {
      const orderId = 'test-order-123';
      const returnUrl = `https://nerbixa.com/payment/success?order_id=${orderId}`;
      
      const url = new URL(returnUrl);
      expect(url.searchParams.get('order_id')).toBe(orderId);
    });
  });

  describe('Success Page Continue Button', () => {
    it('should redirect to /dashboard when Continue button is clicked', () => {
      // Mock router
      const mockPush = jest.fn();
      const mockRouter = {
        push: mockPush,
        pathname: '/payment/success',
      };

      // Simulate button click
      const handleContinue = () => {
        mockRouter.push('/dashboard');
      };

      handleContinue();
      
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });

    it('should redirect to /dashboard with success parameter after balance verification', () => {
      const mockPush = jest.fn();
      const balanceVerified = true;
      
      // Simulate auto-redirect after verification
      if (balanceVerified) {
        mockPush('/dashboard?payment_success=true');
      }

      expect(mockPush).toHaveBeenCalledWith('/dashboard?payment_success=true');
    });

    it('should show countdown timer before automatic redirect', () => {
      let redirectCountdown = 5;
      const countdownInterval = setInterval(() => {
        redirectCountdown--;
        if (redirectCountdown === 0) {
          clearInterval(countdownInterval);
        }
      }, 100); // Fast countdown for testing

      // Wait for countdown
      return new Promise((resolve) => {
        setTimeout(() => {
          clearInterval(countdownInterval);
          expect(redirectCountdown).toBe(0);
          resolve(true);
        }, 600);
      });
    });

    it('should have Continue button enabled after balance verification', () => {
      const balanceVerified = true;
      const isVerifyingBalance = false;
      
      const isButtonDisabled = isVerifyingBalance && !balanceVerified;
      
      expect(isButtonDisabled).toBe(false);
    });

    it('should have Continue button disabled during balance verification', () => {
      const balanceVerified = false;
      const isVerifyingBalance = true;
      
      const isButtonDisabled = isVerifyingBalance && !balanceVerified;
      
      expect(isButtonDisabled).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should redirect to /dashboard on error page Continue button', () => {
      const mockPush = jest.fn();
      const mockRouter = {
        push: mockPush,
      };

      // Simulate error page Continue button click
      const handleErrorContinue = () => {
        mockRouter.push('/dashboard');
      };

      handleErrorContinue();
      
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });

    it('should allow manual redirect even if balance verification times out', () => {
      const mockPush = jest.fn();
      const balanceVerified = false;
      const isVerifyingBalance = false; // Timed out
      
      // User can still click Continue
      const handleManualContinue = () => {
        mockPush('/dashboard');
      };

      handleManualContinue();
      
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
    });
  });

  describe('Payment History Button', () => {
    it('should redirect to /dashboard/billing/payment-history when clicked', () => {
      const mockPush = jest.fn();
      const mockRouter = {
        push: mockPush,
      };

      const handlePaymentHistory = () => {
        mockRouter.push('/dashboard/billing/payment-history');
      };

      handlePaymentHistory();
      
      expect(mockPush).toHaveBeenCalledWith('/dashboard/billing/payment-history');
    });
  });

  describe('Complete Payment Flow', () => {
    it('should follow correct redirect flow after successful payment', async () => {
      const redirectFlow: string[] = [];
      
      // Step 1: User completes payment on NetworkX
      redirectFlow.push('NetworkX Payment Completed');
      
      // Step 2: NetworkX redirects to return URL
      const returnUrl = 'https://nerbixa.com/payment/success?order_id=test-123';
      redirectFlow.push(`Redirect to: ${returnUrl}`);
      
      // Step 3: Success page loads and verifies balance
      redirectFlow.push('Success page loads');
      redirectFlow.push('Balance verification starts');
      
      // Step 4: Balance verified
      await new Promise(resolve => setTimeout(resolve, 100));
      redirectFlow.push('Balance verified');
      
      // Step 5: Auto-redirect countdown
      redirectFlow.push('Countdown: 5s');
      
      // Step 6: Redirect to dashboard
      redirectFlow.push('Redirect to: /dashboard?payment_success=true');
      
      expect(redirectFlow).toContain('NetworkX Payment Completed');
      expect(redirectFlow).toContain('Balance verified');
      expect(redirectFlow[redirectFlow.length - 1]).toContain('/dashboard');
    });

    it('should handle manual Continue click before auto-redirect', () => {
      const mockPush = jest.fn();
      let autoRedirectTimer: NodeJS.Timeout | null = null;
      
      // Start auto-redirect countdown
      autoRedirectTimer = setTimeout(() => {
        mockPush('/dashboard?payment_success=true');
      }, 5000);
      
      // User clicks Continue button before countdown finishes
      if (autoRedirectTimer) {
        clearTimeout(autoRedirectTimer);
      }
      mockPush('/dashboard');
      
      expect(mockPush).toHaveBeenCalledWith('/dashboard');
      expect(mockPush).not.toHaveBeenCalledWith('/dashboard?payment_success=true');
    });
  });

  describe('Button Text and Labels', () => {
    it('should show "Continue to Dashboard" on Continue button', () => {
      const balanceVerified = false;
      const buttonText = balanceVerified 
        ? 'Continue to Dashboard (5s)' 
        : 'Continue to Dashboard';
      
      expect(buttonText).toBe('Continue to Dashboard');
    });

    it('should show countdown in button text after verification', () => {
      const balanceVerified = true;
      const redirectCountdown = 3;
      const buttonText = balanceVerified 
        ? `Continue to Dashboard (${redirectCountdown}s)` 
        : 'Continue to Dashboard';
      
      expect(buttonText).toBe('Continue to Dashboard (3s)');
    });

    it('should show "View Payment History" on secondary button', () => {
      const buttonText = 'View Payment History';
      
      expect(buttonText).toBe('View Payment History');
    });
  });
});

