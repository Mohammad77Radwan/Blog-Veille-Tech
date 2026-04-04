import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AmbientOrbs } from '@/components/animations/AmbientOrbs';
import { ScrollProgress } from '@/components/animations/ScrollProgress';
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
  return (
    <html lang="fr">
      <body className={`${inter.className} bg-[#0A0F1C] text-slate-100`}>
        <ScrollProgress />
        <AmbientOrbs />
        {children}
      </body>
    </html>
  );
}
