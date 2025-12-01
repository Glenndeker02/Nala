"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

// New Components
import CampaignOverviewCard from "@/app/founder/components/dashboard/CampaignOverviewCard";
import PerformanceAnalyticsCard from "@/app/founder/components/dashboard/PerformanceAnalyticsCard";
import ContentLibraryCard from "@/app/founder/components/dashboard/ContentLibraryCard";
import UpcomingDeadlinesCard from "@/app/founder/components/dashboard/UpcomingDeadlinesCard";
import PendingApplications from "@/app/founder/components/dashboard/PendingApplications";
import CreatorActivityCard from "@/app/founder/components/dashboard/CreatorActivityCard";
import WeeklySummaryCard from "@/app/founder/components/dashboard/WeeklySummaryCard";
import SuggestionsCard from "@/app/founder/components/dashboard/SuggestionsCard";

type Campaign = {
  id: string;
  name: string;
  status: string;
  totalBudget: number;
  videosRequested: number;
  videosCompleted: number;
  createdAt?: string;
  _count?: {
    videos: number;
  };
};

export default function FounderDashboard() {
  const [user, setUser] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token || !userData) {
      window.location.href = "/auth/login";
      return;
    }

    setUser(JSON.parse(userData));
    fetchCampaigns(token);
  }, []);

  const fetchCampaigns = async (token: string) => {
    try {
      const response = await fetch("/api/campaigns", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setCampaigns(data.data?.campaigns || []);
      }
    } catch (error) {
      console.error("Error fetching campaigns:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/auth/login";
  };

  if (!user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50/50">
      <main className="max-w-[1600px] mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
            <p className="mt-1 text-gray-500">Welcome back, {user.firstName || 'Founder'}. Here's what's happening today.</p>
          </div>
          <div className="flex gap-3">
            <Link href="/founder/campaigns/create">
              <Button size="lg" className="shadow-sm bg-primary-600 hover:bg-primary-700 text-white border-none">
                + New Campaign
              </Button>
            </Link>
          </div>
        </div>

        {/* Top Stats Row - All on same Y-axis */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="lg:col-span-2">
            <CampaignOverviewCard />
          </div>
          <div className="lg:col-span-1">
            <WeeklySummaryCard />
          </div>
          <div className="lg:col-span-1">
            <SuggestionsCard />
          </div>
        </div>

        {/* Second Row - Deadlines, Pending Applications, Creator Activity on same Y-axis */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <UpcomingDeadlinesCard />
          <PendingApplications />
          <CreatorActivityCard />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-8">

          {/* Performance and Active Campaigns Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* Performance Chart */}
            <div className="h-full">
              <PerformanceAnalyticsCard />
            </div>

            {/* Active Campaigns List */}
            <Card className="h-full border-none shadow-sm flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between flex-shrink-0">
                <CardTitle className="text-lg font-semibold text-gray-800">Active Campaigns</CardTitle>
                <Link href="/founder/campaigns" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                  View All
                </Link>
              </CardHeader>
              <CardContent className="p-0 flex-1 overflow-y-auto">
                {loading ? (
                  <div className="p-8 text-center text-gray-500">Loading campaigns...</div>
                ) : campaigns.length === 0 ? (
                  <div className="p-12 text-center">
                    <p className="text-gray-500 text-lg mb-2">No campaigns yet</p>
                    <p className="text-gray-400 text-sm">Create your first campaign to get started!</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {campaigns.slice(0, 5).map((campaign) => (
                      <div key={campaign.id} className="p-5 hover:bg-gray-50 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="text-base font-semibold text-gray-900">{campaign.name}</h3>
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wide ${campaign.status === "ACTIVE" ? "bg-green-100 text-green-700" :
                                campaign.status === "COMPLETED" ? "bg-blue-100 text-blue-700" :
                                  "bg-gray-100 text-gray-700"
                                }`}>
                                {campaign.status}
                              </span>
                            </div>
                            <div className="flex gap-4 text-sm text-gray-500">
                              <span>${campaign.totalBudget.toLocaleString()} Budget</span>
                              <span>•</span>
                              <span>{campaign.videosCompleted}/{campaign.videosRequested} Videos</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Link href={`/founder/campaigns/${campaign.id}`}>
                              <Button variant="outline" size="sm" className="text-xs">View Details</Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Content Library */}
          <div className="mt-20">
            <ContentLibraryCard />
          </div>
        </div>

      </main>
    </div>
  );
}
