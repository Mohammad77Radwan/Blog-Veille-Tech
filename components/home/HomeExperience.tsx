'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Newspaper, Sparkles } from 'lucide-react';
import { CountUp } from '@/components/animations/CountUp';
import { OrbitShowcase } from '@/components/home/OrbitShowcase';
import { TopicMarquee } from '@/components/home/TopicMarquee';
import { FeaturedArticleCard } from '@/components/FeaturedArticleCard';
import { ListArticleCard } from '@/components/ListArticleCard';
import { SkeletonScreen } from '@/components/home/SkeletonScreen';
import type { Article } from '@/types/blog';

interface HomeMappedPost {
  slug: string;
  article: Article;
}

interface HomeExperienceProps {
  posts: HomeMappedPost[];
  featuredPosts: HomeMappedPost[];
  latestPosts: HomeMappedPost[];
  categoryCount: number;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const rise = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function HomeExperience({ posts, featuredPosts, latestPosts, categoryCount }: HomeExperienceProps) {
  const [statsReady, setStatsReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setStatsReady(true), 780);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden">
      <span className="mesh-accent" aria-hidden="true" />

      <motion.div
        className="relative mx-auto max-w-6xl px-4 pb-16 pt-3 md:px-8 md:pb-20"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.section variants={rise} className="glass-shell lift-hover mb-10 overflow-hidden p-6 md:p-10">
          <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-[1.35fr_0.9fr]">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-300/20 bg-indigo-500/10 px-3 py-1 text-xs text-indigo-100">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                Veille creative, utile et actionnable
              </div>

              <h1 className="mb-4 text-5xl font-black leading-[0.95] tracking-tight text-slate-100 md:text-7xl">
                <span className="aurora-title">Articles & Veille Tech</span>
              </h1>

              <p className="max-w-2xl text-base leading-relaxed text-slate-300 md:text-lg">
                Decouvrez mes analyses sur les tendances technologiques, l&apos;IA et les meilleures pratiques en
                developpement web.
              </p>

              <motion.div
                variants={container}
                className="mt-8 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-3 md:overflow-visible md:pb-0"
              >
                <motion.div variants={rise} className="neuro-stat-card min-w-[13.5rem] snap-start md:min-w-0">
                  <p className="text-xs uppercase tracking-wide text-slate-300/75">Total articles</p>
                  <div className="mt-2 text-3xl font-bold text-slate-100">
                    {statsReady ? <CountUp value={posts.length} /> : <SkeletonScreen className="h-8 w-14" />}
                  </div>
                </motion.div>

                <motion.div variants={rise} className="neuro-stat-card min-w-[13.5rem] snap-start md:min-w-0">
                  <p className="text-xs uppercase tracking-wide text-slate-300/75">A la une</p>
                  <div className="mt-2 text-3xl font-bold text-slate-100">
                    {statsReady ? <CountUp value={featuredPosts.length} /> : <SkeletonScreen className="h-8 w-14" />}
                  </div>
                </motion.div>

                <motion.div variants={rise} className="neuro-stat-card min-w-[13.5rem] snap-start md:min-w-0">
                  <p className="text-xs uppercase tracking-wide text-slate-300/75">Categories</p>
                  <div className="mt-2 text-3xl font-bold text-slate-100">
                    {statsReady ? <CountUp value={categoryCount} /> : <SkeletonScreen className="h-8 w-14" />}
                  </div>
                </motion.div>
              </motion.div>
            </div>

            <div className="hidden justify-end lg:flex">
              <OrbitShowcase />
            </div>
          </div>
        </motion.section>

        <motion.section variants={rise} className="mb-14">
          <TopicMarquee />
        </motion.section>

        <motion.section variants={rise} className="mb-14">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-2xl font-semibold text-slate-100 md:text-3xl">
              <Flame className="h-6 w-6 text-fuchsia-300" aria-hidden="true" />
              A la une
            </h2>
          </div>

          <motion.div variants={container} className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {featuredPosts.length > 0 ? (
              featuredPosts.map((post) => (
                <motion.div key={post.slug} variants={rise}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group block focus-visible:outline-none"
                    aria-label={`Lire l'article ${post.article.title}`}
                  >
                    <FeaturedArticleCard article={post.article} />
                  </Link>
                </motion.div>
              ))
            ) : (
              <p className="text-slate-400">Aucun article publie pour le moment.</p>
            )}
          </motion.div>
        </motion.section>

        <motion.section variants={rise}>
          <h2 className="mb-5 flex items-center gap-2 text-2xl font-semibold text-slate-100 md:text-3xl">
            <Newspaper className="h-6 w-6 text-indigo-300" aria-hidden="true" />
            Derniers articles
          </h2>

          <motion.div variants={container} className="flex flex-col gap-4">
            {latestPosts.length > 0 ? (
              latestPosts.map((post) => (
                <motion.div key={post.slug} variants={rise}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group block focus-visible:outline-none"
                    aria-label={`Lire l'article ${post.article.title}`}
                  >
                    <ListArticleCard article={post.article} />
                  </Link>
                </motion.div>
              ))
            ) : (
              <div className="interactive-card p-6">
                <p className="mb-2 text-slate-300">Les nouveaux articles apparaitront ici apres publication.</p>
                <p className="text-sm text-slate-500">Ajoutez votre premier article pour lancer la dynamique.</p>
              </div>
            )}
          </motion.div>
        </motion.section>
      </motion.div>
    </main>
  );
}
