CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'BLOCKED');
CREATE TYPE "StoryVisibility" AS ENUM ('PUBLIC', 'HIDDEN');

ALTER TABLE "users"
    ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'USER',
    ADD COLUMN "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    ADD COLUMN "blocked_at" TIMESTAMPTZ(6),
    ADD COLUMN "blocked_reason" TEXT;

ALTER TABLE "stories"
    ADD COLUMN "visibility" "StoryVisibility" NOT NULL DEFAULT 'PUBLIC';

CREATE TABLE "admin_audit_logs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "actor_id" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "target_type" TEXT NOT NULL,
    "target_id" TEXT NOT NULL,
    "details" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_audit_logs_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "users_role_idx" ON "users"("role");
CREATE INDEX "users_status_idx" ON "users"("status");
CREATE INDEX "stories_visibility_idx" ON "stories"("visibility");
CREATE INDEX "admin_audit_logs_actor_id_idx" ON "admin_audit_logs"("actor_id");
CREATE INDEX "admin_audit_logs_created_at_idx" ON "admin_audit_logs"("created_at");

ALTER TABLE "admin_audit_logs"
    ADD CONSTRAINT "admin_audit_logs_actor_id_fkey"
    FOREIGN KEY ("actor_id")
    REFERENCES "users"("id")
    ON DELETE RESTRICT
    ON UPDATE CASCADE;
