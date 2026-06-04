-- Add ownership: cada Bot pode ter um User como dono.
ALTER TABLE "Bot" ADD COLUMN "ownerId" TEXT;

CREATE INDEX "Bot_ownerId_idx" ON "Bot"("ownerId");

ALTER TABLE "Bot"
  ADD CONSTRAINT "Bot_ownerId_fkey"
  FOREIGN KEY ("ownerId") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
