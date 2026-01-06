/**
 * Reviews Service
 * Handles review management operations for admin
 */

import { get, put, del } from './api-client';

export interface Review {
  id: string;
  productId: string;
  userId: string;
  rating: number;
  title?: string;
  comment?: string;
  images: string[];
  isVerifiedPurchase: boolean;
  isHelpful: number;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
  product?: {
    id: string;
    name: string;
  };
  user?: {
    id: string;
    name?: string;
    email: string;
  };
}

export interface UpdateReviewData {
  isApproved?: boolean;
}

/**
 * Get all reviews
 */
export async function getReviews(): Promise<Review[]> {
  const response = await get<Review[]>('/admin/reviews');

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to fetch reviews');
  }

  return response.data;
}

/**
 * Get single review by ID
 */
export async function getReview(id: string): Promise<Review> {
  const response = await get<Review>(`/admin/reviews/${id}`);

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to fetch review');
  }

  return response.data;
}

/**
 * Update review (approve/reject)
 */
export async function updateReview(id: string, data: UpdateReviewData): Promise<Review> {
  const response = await put<Review>(`/admin/reviews/${id}`, data);

  if (!response.success || !response.data) {
    throw new Error(response.error || 'Failed to update review');
  }

  return response.data;
}

/**
 * Delete review
 */
export async function deleteReview(id: string): Promise<void> {
  const response = await del(`/admin/reviews/${id}`);

  if (!response.success) {
    throw new Error(response.error || 'Failed to delete review');
  }
}

