'use client';

import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function FounderDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Founder Dashboard</h1>
            <p className="mt-2 text-gray-600">Manage your campaigns and track performance</p>
          </div>
          <Button variant="primary" size="lg">
            Create Campaign +
          </Button>
        </div>

        {/* Active Campaign Overview */}
        <Card className="mb-8">
          <CardHeader className="bg-gradient-to-r from-primary-50 to-secondary-50">
            <CardTitle>Q4 Product Launch Campaign</CardTitle>
            <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
              <span>Budget: $1,000</span>
              <span>•</span>
              <span>Videos: 5/5</span>
              <span>•</span>
              <span>Active: 3</span>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <div className="text-sm font-medium text-gray-600">Spent</div>
                <div className="mt-1 flex items-baseline">
                  <div className="text-2xl font-bold text-gray-900">$650</div>
                  <div className="ml-2 text-sm text-gray-500">65%</div>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }}></div>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-600">Reserved</div>
                <div className="mt-1 flex items-baseline">
                  <div className="text-2xl font-bold text-gray-900">$200</div>
                  <div className="ml-2 text-sm text-gray-500">20%</div>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '20%' }}></div>
                </div>
              </div>

              <div>
                <div className="text-sm font-medium text-gray-600">Refund</div>
                <div className="mt-1 flex items-baseline">
                  <div className="text-2xl font-bold text-green-600">$150</div>
                  <div className="ml-2 text-sm text-gray-500">15%</div>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3">Video Performance</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">Video 1</span>
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">TikTok</span>
                      <span className="text-xs text-gray-500">Posted Nov 15</span>
                    </div>
                    <div className="mt-1 flex items-center space-x-4 text-sm text-gray-600">
                      <span>45,232 views</span>
                      <span>•</span>
                      <span className="text-green-600">90% of target</span>
                      <span>•</span>
                      <span>Days remaining: 2 🎯</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    View Details
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">Video 2</span>
                      <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">Instagram</span>
                      <span className="text-xs text-gray-500">Posted Nov 16</span>
                    </div>
                    <div className="mt-1 flex items-center space-x-4 text-sm text-gray-600">
                      <span>28,540 views</span>
                      <span>•</span>
                      <span className="text-yellow-600">57% of target</span>
                      <span>•</span>
                      <span>Days remaining: 3</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    View Details
                  </Button>
                </div>

                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-900">Video 3</span>
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">TikTok</span>
                      <span className="text-xs text-orange-600">⚠️ Pending Review</span>
                    </div>
                    <div className="mt-1 text-sm text-gray-600">
                      Submitted by @marythcreator • 2 hours ago
                    </div>
                  </div>
                  <Button variant="primary" size="sm">
                    Review Now
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold text-gray-900 mb-2">Total Views</h3>
              <div className="text-3xl font-bold text-gray-900">226,160</div>
              <p className="text-sm text-gray-500 mt-1">Across all campaigns</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold text-gray-900 mb-2">Videos Delivered</h3>
              <div className="text-3xl font-bold text-gray-900">18/20</div>
              <p className="text-sm text-gray-500 mt-1">2 in review</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold text-gray-900 mb-2">Est. Refund</h3>
              <div className="text-3xl font-bold text-green-600">$320</div>
              <p className="text-sm text-gray-500 mt-1">From active campaigns</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
