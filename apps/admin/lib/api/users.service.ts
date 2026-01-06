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

/**
 * Get all users
 */
export async function getUsers(): Promise<User[]> {
  const response = await get<User[]>('/admin/users');

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

