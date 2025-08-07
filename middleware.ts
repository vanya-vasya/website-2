import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
]);

export default clerkMiddleware((auth, req) => {
  try {
    if (isProtectedRoute(req)) {
      auth().protect();
    }
  } catch (error) {
    console.error('Middleware error:', error);
    // Continue without protection if there's an error
  }
});

export const config = {
  matcher: [
    '/((?!.+\\.[\\w]+$|_next).*)',
    '/',
    '/(api|trpc)(.*)',
  ],
};


