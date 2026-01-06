/**
 * Categories List Component
 * Displays list of categories
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
import { PageLoading } from '@/app/components/ui/loading';
import { Alert } from '@/app/components/ui/alert';
import { getCategories, type Category } from '@/lib/api/categories.service';
import { formatDate } from '@/lib/utils/format';
import { Button } from '@/app/components/ui/button';

export function CategoriesList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <PageLoading />;
  }

  if (error) {
    return (
      <Alert variant="error">
        {error}
        <Button onClick={loadCategories} variant="outline" className="ml-4">
          Retry
        </Button>
      </Alert>
    );
  }

  if (categories.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-gray-600">No categories found.</p>
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
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Parent</TableHead>
              <TableHead>Created</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category.id}>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell className="font-mono text-sm">{category.slug}</TableCell>
                <TableCell>{category.parentId || '-'}</TableCell>
                <TableCell>{formatDate(category.createdAt)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

