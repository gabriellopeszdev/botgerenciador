import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth/options';

const API_URL         = process.env.API_URL || 'http://localhost:3000';
const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET;

async function proxy(req: NextRequest, ctx: { params: Promise<{ path: string[] }> }) {
    if (!INTERNAL_SECRET) {
        return NextResponse.json({ ok: false, error: 'Configuração inválida do servidor.' }, { status: 503 });
    }
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ ok: false, error: 'Não autenticado.' }, { status: 401 });
    }

    const { path } = await ctx.params;
    const target   = new URL(`/api/${path.join('/')}`, API_URL);
    target.search  = req.nextUrl.search;

    const headers = new Headers();
    const ct = req.headers.get('content-type');
    if (ct) headers.set('content-type', ct);
    headers.set('x-internal-secret', INTERNAL_SECRET);
    headers.set('x-user-role',       session.user.role);
    headers.set('x-user-id',         session.user.id);
    if (session.user.name) headers.set('x-user-name', session.user.name);
    const fwd = req.headers.get('x-forwarded-for');
    if (fwd) headers.set('x-forwarded-for', fwd);

    const init: RequestInit = {
        method: req.method,
        headers,
        cache:  'no-store',
    };

    if (!['GET', 'HEAD'].includes(req.method)) {
        init.body = await req.arrayBuffer();
    }

    const upstream = await fetch(target, init);
    const body     = await upstream.arrayBuffer();
    return new NextResponse(body, {
        status:  upstream.status,
        headers: { 'content-type': upstream.headers.get('content-type') ?? 'application/json' },
    });
}

export const GET    = proxy;
export const POST   = proxy;
export const PUT    = proxy;
export const PATCH  = proxy;
export const DELETE = proxy;

export const dynamic = 'force-dynamic';
