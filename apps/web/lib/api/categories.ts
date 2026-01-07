import { get, post } from '../api-client';

export interface CategorySpecificationOption {
    id: string;
    label: string;
    value: string;
    displayOrder: number;
    isActive: boolean;
    metadata?: any;
}

export interface CategorySpecification {
    id: string;
    categoryId: string;
    name: string;
    slug: string;
    type: 'SELECT' | 'MULTI_SELECT' | 'TEXT' | 'NUMBER' | 'BOOLEAN';
    isRequired: boolean;
    displayOrder: number;
    dependsOn?: any;
    options: CategorySpecificationOption[];
}

export interface CategoryPricingRule {
    id: string;
    categoryId: string;
    ruleType: 'BASE_PRICE' | 'SPECIFICATION_COMBINATION' | 'QUANTITY_TIER' | 'ADDON';
    specificationValues: Record<string, any>;
    basePrice?: number;
    priceModifier?: number;
    quantityMultiplier: boolean;
    minQuantity?: number;
    maxQuantity?: number;
    isActive: boolean;
    priority: number;
}

export interface CategoryConfiguration {
    id: string;
    categoryId: string;
    pageTitle?: string;
    pageDescription?: string;
    features?: string[];
    breadcrumbConfig?: any;
    layoutConfig?: any;
    fileUploadRequired: boolean;
    fileUploadConfig?: any;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
    description?: string;
    image?: string;
    isActive: boolean;
    specifications: CategorySpecification[];
    pricingRules: CategoryPricingRule[];
    configuration?: CategoryConfiguration;
}

export interface PriceCalculationRequest {
    specifications: Record<string, any>;
    quantity: number;
}

export interface PriceCalculationResponse {
    totalPrice: number;
    breakdown: Array<{ label: string; value: number }>;
    quantity: number;
}

/**
 * Get category by slug with all specifications, options, pricing rules, and configuration
 */
export async function getCategoryBySlug(slug: string): Promise<Category> {
    const response = await get<Category>(`/categories/${slug}`);
    if (!response.data) {
        throw new Error('Category not found');
    }
    return response.data;
}

/**
 * Calculate price for a category based on specification selections
 */
export async function calculateCategoryPrice(
    slug: string,
    request: PriceCalculationRequest
): Promise<PriceCalculationResponse> {
    const response = await post<PriceCalculationResponse>(
        `/categories/${slug}/calculate-price`,
        request
    );
    if (!response.data) {
        throw new Error('Price calculation failed');
    }
    return response.data;
}

