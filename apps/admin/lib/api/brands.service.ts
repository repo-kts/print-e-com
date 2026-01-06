/**
 * Brands Service
 * Handles brand management operations for admin
 */

import { get, post, put, del } from './api-client';

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  website?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBrandData {
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  website?: string;
  isActive?: boolean;
}

export interface UpdateBrandData extends Partial<CreateBrandData> {
  id: string;
}

/**
 * Get all brands
 */
export async function getBrands(): Promise<Brand[]> {
  const response = await get<Brand[]>('/admin/brands');

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to fetch brands');
  }

  return response.data;
}

/**
 * Get single brand by ID
 */
export async function getBrand(id: string): Promise<Brand> {
  const response = await get<Brand>(`/admin/brands/${id}`);

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to fetch brand');
  }

  return response.data;
}

/**
 * Create new brand
 */
export async function createBrand(data: CreateBrandData): Promise<Brand> {
  const response = await post<Brand>('/admin/brands', data);

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to create brand');
  }

  return response.data;
}

/**
 * Update brand
 */
export async function updateBrand(data: UpdateBrandData): Promise<Brand> {
  const { id, ...updateData } = data;
  const response = await put<Brand>(`/admin/brands/${id}`, updateData);

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to update brand');
  }

  return response.data;
}

/**
 * Delete brand
 */
export async function deleteBrand(id: string): Promise<void> {
  const response = await del(`/admin/brands/${id}`);

  if (!response.success) {
    throw new Error(response.error || 'Failed to delete brand');
  }
}

