/**
 * Dashboard Stats Component
 * Displays key statistics cards
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Package, ShoppingCart, DollarSign, Users } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  change?: string;
}

function StatCard({ title, value, icon, change }: StatCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className="text-xs text-muted-foreground mt-1">{change}</p>
        )}
      </CardContent>
    </Card>
  );
}

export function DashboardStats() {
  // TODO: Fetch real data from API
  const stats = [
    {
      title: 'Total Products',
      value: '0',
      icon: <Package className="h-4 w-4" />,
      change: '+0 from last month',
    },
    {
      title: 'Total Orders',
      value: '0',
      icon: <ShoppingCart className="h-4 w-4" />,
      change: '+0 from last month',
    },
    {
      title: 'Revenue',
      value: '₹0',
      icon: <DollarSign className="h-4 w-4" />,
      change: '+0% from last month',
    },
    {
      title: 'Customers',
      value: '0',
      icon: <Users className="h-4 w-4" />,
      change: '+0 from last month',
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <StatCard key={stat.title} {...stat} />
      ))}
    </div>
  );
}

