'use client';

interface TagBadgeProps {
  category: string;
}

export function TagBadge({ category }: TagBadgeProps) {
  return (
    <span className="inline-flex items-center bg-indigo-950/50 text-indigo-300 text-xs px-2.5 py-1 rounded-full font-medium border border-indigo-500/20 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
      {category}
    </span>
  );
}
