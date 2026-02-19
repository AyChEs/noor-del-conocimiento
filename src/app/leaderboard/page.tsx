'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthProvider';
import { getLeaderboard, type LeaderboardEntry } from '@/lib/firestore';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, ArrowLeft, Star, Swords } from 'lucide-react';
import { cn } from '@/lib/utils';

const PODIUM = [
    { icon: '🥇', bg: 'from-yellow-400/20 to-yellow-500/5', border: 'border-yellow-400/40', text: 'text-yellow-400', size: 'text-2xl' },
    { icon: '🥈', bg: 'from-slate-400/20 to-slate-400/5', border: 'border-slate-400/40', text: 'text-slate-400', size: 'text-xl' },
    { icon: '🥉', bg: 'from-amber-600/20 to-amber-600/5', border: 'border-amber-600/40', text: 'text-amber-600', size: 'text-xl' },
];

function Avatar({ name, isCurrentUser }: { name: string; isCurrentUser: boolean }) {
    const initials = name.slice(0, 2).toUpperCase();
    const colors = ['bg-emerald-500', 'bg-blue-500', 'bg-violet-500', 'bg-rose-500', 'bg-amber-500', 'bg-teal-500'];
    const color = colors[name.charCodeAt(0) % colors.length];
    return (
        <div className={cn('w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ring-2', color, isCurrentUser ? 'ring-primary' : 'ring-transparent')}>
            {initials}
        </div>
    );
}

function LeaderboardSkeleton() {
    return (
        <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-2xl" />
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

    const userPosition = user ? entries.findIndex(e => e.uid === user.uid) : -1;
    const topScore = entries[0]?.totalScore ?? 1;

    return (
        <main className="flex min-h-screen flex-col items-center justify-start p-4 sm:p-6 pt-20 pb-10 bg-gradient-to-b from-background to-primary/5">
            <div className="w-full max-w-md space-y-5">

                {/* Header */}
                <div className="flex items-center gap-3">
                    <Button asChild variant="ghost" size="icon" className="rounded-full">
                        <Link href="/"><ArrowLeft className="h-5 w-5" /></Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold font-headline tracking-tight">Clasificación</h1>
                        <p className="text-xs text-muted-foreground">Top 10 global · Modo Musafir · Puntuación acumulada</p>
                    </div>
                </div>

                {/* Trophy Banner */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-yellow-500/20 via-amber-400/10 to-transparent border border-yellow-400/20 p-5 flex items-center gap-4">
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-10">
                        <Trophy className="h-24 w-24 text-yellow-400" />
                    </div>
                    <div className="bg-yellow-400/20 p-3 rounded-2xl">
                        <Trophy className="h-8 w-8 text-yellow-400" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-0.5">Líder global</p>
                        <p className="text-xl font-bold">{loading ? '—' : (entries[0]?.displayName ?? 'Nadie aún')}</p>
                        {!loading && entries[0] && (
                            <p className="text-sm text-yellow-500 font-semibold">{entries[0].totalScore.toLocaleString()} pts acumulados</p>
                        )}
                    </div>
                </div>

                {/* Tabla */}
                <div className="space-y-2">
                    {loading ? (
                        <LeaderboardSkeleton />
                    ) : entries.length === 0 ? (
                        <div className="text-center py-12 rounded-3xl border border-dashed border-muted-foreground/20">
                            <Medal className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                            <p className="text-muted-foreground text-sm">Sé el primero en aparecer.</p>
                            <Button asChild className="mt-4 rounded-full">
                                <Link href="/?step=setup">Jugar ahora</Link>
                            </Button>
                        </div>
                    ) : (
                        entries.map((entry, index) => {
                            const isCurrentUser = user?.uid === entry.uid;
                            const pod = index < 3 ? PODIUM[index] : null;
                            const pct = Math.round((entry.totalScore / topScore) * 100);

                            return (
                                <div
                                    key={entry.uid}
                                    className={cn(
                                        'relative overflow-hidden rounded-2xl border p-3 transition-all',
                                        pod
                                            ? `bg-gradient-to-r ${pod.bg} ${pod.border}`
                                            : isCurrentUser
                                                ? 'bg-primary/10 border-primary/30'
                                                : 'bg-card/60 border-border/50 hover:bg-card/80'
                                    )}
                                >
                                    <div className="flex items-center gap-3">
                                        {/* Posición */}
                                        <div className="w-8 text-center flex-shrink-0">
                                            {pod ? (
                                                <span className={pod.size}>{pod.icon}</span>
                                            ) : (
                                                <span className="text-sm font-bold text-muted-foreground">{index + 1}</span>
                                            )}
                                        </div>

                                        {/* Avatar */}
                                        <Avatar name={entry.displayName} isCurrentUser={isCurrentUser} />

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-1.5 mb-0.5">
                                                <p className={cn('font-semibold truncate text-sm', pod ? pod.text : isCurrentUser && 'text-primary')}>
                                                    {entry.displayName}
                                                </p>
                                                {isCurrentUser && <Badge variant="secondary" className="text-xs px-1.5 py-0">Tú</Badge>}
                                            </div>
                                            {/* Barra de progreso relativa */}
                                            <div className="h-1.5 bg-muted/40 rounded-full overflow-hidden w-full">
                                                <div
                                                    className={cn('h-full rounded-full transition-all', pod ? 'bg-yellow-400' : 'bg-primary/60')}
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                            <p className="text-xs text-muted-foreground mt-0.5">{entry.gamesPlayed} part. · mejor: {entry.bestScore}pts</p>
                                        </div>

                                        {/* Score total */}
                                        <div className="text-right flex-shrink-0 ml-2">
                                            <p className={cn('text-lg font-bold', pod ? pod.text : 'text-foreground')}>
                                                {entry.totalScore.toLocaleString()}
                                            </p>
                                            <p className="text-xs text-muted-foreground">pts</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}

                    {/* Usuario fuera del top 10 */}
                    {user && userPosition === -1 && (
                        <div className="mt-2 p-3 rounded-2xl border border-dashed border-primary/20 text-center bg-primary/5">
                            <Swords className="h-5 w-5 text-primary mx-auto mb-1" />
                            <p className="text-sm text-muted-foreground">Aún no estás en el top 10. ¡Sigue jugando!</p>
                        </div>
                    )}

                    <Button asChild className="w-full rounded-full mt-2 gap-2">
                        <Link href="/?step=setup"><Star className="h-4 w-4" />Jugar y mejorar tu clasificación</Link>
                    </Button>
                </div>
            </div>
        </main>
    );
}
