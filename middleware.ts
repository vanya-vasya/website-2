import {
  clerkMiddleware,
  createRouteMatcher
} from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { locales, defaultLocale } from './i18n/request';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
]);

export default clerkMiddleware((auth, req: NextRequest) => {
  // Log auth attempts for debugging (remove in production if not needed)
  if (process.env.NODE_ENV === 'development') {
    console.log('[Clerk Middleware]', {
      path: req.nextUrl.pathname,
      isProtected: isProtectedRoute(req),
      url: req.url,
    });
  }

  // Handle locale persistence
  const pathname = req.nextUrl.pathname;
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // Get locale from cookie (priority) or Accept-Language header
  const cookieLocale = req.cookies.get('NEXT_LOCALE')?.value;
  let locale: string = defaultLocale;

  if (cookieLocale && locales.includes(cookieLocale as typeof locales[number])) {
    locale = cookieLocale;
  } else if (!pathnameHasLocale) {
    // Try to detect from Accept-Language header
    const acceptLanguage = req.headers.get('accept-language');
    if (acceptLanguage) {
      const browserLocale = acceptLanguage.split(',')[0].split('-')[0];
      if (locales.includes(browserLocale as typeof locales[number])) {
        locale = browserLocale;
      }
    }
  }

  // Ensure locale cookie is set for persistence across navigation
  const response = NextResponse.next();
  if (!req.cookies.get('NEXT_LOCALE')) {
    response.cookies.set('NEXT_LOCALE', locale, {
      path: '/',
      maxAge: 31536000, // 1 year
      sameSite: 'lax',
    });
  }

  if (isProtectedRoute(req)) {
    auth().protect();
  }

  return response;
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};