"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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
        setCampaigns(data.campaigns || []);
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

  if (!user) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Founder Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Welcome, {user.fullName}</span>
            {user.companyName && (
              <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full">
                {user.companyName}
              </span>
            )}
            <button
              onClick={handleSignOut}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            {/* Create Campaign Button */}
            <div className="mb-6">
              <Link
                href="/founder/campaigns/create"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                + Create New Campaign
              </Link>
            </div>

            {/* Campaigns List */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Your Campaigns</h2>
              </div>

              {loading ? (
                <div className="p-6 text-center text-gray-500">Loading campaigns...</div>
              ) : campaigns.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="text-gray-500 text-lg mb-4">No campaigns yet</p>
                  <p className="text-gray-400 text-sm">Create your first campaign to get started!</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {campaigns.map((campaign) => (
                    <div key={campaign.id} className="p-6 hover:bg-gray-50 transition-colors">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {campaign.name}
                            </h3>
                            <span
                              className={`text-xs px-2 py-1 rounded-full font-medium ${campaign.status === "ACTIVE"
                                ? "bg-green-100 text-green-800"
                                : campaign.status === "COMPLETED"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-gray-100 text-gray-800"
                                }`}
                            >
                              {campaign.status}
                            </span>
                          </div>

                          <div className="flex gap-6 text-sm text-gray-600 mb-3">
                            <div>
                              <span className="font-medium">Budget:</span> ${campaign.totalBudget}
                            </div>
                            <div>
                              <span className="font-medium">Videos:</span> {campaign.videosCompleted}/{campaign.videosRequested}
                            </div>
                            <div>
                              <span className="font-medium">Created:</span>{" "}
                              {new Date(campaign.createdAt).toLocaleDateString()}
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <Link
                              href={`/founder/campaigns/${campaign.id}/applications`}
                              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                            >
                              View Applications →
                            </Link>
                            <Link
                              href={`/founder/campaigns/${campaign.id}/review`}
                              className="text-sm text-green-600 hover:text-green-800 font-medium"
                            >
                              Review Videos →
                            </Link>
                            <Link
                              href={`/founder/campaigns/${campaign.id}`}
                              className="text-sm text-gray-600 hover:text-gray-800"
                            >
                              Campaign Details
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
