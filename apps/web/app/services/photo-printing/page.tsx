'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProductPageTemplate } from '@/app/components/services/ProductPageTemplate';
import { OptionSelector } from '@/app/components/services/print/OptionSelector';
import { QuantitySelector } from '@/app/components/services/QuantitySelector';
import {
    GLOSSY_PHOTO_PRODUCTS,
    MATT_PHOTO_PRODUCTS,
    GLOSSY_LAMINATION_PRODUCTS
} from '@/constant/services/photo-printing'
import { ProductData } from '@/types';
import { addToCart } from '@/lib/api/cart';
import { getProducts } from '@/lib/api/products';

type PhotoType = 'glossy' | 'matt';
type PhotoSize = '4X6' | '5X7' | '8X10' | 'A4' | '8X12' | '10X15' | '12X18' | 'A3' | 'A2' | 'A1' | 'A0';
type LaminationType = 'None' | '4X6' | '5X7' | '8X10' | 'A4' | '8X12' | '10X15' | '12X18' | 'A3' | 'A2' | 'A1' | 'A0';

// Helper to get all available photo sizes
const getAllPhotoSizes = (): PhotoSize[] => {
    const glossySizes = GLOSSY_PHOTO_PRODUCTS.map(p => p.size as PhotoSize);
    const mattSizes = MATT_PHOTO_PRODUCTS.map(p => p.size as PhotoSize);
    return Array.from(new Set([...glossySizes, ...mattSizes]));
};

// Helper to get available lamination sizes
const getLaminationSizes = (): LaminationType[] => {
    return ['None', ...GLOSSY_LAMINATION_PRODUCTS.map(p => p.size as LaminationType)];
};

const ALL_PHOTO_SIZES = getAllPhotoSizes();

