import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CalendarDays } from 'lucide-react';
import { Reveal } from '@/components/animations/Reveal';
import { MarkdownArticle } from '@/components/content/MarkdownArticle';
import { getPostBySlug } from '@/actions/postActions';

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

  if (!post) {
    notFound();
  }

  const publishedAt = new Date(post.createdAt).toLocaleString('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

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
      </div>
    </main>
  );
}
