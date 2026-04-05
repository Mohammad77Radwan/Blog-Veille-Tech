import { prisma } from '@/lib/prisma';
import { getContentArticleBySlug, getContentArticles } from '@/lib/contentArticles';

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
          likeRecords: true,
          comments: true,
        },
      },
    },
  });
}

export async function getUnifiedPostBySlug(slug: string) {
  try {
    const post = await prisma.post.findUnique({
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
        likeRecords: {
          select: {
            authorId: true,
          },
        },
        _count: {
          select: {
            likeRecords: true,
            comments: true,
          },
        },
      },
    });

    if (post) {
      await prisma.post.update({
        where: { id: post.id },
        data: {
          views: {
            increment: 1,
          },
        },
      });

      post.views += 1;
      return post;
    }
  } catch (error) {
    console.error('Unable to load post from database, falling back to content source', error);
  }

  const contentArticle = await getContentArticleBySlug(slug);
  if (!contentArticle) {
    return null;
  }

  return {
    id: contentArticle.id,
    slug: contentArticle.slug,
    title: contentArticle.title,
    description: contentArticle.description,
    content: contentArticle.content,
    category: contentArticle.category,
    readTime: contentArticle.readTime,
    authorName: contentArticle.author,
    source: 'CONTENT',
    published: true,
    views: 0,
    likes: 0,
    shareCount: 0,
    authorId: null,
    author: null,
    comments: [],
    likeRecords: [],
    createdAt: contentArticle.createdAt,
    updatedAt: contentArticle.createdAt,
    _count: {
      likeRecords: 0,
      comments: 0,
    },
  };
}