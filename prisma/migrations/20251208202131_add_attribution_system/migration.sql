-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('INVITED', 'APPLIED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "RedemptionEventType" AS ENUM ('SIGNUP', 'PAID', 'DOWNLOAD');

-- CreateEnum
CREATE TYPE "ViewPaymentStatus" AS ENUM ('PENDING', 'PAID', 'DISPUTED');

-- CreateEnum
CREATE TYPE "PayoutType" AS ENUM ('BASE_FEE', 'VIEW_PAY', 'SUBSCRIPTION_BONUS');

-- CreateEnum
CREATE TYPE "PayoutStatus" AS ENUM ('PENDING', 'PROCESSING', 'PAID', 'FAILED', 'REVERSED');

-- AlterTable
ALTER TABLE "campaigns" ADD COLUMN     "budget_reserved" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "creator_subscription_share" DECIMAL(5,2),
ADD COLUMN     "enable_creator_codes" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "creator_profiles" ADD COLUMN     "code_prefix" TEXT,
ADD COLUMN     "external_identifier" TEXT;

-- CreateTable
CREATE TABLE "creator_campaign_assignments" (
    "id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "creator_id" TEXT NOT NULL,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'INVITED',
    "assigned_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "accepted_at" TIMESTAMP(3),
    "rejected_at" TIMESTAMP(3),
    "base_fee" DECIMAL(10,2),
    "videos_assigned" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "creator_campaign_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attribution_codes" (
    "id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "creator_id" TEXT NOT NULL,
    "assignment_id" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "code" TEXT NOT NULL,
    "generated_by" TEXT NOT NULL,
    "generated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "expiry_date" TIMESTAMP(3),

    CONSTRAINT "attribution_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "code_redemptions" (
    "id" TEXT NOT NULL,
    "code_id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "creator_id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "external_event_id" TEXT NOT NULL,
    "external_user_id" TEXT,
    "event_type" "RedemptionEventType" NOT NULL,
    "event_value" JSONB,
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "verified_at" TIMESTAMP(3),
    "verification_reference" TEXT,

    CONSTRAINT "code_redemptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "view_payments" (
    "id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "creator_id" TEXT,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "views_count" INTEGER NOT NULL,
    "amount_due_creator" DECIMAL(10,2) NOT NULL,
    "amount_charged_founder" DECIMAL(10,2) NOT NULL,
    "status" "ViewPaymentStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "view_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payouts" (
    "id" TEXT NOT NULL,
    "assignment_id" TEXT,
    "creator_id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "type" "PayoutType" NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "PayoutStatus" NOT NULL DEFAULT 'PENDING',
    "reference" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "paid_at" TIMESTAMP(3),

    CONSTRAINT "payouts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscription_events" (
    "id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "creator_id" TEXT NOT NULL,
    "redemption_id" TEXT NOT NULL,
    "external_customer_id" TEXT NOT NULL,
    "plan_price" DECIMAL(10,2) NOT NULL,
    "creator_bonus" DECIMAL(10,2) NOT NULL,
    "platform_fee" DECIMAL(10,2) NOT NULL,
    "paid_at" TIMESTAMP(3) NOT NULL,
    "platform_receipt" JSONB,
    "reconciled" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscription_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "creator_campaign_assignments_campaign_id_idx" ON "creator_campaign_assignments"("campaign_id");

-- CreateIndex
CREATE INDEX "creator_campaign_assignments_creator_id_idx" ON "creator_campaign_assignments"("creator_id");

-- CreateIndex
CREATE INDEX "creator_campaign_assignments_status_idx" ON "creator_campaign_assignments"("status");

-- CreateIndex
CREATE UNIQUE INDEX "creator_campaign_assignments_campaign_id_creator_id_key" ON "creator_campaign_assignments"("campaign_id", "creator_id");

-- CreateIndex
CREATE UNIQUE INDEX "attribution_codes_code_key" ON "attribution_codes"("code");

-- CreateIndex
CREATE INDEX "attribution_codes_code_idx" ON "attribution_codes"("code");

-- CreateIndex
CREATE INDEX "attribution_codes_campaign_id_idx" ON "attribution_codes"("campaign_id");

-- CreateIndex
CREATE INDEX "attribution_codes_creator_id_idx" ON "attribution_codes"("creator_id");

-- CreateIndex
CREATE INDEX "attribution_codes_active_idx" ON "attribution_codes"("active");

-- CreateIndex
CREATE UNIQUE INDEX "attribution_codes_campaign_id_creator_id_platform_key" ON "attribution_codes"("campaign_id", "creator_id", "platform");

-- CreateIndex
CREATE UNIQUE INDEX "code_redemptions_external_event_id_key" ON "code_redemptions"("external_event_id");

-- CreateIndex
CREATE INDEX "code_redemptions_code_id_idx" ON "code_redemptions"("code_id");

-- CreateIndex
CREATE INDEX "code_redemptions_campaign_id_idx" ON "code_redemptions"("campaign_id");

-- CreateIndex
CREATE INDEX "code_redemptions_creator_id_idx" ON "code_redemptions"("creator_id");

-- CreateIndex
CREATE INDEX "code_redemptions_verified_idx" ON "code_redemptions"("verified");

-- CreateIndex
CREATE INDEX "code_redemptions_event_type_idx" ON "code_redemptions"("event_type");

-- CreateIndex
CREATE INDEX "view_payments_campaign_id_creator_id_period_start_idx" ON "view_payments"("campaign_id", "creator_id", "period_start");

-- CreateIndex
CREATE INDEX "view_payments_status_idx" ON "view_payments"("status");

-- CreateIndex
CREATE INDEX "payouts_creator_id_idx" ON "payouts"("creator_id");

-- CreateIndex
CREATE INDEX "payouts_campaign_id_idx" ON "payouts"("campaign_id");

-- CreateIndex
CREATE INDEX "payouts_status_idx" ON "payouts"("status");

-- CreateIndex
CREATE INDEX "payouts_type_idx" ON "payouts"("type");

-- CreateIndex
CREATE INDEX "subscription_events_campaign_id_idx" ON "subscription_events"("campaign_id");

-- CreateIndex
CREATE INDEX "subscription_events_creator_id_idx" ON "subscription_events"("creator_id");

-- CreateIndex
CREATE INDEX "subscription_events_reconciled_idx" ON "subscription_events"("reconciled");

-- AddForeignKey
ALTER TABLE "creator_campaign_assignments" ADD CONSTRAINT "creator_campaign_assignments_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "creator_campaign_assignments" ADD CONSTRAINT "creator_campaign_assignments_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attribution_codes" ADD CONSTRAINT "attribution_codes_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "creator_campaign_assignments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attribution_codes" ADD CONSTRAINT "attribution_codes_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attribution_codes" ADD CONSTRAINT "attribution_codes_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "code_redemptions" ADD CONSTRAINT "code_redemptions_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "code_redemptions" ADD CONSTRAINT "code_redemptions_code_id_fkey" FOREIGN KEY ("code_id") REFERENCES "attribution_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "code_redemptions" ADD CONSTRAINT "code_redemptions_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "view_payments" ADD CONSTRAINT "view_payments_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "view_payments" ADD CONSTRAINT "view_payments_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "creator_campaign_assignments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payouts" ADD CONSTRAINT "payouts_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_events" ADD CONSTRAINT "subscription_events_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_events" ADD CONSTRAINT "subscription_events_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscription_events" ADD CONSTRAINT "subscription_events_redemption_id_fkey" FOREIGN KEY ("redemption_id") REFERENCES "code_redemptions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
