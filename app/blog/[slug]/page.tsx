import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CalendarDays } from 'lucide-react';
import { auth } from '@clerk/nextjs/server';
import { Reveal } from '@/components/animations/Reveal';
import { MarkdownArticle } from '@/components/content/MarkdownArticle';
import { getPostBySlug } from '@/actions/postActions';
import { PostSocialPanel } from '@/components/social/PostSocialPanel';
import { getCurrentDbUser } from '@/lib/auth';
import { isClerkConfigured } from '@/lib/clerk';

export const dynamic = 'force-dynamic';

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

function estimateReadTimeFromContent(content: string): string {
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(wordCount / 220));
  return `${minutes} min`;
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getPostBySlug(params.slug);
  const clerkEnabled = isClerkConfigured();
  const { userId: clerkUserId } = clerkEnabled ? await auth() : { userId: null };
  const currentDbUser = clerkEnabled && clerkUserId ? await getCurrentDbUser() : null;

  if (!post) {
    notFound();
  }

  const publishedAt = new Date(post.createdAt).toLocaleString('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  const initialLiked = currentDbUser ? post.likeRecords.some((like) => like.authorId === currentDbUser.id) : false;
  const isAdmin = currentDbUser?.role === 'ADMIN' || currentDbUser?.role === 'MODERATOR';
  const comments = post.comments.map((comment) => ({
    id: comment.id,
    postId: comment.postId,
    authorId: comment.authorId,
    parentId: comment.parentId,
    body: comment.body,
    likes: comment.likes,
    dislikes: comment.dislikes,
    createdAt: comment.createdAt.toISOString(),
    updatedAt: comment.updatedAt.toISOString(),
    author: {
      id: comment.author.id,
      name: comment.author.name,
      email: comment.author.email,
      imageUrl: comment.author.imageUrl,
    },
  }));

  return (
    <main className="min-h-screen relative overflow-hidden">
      <span className="mesh-accent" aria-hidden="true" />

      <div className="max-w-3xl mx-auto px-6 py-12 relative">
        <Reveal>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-300 hover:text-slate-100 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Retour aux articles
          </Link>
        </Reveal>

        <Reveal delay={0.06}>
          <header className="mb-8 glass-shell p-6 md:p-8 lift-hover">
          <p className="text-xs uppercase tracking-wide text-indigo-300 mb-2">{post.category}</p>
          <h1 className="text-3xl md:text-5xl font-bold text-slate-100 mb-3 leading-tight">
            {post.title}
          </h1>

          <p className="text-slate-300 mb-4 text-base md:text-lg">{post.description}</p>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
            <span>Written by {post.authorName}</span>
            <span className="inline-flex items-center gap-1.5">{post.likes} likes</span>
            <span className="inline-flex items-center gap-1.5">{post._count.comments} comments</span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="w-4 h-4" aria-hidden="true" />
              {publishedAt}
            </span>
          </div>
          </header>
        </Reveal>

        <Reveal delay={0.12}>
          <article className="interactive-card p-6 md:p-9 prose prose-invert max-w-none prose-headings:text-slate-100 prose-h2:mt-10 prose-p:text-slate-300 prose-p:leading-8 prose-strong:text-slate-100 prose-a:text-sky-300 prose-code:text-emerald-200 prose-code:before:content-none prose-code:after:content-none">
            <MarkdownArticle content={post.content} />
          </article>
        </Reveal>

        {clerkEnabled ? (
          <Reveal delay={0.18}>
            <PostSocialPanel
              postId={post.id}
              postSlug={post.slug}
              postTitle={post.title}
              initialLikeCount={post.likes}
              initialShareCount={post.shareCount}
              initialLiked={initialLiked}
              isAdmin={isAdmin}
              comments={comments}
            />
          </Reveal>
        ) : null}
      </div>
    </main>
  );
}
