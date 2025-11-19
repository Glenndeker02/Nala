'use client';

import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function CreatorDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Creator Dashboard</h1>
          <p className="mt-2 text-gray-600">Manage your campaigns and track your earnings</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm font-medium text-gray-600">Available Balance</div>
              <div className="mt-2 text-3xl font-bold text-gray-900">$1,247.50</div>
              <Button variant="primary" size="sm" className="mt-4">
                Request Payout
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-sm font-medium text-gray-600">This Month</div>
              <div className="mt-2 text-3xl font-bold text-gray-900">$2,430</div>
              <div className="mt-2 text-sm text-gray-500">12 videos | 847K views</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="text-sm font-medium text-gray-600">Active Briefs</div>
              <div className="mt-2 text-3xl font-bold text-gray-900">3</div>
              <div className="mt-2 text-sm text-gray-500">2 due this week</div>
            </CardContent>
          </Card>
        </div>

        {/* Active Briefs */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Active Briefs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="border-l-4 border-green-500 pl-4 py-3 bg-green-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-gray-900">SaaS Product Launch</h4>
                    <p className="text-sm text-gray-600 mt-1">Due: Nov 20 (2 days)</p>
                    <p className="text-sm text-gray-500 mt-1">⏳ Draft Submitted - In Review</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Base: $75</div>
                    <div className="text-sm text-gray-600">Est. Bonus: $200-400</div>
                  </div>
                </div>
              </div>

              <div className="border-l-4 border-blue-500 pl-4 py-3 bg-blue-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-gray-900">Mobile App Review</h4>
                    <p className="text-sm text-gray-600 mt-1">Due: Nov 23 (5 days)</p>
                    <p className="text-sm text-gray-500 mt-1">📝 Pending - Not Started</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Base: $100</div>
                    <div className="text-sm text-gray-600">Est. Bonus: $300-500</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <h4 className="font-medium text-gray-900">Productivity Tool Review</h4>
                  <p className="text-sm text-gray-500">TikTok • Posted Nov 15</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">85,232 views</div>
                  <div className="text-sm text-gray-500">Day 5/7 • Est. +$340</div>
                </div>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <h4 className="font-medium text-gray-900">B2B Software Demo</h4>
                  <p className="text-sm text-gray-500">Instagram • Posted Nov 13</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-gray-900">127,450 views</div>
                  <div className="text-sm text-green-600">Completed • +$510</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
