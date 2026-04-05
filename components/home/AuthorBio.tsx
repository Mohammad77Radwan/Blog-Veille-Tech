'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Github } from 'lucide-react';

export function AuthorBio() {
  return (
    <motion.section
      className="glass-shell relative overflow-hidden p-6 md:p-8"
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    >
      <span
        aria-hidden="true"
        className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-sky-400/15 blur-3xl"
      />

      <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <div className="inline-flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-sky-300/30 bg-slate-900/70 text-lg font-bold text-sky-200">
            MR
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-sky-300">About the Author</p>
            <h3 className="mt-1 text-2xl font-semibold text-slate-100">Mohammad Radwan</h3>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-300">
              Etudiant en BTS SIO specialise en SLAM (Developpement Applicatif). Je construis des applications web
              modernes, performantes et accessibles. Passionne par Next.js, React et les pratiques de conception
              user-centric.
            </p>
          </div>
        </div>

        <Link
          href="https://github.com/Mohammad77Radwan"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-700/80 bg-slate-900/60 px-3 py-2 text-xs font-medium tracking-wide text-slate-200 transition-colors hover:border-sky-400/45 hover:text-sky-200"
        >
          <Github className="h-4 w-4" aria-hidden="true" />
          GitHub
        </Link>
      </div>
    </motion.section>
  );
}