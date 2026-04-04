import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { createClient } from '@/utils/supabase/middleware';
import { isClerkConfigured } from '@/lib/clerk';

const isAdminRoute = createRouteMatcher(['/admin(.*)']);

const middleware = isClerkConfigured()
  ? clerkMiddleware(async (auth, request) => {
      const response = await createClient(request);

      if (isAdminRoute(request)) {
        await auth.protect();
      }

      return response;
    })
  : async (request: Parameters<typeof createClient>[0]) => createClient(request);

export default middleware;

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    '/(api|trpc)(.*)',
  ],
};