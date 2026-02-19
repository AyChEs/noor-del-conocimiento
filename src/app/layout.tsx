import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';
import { LanguageProvider } from '@/context/LanguageProvider';
import { AuthProvider } from '@/context/AuthProvider';
import { UserMenu } from '@/components/auth/UserMenu';
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
          <AuthProvider>
            <LanguageProvider>
              {/* Cabecera global con menú de usuario */}
              <header className="fixed top-0 right-0 z-50 p-3">
                <UserMenu />
              </header>
              {children}
              <Toaster />
            </LanguageProvider>
          </AuthProvider>
        </Suspense>
      </body>
    </html>
  );
}
