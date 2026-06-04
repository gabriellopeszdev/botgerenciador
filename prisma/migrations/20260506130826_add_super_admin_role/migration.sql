-- CreateTable
CREATE TABLE "AllowedDiscordUser" (
    "id" TEXT NOT NULL,
    "discordId" TEXT NOT NULL,
    "label" TEXT,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AllowedDiscordUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AllowedDiscordUser_discordId_key" ON "AllowedDiscordUser"("discordId");

-- CreateIndex
CREATE INDEX "AllowedDiscordUser_discordId_idx" ON "AllowedDiscordUser"("discordId");
