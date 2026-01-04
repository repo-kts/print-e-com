'use client';

import React from 'react';
import { ProductConfigProvider } from '@/contexts/ProductConfigContext';
import { ProductHeader } from './ProductHeader';
import { ProductGallery } from './ProductGallery';
import { ProductFeatures } from './ProductFeatures';
import { ProductFileUpload } from './print/FileUpload';
import { PriceBreakdown } from './print/PriceBreakdown';
import { Button } from './print/Button';
import { ShoppingCart } from 'lucide-react';
import { ProductData, BreadcrumbItem } from '@/types';

interface ProductPageTemplateProps {
    productData: ProductData;
    breadcrumbItems: BreadcrumbItem[];
    uploadedFile: File | null;
    onFileSelect: (file: File) => void;
    onFileRemove: () => void;
    priceItems: Array<{ label: string; value: number; description?: string }>;
    totalPrice: number;
    onAddToCart: () => void;
    onBuyNow: () => void;
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
    children,
}) => {
    return (
        <div>
            <div className="min-h-screen bg-gray-50">
                {/* Breadcrumb */}
                <div className="bg-white border-b border-gray-100">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
                        <ProductHeader
                            title={productData.title}
                            subtitle={productData.description}
                            breadcrumbItems={breadcrumbItems}
                            rating={4.8}
                            reviewCount={2347}
                            badges={[{ text: 'In Stock', variant: 'success' }]}
                        />
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                        {/* Left Column - Product Info & Configuration */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Product Card */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
                                <ProductGallery
                                    images={[]} // Pass actual images here
                                    fallbackIcon={<ShoppingCart className="w-24 h-24 text-[#008ECC]" />}
                                />

                                <div className="mt-6">
                                    <ProductFeatures features={productData.features} />
                                </div>
                            </div>

                            {/* Configuration Options */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
                                {children}
                            </div>
                        </div>

                        {/* Right Column - Price & Checkout */}
                        <div className="space-y-6">
                            {/* Price Card */}
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 sticky top-6">
                                <PriceBreakdown
                                    items={priceItems}
                                    total={totalPrice}
                                    currency="₹"
                                />

                                <div className="mt-6">
                                    <ProductFileUpload
                                        onFileSelect={onFileSelect}
                                        uploadedFile={uploadedFile}
                                        onRemove={onFileRemove}
                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                        title="Upload Your File"
                                    />
                                </div>

                                {/* Action Buttons */}
                                <div className="mt-6 space-y-3">
                                    <Button
                                        variant="primary"
                                        size="lg"
                                        icon={ShoppingCart}
                                        fullWidth
                                        disabled={!uploadedFile}
                                        onClick={onAddToCart}
                                        className="text-base"
                                    >
                                        {uploadedFile
                                            ? `Add to Cart - ₹${totalPrice.toFixed(2)}`
                                            : 'Upload File to Continue'
                                        }
                                    </Button>

                                    <Button
                                        variant="secondary"
                                        size="lg"
                                        fullWidth
                                        disabled={!uploadedFile}
                                        onClick={onBuyNow}
                                    >
                                        Buy Now
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
