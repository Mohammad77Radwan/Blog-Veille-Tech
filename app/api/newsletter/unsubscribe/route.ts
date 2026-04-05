import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')?.trim();

  if (!token) {
    return NextResponse.redirect(new URL('/?unsubscribe=invalid', request.url));
  }

  await prisma.subscriber.updateMany({
    where: {
      unsubscribeToken: token,
      isActive: true,
    },
    data: {
      isActive: false,
      unsubscribedAt: new Date(),
    },
  });

  return NextResponse.redirect(new URL('/?unsubscribe=success', request.url));
}
