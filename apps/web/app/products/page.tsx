"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "../components/ProductCard";
import ProductFilters from "../components/ProductFilters";
import Pagination from "../components/Pagination";
import { BarsSpinner } from "../components/shared/BarsSpinner";
import { getProducts, type Product, type ProductListParams } from "../../lib/api/products";

const PRODUCTS_PER_PAGE = 20;

function ProductsPageChild() {
  const searchParams = useSearchParams();
  
  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  
  // Filters
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Get search query and category from URL params
  const searchQuery = searchParams.get("search") || "";
  const categoryParam = searchParams.get("category") || "";

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(null);

      try {
        // Build API params
        const params: ProductListParams = {
          page: currentPage,
          limit: PRODUCTS_PER_PAGE,
        };

        // Add search if present
        if (searchQuery) {
          params.search = searchQuery;
        }

        // Add category if present
        if (categoryParam) {
          params.category = categoryParam;
        }

        // Add brand filter
        if (selectedBrands.length > 0) {
          params.brand = selectedBrands[0]; // API supports single brand for now
        }

        // Add price range filter
        if (selectedPriceRanges.length > 0) {
          // Parse first price range (e.g., "$0-$50" -> min: 0, max: 50)
          const range = selectedPriceRanges[0]?.replace("$", "").split("-") || [];
          if (range[0]) params.minPrice = parseInt(range[0] || "0");
          if (range[1]) params.maxPrice = parseInt(range[1] || "0");
        }

        // Call API
        const response = await getProducts(params);

        if (response.success && response.data) {
          setProducts(response.data.products);
          setTotalPages(response.data.pagination.totalPages);
          setTotalProducts(response.data.pagination.total);
        } else {
          setError(response.error || "Failed to load products");
        }
      } catch (err: any) {
        console.error("Error fetching products:", err);
        setError(err.message || "Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [
    currentPage,
    searchQuery,
    categoryParam,
    selectedBrands,
    selectedPriceRanges,
  ]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    categoryParam,
    selectedSizes,
    selectedColors,
    selectedPriceRanges,
    selectedBrands,
    selectedCollections,
    selectedTags,
  ]);

  const handleAddToCart = (productId: string) => {
    // Handle add to cart logic (will be implemented in Phase 2)
    console.log("Add to cart:", productId);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-center py-20">
            <BarsSpinner />
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-white py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center py-12">
            <div className="text-red-600 text-lg mb-4">⚠️ Error Loading Products</div>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Sidebar - Filters */}
          <aside className="w-full lg:w-64 shrink-0">
            <ProductFilters
              selectedSizes={selectedSizes}
              selectedColors={selectedColors}
              selectedPriceRanges={selectedPriceRanges}
              selectedBrands={selectedBrands}
              selectedCollections={selectedCollections}
              selectedTags={selectedTags}
              onSizeChange={setSelectedSizes}
              onColorChange={setSelectedColors}
              onPriceRangeChange={setSelectedPriceRanges}
              onBrandChange={setSelectedBrands}
              onCollectionChange={setSelectedCollections}
              onTagChange={setSelectedTags}
            />
          </aside>

          {/* Main Content - Product Grid */}
          <main className="flex-1">
            {/* Page Title */}
            <div className="mb-6">
              <h1 className="text-4xl font-serif text-gray-900 mb-2 text-center lg:text-left">
                {searchQuery ? 'Search Results' : 'Print Your Dream'}
              </h1>
              
              {/* Search Query Badge */}
              {searchQuery && (
                <div className="flex items-center gap-3 mt-4">
                  <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                    <svg
                      className="w-4 h-4 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="11" cy="11" r="8"></circle>
                      <path d="m21 21-4.35-4.35"></path>
                    </svg>
                    <span className="text-sm font-medium text-blue-900">
                      Searching: <span className="font-bold">"{searchQuery}"</span>
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      window.location.href = '/products';
                    }}
                    className="flex items-center gap-1 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Clear search
                  </button>
                </div>
              )}
            </div>

            {/* Results Count */}
            <p className="text-sm text-gray-600 mb-6">
              {searchQuery && totalProducts === 0 ? (
                <span className="text-amber-600 font-medium">No results found</span>
              ) : (
                <>
                  Showing {products.length} of {totalProducts} product{totalProducts !== 1 ? 's' : ''}
                  {categoryParam && ` in ${categoryParam}`}
                </>
              )}
            </p>

            {/* Product Grid */}
            {products.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      id={product.id}
                      brand={product.brand?.name || "Unknown Brand"}
                      name={product.name}
                      price={Number(product.sellingPrice || product.basePrice)}
                      image={product.images?.[0]?.url}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                )}
              </>
            ) : (
              /* No Results Message */
              <div className="text-center py-16 px-4">
                <div className="max-w-md mx-auto">
                  {/* Icon */}
                  <div className="mb-6">
                    <svg
                      className="w-20 h-20 mx-auto text-gray-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="11" cy="11" r="8" strokeWidth="2"></circle>
                      <path d="m21 21-4.35-4.35" strokeWidth="2"></path>
                      <line x1="11" y1="8" x2="11" y2="14" strokeWidth="2"></line>
                      <line x1="8" y1="11" x2="14" y2="11" strokeWidth="2"></line>
                    </svg>
                  </div>

                  {searchQuery ? (
                    <>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        No results for "{searchQuery}"
                      </h3>
                      <p className="text-gray-600 mb-6">
                        We couldn't find any products matching your search. Try using different keywords or check out our popular products.
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <button
                          onClick={() => {
                            window.location.href = '/products';
                          }}
                          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                          Browse All Products
                        </button>
                        <button
                          onClick={() => {
                            window.location.href = '/';
                          }}
                          className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                        >
                          Go to Homepage
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        No products found
                      </h3>
                      <p className="text-gray-600 mb-6">
                        Try adjusting your filters to see more results.
                      </p>
                      <button
                        onClick={() => {
                          setSelectedSizes([]);
                          setSelectedColors([]);
                          setSelectedPriceRanges([]);
                          setSelectedBrands([]);
                          setSelectedCollections([]);
                          setSelectedTags([]);
                        }}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                      >
                        Clear All Filters
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

const ProductsPage = () => {
  return (
    <Suspense fallback={<BarsSpinner />}>
      <ProductsPageChild />
    </Suspense>
  );
};

export default ProductsPage;
