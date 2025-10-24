"use client";

import Footer from '@/components/landing/footer'
import Header from '@/components/landing/header'
import { cn } from '@/lib/utils'
import { Nunito } from 'next/font/google'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowLeft, Home, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
 
const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap',
});

// Map of common incorrect routes to correct routes
const ROUTE_REDIRECTS: Record<string, string> = {
  '/dashboardmusic': '/dashboard/music',
  '/dashboard/image': '/dashboard/image-generation',
  '/transformations/add/restore': '/dashboard/image-restore',
  '/transformations/add/fill': '/dashboard/image-generative-fill',
  '/transformations/add/remove': '/dashboard/image-object-remove',
  '/transformations/add/recolor': '/dashboard/image-object-recolor',
  '/transformations/add/removeBackground': '/dashboard/image-background-removal',
};

export default function NotFound() {
  const router = useRouter();
  const pathname = usePathname();
  const [suggestedRoute, setSuggestedRoute] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Check if there's a suggested redirect for this route
    const suggested = ROUTE_REDIRECTS[pathname];
    if (suggested) {
      setSuggestedRoute(suggested);
      
      // Auto-redirect after countdown
      const countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            router.push(suggested);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdownInterval);
    }
  }, [pathname, router]);

  const handleGoBack = () => {
    router.back();
  };

  const handleGoHome = () => {
    router.push('/dashboard');
  };

  const handleGoToSuggested = () => {
    if (suggestedRoute) {
      router.push(suggestedRoute);
    }
  };

  return (
    <main className={cn("bg-white text-gray-900 overflow-x-hidden min-h-screen flex flex-col", nunito.className)}>
      <Header/>
      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-2xl w-full text-center space-y-8">
          {/* 404 Icon */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 opacity-20 blur-3xl rounded-full"></div>
            </div>
            <div className="relative">
              <Search className="w-24 h-24 mx-auto text-gray-400" />
            </div>
          </div>

          {/* Error Message */}
          <div className="space-y-4">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent">
              404
            </h1>
            <h2 className="text-3xl font-bold text-gray-900">
              Page Not Found
            </h2>
            <p className="text-gray-600 max-w-md mx-auto">
              The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>
          </div>

          {/* Suggested Redirect */}
          {suggestedRoute && (
            <div className="p-6 bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 rounded-lg border border-indigo-200 space-y-4">
              <p className="text-sm font-semibold text-gray-900">
                Did you mean to visit:
              </p>
              <p className="text-lg font-mono text-indigo-600">
                {suggestedRoute}
              </p>
              <p className="text-sm text-gray-600">
                Redirecting in <span className="font-bold text-indigo-600">{countdown}</span> seconds...
              </p>
              <Button
                onClick={handleGoToSuggested}
                className="w-full md:w-auto bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 hover:from-cyan-500 hover:via-blue-600 hover:to-indigo-700 text-white"
              >
                Go Now
              </Button>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6">
            <Button
              onClick={handleGoBack}
              variant="outline"
              className="w-full sm:w-auto border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
            <Button
              onClick={handleGoHome}
              className="w-full sm:w-auto bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 hover:from-cyan-500 hover:via-blue-600 hover:to-indigo-700 text-white"
            >
              <Home className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Button>
          </div>

          {/* Current Path Info */}
          <div className="pt-8 border-t border-gray-200">
            <p className="text-xs text-gray-500">
              Current path: <span className="font-mono text-gray-700">{pathname}</span>
            </p>
          </div>
        </div>
      </div>
      <Footer/> 
    </main>
  )
}