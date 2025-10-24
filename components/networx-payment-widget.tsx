"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader } from '@/components/loader';
import { toast } from 'react-hot-toast';

interface NetworkPaymentWidgetProps {
  amount: number;
  currency?: string;
  orderId: string;
  description?: string;
  customerEmail?: string;
  userId?: string;
  onSuccess?: (transactionData: any) => void;
  onError?: (error: any) => void;
  onCancel?: () => void;
}

interface PaymentResponse {
  success: boolean;
  token?: string;
  payment_url?: string;
  error?: string;
  details?: any;
  mock?: boolean;
  message?: string;
}

export const NetworkPaymentWidget: React.FC<NetworkPaymentWidgetProps> = ({
  amount,
  currency = 'USD',
  orderId,
  description,
  customerEmail,
  userId,
  onSuccess,
  onError,
  onCancel,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentToken, setPaymentToken] = useState<string | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [email, setEmail] = useState(customerEmail || '');

  // Function to create payment token
  const createPaymentToken = async () => {
    if (!email) {
      toast.error('Please enter email to continue');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/payment/networx', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          currency,
          orderId,
          description,
          customerEmail: email,
          userId,
        }),
      });

      const data: PaymentResponse = await response.json();

      if (data.success && data.token && data.payment_url) {
        setPaymentToken(data.token);
        setPaymentUrl(data.payment_url);
        
        toast.success('Payment token created successfully');
      } else {
        console.error('Payment token creation failed:', data);
        toast.error(data.error || 'Failed to create payment token');
        onError?.(data);
      }
    } catch (error) {
      console.error('Payment token creation error:', error);
      toast.error('Server connection error');
      onError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to redirect to hosted payment page
  const openPaymentWidget = () => {
    if (!paymentUrl) return;

    toast('Redirecting to payment page...');
    
    // Direct redirect to Networx Pay hosted payment page
    // This is the official recommended approach
    window.location.href = paymentUrl;
  };

  // Function to check payment status
  const checkPaymentStatus = async () => {
    if (!paymentToken) return;

    try {
      const response = await fetch(`/api/payment/networx?token=${paymentToken}`);
      const data = await response.json();

      if (data.success) {
        const status = data.transaction?.status;
        console.log('Payment status:', status);

        switch (status) {
          case 'success':
            toast.success('Payment completed successfully!');
            onSuccess?.(data.transaction);
            break;
          case 'failed':
            toast.error('Payment failed');
            onError?.(data.transaction);
            break;
          case 'pending':
            toast('Payment processing...');
            break;
          case 'canceled':
            toast('Payment cancelled');
            onCancel?.();
            break;
        }
      }
    } catch (error) {
      console.error('Payment status check error:', error);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto bg-white border-gray-200" style={{fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"}}>
      <CardHeader>
        <CardTitle className="text-gray-900">Payment via Networx</CardTitle>
        <CardDescription className="text-gray-600">
          Amount to pay: {amount} {currency}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!paymentToken ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700">Email for notifications</Label>
              <Input
                id="email"
                type="email"
                placeholder="your-email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
                className="bg-white border-gray-300 text-gray-900"
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <strong>Order:</strong> {orderId}
              </p>
              {description && (
                <p className="text-sm text-gray-600">
                  <strong>Description:</strong> {description}
                </p>
              )}
            </div>

            <Button
              onClick={createPaymentToken}
              disabled={isLoading || !email}
              className="w-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 hover:from-cyan-500 hover:via-blue-600 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
            >
              {isLoading ? (
                <>
                  <Loader />
                  Creating token...
                </>
              ) : (
                'Create Payment Token'
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-800">
                ✅ Payment token created successfully
              </p>
              <p className="text-xs text-green-600 mt-1">
                Token: {paymentToken}
              </p>
            </div>

            <div className="space-y-2">
              <Button
                onClick={openPaymentWidget}
                className="w-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 hover:from-cyan-500 hover:via-blue-600 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                disabled={!paymentUrl}
              >
                Proceed to Payment
              </Button>

              <Button
                onClick={checkPaymentStatus}
                variant="outline"
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Check Payment Status
              </Button>
            </div>

            <div className="text-xs text-gray-600">
              <p>• You will be redirected to the secure payment page</p>
              <p>• Complete your payment with credit/debit card</p>
              <p>• You will return here after payment completion</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
