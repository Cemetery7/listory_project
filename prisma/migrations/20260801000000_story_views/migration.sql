CREATE TABLE "story_views" (
    "story_id" UUID NOT NULL,
    "viewer_id" UUID NOT NULL,
    "viewed_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "story_views_pkey" PRIMARY KEY ("story_id", "viewer_id")
);

CREATE INDEX "story_views_viewer_id_idx" ON "story_views"("viewer_id");

ALTER TABLE "story_views"
    ADD CONSTRAINT "story_views_story_id_fkey"
    FOREIGN KEY ("story_id")
    REFERENCES "stories"("id")
    ON DELETE CASCADE
    ON UPDATE CASCADE;

ALTER TABLE "story_views"
    ADD CONSTRAINT "story_views_viewer_id_fkey"
    FOREIGN KEY ("viewer_id")
    REFERENCES "users"("id")
    ON DELETE CASCADE
    ON UPDATE CASCADE;
