import { BaseRepository } from './BaseRepository';
import type { BotItem } from '@/types/api';

export interface BotFull {
    scriptName:  string;
    displayName: string;
    description: string | null;
    active:      boolean;
    sizeBytes:   number;
    updatedAt:   string;
    ownerId?:    string | null;
}

export interface BotSource extends BotFull {
    scriptContent: string;
}

export interface UpsertBotPayload {
    scriptName:    string;
    displayName:   string;
    description?:  string;
    scriptContent: string;
    active?:       boolean;
    ownerId?:      string | null;
}

export interface UpdateBotPayload {
    displayName?:   string;
    description?:   string | null;
    scriptContent?: string;
}

export class BotRepository extends BaseRepository<BotItem> {
    protected readonly basePath = '/api/bots';

    async findAllActive(): Promise<BotItem[]> {
        return this.fetchAll();
    }

    async findAll(): Promise<BotFull[]> {
        return this.client.get<BotFull[]>(`${this.basePath}/all`);
    }

    async findMine(): Promise<BotFull[]> {
        return this.client.get<BotFull[]>(`${this.basePath}/mine`);
    }

    async update(scriptName: string, payload: UpdateBotPayload): Promise<void> {
        await this.client.patch(`${this.basePath}/${scriptName}`, payload);
    }

    async setOwner(scriptName: string, ownerId: string | null): Promise<void> {
        await this.client.patch(`${this.basePath}/${scriptName}/owner`, { ownerId });
    }

    async findSource(scriptName: string): Promise<BotSource> {
        return this.client.get<BotSource>(`${this.basePath}/${scriptName}/source`);
    }

    async upsert(payload: UpsertBotPayload): Promise<{ scriptName: string }> {
        return this.client.post<{ scriptName: string }>(this.basePath, payload);
    }

    async setActive(scriptName: string, active: boolean): Promise<void> {
        await this.client.patch(`${this.basePath}/${scriptName}/active`, { active });
    }

    async remove(scriptName: string): Promise<void> {
        await this.client.delete(`${this.basePath}/${scriptName}`);
    }
}
