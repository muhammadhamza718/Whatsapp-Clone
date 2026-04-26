-- Fix messages table columns
ALTER TABLE "messages" RENAME COLUMN "Id" TO "id";
ALTER TABLE "messages" RENAME COLUMN "Sender" TO "sender";
ALTER TABLE "messages" RENAME COLUMN "Content" TO "content";
ALTER TABLE "messages" RENAME COLUMN "Timestamp" TO "timestamp";

-- Fix messages constraints and indexes
ALTER TABLE "messages" RENAME CONSTRAINT "PK_Messages" TO "pk_messages";
ALTER INDEX "IX_Messages_Timestamp" RENAME TO "ix_messages_timestamp";
