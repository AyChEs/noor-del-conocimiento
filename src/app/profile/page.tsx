'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthProvider';
import { getUserProfile, type UserProfile } from '@/lib/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Star, Gamepad2, ArrowLeft, Trophy as TrophyIcon, Edit2, Loader2 } from 'lucide-react';
import { getRank } from '@/lib/gameLogic';
import { useTranslation } from '@/context/LanguageProvider';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function ProfileSkeleton() {
    return (
        <div className="space-y-4">
            <Skeleton className="h-24 w-24 rounded-full mx-auto" />
            <Skeleton className="h-6 w-48 mx-auto" />
            <Skeleton className="h-4 w-32 mx-auto" />
            <div className="grid grid-cols-3 gap-4 mt-6">
                {[1, 2, 3].map(i => (
                    <Skeleton key={i} className="h-20 rounded-xl" />
                ))}
            </div>
        </div>
    );
}

export default function ProfilePage() {
    const { t } = useTranslation();
    const { user, loading: authLoading } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loadingProfile, setLoadingProfile] = useState(true);

    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editPhoto, setEditPhoto] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!user) { setLoadingProfile(false); return; }
        getUserProfile(user.uid)
            .then(setProfile)
            .finally(() => setLoadingProfile(false));
    }, [user]);

    const handleEditOpen = () => {
        setEditName(user?.displayName || '');
        setEditPhoto(user?.photoURL || '');
        setIsEditing(true);
    };

    const handleSaveProfile = async () => {
        if (!user) return;
        setSaving(true);
        try {
            const { updateUserProfileData } = await import('@/lib/firestore');
            await updateUserProfileData(user, editName, editPhoto);
            setIsEditing(false);
            if (profile) setProfile({ ...profile, displayName: editName });
        } catch (error) {
            console.error("Error updating profile", error);
        } finally {
            setSaving(false);
        }
    };

    const isLoading = authLoading || loadingProfile;

    const initials = user?.displayName?.slice(0, 2).toUpperCase() ?? 'AN';

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 pt-16">
            <div className="w-full max-w-md">
                <div className="mb-4">
                    <Button asChild variant="ghost" size="sm" className="gap-2">
                        <Link href="/"><ArrowLeft className="h-4 w-4" />Inicio</Link>
                    </Button>
                </div>

                {!user && !authLoading ? (
                    <Card className="text-center p-8">
                        <Star className="h-12 w-12 text-primary mx-auto mb-4" />
                        <h2 className="text-xl font-headline font-semibold mb-2">Inicia sesión para ver tu perfil</h2>
                        <p className="text-muted-foreground text-sm mb-6">
                            Crea una cuenta para guardar tu progreso y aparecer en la clasificación.
                        </p>
                        <Button asChild className="w-full">
                            <Link href="/?step=setup">Volver al juego</Link>
                        </Button>
                    </Card>
                ) : (
                    <Card className="shadow-2xl overflow-hidden">
                        <div className="h-24 bg-gradient-to-r from-primary/30 to-primary/10" />
                        <CardHeader className="text-center pb-2 -mt-12">
                            {isLoading ? (
                                <ProfileSkeleton />
                            ) : (
                                <>
                                    <Avatar className="h-24 w-24 mx-auto border-4 border-background shadow-lg text-4xl">
                                        <AvatarImage src={user?.photoURL ?? undefined} className="object-cover" />
                                        <AvatarFallback className="bg-primary/20 text-primary font-bold">
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex items-center justify-center gap-2 mt-4 text-center">
                                        <CardTitle className="text-2xl font-headline">
                                            {user?.displayName ?? 'Usuario'}
                                        </CardTitle>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full opacity-60 hover:opacity-100" onClick={handleEditOpen}>
                                            <Edit2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                                </>
                            )}
                        </CardHeader>

                        {!isLoading && profile && (
                            <CardContent className="space-y-4 pb-6">
                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-3 mt-2">
                                    <div className="flex flex-col items-center p-3 rounded-xl bg-primary/10 text-center">
                                        <Trophy className="h-5 w-5 text-yellow-500 mb-1" />
                                        <span className="text-2xl font-bold">{profile.bestScore}</span>
                                        <span className="text-xs text-muted-foreground">Mejor score</span>
                                    </div>
                                    <div className="flex flex-col items-center p-3 rounded-xl bg-primary/10 text-center">
                                        <Gamepad2 className="h-5 w-5 text-primary mb-1" />
                                        <span className="text-2xl font-bold">{profile.totalGamesPlayed}</span>
                                        <span className="text-xs text-muted-foreground">Partidas</span>
                                    </div>
                                    <div className="flex flex-col items-center p-3 rounded-xl bg-primary/10 text-center">
                                        <Star className="h-5 w-5 text-primary mb-1" />
                                        <div className="flex flex-col items-center">
                                            <span className="text-xl font-bold">
                                                {profile.bestScore >= 80 ? '🥇' : profile.bestScore >= 60 ? '🥈' : profile.bestScore >= 40 ? '🥉' : '📚'}
                                            </span>
                                            <span className="text-[10px] font-bold text-primary uppercase leading-tight">
                                                {t(getRank(profile.bestScore).titleKey)}
                                            </span>
                                        </div>
                                        <span className="text-[10px] text-muted-foreground mt-1">Rango</span>
                                    </div>
                                </div>

                                {profile.bestScore > 0 && (
                                    <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center gap-3">
                                        <TrophyIcon className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                                        <div>
                                            <p className="text-sm font-semibold">Mejor puntuación: {profile.bestScore}/100</p>
                                            <p className="text-xs text-muted-foreground">
                                                {profile.bestScoreDate
                                                    ? new Date((profile.bestScoreDate as { seconds: number }).seconds * 1000).toLocaleDateString('es-ES')
                                                    : ''}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-2 pt-2">
                                    <Button asChild className="flex-1">
                                        <Link href="/?step=setup">Jugar</Link>
                                    </Button>
                                    <Button asChild variant="outline" className="flex-1">
                                        <Link href="/leaderboard" className="flex items-center gap-2">
                                            <Trophy className="h-4 w-4" />Clasificación
                                        </Link>
                                    </Button>
                                </div>
                            </CardContent>
                        )}
                    </Card>
                )}
            </div>

            <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogContent className="sm:max-w-md w-[95vw] rounded-2xl p-6">
                    <DialogHeader>
                        <DialogTitle className="text-xl">Editar Perfil</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-5 py-2">
                        <div className="space-y-2">
                            <Label htmlFor="name" className="text-sm">Nombre de usuario</Label>
                            <Input
                                id="name"
                                value={editName}
                                onChange={e => setEditName(e.target.value)}
                                placeholder="Escribe tu nuevo nombre"
                                maxLength={25}
                                className="h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="photo" className="text-sm">Link de Avatar (Opcional)</Label>
                            <Input
                                id="photo"
                                value={editPhoto}
                                onChange={e => setEditPhoto(e.target.value)}
                                placeholder="https://..."
                                className="h-11"
                            />
                            <p className="text-xs text-muted-foreground pt-1">Pega una URL a una imagen (ej. imgur, avatar.cc) para usar de Avatar.</p>
                        </div>
                    </div>
                    <DialogFooter className="flex-col sm:flex-row gap-2 mt-2">
                        <Button variant="outline" className="w-full sm:w-auto h-11" onClick={() => setIsEditing(false)}>Cancelar</Button>
                        <Button className="w-full sm:w-auto h-11" onClick={handleSaveProfile} disabled={saving || !editName.trim()}>
                            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Edit2 className="h-4 w-4 mr-2" />}
                            Guardar Cambios
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </main>
    );
}
