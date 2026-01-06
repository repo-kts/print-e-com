/**
 * Coupons Management Page
 * List and manage discount coupons
 */

import { CouponsList } from '@/app/components/features/coupons/coupons-list';
import { Button } from '@/app/components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default function CouponsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Coupons</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage discount coupons and offers
          </p>
        </div>
        <Link href="/dashboard/coupons/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Coupon
          </Button>
        </Link>
      </div>

      <CouponsList />
    </div>
  );
}

