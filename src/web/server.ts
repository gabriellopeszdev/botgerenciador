import express, { Request, Response, NextFunction } from 'express';
import corsMiddleware from 'cors';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import os from 'os';
import { manager } from '../manager.js';
import { emitter } from './emitter.js';
import { botRepo, tokenRepo, logRepo, roomRepo, userRepo, auditRepo } from '../repositories/index.js';
import { prisma } from '../db/prisma.js';
import { getCpuUsagePercent } from '../system.js';
import { logger } from '../lib/logger.js';
import { HaxballTokenFetcher } from '../lib/HaxballTokenFetcher.js';
import type { IStatusMessage, RoomSnapshot } from '../types.js';
import type { EmbedBuilder } from 'discord.js';
import type { AuditAction } from '@prisma/client';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(__dirname, '../../public');

// Instância global do Socket.io — exportada para uso no auto-restart do index.ts
let _io: SocketIOServer | null = null;
export function getIO(): SocketIOServer | null { return _io; }

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toSnapshot(s: ReturnType<typeof manager.listar>[number]): RoomSnapshot {
    return {
        pageId:        s.pageId,
        dbId:          s.dbId,
        name:          s.name,
        url:           s.url,
        botFile:       s.botFile,
        channelId:     s.channelId,
        startedAt:     s.startedAt.toISOString(),
        uptimeSeconds: Math.floor((Date.now() - s.startedAt.getTime()) / 1000),
        playerCount:   s.playerCount,
        avgPing:       s.avgPing,
        ownerId:       botOwnerCache.get(s.botFile) ?? null,
    };
}

// Cache simples de scriptName → ownerId, populado on-demand. Refresh chamado
// quando o owner de um bot muda.
const botOwnerCache = new Map<string, string | null>();

async function refreshBotOwnerCache(): Promise<void> {
    const all = await botRepo.findAll();
    botOwnerCache.clear();
    for (const b of all) botOwnerCache.set(b.scriptName, b.ownerId ?? null);
}

// ─── Cache de progresso de abertura de sala ──────────────────────────────────
// Guarda o último update por requestId por até 10 minutos.
// Permite que o frontend faça polling se perder o evento socket.
interface RoomOpenCacheEntry {
    requestId:   string;
    title:       string;
    description: string;
    color?:      number;
    error?:      boolean;
    updatedAt:   number;
}
const ROOM_OPEN_TTL = 10 * 60 * 1000; // 10 min
const roomOpenCache = new Map<string, RoomOpenCacheEntry>();

function pruneRoomOpenCache(): void {
    const now = Date.now();
    for (const [key, entry] of roomOpenCache) {
        if (now - entry.updatedAt > ROOM_OPEN_TTL) roomOpenCache.delete(key);
    }
}
setInterval(pruneRoomOpenCache, 60_000);

// ─── WebStatusMessage ──────────────────────────────────────────────────────────
// Implementa IStatusMessage para ser passado ao createPage pelo painel web.
// Em vez de editar mensagens Discord, emite eventos Socket.io E salva no cache.

export class WebStatusMessage implements IStatusMessage {
    constructor(
        private readonly io: SocketIOServer,
        public readonly requestId: string,
    ) {}

    async edit(payload: { content?: string; embeds?: any[]; files?: any[] }): Promise<any> {
        const embed = payload.embeds?.[0] as Partial<EmbedBuilder['data']> | undefined;
        const update: RoomOpenCacheEntry = {
            requestId:   this.requestId,
            title:       (embed as any)?.data?.title       ?? (embed as any)?.title       ?? '',
            description: (embed as any)?.data?.description ?? (embed as any)?.description ?? '',
            color:       (embed as any)?.data?.color       ?? (embed as any)?.color,
            updatedAt:   Date.now(),
        };
        roomOpenCache.set(this.requestId, update);
        this.io.emit('room:open:update', update);
        return this;
    }
}

// ─── Middleware: shared-secret entre web/ e Express ────────────────────────────
// O painel Next.js valida a sessão NextAuth e, ao proxiar para Express,
// injeta o header `x-internal-secret`. Express só confia nessa fonte.

function makeAuthMiddleware(secret: string) {
    return function requireInternal(req: Request, res: Response, next: NextFunction): void {
        if (req.header('x-internal-secret') === secret) return next();
        res.status(401).json({ ok: false, error: 'Não autenticado.' });
    };
}

// ─── Role guard: extrai role do header opcional `x-user-role` ───────────────────

