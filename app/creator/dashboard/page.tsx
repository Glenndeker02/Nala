"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import TrendingFormatsList from "@/components/creator/TrendingFormatsList";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

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
    <div className="min-h-screen bg-gray-50">
      <main>
        <div className="max-w-7xl mx-auto py-8 sm:px-6 lg:px-8">
          <div className="px-4 sm:px-0">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
              <p className="mt-2 text-gray-600">Find campaigns and manage your tasks</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              {/* Browse Briefs Card */}
              <Card className="hover:shadow-xl transition-all duration-200 border-2 hover:border-primary-DEFAULT">
                <CardContent className="p-8 text-center">
                  <div className="mb-4">
                    <div className="mx-auto h-16 w-16 bg-primary-50 rounded-full flex items-center justify-center">
                      <svg className="h-8 w-8 text-primary-DEFAULT" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Find New Work</h3>
                  <p className="text-gray-600 text-sm mb-6">
                    Browse available campaigns and apply to projects that match your skills.
                  </p>
                  <Link href="/creator/briefs">
                    <Button size="lg" className="w-full">
                      Browse Available Briefs
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* My Tasks Card */}
              <Card className="hover:shadow-xl transition-all duration-200 border-2 hover:border-primary-DEFAULT">
                <CardContent className="p-8 text-center">
                  <div className="mb-4">
                    <div className="mx-auto h-16 w-16 bg-primary-50 rounded-full flex items-center justify-center">
                      <svg className="h-8 w-8 text-primary-DEFAULT" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">My Active Tasks</h3>
                  <p className="text-gray-600 text-sm mb-6">
                    View and manage your assigned video projects and track your progress.
                  </p>
                  <Link href="/creator/tasks">
                    <Button size="lg" className="w-full">
                      View My Tasks
                    </Button>
                  </Link>
                </CardContent>
              </Card>
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
