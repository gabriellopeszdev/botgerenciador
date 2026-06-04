'use client';
import { SessionProvider, signIn, signOut, useSession } from 'next-auth/react';
import { createContext, useCallback, useContext, useEffect, type ReactNode } from 'react';
import { SocketManager } from '@/core/socket/SocketManager';

type Role = 'SUPER_ADMIN' | 'ADMIN' | 'USER';

interface AuthContextValue {
    isAuthenticated: boolean;
    isLoading:       boolean;
    user:            { id: string; name: string; role: Role } | null;
    isAdmin:         boolean;
    isSuperAdmin:    boolean;
    login:           (username: string, password: string) => Promise<void>;
    logout:          () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function AuthBridge({ children }: { children: ReactNode }) {
    const { data: session, status } = useSession();
    const socket = SocketManager.getInstance();

    useEffect(() => {
        if (status === 'authenticated') {
            socket.connect().catch(() => {});
        } else if (status === 'unauthenticated') {
            socket.disconnect();
        }
    }, [status]);

    const login = useCallback(async (username: string, password: string) => {
        const res = await signIn('credentials', { username, password, redirect: false });
        if (res?.error || !res?.ok) throw new Error('Credenciais inválidas');
    }, []);

    const logout = useCallback(async () => {
        socket.disconnect();
        await signOut({ callbackUrl: '/login' });
    }, []);

    const user = session?.user
        ? { id: session.user.id, name: session.user.name ?? '', role: session.user.role }
        : null;

    return (
        <AuthContext.Provider value={{
            isAuthenticated: status === 'authenticated',
            isLoading:       status === 'loading',
            user,
            isAdmin:         user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN',
            isSuperAdmin:    user?.role === 'SUPER_ADMIN',
            login,
            logout,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function AuthProvider({ children }: { children: ReactNode }) {
    return (
        <SessionProvider>
            <AuthBridge>{children}</AuthBridge>
        </SessionProvider>
    );
}

const AUTH_DEFAULTS: AuthContextValue = {
    isAuthenticated: false,
    isLoading:       true,
    user:            null,
    isAdmin:         false,
    isSuperAdmin:    false,
    login:           async () => { throw new Error('AuthProvider not ready'); },
    logout:          async () => {},
};

export function useAuth(): AuthContextValue {
    return useContext(AuthContext) ?? AUTH_DEFAULTS;
}
