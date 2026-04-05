'use client';

import { useEffect, useOptimistic, useState, useTransition, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { SignInButton, useUser } from '@clerk/nextjs';
import { AnimatePresence, motion } from 'framer-motion';
import { Heart, MessageSquare, Send, Share2, Reply, Sparkles, ThumbsDown, ThumbsUp, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AvatarFallback, AvatarImage, AvatarWrapper } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  createCommentAction,
  deleteCommentAction,
  dislikeCommentAction,
  likeCommentAction,
  sharePostAction,
  toggleLikeAction,
} from '@/actions/socialActions';
import {
  buildCommentTree,
  type SocialCommentNode,
  type SocialCommentRecord,
  type SocialUserSummary,
} from '@/lib/social';
import { toast } from 'sonner';

interface PostSocialPanelProps {
  postId: string;
  postSlug: string;
  postTitle: string;
  initialLikeCount: number;
  initialShareCount: number;
  initialLiked: boolean;
  isAdmin: boolean;
  comments: SocialCommentRecord[];
}

type ShareChannel = 'whatsapp' | 'x' | 'linkedin';

function buildShareTargetUrl(channel: ShareChannel, articleUrl: string, articleTitle: string): string {
  const encodedUrl = encodeURIComponent(articleUrl);
  const encodedTitle = encodeURIComponent(articleTitle);

  switch (channel) {
    case 'whatsapp':
      return `https://wa.me/?text=${encodeURIComponent(`${articleTitle} ${articleUrl}`)}`;
    case 'x':
      return `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;
    case 'linkedin':
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
    default:
      return '';
  }
}

function formatRelativeTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function getUserSummary(user: ReturnType<typeof useUser>['user']): SocialUserSummary | null {
  if (!user) {
    return null;
  }

  const primaryEmail = user.emailAddresses[0]?.emailAddress ?? '';

  return {
    id: user.id,
    name: user.fullName ?? user.username ?? null,
    email: primaryEmail,
    imageUrl: user.imageUrl ?? null,
  };
}

export function PostSocialPanel({
  postId,
  postSlug,
  postTitle,
  initialLikeCount,
  initialShareCount,
  initialLiked,
  isAdmin,
  comments,
}: PostSocialPanelProps) {
  const router = useRouter();
  const { isSignedIn, user } = useUser();
  const [isPending, startTransition] = useTransition();
  const [isSharing, setIsSharing] = useState(false);
  const [showShareTargets, setShowShareTargets] = useState(false);
  const [composerValue, setComposerValue] = useState('');
  const [likeBurstId, setLikeBurstId] = useState(0);
  const [showLikeBurst, setShowLikeBurst] = useState(false);

  const [optimisticLikeState, addOptimisticLike] = useOptimistic(
    { count: initialLikeCount, liked: initialLiked },
    (state, next: { delta: number; liked: boolean }) => ({
      count: Math.max(0, state.count + next.delta),
      liked: next.liked,
    }),
  );

  const [optimisticShareCount, addOptimisticShare] = useOptimistic(
    initialShareCount,
    (state, delta: number) => Math.max(0, state + delta),
  );

  const [optimisticComments, addOptimisticComment] = useOptimistic(
    comments,
    (state, next: SocialCommentRecord) => [...state, next],
  );

  const currentUser = getUserSummary(user);
  const commentTree = buildCommentTree(optimisticComments);

  async function handleLike() {
    if (!isSignedIn) {
      toast.message('Connectez-vous pour réagir.');
      return;
    }

    const isIncrement = !optimisticLikeState.liked;
    addOptimisticLike({
      delta: optimisticLikeState.liked ? -1 : 1,
      liked: !optimisticLikeState.liked,
    });

    if (isIncrement) {
      setLikeBurstId((value) => value + 1);
      setShowLikeBurst(true);
    }

    try {
      await toggleLikeAction(postId);
      startTransition(() => router.refresh());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Impossible de mettre à jour le like.');
    }
  }

  useEffect(() => {
    if (!showLikeBurst) {
      return;
    }

    const timer = window.setTimeout(() => setShowLikeBurst(false), 620);
    return () => window.clearTimeout(timer);
  }, [showLikeBurst, likeBurstId]);

  function handleShareToggle() {
    setShowShareTargets((value) => !value);
  }

  async function handleShareTargetClick(channel: ShareChannel) {
    if (isSharing) {
      return;
    }

    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/blog/${postSlug}` : '';
    if (!shareUrl) {
      toast.error('URL de partage indisponible.');
      return;
    }

    const targetUrl = buildShareTargetUrl(channel, shareUrl, postTitle);
    if (!targetUrl) {
      toast.error('Canal de partage invalide.');
      return;
    }

    window.open(targetUrl, '_blank', 'noopener,noreferrer');
    setIsSharing(true);

    try {
      addOptimisticShare(1);
      await sharePostAction(postId);
      startTransition(() => router.refresh());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Impossible de mettre a jour le compteur de partage.');
    } finally {
      setIsSharing(false);
    }
  }

  async function handleCreateComment({ body, parentId }: { body: string; parentId?: string | null }) {
    if (!isSignedIn || !currentUser) {
      toast.message('Connectez-vous pour commenter.');
      return;
    }

    const trimmedBody = body.trim();
    if (!trimmedBody) {
      return;
    }

    const optimisticComment: SocialCommentRecord = {
      id: crypto.randomUUID(),
      postId,
      authorId: currentUser.id,
      parentId: parentId ?? null,
      body: trimmedBody,
      likes: 0,
      dislikes: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: currentUser,
    };

    addOptimisticComment(optimisticComment);
    setComposerValue('');

    try {
      await createCommentAction({
        postId,
          postSlug,
        body: trimmedBody,
        parentId: parentId ?? null,
      });

      startTransition(() => router.refresh());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Impossible de publier le commentaire.');
    }
  }

  async function handleLikeComment(commentId: string) {
    if (!isSignedIn) {
      toast.message('Connectez-vous pour réagir.');
      return;
    }

    try {
      await likeCommentAction(commentId);
      startTransition(() => router.refresh());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Impossible de liker ce commentaire.');
    }
  }

  async function handleDislikeComment(commentId: string) {
    if (!isSignedIn) {
      toast.message('Connectez-vous pour réagir.');
      return;
    }

    try {
      await dislikeCommentAction(commentId);
      startTransition(() => router.refresh());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Impossible de disliker ce commentaire.');
    }
  }

  async function handleDeleteComment(commentId: string) {
    if (!isAdmin) {
      return;
    }

    try {
      await deleteCommentAction(commentId);
      toast.success('Commentaire supprime.');
      startTransition(() => router.refresh());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Impossible de supprimer ce commentaire.');
    }
  }

  return (
    <section className="mt-10 space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <ActionStat
          icon={<Heart className="h-4 w-4" />}
          label={optimisticLikeState.liked ? 'Liked' : 'Like'}
          value={optimisticLikeState.count}
          onClick={handleLike}
          disabled={isPending}
          highlight={optimisticLikeState.liked}
          popKey={likeBurstId}
          floatingDelta={showLikeBurst ? '+1' : null}
        />
        <ActionStat
          icon={<Share2 className="h-4 w-4" />}
          label="Share"
          value={optimisticShareCount}
          onClick={handleShareToggle}
          disabled={isPending || isSharing}
        />
        <ActionStat
          icon={<MessageSquare className="h-4 w-4" />}
          label="Comments"
          value={commentTree.length}
          onClick={() => document.getElementById('comments')?.scrollIntoView({ behavior: 'smooth' })}
          disabled={isPending}
        />
      </div>

      {showShareTargets ? (
        <div className="-mt-2 rounded-2xl border border-slate-800/70 bg-slate-950/40 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Partager via</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button type="button" size="sm" onClick={() => handleShareTargetClick('whatsapp')} disabled={isPending || isSharing}>
              WhatsApp
            </Button>
            <Button type="button" size="sm" onClick={() => handleShareTargetClick('x')} disabled={isPending || isSharing}>
              X
            </Button>
            <Button type="button" size="sm" onClick={() => handleShareTargetClick('linkedin')} disabled={isPending || isSharing}>
              LinkedIn
            </Button>
          </div>
        </div>
      ) : null}

      <div id="comments" className="glass-shell p-6 md:p-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-sky-300">Conversation</p>
            <h2 className="text-2xl font-semibold text-slate-100 mt-1">Discussions</h2>
          </div>
          <Sparkles className="h-5 w-5 text-slate-400" />
        </div>

        {isSignedIn && currentUser ? (
          <CommentComposer
            currentUser={currentUser}
            value={composerValue}
            onValueChange={setComposerValue}
            onSubmit={(body) => handleCreateComment({ body })}
            submitLabel="Publier"
          />
        ) : (
          <div className="rounded-2xl border border-slate-800/70 bg-slate-950/50 p-5 text-slate-300">
            <p className="mb-3">Connectez-vous pour participer à la discussion.</p>
            <SignInButton mode="modal">
              <Button type="button">Se connecter</Button>
            </SignInButton>
          </div>
        )}

        <Separator className="my-6 h-px bg-slate-800/80" />

        <div className="space-y-5">
          {commentTree.length > 0 ? (
            commentTree.map((comment) => (
              <CommentNodeView
                key={comment.id}
                comment={comment}
                onSubmitReply={handleCreateComment}
                currentUser={currentUser}
                isAdmin={isAdmin}
                onLikeComment={handleLikeComment}
                onDislikeComment={handleDislikeComment}
                onDeleteComment={handleDeleteComment}
              />
            ))
          ) : (
            <p className="text-sm text-slate-400">Aucun commentaire pour le moment. Soyez le premier à réagir.</p>
          )}
        </div>
      </div>
    </section>
  );
}

