import { PrismaClient } from '@prisma/client';
import { prisma } from '../db/prisma';
import { RoomRepository } from './RoomRepository';
import { TokenRepository } from './TokenRepository';
import { LogRepository } from './LogRepository';
import { MetricRepository } from './MetricRepository';
import { BotRepository } from './BotRepository';
import { UserRepository } from './UserRepository';
import { AuditLogRepository } from './AuditLogRepository';
import { AllowedUserRepository } from './AllowedUserRepository';

// $extends() retorna DynamicClientExtensionThis que não é diretamente atribuível
// a PrismaClient — cast seguro pois todos os métodos estão presentes em runtime.
const db = prisma as unknown as PrismaClient;

// Singletons compartilhados por todo o processo.
export const roomRepo        = new RoomRepository(db);
export const tokenRepo       = new TokenRepository(db);
export const logRepo         = new LogRepository(db);
export const metricRepo      = new MetricRepository(db);
export const botRepo         = new BotRepository(db);
export const userRepo        = new UserRepository(db);
export const auditRepo       = new AuditLogRepository(db);
export const allowedUserRepo = new AllowedUserRepository(db);

export type { RoomWithToken, CreateRoomData } from './RoomRepository';
