import type { Metadata } from 'next';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';
import { LanguageProvider } from '@/context/LanguageProvider';
import { AuthProvider } from '@/context/AuthProvider';
import { UserMenu } from '@/components/auth/UserMenu';
import { Suspense } from 'react';
import { Mail, Send } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Trivia Luz del Saber',
  description: 'Un juego de trivia islámico para iluminar la mente y el alma.',
  openGraph: {
    title: 'Trivia Luz del Saber | Ponte a prueba',
    description: '¿Cuánto sabes de la historia del Islam? ¡Ponte a prueba en este juego de preguntas!',
    url: 'https://luzdelsaber.com', // Se reemplazará por el dominio real cuando se despliegue
    siteName: 'Luz del Saber',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Trivia Luz del Saber - Fondo oasis y farol dorado',
      },
    ],
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trivia Luz del Saber',
    description: '¿Cuánto sabes de la historia del Islam? ¡Ponte a prueba en este juego de preguntas!',
    images: ['/og-image.png'],
  },
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
              {/* Pie de página con contacto de soporte */}
              <div className="fixed bottom-0 w-full p-2 text-center z-50 pointer-events-none">
                <div className="pointer-events-auto inline-flex items-center gap-2 bg-background/80 backdrop-blur-sm px-4 py-1.5 rounded-full border shadow-sm text-xs text-muted-foreground">
                  <span>¿Tienes problemas o sugerencias?</span>
                  <a href="mailto:luzdelsaber.juego@gmail.com" className="text-primary hover:underline font-medium inline-flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> Email
                  </a>
                  <span>o</span>
                  <a href="https://t.me/LuzDelSaberSoporte" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium inline-flex items-center gap-1.5">
                    <Send className="w-3.5 h-3.5 -mt-0.5" /> Telegram
                  </a>
                </div>
              </div>
              <Toaster />
            </LanguageProvider>
          </AuthProvider>
        </Suspense>
      </body>
    </html>
  );
}
