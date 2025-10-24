"use client";

import { useState } from 'react';
import { NetworkPaymentWidget } from '@/components/networx-payment-widget';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@clerk/nextjs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';

const PaymentTestPage = () => {
  const { userId } = useAuth();
  
  const [paymentConfig, setPaymentConfig] = useState({
    amount: 10.00,
    currency: 'USD',
    orderId: `order_${Date.now()}`,
    description: 'Test payment via Networx Payment Gateway',
    customerEmail: 'test@example.com',
  });

  const [showWidget, setShowWidget] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<any>(null);

  const handleConfigChange = (field: string, value: any) => {
    setPaymentConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePaymentSuccess = (transactionData: any) => {
    console.log('Payment successful:', transactionData);
    setLastTransaction(transactionData);
    toast.success('Payment completed successfully!');
    setShowWidget(false);
  };

  const handlePaymentError = (error: any) => {
    console.error('Payment error:', error);
    toast.error('Payment processing error');
    setShowWidget(false);
  };

  const handlePaymentCancel = () => {
    console.log('Payment canceled');
    toast('Payment cancelled by user');
    setShowWidget(false);
  };

  const resetTest = () => {
    setPaymentConfig({
      amount: 10.00,
      currency: 'USD',
      orderId: `order_${Date.now()}`,
      description: 'Test payment via Networx Payment Gateway',
      customerEmail: 'test@example.com',
    });
    setShowWidget(false);
    setLastTransaction(null);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Networx Payment Gateway Testing</h1>
        <p className="text-gray-600">
          This page is designed for testing integration with the Networx payment system.
        </p>
        <Badge variant="default" className="mt-2">
          Production Mode
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Payment Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Settings</CardTitle>
            <CardDescription>
              Configure parameters for test payment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={paymentConfig.amount}
                  onChange={(e) => handleConfigChange('amount', parseFloat(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select 
                  value={paymentConfig.currency} 
                  onValueChange={(value) => handleConfigChange('currency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="RUB">RUB</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="orderId">Order ID</Label>
              <Input
                id="orderId"
                value={paymentConfig.orderId}
                onChange={(e) => handleConfigChange('orderId', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerEmail">Customer Email</Label>
              <Input
                id="customerEmail"
                type="email"
                value={paymentConfig.customerEmail}
                onChange={(e) => handleConfigChange('customerEmail', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={paymentConfig.description}
                onChange={(e) => handleConfigChange('description', e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex space-x-2">
              <Button 
                onClick={() => setShowWidget(true)}
                className="flex-1"
                disabled={showWidget}
              >
                Show Payment Widget
              </Button>
              <Button 
                onClick={resetTest}
                variant="outline"
              >
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Виджет платежа или результат */}
        <div className="space-y-6">
          {showWidget ? (
            <NetworkPaymentWidget
              amount={paymentConfig.amount}
              currency={paymentConfig.currency}
              orderId={paymentConfig.orderId}
              description={paymentConfig.description}
              customerEmail={paymentConfig.customerEmail}
              userId={userId || "test_user_123"}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              onCancel={handlePaymentCancel}
            />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Testing Instructions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-gray-600">
                  <h4 className="font-semibold mb-2">For usage:</h4>
                  <ul className="space-y-1 list-disc list-inside">
                    <li>Real bank cards</li>
                    <li>Valid email for notifications</li>
                    <li>Amounts from 0.01 to 999999.99</li>
                  </ul>
                </div>

                <div className="text-sm text-gray-600">
                  <h4 className="font-semibold mb-2">Supported cards:</h4>
                  <div className="bg-gray-50 p-3 rounded font-mono text-xs">
                    <p>Visa, MasterCard, Maestro</p>
                    <p>Secure payments via NetworkPay</p>
                    <p>3D Secure authorization</p>
                  </div>
                </div>

                {!showWidget && (
                  <p className="text-center text-gray-500 italic">
                    Click &quot;Show Payment Widget&quot; to start testing
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Last Transaction Result */}
          {lastTransaction && (
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">Last Successful Transaction</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-green-50 p-4 rounded-lg">
                  <pre className="text-xs overflow-auto">
                    {JSON.stringify(lastTransaction, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Configuration Information */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Configuration Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">Environment Variables:</h4>
              <div className="space-y-1 text-gray-600">
                <p>• NETWORX_SHOP_ID: ✅ 29959</p>
                <p>• NETWORX_SECRET_KEY: ✅ Protected</p>
                <p>• NETWORX_TEST_MODE: ❌ Production Mode</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">API Endpoints:</h4>
              <div className="space-y-1 text-gray-600">
                <p>• Payment creation: /api/payment/networx</p>
                <p>• Webhook: /api/webhooks/networx</p>
                <p>• Success: /payment/success</p>
                <p>• Cancel: /payment/cancel</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentTestPage;
