/**
 * Users Service
 * Handles user management operations for admin
 */

import { get, put, del } from './api-client';

export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserData {
  name?: string;
  phone?: string;
  isAdmin?: boolean;
  isSuperAdmin?: boolean;
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

export interface UserQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}

/**
 * Get paginated users with optional search
 */
export async function getUsers(params: UserQueryParams = {}): Promise<PaginatedResponse<User>> {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.search) searchParams.set('search', params.search);

  const query = searchParams.toString();
  const endpoint = query ? `/admin/users?${query}` : '/admin/users';

  const response = await get<PaginatedResponse<User>>(endpoint);

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to fetch users');
  }

  return response.data;
}

/**
 * Get single user by ID
 */
export async function getUser(id: string): Promise<User> {
  const response = await get<User>(`/admin/users/${id}`);

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to fetch user');
  }

  return response.data;
}

/**
 * Update user
 */
export async function updateUser(id: string, data: UpdateUserData): Promise<User> {
  const response = await put<User>(`/admin/users/${id}`, data);

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to update user');
  }

  return response.data;
}

/**
 * Delete user
 */
export async function deleteUser(id: string): Promise<void> {
  const response = await del(`/admin/users/${id}`);

  if (!response.success) {
    throw new Error(response.error || 'Failed to delete user');
  }
}

