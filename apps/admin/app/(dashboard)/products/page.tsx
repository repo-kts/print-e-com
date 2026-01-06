/**
 * Products Page
 * List and manage products
 */

import { ProductsList } from '@/app/components/features/products/products-list';
import { Button } from '@/app/components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default function ProductsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your product catalog
          </p>
        </div>
        <Link href="/products/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </Link>
      </div>

      <ProductsList />
    </div>
  );
}

