-- CreateEnum
CREATE TYPE "Role" AS ENUM ('FOUNDER', 'CREATOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('TIKTOK', 'INSTAGRAM', 'FACEBOOK');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'PENDING_CREATOR', 'IN_PROGRESS', 'IN_REVIEW', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "VideoStatus" AS ENUM ('PENDING', 'DRAFT_SUBMITTED', 'IN_REVIEW', 'REVISION_REQUESTED', 'APPROVED', 'POSTED', 'LOCKED');

-- CreateEnum
CREATE TYPE "PaymentType" AS ENUM ('BASE_FEE', 'PERFORMANCE_BONUS', 'REFUND', 'REVENUE', 'PAYOUT');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TokenType" AS ENUM ('EMAIL_VERIFICATION', 'PASSWORD_RESET');

-- CreateEnum
CREATE TYPE "ScheduledPostStatus" AS ENUM ('PENDING', 'PROCESSING', 'PUBLISHED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ProcessingStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "DisputeCategory" AS ENUM ('VIEW_COUNT_DISCREPANCY', 'CONTENT_QUALITY', 'POSTING_VIOLATION', 'PAYMENT_ISSUE', 'OTHER');

-- CreateEnum
CREATE TYPE "DisputeStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('SYSTEM', 'CAMPAIGN_INVITE', 'APPLICATION_UPDATE', 'VIDEO_STATUS', 'PAYMENT', 'DISPUTE');

-- CreateEnum
CREATE TYPE "AdminLevel" AS ENUM ('JUNIOR', 'SENIOR', 'MANAGER', 'DIRECTOR');

-- CreateEnum
CREATE TYPE "AdminQueue" AS ENUM ('CREATOR_KYC', 'DISPUTES', 'CAMPAIGNS', 'SUPPORT', 'COMPLIANCE');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('CAMPAIGN_CREATED', 'VIDEO_SUBMITTED', 'VIDEO_APPROVED', 'PAYMENT_SENT', 'APPLICATION_SUBMITTED', 'MILESTONE_REACHED');

-- CreateEnum
CREATE TYPE "AssetType" AS ENUM ('VIDEO', 'IMAGE', 'DOCUMENT', 'AUDIO', 'OTHER');

-- CreateEnum
CREATE TYPE "VersionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "VariantStatus" AS ENUM ('DRAFT', 'PENDING_UPLOAD', 'ACTIVE', 'PAUSED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "FounderVideoStatus" AS ENUM ('DRAFT', 'READY_TO_POST', 'POSTED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'CREATOR',
    "full_name" TEXT NOT NULL,
    "company_name" TEXT,
    "stripe_customer_id" TEXT,
    "stripe_account_id" TEXT,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "email_verified_at" TIMESTAMP(3),
    "two_factor_enabled" BOOLEAN NOT NULL DEFAULT false,
    "two_factor_secret" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_login_at" TIMESTAMP(3),
    "suspended_until" TIMESTAMP(3),
    "suspension_reason" TEXT,
    "banned_reason" TEXT,
    "founder_tier" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "creator_profiles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "bio" TEXT,
    "categories" TEXT[],
    "base_fee_tiktok" DECIMAL(10,2) NOT NULL DEFAULT 75.00,
    "base_fee_instagram" DECIMAL(10,2) NOT NULL DEFAULT 75.00,
    "base_fee_facebook" DECIMAL(10,2) NOT NULL DEFAULT 75.00,
    "portfolio_videos" JSONB,
    "verification_status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "availability_status" TEXT,
    "response_time" TEXT,
    "is_onboarding_complete" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "admin_notes" TEXT,

    CONSTRAINT "creator_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_accounts" (
    "id" TEXT NOT NULL,
    "creator_id" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "platform_user_id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "follower_count" INTEGER,
    "access_token" TEXT,
    "refresh_token" TEXT,
    "token_expires_at" TIMESTAMP(3),
    "verified_at" TIMESTAMP(3),
    "last_synced_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "social_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "social_connections" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "platform_user_id" TEXT,
    "access_token" TEXT NOT NULL,
    "refresh_token" TEXT,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "scope" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "connected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "disconnected_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "social_connections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaigns" (
    "id" TEXT NOT NULL,
    "founder_id" TEXT NOT NULL,
    "creator_id" TEXT,
    "name" TEXT NOT NULL,
    "brand_name" TEXT,
    "description" TEXT,
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "platform" "Platform",
    "total_budget" DECIMAL(10,2) NOT NULL,
    "base_fee_budget" DECIMAL(10,2) NOT NULL,
    "performance_budget" DECIMAL(10,2) NOT NULL,
    "escrow_balance" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "videos_requested" INTEGER NOT NULL,
    "videos_completed" INTEGER NOT NULL DEFAULT 0,
    "posting_frequency" TEXT,
    "start_date" TIMESTAMP(3),
    "deadline" TIMESTAMP(3),
    "stripe_payment_intent_id" TEXT,
    "brief_data" JSONB,
    "final_views_total" INTEGER,
    "total_paid_to_creator" DECIMAL(10,2),
    "total_refunded_to_founder" DECIMAL(10,2),
    "platform_revenue" DECIMAL(10,2),
    "guaranteed_spend" BOOLEAN NOT NULL DEFAULT false,
    "target_views" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "videos" (
    "id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "creator_id" TEXT,
    "draft_video_url" TEXT,
    "final_post_url" TEXT,
    "platform" "Platform",
    "platform_video_id" TEXT,
    "status" "VideoStatus" NOT NULL DEFAULT 'PENDING',
    "submitted_at" TIMESTAMP(3),
    "approved_at" TIMESTAMP(3),
    "posted_at" TIMESTAMP(3),
    "locked_at" TIMESTAMP(3),
    "current_view_count" INTEGER NOT NULL DEFAULT 0,
    "locked_view_count" INTEGER,
    "last_view_update" TIMESTAMP(3),
    "base_fee_paid" BOOLEAN NOT NULL DEFAULT false,
    "base_fee_amount" DECIMAL(10,2),
    "performance_bonus_paid" BOOLEAN NOT NULL DEFAULT false,
    "performance_bonus_amount" DECIMAL(10,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "videos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "view_snapshots" (
    "id" TEXT NOT NULL,
    "video_id" TEXT NOT NULL,
    "view_count" INTEGER NOT NULL,
    "data_source" TEXT NOT NULL,
    "snapshot_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "view_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "revisions" (
    "id" TEXT NOT NULL,
    "video_id" TEXT NOT NULL,
    "requested_by" TEXT NOT NULL,
    "feedback" TEXT NOT NULL,
    "priority" TEXT,
    "deadline" TIMESTAMP(3),
    "iteration_number" INTEGER NOT NULL DEFAULT 1,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "revisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "campaign_id" TEXT,
    "video_id" TEXT,
    "recipient_id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "type" "PaymentType" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "description" TEXT,
    "stripe_transfer_id" TEXT,
    "stripe_refund_id" TEXT,
    "metadata" JSONB,
    "failure_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "processed_at" TIMESTAMP(3),

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settlements" (
    "id" TEXT NOT NULL,
    "video_id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "locked_views" INTEGER NOT NULL,
    "creator_performance_bonus" DECIMAL(10,2) NOT NULL,
    "nala_revenue" DECIMAL(10,2) NOT NULL,
    "founder_refund" DECIMAL(10,2) NOT NULL,
    "settled_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "settlements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "licenses" (
    "id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "video_id" TEXT NOT NULL,
    "creator_id" TEXT NOT NULL,
    "founder_id" TEXT NOT NULL,
    "license_number" TEXT NOT NULL,
    "pdf_url" TEXT,
    "grantee_id" TEXT,
    "granted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "licenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "revenue" (
    "id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "video_id" TEXT,
    "amount" DECIMAL(10,2) NOT NULL,
    "type" TEXT NOT NULL,
    "views_count" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "revenue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "type" "TokenType" NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scheduled_posts" (
    "id" TEXT NOT NULL,
    "video_id" TEXT NOT NULL,
    "creator_id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "scheduled_for" TIMESTAMP(3) NOT NULL,
    "timezone" TEXT NOT NULL DEFAULT 'America/New_York',
    "caption" TEXT,
    "hashtags" TEXT,
    "video_url" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "status" "ScheduledPostStatus" NOT NULL DEFAULT 'PENDING',
    "published_at" TIMESTAMP(3),
    "platform_post_id" TEXT,
    "platform_post_url" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "last_attempt_at" TIMESTAMP(3),
    "error_message" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scheduled_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "video_submissions" (
    "id" TEXT NOT NULL,
    "video_id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "creator_id" TEXT NOT NULL,
    "original_url" TEXT NOT NULL,
    "original_filename" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "duration" INTEGER,
    "resolution" TEXT,
    "watermarked_url" TEXT NOT NULL,
    "watermark_text" TEXT NOT NULL DEFAULT 'NALA - PENDING APPROVAL',
    "thumbnail_url" TEXT,
    "processing_status" "ProcessingStatus" NOT NULL DEFAULT 'PENDING',
    "processing_error" TEXT,
    "submission_notes" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "video_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_briefs" (
    "id" TEXT NOT NULL,
    "campaign_id" TEXT,
    "founder_id" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "product_description" TEXT NOT NULL,
    "target_audience" TEXT NOT NULL,
    "video_style" TEXT,
    "key_features" TEXT[],
    "tone" TEXT,
    "generated_script" TEXT,
    "talking_points" TEXT[],
    "hook_ideas" TEXT[],
    "hashtag_suggestions" TEXT[],
    "call_to_action" TEXT,
    "model" TEXT NOT NULL DEFAULT 'gpt-4',
    "tokens_used" INTEGER,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_briefs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applications" (
    "id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "creator_id" TEXT NOT NULL,
    "message" TEXT,
    "portfolio_links" TEXT[],
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disputes" (
    "id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "video_id" TEXT,
    "initiator_id" TEXT NOT NULL,
    "respondent_id" TEXT NOT NULL,
    "category" "DisputeCategory" NOT NULL,
    "description" TEXT NOT NULL,
    "status" "DisputeStatus" NOT NULL DEFAULT 'PENDING',
    "resolution" TEXT,
    "resolved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "disputes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dispute_messages" (
    "id" TEXT NOT NULL,
    "dispute_id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "is_internal" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dispute_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "dispute_evidence" (
    "id" TEXT NOT NULL,
    "dispute_id" TEXT NOT NULL,
    "uploader_id" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dispute_evidence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_users" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "admin_level" "AdminLevel" NOT NULL DEFAULT 'JUNIOR',
    "permissions" JSONB NOT NULL,
    "assigned_queue" "AdminQueue",
    "max_manual_override_amount" DECIMAL(12,2),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "two_factor_enabled" BOOLEAN NOT NULL DEFAULT false,
    "two_factor_secret" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_audit_logs" (
    "id" TEXT NOT NULL,
    "admin_id" TEXT NOT NULL,
    "action_type" TEXT NOT NULL,
    "resource_type" TEXT,
    "resource_id" TEXT,
    "details" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_dashboard_metrics" (
    "id" TEXT NOT NULL,
    "metric_type" TEXT NOT NULL,
    "metric_value" JSONB NOT NULL,
    "date_range" TEXT NOT NULL DEFAULT 'TODAY',
    "calculated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),

    CONSTRAINT "admin_dashboard_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_broadcasts" (
    "id" TEXT NOT NULL,
    "admin_id" TEXT NOT NULL,
    "recipient_type" TEXT NOT NULL,
    "recipient_ids" TEXT[],
    "subject" TEXT NOT NULL,
    "body_html" TEXT NOT NULL,
    "scheduled_for" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "sent_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sent_at" TIMESTAMP(3),

    CONSTRAINT "email_broadcasts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "video_formats" (
    "id" TEXT NOT NULL,
    "format_name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "platforms" "Platform"[],
    "optimal_length_min" INTEGER NOT NULL,
    "optimal_length_max" INTEGER NOT NULL,
    "tone" TEXT NOT NULL,
    "categories" TEXT[],
    "structure" JSONB NOT NULL,
    "best_practices" TEXT[],
    "first_used_date" TIMESTAMP(3) NOT NULL,
    "total_adopters" INTEGER NOT NULL DEFAULT 0,
    "adoption_trend" TEXT NOT NULL DEFAULT 'STABLE',
    "avg_views" INTEGER NOT NULL DEFAULT 0,
    "view_range" JSONB,
    "avg_engagement_rate" DECIMAL(5,2),
    "success_rate_50k_views" DECIMAL(5,2),
    "estimated_avg_earnings" DECIMAL(10,2),
    "trend_momentum" DECIMAL(5,2),
    "is_trending" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "video_formats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "creator_format_library" (
    "id" TEXT NOT NULL,
    "creator_id" TEXT NOT NULL,
    "format_id" TEXT NOT NULL,
    "saved_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "custom_notes" TEXT,
    "usage_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "creator_format_library_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "format_recommendations" (
    "id" TEXT NOT NULL,
    "creator_id" TEXT NOT NULL,
    "format_id" TEXT NOT NULL,
    "compatibility_score" DECIMAL(5,2) NOT NULL,
    "reason" TEXT,
    "estimated_earnings_impact" DECIMAL(10,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dismissed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "format_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "campaign_id" TEXT,
    "last_message_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversation_participants" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "last_read_at" TIMESTAMP(3),
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "conversation_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "attachments" JSONB,
    "read_by" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activities" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "ActivityType" NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assets" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "AssetType" NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "file_size" INTEGER NOT NULL,
    "mime_type" TEXT NOT NULL,
    "metadata" JSONB,
    "tags" TEXT[],
    "campaign_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "video_versions" (
    "id" TEXT NOT NULL,
    "video_id" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "submitted_by" TEXT NOT NULL,
    "video_url" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "notes" TEXT,
    "status" "VersionStatus" NOT NULL,
    "reviewed_by" TEXT,
    "review_notes" TEXT,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewed_at" TIMESTAMP(3),

    CONSTRAINT "video_versions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ugc_variants" (
    "id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "creator_id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "video_url" TEXT,
    "status" "VariantStatus" NOT NULL DEFAULT 'DRAFT',
    "utm_source" TEXT,
    "utm_medium" TEXT,
    "utm_campaign" TEXT,
    "tracking_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ugc_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "variant_metrics" (
    "id" TEXT NOT NULL,
    "variant_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "views" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "spend" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "revenue" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "ctr" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "conversion_rate" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "roi" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "performance_score" DECIMAL(5,2) NOT NULL DEFAULT 0,

    CONSTRAINT "variant_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "founder_videos" (
    "id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "founder_id" TEXT NOT NULL,
    "video_url" TEXT NOT NULL,
    "thumbnail_url" TEXT,
    "caption" TEXT,
    "description" TEXT,
    "platform" "Platform" NOT NULL,
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

-- CreateTable
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

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_stripe_customer_id_key" ON "users"("stripe_customer_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_stripe_account_id_key" ON "users"("stripe_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "creator_profiles_user_id_key" ON "creator_profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "social_accounts_creator_id_platform_key" ON "social_accounts"("creator_id", "platform");

-- CreateIndex
CREATE UNIQUE INDEX "social_connections_user_id_platform_key" ON "social_connections"("user_id", "platform");

-- CreateIndex
CREATE INDEX "campaigns_founder_id_status_idx" ON "campaigns"("founder_id", "status");

-- CreateIndex
CREATE INDEX "videos_campaign_id_status_idx" ON "videos"("campaign_id", "status");

-- CreateIndex
CREATE INDEX "videos_posted_at_idx" ON "videos"("posted_at");

-- CreateIndex
CREATE INDEX "view_snapshots_video_id_snapshot_at_idx" ON "view_snapshots"("video_id", "snapshot_at");

-- CreateIndex
CREATE INDEX "payments_campaign_id_type_status_idx" ON "payments"("campaign_id", "type", "status");

-- CreateIndex
CREATE UNIQUE INDEX "settlements_video_id_key" ON "settlements"("video_id");

-- CreateIndex
CREATE UNIQUE INDEX "licenses_license_number_key" ON "licenses"("license_number");

-- CreateIndex
CREATE INDEX "revenue_campaign_id_idx" ON "revenue"("campaign_id");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE INDEX "scheduled_posts_scheduled_for_status_idx" ON "scheduled_posts"("scheduled_for", "status");

-- CreateIndex
CREATE INDEX "scheduled_posts_creator_id_status_idx" ON "scheduled_posts"("creator_id", "status");

-- CreateIndex
CREATE INDEX "video_submissions_video_id_idx" ON "video_submissions"("video_id");

-- CreateIndex
CREATE INDEX "video_submissions_creator_id_idx" ON "video_submissions"("creator_id");

-- CreateIndex
CREATE INDEX "ai_briefs_founder_id_idx" ON "ai_briefs"("founder_id");

-- CreateIndex
CREATE UNIQUE INDEX "applications_campaign_id_creator_id_key" ON "applications"("campaign_id", "creator_id");

-- CreateIndex
CREATE INDEX "dispute_messages_dispute_id_idx" ON "dispute_messages"("dispute_id");

-- CreateIndex
CREATE INDEX "dispute_evidence_dispute_id_idx" ON "dispute_evidence"("dispute_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_idx" ON "notifications"("user_id", "is_read");

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_user_id_key" ON "admin_users"("user_id");

-- CreateIndex
CREATE INDEX "admin_users_admin_level_idx" ON "admin_users"("admin_level");

-- CreateIndex
CREATE INDEX "admin_users_assigned_queue_idx" ON "admin_users"("assigned_queue");

-- CreateIndex
CREATE INDEX "admin_audit_logs_admin_id_idx" ON "admin_audit_logs"("admin_id");

-- CreateIndex
CREATE INDEX "admin_audit_logs_action_type_idx" ON "admin_audit_logs"("action_type");

-- CreateIndex
CREATE INDEX "admin_audit_logs_resource_type_idx" ON "admin_audit_logs"("resource_type");

-- CreateIndex
CREATE INDEX "admin_audit_logs_created_at_idx" ON "admin_audit_logs"("created_at");

-- CreateIndex
CREATE INDEX "admin_dashboard_metrics_metric_type_idx" ON "admin_dashboard_metrics"("metric_type");

-- CreateIndex
CREATE INDEX "admin_dashboard_metrics_expires_at_idx" ON "admin_dashboard_metrics"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "admin_dashboard_metrics_metric_type_date_range_key" ON "admin_dashboard_metrics"("metric_type", "date_range");

-- CreateIndex
CREATE INDEX "email_broadcasts_admin_id_idx" ON "email_broadcasts"("admin_id");

-- CreateIndex
CREATE INDEX "email_broadcasts_status_idx" ON "email_broadcasts"("status");

-- CreateIndex
CREATE INDEX "email_broadcasts_scheduled_for_idx" ON "email_broadcasts"("scheduled_for");

-- CreateIndex
CREATE UNIQUE INDEX "creator_format_library_creator_id_format_id_key" ON "creator_format_library"("creator_id", "format_id");

-- CreateIndex
CREATE INDEX "format_recommendations_creator_id_idx" ON "format_recommendations"("creator_id");

-- CreateIndex
CREATE INDEX "conversations_campaign_id_idx" ON "conversations"("campaign_id");

-- CreateIndex
CREATE INDEX "conversation_participants_user_id_idx" ON "conversation_participants"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "conversation_participants_conversation_id_user_id_key" ON "conversation_participants"("conversation_id", "user_id");

-- CreateIndex
CREATE INDEX "messages_conversation_id_created_at_idx" ON "messages"("conversation_id", "created_at");

-- CreateIndex
CREATE INDEX "messages_sender_id_idx" ON "messages"("sender_id");

-- CreateIndex
CREATE INDEX "activities_user_id_created_at_idx" ON "activities"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "activities_entity_type_entity_id_idx" ON "activities"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "assets_user_id_type_idx" ON "assets"("user_id", "type");

-- CreateIndex
CREATE INDEX "assets_campaign_id_idx" ON "assets"("campaign_id");

-- CreateIndex
CREATE INDEX "video_versions_video_id_version_idx" ON "video_versions"("video_id", "version");

-- CreateIndex
CREATE INDEX "video_versions_status_idx" ON "video_versions"("status");

-- CreateIndex
CREATE INDEX "ugc_variants_campaign_id_idx" ON "ugc_variants"("campaign_id");

-- CreateIndex
CREATE INDEX "ugc_variants_creator_id_idx" ON "ugc_variants"("creator_id");

-- CreateIndex
CREATE INDEX "variant_metrics_variant_id_date_idx" ON "variant_metrics"("variant_id", "date");

-- CreateIndex
CREATE INDEX "founder_videos_campaign_id_status_idx" ON "founder_videos"("campaign_id", "status");

-- CreateIndex
CREATE INDEX "founder_video_snapshots_video_id_snapshot_at_idx" ON "founder_video_snapshots"("video_id", "snapshot_at");

-- AddForeignKey
ALTER TABLE "creator_profiles" ADD CONSTRAINT "creator_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "social_accounts" ADD CONSTRAINT "social_accounts_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "social_connections" ADD CONSTRAINT "social_connections_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_founder_id_fkey" FOREIGN KEY ("founder_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "videos" ADD CONSTRAINT "videos_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "videos" ADD CONSTRAINT "videos_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "view_snapshots" ADD CONSTRAINT "view_snapshots_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "videos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "revisions" ADD CONSTRAINT "revisions_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "videos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "videos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "licenses" ADD CONSTRAINT "licenses_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "licenses" ADD CONSTRAINT "licenses_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "videos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "licenses" ADD CONSTRAINT "licenses_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "licenses" ADD CONSTRAINT "licenses_founder_id_fkey" FOREIGN KEY ("founder_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "licenses" ADD CONSTRAINT "licenses_grantee_id_fkey" FOREIGN KEY ("grantee_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "videos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_initiator_id_fkey" FOREIGN KEY ("initiator_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_respondent_id_fkey" FOREIGN KEY ("respondent_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispute_messages" ADD CONSTRAINT "dispute_messages_dispute_id_fkey" FOREIGN KEY ("dispute_id") REFERENCES "disputes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispute_messages" ADD CONSTRAINT "dispute_messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispute_evidence" ADD CONSTRAINT "dispute_evidence_dispute_id_fkey" FOREIGN KEY ("dispute_id") REFERENCES "disputes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dispute_evidence" ADD CONSTRAINT "dispute_evidence_uploader_id_fkey" FOREIGN KEY ("uploader_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_users" ADD CONSTRAINT "admin_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "admin_audit_logs" ADD CONSTRAINT "admin_audit_logs_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admin_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_broadcasts" ADD CONSTRAINT "email_broadcasts_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "admin_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creator_format_library" ADD CONSTRAINT "creator_format_library_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creator_format_library" ADD CONSTRAINT "creator_format_library_format_id_fkey" FOREIGN KEY ("format_id") REFERENCES "video_formats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "format_recommendations" ADD CONSTRAINT "format_recommendations_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "format_recommendations" ADD CONSTRAINT "format_recommendations_format_id_fkey" FOREIGN KEY ("format_id") REFERENCES "video_formats"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "conversation_participants" ADD CONSTRAINT "conversation_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assets" ADD CONSTRAINT "assets_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_versions" ADD CONSTRAINT "video_versions_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "videos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_versions" ADD CONSTRAINT "video_versions_submitted_by_fkey" FOREIGN KEY ("submitted_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "video_versions" ADD CONSTRAINT "video_versions_reviewed_by_fkey" FOREIGN KEY ("reviewed_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ugc_variants" ADD CONSTRAINT "ugc_variants_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ugc_variants" ADD CONSTRAINT "ugc_variants_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "variant_metrics" ADD CONSTRAINT "variant_metrics_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "ugc_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "founder_videos" ADD CONSTRAINT "founder_videos_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "founder_videos" ADD CONSTRAINT "founder_videos_founder_id_fkey" FOREIGN KEY ("founder_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "founder_video_snapshots" ADD CONSTRAINT "founder_video_snapshots_video_id_fkey" FOREIGN KEY ("video_id") REFERENCES "founder_videos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
