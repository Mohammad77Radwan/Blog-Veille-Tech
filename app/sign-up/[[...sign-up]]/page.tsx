import { SignUp } from '@clerk/nextjs';
import { isClerkConfigured } from '@/lib/clerk';

export default function SignUpPage() {
  if (!isClerkConfigured()) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 py-12">
        <div className="glass-shell p-6 text-center max-w-lg">
          <h1 className="text-2xl font-semibold text-slate-100">Clerk not configured</h1>
          <p className="mt-3 text-slate-400">
            Set valid Clerk keys in the environment to enable sign-up.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        appearance={{
          variables: {
            colorBackground: '#0A0F1C',
            colorText: '#f8fafc',
            colorPrimary: '#38bdf8',
          },
        }}
      />
    </main>
  );
}