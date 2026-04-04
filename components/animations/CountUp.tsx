'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotionPreference } from './useReducedMotion';

interface CountUpProps {
  value: number;
  durationMs?: number;
}

export function CountUp({ value, durationMs = 900 }: CountUpProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const [isInView, setIsInView] = useState(false);
  const prefersReducedMotion = useReducedMotionPreference();

  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '-40px 0px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isInView) {
      return;
    }

    if (prefersReducedMotion) {
      setDisplayValue(value);
      return;
    }

    const start = performance.now();
    const timer = window.requestAnimationFrame(function step(now) {
      const progress = Math.min((now - start) / durationMs, 1);
      setDisplayValue(Math.round(progress * value));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    });

    return () => window.cancelAnimationFrame(timer);
  }, [durationMs, isInView, prefersReducedMotion, value]);

  return <span ref={ref}>{displayValue}</span>;
}
