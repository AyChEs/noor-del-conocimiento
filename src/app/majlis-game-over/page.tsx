'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/context/LanguageProvider';
import { getMajlisRankings } from '@/lib/gameLogic';
import type { Player } from '@/lib/types';
import { Crown, Star } from 'lucide-react';
import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';

function MajlisGameOverContent() {
  const [players, setPlayers] = useState<Player[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    // Leer jugadores desde sessionStorage en vez de URL (evita URLs largas)
    const stored = sessionStorage.getItem('majlis_players');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setPlayers(getMajlisRankings(parsed));
        sessionStorage.removeItem('majlis_players');
      } catch (error) {
        console.error('Failed to parse players data', error);
      }
    }
  }, []);

  const winner = players[0];

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-lg">
        <Card className="text-center shadow-2xl">
          <CardHeader className="p-8 bg-primary/10">
            <CardTitle className="font-headline text-3xl font-bold tracking-tight text-primary-foreground/90">
              {t('gameOver.majlis.title')}
            </CardTitle>
            <CardDescription className="font-body text-lg text-muted-foreground mt-2">
              {t('gameOver.majlis.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            {winner && (
              <div className="p-6 rounded-lg bg-primary/5 border border-primary/20">
                <Crown className="h-12 w-12 text-primary mx-auto mb-3" />
                <h3 className="text-2xl font-semibold font-headline">{t('gameOver.majlis.winner')}: {winner.name}</h3>
                <p className="text-muted-foreground mt-2">{t('gameOver.finalScore')}: {winner.score}<span className="text-sm">/100</span></p>
              </div>
            )}

            <div className='space-y-3'>
              <h4 className='font-semibold text-lg'>{t('gameOver.majlis.finalStandings')}</h4>
              <ul className='text-left space-y-2'>
                {players.map((p, index) => (
                  <li key={p.id} className='flex items-center justify-between p-3 bg-secondary/50 rounded-md'>
                    <div className='flex items-center gap-3'>
                      <span className='font-bold text-primary w-6'>{index + 1}.</span>
                      <div>
                        <p className='font-semibold'>{p.name}</p>
                        <p className='text-sm text-muted-foreground'>
                          {p.isEliminated ? t('playerStatus.eliminated') : `${t('playerStatus.lives')}: ${p.lives}`}
                        </p>
                      </div>
                    </div>
                    <span className='font-bold text-lg'>{p.score} <span className="text-xs text-muted-foreground">{t('playerStatus.pts')}</span></span>
                  </li>
                ))}
              </ul>
            </div>

            <Button asChild size="lg" className="w-full mt-4 text-lg h-14">
              <Link href="/?step=setup">
                <Star className="mr-2 h-5 w-5" />
                {t('gameOver.playAgain')}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function MajlisFallback() {
  const { t } = useTranslation();
  return <div>{t('loading.results')}</div>;
}

export default function MajlisGameOverPage() {
  return (
    <Suspense fallback={<MajlisFallback />}>
      <MajlisGameOverContent />
    </Suspense>
  );
}
