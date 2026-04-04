'use client';

import { useEffect, useState } from 'react';
import { Calendar, ArrowRight } from 'lucide-react';
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

export function FeaturedArticleCard({ article }: { article: Article }) {
  const prefersReducedMotion = useReducedMotionPreference();
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const [exactDateTime, setExactDateTime] = useState(article.date);

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
    const rotateY = (px - 0.5) * 10;
    const rotateX = (0.5 - py) * 8;

    setTilt({ rotateX, rotateY });
  };

  const resetTilt = () => setTilt({ rotateX: 0, rotateY: 0 });

  return (
    <article
      className="interactive-card p-6 md:p-7 cursor-pointer flex flex-col h-full relative overflow-hidden group-hover:shadow-[0_20px_65px_rgba(56,189,248,0.16)]"
      style={{
        perspective: '800px',
        transform: prefersReducedMotion
          ? undefined
          : `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) translateY(-2px)`,
        transition: 'transform 220ms ease, box-shadow 280ms ease',
      }}
      onMouseMove={handleMove}
      onMouseLeave={resetTilt}
    >
      <span
        className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-sky-400/10 blur-2xl"
        aria-hidden="true"
      />

      {/* Top: TagBadge */}
      <div className="mb-4">
        <TagBadge category={article.category} />
      </div>

      {/* Middle: Title and Description */}
      <div className="flex-grow mb-4">
        <h3 className="text-lg md:text-xl font-semibold text-slate-100 mb-2 line-clamp-2 leading-snug">
          {article.title}
        </h3>
        <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
          {article.description}
        </p>
      </div>

      {/* Footer: Meta information and arrow */}
      <div className="flex items-center justify-between gap-4 border-t border-slate-800/60 pt-4">
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span suppressHydrationWarning>{exactDateTime}</span>
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-slate-300 flex-shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
      </div>
    </article>
  );
}
