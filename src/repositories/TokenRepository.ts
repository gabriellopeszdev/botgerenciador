import { PrismaClient, Token, TokenStatus } from '@prisma/client';

export class TokenRepository {
    constructor(private readonly prisma: PrismaClient) {}

    /**
     * Reserva um token de forma atômica dentro de uma transação.
     *
     * Fluxo:
     *  1. Se o token nunca foi visto → cria já com status IN_USE.
     *  2. Se existe e está AVAILABLE → atualiza para IN_USE.
     *  3. Se está IN_USE / EXPIRED / RATE_LIMITED → lança erro imediatamente,
     *     antes mesmo de criar a aba do Puppeteer.
     *
     * A transação garante que duas salas tentando o mesmo token ao mesmo
     * tempo nunca ambas passem na verificação (race condition eliminado).
     */
    async checkoutToken(value: string): Promise<Token> {
        return this.prisma.$transaction(async (tx) => {
            const existing = await tx.token.findUnique({ where: { value } });

            if (!existing) {
                // Primeira vez que este token é usado — cria e já reserva.
                return tx.token.create({
                    data: { value, status: 'IN_USE', lastUsedAt: new Date() },
                });
            }

            if (existing.status === 'IN_USE') {
                throw new Error('Token já está em uso por outra sala ativa.');
            }
            if (existing.status === 'EXPIRED') {
                throw new Error('Token expirado. Gere um novo em haxball.com/headlesstoken');
            }
            if (existing.status === 'RATE_LIMITED') {
                throw new Error('Token com rate-limit ativo. Aguarde antes de tentar novamente.');
            }

            return tx.token.update({
                where: { id: existing.id },
                data: { status: 'IN_USE', lastUsedAt: new Date() },
            });
        });
    }

    /** Libera o token de volta para AVAILABLE (chamado em closeRoom). */
    async release(tokenId: string): Promise<void> {
        await this.prisma.token.update({
            where: { id: tokenId },
            data: { status: 'AVAILABLE' },
        });
    }

    /** Marca o token como EXPIRED e registra a data. */
    async markAsExpired(tokenId: string): Promise<void> {
        await this.prisma.token.update({
            where: { id: tokenId },
            data: { status: 'EXPIRED', expiresAt: new Date() },
        });
    }

    /** Marca o token como RATE_LIMITED. */
    async markAsRateLimited(tokenId: string): Promise<void> {
        await this.prisma.token.update({
            where: { id: tokenId },
            data: { status: 'RATE_LIMITED' },
        });
    }

    /**
     * Registra um token como AVAILABLE. Se já existir e não estiver IN_USE,
     * reativa-o. Se estiver IN_USE, lança erro para evitar conflito.
     */
    async register(value: string, ownerId: string | null = null): Promise<Token> {
        const trimmed = value?.trim();
        if (!trimmed || trimmed.length < 10) {
            throw new Error('Token inválido. Verifique o valor informado.');
        }
        const existing = await this.prisma.token.findUnique({ where: { value: trimmed } });
        if (existing) {
            if (existing.status === 'IN_USE') {
                throw new Error('Token já está sendo usado por uma sala ativa.');
            }
            return this.prisma.token.update({
                where: { id: existing.id },
                data:  { status: 'AVAILABLE', expiresAt: null, ownerId },
            });
        }
        return this.prisma.token.create({
            data: { value: trimmed, status: 'AVAILABLE', ownerId },
        });
    }

    async setOwner(id: string, ownerId: string | null): Promise<void> {
        await this.prisma.token.update({ where: { id }, data: { ownerId } });
    }

    async findByOwner(ownerId: string): Promise<Token[]> {
        return this.prisma.token.findMany({
            where:   { ownerId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findByValue(value: string): Promise<Token | null> {
        return this.prisma.token.findUnique({ where: { value } });
    }

    async findById(id: string): Promise<Token | null> {
        return this.prisma.token.findUnique({ where: { id } });
    }

    /**
     * Returns the next AVAILABLE token, excluding the one that just expired.
     * Prefers least-recently-used to spread load across tokens.
     */
    async findNextAvailable(excludeId?: string): Promise<Token | null> {
        return this.prisma.token.findFirst({
            where: {
                status: 'AVAILABLE',
                ...(excludeId ? { id: { not: excludeId } } : {}),
            },
            orderBy: { lastUsedAt: 'asc' },
        });
    }

    /**
     * Libera tokens presos como IN_USE sem sala ONLINE associada.
     * Isso acontece quando o processo é encerrado abruptamente antes de
     * os handlers de close gravarem no banco.
     * Retorna a quantidade de tokens corrigidos.
     */
    async releaseOrphaned(): Promise<number> {
        const activeRooms = await this.prisma.room.findMany({
            where:  { status: 'ONLINE', tokenId: { not: null } },
            select: { tokenId: true },
        });
        const activeTokenIds = activeRooms
            .map(r => r.tokenId)
            .filter((id): id is string => id !== null);

        const result = await this.prisma.token.updateMany({
            where: {
                status: 'IN_USE',
                ...(activeTokenIds.length > 0 ? { id: { notIn: activeTokenIds } } : {}),
            },
            data: { status: 'EXPIRED', expiresAt: new Date() },
        });
        return result.count;
    }

    /**
     * Remove tokens EXPIRED cujo expiresAt é mais antigo que olderThanMinutes.
     * Só deleta tokens sem sala associada (segurança extra contra FK violation).
     */
    async pruneExpired(olderThanMinutes: number): Promise<number> {
        const cutoff = new Date(Date.now() - olderThanMinutes * 60 * 1000);
        const result = await this.prisma.token.deleteMany({
            where: {
                status:    'EXPIRED',
                expiresAt: { not: null, lte: cutoff },
                room:      { is: null },
            },
        });
        return result.count;
    }

    /** Lista todos os tokens e seus status atuais. */
    async listAll(): Promise<Token[]> {
        return this.prisma.token.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }
}
