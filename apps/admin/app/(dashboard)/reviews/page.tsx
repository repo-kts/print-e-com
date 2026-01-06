/**
 * Reviews Management Page
 * Moderate product reviews
 */

import { ReviewsList } from '@/app/components/features/reviews/reviews-list';

export default function ReviewsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Reviews</h1>
        <p className="mt-2 text-sm text-gray-600">
          Moderate and manage product reviews
        </p>
      </div>

      <ReviewsList />
    </div>
  );
}

