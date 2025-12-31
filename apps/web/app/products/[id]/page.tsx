"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Breadcrumbs from "../../components/Breadcrumbs";
import ProductImageGallery from "../../components/ProductImageGallery";
import ProductRating from "../../components/ProductRating";
import PriceDisplay from "../../components/PriceDisplay";
import UploadDesign from "../../components/UploadDesign";
import SizeSelector from "../../components/SizeSelector";
import QuantitySelector from "../../components/QuantitySelector";
import ProductTabs from "../../components/ProductTabs";
import RelatedProducts from "../../components/RelatedProducts";
import { BarsSpinner } from "../../components/shared/BarsSpinner";
import { getProduct, getProducts, type Product } from "../../../lib/api/products";

export default function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  
  // State
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  // Fetch product data
  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch main product
        const response = await getProduct(id);

        if (response.success && response.data) {
          const productData = response.data;
          setProduct(productData);

          // Set default variant if available
          if (productData.variants && productData.variants.length > 0) {
            setSelectedVariant(productData.variants[0].id);
            setSelectedSize(productData.variants[0].name);
          }

          // Fetch related products (same category)
          if (productData.categoryId) {
            const relatedResponse = await getProducts({
              category: productData.categoryId,
              limit: 4,
            });

            if (relatedResponse.success && relatedResponse.data) {
              // Filter out current product
              const related = relatedResponse.data.products.filter(
                (p) => p.id !== productData.id
              );
              setRelatedProducts(related);
            }
          }
        } else {
          setError("Product not found");
        }
      } catch (err: any) {
        console.error("Error fetching product:", err);
        setError(err.message || "Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id]);

  const handleAddToCart = () => {
    // Handle add to cart logic (will be implemented in Phase 2)
    console.log("Add to cart:", {
      productId: product?.id,
      variantId: selectedVariant,
      size: selectedSize,
      quantity,
    });
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
  if (error || !product) {
    return (
      <div className="min-h-screen bg-white py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center py-12">
            <div className="text-red-600 text-lg mb-4">⚠️ {error || "Product Not Found"}</div>
            <p className="text-gray-600 mb-4">
              {error === "Product not found" 
                ? "The product you're looking for doesn't exist or has been removed."
                : "There was an error loading this product."}
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => router.back()}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Go Back
              </button>
              <button
                onClick={() => router.push("/products")}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse Products
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Build breadcrumbs
  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/products" },
    ...(product.category
      ? [{ label: product.category.name, href: `/products?category=${product.category.slug}` }]
      : []),
    { label: product.name, href: `/products/${product.id}` },
  ];

  // Prepare product images
  const productImages = product.images?.map((img) => img.url) || ["/products/placeholder.jpg"];

  // Prepare sizes from variants
  const sizes = product.variants?.map((v) => v.name) || [];

  // Calculate price
  const currentPrice = Number(product.sellingPrice || product.basePrice);
  const originalPrice = product.mrp ? Number(product.mrp) : undefined;
  const discount = originalPrice
    ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100)
    : undefined;

  // Prepare tabs content
  const tabs = [
    {
      id: "details",
      label: "Product Details",
      content: (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-600 whitespace-pre-line">
              {product.description || product.shortDescription || "No description available."}
            </p>
          </div>

          {/* Specifications */}
          {product.specifications && product.specifications.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.specifications.map((spec) => (
                  <div key={spec.id} className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600 font-medium">{spec.key}:</span>
                    <span className="text-gray-900">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional Info */}
          <div className="space-y-2 text-sm text-gray-600">
            {product.sku && <p>SKU: {product.sku}</p>}
            {product.brand && <p>Brand: {product.brand.name}</p>}
            {product.weight && <p>Weight: {product.weight} kg</p>}
            {product.dimensions && <p>Dimensions: {product.dimensions}</p>}
            {product.returnPolicy && (
              <div>
                <p className="font-medium text-gray-900 mt-4">Return Policy:</p>
                <p>{product.returnPolicy}</p>
              </div>
            )}
            {product.warranty && (
              <div>
                <p className="font-medium text-gray-900 mt-4">Warranty:</p>
                <p>{product.warranty}</p>
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      id: "reviews",
      label: "Rating & Reviews",
      content: (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
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
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                </svg>
              </button>
              <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
                <option>Latest</option>
                <option>Oldest</option>
                <option>Highest Rating</option>
                <option>Lowest Rating</option>
              </select>
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
              Write a Review
            </button>
          </div>

          {/* Display reviews if available */}
          {product.reviews && product.reviews.length > 0 ? (
            <div className="space-y-4">
              {product.reviews.map((review: any) => (
                <div key={review.id} className="border-b border-gray-200 pb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={i < review.rating ? "text-yellow-400" : "text-gray-300"}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      by {review.user?.name || "Anonymous"}
                    </span>
                  </div>
                  {review.title && (
                    <h4 className="font-medium text-gray-900 mb-1">{review.title}</h4>
                  )}
                  {review.comment && <p className="text-gray-600 text-sm">{review.comment}</p>}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>No reviews yet. Be the first to review this product!</p>
            </div>
          )}
        </div>
      ),
    },
    {
      id: "faqs",
      label: "FAQs",
      content: (
        <div className="space-y-4">
          <div className="text-center py-12 text-gray-500">
            <p>No FAQs available for this product yet.</p>
          </div>
        </div>
      ),
    },
  ];

  // Prepare related products for component
  const relatedProductsData = relatedProducts.map((p) => ({
    id: p.id,
    name: p.name,
    image: p.images?.[0]?.url || "/products/placeholder.jpg",
    rating: p.rating ? Number(p.rating) : 0,
    currentPrice: Number(p.sellingPrice || p.basePrice),
    originalPrice: p.mrp ? Number(p.mrp) : undefined,
    discount: p.mrp
      ? Math.round(((Number(p.mrp) - Number(p.sellingPrice || p.basePrice)) / Number(p.mrp)) * 100)
      : undefined,
  }));

  return (
    <div className="min-h-screen bg-white py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Breadcrumbs */}
        <Breadcrumbs items={breadcrumbs} />

        {/* Main Product Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Left Column - Product Images */}
          <div>
            <ProductImageGallery images={productImages} productName={product.name} />
          </div>

          {/* Right Column - Product Info */}
          <div className="space-y-6">
            {/* Product Title */}
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

            {/* Rating */}
            <ProductRating
              rating={product.rating ? Number(product.rating) : 0}
              reviewCount={product.totalReviews || 0}
            />

            {/* Price */}
            <PriceDisplay
              currentPrice={currentPrice}
              originalPrice={originalPrice}
              discount={discount}
            />

            {/* Short Description */}
            {product.shortDescription && (
              <p className="text-gray-600 leading-relaxed">{product.shortDescription}</p>
            )}

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              {product.stock > 0 ? (
                <>
                  <span className="inline-block w-2 h-2 bg-green-500 rounded-full"></span>
                  <span className="text-sm text-gray-600">
                    In Stock ({product.stock} available)
                  </span>
                </>
              ) : (
                <>
                  <span className="inline-block w-2 h-2 bg-red-500 rounded-full"></span>
                  <span className="text-sm text-red-600">Out of Stock</span>
                </>
              )}
            </div>

            {/* Upload Design */}
            <UploadDesign />

            {/* Size/Variant Selector */}
            {sizes.length > 0 && (
              <SizeSelector
                sizes={sizes}
                selectedSize={selectedSize}
                onSizeChange={(size) => {
                  setSelectedSize(size);
                  const variant = product.variants?.find((v) => v.name === size);
                  if (variant) setSelectedVariant(variant.id);
                }}
              />
            )}

            {/* Quantity and Add to Cart */}
            <div className="flex items-center gap-6 pt-4">
              <QuantitySelector
                quantity={quantity}
                onQuantityChange={setQuantity}
                max={product.stock}
              />
              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
              </button>
            </div>
          </div>
        </div>

        {/* Product Tabs */}
        <ProductTabs tabs={tabs} />

        {/* Related Products */}
        {relatedProductsData.length > 0 && <RelatedProducts products={relatedProductsData} />}
      </div>
    </div>
  );
}
