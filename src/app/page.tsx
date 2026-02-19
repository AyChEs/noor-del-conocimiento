'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import type { GameMode } from '@/lib/types';
import { BookOpen, CheckCircle, Clock, Globe, HelpCircle, ScrollText, SkipForward, Star, Swords, User, Users } from 'lucide-react';
import Link from 'next/link';
import { useState, type UIEvent, Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useTranslation } from '@/context/LanguageProvider';

function SoloModeSetup() {
  const { t } = useTranslation();
  return (
    <Tabs defaultValue="Seerah" className="w-full mt-4">
      <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
        <TabsTrigger value="Seerah" className="py-2"><Users className="w-4 h-4 me-2" />{t('category.seerah')}</TabsTrigger>
        <TabsTrigger value="Profetas" className="py-2"><BookOpen className="w-4 h-4 me-2" />{t('category.prophets')}</TabsTrigger>
        <TabsTrigger value="Corán y General" className="py-2"><Globe className="w-4 h-4 me-2" />{t('category.general')}</TabsTrigger>
        <TabsTrigger value="mix" className="py-2"><Swords className="w-4 h-4 me-2" />{t('category.mix')}</TabsTrigger>
      </TabsList>
      <TabsContent value="Seerah">
        <DifficultySelector category="Seerah" description={t('category.seerahDescription')} />
      </TabsContent>
      <TabsContent value="Profetas">
        <DifficultySelector category="Profetas" description={t('category.prophetsDescription')} />
      </TabsContent>
      <TabsContent value="Corán y General">
        <DifficultySelector category="Corán y General" description={t('category.generalDescription')} />
      </TabsContent>
      <TabsContent value="mix">
        <DifficultySelector category="mix" description={t('category.mixDescription')} />
      </TabsContent>
    </Tabs>
  )
}

