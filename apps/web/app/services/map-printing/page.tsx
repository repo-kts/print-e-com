'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProductPageTemplate } from '@/app/components/services/ProductPageTemplate';
import { OptionSelector } from '@/app/components/services/print/OptionSelector';
import { QuantitySelector } from '@/app/components/services/QuantitySelector';
import { MAP_PRODUCTS } from '@/constant/services/map-printing'
import { ProductData } from '@/types';
import { addToCart } from '@/lib/api/cart';
import { getProducts } from '@/lib/api/products';

type MapSize = 'A2' | 'A1' | 'A0' | 'A0+';
type MapPaperType = '80 Gsm';
type PrintType = 'B/W' | 'Color';
type PricingType = 'Standard Sheet' | 'Per Meter';
type LaminationType = '50 Micron';

type PrintOption = {
    printType: string;
    price: number;
    pricingType?: PricingType;
};

export default function MapPrintingPage() {
    const router = useRouter();
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [selectedMapSize, setSelectedMapSize] = useState<MapSize>('A2');
    const [selectedPrintType, setSelectedPrintType] = useState<PrintType>('B/W');
    const [selectedPricingType, setSelectedPricingType] = useState<PricingType>('Standard Sheet');
    const [selectedLamination, setSelectedLamination] = useState<boolean>(false);
    const [quantity, setQuantity] = useState<number>(1);
    const [priceBreakdown, setPriceBreakdown] = useState<Array<{ label: string; value: number }>>([]);
    const [totalPrice, setTotalPrice] = useState<number>(0);
    const [addToCartLoading, setAddToCartLoading] = useState(false);
    const [buyNowLoading, setBuyNowLoading] = useState(false);

    // Get selected map data
    const selectedMapData = MAP_PRODUCTS.find(map => map.paperSize === selectedMapSize);

    // Get available print options for selected map size
    const getAvailablePrintOptions = () => {
        if (!selectedMapData) return [];
        return selectedMapData.options;
    };

    // Get available pricing types for current selection
    const getAvailablePricingTypes = (): PricingType[] => {
        const currentOptions = getAvailablePrintOptions() as PrintOption[];
        const pricingTypes = currentOptions
            .filter(option => option.printType === selectedPrintType && option.pricingType)
            .map(option => option.pricingType!);

        return Array.from(new Set(pricingTypes));
    };

    // Calculate price whenever any selection changes
    useEffect(() => {
        calculatePrice();
    }, [
        selectedMapSize,
        selectedPrintType,
        selectedPricingType,
        selectedLamination,
        quantity
    ]);

    const calculatePrice = () => {
        const breakdown: Array<{ label: string; value: number }> = [];
        let total = 0;

        if (!selectedMapData) return;

        // 1. Calculate map printing price
        const printOption = (selectedMapData.options as PrintOption[]).find(option =>
            option.printType === selectedPrintType &&
            (option.pricingType === selectedPricingType || !option.pricingType)
        );

        if (printOption) {
            const printPrice = printOption.price * quantity;
            const sizeLabel = selectedMapData.paperSize;
            const printTypeLabel = selectedPrintType;
            const pricingTypeLabel = printOption.pricingType ? ` (${printOption.pricingType})` : '';

            breakdown.push({
                label: `${sizeLabel} Map ${printTypeLabel} Printing${pricingTypeLabel} (${quantity} sheets)`,
                value: printPrice
            });
            total += printPrice;
        }

        // 2. Calculate lamination price if selected
        if (selectedLamination && selectedMapData.lamination) {
            const laminationPrice = selectedMapData.lamination.price * quantity;
            breakdown.push({
                label: `${selectedMapData.lamination.type} Lamination (${quantity} sheets)`,
                value: laminationPrice
            });
            total += laminationPrice;
        }

        setPriceBreakdown(breakdown);
        setTotalPrice(Number(total.toFixed(2)));
    };

    // Get map size options
    const getMapSizeOptions = () => {
        return MAP_PRODUCTS.map(map => ({
            id: map.paperSize.toLowerCase(),
            label: map.paperSize,
            value: map.paperSize,
            description: `${map.paperType} paper`
        }));
    };

    // Get print type options
    const getPrintTypeOptions = () => {
        const currentOptions = getAvailablePrintOptions();
        const printTypes = Array.from(new Set(currentOptions.map(option => option.printType)));

        return printTypes.map(type => ({
            id: type.toLowerCase(),
            label: type,
            value: type,
            description: type === 'B/W' ? 'Black & White' : 'Full Color'
        }));
    };

    // Get pricing type options
    const getPricingTypeOptions = () => {
        const pricingTypes = getAvailablePricingTypes();
        if (pricingTypes.length === 0) return [];

        return pricingTypes.map(type => ({
            id: type.toLowerCase().replace(/ /g, '-'),
            label: type,
            value: type,
            description: type === 'Per Meter' ? 'Price per meter' : 'Standard sheet price'
        }));
    };

    const productData: Partial<ProductData> = {
        category: 'map-printing',
        title: 'Professional Map Printing Service',
        description: 'Print high-quality maps for navigation, education, decoration, and professional use with various size options and finishing.',
        basePrice: 45, // A2 B/W starting price
        features: [
            'Perfect for navigation maps, educational charts, and decor',
            'Large format printing up to A0+ size',
            '80 Gsm durable map paper',
            'Black & white or full color printing',
            'Optional 50 Micron lamination for protection',
            'Water-resistant options available',
            'Custom map design services',
            'Bulk printing discounts',
            'Fast turnaround for large formats',
            'Rolled or flat delivery options',
        ],
    };

    const breadcrumbItems = [
        { label: 'Home', href: '/' },
        { label: 'Printing Services', href: '/printing' },
        { label: 'Map Printing', href: '/map-printing', isActive: true },
    ];

    // Helper function to find product by configuration
    const findMapProduct = async () => {
        try {
            // Construct product name based on seed format
            // Format: "Map A2 B/W" or "Map A2 Color"
            const productName = `Map ${selectedMapSize} ${selectedPrintType}`;
            
            // Search in map category
            const response = await getProducts({
                search: productName,
                category: 'map',
                limit: 1
            });

            if (response.success && response.data && response.data.products.length > 0) {
                return response.data.products[0];
            }
            
            return null;
        } catch (error) {
            console.error('Error finding product:', error);
            return null;
        }
    };

    const handleAddToCart = async () => {
        if (!uploadedFile) {
            alert('Please upload a file first');
            return;
        }

        try {
            setAddToCartLoading(true);

            // Find the product
            const product = await findMapProduct();
            
            if (!product) {
                alert('Product not found. Please try a different configuration.');
                return;
            }

            const customDesignUrl = uploadedFile.name;

            // Add to cart
            const response = await addToCart({
                productId: product.id,
                quantity: quantity,
                customDesignUrl: customDesignUrl
            });

            if (response.success) {
                alert('✅ Added to cart successfully!');
                // Trigger a page refresh to update cart count
                window.location.reload();
            } else {
                alert(`❌ Failed to add to cart: ${response.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert('❌ Failed to add to cart. Please try again.');
        } finally {
            setAddToCartLoading(false);
        }
    };

    const handleBuyNow = async () => {
        if (!uploadedFile) {
            alert('Please upload a file first');
            return;
        }

        try {
            setBuyNowLoading(true);

            // Find the product
            const product = await findMapProduct();
            
            if (!product) {
                alert('Product not found. Please try a different configuration.');
                return;
            }

            const customDesignUrl = uploadedFile.name;

            // Add to cart
            const response = await addToCart({
                productId: product.id,
                quantity: quantity,
                customDesignUrl: customDesignUrl
            });

            if (response.success) {
                // Redirect to checkout
                router.push('/checkout');
            } else {
                alert(`❌ Failed to process: ${response.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Error processing buy now:', error);
            alert('❌ Failed to process. Please try again.');
        } finally {
            setBuyNowLoading(false);
        }
    };

    // Reset pricing type when map size or print type changes
    useEffect(() => {
        const pricingTypes = getAvailablePricingTypes();
        if (pricingTypes.length > 0 && !pricingTypes.includes(selectedPricingType)) {
            setSelectedPricingType(pricingTypes[0]!);
        }
    }, [selectedMapSize, selectedPrintType]);

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
                {/* Map Size Selection */}
                <OptionSelector
                    title="Map Size"
                    options={getMapSizeOptions()}
                    selectedValue={selectedMapSize}
                    onSelect={(value) => setSelectedMapSize(value as MapSize)}
                    layout="grid"
                    columns={4}
                    showPrice={false}
                />

                {/* Paper Type Info (Fixed for map printing) */}
                <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700 font-hkgb">
                        Paper Type
                    </label>
                    <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                        <div className="font-medium text-gray-900">80 Gsm Durable Map Paper</div>
                        <div className="text-sm text-gray-600 mt-1">
                            Special paper designed for maps - durable, tear-resistant, suitable for lamination
                        </div>
                    </div>
                </div>

                {/* Print Type Selection */}
                <OptionSelector
                    title="Print Type"
                    options={getPrintTypeOptions()}
                    selectedValue={selectedPrintType}
                    onSelect={(value) => setSelectedPrintType(value as PrintType)}
                    layout="inline"
                />

                {/* Pricing Type Selection (only for A1 and A0) */}
                {getAvailablePricingTypes().length > 0 && (
                    <OptionSelector
                        title="Pricing Option"
                        options={getPricingTypeOptions()}
                        selectedValue={selectedPricingType}
                        onSelect={(value) => setSelectedPricingType(value as PricingType)}
                        layout="inline"
                        showPrice={false}
                    />
                )}

                {/* Lamination Selection */}
                <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700 mb-3 font-hkgb">
                        Lamination
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => setSelectedLamination(false)}
                            className={`
                                p-4 rounded-xl border text-center transition-all duration-200
                                ${!selectedLamination
                                    ? 'border-[#008ECC] bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }
                            `}
                        >
                            <div className="font-medium text-gray-900 text-base mb-2">
                                No Lamination
                            </div>
                            <div className="text-sm text-gray-600">
                                Print only
                            </div>
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectedLamination(true)}
                            className={`
                                p-4 rounded-xl border text-center transition-all duration-200
                                ${selectedLamination
                                    ? 'border-[#008ECC] bg-blue-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }
                            `}
                        >
                            <div className="font-medium text-gray-900 text-base mb-2">
                                50 Micron Lamination
                            </div>
                            <div className="text-sm text-gray-600">
                                ₹{selectedMapData?.lamination.price || 0} per sheet
                            </div>
                        </button>
                    </div>
                </div>

                {/* Quantity Selection */}
                <QuantitySelector
                    value={quantity}
                    onChange={setQuantity}
                    label="Quantity (Sheets)"
                    unit="sheets"
                    min={1}
                    max={100}
                />

                {/* Map Size Information */}
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl">
                    <h4 className="font-hkgb text-gray-900 mb-3">Map Size Reference</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {MAP_PRODUCTS.map(map => (
                            <div
                                key={map.paperSize}
                                className={`p-3 rounded-lg border ${selectedMapSize === map.paperSize ? 'border-[#008ECC] bg-blue-50' : 'border-gray-200'}`}
                            >
                                <div className="font-medium text-gray-900">{map.paperSize}</div>
                                <div className="text-sm text-gray-600">
                                    {map.paperSize === 'A2' && '420 × 594 mm'}
                                    {map.paperSize === 'A1' && '594 × 841 mm'}
                                    {map.paperSize === 'A0' && '841 × 1189 mm'}
                                    {map.paperSize === 'A0+' && '914 × 1292 mm'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Map Printing Tips */}
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
                    <h4 className="font-hkgb text-blue-900 mb-2">Map Printing Recommendations</h4>
                    <ul className="text-blue-800 text-sm space-y-1">
                        <li>• Upload vector files (PDF, EPS, AI) for best quality</li>
                        <li>• Minimum 150 DPI for large format printing</li>
                        <li>• Include 5mm bleed area for edge-to-edge printing</li>
                        <li>• Lamination recommended for maps used outdoors or frequently handled</li>
                        <li>• Contact us for custom map design services</li>
                        <li>• Allow extra time for large format printing and drying</li>
                    </ul>
                </div>
            </div>
        </ProductPageTemplate>
    );
}
