"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, ArrowLeft, Receipt } from 'lucide-react';
import { Loader } from '@/components/loader';
import { toast } from 'react-hot-toast';

interface TransactionData {
  transaction_id?: string;
  order_id?: string;
  amount?: string;
  currency?: string;
  status?: string;
  customer_email?: string;
}

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

const PaymentSuccessPage = () => {
  const [transactionData, setTransactionData] = useState<TransactionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVerifyingBalance, setIsVerifyingBalance] = useState(false);
  const [balanceVerified, setBalanceVerified] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(5);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Fetch transaction data
  useEffect(() => {
    const fetchTransactionData = async () => {
      const token = searchParams.get('token');
      const orderId = searchParams.get('order_id');

      if (!token && !orderId) {
        setError('Отсутствуют данные транзакции');
        setIsLoading(false);
        return;
      }

      try {
        const queryParam = token ? `token=${token}` : `orderId=${orderId}`;
        const response = await fetch(`/api/payment/networx?${queryParam}`);
        const data = await response.json();

        if (data.success && data.transaction) {
          setTransactionData(data.transaction);
        } else {
          setError('Не удалось получить данные транзакции');
        }
      } catch (error) {
        console.error('Error fetching transaction data:', error);
        setError('Ошибка при получении данных транзакции');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactionData();
  }, [searchParams]);

  // Poll for balance verification
  useEffect(() => {
    if (!transactionData || balanceVerified || error) return;

    const orderId = searchParams.get('order_id') || transactionData.order_id;
    if (!orderId) return;

    setIsVerifyingBalance(true);

    const pollBalance = async () => {
      try {
        const response = await fetch(`/api/payment/verify-balance?transactionId=${orderId}`);
        const data: BalanceVerificationData = await response.json();

        if (data.success && data.balanceUpdated) {
          setBalanceVerified(true);
          setIsVerifyingBalance(false);
          toast.success('Баланс успешно обновлен! Перенаправление на панель управления...');
          return true;
        }
        return false;
      } catch (error) {
        console.error('Error verifying balance:', error);
        return false;
      }
    };

    // Initial check
    pollBalance().then((verified) => {
      if (verified) return;

      // Poll every 2 seconds for up to 30 seconds
      let attempts = 0;
      const maxAttempts = 15;
      
      const pollInterval = setInterval(async () => {
        attempts++;
        
        const verified = await pollBalance();
        
        if (verified || attempts >= maxAttempts) {
          clearInterval(pollInterval);
          
          if (!verified) {
            setIsVerifyingBalance(false);
            toast('Баланс будет обновлен в ближайшее время', {
              icon: '⏳',
            });
          }
        }
      }, 2000);

      return () => clearInterval(pollInterval);
    });
  }, [transactionData, balanceVerified, error, searchParams]);

  // Countdown and redirect to dashboard
  useEffect(() => {
    if (!balanceVerified) return;

    const countdownInterval = setInterval(() => {
      setRedirectCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          router.push('/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownInterval);
  }, [balanceVerified, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader />
          <p className="mt-4 text-gray-600">Проверяем статус платежа...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-red-600">Ошибка</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Link href="/dashboard">
              <Button>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Вернуться в панель управления
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl text-green-600">
            Платеж успешно завершен!
          </CardTitle>
          <CardDescription>
            Спасибо за ваш платеж. Транзакция была обработана успешно.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Balance Verification Status */}
          {isVerifyingBalance && !balanceVerified && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Loader />
                <div>
                  <p className="text-sm font-semibold text-blue-900">
                    Обновление баланса токенов...
                  </p>
                  <p className="text-xs text-blue-700 mt-1">
                    Пожалуйста, подождите, пока мы обновим ваш баланс
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Balance Verified - Redirect Countdown */}
          {balanceVerified && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="text-center">
                <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-green-900">
                  Баланс успешно обновлен!
                </p>
                <p className="text-xs text-green-700 mt-2">
                  Перенаправление на панель управления через {redirectCountdown} сек...
                </p>
              </div>
            </div>
          )}

          {transactionData && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <h3 className="font-semibold text-gray-900">Детали транзакции:</h3>
              
              {transactionData.transaction_id && (
                <div className="flex justify-between">
                  <span className="text-gray-600">ID транзакции:</span>
                  <span className="font-mono text-sm">{transactionData.transaction_id}</span>
                </div>
              )}
              
              {transactionData.order_id && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Номер заказа:</span>
                  <span className="font-mono text-sm">{transactionData.order_id}</span>
                </div>
              )}
              
              {transactionData.amount && transactionData.currency && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Сумма:</span>
                  <span className="font-semibold">
                    {transactionData.amount} {transactionData.currency}
                  </span>
                </div>
              )}
              
              {transactionData.status && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Статус:</span>
                  <span className="text-green-600 font-semibold capitalize">
                    {transactionData.status}
                  </span>
                </div>
              )}
              
              {transactionData.customer_email && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="text-sm">{transactionData.customer_email}</span>
                </div>
              )}
            </div>
          )}

          <div className="border-t pt-4">
            <p className="text-sm text-gray-600 mb-4">
              Уведомление о платеже было отправлено на ваш email. 
              {balanceVerified 
                ? ' Ваши токены готовы к использованию!' 
                : ' Вы можете продолжить использование всех функций платформы.'}
            </p>
          </div>

          <div className="flex flex-col space-y-3">
            <Button 
              onClick={() => router.push('/dashboard')} 
              className="w-full"
              disabled={isVerifyingBalance && !balanceVerified}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {balanceVerified 
                ? `Перейти к панели (${redirectCountdown}s)` 
                : 'Вернуться в панель управления'}
            </Button>
            
            <Link href="/dashboard/billing/payment-history" className="w-full">
              <Button variant="outline" className="w-full">
                <Receipt className="w-4 h-4 mr-2" />
                Посмотреть историю платежей
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccessPage;
