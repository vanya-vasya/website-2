import {
  clerkMiddleware,
  createRouteMatcher
} from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();
  
  // Log auth attempts for debugging (remove in production if not needed)
  if (process.env.NODE_ENV === 'development') {
    console.log('[Clerk Middleware]', {
      path: req.nextUrl.pathname,
      isProtected: isProtectedRoute(req),
      userId: userId || 'not-authenticated',
      url: req.url,
    });
  }

  if (isProtectedRoute(req)) {
    try {
      await auth().protect();
    } catch (error) {
      console.error('[Clerk Middleware] Auth protection error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        path: req.nextUrl.pathname,
        url: req.url,
      });
      throw error;
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};