import { EventEmitter } from 'events';
import { logRepo } from '../repositories/index.js';
import type { LogType } from '@prisma/client';

/** Singleton de eventos internos — desacopla index.ts do Socket.io */
export const emitter = new EventEmitter();

/**
 * Persiste o log no banco E emite o evento para o painel web em tempo real.
 * Use no lugar de logRepo.add() nas operações críticas do bot.
 */
export function logAndEmit(roomId: string, type: LogType, message: string): void {
    logRepo.add(roomId, type, message).catch(() => {});
    emitter.emit('log:entry', {
        roomId,
        type,
        message,
        createdAt: new Date().toISOString(),
    });
}
