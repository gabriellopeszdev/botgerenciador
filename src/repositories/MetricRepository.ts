import { PrismaClient } from '@prisma/client';

export class MetricRepository {
    constructor(private readonly prisma: PrismaClient) {}

    /** Grava um snapshot de CPU, RAM e salas online. */
    async record(cpuPercent: number, ramMb: number, roomsOnline: number): Promise<void> {
        await this.prisma.serverMetric.create({
            data: { cpuPercent, ramMb, roomsOnline },
        });
    }

    /** Retorna as últimas N métricas — útil para gerar gráficos no futuro. */
    async recent(limit = 100) {
        return this.prisma.serverMetric.findMany({
            orderBy: { recordedAt: 'desc' },
            take:    limit,
        });
    }

    /** Remove métricas mais antigas que `daysToKeep` dias. Retorna a contagem deletada. */
    async prune(daysToKeep = 7): Promise<number> {
        const cutoff = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000);
        const { count } = await this.prisma.serverMetric.deleteMany({
            where: { recordedAt: { lt: cutoff } },
        });
        return count;
    }
}
