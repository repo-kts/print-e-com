'use client';

import React from 'react';
import { ProductHeader } from './ProductHeader';
import { ProductGallery } from './ProductGallery';
import { ProductFeatures } from './ProductFeatures';
import { ProductFileUpload } from './print/FileUpload';
import { PriceBreakdown } from './print/PriceBreakdown';
import { Button } from './print/Button';
import { ShoppingCart } from 'lucide-react';
import { ProductData, BreadcrumbItem } from '@/types';
import { Breadcrumb } from '../ui/Breadcrumb';
import Breadcrumbs from '../Breadcrumbs';
import { useRouter } from 'next/navigation';

interface ProductPageTemplateProps {
    productData: Partial<ProductData>;
    breadcrumbItems: BreadcrumbItem[];
    uploadedFile: File | null;
    onFileSelect: (file: File) => void;
    onFileRemove: () => void;
    priceItems: Array<{ label: string; value: number; description?: string }>;
    totalPrice: number;
    onAddToCart: () => void;
    onBuyNow: () => void;
    addToCartLoading?: boolean;
    buyNowLoading?: boolean;
    children: React.ReactNode;
}

export const ProductPageTemplate: React.FC<ProductPageTemplateProps> = ({
    productData,
    breadcrumbItems,
    uploadedFile,
    onFileSelect,
    onFileRemove,
    priceItems,
    totalPrice,
    onAddToCart,
    onBuyNow,
    addToCartLoading = false,
    buyNowLoading = false,
    children,
}) => {
    const router = useRouter();

    // Transform breadcrumb items to match Breadcrumbs component format
    const breadcrumbsFormatted = breadcrumbItems.map(item => ({
        label: item.label,
        href: item.href,
        isActive: item.isActive
    }));

    return (
        <div className="min-h-screen bg-white py-8">
            <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-30">
                {/* Breadcrumbs - Hidden on mobile, shown on tablet and above */}
                <div className="hidden sm:block mb-6">
                    <Breadcrumbs items={breadcrumbsFormatted} />
                </div>

                {/* Mobile Breadcrumb - Simple version */}
                <div className="sm:hidden mb-4 text-sm text-gray-600">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-1 hover:text-blue-600 cursor-pointer"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M19 12H5M12 19l-7-7 7-7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Back
                    </button>
                </div>

                {/* Main Product Section - Matching product detail layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
                    {/* Left Column - Product Images & Configuration (7/12 on desktop) */}
                    <div className="lg:col-span-7">
                        <div className="sticky top-24 space-y-6 max-h-[calc(100vh-120px)] overflow-y-auto">
                            {/* Product Gallery */}
                            <div className="bg-white p-2 rounded-xl border border-gray-200">
                                <ProductGallery
                                    images={[]} // Pass actual images here
                                    fallbackIcon={<ShoppingCart className="w-24 h-24 text-[#008ECC]" />}
                                />
                            </div>

                            {/* File Upload Section */}
                            <div className="bg-gray-50 p-4 sm:p-6 rounded-xl">
                                <ProductFileUpload
                                    onFileSelect={onFileSelect}
                                    uploadedFile={uploadedFile}
                                    onRemove={onFileRemove}
                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                    title="Upload Your File"
                                />
                            </div>

                            {/* Configuration Options */}
                            <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Customize Your Order</h3>
                                {children}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Product Info & Pricing (5/12 on desktop) */}
                    <div className="lg:col-span-5">
                        <div className="sticky top-24 space-y-6">
                            {/* Product Title */}
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                                    {productData.title || 'Service'}
                                </h1>
                                {productData.description && (
                                    <p className="text-gray-600 text-sm mt-2">
                                        {productData.description}
                                    </p>
                                )}
                            </div>

                            {/* Price Section */}
                            <div className="bg-gray-50 p-4 sm:p-6 rounded-xl">
                                <PriceBreakdown
                                    items={priceItems}
                                    total={totalPrice}
                                    currency="₹"
                                />
                                {/* Tax Info */}
                                <div className="mt-2 text-sm text-green-600 font-medium">
                                    Inclusive of all taxes
                                </div>
                            </div>

                            {/* Features */}
                            {productData.features && productData.features.length > 0 && (
                                <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200">
                                    <h3 className="font-semibold text-gray-900 mb-3">Features</h3>
                                    <ProductFeatures features={productData.features} />
                                </div>
                            )}

                            {/* Action Buttons - Desktop */}
                            <div className="hidden sm:flex gap-4 pt-6 border-t border-gray-300">
                                <button
                                    onClick={onAddToCart}
                                    disabled={!uploadedFile || addToCartLoading}
                                    className="flex-1 px-8 py-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-3 cursor-pointer"
                                >
                                    <ShoppingCart size={20} />
                                    {!uploadedFile 
                                        ? 'Upload File to Continue'
                                        : addToCartLoading 
                                        ? 'Adding...' 
                                        : 'Add to Cart'
                                    }
                                </button>
                                <button
                                    onClick={onBuyNow}
                                    disabled={!uploadedFile || buyNowLoading}
                                    className="flex-1 px-8 py-4 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {buyNowLoading ? 'Processing...' : 'Buy Now'}
                                </button>
                            </div>

                            {/* Seller Info */}
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="font-medium text-gray-900">Service Provider</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <span className="font-bold text-blue-600">P</span>
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900">PAGZ Store</div>
                                        <div className="text-sm text-gray-500">Professional Printing Services</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Fixed Mobile Action Bar */}
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 shadow-lg sm:hidden z-50">
                    <div className="flex p-4 gap-3">
                        <button
                            onClick={onAddToCart}
                            disabled={!uploadedFile || addToCartLoading}
                            className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
                        >
                            {!uploadedFile 
                                ? 'Upload File'
                                : addToCartLoading 
                                ? 'Adding...' 
                                : 'Add to Cart'
                            }
                        </button>
                        <button
                            onClick={onBuyNow}
                            disabled={!uploadedFile || buyNowLoading}
                            className="flex-1 px-4 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {buyNowLoading ? 'Processing...' : 'Buy Now'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
