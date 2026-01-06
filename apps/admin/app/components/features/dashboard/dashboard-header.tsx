'use client';

/**
 * Dashboard Header Component
 * Top header bar for dashboard with logout button
 */

import { Button } from '@/app/components/ui/button';
import { LogOut } from 'lucide-react';
import { logoutAdmin } from '@/lib/api/auth.service';
import { setAuthToken } from '@/lib/api/api-client';

export function DashboardHeader() {
  const handleLogout = () => {
    setAuthToken(undefined);
    logoutAdmin();
  };

  return (
    <header className="flex h-16 items-center border-b bg-white px-6 shadow-sm">
      <div className="flex flex-1 items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">
          Welcome back, Admin
        </h1>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
}