function DifficultySelector({ category, description }: { category: GameMode; description: string }) {
  const { t } = useTranslation();
  return (
    <Card className="mt-4 border-primary/20 bg-background/50 text-left">
      <CardHeader>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
        <Button asChild size="lg" variant="outline" className="h-14 text-base">
          <Link href={`/play?mode=musafir&category=${category}&difficulty=easy`}>{t('difficulty.easy')}</Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="h-14 text-base">
          <Link href={`/play?mode=musafir&category=${category}&difficulty=medium`}>{t('difficulty.medium')}</Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="h-14 text-base">
          <Link href={`/play?mode=musafir&category=${category}&difficulty=hard`}>{t('difficulty.hard')}</Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function RulesContent() {
  const { t } = useTranslation();
  return (
    <div className="text-left space-y-4 py-4 pe-4">
      <div>
        <h4 className="font-bold text-foreground">{t('rules.gameModes.title')}</h4>
        <ul className="text-sm text-muted-foreground list-disc ps-5 mt-1 space-y-1">
          <li><strong className="text-foreground/90">{t('rules.gameModes.musafir.title')}:</strong> {t('rules.gameModes.musafir.description')}</li>
          <li><strong className="text-foreground/90">{t('rules.gameModes.majlis.title')}:</strong> {t('rules.gameModes.majlis.description')}</li>
        </ul>
      </div>
      <div>
        <h4 className="font-bold text-foreground">{t('rules.difficulty.title')}</h4>
        <ul className="text-sm text-muted-foreground list-disc ps-5 mt-1 space-y-1">
          <li><strong className="text-foreground/90">{t('difficulty.easy')}:</strong> {t('rules.difficulty.easy')}</li>
          <li><strong className="text-foreground/90">{t('difficulty.medium')}:</strong> {t('rules.difficulty.medium')}</li>
          <li><strong className="text-foreground/90">{t('difficulty.hard')}:</strong> {t('rules.difficulty.hard')}</li>
        </ul>
      </div>
      <div>
        <h3 className="font-bold text-lg text-primary mb-2">{t('rules.lifelines.title')}</h3>
        <p className="text-sm text-muted-foreground mb-3">{t('rules.lifelines.inventory')}</p>
        <ul className="space-y-3">
          <li className="flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
            <div>
              <h5 className="font-semibold text-foreground">{t('rules.lifelines.fiftyFifty.title')}</h5>
              <p className="text-muted-foreground text-sm">{t('rules.lifelines.fiftyFifty.description')}</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
            <div>
              <h5 className="font-semibold text-foreground">{t('rules.lifelines.extraTime.title')}</h5>
              <p className="text-muted-foreground text-sm">{t('rules.lifelines.extraTime.description')}</p>
            </div>
          </li>
          <li className="flex items-start gap-3">
            <SkipForward className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
            <div>
              <h5 className="font-semibold text-foreground">{t('rules.lifelines.skip.title')}</h5>
              <p className="text-muted-foreground text-sm">{t('rules.lifelines.skip.description')}</p>
            </div>
          </li>
        </ul>
      </div>
      <div className="pt-2">
        <h5 className="font-bold text-lg text-primary mb-2">{t('rules.scoring.title')}</h5>
        <ul className="text-sm text-muted-foreground list-disc ps-5 mt-1 space-y-2">
          <li>{t('rules.scoring.difficulty')}</li>
          <li>{t('rules.scoring.category')}</li>
          <li>{t('rules.scoring.timeBonus')}</li>
          <li>{t('rules.scoring.accumulation')}</li>
        </ul>
      </div>
    </div>
  );
}

function ModeSelection() {
  const [selectedMode, setSelectedMode] = useState<'musafir' | 'majlis' | null>(null);
  const { t } = useTranslation();

  return (
    <div className="text-center">
      <h3 className="font-headline text-2xl font-semibold mb-6">{t('setup.chooseMode')}</h3>
      {!selectedMode ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <User className="h-10 w-10 text-primary mx-auto mb-3" />
              <CardTitle>{t('setup.musafirMode.title')}</CardTitle>
              <CardDescription>{t('setup.musafirMode.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setSelectedMode('musafir')} size="lg" className="w-full">{t('setup.selectButton')}</Button>
            </CardContent>
          </Card>
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="h-10 w-10 text-primary mx-auto mb-3" />
              <CardTitle>{t('setup.majlisMode.title')}</CardTitle>
              <CardDescription>{t('setup.majlisMode.description')}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild size="lg" className="w-full">
                <Link href="/majlis-setup">{t('setup.majlisMode.button')}</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div>
          <Button onClick={() => setSelectedMode(null)} variant="ghost" className="mb-4">{t('setup.chooseAnotherMode')}</Button>
          <SoloModeSetup />
        </div>
      )}
    </div>
  )
}

function HomePage() {
  const searchParams = useSearchParams();
  const { t, setLanguage, language } = useTranslation();

  const [step, setStep] = useState<'language' | 'intro' | 'rules' | 'setup'>('language');
  const [rulesScrolled, setRulesScrolled] = useState(false);

  useEffect(() => {
    const initialStepParam = searchParams.get('step');
    if (initialStepParam === 'setup') {
      setStep('setup');
      setRulesScrolled(true);
    }
  }, [searchParams]);

  const handleScroll = (event: UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
    if (scrollHeight - scrollTop <= clientHeight + 1) {
      setRulesScrolled(true);
    }
  };

  const handleSelectLanguage = (lang: 'es' | 'en' | 'ma') => {
    setLanguage(lang);
    setStep('intro');
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-2xl">
        <Card className="overflow-hidden shadow-2xl">
          <CardHeader className="text-center p-8 bg-primary/10">
            <div className="mx-auto bg-primary/20 p-4 rounded-full w-fit mb-4">
              <Star className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="font-headline text-4xl font-bold tracking-tight text-primary">
              Light of Knowledge Trivia
            </CardTitle>
            <CardDescription className="font-arabic text-2xl text-primary/80 mt-2">
              نور المعرفة
            </CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            {step === 'language' && (
              <div className="text-center space-y-4">
                <h3 className="font-headline text-2xl font-semibold mb-6">Choose your language</h3>
                <div className="flex flex-col space-y-3">
                  <Button onClick={() => handleSelectLanguage('es')} size="lg" className="w-full h-14 text-lg">Español</Button>
                  <Button onClick={() => handleSelectLanguage('en')} size="lg" className="w-full h-14 text-lg">English</Button>
                  <Button onClick={() => handleSelectLanguage('ma')} size="lg" className="w-full h-14 text-lg font-arabic text-2xl">العربية (الدارجة)</Button>
                </div>
              </div>
            )}

            {step === 'intro' && (
              <div className="text-center space-y-6">
                <p className="text-lg text-muted-foreground">
                  {t('welcomeMessage')}
                </p>
                <Button onClick={() => setStep('rules')} size="lg" className="w-full h-14 text-lg">
                  {t('startYourJourney')}
                  <ScrollText className="ms-2 h-5 w-5" />
                </Button>
              </div>
            )}

            {step === 'rules' && (
              <div className="text-center">
                <h3 className="font-headline text-2xl font-semibold mb-2">{t('rulesTitle')}</h3>
                <p className="text-muted-foreground mb-4 text-sm">{t('rulesScrollPrompt')}</p>
                <ScrollArea className="h-72 w-full rounded-md border p-4" onScroll={handleScroll}>
                  <RulesContent />
                </ScrollArea>
                <Button
                  onClick={() => setStep('setup')}
                  size="lg"
                  className="w-full h-14 text-lg mt-6"
                  disabled={!rulesScrolled}
                >
                  <CheckCircle className={cn("me-2 h-5 w-5 transition-opacity", rulesScrolled ? "opacity-100" : "opacity-0")} />
                  {t('rulesReadButton')}
                </Button>
                {!rulesScrolled && <p className="text-xs text-muted-foreground mt-2 animate-pulse">{t('rulesScrollCta')}</p>}
              </div>
            )}

            {step === 'setup' && (
              <ModeSelection />
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomePage />
    </Suspense>
  )
}
