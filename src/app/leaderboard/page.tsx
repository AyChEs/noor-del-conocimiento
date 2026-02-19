'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthProvider';
import { getLeaderboard, type LeaderboardEntry } from '@/lib/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, ArrowLeft, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const MEDAL_COLORS = ['text-yellow-400', 'text-slate-400', 'text-amber-600'];
const MEDAL_ICONS = ['🥇', '🥈', '🥉'];

function LeaderboardSkeleton() {
    return (
        <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
        </div>
    );
}

export default function LeaderboardPage() {
    const { user } = useAuth();
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getLeaderboard(10)
            .then(setEntries)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const userPosition = user
        ? entries.findIndex(e => e.uid === user.uid)
        : -1;

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 pt-16">
            <div className="w-full max-w-md">
                <div className="mb-4">
                    <Button asChild variant="ghost" size="sm" className="gap-2">
                        <Link href="/"><ArrowLeft className="h-4 w-4" />Inicio</Link>
                    </Button>
                </div>

                <Card className="shadow-2xl">
                    <CardHeader className="text-center pb-4 bg-gradient-to-b from-primary/10 to-transparent rounded-t-xl">
                        <div className="mx-auto bg-yellow-500/20 p-3 rounded-full w-fit mb-2">
                            <Trophy className="h-8 w-8 text-yellow-500" />
                        </div>
                        <CardTitle className="text-2xl font-headline">Tabla de Clasificación</CardTitle>
                        <p className="text-sm text-muted-foreground">Top 10 jugadores globales</p>
                    </CardHeader>

                    <CardContent className="space-y-3 pb-6">
                        {loading ? (
                            <LeaderboardSkeleton />
                        ) : entries.length === 0 ? (
                            <div className="text-center py-8">
                                <Medal className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                                <p className="text-muted-foreground text-sm">
                                    Sé el primero en aparecer en la clasificación.
                                </p>
                                <Button asChild className="mt-4">
                                    <Link href="/?step=setup">Jugar ahora</Link>
                                </Button>
                            </div>
                        ) : (
                            <>
                                {entries.map((entry, index) => {
                                    const isCurrentUser = user?.uid === entry.uid;
                                    const isTop3 = index < 3;

                                    return (
                                        <div
                                            key={entry.uid}
                                            className={cn(
                                                'flex items-center gap-3 p-3 rounded-xl border transition-all',
                                                isCurrentUser
                                                    ? 'bg-primary/10 border-primary/30 shadow-sm'
                                                    : 'bg-card/50 border-border/50',
                                                isTop3 && 'border-yellow-500/20'
                                            )}
                                        >
                                            {/* Posición */}
                                            <div className="w-8 text-center flex-shrink-0">
                                                {isTop3 ? (
                                                    <span className="text-xl">{MEDAL_ICONS[index]}</span>
                                                ) : (
                                                    <span className="text-sm font-bold text-muted-foreground">
                                                        {index + 1}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Nombre */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <p className={cn(
                                                        'font-semibold truncate',
                                                        isCurrentUser && 'text-primary'
                                                    )}>
                                                        {entry.displayName}
                                                    </p>
                                                    {isCurrentUser && (
                                                        <Badge variant="secondary" className="text-xs px-1.5 py-0 flex-shrink-0">
                                                            Tú
                                                        </Badge>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                    {entry.gamesPlayed} partida{entry.gamesPlayed !== 1 ? 's' : ''}
                                                </p>
                                            </div>

                                            {/* Score */}
                                            <div className="text-right flex-shrink-0">
                                                <p className={cn(
                                                    'text-xl font-bold',
                                                    isTop3 ? MEDAL_COLORS[index] : 'text-foreground'
                                                )}>
                                                    {entry.bestScore}
                                                </p>
                                                <p className="text-xs text-muted-foreground">pts</p>
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Si el usuario no está en el top 10 */}
                                {user && userPosition === -1 && (
                                    <div className="mt-4 p-3 rounded-xl border border-dashed border-muted-foreground/30 text-center">
                                        <User className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
                                        <p className="text-sm text-muted-foreground">
                                            Aún no estás en el top 10. ¡Sigue jugando!
                                        </p>
                                    </div>
                                )}

                                <Button asChild className="w-full mt-2">
                                    <Link href="/?step=setup">Jugar y mejorar tu record</Link>
                                </Button>
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>
        </main>
    );
}
