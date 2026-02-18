'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from '@/context/LanguageProvider';
import { getRank } from '@/lib/gameLogic';
import { Award, Star } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function GameOverContent() {
  const searchParams = useSearchParams();
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(0);
  const { t } = useTranslation();

  useEffect(() => {
    const scoreParam = searchParams.get('score');
    const correctParam = searchParams.get('correct');
    const totalParam = searchParams.get('total');
    setScore(scoreParam ? parseInt(scoreParam, 10) : 0);
    setCorrect(correctParam ? parseInt(correctParam, 10) : 0);
    setTotal(totalParam ? parseInt(totalParam, 10) : 0);
  }, [searchParams]);

  const rank = getRank(score);

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-lg">
        <Card className="text-center shadow-2xl">
          <CardHeader className="p-8 bg-primary/10">
            <CardTitle className="font-headline text-3xl font-bold tracking-tight text-primary-foreground/90">
              {t('gameOver.solo.title')}
            </CardTitle>
            <CardDescription className="font-body text-lg text-muted-foreground mt-2">
              {t('gameOver.solo.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div>
              <p className="text-muted-foreground">{t('gameOver.finalScore')}</p>
              <p className="text-6xl font-bold text-primary">{score}<span className="text-2xl text-muted-foreground">/100</span></p>
              {total > 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  {correct} {t('gameOver.correctOf')} {total} {t('gameOver.questions')}
                </p>
              )}
            </div>
            <div className="p-6 rounded-lg bg-primary/5 border border-primary/20">
              <Award className="h-12 w-12 text-primary mx-auto mb-3" />
              <h3 className="text-2xl font-semibold font-headline">{t(rank.titleKey)}</h3>
              <p className="text-muted-foreground mt-2">{t(rank.descriptionKey)}</p>
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

function GameOverFallback() {
  const { t } = useTranslation();
  return <div>{t('loading.results')}</div>;
}

export default function GameOverPage() {
  return (
    <Suspense fallback={<GameOverFallback />}>
      <GameOverContent />
    </Suspense>
  );
}