type AppRole = 'SUPER_ADMIN' | 'ADMIN' | 'USER';

function isAdmin(role: string | undefined): boolean {
    return role === 'ADMIN' || role === 'SUPER_ADMIN';
}

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
    if (isAdmin(req.header('x-user-role'))) return next();
    res.status(403).json({ ok: false, error: 'Apenas administradores.' });
}

// ─── Helpers de identidade do ator + IP ─────────────────────────────────────────

function actor(req: Request): { actorId: string | null; actorName: string | null; ip: string | null } {
    return {
        actorId:   req.header('x-user-id')   ?? null,
        actorName: req.header('x-user-name') ?? null,
        ip:        (req.header('x-forwarded-for')?.split(',')[0]?.trim()) ?? req.ip ?? null,
    };
}

function audit(req: Request, action: AuditAction, opts: { targetId?: string | null; details?: string | null } = {}): void {
    const { actorId, actorName, ip } = actor(req);
    void auditRepo.log({ action, actorId, actorName, targetId: opts.targetId ?? null, details: opts.details ?? null, ip });
}

// ─── startWebServer ────────────────────────────────────────────────────────────

export function startWebServer(
    createPage: (token: string, statusMsg: IStatusMessage, botFileName: string, channelId: string) => Promise<void>,
): void {
    const PORT            = parseInt(process.env.WEB_PORT || '3000');
    const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET;

    if (!INTERNAL_SECRET) {
        logger.warn('INTERNAL_API_SECRET não definido — painel web desabilitado. Defina no .env para ativar.');
        return;
    }

    const frontendOrigin = process.env.WEB_FRONTEND_ORIGIN || 'http://localhost:3001';
    const requireAuth    = makeAuthMiddleware(INTERNAL_SECRET);
    // Secret exclusivo para Socket.io — diferente do secret HTTP para evitar que
    // usuários com acesso ao socket possam forjar chamadas à API REST diretamente.
    const SOCKET_SECRET  = process.env.SOCKET_SECRET || (INTERNAL_SECRET + ':ws');

    // Inicializa o cache de owners (best-effort).
    refreshBotOwnerCache().catch(() => {});

    const app  = express();
    const http = createServer(app);
    const io   = new SocketIOServer(http, {
        cors: { origin: frontendOrigin, credentials: true },
    });
    _io = io; // expõe para uso externo (ex: auto-restart sem canal Discord)

    app.use(corsMiddleware({ origin: frontendOrigin, credentials: true }));
    app.use(express.json({ limit: '5mb' })); // scripts grandes
    app.use(express.static(PUBLIC_DIR));

    // ── Socket.io: valida o socket-secret e busca role do banco ─────────────
    // A role jamais é aceita do cliente — sempre buscada do banco para evitar
    // que qualquer usuário autenticado declare uma role arbitrária.
    io.use(async (socket, next) => {
        const auth = socket.handshake.auth as
            | { token?: string; userId?: string }
            | undefined;
        if (auth?.token !== SOCKET_SECRET) return next(new Error('Não autenticado'));
        const userId = auth.userId ?? '';
        if (!userId) {
            socket.data.userId = '';
            socket.data.role   = 'USER' as AppRole;
            return next();
        }
        try {
            const user = await userRepo.findById(userId);
            socket.data.userId = userId;
            socket.data.role   = (user?.role ?? 'USER') as AppRole;
        } catch {
            socket.data.userId = userId;
            socket.data.role   = 'USER' as AppRole;
        }
        return next();
    });

    // Helpers de escopo: admin/super_admin vê tudo; user vê só os seus.
    function emitRoom(event: string, snap: RoomSnapshot, ownerId: string | null) {
        io.to('role:ADMIN').emit(event, snap);
        io.to('role:SUPER_ADMIN').emit(event, snap);
        if (ownerId) io.to(`user:${ownerId}`).emit(event, snap);
    }
    function emitForOwner(event: string, ownerId: string | null, payload: unknown) {
        io.to('role:ADMIN').emit(event, payload);
        io.to('role:SUPER_ADMIN').emit(event, payload);
        if (ownerId) io.to(`user:${ownerId}`).emit(event, payload);
    }

    // ── Encaminha eventos do emitter respeitando ownership ────────────────────
    emitter.on('room:added',   (snap: RoomSnapshot) => emitRoom('room:added',   snap, snap.ownerId ?? botOwnerCache.get(snap.botFile) ?? null));
    emitter.on('room:removed', (data: { pageId: string } & Record<string, unknown>) => {
        const sala = manager.buscarPorId(data.pageId);
        const owner = sala ? (botOwnerCache.get(sala.botFile) ?? null) : null;
        emitForOwner('room:removed', owner, data);
    });
    emitter.on('room:metrics', (data: { pageId: string } & Record<string, unknown>) => {
        const sala = manager.buscarPorId(data.pageId);
        const owner = sala ? (botOwnerCache.get(sala.botFile) ?? null) : null;
        emitForOwner('room:metrics', owner, data);
    });
    // Server metrics são apenas para admin.
    emitter.on('server:metrics', (data: object) => {
        io.to('role:ADMIN').emit('server:metrics', data);
        io.to('role:SUPER_ADMIN').emit('server:metrics', data);
    });
    emitter.on('log:entry', (data: { roomId?: string } & Record<string, unknown>) => {
        io.to('role:ADMIN').emit('log:entry', data);
        io.to('role:SUPER_ADMIN').emit('log:entry', data);
        // Também emite para o dono do bot daquela sala, se houver
        if (data.roomId) {
            const sala = manager.listar().find(s => s.dbId === data.roomId);
            if (sala) {
                const ownerId = botOwnerCache.get(sala.botFile);
                if (ownerId) io.to(`user:${ownerId}`).emit('log:entry', data);
            }
        }
    });

    io.on('connection', (socket) => {
        const role   = socket.data.role   as AppRole;
        const userId = socket.data.userId as string;
        socket.join(`role:${role}`);
        if (userId) socket.join(`user:${userId}`);

        let salas = manager.listar().map(toSnapshot);
        if (!isAdmin(role)) salas = salas.filter(s => s.ownerId === userId);
        socket.emit('rooms:snapshot', salas);
    });

    // ═══ Rotas REST ═══════════════════════════════════════════════════════════

    // ── Health check (aberto, leve) ───────────────────────────────────────────
    app.get('/api/health', async (_req, res) => {
        const startedAt = Date.now();
        let dbOk = true;
        try { await prisma.$queryRaw`SELECT 1`; }
        catch { dbOk = false; }
        res.status(dbOk ? 200 : 503).json({
            ok:           dbOk,
            db:           dbOk,
            roomsOnline:  manager.listar().length,
            uptimeSec:    Math.floor(process.uptime()),
            checkMs:      Date.now() - startedAt,
            timestamp:    new Date().toISOString(),
        });
    });

    // ── Auth (aberto, com rate-limit anti brute-force) ────────────────────────
    const loginLimiter = rateLimit({
        windowMs:        15 * 60 * 1000, // 15 min
        max:             10,             // 10 tentativas por IP por janela
        standardHeaders: true,
        legacyHeaders:   false,
        message:         { ok: false, error: 'Muitas tentativas. Tente novamente em alguns minutos.' },
    });

    app.post('/api/auth/verify-credentials', loginLimiter, async (req, res) => {
        const { username, password } = req.body as { username?: string; password?: string };
        const ip = (req.header('x-forwarded-for')?.split(',')[0]?.trim()) ?? req.ip ?? null;

        if (!username || !password) {
            res.status(400).json({ ok: false, error: 'username e password são obrigatórios.' });
            return;
        }
        const user = await userRepo.verifyCredentials(username, password);
        if (!user) {
            void auditRepo.log({ action: 'USER_LOGIN_FAIL', actorName: username, ip });
            res.status(401).json({ ok: false, error: 'Credenciais inválidas.' });
            return;
        }
        void auditRepo.log({ action: 'USER_LOGIN', actorId: user.id, actorName: user.username, ip });
        res.json({ id: user.id, username: user.username, role: user.role });
    });

    // ── Salas ─────────────────────────────────────────────────────────────────
    app.get('/api/rooms', requireAuth, (req, res) => {
        const role   = req.header('x-user-role');
        const userId = req.header('x-user-id');
        let snaps    = manager.listar().map(toSnapshot);
        if (!isAdmin(role)) snaps = snaps.filter(s => s.ownerId === userId);
        res.json(snaps);
    });

    app.post('/api/rooms/open', requireAuth, requireAdmin, async (req, res) => {
        const { botFile, tokenId, channelId = process.env.DEFAULT_CHANNEL_ID ?? '' } = req.body as {
            botFile: string; tokenId: string; channelId?: string;
        };

        if (!botFile || !tokenId) {
            res.status(400).json({ ok: false, error: 'botFile e tokenId são obrigatórios.' });
            return;
        }

        const tokenRecord = await tokenRepo.findById(tokenId);
        if (!tokenRecord) {
            res.status(404).json({ ok: false, error: 'Token não encontrado.' });
            return;
        }
        if (tokenRecord.status !== 'AVAILABLE') {
            res.status(409).json({ ok: false, error: `Token indisponível (status: ${tokenRecord.status}).` });
            return;
        }
        const token = tokenRecord.value;
        if (manager.isTokenInUse(token)) {
            res.status(409).json({ ok: false, error: 'Token já está em uso por outra sala.' });
            return;
        }

        const requestId = randomUUID();
        const statusMsg = new WebStatusMessage(io, requestId);

        createPage(token, statusMsg, botFile, channelId).catch((err: Error) => {
            const errUpdate: RoomOpenCacheEntry = {
                requestId, title: '💥 Erro ao Abrir Sala',
                description: err.message, error: true, updatedAt: Date.now(),
            };
            roomOpenCache.set(requestId, errUpdate);
            io.emit('room:open:update', errUpdate);
        });

        audit(req, 'ROOM_OPEN', { targetId: tokenId, details: `bot=${botFile}` });
        res.status(202).json({ ok: true, requestId });
    });

    // Polling fallback: retorna o último update em cache para um requestId
    app.get('/api/rooms/open/status/:requestId', requireAuth, (req, res) => {
        const entry = roomOpenCache.get(String(req.params.requestId));
        if (!entry) { res.status(404).json({ ok: false }); return; }
        res.json({ ok: true, update: entry });
    });

    app.post('/api/rooms/:pageId/close', requireAuth, requireAdmin, async (req, res) => {
        const sala = manager.buscarPorId(String(req.params.pageId));
        if (!sala) { res.status(404).json({ ok: false, error: 'Sala não encontrada.' }); return; }
        sala.manualClose = true;
        await sala.page.close().catch(() => {});
        audit(req, 'ROOM_CLOSE', { targetId: sala.pageId, details: `room=${sala.name}` });
        res.json({ ok: true });
    });

    app.post('/api/rooms/:pageId/reload', requireAuth, requireAdmin, async (req, res) => {
        const sala = manager.buscarPorId(String(req.params.pageId));
        if (!sala) { res.status(404).json({ ok: false, error: 'Sala não encontrada.' }); return; }

        const { tokenId } = req.body as { tokenId?: string };

        let reloadToken = sala.token;

        if (tokenId) {
            const tokenRecord = await tokenRepo.findById(tokenId);
            if (!tokenRecord) {
                res.status(404).json({ ok: false, error: 'Token não encontrado.' });
                return;
            }
            if (tokenRecord.status !== 'AVAILABLE' && tokenRecord.id !== sala.tokenDbId) {
                res.status(409).json({ ok: false, error: `Token indisponível (status: ${tokenRecord.status}).` });
                return;
            }
            reloadToken = tokenRecord.value;
        }

        const { botFile, channelId } = sala;
        sala.manualClose = true;
        await sala.page.close().catch(() => {});
        audit(req, 'ROOM_RELOAD', { targetId: sala.pageId, details: `room=${sala.name}` });

        const requestId = randomUUID();
        const statusMsg = new WebStatusMessage(io, requestId);

        setTimeout(() => {
            createPage(reloadToken, statusMsg, botFile, channelId).catch((err: Error) => {
                const errUpdate: RoomOpenCacheEntry = {
                    requestId, title: '💥 Erro ao Recarregar',
                    description: err.message, error: true, updatedAt: Date.now(),
                };
                roomOpenCache.set(requestId, errUpdate);
                io.emit('room:open:update', errUpdate);
            });
        }, 1500);

        res.status(202).json({ ok: true, requestId });
    });

    // Broadcast: envia anúncio estilizado para o chat de todas as salas ativas.
    app.post('/api/rooms/broadcast', requireAuth, requireAdmin, async (req, res) => {
        const { message } = req.body as { message?: string };
        if (!message || !message.trim()) {
            res.status(400).json({ ok: false, error: 'message é obrigatório.' });
            return;
        }
        const salas = manager.listar();
        if (!salas.length) {
            res.status(409).json({ ok: false, error: 'Nenhuma sala ativa no momento.' });
            return;
        }
        const trimmed = message.trim().slice(0, 500);
        let sent = 0;
        await Promise.allSettled(
            salas.map(async (s) => {
                if (s.page.isClosed()) return;
                // Usa sendAnnouncement (igual ao !broadcast do Discord): texto amarelo em negrito
                await s.page.evaluate((msg: string) => {
                    if ((window as any).room?.sendAnnouncement)
                        (window as any).room.sendAnnouncement('[GLOBAL] ' + msg, null, 0xFFEB3B, 'bold', 2);
                }, trimmed).catch(() => {});
                await logRepo.add(s.dbId, 'COMMAND', `[broadcast] ${trimmed}`).catch(() => {});
                sent++;
            })
        );
        audit(req, 'ROOM_OPEN', { details: `broadcast: "${trimmed.slice(0, 80)}" → ${sent} sala(s)` });
        res.json({ ok: true, sent });
    });

    // ── Scripts ───────────────────────────────────────────────────────────────
    app.get('/api/bots', requireAuth, async (_req, res) => {
        const bots = await botRepo.findAllActive();
        res.json(bots.map(b => ({ scriptName: b.scriptName, displayName: b.displayName, description: b.description })));
    });

    // Bots atrelados ao usuário logado (qualquer role).
    app.get('/api/bots/mine', requireAuth, async (req, res) => {
        const userId = req.header('x-user-id');
        if (!userId) { res.status(400).json({ ok: false, error: 'x-user-id ausente.' }); return; }
        const bots = await botRepo.findByOwner(userId);
        res.json(bots.map(b => ({
            scriptName:    b.scriptName,
            displayName:   b.displayName,
            description:   b.description,
            active:        b.active,
            sizeBytes:     Buffer.byteLength(b.scriptContent, 'utf8'),
            updatedAt:     b.updatedAt.toISOString(),
        })));
    });

    // Lista completa (inclui inativos) — admin gerencia tudo
    app.get('/api/bots/all', requireAuth, requireAdmin, async (_req, res) => {
        const bots = await botRepo.findAll();
        res.json(bots.map(b => ({
            scriptName:    b.scriptName,
            displayName:   b.displayName,
            description:   b.description,
            active:        b.active,
            sizeBytes:     Buffer.byteLength(b.scriptContent, 'utf8'),
            updatedAt:     b.updatedAt.toISOString(),
            ownerId:       b.ownerId,
        })));
    });

    // Source: admin sempre; user só se for dono.
    app.get('/api/bots/:scriptName/source', requireAuth, async (req, res) => {
        const bot = await botRepo.findByName(String(req.params.scriptName));
        if (!bot) { res.status(404).json({ ok: false, error: 'Bot não encontrado.' }); return; }
        const role   = req.header('x-user-role');
        const userId = req.header('x-user-id');
        if (!isAdmin(role) && bot.ownerId !== userId) {
            res.status(403).json({ ok: false, error: 'Você não é dono deste bot.' });
            return;
        }
        res.json({
            scriptName:    bot.scriptName,
            displayName:   bot.displayName,
            description:   bot.description,
            active:        bot.active,
            scriptContent: bot.scriptContent,
            ownerId:       bot.ownerId,
        });
    });

    // Update parcial: admin sempre; user só se for dono.
    // Não-admins NÃO podem alterar scriptContent — código executado via new Function().
    app.patch('/api/bots/:scriptName', requireAuth, async (req, res) => {
        const scriptName = String(req.params.scriptName);
        const bot = await botRepo.findByName(scriptName);
        if (!bot) { res.status(404).json({ ok: false, error: 'Bot não encontrado.' }); return; }
        const role   = req.header('x-user-role');
        const userId = req.header('x-user-id');
        if (!isAdmin(role) && bot.ownerId !== userId) {
            res.status(403).json({ ok: false, error: 'Você não é dono deste bot.' });
            return;
        }
        const { displayName, description, scriptContent } = req.body as {
            displayName?: string; description?: string | null; scriptContent?: string;
        };
        if (scriptContent !== undefined && !isAdmin(role)) {
            res.status(403).json({ ok: false, error: 'Apenas administradores podem alterar o código do bot.' });
            return;
        }
        try {
            await botRepo.update(scriptName, { displayName, description, scriptContent });
            audit(req, 'BOT_UPSERT', { targetId: scriptName, details: 'partial-update' });
            res.json({ ok: true });
        } catch (err: any) {
            res.status(500).json({ ok: false, error: err.message });
        }
    });

    app.post('/api/bots', requireAuth, requireAdmin, async (req, res) => {
        const { scriptName, displayName, description, scriptContent, active, ownerId } = req.body as {
            scriptName: string; displayName: string; description?: string;
            scriptContent: string; active?: boolean; ownerId?: string | null;
        };
        if (!scriptName || !displayName || !scriptContent) {
            res.status(400).json({ ok: false, error: 'scriptName, displayName e scriptContent são obrigatórios.' });
            return;
        }
        if (!/^[a-zA-Z0-9_-]+$/.test(scriptName)) {
            res.status(400).json({ ok: false, error: 'scriptName deve conter apenas letras, números, _ ou -.' });
            return;
        }
        try {
            const saved = await botRepo.upsert({
                scriptName, displayName, description, scriptContent, active,
                ownerId: ownerId === '' ? null : ownerId,
            });
            botOwnerCache.set(saved.scriptName, saved.ownerId ?? null);
            audit(req, 'BOT_UPSERT', { targetId: saved.scriptName, details: `display=${displayName}` });
            res.status(201).json({ ok: true, scriptName: saved.scriptName });
        } catch (err: any) {
            res.status(500).json({ ok: false, error: err.message });
        }
    });

    app.patch('/api/bots/:scriptName/owner', requireAuth, requireAdmin, async (req, res) => {
        const { ownerId } = req.body as { ownerId: string | null };
        const next = ownerId === '' ? null : ownerId;
        try {
            await botRepo.setOwner(String(req.params.scriptName), next);
            botOwnerCache.set(String(req.params.scriptName), next);
            audit(req, 'BOT_UPSERT', { targetId: String(req.params.scriptName), details: `owner=${next ?? 'null'}` });
            res.json({ ok: true });
        } catch {
            res.status(404).json({ ok: false, error: 'Bot não encontrado.' });
        }
    });

    app.patch('/api/bots/:scriptName/active', requireAuth, requireAdmin, async (req, res) => {
        const { active } = req.body as { active: boolean };
        try {
            await botRepo.setActive(String(req.params.scriptName), Boolean(active));
            audit(req, 'BOT_TOGGLE_ACTIVE', { targetId: String(req.params.scriptName), details: `active=${active}` });
            res.json({ ok: true });
        } catch {
            res.status(404).json({ ok: false, error: 'Bot não encontrado.' });
        }
    });

    app.delete('/api/bots/:scriptName', requireAuth, requireAdmin, async (req, res) => {
        const name = String(req.params.scriptName);
        try {
            await botRepo.delete(name);
            botOwnerCache.delete(name); // invalida cache imediatamente
            audit(req, 'BOT_DELETE', { targetId: name });
            res.json({ ok: true });
        } catch {
            res.status(404).json({ ok: false, error: 'Bot não encontrado.' });
        }
    });

    // ── Tokens ────────────────────────────────────────────────────────────────
    app.get('/api/tokens', requireAuth, async (req, res) => {
        const role   = req.header('x-user-role');
        const userId = req.header('x-user-id');
        const all    = await tokenRepo.listAll();
        const tokens = isAdmin(role) ? all : all.filter(t => t.ownerId === userId);
        res.json(tokens.map(t => ({
            id:          t.id,
            valueMasked: t.value.length > 8 ? `${t.value.slice(0, 4)}••••${t.value.slice(-4)}` : '••••••••',
            status:      t.status,
            lastUsedAt:  t.lastUsedAt?.toISOString() ?? null,
            ownerId:     t.ownerId ?? null,
        })));
    });

    app.post('/api/tokens', requireAuth, requireAdmin, async (req, res) => {
        const { value, ownerId } = req.body as { value: string; ownerId?: string | null };
        if (!value) { res.status(400).json({ ok: false, error: 'Token não informado.' }); return; }
        try {
            const created = await tokenRepo.register(value, ownerId === '' ? null : ownerId ?? null);
            audit(req, 'TOKEN_CREATE', { targetId: created.id, details: ownerId ? `owner=${ownerId}` : null });
            res.status(201).json({ ok: true });
        } catch (err: any) {
            res.status(409).json({ ok: false, error: err.message });
        }
    });

    app.post('/api/tokens/auto-generate', requireAuth, requireAdmin, async (req, res) => {
        const { ownerId } = req.body as { ownerId?: string | null };
        try {
            const fetcher = new HaxballTokenFetcher();
            const value   = await fetcher.fetch();
            const created = await tokenRepo.register(value, ownerId === '' ? null : ownerId ?? null);
            audit(req, 'TOKEN_CREATE', { targetId: created.id, details: 'auto-generated via stealth' });
            res.status(201).json({ ok: true, tokenId: created.id });
        } catch (err: any) {
            logger.error(`auto-generate token falhou: ${err.message}`);
            res.status(500).json({ ok: false, error: err.message ?? 'Erro ao gerar token.' });
        }
    });

    app.patch('/api/tokens/:id/owner', requireAuth, requireAdmin, async (req, res) => {
        const { ownerId } = req.body as { ownerId: string | null };
        try {
            await tokenRepo.setOwner(String(req.params.id), ownerId === '' ? null : ownerId);
            audit(req, 'TOKEN_CREATE', { targetId: String(req.params.id), details: `owner=${ownerId ?? 'null'}` });
            res.json({ ok: true });
        } catch {
            res.status(404).json({ ok: false, error: 'Token não encontrado.' });
        }
    });

    app.delete('/api/tokens/:id', requireAuth, async (req, res) => {
        const role   = req.header('x-user-role');
        const userId = req.header('x-user-id');
        const token  = await tokenRepo.findById(String(req.params.id));
        if (!token) { res.status(404).json({ ok: false, error: 'Token não encontrado.' }); return; }
        if (!isAdmin(role) && token.ownerId !== userId) {
            res.status(403).json({ ok: false, error: 'Você não é dono deste token.' });
            return;
        }
        if (token.status === 'IN_USE') {
            res.status(409).json({ ok: false, error: 'Token em uso por sala ativa. Feche a sala primeiro.' });
            return;
        }
        await tokenRepo.markAsExpired(token.id);
        audit(req, 'TOKEN_DELETE', { targetId: token.id });
        res.json({ ok: true });
    });

    // ── Métricas ──────────────────────────────────────────────────────────────
    app.get('/api/metrics', requireAuth, async (_req, res) => {
        const cpu = await getCpuUsagePercent();
        res.json({
            cpu,
            ramMb:       parseFloat(((os.totalmem() - os.freemem()) / 1024 / 1024).toFixed(0)),
            roomsOnline: manager.listar().length,
            botUptime:   Math.floor(process.uptime()),
        });
    });

    app.get('/api/metrics/history', requireAuth, async (req, res) => {
        const limit = Math.min(parseInt(String(req.query.limit ?? '60')), 200);
        const data  = await metricRepo_recent(limit);
        res.json(data);
    });

    // ── Logs ──────────────────────────────────────────────────────────────────
    app.get('/api/rooms/:dbId/logs', requireAuth, async (req, res) => {
        const limit = Math.min(parseInt(String(req.query.limit ?? '50')), 200);
        const logs  = await logRepo.findByRoom(String(req.params.dbId), limit);
        res.json(logs);
    });

    // Logs de todas as salas (admin) — usado pela página de Servidor.
    app.get('/api/logs', requireAuth, requireAdmin, async (req, res) => {
        const limit = Math.min(parseInt(String(req.query.limit ?? '100')), 300);
        const logs  = await logRepo.findRecent(limit);
        res.json(logs);
    });

    // ── Histórico de salas ─────────────────────────────────────────────────────
    app.get('/api/history', requireAuth, async (req, res) => {
        const role   = req.header('x-user-role');
        const userId = req.header('x-user-id');
        const limit  = Math.min(parseInt(String(req.query.limit ?? '20')), 100);
        let rooms    = await roomRepo.findRecent(limit);
        if (!isAdmin(role)) {
            rooms = rooms.filter(r => (botOwnerCache.get(r.scriptName) ?? null) === userId);
        }
        res.json(rooms.map(r => ({
            id:          r.id,
            scriptName:  r.scriptName,
            roomName:    r.roomName,
            status:      r.status,
            startedAt:   r.startedAt.toISOString(),
            finishedAt:  r.finishedAt?.toISOString() ?? null,
            playerCount: r.playerCount,
            retryCount:  r.retryCount,
        })));
    });

    // ── Usuários (apenas admin) ────────────────────────────────────────────────
    app.get('/api/users', requireAuth, requireAdmin, async (_req, res) => {
        const users = await userRepo.list();
        res.json(users);
    });

    app.post('/api/users', requireAuth, requireAdmin, async (req, res) => {
        const actorRole = req.header('x-user-role') as AppRole | undefined;
        const { username, password, role } = req.body as { username: string; password: string; role: AppRole };
        if (!username || !password) {
            res.status(400).json({ ok: false, error: 'username e password são obrigatórios.' });
            return;
        }
        // Apenas SUPER_ADMIN pode criar outro SUPER_ADMIN.
        if (role === 'SUPER_ADMIN' && actorRole !== 'SUPER_ADMIN') {
            res.status(403).json({ ok: false, error: 'Apenas o super administrador pode criar super admins.' });
            return;
        }
        try {
            const created = await userRepo.create(username, password, role ?? 'USER');
            audit(req, 'USER_CREATE', { targetId: created.id, details: `username=${username} role=${role ?? 'USER'}` });
            res.status(201).json(created);
        } catch (err: any) {
            res.status(409).json({ ok: false, error: 'Usuário já existe.' });
        }
    });

    app.delete('/api/users/:id', requireAuth, requireAdmin, async (req, res) => {
        const actorRole = req.header('x-user-role') as AppRole | undefined;
        try {
            const targetUsers = await userRepo.list();
            const target = targetUsers.find(u => u.id === req.params.id);
            if (!target) { res.status(404).json({ ok: false, error: 'Usuário não encontrado.' }); return; }
            // SUPER_ADMIN não pode ser removido por ninguém.
            if (target.role === 'SUPER_ADMIN') {
                res.status(403).json({ ok: false, error: 'Super admins não podem ser removidos.' });
                return;
            }
            // ADMIN só pode remover USER; apenas SUPER_ADMIN pode remover ADMIN.
            if (target.role === 'ADMIN' && actorRole !== 'SUPER_ADMIN') {
                res.status(403).json({ ok: false, error: 'Apenas o super administrador pode remover admins.' });
                return;
            }
            await userRepo.delete(String(req.params.id));
            audit(req, 'USER_DELETE', { targetId: String(req.params.id) });
            res.json({ ok: true });
        } catch {
            res.status(404).json({ ok: false, error: 'Usuário não encontrado.' });
        }
    });

    // Retorna role atual do usuário logado — usado para refresh de sessão.
    app.get('/api/users/me', requireAuth, async (req, res) => {
        const userId = req.header('x-user-id');
        if (!userId) { res.status(400).json({ ok: false, error: 'x-user-id ausente.' }); return; }
        const users = await userRepo.list();
        const user  = users.find(u => u.id === userId);
        if (!user) { res.status(404).json({ ok: false, error: 'Usuário não encontrado.' }); return; }
        res.json({ id: user.id, role: user.role });
    });

    // Troca de senha do próprio usuário logado.
    app.patch('/api/users/me/password', requireAuth, async (req, res) => {
        const userId = req.header('x-user-id');
        if (!userId) { res.status(400).json({ ok: false, error: 'x-user-id ausente.' }); return; }
        const { currentPassword, newPassword } = req.body as { currentPassword?: string; newPassword?: string };
        if (!currentPassword || !newPassword) {
            res.status(400).json({ ok: false, error: 'currentPassword e newPassword são obrigatórios.' });
            return;
        }
        // Busca usuário pelo ID, incluindo hash para validação
        const users = await userRepo.list();
        const safe  = users.find(u => u.id === userId);
        if (!safe) { res.status(404).json({ ok: false, error: 'Usuário não encontrado.' }); return; }
        // verifyCredentials valida a senha atual
        const valid = await userRepo.verifyCredentials(safe.username, currentPassword);
        if (!valid) { res.status(401).json({ ok: false, error: 'Senha atual incorreta.' }); return; }
        try {
            await userRepo.setPassword(userId, newPassword);
            audit(req, 'USER_DELETE', { targetId: userId, details: 'password-change' });
            res.json({ ok: true });
        } catch (e) {
            res.status(400).json({ ok: false, error: e instanceof Error ? e.message : 'Erro ao alterar senha.' });
        }
    });

    // ── Audit log (apenas admin) ───────────────────────────────────────────────
    app.get('/api/audit', requireAuth, requireAdmin, async (req, res) => {
        const limit = Math.min(parseInt(String(req.query.limit ?? '100')), 500);
        const logs  = await auditRepo.list(limit);
        res.json(logs.map(l => ({
            id:        l.id,
            action:    l.action,
            actorId:   l.actorId,
            actorName: l.actorName,
            targetId:  l.targetId,
            details:   l.details,
            ip:        l.ip,
            createdAt: l.createdAt.toISOString(),
        })));
    });

    http.listen(PORT, () => {
        logger.success(`Painel web disponível em http://localhost:${PORT}`);
    });
}

async function metricRepo_recent(limit: number) {
    const { metricRepo } = await import('../repositories/index.js');
    return metricRepo.recent(limit);
}
