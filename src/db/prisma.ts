import { PrismaClient, Prisma } from '@prisma/client';

const RETRYABLE = new Set(['P1001', 'P1002', 'P1008', 'P1017', 'P2024']);

function makeClient() {
    const base = new PrismaClient({
        log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });

    return base.$extends({
        query: {
            $allModels: {
                async $allOperations({ operation, model, args, query }) {
                    for (let attempt = 1; ; attempt++) {
                        try {
                            return await query(args);
                        } catch (err) {
                            const code = (err as Prisma.PrismaClientKnownRequestError)?.code;
                            const retryable =
                                RETRYABLE.has(code) ||
                                err instanceof Prisma.PrismaClientInitializationError;
                            if (!retryable || attempt >= 3) throw err;
                            const ms = Math.min(500 * 2 ** attempt, 8_000);
                            console.error(
                                `[prisma] ${model}.${operation} falhou (${code ?? 'desconhecido'}), retry ${attempt}/3 em ${ms}ms`,
                            );
                            await new Promise(r => setTimeout(r, ms));
                        }
                    }
                },
            },
        },
    });
}

type ExtendedClient = ReturnType<typeof makeClient>;

const globalForPrisma = globalThis as unknown as { prisma?: ExtendedClient };

export const prisma = globalForPrisma.prisma ?? makeClient();

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}
