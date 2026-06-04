import type {
    RoomSnapshot, SocketRoomMetrics, SocketServerMetrics,
    SocketRoomRemoved, RoomOpenUpdate, RoomLog,
} from '@/types/api';

type EventMap = {
    'rooms:snapshot':   RoomSnapshot[];
    'room:added':       RoomSnapshot;
    'room:removed':     SocketRoomRemoved;
    'room:metrics':     SocketRoomMetrics;
    'server:metrics':   SocketServerMetrics;
    'log:entry':        RoomLog & { roomId: string };
    'room:open:update': RoomOpenUpdate;
    'connect':          void;
    'disconnect':       void;
};

type Listener<K extends keyof EventMap> = (data: EventMap[K]) => void;

/**
 * Singleton que gerencia a conexão Socket.io e distribui eventos
 * para os subscribers via padrão Observer.
 *
 * O token de conexão é obtido em /api/socket-token (Next.js, protegido por NextAuth)
 * e enviado ao Express no handshake.auth.
 */
export class SocketManager {
    private static instance: SocketManager | null = null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private socket: any = null;
    private readonly listeners = new Map<keyof EventMap, Set<Listener<never>>>();

    private constructor(private readonly serverUrl: string) {}

    static getInstance(): SocketManager {
        if (!SocketManager.instance) {
            const url =
                typeof window !== 'undefined'
                    ? (process.env.NEXT_PUBLIC_SOCKET_URL ?? 'http://localhost:3000')
                    : 'http://localhost:3000';
            SocketManager.instance = new SocketManager(url);
        }
        return SocketManager.instance;
    }

    async connect(): Promise<void> {
        if (this.socket?.connected) return;

        const tokenRes = await fetch('/api/socket-token', { credentials: 'include' });
        if (!tokenRes.ok) throw new Error('Não autenticado.');
        const { token, userId, role } = await tokenRes.json() as {
            token: string; userId: string; role: 'ADMIN' | 'USER';
        };

        const { io } = await import('socket.io-client');
        this.socket = io(this.serverUrl, {
            withCredentials: true,
            auth:            { token, userId, role },
        });

        this.socket.onAny((event: keyof EventMap, data: unknown) => {
            this.notify(event, data as never);
        });
        this.socket.on('connect',    () => this.notify('connect',    undefined as never));
        this.socket.on('disconnect', () => this.notify('disconnect', undefined as never));
    }

    disconnect(): void {
        this.socket?.disconnect();
        this.socket = null;
    }

    on<K extends keyof EventMap>(event: K, listener: Listener<K>): () => void {
        if (!this.listeners.has(event)) this.listeners.set(event, new Set());
        this.listeners.get(event)!.add(listener as Listener<never>);
        return () => this.listeners.get(event)?.delete(listener as Listener<never>);
    }

    get isConnected(): boolean {
        return this.socket?.connected ?? false;
    }

    private notify<K extends keyof EventMap>(event: K, data: EventMap[K]): void {
        this.listeners.get(event)?.forEach(fn => fn(data as never));
    }
}
