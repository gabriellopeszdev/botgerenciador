-- Cada Token pode ser atrelado a um User dono.
ALTER TABLE "Token" ADD COLUMN "ownerId" TEXT;

CREATE INDEX "Token_ownerId_idx" ON "Token"("ownerId");

ALTER TABLE "Token"
  ADD CONSTRAINT "Token_ownerId_fkey"
  FOREIGN KEY ("ownerId") REFERENCES "User"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
