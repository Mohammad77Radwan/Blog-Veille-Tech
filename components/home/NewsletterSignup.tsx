'use client';

import { useState, useTransition } from 'react';
import { Mail, Send } from 'lucide-react';
import { subscribeToNewsletterAction } from '@/actions/subscriptionActions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [isPending, startTransition] = useTransition();

  return (
    <div className="interactive-card p-6 md:p-8">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/15 text-sky-200 ring-1 ring-sky-400/30">
          <Mail className="h-5 w-5" />
        </span>
        <div>
          <h3 className="text-xl font-semibold text-slate-100">Recevoir les derniers articles</h3>
          <p className="mt-1 text-sm text-slate-300">
            Inscrivez-vous a la newsletter pour recevoir chaque nouvel article directement par email.
          </p>
        </div>
      </div>

      <form
        className="mt-5 flex flex-col gap-3 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();

          startTransition(async () => {
            const result = await subscribeToNewsletterAction(email);

            if (!result.ok) {
              toast.error(result.message);
              return;
            }

            toast.success(result.message);
            setEmail('');
          });
        }}
      >
        <Input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="votre@email.com"
          className="h-11"
          required
          disabled={isPending}
        />
        <Button type="submit" className="h-11 min-w-[170px]" disabled={isPending}>
          <Send className="h-4 w-4" />
          {isPending ? 'Inscription...' : 'S\'abonner'}
        </Button>
      </form>
    </div>
  );
}
