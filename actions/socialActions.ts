'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireAdminUser, requireAuthenticatedUser } from '@/lib/auth';

export async function toggleLikeAction(postId: string) {
  const user = await requireAuthenticatedUser();

  const existingLike = await prisma.like.findUnique({
    where: {
      postId_authorId: {
        postId,
        authorId: user.id,
      },
    },
  });

  if (existingLike) {
    await prisma.$transaction([
      prisma.like.delete({
        where: { id: existingLike.id },
      }),
      prisma.post.update({
        where: { id: postId },
        data: {
          likes: {
            decrement: 1,
          },
        },
      }),
    ]);
  } else {
    await prisma.$transaction([
      prisma.like.create({
        data: {
          postId,
          authorId: user.id,
        },
      }),
      prisma.post.update({
        where: { id: postId },
        data: {
          likes: {
            increment: 1,
          },
        },
      }),
    ]);
  }

  const [post, isLiked] = await Promise.all([
    prisma.post.findUnique({
      where: { id: postId },
      select: {
        likes: true,
      },
    }),
    prisma.like.findUnique({
      where: {
        postId_authorId: {
          postId,
          authorId: user.id,
        },
      },
    }),
  ]);

  return {
    liked: Boolean(isLiked),
    likeCount: post?.likes ?? 0,
  };
}

export async function sharePostAction(postId: string) {
  const updatedPost = await prisma.post.update({
    where: { id: postId },
    data: {
      shareCount: {
        increment: 1,
      },
    },
    select: {
      shareCount: true,
    },
  });

  return {
    shareCount: updatedPost.shareCount,
  };
}

export async function createCommentAction({
  postId,
  postSlug,
  body,
  parentId,
}: {
  postId: string;
  postSlug: string;
  body: string;
  parentId?: string | null;
}) {
  const user = await requireAuthenticatedUser();
  const trimmedBody = body.trim();

  if (!trimmedBody) {
    throw new Error('Comment body is required.');
  }

  const comment = await prisma.comment.create({
    data: {
      postId,
      body: trimmedBody,
      parentId: parentId ?? null,
      authorId: user.id,
    },
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
    },
  });

  revalidatePath(`/blog/${postSlug}`);

  return {
    id: comment.id,
    postId: comment.postId,
    authorId: comment.authorId,
    parentId: comment.parentId,
    body: comment.body,
    likes: comment.likes,
    dislikes: comment.dislikes,
    createdAt: comment.createdAt.toISOString(),
    updatedAt: comment.updatedAt.toISOString(),
    author: comment.author,
  };
}

export async function likeCommentAction(commentId: string) {
  await requireAuthenticatedUser();

  const updated = await prisma.comment.update({
    where: { id: commentId },
    data: {
      likes: {
        increment: 1,
      },
    },
    select: {
      id: true,
      likes: true,
      post: {
        select: {
          slug: true,
        },
      },
    },
  });

  revalidatePath(`/blog/${updated.post.slug}`);

  return {
    commentId: updated.id,
    likes: updated.likes,
  };
}

export async function dislikeCommentAction(commentId: string) {
  await requireAuthenticatedUser();

  const updated = await prisma.comment.update({
    where: { id: commentId },
    data: {
      dislikes: {
        increment: 1,
      },
    },
    select: {
      id: true,
      dislikes: true,
      post: {
        select: {
          slug: true,
        },
      },
    },
  });

  revalidatePath(`/blog/${updated.post.slug}`);

  return {
    commentId: updated.id,
    dislikes: updated.dislikes,
  };
}

export async function deleteCommentAction(commentId: string) {
  await requireAdminUser();

  const deleted = await prisma.comment.delete({
    where: { id: commentId },
    select: {
      id: true,
      post: {
        select: {
          slug: true,
        },
      },
    },
  });

  revalidatePath(`/blog/${deleted.post.slug}`);

  return {
    commentId: deleted.id,
    deleted: true,
  };
}

export async function likeComment(commentId: string) {
  return likeCommentAction(commentId);
}

export async function dislikeComment(commentId: string) {
  return dislikeCommentAction(commentId);
}

export async function deleteComment(commentId: string) {
  return deleteCommentAction(commentId);
}

export async function toggleFollowAction(targetUserId: string) {
  const user = await requireAuthenticatedUser();

  if (user.id === targetUserId) {
    throw new Error('You cannot follow yourself.');
  }

  const existingFollow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: user.id,
        followingId: targetUserId,
      },
    },
  });

  if (existingFollow) {
    await prisma.follow.delete({ where: { id: existingFollow.id } });
  } else {
    await prisma.follow.create({
      data: {
        followerId: user.id,
        followingId: targetUserId,
      },
    });
  }

  return {
    following: !existingFollow,
  };
}