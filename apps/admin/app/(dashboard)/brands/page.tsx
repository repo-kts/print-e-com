/**
 * Brands Management Page
 * List and manage brands
 */

import { BrandsList } from '@/app/components/features/brands/brands-list';
import { Button } from '@/app/components/ui/button';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default function BrandsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Brands</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage product brands
          </p>
        </div>
        <Link href="/dashboard/brands/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Brand
          </Button>
        </Link>
      </div>

      <BrandsList />
    </div>
  );
}

