import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { isClerkConfigured } from '@/lib/clerk';

const ADMIN_EMAILS = new Set(
  (process.env.ADMIN_EMAILS ?? '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean),
);

function getPrimaryEmail(clerkUser: Awaited<ReturnType<typeof currentUser>>): string | null {
  const emailAddress = clerkUser?.emailAddresses[0]?.emailAddress ?? null;
  return emailAddress ? emailAddress.toLowerCase() : null;
}

function getDisplayName(clerkUser: Awaited<ReturnType<typeof currentUser>>): string {
  return (
    clerkUser?.fullName?.trim() ||
    clerkUser?.username?.trim() ||
    clerkUser?.emailAddresses[0]?.emailAddress ||
    'Anonymous'
  );
}

async function upsertCurrentUser() {
  if (!isClerkConfigured()) {
    return null;
  }

  const clerkUser = await currentUser();

  if (!clerkUser) {
    return null;
  }

  const email = getPrimaryEmail(clerkUser);
  if (!email) {
    throw new Error('Unable to determine the signed-in user email.');
  }

  const role = ADMIN_EMAILS.has(email) ? 'ADMIN' : 'USER';

  return prisma.user.upsert({
    where: { clerkId: clerkUser.id },
    update: {
      email,
      name: getDisplayName(clerkUser),
      imageUrl: clerkUser.imageUrl,
      role,
    },
    create: {
      clerkId: clerkUser.id,
      email,
      name: getDisplayName(clerkUser),
      imageUrl: clerkUser.imageUrl,
      role,
    },
  });
}

export async function getCurrentDbUser() {
  if (!isClerkConfigured()) {
    return null;
  }

  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  return upsertCurrentUser();
}

export async function requireAuthenticatedUser() {
  const user = await getCurrentDbUser();

  if (!user) {
    throw new Error('Unauthorized. Configure Clerk first.');
  }

  return user;
}

export async function requireAdminUser() {
  const user = await requireAuthenticatedUser();

  if (user.role !== 'ADMIN' && user.role !== 'MODERATOR') {
    throw new Error('Forbidden');
  }

  return user;
}