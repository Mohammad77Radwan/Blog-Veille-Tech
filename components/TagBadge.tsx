'use client';

import { motion } from 'framer-motion';

interface TagBadgeProps {
  category: string;
}

export function TagBadge({ category }: TagBadgeProps) {
  return (
    <motion.span
      className="inline-flex items-center rounded-full border border-indigo-300/30 bg-gradient-to-r from-indigo-500/25 to-blue-500/20 px-2.5 py-1 text-xs font-medium text-indigo-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.18)]"
      whileHover={{ scale: 1.05, y: -2, rotateX: 4, rotateY: -4 }}
      transition={{ type: 'spring', stiffness: 220, damping: 16 }}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {category}
    </motion.span>
  );
}
