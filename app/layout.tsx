import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import { AmbientOrbs } from '@/components/animations/AmbientOrbs';
import { ScrollProgress } from '@/components/animations/ScrollProgress';
import { isClerkConfigured } from '@/lib/clerk';
import { Toaster } from 'sonner';
import { Header } from '@/components/Header';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Articles & Veille Tech',
  description:
    'Découvrez mes articles et analyses sur les tendances technologiques, l\'IA, et les meilleures pratiques en développement web.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const clerkEnabled = isClerkConfigured();

  return (
    <html lang="fr">
      <body className={`${inter.className} bg-[#0A0F1C] text-slate-100`}>
        {clerkEnabled ? (
          <ClerkProvider appearance={{ baseTheme: dark }}>
            <ScrollProgress />
            <AmbientOrbs />
            <Header clerkEnabled={clerkEnabled} />
            <div className="pt-20 md:pt-24">{children}</div>
            <Toaster richColors position="top-right" theme="dark" />
          </ClerkProvider>
        ) : (
          <>
            <ScrollProgress />
            <AmbientOrbs />
            <Header clerkEnabled={clerkEnabled} />
            <div className="pt-20 md:pt-24">{children}</div>
            <Toaster richColors position="top-right" theme="dark" />
          </>
        )}
      </body>
    </html>
  );
}
