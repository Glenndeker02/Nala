-- CreateEnum
CREATE TYPE "GoalType" AS ENUM ('VIEWS', 'VIDEOS_COMPLETED', 'ENGAGEMENT_RATE', 'CONVERSIONS', 'CLICKS');

-- CreateEnum
CREATE TYPE "GoalStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "TestGoal" AS ENUM ('BEST_HOOK', 'BEST_CREATOR', 'BEST_FORMAT', 'BEST_CTA', 'BEST_OVERALL');

-- CreateEnum
CREATE TYPE "SuccessMetric" AS ENUM ('VIEW_THROUGH_RATE', 'CONVERSION_RATE', 'ENGAGEMENT_RATE', 'COST_PER_VIEW', 'TOTAL_VIEWS');

-- CreateEnum
CREATE TYPE "ABTestStatus" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "VariantType" AS ENUM ('CREATOR', 'FORMAT', 'HOOK', 'SCRIPT', 'FOUNDER_VIDEO', 'CUSTOM');

-- AlterEnum
ALTER TYPE "CampaignStatus" ADD VALUE 'ACTIVE_ACCEPTING_APPLICATIONS';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'FORMAT_ASSIGNED';
ALTER TYPE "NotificationType" ADD VALUE 'AB_TEST_COMPLETED';
ALTER TYPE "NotificationType" ADD VALUE 'GOAL_MILESTONE';
ALTER TYPE "NotificationType" ADD VALUE 'FOUNDER_VIDEO_POSTED';
ALTER TYPE "NotificationType" ADD VALUE 'PERFORMANCE_ALERT';

-- AlterTable
ALTER TABLE "applications" ADD COLUMN     "acceptance_deadline" TIMESTAMP(3),
ADD COLUMN     "acceptance_instructions" TEXT,
ADD COLUMN     "accepted_at" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "campaigns" ADD COLUMN     "accepted_creators_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "eligibility_rules" JSONB,
ADD COLUMN     "notifications_sent" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "creator_profiles" ADD COLUMN     "avg_rating" DECIMAL(3,2) NOT NULL DEFAULT 0,
ADD COLUMN     "avg_response_time_hours" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "campaign_participation_rate" DECIMAL(5,2) NOT NULL DEFAULT 0,
ADD COLUMN     "conversion_rate" DECIMAL(5,2) NOT NULL DEFAULT 0,
ADD COLUMN     "dispute_count" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "last_ranking_update" TIMESTAMP(3),
ADD COLUMN     "ranking_history" JSONB,
ADD COLUMN     "ranking_score" INTEGER NOT NULL DEFAULT 50,
ADD COLUMN     "selection_rate" DECIMAL(5,2) NOT NULL DEFAULT 0,
ADD COLUMN     "total_reviews" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "video_quality_score" DECIMAL(5,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "notifications" ADD COLUMN     "metadata" JSONB;

-- CreateTable
CREATE TABLE "campaign_goals" (
    "id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "GoalType" NOT NULL,
    "target_value" DECIMAL(10,2) NOT NULL,
    "current_value" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "deadline" TIMESTAMP(3),
    "status" "GoalStatus" NOT NULL DEFAULT 'IN_PROGRESS',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaign_goals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "creator_performance_metrics" (
    "id" TEXT NOT NULL,
    "creator_id" TEXT NOT NULL,
    "platform" "Platform",
    "total_views" INTEGER NOT NULL DEFAULT 0,
    "total_engagement" INTEGER NOT NULL DEFAULT 0,
    "avg_watch_time" DECIMAL(5,2),
    "videos_posted" INTEGER NOT NULL DEFAULT 0,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "periodType" TEXT NOT NULL DEFAULT 'WEEK',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "creator_performance_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ab_tests" (
    "id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "testGoal" "TestGoal" NOT NULL,
    "successMetric" "SuccessMetric" NOT NULL,
    "status" "ABTestStatus" NOT NULL DEFAULT 'DRAFT',
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "winnerVariantId" TEXT,
    "confidence" DECIMAL(65,30),
    "results" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ab_tests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ab_test_variants" (
    "id" TEXT NOT NULL,
    "test_id" TEXT NOT NULL,
    "variantName" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "variantType" "VariantType" NOT NULL,
    "creator_id" TEXT,
    "format_id" TEXT,
    "founder_video_id" TEXT,
    "instructions" TEXT,
    "scriptTemplate" TEXT,
    "hookTemplate" TEXT,
    "video_id" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "engagement" INTEGER NOT NULL DEFAULT 0,
    "cost_per_view" DECIMAL(10,2),
    "performance_score" DECIMAL(5,2) DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ab_test_variants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "campaign_goals_campaign_id_idx" ON "campaign_goals"("campaign_id");

-- CreateIndex
CREATE INDEX "creator_performance_metrics_creator_id_platform_period_star_idx" ON "creator_performance_metrics"("creator_id", "platform", "period_start");

-- CreateIndex
CREATE INDEX "ab_tests_campaign_id_idx" ON "ab_tests"("campaign_id");

-- CreateIndex
CREATE UNIQUE INDEX "ab_test_variants_video_id_key" ON "ab_test_variants"("video_id");

-- CreateIndex
CREATE INDEX "ab_test_variants_test_id_idx" ON "ab_test_variants"("test_id");

-- AddForeignKey
ALTER TABLE "campaign_goals" ADD CONSTRAINT "campaign_goals_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ab_tests" ADD CONSTRAINT "ab_tests_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ab_test_variants" ADD CONSTRAINT "ab_test_variants_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "ab_tests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ab_test_variants" ADD CONSTRAINT "ab_test_variants_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ab_test_variants" ADD CONSTRAINT "ab_test_variants_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "videos"("id") ON DELETE SET NULL ON UPDATE CASCADE;
