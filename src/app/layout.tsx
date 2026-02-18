import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';
import { LanguageProvider } from '@/context/LanguageProvider';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'Trivia Luz del Saber',
  description: 'Un juego de trivia islámico para iluminar la mente y el alma.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" dir="ltr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Alegreya:wght@400;700&family=Amiri:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <Suspense fallback={<div />}>
          <LanguageProvider>
            {children}
            <Toaster />
          </LanguageProvider>
        </Suspense>
      </body>
    </html>
  );
}
