import { PrismaClient, AllowedDiscordUser } from '@prisma/client';

export class AllowedUserRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async listAll(): Promise<AllowedDiscordUser[]> {
        return this.prisma.allowedDiscordUser.findMany({
            orderBy: { addedAt: 'asc' },
        });
    }

    async isAllowed(discordId: string): Promise<boolean> {
        const found = await this.prisma.allowedDiscordUser.findUnique({
            where: { discordId },
        });
        return found !== null;
    }

    async add(discordId: string, label?: string): Promise<{ created: boolean; user: AllowedDiscordUser }> {
        const existing = await this.prisma.allowedDiscordUser.findUnique({ where: { discordId } });
        if (existing) return { created: false, user: existing };
        const user = await this.prisma.allowedDiscordUser.create({
            data: { discordId, label: label ?? null },
        });
        return { created: true, user };
    }

    async remove(discordId: string): Promise<boolean> {
        const existing = await this.prisma.allowedDiscordUser.findUnique({ where: { discordId } });
        if (!existing) return false;
        await this.prisma.allowedDiscordUser.delete({ where: { discordId } });
        return true;
    }
}
