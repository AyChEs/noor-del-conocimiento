'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth, getAuthErrorMessage } from '@/context/AuthProvider';
import { Loader2, Mail, Lock, User, Chrome } from 'lucide-react';

// ─── Schemas ─────────────────────────────────────────────────────────────────

const loginSchema = z.object({
    email: z.string().email('Email no válido'),
    password: z.string().min(6, 'Mínimo 6 caracteres'),
});

const registerSchema = z.object({
    displayName: z.string().min(2, 'Mínimo 2 caracteres').max(30, 'Máximo 30 caracteres'),
    email: z.string().email('Email no válido'),
    password: z.string().min(6, 'Mínimo 6 caracteres'),
    confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
});

type LoginForm = z.infer<typeof loginSchema>;
type RegisterForm = z.infer<typeof registerSchema>;

// ─── Props ────────────────────────────────────────────────────────────────────

interface AuthModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    defaultTab?: 'login' | 'register';
}

// ─── Google Button ────────────────────────────────────────────────────────────

function GoogleButton({ onSuccess }: { onSuccess: () => void }) {
    const { signInWithGoogle } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleClick = async () => {
        setLoading(true);
        setError('');
        try {
            await signInWithGoogle();
            onSuccess();
        } catch (e) {
            setError(getAuthErrorMessage(e));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-2">
            <Button
                variant="outline"
                className="w-full h-12 gap-3 text-base"
                onClick={handleClick}
                disabled={loading}
                type="button"
            >
                {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <Chrome className="w-5 h-5 text-blue-500" />
                )}
                Continuar con Google
            </Button>
            {error && <p className="text-sm text-destructive text-center">{error}</p>}
        </div>
    );
}

// ─── Login Tab ────────────────────────────────────────────────────────────────

function LoginTab({ onSuccess }: { onSuccess: () => void }) {
    const { signIn } = useAuth();
    const [authError, setAuthError] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

    const onSubmit = async (data: LoginForm) => {
        setAuthError('');
        try {
            await signIn(data.email, data.password);
            onSuccess();
        } catch (e) {
            setAuthError(getAuthErrorMessage(e));
        }
    };

    return (
        <div className="space-y-4">
            <GoogleButton onSuccess={onSuccess} />

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">o con email</span>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-1">
                    <Label htmlFor="login-email">Email</Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="login-email"
                            type="email"
                            placeholder="tu@email.com"
                            className="pl-10"
                            {...register('email')}
                        />
                    </div>
                    {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                </div>

                <div className="space-y-1">
                    <Label htmlFor="login-password">Contraseña</Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="login-password"
                            type="password"
                            placeholder="••••••"
                            className="pl-10"
                            {...register('password')}
                        />
                    </div>
                    {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
                </div>

                {authError && (
                    <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                        <p className="text-sm text-destructive text-center">{authError}</p>
                    </div>
                )}

                <Button type="submit" className="w-full h-12 text-base" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin me-2" /> : null}
                    Iniciar sesión
                </Button>
            </form>
        </div>
    );
}

// ─── Register Tab ─────────────────────────────────────────────────────────────

function RegisterTab({ onSuccess }: { onSuccess: () => void }) {
    const { signUp } = useAuth();
    const [authError, setAuthError] = useState('');

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

    const onSubmit = async (data: RegisterForm) => {
        setAuthError('');
        try {
            await signUp(data.email, data.password, data.displayName);
            onSuccess();
        } catch (e) {
            setAuthError(getAuthErrorMessage(e));
        }
    };

    return (
        <div className="space-y-4">
            <GoogleButton onSuccess={onSuccess} />

            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">o con email</span>
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                <div className="space-y-1">
                    <Label htmlFor="reg-name">Nombre de usuario</Label>
                    <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="reg-name"
                            placeholder="Tu nombre"
                            className="pl-10"
                            {...register('displayName')}
                        />
                    </div>
                    {errors.displayName && (
                        <p className="text-xs text-destructive">{errors.displayName.message}</p>
                    )}
                </div>

                <div className="space-y-1">
                    <Label htmlFor="reg-email">Email</Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="reg-email"
                            type="email"
                            placeholder="tu@email.com"
                            className="pl-10"
                            {...register('email')}
                        />
                    </div>
                    {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
                </div>

                <div className="space-y-1">
                    <Label htmlFor="reg-password">Contraseña</Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="reg-password"
                            type="password"
                            placeholder="••••••"
                            className="pl-10"
                            {...register('password')}
                        />
                    </div>
                    {errors.password && (
                        <p className="text-xs text-destructive">{errors.password.message}</p>
                    )}
                </div>

                <div className="space-y-1">
                    <Label htmlFor="reg-confirm">Confirmar contraseña</Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                            id="reg-confirm"
                            type="password"
                            placeholder="••••••"
                            className="pl-10"
                            {...register('confirmPassword')}
                        />
                    </div>
                    {errors.confirmPassword && (
                        <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>
                    )}
                </div>

                {authError && (
                    <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                        <p className="text-sm text-destructive text-center">{authError}</p>
                    </div>
                )}

                <Button type="submit" className="w-full h-12 text-base" disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin me-2" /> : null}
                    Crear cuenta
                </Button>
            </form>
        </div>
    );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

export function AuthModal({ open, onOpenChange, defaultTab = 'login' }: AuthModalProps) {
    const handleSuccess = () => onOpenChange(false);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-center text-2xl font-headline">
                        Noor del Conocimiento
                    </DialogTitle>
                </DialogHeader>

                <Tabs defaultValue={defaultTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="login">Iniciar sesión</TabsTrigger>
                        <TabsTrigger value="register">Registrarse</TabsTrigger>
                    </TabsList>
                    <TabsContent value="login" className="mt-4">
                        <LoginTab onSuccess={handleSuccess} />
                    </TabsContent>
                    <TabsContent value="register" className="mt-4">
                        <RegisterTab onSuccess={handleSuccess} />
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
