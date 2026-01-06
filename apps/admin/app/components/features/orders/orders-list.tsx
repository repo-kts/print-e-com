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
import {
    getOrders,
    type Order,
    type OrderStatus,
    type PaginatedResponse,
} from '@/lib/api/orders.service';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import Link from 'next/link';
import { Eye, Search } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { useDebouncedValue } from '@/lib/hooks/use-debounced-value';

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
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [searchInput, setSearchInput] = useState('');
    const debouncedSearch = useDebouncedValue(searchInput, 400);
    const [isLoading, setIsLoading] = useState(true);
    const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadOrders(page, debouncedSearch);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, debouncedSearch]);

    const loadOrders = async (pageParam = 1, searchParam = '') => {
        try {
            setIsLoading(true);
            setError(null);
            const data: PaginatedResponse<Order> = await getOrders({
                page: pageParam,
                limit: 20,
                search: searchParam || undefined,
            });
            setOrders(data.items);
            setTotalPages(data.pagination.totalPages);
            setTotal(data.pagination.total);
            setHasLoadedOnce(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load orders');
        } finally {
            setIsLoading(false);
        }
    };

    // Reset to page 1 when search changes
    useEffect(() => {
        if (hasLoadedOnce) {
            setPage(1);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedSearch]);

    if (isLoading && !hasLoadedOnce) {
        return <PageLoading />;
    }

    return (
        <Card>
            <CardContent className="p-0">
                {/* Search and Pagination Header - Always Visible */}
                <div className="border-b bg-gray-50/50 p-4">
                    <div className="mb-3 flex items-center justify-between gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                            <Input
                                type="text"
                                placeholder="Search orders by ID, customer email or name..."
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                className="pl-10"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="text-sm text-gray-600">
                                {total > 0 ? (
                                    <>
                                        <span className="font-medium">{total}</span> result{total !== 1 ? 's' : ''} • Page{' '}
                                        <span className="font-medium">{page}</span> of{' '}
                                        <span className="font-medium">{totalPages || 1}</span>
                                    </>
                                ) : (
                                    'No results'
                                )}
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                                    disabled={page === 1 || isLoading}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage((p) => Math.min(totalPages || 1, p + 1))}
                                    disabled={page >= totalPages || isLoading}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Inline error, keeps search visible */}
                {error && (
                    <div className="px-4 pb-2 pt-4">
                        <Alert variant="error">
                            {error}
                            <Button
                                onClick={() => loadOrders(page, debouncedSearch)}
                                variant="outline"
                                size="sm"
                                className="ml-4"
                            >
                                Retry
                            </Button>
                        </Alert>
                    </div>
                )}

                {/* Table / empty state */}
                <div className="relative">
                    {isLoading && hasLoadedOnce && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
                            <div className="rounded-lg bg-white/90 px-4 py-2 text-sm text-gray-600 shadow-sm">
                                Updating results...
                            </div>
                        </div>
                    )}

                    {orders.length === 0 && !isLoading && !error ? (
                        <div className="px-4 pb-6 pt-4">
                            <Card>
                                <CardContent className="py-8 text-center">
                                    <p className="text-gray-600">
                                        No orders found. Try adjusting your search or filters.
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
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
                                        <TableCell className="font-mono text-sm">
                                            {order.id.slice(0, 8)}...
                                        </TableCell>
                                        <TableCell>
                                            {order.user?.name || order.user?.email || order.userId.slice(0, 8)}
                                        </TableCell>
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
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

