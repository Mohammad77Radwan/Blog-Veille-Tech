'use server';

import { revalidatePath } from 'next/cache';
import { requireAdminUser } from '@/lib/auth';
import { notifySubscribersOfNewPost } from '@/lib/newsletter';
import { prisma } from '@/lib/prisma';
import {
  getUnifiedPostBySlug,
  getUnifiedPosts,
  syncContentArticlesToDatabase,
} from '@/lib/posts';

function slugify(title: string): string {
  return title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

async function getUniqueSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existingPost = await prisma.post.findUnique({ where: { slug } });
    if (!existingPost) {
      return slug;
    }
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }
}

export async function createPost(formData: FormData): Promise<void> {
  const adminUser = await requireAdminUser();
  const title = String(formData.get('title') ?? '').trim();
  const description = String(formData.get('description') ?? '').trim();
  const category = String(formData.get('category') ?? '').trim();
  const readTime = String(formData.get('readTime') ?? '').trim();
  const content = String(formData.get('content') ?? '').trim();

  if (!title || !description || !category || !readTime || !content) {
    throw new Error('Tous les champs sont obligatoires.');
  }

  const baseSlug = slugify(title);
  const slug = await getUniqueSlug(baseSlug);

  const post = await prisma.post.create({
    data: {
      slug,
      title,
      description,
      content,
      category,
      readTime,
      authorId: adminUser.id,
      authorName: adminUser.name ?? adminUser.email,
      source: 'DATABASE',
      published: true,
    },
  });

  try {
    await notifySubscribersOfNewPost({
      title: post.title,
      description: post.description,
      slug: post.slug,
    });
  } catch (error) {
    console.error('Unable to send newsletter notifications for post creation', error);
  }

  revalidatePath('/');
  revalidatePath('/admin');
}

export async function getPosts() {
  return getUnifiedPosts();
}

export async function getPostBySlug(slug: string) {
  return getUnifiedPostBySlug(slug);
}

export async function syncPostsFromContent() {
  await syncContentArticlesToDatabase();
}