function ActionStat({
  icon,
  label,
  value,
  onClick,
  disabled,
  highlight = false,
  popKey,
  floatingDelta,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  onClick: () => void;
  disabled?: boolean;
  highlight?: boolean;
  popKey?: number;
  floatingDelta?: string | null;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`interactive-card relative flex items-center justify-between gap-4 p-4 text-left ${highlight ? 'border-sky-400/40 bg-sky-500/10' : ''}`}
        whileTap={{ scale: 0.93 }}
      animate={popKey ? { scale: [1, 1.16, 0.97, 1] } : undefined}
      transition={
        popKey
          ? {
              type: 'spring',
              stiffness: 500,
              damping: 15,
              mass: 0.24,
            }
          : undefined
      }
    >
      <AnimatePresence>
        {floatingDelta && popKey ? (
          <motion.span
            key={popKey}
            className="pointer-events-none absolute right-4 top-2 text-sm font-semibold text-emerald-300"
            initial={{ opacity: 0, y: 0, scale: 0.7 }}
            animate={{ opacity: 1, y: -22, scale: 1.05 }}
            exit={{ opacity: 0, y: -34, scale: 0.9 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
          >
            {floatingDelta}
          </motion.span>
        ) : null}
      </AnimatePresence>
      <div>
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-slate-100">{icon}</span>
          {label}
        </div>
        <div className="mt-2 text-2xl font-semibold text-slate-100">{value}</div>
      </div>
      <Reply className="h-4 w-4 text-slate-500" />
    </motion.button>
  );
}

function CommentComposer({
  currentUser,
  value,
  onValueChange,
  onSubmit,
  submitLabel,
}: {
  currentUser: SocialUserSummary;
  value: string;
  onValueChange: (value: string) => void;
  onSubmit: (body: string) => Promise<void>;
  submitLabel: string;
}) {
  return (
    <form
      className="rounded-2xl border border-slate-800/70 bg-slate-950/40 p-4"
      action={async (formData) => {
        await onSubmit(String(formData.get('comment') ?? ''));
      }}
    >
      <div className="flex items-start gap-3">
        <AvatarWrapper className="h-10 w-10">
          <AvatarImage src={currentUser.imageUrl ?? undefined} alt={currentUser.name ?? currentUser.email} />
          <AvatarFallback>{(currentUser.name ?? currentUser.email).slice(0, 2).toUpperCase()}</AvatarFallback>
        </AvatarWrapper>
        <div className="flex-1 space-y-3">
          <Textarea
            name="comment"
            value={value}
            onChange={(event) => onValueChange(event.target.value)}
            placeholder="Partagez votre point de vue..."
            className="min-h-28 resize-none"
          />
          <div className="flex justify-end">
            <Button type="submit" size="sm">
              <Send className="h-4 w-4" />
              {submitLabel}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}

function CommentNodeView({
  comment,
  onSubmitReply,
  currentUser,
  isAdmin,
  onLikeComment,
  onDislikeComment,
  onDeleteComment,
}: {
  comment: SocialCommentNode;
  onSubmitReply: (payload: { body: string; parentId?: string | null }) => Promise<void>;
  currentUser: SocialUserSummary | null;
  isAdmin: boolean;
  onLikeComment: (commentId: string) => Promise<void>;
  onDislikeComment: (commentId: string) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
}) {
  const [showReply, setShowReply] = useState(false);
  const [replyValue, setReplyValue] = useState('');

  return (
    <div className="space-y-4 rounded-2xl border border-slate-800/70 bg-slate-950/30 p-4">
      <div className="flex items-start gap-3">
        <AvatarWrapper className="h-10 w-10">
          <AvatarImage src={comment.author.imageUrl ?? undefined} alt={comment.author.name ?? comment.author.email} />
          <AvatarFallback>{(comment.author.name ?? comment.author.email).slice(0, 2).toUpperCase()}</AvatarFallback>
        </AvatarWrapper>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-medium text-slate-100">{comment.author.name ?? comment.author.email}</span>
            <span className="text-xs text-slate-500">{formatRelativeTime(comment.createdAt)}</span>
          </div>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-slate-300">{comment.body}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="inline-flex items-center gap-1 text-xs text-sky-300 hover:text-sky-200"
              onClick={() => setShowReply((value) => !value)}
            >
              <Reply className="h-3.5 w-3.5" />
              Repondre
            </button>

            <button
              type="button"
              className="inline-flex items-center gap-1 text-xs text-slate-300 hover:text-slate-100"
              onClick={() => onLikeComment(comment.id)}
            >
              <ThumbsUp className="h-3.5 w-3.5" />
              <span>{comment.likes}</span>
            </button>

            <button
              type="button"
              className="inline-flex items-center gap-1 text-xs text-slate-300 hover:text-slate-100"
              onClick={() => onDislikeComment(comment.id)}
            >
              <ThumbsDown className="h-3.5 w-3.5" />
              <span>{comment.dislikes}</span>
            </button>

            {isAdmin ? (
              <button
                type="button"
                className="inline-flex items-center gap-1 text-xs text-rose-300 hover:text-rose-200"
                onClick={() => onDeleteComment(comment.id)}
                aria-label="Supprimer le commentaire"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {showReply && currentUser ? (
        <div className="pl-12">
          <CommentComposer
            currentUser={currentUser}
            value={replyValue}
            onValueChange={setReplyValue}
            submitLabel="Répondre"
            onSubmit={async (body) => {
              await onSubmitReply({ body, parentId: comment.id });
              setReplyValue('');
              setShowReply(false);
            }}
          />
        </div>
      ) : null}

      {comment.children.length > 0 ? (
        <div className="space-y-4 pl-4 md:pl-12">
          {comment.children.map((child) => (
            <CommentNodeView
              key={child.id}
              comment={child}
              onSubmitReply={onSubmitReply}
              currentUser={currentUser}
              isAdmin={isAdmin}
              onLikeComment={onLikeComment}
              onDislikeComment={onDislikeComment}
              onDeleteComment={onDeleteComment}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}