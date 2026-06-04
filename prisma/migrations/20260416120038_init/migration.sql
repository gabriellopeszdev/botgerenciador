-- CreateEnum
CREATE TYPE "RoomStatus" AS ENUM ('ONLINE', 'OFFLINE', 'CRASHED');

-- CreateEnum
CREATE TYPE "TokenStatus" AS ENUM ('AVAILABLE', 'IN_USE', 'EXPIRED', 'RATE_LIMITED');

-- CreateEnum
CREATE TYPE "LogType" AS ENUM ('INFO', 'WARN', 'ERROR', 'CRASH', 'TOKEN_EXPIRED', 'COMMAND');

-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL,
    "scriptName" TEXT NOT NULL,
    "botPath" TEXT NOT NULL,
    "roomName" TEXT NOT NULL,
    "roomUrl" TEXT,
    "status" "RoomStatus" NOT NULL DEFAULT 'ONLINE',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "playerCount" INTEGER NOT NULL DEFAULT 0,
    "avgPing" INTEGER,
    "channelId" TEXT NOT NULL,
    "retryCount" INTEGER NOT NULL DEFAULT 0,
    "tokenId" TEXT,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Token" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "status" "TokenStatus" NOT NULL DEFAULT 'AVAILABLE',
    "expiresAt" TIMESTAMP(3),
    "lastUsedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Token_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServerMetric" (
    "id" TEXT NOT NULL,
    "cpuPercent" DOUBLE PRECISION NOT NULL,
    "ramMb" DOUBLE PRECISION NOT NULL,
    "roomsOnline" INTEGER NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ServerMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomLog" (
    "id" TEXT NOT NULL,
    "type" "LogType" NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "roomId" TEXT,

    CONSTRAINT "RoomLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actor" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "target" TEXT,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Room_tokenId_key" ON "Room"("tokenId");

-- CreateIndex
CREATE INDEX "Room_status_idx" ON "Room"("status");

-- CreateIndex
CREATE INDEX "Room_startedAt_idx" ON "Room"("startedAt");

-- CreateIndex
CREATE INDEX "Room_channelId_idx" ON "Room"("channelId");

-- CreateIndex
CREATE UNIQUE INDEX "Token_value_key" ON "Token"("value");

-- CreateIndex
CREATE INDEX "Token_status_idx" ON "Token"("status");

-- CreateIndex
CREATE INDEX "ServerMetric_recordedAt_idx" ON "ServerMetric"("recordedAt");

-- CreateIndex
CREATE INDEX "RoomLog_roomId_idx" ON "RoomLog"("roomId");

-- CreateIndex
CREATE INDEX "RoomLog_type_idx" ON "RoomLog"("type");

-- CreateIndex
CREATE INDEX "RoomLog_createdAt_idx" ON "RoomLog"("createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_actor_idx" ON "AuditLog"("actor");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_tokenId_fkey" FOREIGN KEY ("tokenId") REFERENCES "Token"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomLog" ADD CONSTRAINT "RoomLog_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;
