'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ProductPageTemplate } from '@/app/components/services/ProductPageTemplate';
import { OptionSelector } from '@/app/components/services/print/OptionSelector';
import { QuantitySelector } from '@/app/components/services/QuantitySelector';
import { A4_PRINTOUTS, A3_PRINTOUTS, BINDING_PRODUCTS, LAMINATION_PRODUCTS } from '@/constant/services/pdf-printing'
import { ProductData } from '@/types';
import { addToCart } from '@/lib/api/cart';
import { getProducts } from '@/lib/api/products';

type PaperSize = 'A4' | 'A3';
type A4PaperType = '65 Gsm' | '70 Gsm' | '75 Gsm' | '100 Gsm' | '100 Gsm BOND';
type A3PaperType = '70 Gsm' | '75 Gsm' | '100 Gsm' | '130 Gsm';
type BindingType = 'Spiral Binding' | 'Wiro Binding' | 'Glue Binding' | 'Hard Binding';
type LaminationType = 'Thin 50 Micron' | 'Thick 125 Micron';
type ColorType = 'bw' | 'color';
type SideType = 'single' | 'both';
type BindingPages = 'Upto 50 Pages' | 'Upto 100 Pages' | 'Upto 150 Pages' | 'Upto 200 Pages' | 'Upto 250 Pages' | 'Upto 300 Pages';
type HardBindingTypes = 'Standard' | 'With Golden Print (Black Cover)' | 'With Silver Print (Red Cover)'

const BINDING_PAGES_OPTIONS: BindingPages[] = [
    'Upto 50 Pages',
    'Upto 100 Pages',
    'Upto 150 Pages',
    'Upto 200 Pages',
    'Upto 250 Pages',
    'Upto 300 Pages'
];

