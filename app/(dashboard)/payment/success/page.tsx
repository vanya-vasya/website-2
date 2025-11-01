"use client";

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Loader } from '@/components/loader';

const PaymentSuccessPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();

  // INSTANT REDIRECT - Skip all intermediate UI
  useEffect(() => {
    // Immediately redirect to dashboard on mount
    router.push('/dashboard?payment_success=true');
  }, [router]);

  // Show simple loading state during redirect
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <Loader />
        <p className="mt-4 text-gray-600">Redirecting to dashboard...</p>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
