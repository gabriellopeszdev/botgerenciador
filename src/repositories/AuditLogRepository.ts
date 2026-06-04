import { PrismaClient, AuditAction, AuditLog } from '@prisma/client';

export interface AuditEntry {
    action:     AuditAction;
    actorId?:   string | null;
    actorName?: string | null;
    targetId?:  string | null;
    details?:   string | null;
    ip?:        string | null;
}

export class AuditLogRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async log(entry: AuditEntry): Promise<void> {
        try {
            await this.prisma.auditLog.create({ data: entry });
        } catch {
            // audit não deve quebrar a operação principal
        }
    }

    async list(limit = 100): Promise<AuditLog[]> {
        return this.prisma.auditLog.findMany({
            orderBy: { createdAt: 'desc' },
            take:    Math.min(limit, 500),
        });
    }
}
