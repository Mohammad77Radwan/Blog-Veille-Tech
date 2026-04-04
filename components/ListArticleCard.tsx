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

export function ListArticleCard({ article }: { article: Article }) {
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
    const rotateY = (px - 0.5) * 8;
    const rotateX = (0.5 - py) * 6;
    setTilt({ rotateX, rotateY });
  };

  const resetTilt = () => setTilt({ rotateX: 0, rotateY: 0 });

  return (
    <article
      className="interactive-card p-5 md:p-6 cursor-pointer group-hover:shadow-[0_14px_40px_rgba(16,185,129,0.14)]"
      style={{
        perspective: '800px',
        transform: prefersReducedMotion
          ? undefined
          : `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg) translateY(-1px)`,
        transition: 'transform 220ms ease, box-shadow 280ms ease',
      }}
      onMouseMove={handleMove}
      onMouseLeave={resetTilt}
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left: Title */}
        <div className="flex-grow">
          <h3 className="text-base md:text-lg font-semibold text-slate-100 mb-2 md:mb-0 leading-snug">
            {article.title}
          </h3>
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
    </article>
  );
}
