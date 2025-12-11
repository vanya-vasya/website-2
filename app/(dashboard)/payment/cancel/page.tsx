"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft, RefreshCw, AlertTriangle } from 'lucide-react';
import { Loader } from '@/components/loader';

interface TransactionData {
  transaction_id?: string;
  order_id?: string;
  amount?: string;
  currency?: string;
  status?: string;
  error_message?: string;
  customer_email?: string;
}

const PaymentCancelPage = () => {
  const [transactionData, setTransactionData] = useState<TransactionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();

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
        const response = await fetch(`/api/payment/secure-processor?${queryParam}`);
        const data = await response.json();

        if (data.success && data.transaction) {
          setTransactionData(data.transaction);
        } else {
          // Если не удалось получить данные, используем параметры из URL
          setTransactionData({
            order_id: orderId || 'Неизвестно',
            status: 'canceled'
          });
        }
      } catch (error) {
        console.error('Error fetching transaction data:', error);
        // Используем базовые данные из URL при ошибке
        setTransactionData({
          order_id: searchParams.get('order_id') || 'Неизвестно',
          status: 'canceled'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransactionData();
  }, [searchParams]);

  const getStatusInfo = (status?: string) => {
    switch (status) {
      case 'failed':
        return {
          icon: <XCircle className="w-16 h-16 text-red-500" />,
          title: 'Платеж не удался',
          description: 'К сожалению, ваш платеж не был обработан.',
          color: 'text-red-600'
        };
      case 'canceled':
        return {
          icon: <AlertTriangle className="w-16 h-16 text-yellow-500" />,
          title: 'Платеж отменен',
          description: 'Вы отменили процесс оплаты.',
          color: 'text-yellow-600'
        };
      default:
        return {
          icon: <XCircle className="w-16 h-16 text-gray-500" />,
          title: 'Платеж не завершен',
          description: 'Процесс оплаты был прерван.',
          color: 'text-gray-600'
        };
    }
  };

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

  const statusInfo = getStatusInfo(transactionData?.status);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            {statusInfo.icon}
          </div>
          <CardTitle className={`text-2xl ${statusInfo.color}`}>
            {statusInfo.title}
          </CardTitle>
          <CardDescription>
            {statusInfo.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {transactionData && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <h3 className="font-semibold text-gray-900">Информация о транзакции:</h3>
              
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
                  <span className={`${statusInfo.color} font-semibold capitalize`}>
                    {transactionData.status}
                  </span>
                </div>
              )}
              
              {transactionData.error_message && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                  <p className="text-sm text-red-800">
                    <strong>Причина:</strong> {transactionData.error_message}
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="border-t pt-4">
            {transactionData?.status === 'failed' ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-600">
                  Возможные причины неудачи:
                </p>
                <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                  <li>Недостаточно средств на карте</li>
                  <li>Карта заблокирована или просрочена</li>
                  <li>Неверные данные карты</li>
                  <li>Технические проблемы банка</li>
                </ul>
              </div>
            ) : (
              <p className="text-sm text-gray-600">
                Вы можете попробовать произвести оплату снова или выбрать другой способ оплаты.
              </p>
            )}
          </div>

          <div className="flex flex-col space-y-3">
            <Button className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Попробовать еще раз
            </Button>
            
            <Link href="/dashboard" className="w-full">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Вернуться в панель управления
              </Button>
            </Link>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Если проблема повторяется, обратитесь в службу поддержки
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentCancelPage;
