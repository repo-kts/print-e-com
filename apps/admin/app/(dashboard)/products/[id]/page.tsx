/**
 * Product Detail Page
 * View individual product details
 */

import { ProductDetail } from '@/app/components/features/products/product-detail';

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  return <ProductDetail productId={params.id} />;
}

