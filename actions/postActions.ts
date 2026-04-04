'use server';

import { revalidatePath } from 'next/cache';
import { getContentArticleBySlug, getContentArticles } from '@/lib/contentArticles';
import { prisma } from '@/lib/prisma';

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

  await prisma.post.create({
    data: {
      slug,
      title,
      description,
      content,
      category,
      readTime,
    },
  });

  revalidatePath('/');
}

export async function getPosts() {
  const [dbPosts, contentPosts] = await Promise.all([
    prisma.post.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    }),
    getContentArticles(),
  ]);

  return [...dbPosts, ...contentPosts].sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  );
}

export async function getPostBySlug(slug: string) {
  const dbPost = await prisma.post.findUnique({
    where: {
      slug,
    },
  });

  if (dbPost) {
    return dbPost;
  }

  return getContentArticleBySlug(slug);
}
