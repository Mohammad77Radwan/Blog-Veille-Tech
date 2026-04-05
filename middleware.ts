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

      let response = NextResponse.next();
      try {
        response = await createClient(request);
      } catch (error) {
        console.error('Supabase middleware createClient failed', error);
      }

      // Admin checks happen in the page/action layer to allow explicit redirects instead of opaque 404s.
      if (isAdminRoute(request)) {
        await auth();
      }

      return response;
    })
  : async (request: Parameters<typeof createClient>[0]) => {
      if (request.headers.has('next-action')) {
        return NextResponse.next();
      }

      try {
        return await createClient(request);
      } catch (error) {
        console.error('Supabase middleware createClient failed', error);
        return NextResponse.next();
      }
    };

export default middleware;

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    '/(api|trpc)(.*)',
  ],
};