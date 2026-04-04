'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAdminUser } from '@/lib/auth';

export async function updateUserRoleAction(formData: FormData): Promise<void> {
  await requireAdminUser();

  const userId = String(formData.get('userId') ?? '').trim();
  const role = String(formData.get('role') ?? '').trim();

  if (!userId || !role) {
    throw new Error('User and role are required.');
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      role: role as 'USER' | 'MODERATOR' | 'ADMIN',
    },
  });

  revalidatePath('/admin');
}

export async function togglePostPublishedAction(formData: FormData): Promise<void> {
  await requireAdminUser();

  const postId = String(formData.get('postId') ?? '').trim();
  const published = String(formData.get('published') ?? '').trim() === 'true';

  if (!postId) {
    throw new Error('Post is required.');
  }

  await prisma.post.update({
    where: { id: postId },
    data: {
      published: !published,
    },
  });

  revalidatePath('/admin');
  revalidatePath('/');
}

export async function deletePostAction(formData: FormData): Promise<void> {
  await requireAdminUser();

  const postId = String(formData.get('postId') ?? '').trim();

  if (!postId) {
    throw new Error('Post is required.');
  }

  await prisma.post.delete({
    where: { id: postId },
  });

  revalidatePath('/admin');
  revalidatePath('/');
}