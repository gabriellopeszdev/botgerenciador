import type { NextAuthOptions } from 'next-auth';
import type { JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';

export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'USER';

const API_URL         = process.env.API_URL          || 'http://localhost:3000';
const ROLE_TTL_MS     = 5 * 60 * 1000; // revalida role no banco a cada 5 minutos

export const authOptions: NextAuthOptions = {
    session: { strategy: 'jwt', maxAge: 60 * 60 * 8 },
    pages:   { signIn: '/login' },
    providers: [
        CredentialsProvider({
            name: 'Credenciais',
            credentials: {
                username: { label: 'Usuário', type: 'text' },
                password: { label: 'Senha',   type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials.password) return null;
                try {
                    const res = await fetch(`${API_URL}/api/auth/verify-credentials`, {
                        method:  'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body:    JSON.stringify(credentials),
                        cache:   'no-store',
                    });
                    if (!res.ok) return null;
                    const user = await res.json() as { id: string; username: string; role: Role };
                    return { id: user.id, name: user.username, role: user.role };
                } catch {
                    return null;
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.role           = (user as { role: Role }).role;
                token.uid            = (user as { id: string }).id;
                token.roleRefreshedAt = Date.now();
            }

            // Revalida a role no banco a cada 5 minutos para garantir que
            // mudanças de permissão feitas pelo admin entrem em vigor rapidamente.
            const refreshedAt = (token as JWT & { roleRefreshedAt?: number }).roleRefreshedAt ?? 0;
            if (token.uid && Date.now() - refreshedAt > ROLE_TTL_MS) {
                try {
                    const res = await fetch(`${API_URL}/api/users/me`, {
                        headers: {
                            'x-internal-secret': process.env.INTERNAL_API_SECRET ?? '',
                            'x-user-id':         token.uid as string,
                        },
                        cache: 'no-store',
                    });
                    if (res.ok) {
                        const data = await res.json() as { role: Role };
                        token.role           = data.role;
                        token.roleRefreshedAt = Date.now();
                    }
                } catch {
                    // Ignora falha temporária — mantém a role cacheada
                }
            }

            return token;
        },
        async session({ session, token }) {
            session.user = {
                ...session.user,
                id:   (token as JWT & { uid?: string }).uid ?? '',
                role: (token as JWT & { role?: Role }).role ?? 'USER',
            } as typeof session.user & { id: string; role: Role };
            return session;
        },
    },
};
