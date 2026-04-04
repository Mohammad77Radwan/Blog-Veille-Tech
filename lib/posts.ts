import { prisma } from '@/lib/prisma';
import { getContentArticles } from '@/lib/contentArticles';

export type PublicPostRecord = Awaited<ReturnType<typeof prisma.post.findMany>>[number];

export async function syncContentArticlesToDatabase(): Promise<void> {
  const contentArticles = await getContentArticles();

  await Promise.all(
    contentArticles.map((article) =>
      prisma.post.upsert({
        where: { slug: article.slug },
        update: {
          title: article.title,
          description: article.description,
          content: article.content,
          category: article.category,
          readTime: article.readTime,
          authorName: article.author,
          source: 'CONTENT',
          published: true,
        },
        create: {
          slug: article.slug,
          title: article.title,
          description: article.description,
          content: article.content,
          category: article.category,
          readTime: article.readTime,
          authorName: article.author,
          source: 'CONTENT',
          published: true,
        },
      }),
    ),
  );
}

export async function getUnifiedPosts() {
  await syncContentArticlesToDatabase();

  return prisma.post.findMany({
    where: { published: true },
    orderBy: { createdAt: 'desc' },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          imageUrl: true,
          role: true,
        },
      },
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    },
  });
}

export async function getUnifiedPostBySlug(slug: string) {
  await syncContentArticlesToDatabase();

  return prisma.post.findUnique({
    where: { slug },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          email: true,
          imageUrl: true,
          role: true,
        },
      },
      comments: {
        where: {
          deletedAt: null,
        },
        orderBy: {
          createdAt: 'asc',
        },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              imageUrl: true,
            },
          },
        },
      },
      likes: {
        select: {
          authorId: true,
        },
      },
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    },
  });
}