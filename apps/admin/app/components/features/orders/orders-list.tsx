/**
 * Orders List Component
 * Displays table of orders with status management
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/app/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';
import { Spinner, PageLoading } from '@/app/components/ui/loading';
import { Alert } from '@/app/components/ui/alert';
import { getOrders, type Order, type OrderStatus } from '@/lib/api/orders.service';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import Link from 'next/link';
import { Eye } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

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

export function OrdersList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getOrders();
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <PageLoading />;
  }

  if (error) {
    return (
      <Alert variant="error">
        {error}
        <Button onClick={loadOrders} variant="outline" className="ml-4">
          Retry
        </Button>
      </Alert>
    );
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-gray-600">No orders found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Items</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-mono text-sm">{order.id.slice(0, 8)}...</TableCell>
                <TableCell>{order.userId.slice(0, 8)}...</TableCell>
                <TableCell>{order.items.length} item(s)</TableCell>
                <TableCell>{formatCurrency(order.total)}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(order.status)}>
                    {order.status}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(order.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <Link href={`/orders/${order.id}`}>
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

