/**
 * Dashboard Overview Page
 * Main dashboard with statistics and recent activity
 */

import { DashboardStats } from '@/app/components/features/dashboard/dashboard-stats';
import { RecentOrders } from '@/app/components/features/dashboard/recent-orders';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Overview of your e-print store
        </p>
      </div>

      <DashboardStats />

      <div className="grid gap-6 md:grid-cols-2">
        <RecentOrders />
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600">
              Quick actions and shortcuts will appear here
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

