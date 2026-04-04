'use client';

import { useOptimistic, useState, useTransition, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { SignInButton, useUser } from '@clerk/nextjs';
import { Heart, MessageSquare, Send, Share2, Reply, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AvatarFallback, AvatarImage, AvatarWrapper } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  createCommentAction,
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
  comments: SocialCommentRecord[];
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
  comments,
}: PostSocialPanelProps) {
  const router = useRouter();
  const { isSignedIn, user } = useUser();
  const [isPending, startTransition] = useTransition();
  const [composerValue, setComposerValue] = useState('');

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

    addOptimisticLike({
      delta: optimisticLikeState.liked ? -1 : 1,
      liked: !optimisticLikeState.liked,
    });

    try {
      await toggleLikeAction(postId);
      startTransition(() => router.refresh());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Impossible de mettre à jour le like.');
    }
  }

  async function handleShare() {
    addOptimisticShare(1);

    const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}/blog/${postSlug}` : '';

    try {
      if (navigator.share) {
        await navigator.share({
          title: postTitle,
          url: shareUrl,
        });
      } else if (navigator.clipboard && shareUrl) {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Lien copié dans le presse-papiers.');
      }

      await sharePostAction(postId);
      startTransition(() => router.refresh());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Impossible de partager cet article.');
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
        />
        <ActionStat
          icon={<Share2 className="h-4 w-4" />}
          label="Share"
          value={optimisticShareCount}
          onClick={handleShare}
          disabled={isPending}
        />
        <ActionStat
          icon={<MessageSquare className="h-4 w-4" />}
          label="Comments"
          value={commentTree.length}
          onClick={() => document.getElementById('comments')?.scrollIntoView({ behavior: 'smooth' })}
          disabled={isPending}
        />
      </div>

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
}: {
  icon: ReactNode;
  label: string;
  value: number;
  onClick: () => void;
  disabled?: boolean;
  highlight?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`interactive-card flex items-center justify-between gap-4 p-4 text-left ${highlight ? 'border-sky-400/40 bg-sky-500/10' : ''}`}
    >
      <div>
        <div className="flex items-center gap-2 text-sm text-slate-300">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-slate-100">{icon}</span>
          {label}
        </div>
        <div className="mt-2 text-2xl font-semibold text-slate-100">{value}</div>
      </div>
      <Reply className="h-4 w-4 text-slate-500" />
    </button>
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
}: {
  comment: SocialCommentNode;
  onSubmitReply: (payload: { body: string; parentId?: string | null }) => Promise<void>;
  currentUser: SocialUserSummary | null;
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
          <button
            type="button"
            className="mt-3 inline-flex items-center gap-1 text-xs text-sky-300 hover:text-sky-200"
            onClick={() => setShowReply((value) => !value)}
          >
            <Reply className="h-3.5 w-3.5" />
            Répondre
          </button>
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
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}