'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthProvider';
import { AuthModal } from '@/components/auth/AuthModal';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, LogOut, Trophy, LogIn, Loader2 } from 'lucide-react';
import Link from 'next/link';

export function UserMenu() {
    const { user, loading, signOut } = useAuth();
    const [authModalOpen, setAuthModalOpen] = useState(false);
    const [defaultTab, setDefaultTab] = useState<'login' | 'register'>('login');
    const [signingOut, setSigningOut] = useState(false);

    if (loading) {
        return (
            <div className="h-9 w-9 flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
        );
    }

    const handleSignOut = async () => {
        setSigningOut(true);
        try {
            await signOut();
        } finally {
            setSigningOut(false);
        }
    };

    const openLogin = () => {
        setDefaultTab('login');
        setAuthModalOpen(true);
    };

    const openRegister = () => {
        setDefaultTab('register');
        setAuthModalOpen(true);
    };

    // Iniciales del displayName para el avatar
    const initials = user?.displayName
        ? user.displayName.slice(0, 2).toUpperCase()
        : 'AN';

    if (!user) {
        return (
            <>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={openLogin}
                    className="gap-2"
                    id="user-menu-login-btn"
                >
                    <LogIn className="h-4 w-4" />
                    <span className="hidden sm:inline">Iniciar sesión</span>
                </Button>
                <AuthModal
                    open={authModalOpen}
                    onOpenChange={setAuthModalOpen}
                    defaultTab={defaultTab}
                />
            </>
        );
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0" id="user-menu-trigger">
                        <Avatar className="h-9 w-9">
                            <AvatarImage src={user.photoURL ?? undefined} alt={user.displayName ?? 'User'} />
                            <AvatarFallback className="bg-primary/20 text-primary font-bold text-sm">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-semibold leading-none truncate">
                                {user.displayName ?? 'Usuario'}
                            </p>
                            <p className="text-xs leading-none text-muted-foreground truncate">
                                {user.email}
                            </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild className="cursor-pointer">
                        <Link href="/profile" className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Mi perfil
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer">
                        <Link href="/leaderboard" className="flex items-center gap-2">
                            <Trophy className="h-4 w-4 text-yellow-500" />
                            Clasificación
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                        onClick={handleSignOut}
                        disabled={signingOut}
                        className="cursor-pointer text-destructive focus:text-destructive"
                    >
                        {signingOut ? (
                            <Loader2 className="h-4 w-4 animate-spin me-2" />
                        ) : (
                            <LogOut className="h-4 w-4 me-2" />
                        )}
                        Cerrar sesión
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <AuthModal
                open={authModalOpen}
                onOpenChange={setAuthModalOpen}
                defaultTab={defaultTab}
            />
        </>
    );
}
