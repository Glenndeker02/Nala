"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import FounderContentLibrary from "@/app/founder/components/ContentLibrary";

// Placeholder components for additional dashboard sections
function PerformanceOverview() {
  return (
    <Card className="hover:shadow-xl transition-all duration-200 border-2 hover:border-primary-DEFAULT">
      <CardHeader>
        <CardTitle>Performance Overview</CardTitle>
      </CardHeader>
      <CardContent className="p-4 text-sm text-gray-600">
        {/* TODO: integrate analytics data */}
        <p>Analytics charts and KPIs will appear here.</p>
      </CardContent>
    </Card>
  );
}

function RecentCreatorActivity() {
  return (
    <Card className="hover:shadow-xl transition-all duration-200 border-2 hover:border-primary-DEFAULT">
      <CardHeader>
        <CardTitle>Recent Creator Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-4 text-sm text-gray-600">
        {/* Placeholder list */}
        <p>No recent activity.</p>
      </CardContent>
    </Card>
  );
}

function PendingApprovals() {
  return (
    <Card className="hover:shadow-xl transition-all duration-200 border-2 hover:border-primary-DEFAULT">
      <CardHeader>
        <CardTitle>Pending Approvals</CardTitle>
      </CardHeader>
      <CardContent className="p-4 text-sm text-gray-600">
        <p>No pending approvals.</p>
      </CardContent>
    </Card>
  );
}

function MessagesNotifications() {
  return (
    <Card className="hover:shadow-xl transition-all duration-200 border-2 hover:border-primary-DEFAULT">
      <CardHeader>
        <CardTitle>Messages & Notifications</CardTitle>
      </CardHeader>
      <CardContent className="p-4 text-sm text-gray-600">
        <p>No new messages.</p>
      </CardContent>
    </Card>
  );
}

type Campaign = {
  id: string;
  name: string;
  status: string;
  totalBudget: number;
  videosRequested: number;
  videosCompleted: number;
  createdAt: string;
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
    <div className="min-h-screen bg-gray-50">
      <main>
        <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
          <div className="px-4 sm:px-0">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
              <p className="mt-2 text-gray-600">Manage your campaigns and track performance</p>
            </div>

            {/* Action Button */}
            <div className="mb-8">
              <Link href="/founder/campaigns/create">
                <Button size="lg" className="shadow-md">
                  + Create New Campaign
                </Button>
              </Link>
            </div>

            {/* Grid of dashboard cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {/* Active Campaigns Card */}
              <Card className="hover:shadow-xl transition-all duration-200 border-2 hover:border-primary-DEFAULT">
                <CardHeader>
                  <CardTitle>Active Campaigns</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading campaigns...</div>
                  ) : campaigns.length === 0 ? (
                    <div className="p-12 text-center">
                      <p className="text-gray-500 text-lg mb-2">No campaigns yet</p>
                      <p className="text-gray-400 text-sm">Create your first campaign to get started!</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {campaigns.map((campaign) => (
                        <div key={campaign.id} className="p-6 hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <h3 className="text-lg font-bold text-gray-900">{campaign.name}</h3>
                                <span
                                  className={`text-xs px-3 py-1 rounded-full font-medium ${campaign.status === "ACTIVE"
                                    ? "bg-green-50 text-green-700 border border-green-200"
                                    : campaign.status === "COMPLETED"
                                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                                      : "bg-gray-50 text-gray-700 border border-gray-200"}`}
                                >
                                  {campaign.status}
                                </span>
                              </div>

                              <div className="flex gap-6 text-sm text-gray-600 mb-4">
                                <div>
                                  <span className="font-medium text-gray-900">Budget:</span> ${campaign.totalBudget.toLocaleString()}
                                </div>
                                <div>
                                  <span className="font-medium text-gray-900">Videos:</span> {campaign.videosCompleted}/{campaign.videosRequested}
                                </div>
                                <div>
                                  <span className="font-medium text-gray-900">Created:</span> {new Date(campaign.createdAt).toLocaleDateString()}
                                </div>
                              </div>

                              <div className="flex gap-4">
                                <Link href={`/founder/campaigns/${campaign.id}`} className="text-sm text-primary-DEFAULT hover:text-primary-600 font-medium transition-colors">
                                  View Details →
                                </Link>
                                <Link href={`/founder/campaigns/${campaign.id}/edit`} className="text-sm text-primary-DEFAULT hover:text-primary-600 font-medium transition-colors">
                                  Edit Campaign →
                                </Link>
                                <Link href={`/founder/campaigns/${campaign.id}/applications`} className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                                  Applications
                                </Link>
                                <Link href={`/founder/campaigns/${campaign.id}/review`} className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
                                  Review Videos
                                </Link>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Performance Overview Card */}
              <PerformanceOverview />

              {/* Content Library Card */}
              <FounderContentLibrary />

              {/* Recent Creator Activity Card */}
              <RecentCreatorActivity />

              {/* Pending Approvals Card */}
              <PendingApprovals />

              {/* Messages & Notifications Card */}
              <MessagesNotifications />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
