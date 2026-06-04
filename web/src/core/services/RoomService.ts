import { RoomRepository } from '../repositories/RoomRepository';
import { SocketManager } from '../socket/SocketManager';
import type { OpenRoomPayload } from '@/types/api';

/**
 * Orquestra operações de sala que envolvem repositório + socket.
 * Singleton — compartilhado por todos os componentes.
 */
export class RoomService {
    private static instance: RoomService | null = null;
    private readonly repo = new RoomRepository();
    private readonly socket = SocketManager.getInstance();

    private constructor() {}

    static getInstance(): RoomService {
        if (!RoomService.instance) {
            RoomService.instance = new RoomService();
        }
        return RoomService.instance;
    }

    /** Inicia abertura e retorna requestId para acompanhar via socket room:open:update. */
    async open(payload: OpenRoomPayload): Promise<string> {
        const { requestId } = await this.repo.open(payload);
        return requestId;
    }

    async close(pageId: string): Promise<void> {
        await this.repo.close(pageId);
    }

    /** Recarrega sala e retorna requestId para acompanhar reabertura. */
    async reload(pageId: string, tokenId?: string): Promise<string> {
        const { requestId } = await this.repo.reload(pageId, tokenId);
        return requestId;
    }
}