export default function PDFPrintingPage() {
    const router = useRouter();
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [selectedPaperSize, setSelectedPaperSize] = useState<PaperSize>('A4');
    const [selectedBindingType, setSelectedBindingType] = useState<BindingType>('Spiral Binding');
    const [selectedPaperType, setSelectedPaperType] = useState<A4PaperType | A3PaperType>('70 Gsm');
    const [selectedColor, setSelectedColor] = useState<ColorType>('bw');
    const [selectedSide, setSelectedSide] = useState<SideType>('single');
    const [selectedBindingPages, setSelectedBindingPages] = useState<BindingPages>('Upto 50 Pages');
    const [selectedLamination, setSelectedLamination] = useState<LaminationType>('Thin 50 Micron');
    const [selectedHardBindingType, setSelectedHardBindingType] = useState<HardBindingTypes>('Standard');
    const [quantity, setQuantity] = useState<number>(1);
    const [priceBreakdown, setPriceBreakdown] = useState<Array<{ label: string; value: number }>>([]);
    const [totalPrice, setTotalPrice] = useState<number>(0);
    const [addToCartLoading, setAddToCartLoading] = useState(false);
    const [buyNowLoading, setBuyNowLoading] = useState(false);

    // Get current paper options based on selected size
    const currentPaperOptions = selectedPaperSize === 'A4' ? A4_PRINTOUTS : A3_PRINTOUTS;

    // Get current lamination options based on selected size
    const currentLaminationOptions = LAMINATION_PRODUCTS.find(l => l.size === selectedPaperSize)?.options || [];

    // Calculate price whenever any selection changes
    useEffect(() => {
        calculatePrice();
    }, [
        selectedPaperSize,
        selectedBindingType,
        selectedPaperType,
        selectedColor,
        selectedSide,
        selectedBindingPages,
        selectedLamination,
        selectedHardBindingType,
        quantity
    ]);

    const calculatePrice = () => {
        const breakdown: Array<{ label: string; value: number }> = [];
        let total = 0;

        // 1. Calculate printing price with separate breakdowns
        const selectedPaper = currentPaperOptions.find(p => p.paperType === selectedPaperType);
        if (selectedPaper) {
            // Determine which price to use based on color and side
            let priceKey: 'bwSingle' | 'bwBoth' | 'colorSingle' | 'colorBoth';

            if (selectedColor === 'bw') {
                priceKey = selectedSide === 'single' ? 'bwSingle' : 'bwBoth';
            } else {
                priceKey = selectedSide === 'single' ? 'colorSingle' : 'colorBoth';
            }

            const printPrice = selectedPaper.prices[priceKey] * quantity;

            breakdown.push({
                label: `${selectedPaperSize} ${selectedPaperType} ${selectedSide} ${selectedColor} (${quantity} pages)`,
                value: printPrice
            });
            total += printPrice;
        }

        // 2. Calculate binding price only if selected
        if (selectedBindingType) {
            let bindingPrice = 0;
            let bindingLabel = ""

            if (selectedBindingType === 'Hard Binding') {
                const hardBinding = BINDING_PRODUCTS.find(b => b.type === 'Hard Binding');
                const priceObj = hardBinding?.prices.find(p =>
                    'type' in p && p.type === selectedHardBindingType
                );

                if (priceObj) {
                    bindingPrice = priceObj.price;
                    bindingLabel = `Hard Binding (${selectedHardBindingType})`;
                }
            } else {
                const binding = BINDING_PRODUCTS.find(b => b.type === selectedBindingType);
                const priceObj = binding?.prices.find(p =>
                    'pages' in p && p.pages === selectedBindingPages
                );

                if (priceObj) {
                    bindingPrice = priceObj.price;
                    bindingLabel = `${selectedBindingType} (${selectedBindingPages})`;
                }
            }

            if (bindingPrice > 0) {
                breakdown.push({
                    label: bindingLabel,
                    value: bindingPrice
                });
                total += bindingPrice;
            }
        }

        // 3. Calculate lamination price only if selected
        if (selectedLamination) {
            const lamination = currentLaminationOptions.find(l => l.type === selectedLamination);
            if (lamination) {
                const laminationPrice = lamination.price * quantity;
                breakdown.push({
                    label: `${selectedLamination} Lamination (${quantity} sheets)`,
                    value: laminationPrice
                });
                total += laminationPrice;
            }
        }

        // Filter out items with 0 value (optional, can remove if you want to show all)
        const filteredBreakdown = breakdown.filter(item => item.value > 0);

        setPriceBreakdown(filteredBreakdown);
        setTotalPrice(Number(total.toFixed(2)));
    };

    // Get paper options based on selected size
    const getPaperOptions = () => {
        const papers = selectedPaperSize === 'A4' ? A4_PRINTOUTS : A3_PRINTOUTS;
        return papers.map(paper => ({
            id: paper.paperType.toLowerCase().replace(/ /g, '-'),
            label: paper.paperType,
            value: paper.paperType,
            description: selectedColor === 'bw'
                ? `From ₹${(paper.prices[selectedSide === 'single' ? 'bwSingle' : 'bwBoth']).toFixed(2)}`
                : `From ₹${(paper.prices[selectedSide === 'single' ? 'colorSingle' : 'colorBoth']).toFixed(2)}`
        }));
    };

    const productData: Partial<ProductData> = {
        category: 'pdf-printing',
        title: 'Professional PDF Printing Service',
        description: 'Get high-quality PDF printing with various paper options, binding types, and finishing services.',
        basePrice: 0.84,
        features: [
            'Print from PDF, Word, PowerPoint files',
            'Choose from A4 and A3 paper sizes',
            'Multiple paper weight options available',
            'Black & white or color printing',
            'Single or double-sided printing',
            'Various binding and lamination options',
            'Secure file handling',
            'Fast turnaround time',
            'Custom Printing',
            'Custom Printing',
            'Custom Printing',
            'Custom Printing',
        ],
    };

    const breadcrumbItems = [
        { label: 'Home', href: '/' },
        { label: 'Printing Services', href: '/printing' },
        { label: 'PDF Printing', href: '/pdf-printing', isActive: true },
    ];

    // Helper function to find product by configuration
    const findPrintoutProduct = async () => {
        try {
            // Construct product name based on configuration
            // Format from seed: "A4 70 Gsm B/W Single Side" or "A4 70 Gsm Color Both Sides"
            const colorText = selectedColor === 'bw' ? 'B/W' : 'Color';
            const sideText = selectedSide === 'single' ? 'Single Side' : 'Both Sides';
            const productName = `${selectedPaperSize} ${selectedPaperType} ${colorText} ${sideText}`;
            
            console.log('🔎 Searching for printout product:', productName);
            
            // Search in printout category
            const response = await getProducts({
                search: productName,
                category: 'printout',
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
        console.log('🛒 handleAddToCart called');
        
        if (!uploadedFile) {
            alert('Please upload a file first');
            return;
        }

        try {
            setAddToCartLoading(true);

            // Find the product based on selection
            console.log('🔍 Searching for product...');
            const product = await findPrintoutProduct();
            console.log('📦 Product found:', product);
            
            if (!product) {
                alert('Product not found. Please try a different configuration.');
                return;
            }

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
        console.log('💳 handleBuyNow called');
        
        if (!uploadedFile) {
            alert('Please upload a file first');
            return;
        }

        try {
            setBuyNowLoading(true);

            // Find the product based on selection
            console.log('🔍 Searching for product...');
            const product = await findPrintoutProduct();
            console.log('📦 Product found:', product);
            
            if (!product) {
                alert('Product not found. Please try a different configuration.');
                return;
            }

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

    // Features component to show above price breakdown

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
                {/* Paper Size Selection */}
                <OptionSelector
                    title="Paper Size"
                    options={[
                        { id: 'a4', label: 'A4', value: 'A4' },
                        { id: 'a3', label: 'A3', value: 'A3' },
                    ]}
                    selectedValue={selectedPaperSize}
                    onSelect={(value) => {
                        setSelectedPaperSize(value as PaperSize);
                        // Reset paper type when size changes
                        setSelectedPaperType(value === 'A4' ? '70 Gsm' : '70 Gsm');
                    }}
                    layout="inline"
                />

                {/* Paper Type Selection */}
                <OptionSelector
                    title="Paper Type & Weight"
                    options={getPaperOptions()}
                    selectedValue={selectedPaperType}
                    onSelect={(value) => setSelectedPaperType(value as A4PaperType | A3PaperType)}
                    layout="grid"
                    columns={selectedPaperSize === 'A4' ? 5 : 4}
                    showPrice={false}
                />

                {/* Color Selection */}
                <OptionSelector
                    title="Print Color"
                    options={[
                        { id: 'bw', label: 'Black & White', value: 'bw' },
                        { id: 'color', label: 'Color', value: 'color' },
                    ]}
                    selectedValue={selectedColor}
                    onSelect={(value) => setSelectedColor(value as ColorType)}
                    layout="inline"
                />

                {/* Side Selection */}
                <OptionSelector
                    title="Print Sides"
                    options={[
                        { id: 'single', label: 'Single Side', value: 'single' },
                        { id: 'both', label: 'Both Sides', value: 'both' },
                    ]}
                    selectedValue={selectedSide}
                    onSelect={(value) => setSelectedSide(value as SideType)}
                    layout="inline"
                />

                {/* Binding Type Selection */}
                <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700 mb-3 font-hkgb">
                        Binding Options
                    </label>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {BINDING_PRODUCTS.map((binding) => (
                            <button
                                key={binding.type}
                                type="button"
                                onClick={() => setSelectedBindingType(binding.type as BindingType)}
                                className={`
                                    p-3 sm:p-4 rounded-xl border text-center transition-all duration-200
                                    ${selectedBindingType === binding.type
                                        ? 'border-[#008ECC] bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }
                                `}
                            >
                                <div className="font-medium text-gray-900 text-sm sm:text-base mb-1">
                                    {binding.type}
                                </div>
                                <div className="text-xs sm:text-sm text-gray-600">
                                    From ₹{binding.prices[0]?.price.toFixed(2)}
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Binding Pages Selection (for non-Hard Binding) */}
                    {selectedBindingType !== 'Hard Binding' && (
                        <div className="mt-4">
                            <OptionSelector
                                title="Number of Pages for Binding"
                                options={BINDING_PAGES_OPTIONS.map(pages => {
                                    const binding = BINDING_PRODUCTS.find(b => b.type === selectedBindingType);
                                    const priceObj = binding?.prices.find(p => 'pages' in p && p.pages === pages);
                                    return {
                                        id: pages.toLowerCase().replace(/ /g, '-'),
                                        label: pages,
                                        value: pages,
                                        price: priceObj?.price || 0
                                    };
                                })}
                                selectedValue={selectedBindingPages}
                                onSelect={(value) => setSelectedBindingPages(value as BindingPages)}
                                layout="grid"
                                columns={3}
                                showPrice={true}
                            />
                        </div>
                    )}

                    {/* Hard Binding Type Selection */}
                    {selectedBindingType === 'Hard Binding' && (
                        <div className="mt-4">
                            <OptionSelector
                                title="Hard Binding Type"
                                options={(() => {
                                    const hardBinding = BINDING_PRODUCTS?.find(b => b.type === 'Hard Binding');
                                    return hardBinding?.prices.map(price => {
                                        if ('type' in price) {
                                            return {
                                                id: price.type.toLowerCase().replace(/ /g, '-'),
                                                label: price.type,
                                                value: price.type,
                                                price: price.price
                                            };
                                        }
                                        return {
                                            id: 'standard',
                                            label: 'Standard',
                                            value: 'Standard',
                                            price: price.price
                                        };
                                    }) || [];
                                })()}
                                selectedValue={selectedHardBindingType}
                                onSelect={(value) => setSelectedHardBindingType(value as HardBindingTypes)}
                                layout="grid"
                                columns={3}
                                showPrice={true}
                            />
                        </div>
                    )}
                </div>

                {/* Lamination Selection */}
                <OptionSelector
                    title="Lamination"
                    options={currentLaminationOptions.map(lamination => ({
                        id: lamination.type.toLowerCase().replace(/ /g, '-'),
                        label: lamination.type,
                        value: lamination.type,
                        price: lamination.price,
                        description: `per ${selectedPaperSize} sheet`
                    }))}
                    selectedValue={selectedLamination}
                    onSelect={(value) => setSelectedLamination(value as LaminationType)}
                    layout="grid"
                    columns={2}
                    showPrice={true}
                />

                {/* Quantity Selection */}
                <QuantitySelector
                    value={quantity}
                    onChange={setQuantity}
                    label="Quantity (Pages)"
                    unit="pages"
                    min={1}
                    max={1000}
                />
            </div>
        </ProductPageTemplate>
    );
}
