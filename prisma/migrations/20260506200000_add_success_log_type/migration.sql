-- Migration marcada como não-transacional pois ALTER TYPE ADD VALUE não pode
-- rodar dentro de uma transação no PostgreSQL.
-- prisma-migrate: non-transactional

-- Add SUCCESS to LogType enum
ALTER TYPE "LogType" ADD VALUE IF NOT EXISTS 'SUCCESS' AFTER 'INFO';
