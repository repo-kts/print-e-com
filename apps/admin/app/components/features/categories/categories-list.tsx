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
import {
  getCategories,
  type Category,
  type PaginatedCategories,
} from '@/lib/api/categories.service';
import { formatDate } from '@/lib/utils/format';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { useDebouncedValue } from '@/lib/hooks/use-debounced-value';
import { Search } from 'lucide-react';

export function CategoriesList() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebouncedValue(searchInput, 400);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCategories(page, debouncedSearch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, debouncedSearch]);

  const loadCategories = async (pageParam = 1, searchParam = '') => {
    try {
      setIsLoading(true);
      setError(null);
      const data: PaginatedCategories = await getCategories({
        page: pageParam,
        limit: 20,
        search: searchParam || undefined,
      });
      setCategories(data.items);
      setTotalPages(data.pagination.totalPages);
      setTotal(data.pagination.total);
      setHasLoadedOnce(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset to first page when search changes and we already have data
  useEffect(() => {
    if (hasLoadedOnce) {
      setPage(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  if (isLoading && !hasLoadedOnce) {
    return <PageLoading />;
  }

  return (
    <Card>
      <CardContent className="p-0">
        {/* Search + Pagination Header */}
        <div className="flex flex-col gap-3 border-b bg-gray-50/60 px-4 py-3 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search categories by name, slug, or description..."
              className="pl-9"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>
              {total.toLocaleString()} results • Page {page} of {Math.max(totalPages, 1)}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || isLoading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages || isLoading}
              onClick={() => setPage((p) => Math.min(totalPages || 1, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>

        {/* Inline error */}
        {error && (
          <div className="px-4 pb-2 pt-3">
            <Alert variant="error">
              {error}
              <Button
                onClick={() => loadCategories(page, debouncedSearch)}
                variant="outline"
                size="sm"
                className="ml-4"
              >
                Retry
              </Button>
            </Alert>
          </div>
        )}

        {/* Table / empty state */}
        <div className="relative">
          {isLoading && hasLoadedOnce && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 backdrop-blur-[1px] text-xs text-gray-100">
              Updating results...
            </div>
          )}

          {categories.length === 0 && !isLoading && !error ? (
            <div className="px-4 pb-6 pt-4">
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-gray-600">
                    No categories found. Try adjusting your search.
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
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
                    <TableCell>{/* parent name if present in future */ category.parentId || '-'}</TableCell>
                    <TableCell>{formatDate(category.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

