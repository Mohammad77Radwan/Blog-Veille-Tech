'use client';

import { useReducedMotionPreference } from '@/components/animations/useReducedMotion';

const labels = ['IA', 'Cloud', 'Web Perf', 'Data', 'Security', 'DX'];

export function OrbitShowcase() {
  const prefersReducedMotion = useReducedMotionPreference();

  if (prefersReducedMotion) {
    return (
      <div className="relative h-72 w-72 rounded-full border border-slate-700/70 bg-slate-900/60 flex items-center justify-center">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Tech Pulse</p>
          <p className="text-lg font-semibold text-slate-100 mt-2">Toujours en mouvement</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-72 w-72">
      <div className="orbit-spin-slow absolute inset-0 rounded-full border border-sky-400/30" />
      <div className="orbit-spin-reverse absolute inset-8 rounded-full border border-indigo-400/35" />
      <div className="absolute inset-0 m-auto h-36 w-36 rounded-full bg-gradient-to-br from-sky-500/30 to-indigo-500/30 border border-slate-700/60 backdrop-blur-md flex items-center justify-center shadow-[0_0_50px_rgba(56,189,248,0.2)]">
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-[0.22em] text-slate-300">Tech Pulse</p>
          <p className="text-base font-semibold text-slate-100 mt-1">Live</p>
        </div>
      </div>

      {labels.map((label, index) => {
        const angle = (index / labels.length) * Math.PI * 2;
        const radius = 130;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        return (
          <span
            key={label}
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-slate-700/70 bg-[#11192a] px-3 py-1 text-xs text-sky-200"
            style={{
              transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
              opacity: 1,
              animation: 'fadeInScale 600ms ease-out',
              animationDelay: `${index * 0.05}s`,
              animationFillMode: 'both',
            }}
          >
            {label}
          </span>
        );
      })}
    </div>
  );
}
