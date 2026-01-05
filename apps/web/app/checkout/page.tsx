"use client";

import { useState, useMemo } from "react";
import Breadcrumbs from "../components/Breadcrumbs";
import BillingAddressForm from "../components/BillingAddressForm";
import ShippingMethod from "../components/ShippingMethod";
import PaymentMethod from "../components/PaymentMethod";
import CollapsibleSection from "../components/CollapsibleSection";
import BillingSummary from "../components/BillingSummary";
import OrderReview from "../components/OrderReview";
import DiscountCodeSection from "../components/DiscountCodeSection";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useCheckout } from "@/hooks/checkout/useCheckout";
import { BarsSpinner } from "@/app/components/shared/BarsSpinner";

function CheckoutPageContent() {
    const {
        cartItems,
        mrp,
        subtotal,
        deliveryFee,
        itemCount,
        selectedAddressId,
        setSelectedAddressId,
        addressError,
        appliedCoupon,
        couponCode,
        setCouponCode,
        discountAmount,
        isApplyingCoupon,
        couponError,
        applyCoupon,
        removeCoupon,
        tax,
        grandTotal,
        loading,
        error,
    } = useCheckout();

    // Track selected shipping method
    const [selectedShippingId, setSelectedShippingId] = useState<string>("standard");

    const shippingOptions = [
        {
            id: "standard",
            name: "Standard Delivery",
            price: deliveryFee || 0,
            description: "5 - 7 business days",
            icon: (
                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" className="text-blue-600">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                </svg>
            ),
        },
        {
            id: "express",
            name: "Express Delivery",
            price: (deliveryFee || 0) + 50,
            description: "2 - 3 business days",
            icon: (
                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor" className="text-blue-600">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                    <line x1="12" y1="22.08" x2="12" y2="12"></line>
                </svg>
            ),
        },
    ];

    // Calculate selected shipping fee
    const selectedShippingFee = useMemo(() => {
        const selectedOption = shippingOptions.find(option => option.id === selectedShippingId);
        return selectedOption?.price || deliveryFee;
    }, [selectedShippingId, shippingOptions, deliveryFee]);

    // Recalculate tax and total with selected shipping
    const calculatedTax = useMemo(() => {
        const taxableAmount = (subtotal || 0) - discountAmount;
        return taxableAmount * 0.18;
    }, [subtotal, discountAmount]);

    const calculatedTotal = useMemo(() => {
        return (subtotal || 0) - discountAmount + selectedShippingFee + calculatedTax;
    }, [subtotal, discountAmount, selectedShippingFee, calculatedTax]);

    const breadcrumbs = [
        { label: "Home", href: "/" },
        { label: "Cart", href: "/cart" },
        { label: "Checkout", href: "/checkout" },
    ];

    if (loading) {
        return (
            <div className="min-h-screen py-8 flex items-center justify-center">
                <BarsSpinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen py-8">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                        <p className="text-red-600">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen py-8">
                <div className="max-w-7xl mx-auto px-6">
                    <Breadcrumbs items={breadcrumbs} />
                    <div className="bg-white rounded-lg shadow-md p-12 text-center">
                        <p className="text-gray-600 text-lg mb-4">Your cart is empty</p>
                        <a
                            href="/products"
                            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer"
                        >
                            Continue Shopping
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="py-8 mb-10 lg:mb-40">
            <div className="max-w-7xl mx-auto px-6">
                {/* Breadcrumbs */}
                <Breadcrumbs items={breadcrumbs} />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Forms */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Billing Address */}
                        <BillingAddressForm
                            selectedAddressId={selectedAddressId}
                            onAddressSelect={setSelectedAddressId}
                        />

                        {addressError && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                <p className="text-red-600 text-sm">{addressError}</p>
                            </div>
                        )}

                        {/* Shipping Method */}
                        <ShippingMethod
                            options={shippingOptions}
                            selectedId={selectedShippingId}
                            onSelect={setSelectedShippingId}
                        />

                        {/* Payment Method */}
                        <PaymentMethod />
                    </div>

                    {/* Right Column - Order Summary */}
                    <div className="lg:col-span-1">
                        {/* Order Review - Collapsible */}
                        <CollapsibleSection
                            title="Order Review"
                            subtitle={`${itemCount} item${itemCount !== 1 ? "s" : ""} in cart`}
                            defaultExpanded={false}
                        >
                            <OrderReview items={cartItems} />
                        </CollapsibleSection>

                        {/* Discount Codes - Collapsible */}
                        <CollapsibleSection title="Discount Codes" defaultExpanded={false}>
                            <DiscountCodeSection
                                couponCode={couponCode}
                                setCouponCode={setCouponCode}
                                onApply={applyCoupon}
                                isApplying={isApplyingCoupon}
                                error={couponError}
                                appliedCoupon={appliedCoupon}
                                onRemove={removeCoupon}
                            />
                        </CollapsibleSection>

                        {/* Billing Summary - Expanded */}
                        <BillingSummary
                            mrp={mrp || 0}
                            subtotal={subtotal || 0}
                            discount={discountAmount || 0}
                            couponApplied={appliedCoupon ? discountAmount : 0}
                            shipping={selectedShippingFee || 0}
                            tax={calculatedTax || 0}
                            grandTotal={calculatedTotal || 0}
                            itemCount={itemCount}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <ProtectedRoute>
            <CheckoutPageContent />
        </ProtectedRoute>
    );
}
