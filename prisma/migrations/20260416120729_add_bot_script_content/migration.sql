-- CreateTable
CREATE TABLE "Bot" (
    "id" TEXT NOT NULL,
    "scriptName" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "scriptContent" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Bot_scriptName_key" ON "Bot"("scriptName");

-- CreateIndex
CREATE INDEX "Bot_active_idx" ON "Bot"("active");
