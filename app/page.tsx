import Link from 'next/link';
import { Flame, Sparkles, Newspaper } from 'lucide-react';
import { getPosts } from '@/actions/postActions';
import { CountUp } from '@/components/animations/CountUp';
import { Reveal } from '@/components/animations/Reveal';
import { OrbitShowcase } from '@/components/home/OrbitShowcase';
import { TopicMarquee } from '@/components/home/TopicMarquee';
import { FeaturedArticleCard } from '@/components/FeaturedArticleCard';
import { ListArticleCard } from '@/components/ListArticleCard';
import type { Article } from '@/types/blog';

function estimateReadTimeFromContent(content: string): string {
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.ceil(wordCount / 220));
  return `${minutes} min`;
}

export default async function Home() {
  const posts = await getPosts();
  const mappedPosts = posts.map((post) => ({
    slug: post.slug,
    article: {
      title: post.title,
      description: post.description,
      date: new Date(post.createdAt).toISOString(),
      readTime: estimateReadTimeFromContent(post.content),
      category: post.category,
    } satisfies Article,
  }));

  const featuredPosts = mappedPosts.slice(0, 2);
  const latestPosts = mappedPosts.slice(2);

  return (
    <main className="min-h-screen relative overflow-hidden">
      <span className="mesh-accent" aria-hidden="true" />

      <div className="max-w-5xl mx-auto px-6 py-12 md:py-14 relative">
        <Reveal>
          <section className="glass-shell glow-ring p-7 md:p-10 mb-10 lift-hover">
          <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.9fr] gap-8 items-center">
            <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-800/60 bg-sky-900/30 px-3 py-1 text-xs text-sky-200 mb-5">
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            Veille créative, utile et actionnable
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 leading-tight">
            <span className="aurora-title">Articles & Veille Tech</span>
          </h1>

          <p className="text-base md:text-lg text-slate-300 max-w-2xl leading-relaxed">
            Articles & Veille Tech
          </p>
          <p className="text-base md:text-lg text-slate-400 max-w-3xl mt-3">
            Découvrez mes analyses sur les tendances technologiques,
            l&apos;IA, et les meilleures pratiques en développement web.
          </p>

          <div className="mt-7 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-xl border border-slate-800/70 bg-[#0E1628] p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">Total articles</p>
              <p className="text-2xl font-bold text-slate-100 mt-1"><CountUp value={posts.length} /></p>
            </div>
            <div className="rounded-xl border border-slate-800/70 bg-[#0E1628] p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">À la une</p>
              <p className="text-2xl font-bold text-slate-100 mt-1"><CountUp value={featuredPosts.length} /></p>
            </div>
            <div className="rounded-xl border border-slate-800/70 bg-[#0E1628] p-4">
              <p className="text-xs uppercase tracking-wide text-slate-400">Catégories</p>
              <p className="text-2xl font-bold text-slate-100 mt-1">
                <CountUp value={new Set(posts.map((post) => post.category)).size} />
              </p>
            </div>
          </div>
            </div>
            <div className="hidden lg:flex justify-end">
              <OrbitShowcase />
            </div>
          </div>
          </section>
        </Reveal>

        <Reveal delay={0.06}>
          <section className="mb-14">
            <TopicMarquee />
          </section>
        </Reveal>

        <Reveal delay={0.08}>
          <section className="mb-14">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-2xl md:text-3xl font-semibold text-slate-100 flex items-center gap-2">
              <Flame className="w-6 h-6 text-orange-300" aria-hidden="true" />
              À la une
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredPosts.length > 0 ? (
              featuredPosts.map((post, index) => (
                <Reveal key={post.slug} delay={0.1 + index * 0.08}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group block focus-visible:outline-none"
                    aria-label={`Lire l'article ${post.article.title}`}
                  >
                    <FeaturedArticleCard article={post.article} />
                  </Link>
                </Reveal>
              ))
            ) : (
              <p className="text-slate-400">Aucun article publié pour le moment.</p>
            )}
          </div>
          </section>
        </Reveal>

        <Reveal delay={0.14}>
          <section>
          <h2 className="text-2xl md:text-3xl font-semibold text-slate-100 mb-5 flex items-center gap-2">
            <Newspaper className="w-6 h-6 text-sky-300" aria-hidden="true" />
            Derniers articles
          </h2>

          <div className="flex flex-col gap-4">
            {latestPosts.length > 0 ? (
              latestPosts.map((post, index) => (
                <Reveal key={post.slug} delay={0.12 + index * 0.06}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group block focus-visible:outline-none"
                    aria-label={`Lire l'article ${post.article.title}`}
                  >
                    <ListArticleCard article={post.article} />
                  </Link>
                </Reveal>
              ))
            ) : (
              <div className="interactive-card p-6">
                <p className="text-slate-300 mb-2">
                  Les nouveaux articles apparaîtront ici après publication.
                </p>
                <p className="text-sm text-slate-500">
                  Ajoutez votre premier article pour lancer la dynamique.
                </p>
              </div>
            )}
          </div>
          </section>
        </Reveal>
      </div>
    </main>
  );
}
