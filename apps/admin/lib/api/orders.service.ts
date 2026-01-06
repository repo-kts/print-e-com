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

/**
 * Get all orders (admin)
 */
export async function getOrders(): Promise<Order[]> {
  const response = await get<OrdersResponse>('/admin/orders');

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to fetch orders');
  }

  return response.data.orders;
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

