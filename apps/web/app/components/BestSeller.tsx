"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { getProducts, type Product } from "../../lib/api/products";

export default function BestSeller() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBestSellers = async () => {
      try {
        setLoading(true);
        const response = await getProducts({
          isBestSeller: true,
          limit: 6,
          page: 1,
        });

        if (response.success && response.data) {
          setProducts(response.data.products);
        }
      } catch (error) {
        console.error("Failed to fetch best sellers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBestSellers();
  }, []);

  const handleAddToCart = (productId: string) => {
    console.log("Add to cart:", productId);
  };

  // Loading skeleton
  if (loading) {
    return (
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-8">
            <div className="h-8 w-40 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-6 pb-4">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-64 h-80 bg-gray-200 rounded-lg animate-pulse"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // No products message
  if (!loading && products.length === 0) {
    return null; // Don't show section if no products
  }

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Best Seller</h2>
          <Link
            href="/products?sort=bestseller"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            Show More
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </Link>
        </div>

        {/* Horizontal Scrollable Product Grid */}
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-6 pb-4" style={{ minWidth: "max-content" }}>
            {products.map((product) => (
              <div
                key={product.id}
                className="flex-shrink-0 w-64 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden relative"
              >
                {/* Product Image */}
                <Link href={`/products/${product.id}`} className="block relative aspect-square bg-gray-100">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0].url}
                      alt={product.images[0].alt || product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                      <span className="text-gray-400 text-sm">No Image</span>
                    </div>
                  )}
                  {/* Bestseller Badge */}
                  <div className="absolute top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">
                    BESTSELLER
                  </div>
                </Link>

                {/* Product Info */}
                <div className="p-4 pb-14">
                  <Link href={`/products/${product.id}`}>
                    <p className="text-sm font-semibold text-gray-900 mb-1">
                      {product.brand?.name || "Unknown Brand"}
                    </p>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {product.shortDescription || product.name}
                    </p>
                    <div className="flex items-center gap-2">
                      {product.sellingPrice && product.sellingPrice < product.basePrice ? (
                        <>
                          <p className="text-lg font-bold text-gray-900">
                            ₹{Number(product.sellingPrice).toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-400 line-through">
                            ₹{Number(product.basePrice).toFixed(2)}
                          </p>
                        </>
                      ) : (
                        <p className="text-lg font-bold text-gray-900">
                          ₹{Number(product.basePrice).toFixed(2)}
                        </p>
                      )}
                    </div>
                  </Link>
                </div>

                {/* Add to Cart Button */}
                <button
                  onClick={() => handleAddToCart(product.id)}
                  className="absolute bottom-4 right-4 w-10 h-10 bg-orange-500 hover:bg-orange-600 rounded-lg flex items-center justify-center text-white shadow-lg transition-colors"
                  aria-label="Add to cart"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
