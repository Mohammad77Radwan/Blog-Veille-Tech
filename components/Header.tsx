'use client';

import Link from 'next/link';
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from '@clerk/nextjs';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MagneticButton } from '@/components/MagneticButton';

interface HeaderProps {
  clerkEnabled: boolean;
  canSeeAdmin: boolean;
}

export function Header({ clerkEnabled, canSeeAdmin }: HeaderProps) {
  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 md:px-8">
      <div className="frost-header mx-auto flex h-14 max-w-6xl items-center justify-between rounded-2xl px-4 md:h-16 md:px-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-100 md:text-base">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-200 ring-1 ring-indigo-300/30">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="tracking-tight">Articles & Veille Tech</span>
        </Link>

        <nav className="flex items-center gap-2 md:gap-3">
          <Link
            href="/"
            className="rounded-md px-2 py-1 text-xs text-slate-300 transition-colors hover:text-slate-100 md:text-sm"
          >
            Home
          </Link>
          {canSeeAdmin ? (
            <Link
              href="/admin"
              className="rounded-md px-2 py-1 text-xs text-slate-300 transition-colors hover:text-slate-100 md:text-sm"
            >
              Admin
            </Link>
          ) : null}

          {clerkEnabled ? (
            <>
              <SignedOut>
                <MagneticButton className="hidden md:inline-flex" radius={140} strength={0.3}>
                  <SignInButton mode="modal">
                    <Button type="button" variant="ghost" size="sm" className="hidden md:inline-flex">
                      Sign In
                    </Button>
                  </SignInButton>
                </MagneticButton>
                <MagneticButton radius={160} strength={0.4}>
                  <SignUpButton mode="modal">
                    <Button type="button" size="sm" className="btn-accent">
                      Get Started
                    </Button>
                  </SignUpButton>
                </MagneticButton>
              </SignedOut>
              <SignedIn>
                <div className="rounded-full ring-1 ring-white/15">
                  <UserButton afterSignOutUrl="/" />
                </div>
              </SignedIn>
            </>
          ) : (
            <Button type="button" size="sm" variant="secondary" className="hidden md:inline-flex" disabled>
              Auth Disabled
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
