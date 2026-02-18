'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTranslation } from '@/context/LanguageProvider';
import type { GameMode, Player } from '@/lib/types';
import { BookOpen, Globe, Swords, Trash2, UserPlus, Users } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

function MajlisDifficultySelector({ onSelectDifficulty }: { onSelectDifficulty: (difficulty: 'easy' | 'medium' | 'hard') => void }) {
  const { t } = useTranslation();
  return (
    <Card className="mt-4 border-primary/20 bg-background/50 text-left">
      <CardContent className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
        <Button size="lg" variant="outline" className="h-14 text-base" onClick={() => onSelectDifficulty('easy')}>{t('difficulty.easy')}</Button>
        <Button size="lg" variant="outline" className="h-14 text-base" onClick={() => onSelectDifficulty('medium')}>{t('difficulty.medium')}</Button>
        <Button size="lg" variant="outline" className="h-14 text-base" onClick={() => onSelectDifficulty('hard')}>{t('difficulty.hard')}</Button>
      </CardContent>
    </Card>
  );
}

export default function MajlisSetupPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [players, setPlayers] = useState<Player[]>([]);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [category, setCategory] = useState<GameMode>('mix');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard' | null>(null);

  const handleAddPlayer = () => {
    if (newPlayerName.trim() && players.length < 6) {
      const newPlayer: Player = {
        id: uuidv4(),
        name: newPlayerName.trim(),
        score: 0,
        lives: 3,
        lifelines: { fiftyFifty: 2, extraTime: 2, skip: 1 },
        isEliminated: false,
      };
      setPlayers([...players, newPlayer]);
      setNewPlayerName('');
    }
  };

  const handleRemovePlayer = (id: string) => {
    setPlayers(players.filter(p => p.id !== id));
  };

  const handleStartGame = () => {
    if (players.length >= 2 && category && difficulty) {
      const encodedPlayers = encodeURIComponent(JSON.stringify(players));
      router.push(`/play?mode=majlis&players=${encodedPlayers}&category=${category}&difficulty=${difficulty}`);
    }
  };

  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-2xl">
        <Card className="shadow-2xl">
          <CardHeader className="text-center p-8">
            <CardTitle className="font-headline text-3xl font-bold">{t('majlisSetup.title')}</CardTitle>
            <CardDescription>{t('majlisSetup.description')}</CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            <div>
              <Label htmlFor="player-name">{t('majlisSetup.playerNameLabel')}</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  id="player-name"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  placeholder={t('majlisSetup.playerNamePlaceholder')}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
                />
                <Button onClick={handleAddPlayer} disabled={players.length >= 6}>
                  <UserPlus className="h-4 w-4 me-2" /> {t('majlisSetup.addPlayerButton')}
                </Button>
              </div>
            </div>

            {players.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">{t('majlisSetup.playersTitle')}:</h3>
                <ul className="space-y-2">
                  {players.map(p => (
                    <li key={p.id} className="flex items-center justify-between bg-secondary p-2 rounded-md">
                      <span className="font-medium">{p.name}</span>
                      <Button variant="ghost" size="icon" onClick={() => handleRemovePlayer(p.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {players.length >= 2 && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-center mb-4">{t('setup.chooseCategory')}</h3>
                  <Tabs defaultValue={category} onValueChange={(value) => setCategory(value as GameMode)} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
                       <TabsTrigger value="Seerah" className="py-2"><Users className="w-4 h-4 me-2" />{t('category.seerah')}</TabsTrigger>
                        <TabsTrigger value="Profetas" className="py-2"><BookOpen className="w-4 h-4 me-2" />{t('category.prophets')}</TabsTrigger>
                        <TabsTrigger value="Corán y General" className="py-2"><Globe className="w-4 h-4 me-2" />{t('category.general')}</TabsTrigger>
                        <TabsTrigger value="mix" className="py-2"><Swords className="w-4 h-4 me-2" />{t('category.mix')}</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                 <div>
                    <h3 className="font-semibold text-center mb-4">{t('setup.chooseDifficulty')}</h3>
                    <MajlisDifficultySelector onSelectDifficulty={setDifficulty} />
                 </div>
              </div>
            )}

            <Button onClick={handleStartGame} disabled={players.length < 2 || !difficulty} size="lg" className="w-full h-14 text-lg">
              {t('majlisSetup.startGameButton')}
            </Button>
            <Button variant="link" asChild><Link href="/">{t('majlisSetup.backToHome')}</Link></Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
