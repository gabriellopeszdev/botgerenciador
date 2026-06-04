import { BaseRepository } from './BaseRepository';
import type { TokenItem } from '@/types/api';

export class TokenRepository extends BaseRepository<TokenItem> {
    protected readonly basePath = '/api/tokens';

    async listAll(): Promise<TokenItem[]> {
        return this.fetchAll();
    }

    async findAvailable(): Promise<TokenItem[]> {
        const all = await this.fetchAll();
        return all.filter(t => t.status === 'AVAILABLE');
    }

    async register(value: string, ownerId: string | null = null): Promise<void> {
        await this.client.post(this.basePath, { value, ownerId });
    }

    async setOwner(id: string, ownerId: string | null): Promise<void> {
        await this.client.patch(`${this.basePath}/${id}/owner`, { ownerId });
    }

    async remove(id: string): Promise<void> {
        await this.client.delete(`${this.basePath}/${id}`);
    }

    async autoGenerate(ownerId: string | null = null): Promise<void> {
        await this.client.post(`${this.basePath}/auto-generate`, { ownerId });
    }
}
