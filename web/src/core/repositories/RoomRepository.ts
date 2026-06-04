import { BaseRepository } from './BaseRepository';
import type { RoomSnapshot, OpenRoomPayload, RoomLog } from '@/types/api';

type RoomRaw = Omit<RoomSnapshot, 'startedAt'> & { startedAt: string };

export class RoomRepository extends BaseRepository<RoomRaw, RoomSnapshot> {
    protected readonly basePath = '/api/rooms';

    protected transform(raw: RoomRaw): RoomSnapshot {
        return { ...raw, startedAt: new Date(raw.startedAt) };
    }

    async findAll(): Promise<RoomSnapshot[]> {
        return this.fetchAll();
    }

    async open(payload: OpenRoomPayload): Promise<{ requestId: string }> {
        return this.client.post<{ requestId: string }>(`${this.basePath}/open`, payload);
    }

    async close(pageId: string): Promise<void> {
        await this.client.post(`${this.basePath}/${pageId}/close`);
    }

    async reload(pageId: string, tokenId?: string): Promise<{ requestId: string }> {
        return this.client.post<{ requestId: string }>(`${this.basePath}/${pageId}/reload`, tokenId ? { tokenId } : {});
    }

    async getLogs(dbId: string, limit = 50): Promise<RoomLog[]> {
        return this.client.get<RoomLog[]>(`${this.basePath}/${dbId}/logs?limit=${limit}`);
    }
}
