import React from 'react';
import { cn } from '@/lib/utils';
import { Check, Shield, Clock, Package } from 'lucide-react';

interface ProductFeaturesProps {
    features: string[];
    guarantees?: Array<{
        icon: React.ReactNode;
        title: string;
        description: string;
    }>;
    className?: string;
}

export const ProductFeatures: React.FC<ProductFeaturesProps> = ({
    features,
    guarantees,
    className,
}) => {
    const defaultGuarantees = [
        {
            icon: <Shield className="w-5 h-5 text-green-600" />,
            title: 'Secure & Confidential',
            description: 'Your files are protected',
        },
        {
            icon: <Clock className="w-5 h-5 text-green-600" />,
            title: 'Fast Delivery',
            description: 'Same day available',
        },
        {
            icon: <Package className="w-5 h-5 text-green-600" />,
            title: 'Quality Guarantee',
            description: 'Premium results',
        },
        {
            icon: <Check className="w-5 h-5 text-green-600" />,
            title: 'Free Proof',
            description: 'Before final print',
        },
    ];

    const displayGuarantees = guarantees || defaultGuarantees;

    return (
        <div className={cn('space-y-6', className)}>
            {features.length > 0 && (
                <div>
                    <h3 className="font-hkgb text-lg sm:text-xl text-gray-900 mb-4">
                        Features
                    </h3>
                    <ul className="space-y-3">
                        {features.map((feature, index) => (
                            <li key={index} className="flex items-start">
                                <Check className="w-5 h-5 text-[#008ECC] mr-3 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-600 text-sm sm:text-base">{feature}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div>
                <h3 className="font-hkgb text-lg sm:text-xl text-gray-900 mb-4">
                    Service Guarantee
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {displayGuarantees.map((guarantee, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200">
                            {guarantee.icon}
                            <div>
                                <div className="font-medium text-gray-900 text-sm sm:text-base">
                                    {guarantee.title}
                                </div>
                                <div className="text-gray-500 text-xs sm:text-sm">
                                    {guarantee.description}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
