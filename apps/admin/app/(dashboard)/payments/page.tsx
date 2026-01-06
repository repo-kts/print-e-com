/**
 * Payments Management Page
 * View all payment transactions
 */

import { PaymentsList } from '@/app/components/features/payments/payments-list';

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Payments</h1>
        <p className="mt-2 text-sm text-gray-600">
          View and manage payment transactions
        </p>
      </div>

      <PaymentsList />
    </div>
  );
}