export default function PhotoPrintingPage() {
    const router = useRouter();
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [selectedPhotoType, setSelectedPhotoType] = useState<PhotoType>('glossy');
    const [selectedPhotoSize, setSelectedPhotoSize] = useState<PhotoSize>('4X6');
    const [selectedLamination, setSelectedLamination] = useState<LaminationType>('None');
    const [quantity, setQuantity] = useState<number>(1);
    const [priceBreakdown, setPriceBreakdown] = useState<Array<{ label: string; value: number }>>([]);
    const [totalPrice, setTotalPrice] = useState<number>(0);
    const [addToCartLoading, setAddToCartLoading] = useState(false);
    const [buyNowLoading, setBuyNowLoading] = useState(false);

    // Get available sizes for selected photo type
    const getAvailableSizes = (): PhotoSize[] => {
        if (selectedPhotoType === 'glossy') {
            return GLOSSY_PHOTO_PRODUCTS.map(p => p.size as PhotoSize);
        } else {
            return MATT_PHOTO_PRODUCTS.map(p => p.size as PhotoSize);
        }
    };

    // Calculate price whenever any selection changes
    useEffect(() => {
        calculatePrice();
    }, [
        selectedPhotoType,
        selectedPhotoSize,
        selectedLamination,
        quantity
    ]);

    const calculatePrice = () => {
        const breakdown: Array<{ label: string; value: number }> = [];
        let total = 0;

        // 1. Calculate photo printing price
        let photoPrice = 0;
        if (selectedPhotoType === 'glossy') {
            const glossyPhoto = GLOSSY_PHOTO_PRODUCTS.find(p => p.size === selectedPhotoSize);
            if (glossyPhoto) {
                photoPrice = glossyPhoto.price * quantity;
                breakdown.push({
                    label: `Glossy Photo ${selectedPhotoSize} (${quantity} photos)`,
                    value: photoPrice
                });
                total += photoPrice;
            }
        } else {
            const mattPhoto = MATT_PHOTO_PRODUCTS.find(p => p.size === selectedPhotoSize);
            if (mattPhoto) {
                photoPrice = mattPhoto.price * quantity;
                breakdown.push({
                    label: `Matt Photo ${selectedPhotoSize} (${quantity} photos)`,
                    value: photoPrice
                });
                total += photoPrice;
            }
        }

        // 2. Calculate lamination price if selected
        if (selectedLamination !== 'None') {
            const lamination = GLOSSY_LAMINATION_PRODUCTS.find(p => p.size === selectedLamination);
            if (lamination) {
                const laminationPrice = lamination.price * quantity;
                breakdown.push({
                    label: `Glossy Lamination ${selectedLamination} (${quantity} sheets)`,
                    value: laminationPrice
                });
                total += laminationPrice;
            }
        }

        setPriceBreakdown(breakdown);
        setTotalPrice(Number(total.toFixed(2)));
    };

    // Get photo size options based on selected type
    const getPhotoSizeOptions = () => {
        const availableSizes = getAvailableSizes();
        const currentPhotoType = selectedPhotoType === 'glossy' ? GLOSSY_PHOTO_PRODUCTS : MATT_PHOTO_PRODUCTS;

        return availableSizes.map(size => {
            const photo = currentPhotoType.find(p => p.size === size);
            return {
                id: size.toLowerCase().replace(/x/g, '-'),
                label: size,
                value: size,
                price: photo?.price || 0,
                description: `${selectedPhotoType === 'glossy' ? 'Glossy' : 'Matt'} finish`
            };
        });
    };

    // Get lamination options
    const getLaminationOptions = () => {
        return getLaminationSizes().map(size => {
            if (size === 'None') {
                return {
                    id: 'none',
                    label: 'No Lamination',
                    value: 'None',
                    price: 0,
                    description: 'Print only'
                };
            }

            const lamination = GLOSSY_LAMINATION_PRODUCTS.find(p => p.size === size);
            return {
                id: size.toLowerCase().replace(/x/g, '-'),
                label: `Glossy Lamination ${size}`,
                value: size,
                price: lamination?.price || 0,
                description: `per ${size} sheet`
            };
        });
    };

    const productData: Partial<ProductData> = {
        category: 'photo-printing',
        title: 'Professional Photo Printing Service',
        description: 'Get high-quality photo prints with glossy or matt finish, various sizes, and optional lamination.',
        basePrice: 10, // 4X6 Glossy starting price
        features: [
            'High-resolution photo printing',
            'Choose from glossy or matt finish',
            'Multiple sizes from 4X6 to A0',
            'Professional color calibration',
            'Archival quality paper',
            'Optional glossy lamination',
            'Fast turnaround time',
            'Perfect for portraits, events, and artwork',
            'Bulk order discounts available',
            'Custom cropping and editing available',
        ],
    };

    const breadcrumbItems = [
        { label: 'Home', href: '/' },
        { label: 'Printing Services', href: '/printing' },
        { label: 'Photo Printing', href: '/photo-printing', isActive: true },
    ];

    // Helper function to find product by configuration
    const findProductByConfig = async (photoType: PhotoType, photoSize: PhotoSize) => {
        try {
            // Search for the product by name
            const productName = `${photoType === 'glossy' ? 'Glossy' : 'Matt'} Photo ${photoSize}`;
            console.log('🔎 Searching for product with name:', productName);
            
            // Search in photo-printout category
            const response = await getProducts({
                search: productName,
                category: 'photo-printout',
                limit: 1
            });

            console.log('📡 API Response:', response);

            if (response.success && response.data && response.data.products.length > 0) {
                console.log('✅ Product found:', response.data.products[0]);
                return response.data.products[0];
            }
            
            console.log('⚠️ No product found matching criteria');
            return null;
        } catch (error) {
            console.error('❌ Error finding product:', error);
            return null;
        }
    };

    const handleAddToCart = async () => {
        console.log('🛒 handleAddToCart called', { uploadedFile, selectedPhotoType, selectedPhotoSize, quantity });
        
        if (!uploadedFile) {
            alert('Please upload a file first');
            return;
        }

        try {
            setAddToCartLoading(true);

            // Find the product based on selection
            console.log('🔍 Searching for product...');
            const product = await findProductByConfig(selectedPhotoType, selectedPhotoSize);
            console.log('📦 Product found:', product);
            
            if (!product) {
                alert('Product not found. Please try a different configuration.');
                return;
            }

            // Upload file URL would be implemented here
            // For now, using file name as placeholder
            const customDesignUrl = uploadedFile.name;

            // Add to cart
            console.log('➕ Adding to cart with productId:', product.id);
            const response = await addToCart({
                productId: product.id,
                quantity: quantity,
                customDesignUrl: customDesignUrl
            });

            console.log('📥 Add to cart response:', response);

            if (response.success) {
                alert('✅ Added to cart successfully!');
                // Trigger a page refresh to update cart count
                window.location.reload();
            } else {
                alert(`❌ Failed to add to cart: ${response.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('❌ Error adding to cart:', error);
            alert('❌ Failed to add to cart. Please try again.');
        } finally {
            setAddToCartLoading(false);
        }
    };

    const handleBuyNow = async () => {
        console.log('💳 handleBuyNow called', { uploadedFile, selectedPhotoType, selectedPhotoSize, quantity });
        
        if (!uploadedFile) {
            alert('Please upload a file first');
            return;
        }

        try {
            setBuyNowLoading(true);

            // Find the product based on selection
            console.log('🔍 Searching for product...');
            const product = await findProductByConfig(selectedPhotoType, selectedPhotoSize);
            console.log('📦 Product found:', product);
            
            if (!product) {
                alert('Product not found. Please try a different configuration.');
                return;
            }

            // Upload file URL would be implemented here
            const customDesignUrl = uploadedFile.name;

            // Add to cart
            console.log('➕ Adding to cart before checkout with productId:', product.id);
            const response = await addToCart({
                productId: product.id,
                quantity: quantity,
                customDesignUrl: customDesignUrl
            });

            console.log('📥 Add to cart response:', response);

            if (response.success) {
                console.log('✅ Success! Redirecting to checkout...');
                // Redirect to checkout
                router.push('/checkout');
            } else {
                alert(`❌ Failed to process: ${response.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('❌ Error processing buy now:', error);
            alert('❌ Failed to process. Please try again.');
        } finally {
            setBuyNowLoading(false);
        }
    };

    // Handle photo size change
    const handlePhotoSizeChange = (size: string) => {
        setSelectedPhotoSize(size as PhotoSize);
        // Reset lamination if size changes (lamination must match photo size)
        if (selectedLamination !== 'None' && selectedLamination !== size) {
            setSelectedLamination('None');
        }
    };

    return (
        <ProductPageTemplate
            productData={productData}
            breadcrumbItems={breadcrumbItems}
            uploadedFile={uploadedFile}
            onFileSelect={setUploadedFile}
            onFileRemove={() => setUploadedFile(null)}
            priceItems={priceBreakdown}
            totalPrice={totalPrice}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            addToCartLoading={addToCartLoading}
            buyNowLoading={buyNowLoading}
        >
            {/* Configuration options */}
            <div className="space-y-8">
                {/* Photo Type Selection */}
                <OptionSelector
                    title="Photo Finish"
                    options={[
                        {
                            id: 'glossy',
                            label: 'Glossy',
                            value: 'glossy',
                            description: 'Shiny finish, vibrant colors'
                        },
                        {
                            id: 'matt',
                            label: 'Matt',
                            value: 'matt',
                            description: 'Non-reflective, professional look'
                        },
                    ]}
                    selectedValue={selectedPhotoType}
                    onSelect={(value) => {
                        setSelectedPhotoType(value as PhotoType);
                        // Reset size to first available for new type
                        const availableSizes = getAvailableSizes();
                        if (availableSizes.length > 0 && !availableSizes.includes(selectedPhotoSize)) {
                            setSelectedPhotoSize(availableSizes[0]!);
                        }
                    }}
                    layout="inline"
                />

                {/* Photo Size Selection */}
                <OptionSelector
                    title="Photo Size"
                    options={getPhotoSizeOptions()}
                    selectedValue={selectedPhotoSize}
                    onSelect={handlePhotoSizeChange}
                    layout="grid"
                    columns={4}
                    showPrice={true}
                />

                {/* Lamination Selection */}
                <div className="space-y-4">
                    <OptionSelector
                        title="Lamination"
                        options={getLaminationOptions()}
                        selectedValue={selectedLamination}
                        onSelect={(value) => setSelectedLamination(value as LaminationType)}
                        layout="grid"
                        columns={3}
                        showPrice={true}
                    />

                    {selectedLamination !== 'None' && selectedLamination !== selectedPhotoSize && (
                        <div className="p-3 bg-yellow-50 border border-yellow-100 rounded-lg">
                            <div className="text-yellow-800 text-sm">
                                <strong>Note:</strong> Lamination size ({selectedLamination}) must match photo size ({selectedPhotoSize}).
                                Please select matching sizes for proper lamination.
                            </div>
                        </div>
                    )}
                </div>

                {/* Quantity Selection */}
                <QuantitySelector
                    value={quantity}
                    onChange={setQuantity}
                    label="Quantity (Photos)"
                    unit="photos"
                    min={1}
                    max={1000}
                />

                {/* Photo Printing Tips */}
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                    <h4 className="font-hkgb text-blue-900 mb-2">Photo Printing Tips</h4>
                    <ul className="text-blue-800 text-sm space-y-1">
                        <li>• Upload high-resolution images (300 DPI recommended)</li>
                        <li>• Glossy finish is ideal for vibrant, colorful photos</li>
                        <li>• Matt finish reduces glare and fingerprints</li>
                        <li>• Lamination protects photos from moisture and UV damage</li>
                        <li>• For best results, upload images in sRGB color space</li>
                    </ul>
                </div>
            </div>
        </ProductPageTemplate>
    );
}
