"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader } from '@/components/loader';
import { toast } from 'react-hot-toast';

interface BalanceVerificationData {
  success: boolean;
  balanceUpdated: boolean;
  currentBalance?: number;
  transaction?: {
    id: string;
    amount: string;
    status: string;
    paid_at: Date;
  };
}

const PaymentCallbackPage = () => {
  const [verificationStatus, setVerificationStatus] = useState<'verifying' | 'success' | 'pending' | 'error'>('verifying');
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const verifyAndRedirect = async () => {
      const token = searchParams.get('token');
      const orderId = searchParams.get('order_id');
      const status = searchParams.get('status');

      console.log('Payment callback received:', { token, orderId, status });

      // Check if payment status is not successful
      if (status && status !== 'successful' && status !== 'success') {
        console.log('Payment not successful, status:', status);
        toast.error('Payment was not completed successfully');
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
        return;
      }

      if (!token && !orderId) {
        console.error('Missing payment identifiers');
        setVerificationStatus('error');
        toast.error('Invalid payment callback');
        setTimeout(() => {
          router.push('/dashboard');
        }, 2000);
        return;
      }

      // Verify balance has been updated
      let attempts = 0;
      const maxAttempts = 15; // 30 seconds max (15 attempts * 2 seconds)

      const pollBalance = async (): Promise<boolean> => {
        try {
          const transactionId = orderId || token;
          const response = await fetch(`/api/payment/verify-balance?transactionId=${transactionId}`);
          const data: BalanceVerificationData = await response.json();

          console.log('Balance verification attempt', attempts + 1, ':', data);

          if (data.success && data.balanceUpdated) {
            setVerificationStatus('success');
            console.log('✅ Payment verified! Redirecting to dashboard...');
            
            // Show success toast with transaction details
            if (data.transaction) {
              toast.success(`Payment successful! ${data.currentBalance || 0} credits available`, {
                duration: 4000,
              });
            } else {
              toast.success('Payment successful! Your credits have been added.', {
                duration: 4000,
              });
            }

            // Immediate redirect to dashboard
            setTimeout(() => {
              router.push('/dashboard');
            }, 1000);
            
            return true;
          }
          return false;
        } catch (error) {
          console.error('Error verifying balance:', error);
          return false;
        }
      };

      // Initial check
      const initialVerified = await pollBalance();
      if (initialVerified) return;

      // Poll every 2 seconds
      const pollInterval = setInterval(async () => {
        attempts++;

        const verified = await pollBalance();

        if (verified || attempts >= maxAttempts) {
          clearInterval(pollInterval);

          if (!verified) {
            console.log('⏳ Balance verification timeout');
            setVerificationStatus('pending');
            toast('Your payment is being processed. Credits will appear shortly.', {
              icon: '⏳',
              duration: 4000,
            });
            
            // Redirect to dashboard anyway
            setTimeout(() => {
              router.push('/dashboard');
            }, 2000);
          }
        }
      }, 2000);

      return () => clearInterval(pollInterval);
    };

    verifyAndRedirect();
  }, [searchParams, router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="text-center p-8 bg-white rounded-lg shadow-lg max-w-md mx-4">
        {verificationStatus === 'verifying' && (
          <>
            <Loader />
            <h2 className="mt-6 text-xl font-semibold text-gray-800">
              Verifying Payment
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Please wait while we confirm your payment and update your credits...
            </p>
          </>
        )}

        {verificationStatus === 'success' && (
          <>
            <div className="flex justify-center mb-4">
              <svg 
                className="w-16 h-16 text-green-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-green-600">
              Payment Verified!
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Redirecting to your dashboard...
            </p>
          </>
        )}

        {verificationStatus === 'pending' && (
          <>
            <div className="flex justify-center mb-4">
              <svg 
                className="w-16 h-16 text-yellow-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-yellow-600">
              Payment Processing
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Your payment is being processed. Redirecting to dashboard...
            </p>
          </>
        )}

        {verificationStatus === 'error' && (
          <>
            <div className="flex justify-center mb-4">
              <svg 
                className="w-16 h-16 text-red-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-red-600">
              Verification Error
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Redirecting to dashboard...
            </p>
          </>
        )}

        <div className="mt-6 text-xs text-gray-500">
          This page will redirect automatically
        </div>
      </div>
    </div>
  );
};

export default PaymentCallbackPage;

