'use client';

import { motion } from 'framer-motion';

export function SkeletonScreen({ className = '' }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded-md bg-slate-800/70 ${className}`} aria-hidden="true">
      <motion.span
        className="absolute inset-y-0 -left-1/3 w-1/3 bg-gradient-to-r from-transparent via-white/35 to-transparent"
        animate={{ x: ['-120%', '260%'] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
      />
    </div>
  );
}
