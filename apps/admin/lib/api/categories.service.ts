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

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedCategories {
  items: Category[];
  pagination: PaginationMeta;
}

export interface CategoryQueryParams {
  page?: number;
  limit?: number;
  search?: string;
}

/**
 * Get paginated categories (admin) with optional search
 */
export async function getCategories(
  params: CategoryQueryParams = {}
): Promise<PaginatedCategories> {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.search) searchParams.set('search', params.search);

  const query = searchParams.toString();
  const endpoint = query ? `/admin/categories?${query}` : '/admin/categories';

  const response = await get<{
    categories: Category[];
    pagination: PaginationMeta;
  }>(endpoint);

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to fetch categories');
  }

  return {
    items: response.data.categories,
    pagination: response.data.pagination,
  };
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

