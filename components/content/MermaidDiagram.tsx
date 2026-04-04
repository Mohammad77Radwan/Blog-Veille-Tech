'use client';

import { useEffect, useRef, useState } from 'react';

interface MermaidDiagramProps {
  chart: string;
}

export function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function renderChart() {
      try {
        const mermaid = (await import('mermaid')).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: 'dark',
          securityLevel: 'loose',
        });

        const id = `mermaid-${Math.random().toString(36).slice(2, 11)}`;
        const { svg } = await mermaid.render(id, chart);

        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
          setHasError(false);
        }
      } catch {
        if (!cancelled) {
          setHasError(true);
        }
      }
    }

    void renderChart();

    return () => {
      cancelled = true;
    };
  }, [chart]);

  if (hasError) {
    return (
      <pre className="rounded-lg border border-red-900/40 bg-red-950/20 p-4 text-xs text-red-200 overflow-x-auto">
        {chart}
      </pre>
    );
  }

  return (
    <div className="not-prose my-6 overflow-x-auto rounded-xl border border-slate-800/70 bg-[#0d1322] p-4">
      <div ref={containerRef} className="mermaid-diagram min-w-[520px] text-slate-100" />
    </div>
  );
}
