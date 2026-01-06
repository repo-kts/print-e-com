/**
 * Brands List Component
 * Displays table of brands with actions
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
import { getBrands, deleteBrand, type Brand } from '@/lib/api/brands.service';
import { formatDate } from '@/lib/utils/format';
import { Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';

export function BrandsList() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    loadBrands();
  }, []);

  const loadBrands = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getBrands();
      setBrands(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load brands');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this brand?')) {
      return;
    }

    try {
      setDeletingId(id);
      await deleteBrand(id);
      setBrands(brands.filter((b) => b.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete brand');
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return <PageLoading />;
  }

  if (error) {
    return (
      <Alert variant="error">
        {error}
        <Button onClick={loadBrands} variant="outline" className="ml-4">
          Retry
        </Button>
      </Alert>
    );
  }

  if (brands.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-gray-600">No brands found.</p>
          <Link href="/dashboard/brands/new">
            <Button className="mt-4">Create your first brand</Button>
          </Link>
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
              <TableHead>Website</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {brands.map((brand) => (
              <TableRow key={brand.id}>
                <TableCell className="font-medium">{brand.name}</TableCell>
                <TableCell className="font-mono text-sm">{brand.slug}</TableCell>
                <TableCell>{brand.website || '-'}</TableCell>
                <TableCell>
                  <Badge variant={brand.isActive ? 'success' : 'secondary'}>
                    {brand.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(brand.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/dashboard/brands/${brand.id}/edit`}>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(brand.id)}
                      disabled={deletingId === brand.id}
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

