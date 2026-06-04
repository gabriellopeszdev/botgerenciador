import { PrismaClient, LogType, RoomLog } from '@prisma/client';

export class LogRepository {
    constructor(private readonly prisma: PrismaClient) {}

    /** Insere um log associado a uma sala. */
    async add(roomId: string, type: LogType, message: string): Promise<void> {
        await this.prisma.roomLog.create({
            data: { roomId, type, message },
        });
    }

    /** Retorna os últimos N logs de uma sala, do mais recente para o mais antigo. */
    async findByRoom(roomId: string, limit = 50): Promise<RoomLog[]> {
        return this.prisma.roomLog.findMany({
            where:   { roomId },
            orderBy: { createdAt: 'desc' },
            take:    limit,
        });
    }

    /** Retorna os últimos N logs de todas as salas (para página de Servidor). */
    async findRecent(limit = 100): Promise<RoomLog[]> {
        return this.prisma.roomLog.findMany({
            orderBy: { createdAt: 'desc' },
            take:    limit,
        });
    }
}
