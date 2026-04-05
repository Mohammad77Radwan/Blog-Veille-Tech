'use client';

import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  radius?: number;
  strength?: number;
}

export function MagneticButton({
  children,
  className,
  radius = 150,
  strength = 0.35,
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 320, damping: 20, mass: 0.25 });
  const springY = useSpring(y, { stiffness: 320, damping: 20, mass: 0.25 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const node = ref.current;
      if (!node) {
        return;
      }

      const rect = node.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = event.clientX - centerX;
      const dy = event.clientY - centerY;
      const distance = Math.hypot(dx, dy);

      if (distance < radius) {
        const force = (1 - distance / radius) * strength;
        x.set(dx * force);
        y.set(dy * force);
      } else {
        x.set(0);
        y.set(0);
      }
    };

    const handleLeave = () => {
      x.set(0);
      y.set(0);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleLeave);
    };
  }, [radius, strength, x, y]);

  return (
    <motion.div ref={ref} className={className} style={{ x: springX, y: springY, display: 'inline-flex' }}>
      {children}
    </motion.div>
  );
}
