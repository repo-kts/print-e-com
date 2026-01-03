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
import { SlidersVertical } from "lucide-react";

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
                <div className="space-y-6 bg-white p-4 md:p-6 rounded-xl">
                    {/* Header Section */}
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                        <div>
                            <h3 className="text-xl md:text-2xl font-bold text-gray-900">
                                Product Reviews (<span>{product.reviews?.length || 0}</span>)
                            </h3>
                            <div className="mt-2 flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl font-bold text-gray-900">4.8</span>
                                    <div className="flex">
                                        {[...Array(5)].map((_, i) => (
                                            <span key={i} className="text-yellow-400 text-lg">
                                                ★
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <span className="text-sm text-gray-500 hidden sm:inline">
                                    Based on {product.reviews?.length || 0} reviews
                                </span>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                            <div className="flex items-center gap-3">
                                <button
                                    className="p-3 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full transition-all duration-200 hover:shadow-sm flex-shrink-0"
                                    title="Filter by rating"
                                >
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                        <line x1="4" y1="21" x2="4" y2="14" />
                                        <line x1="4" y1="10" x2="4" y2="3" />
                                        <line x1="12" y1="21" x2="12" y2="12" />
                                        <line x1="12" y1="8" x2="12" y2="3" />
                                        <line x1="20" y1="21" x2="20" y2="16" />
                                        <line x1="20" y1="12" x2="20" y2="3" />
                                        <line x1="1" y1="14" x2="7" y2="14" />
                                        <line x1="9" y1="8" x2="15" y2="8" />
                                        <line x1="17" y1="16" x2="23" y2="16" />
                                    </svg>
                                </button>

                                {/* Custom Select */}
                                <div className="relative flex-1 sm:flex-initial min-w-[160px]">
                                    <select className="w-full pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-full text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none shadow-sm hover:shadow transition-all duration-200 cursor-pointer">
                                        <option value="latest">Latest</option>
                                        <option value="oldest">Oldest</option>
                                        <option value="highest">Highest Rating</option>
                                        <option value="lowest">Lowest Rating</option>
                                        <option value="helpful">Most Helpful</option>
                                    </select>
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                            <path d="M6 9l6 6 6-6" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            <button className="px-4 py-3 bg-[#1EADD8] text-white rounded-full font-hkgb hover:from-blue-700 hover:to-blue-800 transition-all duration-300 text-sm font-medium shadow hover:shadow-lg active:scale-[0.98] whitespace-nowrap">
                                <span className="hidden sm:inline">Write a Review</span>
                                <span className="sm:hidden">Review</span>
                            </button>
                        </div>
                    </div>

                    {/* Reviews Container */}
                    <div className="max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                        {product.reviews && product.reviews.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {product.reviews.map((review: any) => (
                                    <div
                                        key={review.id}
                                        className="border border-gray-100 rounded-xl p-4 md:p-5 hover:border-gray-200 transition-all duration-200 hover:shadow-sm bg-white h-fit"
                                    >
                                        {/* Review Header */}
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-start gap-3 flex-1">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center font-semibold text-blue-600 flex-shrink-0">
                                                    {review.user?.name?.charAt(0) || "A"}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex flex-col gap-1 mb-1">
                                                        <span className="font-medium text-gray-900 truncate">
                                                            {review.user?.name || "Anonymous"}
                                                        </span>
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex">
                                                                {[...Array(5)].map((_, i) => (
                                                                    <span
                                                                        key={i}
                                                                        className={`text-sm ${i < review.rating ? "text-yellow-400" : "text-gray-300"}`}
                                                                    >
                                                                        ★
                                                                    </span>
                                                                ))}
                                                            </div>
                                                            <span className="text-xs text-gray-500">
                                                                {review.date || "Posted recently"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <button className="text-gray-400 hover:text-blue-600 transition-colors p-1 flex-shrink-0 ml-2">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M12 5v14M5 12h14" />
                                                </svg>
                                            </button>
                                        </div>

                                        {/* Review Content */}
                                        {review.title && (
                                            <h4 className="font-semibold text-gray-900 mb-2 text-base md:text-lg line-clamp-1">
                                                {review.title}
                                            </h4>
                                        )}

                                        {review.comment && (
                                            <p className="text-gray-700 leading-relaxed mb-4 line-clamp-3 hover:line-clamp-none transition-all cursor-pointer text-sm md:text-base">
                                                {review.comment}
                                            </p>
                                        )}

                                        {/* Tags & Actions */}
                                        <div className="flex flex-col gap-3 pt-3 border-t border-gray-100">
                                            <div className="flex flex-wrap gap-2">
                                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium">
                                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                                                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                                    </svg>
                                                    Verified
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <button className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600 transition-colors text-sm">
                                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                                                    </svg>
                                                    <span>Helpful ({review.helpful || 12})</span>
                                                </button>
                                                <button className="text-gray-600 hover:text-red-600 transition-colors text-sm">
                                                    Report
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                                    </svg>
                                </div>
                                <p className="text-lg font-medium text-gray-600 mb-2">No reviews yet</p>
                                <p className="text-gray-500 mb-6 max-w-md mx-auto">
                                    Be the first to share your thoughts about this product!
                                </p>
                                <button className="px-5 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-300 text-sm font-medium shadow hover:shadow-lg inline-flex items-center gap-2">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 5v14M5 12h14" />
                                    </svg>
                                    Write the First Review
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Load More */}
                    {product.reviews && product.reviews.length > 0 && product.reviews.length > 3 && (
                        <div className="pt-4 border-t border-gray-100">
                            <button className="w-full py-3.5 text-center text-blue-600 hover:text-blue-700 font-medium rounded-lg border-2 border-blue-200 hover:border-blue-300 transition-all duration-200 hover:bg-blue-50 active:scale-[0.98] group">
                                <span className="inline-flex items-center gap-2">
                                    Load More Reviews
                                    <svg
                                        className="w-4 h-4 group-hover:translate-y-1 transition-transform"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2.5"
                                    >
                                        <path d="M19 9l-7 7-7-7" />
                                    </svg>
                                </span>
                            </button>
                        </div>
                    )}

                    {/* Add scrollbar styles if not using Tailwind's plugin */}
                    <style jsx>{`
                        .scrollbar-thin::-webkit-scrollbar {
                            width: 6px;
                        }
                        .scrollbar-thin::-webkit-scrollbar-track {
                            background: #f1f1f1;
                            border-radius: 3px;
                        }
                        .scrollbar-thin::-webkit-scrollbar-thumb {
                            background: #d1d1d1;
                            border-radius: 3px;
                        }
                        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
                            background: #a1a1a1;
                        }
                        .line-clamp-3 {
                            display: -webkit-box;
                            -webkit-line-clamp: 3;
                            -webkit-box-orient: vertical;
                            overflow: hidden;
                        }
                        `}</style>
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
            <div className="w-full px-30">
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
                                className="flex-1 px-8 py-3 bg-[#1EADD8] text-white rounded-full font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
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
