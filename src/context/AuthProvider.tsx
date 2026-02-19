'use client';

import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    type ReactNode,
} from 'react';
import {
    type User,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    updateProfile,
    AuthError,
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { createUserProfile } from '@/lib/firestore';

// ─── Context Type ─────────────────────────────────────────────────────────────

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signInWithGoogle: () => Promise<void>;
    signUp: (email: string, password: string, displayName: string) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// ─── Error Helpers ────────────────────────────────────────────────────────────

/**
 * Convierte códigos de error de Firebase en mensajes amigables.
 * Mantenemos solo los más comunes para no inflar el bundle.
 */
export function getAuthErrorMessage(error: unknown): string {
    const code = (error as AuthError)?.code ?? '';
    const messages: Record<string, string> = {
        'auth/email-already-in-use': 'Este email ya está registrado.',
        'auth/invalid-email': 'El email no es válido.',
        'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
        'auth/user-not-found': 'No existe una cuenta con este email.',
        'auth/wrong-password': 'Contraseña incorrecta.',
        'auth/invalid-credential': 'Email o contraseña incorrectos.',
        'auth/too-many-requests': 'Demasiados intentos. Espera un momento.',
        'auth/network-request-failed': 'Error de conexión. Comprueba tu internet.',
        'auth/popup-closed-by-user': 'Inicio de sesión cancelado.',
    };
    return messages[code] ?? 'Ha ocurrido un error. Inténtalo de nuevo.';
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, currentUser => {
            setUser(currentUser);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const signIn = useCallback(async (email: string, password: string) => {
        await signInWithEmailAndPassword(auth, email, password);
    }, []);

    const signInWithGoogle = useCallback(async () => {
        const result = await signInWithPopup(auth, googleProvider);
        // Crear perfil en Firestore si es la primera vez
        const u = result.user;
        await createUserProfile(u.uid, u.displayName ?? 'Usuario', u.email ?? '');
    }, []);

    const signUp = useCallback(
        async (email: string, password: string, displayName: string) => {
            const result = await createUserWithEmailAndPassword(auth, email, password);
            // Actualizar displayName en Firebase Auth
            await updateProfile(result.user, { displayName });
            // Crear perfil en Firestore
            await createUserProfile(result.user.uid, displayName, email);
        },
        []
    );

    const signOut = useCallback(async () => {
        await firebaseSignOut(auth);
    }, []);

    return (
        <AuthContext.Provider value={{ user, loading, signIn, signInWithGoogle, signUp, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextType {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
    return ctx;
}
