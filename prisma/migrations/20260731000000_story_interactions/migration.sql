CREATE TABLE "story_likes" (
    "user_id" UUID NOT NULL,
    "story_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "story_likes_pkey" PRIMARY KEY ("user_id", "story_id")
);

CREATE TABLE "comments" (
    "id" UUID NOT NULL,
    "story_id" UUID NOT NULL,
    "chapter_id" UUID,
    "author_id" UUID NOT NULL,
    "parent_id" UUID,
    "content" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "comments_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "story_likes_story_id_idx" ON "story_likes"("story_id");
CREATE INDEX "comments_story_id_created_at_idx" ON "comments"("story_id", "created_at");
CREATE INDEX "comments_chapter_id_idx" ON "comments"("chapter_id");
CREATE INDEX "comments_author_id_idx" ON "comments"("author_id");
CREATE INDEX "comments_parent_id_idx" ON "comments"("parent_id");

ALTER TABLE "story_likes" ADD CONSTRAINT "story_likes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "story_likes" ADD CONSTRAINT "story_likes_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "stories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "comments" ADD CONSTRAINT "comments_story_id_fkey" FOREIGN KEY ("story_id") REFERENCES "stories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "comments" ADD CONSTRAINT "comments_chapter_id_fkey" FOREIGN KEY ("chapter_id") REFERENCES "chapters"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "comments" ADD CONSTRAINT "comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "comments" ADD CONSTRAINT "comments_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "comments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
