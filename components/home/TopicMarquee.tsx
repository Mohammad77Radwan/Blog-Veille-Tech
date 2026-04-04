'use client';

const topics = [
  'LLM Engineering',
  'Architecture moderne',
  'Prisma + SQLite',
  'Observability',
  'Performance Web',
  'Next.js App Router',
  'DX & Tooling',
  'Cybersecurity',
];

export function TopicMarquee() {
  const repeated = [...topics, ...topics];

  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-800/70 bg-[#0f1728]/85 py-3">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-[#0A0F1C] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-[#0A0F1C] to-transparent" />
      <div className="marquee-track flex min-w-max gap-3 px-4">
        {repeated.map((topic, index) => (
          <span
            key={`${topic}-${index}`}
            className="rounded-full border border-slate-700/70 bg-slate-900/90 px-3 py-1 text-xs text-slate-200"
          >
            {topic}
          </span>
        ))}
      </div>
    </div>
  );
}
