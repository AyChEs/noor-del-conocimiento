'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { db } from '@/lib/firebase';
import { collection, getDocs, doc, deleteDoc, updateDoc, getDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trophy, Trash2, Edit2, ShieldAlert, Loader2, ArrowLeft } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

export default function AdminPage() {
    const { user, loading } = useAuth();
    const [isAdmin, setIsAdmin] = useState(false);
    const [leaderboard, setLeaderboard] = useState<any[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    const [editTarget, setEditTarget] = useState<any>(null);
    const [newName, setNewName] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!user) {
            setLoadingData(false);
            return;
        }

        // Comprobar si es admin (luzdelsaber.juego@gmail.com)
        if (user.email === 'luzdelsaber.juego@gmail.com') {
            setIsAdmin(true);
            fetchLeaderboard();
        } else {
            setLoadingData(false);
        }
    }, [user]);

    const fetchLeaderboard = async () => {
        setLoadingData(true);
        try {
            const snap = await getDocs(collection(db, 'leaderboard'));
            const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            data.sort((a: any, b: any) => b.totalScore - a.totalScore);
            setLeaderboard(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoadingData(false);
        }
    };

    const handleRemoveFromPodium = async (uid: string) => {
        if (!confirm('¿Estás seguro de que deseas eliminar a este usuario del leaderboard?')) return;
        try {
            await deleteDoc(doc(db, 'leaderboard', uid));
            // Opcionalmente resetear sus puntos en 'users' para que no vuelva a subir sin jugar
            await updateDoc(doc(db, 'users', uid), {
                totalGamesPlayed: 0,
                bestScore: 0,
                bestScoreDate: null
            });
            fetchLeaderboard();
        } catch (e) {
            console.error(e);
            alert('Error al eliminar. Revisa la consola o las reglas de Firestore.');
        }
    };

    const handleOpenEdit = (userItem: any) => {
        setEditTarget(userItem);
        setNewName(userItem.displayName || '');
    };

    const handleSaveName = async () => {
        if (!editTarget) return;
        setIsSaving(true);
        try {
            const uid = editTarget.id;
            await updateDoc(doc(db, 'leaderboard', uid), { displayName: newName });
            await updateDoc(doc(db, 'users', uid), { displayName: newName });
            setEditTarget(null);
            fetchLeaderboard();
        } catch (e) {
            console.error(e);
            alert('Error al actualizar el nombre');
        } finally {
            setIsSaving(false);
        }
    };

    if (loading || loadingData) {
        return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
    }

    if (!isAdmin) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center space-y-4">
                <Button asChild variant="ghost" className="absolute top-4 left-4"><Link href="/"><ArrowLeft className="h-4 w-4 mr-2" /> Inicio</Link></Button>
                <ShieldAlert className="h-16 w-16 text-destructive" />
                <h1 className="text-2xl font-bold font-headline">Acceso Denegado</h1>
                <p className="text-muted-foreground">No tienes permisos de administrador para ver esta página.</p>
            </div>
        );
    }

    return (
        <main className="min-h-screen p-4 sm:p-8 pt-20 max-w-5xl mx-auto space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-headline font-bold flex items-center gap-2">
                        <ShieldAlert className="text-primary h-8 w-8" /> Panel Admin
                    </h1>
                    <p className="text-muted-foreground mt-1">Moderación de usuarios y leaderboard.</p>
                </div>
                <Button asChild variant="outline" size="sm">
                    <Link href="/"><ArrowLeft className="h-4 w-4 mr-2" /> Volver al juego</Link>
                </Button>
            </div>

            <Card className="shadow-lg border-primary/20">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5 text-yellow-500" /> Leaderboard Activo ({leaderboard.length})</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {leaderboard.map((userItem, index) => (
                            <div key={userItem.id} className="p-4 border rounded-xl flex flex-col gap-3 bg-card shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-start justify-between">
                                    <div className="overflow-hidden">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-muted-foreground">#{index + 1}</span>
                                            <h3 className="font-bold text-lg leading-tight truncate" title={userItem.displayName}>
                                                {userItem.displayName || 'Anónimo'}
                                            </h3>
                                        </div>
                                        <p className="text-[10px] text-muted-foreground font-mono mt-1 truncate" title={userItem.id}>{userItem.id}</p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <div className="font-black text-primary text-xl">{userItem.totalScore} <span className="text-xs font-normal">pts</span></div>
                                        <div className="text-[10px] text-muted-foreground font-semibold">Max: {userItem.bestScore}</div>
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-auto pt-2 border-t">
                                    <Button variant="secondary" size="sm" className="flex-1 text-xs h-8" onClick={() => handleOpenEdit(userItem)}>
                                        <Edit2 className="h-3 w-3 mr-1" /> Nombrar
                                    </Button>
                                    <Button variant="destructive" size="icon" className="h-8 w-8 flex-shrink-0" onClick={() => handleRemoveFromPodium(userItem.id)} title="Eliminar del podio">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                    {leaderboard.length === 0 && (
                        <div className="text-center py-12 border border-dashed rounded-xl text-muted-foreground bg-muted/20">
                            <Trophy className="h-8 w-8 mx-auto mb-2 opacity-20" />
                            <p>No hay jugadores en el leaderboard aún.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={!!editTarget} onOpenChange={(open) => !open && setEditTarget(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Editar Nombre de Usuario</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">ID: {editTarget?.id}</Label>
                            <Input
                                value={newName}
                                onChange={e => setNewName(e.target.value)}
                                placeholder="Nuevo nombre público"
                                maxLength={25}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditTarget(null)}>Cancelar</Button>
                        <Button onClick={handleSaveName} disabled={isSaving || !newName.trim()}>
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Guardar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </main>
    );
}
