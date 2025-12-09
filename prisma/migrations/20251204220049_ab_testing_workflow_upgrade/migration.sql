/*
  Warnings:

  - You are about to drop the column `completedAt` on the `ab_tests` table. All the data in the column will be lost.
  - You are about to drop the column `winnerVariantId` on the `ab_tests` table. All the data in the column will be lost.
  - You are about to alter the column `confidence` on the `ab_tests` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(5,2)`.
  - Made the column `target_views` on table `campaigns` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "DraftStatus" AS ENUM ('PENDING_REVIEW', 'APPROVED', 'REVISION_REQUESTED');

-- CreateEnum
CREATE TYPE "InstructionType" AS ENUM ('GLOBAL', 'VIDEO_SPECIFIC');

-- CreateEnum
CREATE TYPE "InstructionStatus" AS ENUM ('OPEN', 'UPDATED', 'CLOSED');

-- CreateEnum
CREATE TYPE "VariantApprovalStatus" AS ENUM ('PENDING_UPLOAD', 'PENDING_REVIEW', 'REVISION_REQUESTED', 'APPROVED', 'DEPLOYED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ABTestStatus" ADD VALUE 'PENDING_CONTENT';
ALTER TYPE "ABTestStatus" ADD VALUE 'IN_REVIEW';

-- AlterTable
ALTER TABLE "ab_test_variants" ADD COLUMN     "approval_status" "VariantApprovalStatus" NOT NULL DEFAULT 'PENDING_UPLOAD',
ADD COLUMN     "approved_at" TIMESTAMP(3),
ADD COLUMN     "deployed_at" TIMESTAMP(3),
ADD COLUMN     "founder_feedback" TEXT,
ADD COLUMN     "revision_deadline" TIMESTAMP(3),
ADD COLUMN     "uploaded_at" TIMESTAMP(3),
ADD COLUMN     "variant_instructions" JSONB,
ADD COLUMN     "video_upload_url" TEXT;

-- AlterTable
ALTER TABLE "ab_tests" DROP COLUMN "completedAt",
DROP COLUMN "winnerVariantId",
ADD COLUMN     "adopt_action" TEXT,
ADD COLUMN     "adopted_variant_id" TEXT,
ADD COLUMN     "assigned_creator_ids" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "completed_at" TIMESTAMP(3),
ADD COLUMN     "conclusion_notes" TEXT,
ADD COLUMN     "deployed_at" TIMESTAMP(3),
ADD COLUMN     "hypothesis" TEXT,
ADD COLUMN     "test_variables" JSONB,
ADD COLUMN     "tracking_metrics" JSONB,
ADD COLUMN     "winner_variant_id" TEXT,
ALTER COLUMN "confidence" SET DATA TYPE DECIMAL(5,2);

-- AlterTable
ALTER TABLE "applications" ADD COLUMN     "assigned_at" TIMESTAMP(3),
ADD COLUMN     "instruction_deadlines" JSONB,
ADD COLUMN     "instruction_library_items" JSONB,
ADD COLUMN     "instruction_links" JSONB,
ADD COLUMN     "overall_instructions" TEXT,
ADD COLUMN     "rejected_at" TIMESTAMP(3),
ADD COLUMN     "rejection_reason" TEXT,
ADD COLUMN     "video_instructions" JSONB;

-- AlterTable
ALTER TABLE "campaigns" ADD COLUMN     "base_fee_per_video" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "performance_rate" DECIMAL(10,2) NOT NULL DEFAULT 4.00,
ALTER COLUMN "target_views" SET NOT NULL,
ALTER COLUMN "target_views" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "company_industry" TEXT,
ADD COLUMN     "company_logo" TEXT,
ADD COLUMN     "company_size" TEXT,
ADD COLUMN     "company_website" TEXT,
ADD COLUMN     "language" TEXT DEFAULT 'en',
ADD COLUMN     "phone_number" TEXT,
ADD COLUMN     "profile_picture_url" TEXT,
ADD COLUMN     "timezone" TEXT DEFAULT 'UTC';

-- AlterTable
ALTER TABLE "videos" ADD COLUMN     "deadline" TIMESTAMP(3),
ADD COLUMN     "founder_comments" TEXT,
ADD COLUMN     "last_reviewed_at" TIMESTAMP(3),
ADD COLUMN     "performance_metrics" JSONB,
ADD COLUMN     "revision_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "revision_deadline" TIMESTAMP(3),
ADD COLUMN     "title" TEXT,
ADD COLUMN     "video_number" INTEGER;

-- CreateTable
CREATE TABLE "draft_submissions" (
    "id" TEXT NOT NULL,
    "video_id" TEXT NOT NULL,
    "draft_url" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "status" "DraftStatus" NOT NULL DEFAULT 'PENDING_REVIEW',
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "instruction_links" JSONB,
    "instruction_library_items" JSONB,

    CONSTRAINT "draft_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "instruction_templates" (
    "id" TEXT NOT NULL,
    "founder_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "type" "InstructionType" NOT NULL DEFAULT 'GLOBAL',
    "attached_links" JSONB,
    "attached_library_items" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "instruction_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "instructions" (
    "id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "attached_library_item_id" TEXT,
    "author_id" TEXT NOT NULL,
    "applies_to" TEXT NOT NULL,
    "status" "InstructionStatus" NOT NULL DEFAULT 'OPEN',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "instructions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "instruction_audits" (
    "id" TEXT NOT NULL,
    "instruction_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "actor_id" TEXT NOT NULL,
    "changes" JSONB NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "instruction_audits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_preferences" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "email_campaign_updates" BOOLEAN NOT NULL DEFAULT true,
    "email_payments" BOOLEAN NOT NULL DEFAULT true,
    "email_deadlines" BOOLEAN NOT NULL DEFAULT true,
    "email_new_messages" BOOLEAN NOT NULL DEFAULT true,
    "email_applications" BOOLEAN NOT NULL DEFAULT true,
    "push_notifications" BOOLEAN NOT NULL DEFAULT true,
    "sms_notifications" BOOLEAN NOT NULL DEFAULT false,
    "notification_frequency" TEXT NOT NULL DEFAULT 'realtime',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ab_test_performance_snapshots" (
    "id" TEXT NOT NULL,
    "variant_id" TEXT NOT NULL,
    "test_id" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "watchTime" INTEGER NOT NULL DEFAULT 0,
    "engagement_rate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "ctr" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "conversion_rate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "snapshot_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ab_test_performance_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "draft_submissions_video_id_idx" ON "draft_submissions"("video_id");

-- CreateIndex
CREATE INDEX "instruction_templates_founder_id_idx" ON "instruction_templates"("founder_id");

-- CreateIndex
CREATE INDEX "instructions_campaign_id_status_idx" ON "instructions"("campaign_id", "status");

-- CreateIndex
CREATE INDEX "instruction_audits_instruction_id_timestamp_idx" ON "instruction_audits"("instruction_id", "timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_user_id_key" ON "notification_preferences"("user_id");

-- CreateIndex
CREATE INDEX "ab_test_performance_snapshots_variant_id_snapshot_at_idx" ON "ab_test_performance_snapshots"("variant_id", "snapshot_at");

-- CreateIndex
CREATE INDEX "ab_test_performance_snapshots_test_id_snapshot_at_idx" ON "ab_test_performance_snapshots"("test_id", "snapshot_at");

-- CreateIndex
CREATE INDEX "ab_test_variants_creator_id_idx" ON "ab_test_variants"("creator_id");

-- CreateIndex
CREATE INDEX "ab_test_variants_approval_status_idx" ON "ab_test_variants"("approval_status");

-- CreateIndex
CREATE INDEX "ab_tests_status_idx" ON "ab_tests"("status");

-- AddForeignKey
ALTER TABLE "draft_submissions" ADD CONSTRAINT "draft_submissions_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "videos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instruction_templates" ADD CONSTRAINT "instruction_templates_founder_id_fkey" FOREIGN KEY ("founder_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instructions" ADD CONSTRAINT "instructions_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instructions" ADD CONSTRAINT "instructions_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instruction_audits" ADD CONSTRAINT "instruction_audits_instruction_id_fkey" FOREIGN KEY ("instruction_id") REFERENCES "instructions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "instruction_audits" ADD CONSTRAINT "instruction_audits_actor_id_fkey" FOREIGN KEY ("actor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ab_test_performance_snapshots" ADD CONSTRAINT "ab_test_performance_snapshots_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "ab_test_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ab_test_performance_snapshots" ADD CONSTRAINT "ab_test_performance_snapshots_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "ab_tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
