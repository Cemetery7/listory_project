CREATE TYPE "NotificationType" AS ENUM (
  'NEW_FOLLOWER',
  'STORY_LIKED',
  'STORY_COMMENTED',
  'COMMENT_REPLIED',
  'AUTHOR_PUBLISHED'
);

CREATE TABLE "author_follows" (
  "follower_id" UUID NOT NULL,
  "author_id" UUID NOT NULL,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "author_follows_pkey" PRIMARY KEY ("follower_id", "author_id")
);

CREATE TABLE "notifications" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "recipient_id" UUID NOT NULL,
  "actor_id" UUID,
  "story_id" UUID,
  "comment_id" UUID,
  "type" "NotificationType" NOT NULL,
  "dedupe_key" TEXT NOT NULL,
  "read_at" TIMESTAMPTZ(6),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "author_follows_author_id_created_at_idx" ON "author_follows"("author_id", "created_at");
CREATE INDEX "author_follows_follower_id_created_at_idx" ON "author_follows"("follower_id", "created_at");
CREATE UNIQUE INDEX "notifications_dedupe_key_key" ON "notifications"("dedupe_key");
CREATE INDEX "notifications_recipient_id_read_at_created_at_idx" ON "notifications"("recipient_id", "read_at", "created_at");
CREATE INDEX "notifications_recipient_id_created_at_idx" ON "notifications"("recipient_id", "created_at");
CREATE INDEX "notifications_actor_id_idx" ON "notifications"("actor_id");
CREATE INDEX "notifications_story_id_idx" ON "notifications"("story_id");

ALTER TABLE "author_follows" ADD CONSTRAINT "author_follows_follower_id_fkey" FOREIGN KEY ("follower_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "author_follows" ADD CONSTRAINT "author_follows_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "stories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_comment_id_fkey" FOREIGN KEY ("comment_id") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
