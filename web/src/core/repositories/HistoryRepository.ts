import { BaseRepository } from './BaseRepository';
import type { RoomHistory } from '@/types/api';

export class HistoryRepository extends BaseRepository<RoomHistory> {
    protected readonly basePath = '/api/history';

    async findRecent(limit = 20): Promise<RoomHistory[]> {
        return this.client.get<RoomHistory[]>(`${this.basePath}?limit=${limit}`);
    }
}
