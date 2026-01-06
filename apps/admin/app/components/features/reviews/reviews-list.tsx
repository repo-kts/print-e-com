/**
 * Reviews List Component
 * Displays table of reviews with moderation actions
 */

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/app/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/app/components/ui/table';
import { Badge } from '@/app/components/ui/badge';
import { PageLoading } from '@/app/components/ui/loading';
import { Alert } from '@/app/components/ui/alert';
import { Button } from '@/app/components/ui/button';
import { getReviews, updateReview, deleteReview, type Review } from '@/lib/api/reviews.service';
import { formatDate } from '@/lib/utils/format';
import { Check, X, Trash2, Star } from 'lucide-react';

export function ReviewsList() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getReviews();
      setReviews(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load reviews');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      setUpdatingId(id);
      await updateReview(id, { isApproved: true });
      setReviews(reviews.map((r) => (r.id === id ? { ...r, isApproved: true } : r)));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to approve review');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleReject = async (id: string) => {
    try {
      setUpdatingId(id);
      await updateReview(id, { isApproved: false });
      setReviews(reviews.map((r) => (r.id === id ? { ...r, isApproved: false } : r)));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to reject review');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      setUpdatingId(id);
      await deleteReview(id);
      setReviews(reviews.filter((r) => r.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete review');
    } finally {
      setUpdatingId(null);
    }
  };

  if (isLoading) {
    return <PageLoading />;
  }

  if (error) {
    return (
      <Alert variant="error">
        {error}
        <Button onClick={loadReviews} variant="outline" className="ml-4">
          Retry
        </Button>
      </Alert>
    );
  }

  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-gray-600">No reviews found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Comment</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.map((review) => (
              <TableRow key={review.id}>
                <TableCell className="font-medium">
                  {review.product?.name || 'N/A'}
                </TableCell>
                <TableCell>{review.user?.name || review.user?.email || 'N/A'}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span>{review.rating}</span>
                  </div>
                </TableCell>
                <TableCell className="max-w-md truncate">
                  {review.comment || '-'}
                </TableCell>
                <TableCell>
                  <Badge variant={review.isApproved ? 'success' : 'secondary'}>
                    {review.isApproved ? 'Approved' : 'Pending'}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(review.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {!review.isApproved && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleApprove(review.id)}
                        disabled={updatingId === review.id}
                      >
                        <Check className="h-4 w-4 text-green-600" />
                      </Button>
                    )}
                    {review.isApproved && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleReject(review.id)}
                        disabled={updatingId === review.id}
                      >
                        <X className="h-4 w-4 text-orange-600" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(review.id)}
                      disabled={updatingId === review.id}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

