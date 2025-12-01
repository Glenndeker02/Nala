-- Advanced Campaign System - Phase 1: Founder Videos
-- This migration adds support for founders to upload their own videos

-- Create FounderVideoStatus enum
CREATE TYPE "FounderVideoStatus" AS ENUM ('DRAFT', 'READY_TO_POST', 'POSTED', 'ARCHIVED');

-- Create founder_videos table
CREATE TABLE "founder_videos" (
    "id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "founder_id" TEXT NOT NULL,
    "video_url" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "caption" TEXT,
    "description" TEXT,
    "platform" "Platform",
    "status" "FounderVideoStatus" NOT NULL DEFAULT 'DRAFT',
    "is_draft" BOOLEAN NOT NULL DEFAULT true,
    "final_post_url" TEXT,
    "platform_video_id" TEXT,
    "posted_at" TIMESTAMP(3),
    "current_view_count" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "completion_rate" DECIMAL(5,2),
    "engagement_rate" DECIMAL(5,2),
    "watch_time" INTEGER,
    "cost_per_click" DECIMAL(10,2),
    "cost_per_acquisition" DECIMAL(10,2),
    "conversion_rate" DECIMAL(5,2),
    "ab_test_id" TEXT,
    "variant_label" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "founder_videos_pkey" PRIMARY KEY ("id")
);

-- Create founder_video_snapshots table
CREATE TABLE "founder_video_snapshots" (
    "id" TEXT NOT NULL,
    "video_id" TEXT NOT NULL,
    "view_count" INTEGER NOT NULL,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "snapshot_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "founder_video_snapshots_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE INDEX "founder_videos_campaign_id_status_idx" ON "founder_videos"("campaign_id", "status");
CREATE INDEX "founder_video_snapshots_video_id_snapshot_at_idx" ON "founder_video_snapshots"("video_id", "snapshot_at");

-- Add foreign key constraints
ALTER TABLE "founder_videos" ADD CONSTRAINT "founder_videos_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "founder_videos" ADD CONSTRAINT "founder_videos_founder_id_fkey" FOREIGN KEY ("founder_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "founder_video_snapshots" ADD CONSTRAINT "founder_video_snapshots_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "founder_videos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
