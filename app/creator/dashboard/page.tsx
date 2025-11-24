"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TrendingFormatsList from "@/components/creator/TrendingFormatsList";

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

  if (!user) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900">Creator Dashboard</h1>
      </div>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Browse Briefs Card */}
              <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-indigo-400 transition-colors">
                <div className="text-center">
                  <div className="mb-4">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Find New Work</h3>
                  <p className="text-gray-500 text-sm mb-4">
                    Browse available campaigns and apply to projects that match your skills.
                  </p>
                  <Link
                    href="/creator/briefs"
                    className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700 transition-colors font-medium"
                  >
                    Browse Available Briefs
                  </Link>
                </div>
              </div>

              {/* My Tasks Card */}
              <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-green-400 transition-colors">
                <div className="text-center">
                  <div className="mb-4">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">My Active Tasks</h3>
                  <p className="text-gray-500 text-sm mb-4">
                    View and manage your assigned video projects and track your progress.
                  </p>
                  <Link
                    href="/creator/tasks"
                    className="inline-block bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors font-medium"
                  >
                    View My Tasks
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-12">
              <TrendingFormatsList />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
