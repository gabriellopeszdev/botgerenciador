-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM (
  'ROOM_OPEN',
  'ROOM_CLOSE',
  'ROOM_RELOAD',
  'TOKEN_CREATE',
  'TOKEN_DELETE',
  'BOT_UPSERT',
  'BOT_DELETE',
  'BOT_TOGGLE_ACTIVE',
  'USER_CREATE',
  'USER_DELETE',
  'USER_LOGIN',
  'USER_LOGIN_FAIL'
);

-- CreateTable
CREATE TABLE "AuditLog" (
  "id"        TEXT NOT NULL,
  "action"    "AuditAction" NOT NULL,
  "actorId"   TEXT,
  "actorName" TEXT,
  "targetId"  TEXT,
  "details"   TEXT,
  "ip"        TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuditLog_action_idx"    ON "AuditLog"("action");
CREATE INDEX "AuditLog_actorId_idx"   ON "AuditLog"("actorId");
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
