import { PrismaClient, Bot } from '@prisma/client';

export interface UpsertBotData {
    scriptName:    string;
    displayName:   string;
    description?:  string | null;
    scriptContent: string;
    active?:       boolean;
    ownerId?:      string | null;
}

export interface UpdateBotData {
    displayName?:   string;
    description?:   string | null;
    scriptContent?: string;
}

export class BotRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async findAllActive(): Promise<Bot[]> {
        return this.prisma.bot.findMany({
            where:   { active: true },
            orderBy: { scriptName: 'asc' },
        });
    }

    async findAll(): Promise<Bot[]> {
        return this.prisma.bot.findMany({ orderBy: { scriptName: 'asc' } });
    }

    async findByOwner(ownerId: string): Promise<Bot[]> {
        return this.prisma.bot.findMany({
            where:   { ownerId },
            orderBy: { scriptName: 'asc' },
        });
    }

    async findByName(scriptName: string): Promise<Bot | null> {
        return this.prisma.bot.findUnique({ where: { scriptName } });
    }

    async upsert(data: UpsertBotData): Promise<Bot> {
        return this.prisma.bot.upsert({
            where:  { scriptName: data.scriptName },
            update: {
                displayName:   data.displayName,
                description:   data.description ?? null,
                scriptContent: data.scriptContent,
                active:        data.active ?? true,
                ...(data.ownerId !== undefined ? { ownerId: data.ownerId } : {}),
            },
            create: {
                scriptName:    data.scriptName,
                displayName:   data.displayName,
                description:   data.description ?? null,
                scriptContent: data.scriptContent,
                active:        data.active ?? true,
                ownerId:       data.ownerId ?? null,
            },
        });
    }

    async update(scriptName: string, data: UpdateBotData): Promise<Bot> {
        return this.prisma.bot.update({
            where: { scriptName },
            data: {
                ...(data.displayName   !== undefined ? { displayName:   data.displayName }   : {}),
                ...(data.description   !== undefined ? { description:   data.description }   : {}),
                ...(data.scriptContent !== undefined ? { scriptContent: data.scriptContent } : {}),
            },
        });
    }

    async setOwner(scriptName: string, ownerId: string | null): Promise<void> {
        await this.prisma.bot.update({ where: { scriptName }, data: { ownerId } });
    }

    async setActive(scriptName: string, active: boolean): Promise<void> {
        await this.prisma.bot.update({ where: { scriptName }, data: { active } });
    }

    async delete(scriptName: string): Promise<void> {
        await this.prisma.bot.delete({ where: { scriptName } });
    }
}
