-- Remove botPath column (redundant — script is fetched from Bot.scriptContent by scriptName)
ALTER TABLE "Room" DROP COLUMN "botPath";

-- Drop AuditLog table (model existed but addAudit() was never called)
DROP TABLE IF EXISTS "AuditLog";
