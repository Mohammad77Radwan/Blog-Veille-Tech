'use client';

import { useCallback, useState, type PointerEvent } from 'react';

interface MousePositionState {
  x: number;
  y: number;
  hovering: boolean;
}

export function useMousePosition() {
  const [state, setState] = useState<MousePositionState>({ x: 0, y: 0, hovering: false });

  const onPointerMove = useCallback((event: PointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setState({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      hovering: true,
    });
  }, []);

  const onPointerLeave = useCallback(() => {
    setState((current) => ({ ...current, hovering: false }));
  }, []);

  return {
    ...state,
    onPointerMove,
    onPointerLeave,
  };
}
