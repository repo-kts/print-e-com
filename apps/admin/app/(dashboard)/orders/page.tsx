/**
 * Orders Page
 * List and manage orders
 */

import { OrdersList } from '@/app/components/features/orders/orders-list';

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage customer orders
        </p>
      </div>

      <OrdersList />
    </div>
  );
}

