-- Migration marcada como não-transacional pois ALTER TYPE ADD VALUE não pode
-- rodar dentro de uma transação no PostgreSQL.
-- prisma-migrate: non-transactional

-- AlterEnum: adiciona SUPER_ADMIN ao enum UserRole
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'SUPER_ADMIN';
