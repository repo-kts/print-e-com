/**
 * Order Detail Component
 * Displays order details and allows status updates
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Alert } from '@/app/components/ui/alert';
import { Spinner, PageLoading } from '@/app/components/ui/loading';
import { getOrder, updateOrderStatus, type Order, type OrderStatus } from '@/lib/api/orders.service';
import { formatCurrency, formatDateTime } from '@/lib/utils/format';
import { ArrowLeft } from 'lucide-react';

const statusOptions: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

function getStatusVariant(status: OrderStatus): 'default' | 'secondary' | 'success' | 'warning' | 'destructive' {
  switch (status) {
    case 'delivered':
      return 'success';
    case 'shipped':
      return 'default';
    case 'processing':
      return 'warning';
    case 'cancelled':
      return 'destructive';
    default:
      return 'secondary';
  }
}

export function OrderDetail({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getOrder(orderId);
      setOrder(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load order');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    if (!order) return;

    try {
      setIsUpdating(true);
      const updated = await updateOrderStatus(orderId, { status: newStatus });
      setOrder(updated);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update order status');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return <PageLoading />;
  }

  if (error || !order) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Alert variant="error">{error || 'Order not found'}</Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">Order Details</h1>
          <p className="mt-2 text-sm text-gray-600">Order ID: {order.id}</p>
        </div>
        <Badge variant={getStatusVariant(order.status)} className="text-lg px-4 py-2">
          {order.status}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Order Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Order Date</p>
              <p className="font-medium">{formatDateTime(order.createdAt)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Amount</p>
              <p className="text-2xl font-bold">{formatCurrency(order.total)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Number of Items</p>
              <p className="font-medium">{order.items.length}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shipping Address</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className="font-medium">{order.shippingAddress.street}</p>
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
                {order.shippingAddress.zipCode}
              </p>
              <p>{order.shippingAddress.country}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between border-b pb-4">
                <div>
                  <p className="font-medium">Product ID: {item.productId}</p>
                  <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                </div>
                <p className="font-medium">{formatCurrency(item.price)}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Update Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((status) => (
              <Button
                key={status}
                variant={order.status === status ? 'default' : 'outline'}
                onClick={() => handleStatusUpdate(status)}
                disabled={isUpdating || order.status === status}
              >
                {isUpdating ? <Spinner size="sm" /> : status}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

