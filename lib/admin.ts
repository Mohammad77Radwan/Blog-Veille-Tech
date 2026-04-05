import { prisma } from '@/lib/prisma';
import { syncContentArticlesToDatabase } from '@/lib/posts';

export async function getAdminDashboardData() {
  await syncContentArticlesToDatabase();

  const [totalUsers, totalPosts, totalComments, totalLikes, totalFollows, users, posts, comments] =
    await Promise.all([
      prisma.user.count(),
      prisma.post.count({ where: { published: true } }),
      prisma.comment.count({ where: { deletedAt: null } }),
      prisma.like.count(),
      prisma.follow.count(),
      prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 12,
        include: {
          _count: {
            select: {
              posts: true,
              comments: true,
              likeRecords: true,
              followers: true,
              following: true,
            },
          },
        },
      }),
      prisma.post.findMany({
        orderBy: { createdAt: 'desc' },
        take: 12,
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
              comments: true,
              likeRecords: true,
            },
          },
        },
      }),
      prisma.comment.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
        include: {
          post: {
            select: {
              id: true,
              slug: true,
              title: true,
            },
          },
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              imageUrl: true,
              role: true,
            },
          },
        },
        where: {
          deletedAt: null,
        },
      }),
    ]);

  const topPosts = [...posts]
    .sort((left, right) => right.likes + right._count.comments - (left.likes + left._count.comments))
    .slice(0, 5)
    .map((post) => ({
      id: post.id,
      title: post.title,
      slug: post.slug,
      likes: post.likes,
      comments: post._count.comments,
      shares: post.shareCount,
    }));

  return {
    metrics: {
      totalUsers,
      totalPosts,
      totalComments,
      totalLikes,
      totalFollows,
    },
    users: users.map((user) => ({
      id: user.id,
      clerkId: user.clerkId,
      email: user.email,
      name: user.name,
      imageUrl: user.imageUrl,
      role: user.role,
      createdAt: user.createdAt.toISOString(),
      counts: {
        posts: user._count.posts,
        comments: user._count.comments,
        likes: user._count.likeRecords,
        followers: user._count.followers,
        following: user._count.following,
      },
    })),
    posts: posts.map((post) => ({
      id: post.id,
      slug: post.slug,
      title: post.title,
      description: post.description,
      category: post.category,
      readTime: post.readTime,
      authorName: post.authorName,
      source: post.source,
      published: post.published,
      shareCount: post.shareCount,
      createdAt: post.createdAt.toISOString(),
      counts: {
        likes: post.likes,
        comments: post._count.comments,
      },
      author: post.author,
    })),
    comments: comments.map((comment) => ({
      id: comment.id,
      body: comment.body,
      createdAt: comment.createdAt.toISOString(),
      post: comment.post,
      author: comment.author,
    })),
    topPosts,
  };
}