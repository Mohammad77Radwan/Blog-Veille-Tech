'use client';

import { motion, useScroll, useSpring, useTransform } from 'framer-motion';

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.2 });
  const opacity = useTransform(scrollYProgress, [0, 0.02], [0, 1]);

  return (
    <motion.div
      aria-hidden="true"
      className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-sky-300"
      style={{ scaleX, opacity }}
    />
  );
}
