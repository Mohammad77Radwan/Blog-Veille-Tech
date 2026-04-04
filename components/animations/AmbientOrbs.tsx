'use client';

import { useReducedMotionPreference } from './useReducedMotion';

export function AmbientOrbs() {
  const prefersReducedMotion = useReducedMotionPreference();

  if (prefersReducedMotion) {
    return null;
  }

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="orb-float orb-float-a absolute -left-24 top-16 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
      <div className="orb-float orb-float-b absolute right-[-5rem] top-24 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />
      <div className="orb-float orb-float-c absolute bottom-[-7rem] left-[35%] h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl" />
    </div>
  );
}
