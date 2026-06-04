import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth/options';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ ok: false }, { status: 401 });
    }
    // Retorna o socket-secret (diferente do INTERNAL_API_SECRET usado para HTTP).
    // Se SOCKET_SECRET não estiver definido, deriva do segredo interno com sufixo
    // idêntico ao que o backend usa, garantindo compatibilidade sem expor o secret HTTP.
    const socketSecret =
        process.env.SOCKET_SECRET ||
        ((process.env.INTERNAL_API_SECRET ?? '') + ':ws');
    return NextResponse.json({
        token:  socketSecret,
        role:   session.user.role,
        userId: session.user.id,
    });
}
