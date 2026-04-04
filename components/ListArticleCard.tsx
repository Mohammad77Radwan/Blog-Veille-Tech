'use client';

import { useEffect, useState } from 'react';
import { Calendar, ArrowRight } from 'lucide-react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import { TagBadge } from './TagBadge';
import type { Article } from '@/types/blog';
import { useReducedMotionPreference } from '@/components/animations/useReducedMotion';

function formatExactDateTime(dateValue: string): string {
  const dateMs = new Date(dateValue).getTime();
  if (Number.isNaN(dateMs)) {
    return dateValue;
  }

  return new Date(dateMs).toLocaleString('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function ListArticleCard({ article }: { article: Article }) {
  const prefersReducedMotion = useReducedMotionPreference();
  const [exactDateTime, setExactDateTime] = useState(article.date);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const springX = useSpring(rotateX, { stiffness: 165, damping: 18, mass: 0.2 });
  const springY = useSpring(rotateY, { stiffness: 165, damping: 18, mass: 0.2 });

  useEffect(() => {
    setExactDateTime(formatExactDateTime(article.date));
  }, [article.date]);

  const handleMove = (event: React.MouseEvent<HTMLElement>) => {
    if (prefersReducedMotion) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    rotateY.set((px - 0.5) * 8);
    rotateX.set((0.5 - py) * 7);
  };

  const resetTilt = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.article
      className="interactive-card p-5 md:p-6 cursor-pointer group-hover:shadow-[0_14px_40px_rgba(16,185,129,0.14)]"
      style={{
        perspective: '800px',
        rotateX: prefersReducedMotion ? 0 : springX,
        rotateY: prefersReducedMotion ? 0 : springY,
        transformStyle: 'preserve-3d',
      }}
      whileHover={prefersReducedMotion ? undefined : { scale: 1.01, y: -3 }}
      transition={{ type: 'spring', stiffness: 180, damping: 20 }}
      onMouseMove={handleMove}
      onMouseLeave={resetTilt}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left: Title */}
        <div className="flex-grow">
          <h3 className="text-lg md:text-xl font-semibold text-slate-50 mb-2 md:mb-0 leading-snug">
            {article.title}
          </h3>
          <p className="mt-1 text-xs uppercase tracking-wide text-emerald-200/90">
            Written by {article.author}
          </p>
        </div>

        {/* Middle: Meta information row */}
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span suppressHydrationWarning>{exactDateTime}</span>
          </div>
          <TagBadge category={article.category} />
        </div>

        {/* Right: Arrow */}
        <ArrowRight className="w-4 h-4 text-slate-300 flex-shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
      </div>
    </motion.article>
  );
}
