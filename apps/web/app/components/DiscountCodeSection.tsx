"use client";

import { useState } from "react";
import { X, Check, AlertCircle } from "lucide-react";

interface DiscountCodeSectionProps {
    couponCode: string;
    setCouponCode: (code: string) => void;
    onApply: () => Promise<boolean>;
    isApplying: boolean;
    error: string | null;
    appliedCoupon: {
        coupon: {
            code: string;
            name: string;
        };
        discountAmount: number;
    } | null;
    onRemove: () => void;
}

export default function DiscountCodeSection({
    couponCode,
    setCouponCode,
    onApply,
    isApplying,
    error,
    appliedCoupon,
    onRemove,
}: DiscountCodeSectionProps) {
    const [localCode, setLocalCode] = useState(couponCode);

    const handleApply = async () => {
        const success = await onApply();
        if (success) {
            setLocalCode("");
        }
    };

    return (
        <div className="space-y-3">
            {appliedCoupon ? (
                <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2">
                        <Check size={18} className="text-green-600" />
                        <div>
                            <p className="text-sm font-medium text-green-900">
                                {appliedCoupon.coupon.code} - {appliedCoupon.coupon.name}
                            </p>
                            <p className="text-xs text-green-700">
                                Discount: ₹{appliedCoupon.discountAmount.toFixed(2)}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onRemove}
                        className="p-1 text-green-600 hover:text-green-700 transition-colors cursor-pointer"
                        aria-label="Remove coupon"
                    >
                        <X size={18} />
                    </button>
                </div>
            ) : (
                <>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={localCode}
                            onChange={(e) => {
                                setLocalCode(e.target.value);
                                setCouponCode(e.target.value);
                            }}
                            placeholder="Enter discount code"
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            disabled={isApplying}
                        />
                        <button
                            onClick={handleApply}
                            disabled={isApplying || !localCode.trim()}
                            className="px-6 py-2 bg-[#008ECC] text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                        >
                            {isApplying ? "Applying..." : "Apply"}
                        </button>
                    </div>
                    {error && (
                        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

