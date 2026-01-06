/**
 * Orders Service
 * Handles order management operations
 */

import { get, patch } from './api-client';

export interface OrdersResponse {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
export interface OrderItem {
  productId: string;
  variantId?: string;
  quantity: number;
  price: number;
  customizations?: unknown;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  shippingAddress: Address;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    email: string;
    name?: string;
  };
}

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface UpdateOrderStatusData {
  status: OrderStatus;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: PaginationMeta;
}

export interface OrderQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: OrderStatus;
}

/**
 * Get all orders (admin) with pagination and search
 */
export async function getOrders(
  params?: OrderQueryParams
): Promise<PaginatedResponse<Order>> {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.status) queryParams.append('status', params.status);

  const queryString = queryParams.toString();
  const endpoint = `/admin/orders${queryString ? `?${queryString}` : ''}`;

  const response = await get<OrdersResponse>(endpoint);

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to fetch orders');
  }

  return {
    items: response.data.orders,
    pagination: response.data.pagination,
  };
}

/**
 * Get single order by ID (admin)
 */
export async function getOrder(id: string): Promise<Order> {
  const response = await get<Order>(`/admin/orders/${id}`);

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to fetch order');
  }

  return response.data;
}

/**
 * Update order status
 */
export async function updateOrderStatus(
  id: string,
  data: UpdateOrderStatusData
): Promise<Order> {
  const response = await patch<Order>(`/admin/orders/${id}/status`, data);

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to update order status');
  }

  return response.data;
}

