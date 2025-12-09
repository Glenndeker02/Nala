"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import EarningsOverviewCard from "@/app/creator/components/dashboard/EarningsOverviewCard";
import PerformanceAnalyticsCard from "@/app/creator/components/dashboard/PerformanceAnalyticsCard";
import ActiveAssignmentsCard from "@/app/creator/components/dashboard/ActiveAssignmentsCard";
import CreatorContentLibraryCard from "@/app/creator/components/dashboard/CreatorContentLibraryCard";
import TasksDeadlinesCard from "@/app/creator/components/dashboard/TasksDeadlinesCard";
import CreatorRankingCard from "@/app/creator/components/dashboard/CreatorRankingCard";
import CampaignRequirementsCard from "@/app/creator/components/dashboard/CampaignRequirementsCard";
import SuggestedOpportunitiesCard from "@/app/creator/components/dashboard/SuggestedOpportunitiesCard";
import CertificationBanner from "@/components/creator/CertificationBanner";
import { Button } from "@/components/ui/Button";
import { Plus } from "lucide-react";

export default function CreatorDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      router.push("/auth/login");
      return;
    }

    setUser(JSON.parse(userData));
  }, [router]);

  if (!user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50/50">
      <main className="max-w-[1600px] mx-auto py-8 px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user.firstName || 'Creator'}! 👋
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Here's what's happening with your content today.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button size="lg" className="shadow-sm bg-primary-600 hover:bg-primary-700 text-white border-none">
              <Plus className="w-4 h-4 mr-2" />
              Upload Content
            </Button>
          </div>
        </div>

        {/* Certification Banner */}
        <CertificationBanner />

        {/* Top Stats Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1">
            <EarningsOverviewCard />
          </div>
          <div className="lg:col-span-1">
            <TasksDeadlinesCard />
          </div>
          <div className="lg:col-span-1">
            <CreatorRankingCard />
          </div>
        </div>

        {/* Second Row - Opportunities and Campaign Requirements */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <SuggestedOpportunitiesCard />
          <div className="h-full">
            <CampaignRequirementsCard />
          </div>
        </div>

        {/* Main Content Grid */}
        {/* Main Content Area */}
        <div className="space-y-8">

          {/* Performance & Active Assignments Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <PerformanceAnalyticsCard />
            <ActiveAssignmentsCard />
          </div>

          {/* Content Library */}
          <div className="mt-20">
            <CreatorContentLibraryCard />
          </div>
        </div>
      </main>
    </div>
  );
}
