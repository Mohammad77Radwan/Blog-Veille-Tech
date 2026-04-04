import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { createClient } from '@/utils/supabase/middleware';
import { isClerkConfigured } from '@/lib/clerk';
import { NextResponse } from 'next/server';

const isAdminRoute = createRouteMatcher(['/admin(.*)']);

const middleware = isClerkConfigured()
  ? clerkMiddleware(async (auth, request) => {
      if (request.headers.has('next-action')) {
        return NextResponse.next();
      }

      const response = await createClient(request);

      // Admin checks happen in the page/action layer to allow explicit redirects instead of opaque 404s.
      if (isAdminRoute(request)) {
        await auth();
      }

      return response;
    })
  : async (request: Parameters<typeof createClient>[0]) =>
      request.headers.has('next-action') ? NextResponse.next() : createClient(request);

export default middleware;

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    '/(api|trpc)(.*)',
  ],
};