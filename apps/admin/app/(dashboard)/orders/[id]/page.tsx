/**
 * Order Detail Page
 * View and manage individual order
 */

import { OrderDetail } from '@/app/components/features/orders/order-detail';

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  return <OrderDetail orderId={params.id} />;
}

