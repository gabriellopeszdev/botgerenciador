import 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
    interface Session {
        user: {
            id:    string;
            name?: string | null;
            role:  'SUPER_ADMIN' | 'ADMIN' | 'USER';
        };
    }

    interface User {
        id:   string;
        name: string;
        role: 'SUPER_ADMIN' | 'ADMIN' | 'USER';
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        uid?:  string;
        role?: 'SUPER_ADMIN' | 'ADMIN' | 'USER';
    }
}
