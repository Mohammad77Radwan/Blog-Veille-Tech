'use client';

import { useEffect, useState } from 'react';
import { Calendar, ArrowRight, Clock3, Eye } from 'lucide-react';
import { motion, useMotionTemplate, useMotionValue, useSpring } from 'framer-motion';
import { TagBadge } from './TagBadge';
import type { Article } from '@/types/blog';
import { useReducedMotionPreference } from '@/components/animations/useReducedMotion';
import { useMousePosition } from '@/components/animations/useMousePosition';

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
  const [exactDateTime, setExactDateTime] = useState(article.date);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const { x: mouseX, y: mouseY, hovering: isHovering, onPointerMove, onPointerLeave } = useMousePosition();
  const springX = useSpring(rotateX, { stiffness: 170, damping: 18, mass: 0.2 });
  const springY = useSpring(rotateY, { stiffness: 170, damping: 18, mass: 0.2 });
  const spotlightX = useSpring(mouseX, { stiffness: 280, damping: 25, mass: 0.2 });
  const spotlightY = useSpring(mouseY, { stiffness: 280, damping: 25, mass: 0.2 });
  const spotlight = useMotionTemplate`radial-gradient(220px circle at ${spotlightX}px ${spotlightY}px, rgba(129, 140, 248, 0.32), rgba(96, 165, 250, 0.18) 35%, transparent 72%)`;

  useEffect(() => {
    setExactDateTime(formatExactDateTime(article.date));
  }, [article.date]);

  const handleMove = (event: React.PointerEvent<HTMLElement>) => {
    if (prefersReducedMotion || event.pointerType !== 'mouse') {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    onPointerMove(event);
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    rotateY.set((px - 0.5) * 12);
    rotateX.set((0.5 - py) * 10);
  };

  const resetTilt = () => {
    rotateX.set(0);
    rotateY.set(0);
    onPointerLeave();
  };

  return (
    <motion.article
      className="interactive-card p-5 md:p-6 cursor-pointer flex flex-col h-full relative overflow-hidden group-hover:shadow-[0_20px_65px_rgba(56,189,248,0.16)]"
      style={{
        perspective: '800px',
        rotateX: prefersReducedMotion ? 0 : springX,
        rotateY: prefersReducedMotion ? 0 : springY,
        transformStyle: 'preserve-3d',
      }}
      whileHover={prefersReducedMotion ? undefined : { scale: 1.02, y: -4 }}
      transition={{ type: 'spring', stiffness: 170, damping: 17 }}
      onPointerMove={handleMove}
      onPointerLeave={resetTilt}
    >
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-[1] rounded-xl"
        style={{ background: spotlight, opacity: isHovering ? 1 : 0 }}
      />
      <span
        className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-indigo-400/20 blur-2xl"
        aria-hidden="true"
      />

      {/* Top: TagBadge */}
      <div className="mb-3">
        <TagBadge category={article.category} />
      </div>

      {/* Middle: Title and Description */}
      <div className="flex-grow mb-3">
        <h3 className="text-xl md:text-2xl font-semibold text-slate-50 mb-2 line-clamp-2 leading-snug">
          {article.title}
        </h3>
        <p className="text-xs uppercase tracking-wide text-sky-200/90 mb-2">
          Written by {article.author}
        </p>
        <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
          {article.description}
        </p>
      </div>

      {/* Footer: Meta information and arrow */}
      <div className="flex items-center justify-between gap-4 border-t border-slate-800/60 pt-4">
        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span suppressHydrationWarning>{exactDateTime}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock3 className="w-4 h-4" />
            <span>{article.readTime} read</span>
          </div>
          <div className="flex items-center gap-1">
            <Eye className="w-4 h-4" />
            <span>{article.views} views</span>
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-slate-300 flex-shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
      </div>
    </motion.article>
  );
}
