/**
 * Products Service
 * Handles product management operations
 */

import { get, post, put, del } from './api-client';

export interface ProductListResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  category: string | Category;
  variants: ProductVariant[];
  images: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  priceModifier: number;
  available: boolean;
}

export interface CreateProductData {
  name: string;
  description: string;
  basePrice: number;
  category: string;
  images?: string[];
}

export interface UpdateProductData extends Partial<CreateProductData> {
  id: string;
}

export interface CreateVariantData {
  name: string;
  priceModifier: number;
  available?: boolean;
}

export interface ProductQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  brand?: string;
}

/**
 * Get paginated products with optional filters/search
 */
export async function getProducts(params: ProductQueryParams = {}): Promise<ProductListResponse> {
  const searchParams = new URLSearchParams();

  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.search) searchParams.set('search', params.search);
  if (params.category) searchParams.set('category', params.category);
  if (params.brand) searchParams.set('brand', params.brand);

  const query = searchParams.toString();
  const endpoint = query ? `/products?${query}` : '/products';

  const response = await get<ProductListResponse>(endpoint);

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to fetch products');
  }

  return response.data;
}

/**
 * Get single product by ID
 */
export async function getProduct(id: string): Promise<Product> {
  const response = await get<Product>(`/products/${id}`);

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to fetch product');
  }

  return response.data;
}

/**
 * Create new product
 */
export async function createProduct(data: CreateProductData): Promise<Product> {
  const response = await post<Product>('/admin/products', data);

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to create product');
  }

  return response.data;
}

/**
 * Update product
 */
export async function updateProduct(data: UpdateProductData): Promise<Product> {
  const { id, ...updateData } = data;
  const response = await put<Product>(`/admin/products/${id}`, updateData);

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to update product');
  }

  return response.data;
}

/**
 * Delete product
 */
export async function deleteProduct(id: string): Promise<void> {
  const response = await del(`/admin/products/${id}`);

  if (!response.success) {
    throw new Error(response.error || 'Failed to delete product');
  }
}

/**
 * Add variant to product
 */
export async function addProductVariant(
  productId: string,
  variant: CreateVariantData
): Promise<ProductVariant> {
  const response = await post<ProductVariant>(
    `/admin/products/${productId}/variants`,
    variant
  );

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to add variant');
  }

  return response.data;
}

