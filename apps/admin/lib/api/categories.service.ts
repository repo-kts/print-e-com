/**
 * Categories Service
 * Handles category management operations
 */

import { get, post } from './api-client';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryData {
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
}

/**
 * Get all categories
 */
export async function getCategories(): Promise<Category[]> {
  const response = await get<Category[]>('/categories');

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to fetch categories');
  }

  return response.data;
}

/**
 * Create new category
 */
export async function createCategory(data: CreateCategoryData): Promise<Category> {
  const response = await post<Category>('/admin/categories', data);

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to create category');
  }

  return response.data;
}

