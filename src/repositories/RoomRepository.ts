import { PrismaClient, Room, RoomStatus, Token } from '@prisma/client';

export type RoomWithToken = Room & { token: Token | null };

export interface CreateRoomData {
    scriptName: string;
    channelId: string;
    retryCount: number;
    tokenId: string;
}

export class RoomRepository {
    constructor(private readonly prisma: PrismaClient) {}

    /**
     * Cria o registro da sala no banco logo após reservar o token,
     * antes do Puppeteer terminar de carregar. O roomName e roomUrl
     * são preenchidos depois com updateLink(), quando o onRoomLink disparar.
     */
    async create(data: CreateRoomData): Promise<Room> {
        return this.prisma.room.create({
            data: {
                scriptName: data.scriptName,
                roomName:   data.scriptName,   // placeholder — atualizado em updateLink
                channelId:  data.channelId,
                retryCount: data.retryCount,
                tokenId:    data.tokenId,
                status:     'ONLINE',
            },
        });
    }

    /**
     * Atualiza o nome e URL da sala assim que o Haxball dispara onRoomLink.
     */
    async updateLink(roomId: string, roomName: string, roomUrl: string): Promise<void> {
        await this.prisma.room.update({
            where: { id: roomId },
            data:  { roomName, roomUrl },
        });
    }

    /**
     * Atualiza métricas em tempo real (jogadores e ping médio).
     * Chamado periodicamente pelo health check.
     */
    async updateMetrics(
        roomId: string,
        playerCount: number,
        avgPing: number | null,
    ): Promise<void> {
        await this.prisma.room.update({
            where: { id: roomId },
            data:  { playerCount, avgPing },
        });
    }

    /**
     * Fecha a sala atomicamente: marca como OFFLINE/CRASHED e libera o token
     * em uma única transação — garante consistência mesmo em caso de falha.
     */
    async closeRoom(roomId: string, status: RoomStatus = 'OFFLINE'): Promise<void> {
        await this.prisma.$transaction(async (tx) => {
            const room = await tx.room.findUnique({
                where:  { id: roomId },
                select: { tokenId: true },
            });

            await tx.room.update({
                where: { id: roomId },
                data:  { status, finishedAt: new Date(), tokenId: null },
            });

            if (room?.tokenId) {
                // EXPIRED fica como EXPIRED — não volta para AVAILABLE.
                await tx.token.updateMany({
                    where: {
                        id:     room.tokenId,
                        status: { not: 'EXPIRED' },
                    },
                    data: { status: 'AVAILABLE' },
                });
            }
        });
    }

    /**
     * Retorna todas as salas com status ONLINE — usada no clientReady para
     * restaurar salas que estavam rodando antes de o bot reiniciar.
     */
    async findAllOnline(): Promise<RoomWithToken[]> {
        return this.prisma.room.findMany({
            where:   { status: 'ONLINE' },
            include: { token: true },
            orderBy: { startedAt: 'asc' },
        });
    }

    async findById(roomId: string): Promise<Room | null> {
        return this.prisma.room.findUnique({ where: { id: roomId } });
    }

    /** Retorna as últimas N salas encerradas (OFFLINE ou CRASHED), para histórico. */
    async findRecent(limit = 10): Promise<Room[]> {
        return this.prisma.room.findMany({
            where:   { status: { in: ['OFFLINE', 'CRASHED'] } },
            orderBy: { startedAt: 'desc' },
            take:    limit,
        });
    }
}
