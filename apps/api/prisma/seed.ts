import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, DiscountType, CouponApplicableTo } from "../generated/prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/**
 * Comprehensive Seed Script for E-Commerce Database
 * 
 * This script can be run multiple times safely (idempotent)
 * Run with: bun run db:seed
 */

async function main() {
    console.log("\n🌱 Starting database seeding...\n");

    // ============================================
    // 1. BRANDS
    // ============================================
    console.log("📦 Creating Brands...");
    const brandsData = [
        {
            name: "PrintHub",
            slug: "printhub",
            description: "Premium quality custom printing",
            website: "https://printhub.example.com",
            logo: "https://via.placeholder.com/150x150?text=PrintHub",
        },
        {
            name: "CustomWear",
            slug: "customwear",
            description: "Your style, your design",
            website: "https://customwear.example.com",
            logo: "https://via.placeholder.com/150x150?text=CustomWear",
        },
        {
            name: "ArtPrints",
            slug: "artprints",
            description: "Artistic designs and prints",
            website: "https://artprints.example.com",
            logo: "https://via.placeholder.com/150x150?text=ArtPrints",
        },
    ];

    const brands: Record<string, any> = {};
    for (const brandData of brandsData) {
        const brand = await prisma.brand.upsert({
            where: { slug: brandData.slug },
            update: brandData,
            create: brandData,
        });
        brands[brand.slug] = brand;
        console.log(`  ✅ ${brand.name}`);
    }

    // ============================================
    // 2. CATEGORIES
    // ============================================
    console.log("\n📂 Creating Categories...");
    const categoriesData = [
        {
            name: "Apparel",
            slug: "apparel",
            description: "Custom printed clothing and accessories",
            image: "https://via.placeholder.com/400x300?text=Apparel",
        },
        {
            name: "Home & Living",
            slug: "home-living",
            description: "Custom printed items for your home",
            image: "https://via.placeholder.com/400x300?text=Home+Living",
        },
        {
            name: "Stationery",
            slug: "stationery",
            description: "Custom printed stationery items",
            image: "https://via.placeholder.com/400x300?text=Stationery",
        },
        {
            name: "Accessories",
            slug: "accessories",
            description: "Custom printed accessories",
            image: "https://via.placeholder.com/400x300?text=Accessories",
        },
    ];

    const categories: Record<string, any> = {};
    for (const catData of categoriesData) {
        const category = await prisma.category.upsert({
            where: { slug: catData.slug },
            update: catData,
            create: catData,
        });
        categories[category.slug] = category;
        console.log(`  ✅ ${category.name}`);
    }

    // Sub-categories
    const subCategoriesData = [
        {
            name: "T-Shirts",
            slug: "t-shirts",
            description: "Custom printed t-shirts",
            parentSlug: "apparel",
            image: "https://via.placeholder.com/400x300?text=T-Shirts",
        },
        {
            name: "Hoodies",
            slug: "hoodies",
            description: "Custom printed hoodies and sweatshirts",
            parentSlug: "apparel",
            image: "https://via.placeholder.com/400x300?text=Hoodies",
        },
        {
            name: "Mugs",
            slug: "mugs",
            description: "Custom printed coffee mugs",
            parentSlug: "home-living",
            image: "https://via.placeholder.com/400x300?text=Mugs",
        },
        {
            name: "Posters",
            slug: "posters",
            description: "Custom printed wall posters",
            parentSlug: "home-living",
            image: "https://via.placeholder.com/400x300?text=Posters",
        },
        {
            name: "Notebooks",
            slug: "notebooks",
            description: "Custom printed notebooks",
            parentSlug: "stationery",
            image: "https://via.placeholder.com/400x300?text=Notebooks",
        },
        {
            name: "Stickers",
            slug: "stickers",
            description: "Custom printed stickers",
            parentSlug: "stationery",
            image: "https://via.placeholder.com/400x300?text=Stickers",
        },
        {
            name: "Phone Cases",
            slug: "phone-cases",
            description: "Custom printed phone cases",
            parentSlug: "accessories",
            image: "https://via.placeholder.com/400x300?text=Phone+Cases",
        },
        {
            name: "Tote Bags",
            slug: "tote-bags",
            description: "Custom printed tote bags",
            parentSlug: "accessories",
            image: "https://via.placeholder.com/400x300?text=Tote+Bags",
        },
    ];

    for (const subCatData of subCategoriesData) {
        const { parentSlug, ...data } = subCatData;
        const subCategory = await prisma.category.upsert({
            where: { slug: data.slug },
            update: { ...data, parentId: categories[parentSlug].id },
            create: { ...data, parentId: categories[parentSlug].id },
        });
        categories[subCategory.slug] = subCategory;
        console.log(`  ✅ ${subCategory.name} (sub-category)`);
    }

    // ============================================
    // 3. PRODUCTS
    // ============================================
    console.log("\n🛍️  Creating Products...");

    const productsData = [
        // T-Shirts
        {
            name: "Premium Cotton T-Shirt",
            slug: "premium-cotton-tshirt",
            shortDescription: "100% cotton, customizable, comfortable fit",
            description: "High-quality 100% cotton t-shirt perfect for custom printing. Soft, breathable, and available in multiple sizes. Perfect for events, gifts, or personal branding.",
            basePrice: 599,
            sellingPrice: 499,
            mrp: 699,
            categorySlug: "t-shirts",
            brandSlug: "customwear",
            sku: "TSHIRT-001",
            stock: 500,
            weight: 0.2,
            dimensions: "Medium: 28x20 inches",
            isFeatured: true,
            isNewArrival: true,
            isBestSeller: true,
            returnPolicy: "15 days return policy. Item must be unused and in original packaging.",
            warranty: "Quality guarantee - Free replacement for printing defects",
            images: [
                { url: "https://via.placeholder.com/600x600?text=White+T-Shirt", alt: "White T-Shirt Front", isPrimary: true, displayOrder: 0 },
                { url: "https://via.placeholder.com/600x600?text=T-Shirt+Back", alt: "T-Shirt Back", isPrimary: false, displayOrder: 1 },
                { url: "https://via.placeholder.com/600x600?text=T-Shirt+Detail", alt: "T-Shirt Detail", isPrimary: false, displayOrder: 2 },
            ],
            specifications: [
                { key: "Material", value: "100% Cotton", displayOrder: 0 },
                { key: "GSM", value: "180 GSM", displayOrder: 1 },
                { key: "Fit", value: "Regular Fit", displayOrder: 2 },
                { key: "Sleeve Type", value: "Half Sleeve", displayOrder: 3 },
                { key: "Neck Type", value: "Round Neck", displayOrder: 4 },
                { key: "Print Type", value: "DTG (Direct to Garment)", displayOrder: 5 },
                { key: "Care Instructions", value: "Machine wash cold, tumble dry low", displayOrder: 6 },
            ],
            attributes: [
                { attributeType: "color", attributeValue: "white" },
                { attributeType: "material", attributeValue: "cotton" },
                { attributeType: "fit", attributeValue: "regular" },
            ],
            tags: ["trending", "bestseller", "customizable", "cotton"],
            variants: [
                { name: "S", sku: "TSHIRT-001-S", priceModifier: 0, stock: 100 },
                { name: "M", sku: "TSHIRT-001-M", priceModifier: 0, stock: 150 },
                { name: "L", sku: "TSHIRT-001-L", priceModifier: 50, stock: 150 },
                { name: "XL", sku: "TSHIRT-001-XL", priceModifier: 100, stock: 80 },
                { name: "XXL", sku: "TSHIRT-001-XXL", priceModifier: 150, stock: 20 },
            ],
        },
        {
            name: "Oversized T-Shirt",
            slug: "oversized-tshirt",
            shortDescription: "Trendy oversized fit, premium fabric",
            description: "Premium oversized t-shirt with a relaxed fit. Made from high-quality cotton blend for maximum comfort. Perfect for streetwear and casual styling.",
            basePrice: 799,
            sellingPrice: 699,
            mrp: 899,
            categorySlug: "t-shirts",
            brandSlug: "customwear",
            sku: "TSHIRT-002",
            stock: 300,
            weight: 0.25,
            dimensions: "Oversized fit",
            isFeatured: true,
            isNewArrival: true,
            images: [
                { url: "https://via.placeholder.com/600x600?text=Oversized+T-Shirt", alt: "Oversized T-Shirt", isPrimary: true, displayOrder: 0 },
                { url: "https://via.placeholder.com/600x600?text=Oversized+Back", alt: "Back View", isPrimary: false, displayOrder: 1 },
            ],
            specifications: [
                { key: "Material", value: "Cotton Blend", displayOrder: 0 },
                { key: "Fit", value: "Oversized", displayOrder: 1 },
                { key: "Sleeve Type", value: "Half Sleeve", displayOrder: 2 },
            ],
            attributes: [
                { attributeType: "fit", attributeValue: "oversized" },
            ],
            tags: ["oversized", "trending", "streetwear"],
            variants: [
                { name: "S", sku: "TSHIRT-002-S", priceModifier: 0, stock: 50 },
                { name: "M", sku: "TSHIRT-002-M", priceModifier: 0, stock: 100 },
                { name: "L", sku: "TSHIRT-002-L", priceModifier: 50, stock: 100 },
                { name: "XL", sku: "TSHIRT-002-XL", priceModifier: 100, stock: 50 },
            ],
        },
        // Hoodies
        {
            name: "Premium Hoodie",
            slug: "premium-hoodie",
            shortDescription: "Warm, comfortable, and customizable",
            description: "Premium quality hoodie with a soft fleece interior. Perfect for custom printing with vibrant colors. Includes adjustable hood and kangaroo pocket.",
            basePrice: 1299,
            sellingPrice: 1099,
            mrp: 1499,
            categorySlug: "hoodies",
            brandSlug: "customwear",
            sku: "HOODIE-001",
            stock: 200,
            weight: 0.6,
            dimensions: "Medium: 28x22 inches",
            isFeatured: true,
            isBestSeller: true,
            images: [
                { url: "https://via.placeholder.com/600x600?text=Black+Hoodie", alt: "Black Hoodie", isPrimary: true, displayOrder: 0 },
                { url: "https://via.placeholder.com/600x600?text=Hoodie+Detail", alt: "Hoodie Detail", isPrimary: false, displayOrder: 1 },
            ],
            specifications: [
                { key: "Material", value: "Cotton Fleece", displayOrder: 0 },
                { key: "GSM", value: "320 GSM", displayOrder: 1 },
                { key: "Type", value: "Pullover Hoodie", displayOrder: 2 },
            ],
            attributes: [
                { attributeType: "material", attributeValue: "fleece" },
            ],
            tags: ["winter", "warm", "bestseller"],
            variants: [
                { name: "S", sku: "HOODIE-001-S", priceModifier: 0, stock: 40 },
                { name: "M", sku: "HOODIE-001-M", priceModifier: 0, stock: 60 },
                { name: "L", sku: "HOODIE-001-L", priceModifier: 100, stock: 60 },
                { name: "XL", sku: "HOODIE-001-XL", priceModifier: 200, stock: 40 },
            ],
        },
        // Mugs
        {
            name: "Ceramic Coffee Mug",
            slug: "ceramic-coffee-mug",
            shortDescription: "11oz ceramic mug, microwave safe",
            description: "Premium quality 11oz ceramic coffee mug with high-definition printing. Dishwasher and microwave safe. Perfect for gifts and promotional items.",
            basePrice: 299,
            sellingPrice: 249,
            mrp: 349,
            categorySlug: "mugs",
            brandSlug: "printhub",
            sku: "MUG-001",
            stock: 1000,
            weight: 0.35,
            dimensions: "11oz capacity, 3.7\" diameter",
            isFeatured: true,
            isBestSeller: true,
            images: [
                { url: "https://via.placeholder.com/600x600?text=White+Mug", alt: "White Ceramic Mug", isPrimary: true, displayOrder: 0 },
                { url: "https://via.placeholder.com/600x600?text=Mug+Handle", alt: "Mug Handle Detail", isPrimary: false, displayOrder: 1 },
            ],
            specifications: [
                { key: "Material", value: "Ceramic", displayOrder: 0 },
                { key: "Capacity", value: "11oz (325ml)", displayOrder: 1 },
                { key: "Print Area", value: "360° Full Wrap", displayOrder: 2 },
                { key: "Care", value: "Dishwasher & Microwave Safe", displayOrder: 3 },
            ],
            attributes: [
                { attributeType: "material", attributeValue: "ceramic" },
            ],
            tags: ["bestseller", "gift", "office"],
            variants: [
                { name: "White", sku: "MUG-001-W", priceModifier: 0, stock: 500 },
                { name: "Black", sku: "MUG-001-B", priceModifier: 30, stock: 300 },
                { name: "Red", sku: "MUG-001-R", priceModifier: 30, stock: 200 },
            ],
        },
        {
            name: "Magic Mug",
            slug: "magic-mug",
            shortDescription: "Color changing heat-sensitive mug",
            description: "Amazing heat-sensitive magic mug that reveals your custom design when hot liquid is poured. Black when cold, image appears when hot. A perfect gift!",
            basePrice: 499,
            sellingPrice: 449,
            mrp: 599,
            categorySlug: "mugs",
            brandSlug: "printhub",
            sku: "MUG-002",
            stock: 300,
            weight: 0.35,
            isFeatured: true,
            isNewArrival: true,
            images: [
                { url: "https://via.placeholder.com/600x600?text=Magic+Mug+Cold", alt: "Magic Mug Cold", isPrimary: true, displayOrder: 0 },
                { url: "https://via.placeholder.com/600x600?text=Magic+Mug+Hot", alt: "Magic Mug Hot", isPrimary: false, displayOrder: 1 },
            ],
            specifications: [
                { key: "Material", value: "Heat-sensitive Ceramic", displayOrder: 0 },
                { key: "Capacity", value: "11oz", displayOrder: 1 },
                { key: "Special Feature", value: "Color changing", displayOrder: 2 },
            ],
            attributes: [
                { attributeType: "material", attributeValue: "ceramic" },
            ],
            tags: ["magic", "gift", "unique", "new"],
            variants: [
                { name: "Standard", sku: "MUG-002-STD", priceModifier: 0, stock: 300 },
            ],
        },
        // Posters
        {
            name: "A3 Premium Poster",
            slug: "a3-premium-poster",
            shortDescription: "High-quality matte finish poster",
            description: "Premium A3 size poster with high-definition printing on thick matte paper. Perfect for wall art, room decoration, or office display.",
            basePrice: 299,
            sellingPrice: 249,
            mrp: 399,
            categorySlug: "posters",
            brandSlug: "artprints",
            sku: "POSTER-001",
            stock: 500,
            weight: 0.1,
            dimensions: "A3 (11.7 x 16.5 inches)",
            isFeatured: true,
            images: [
                { url: "https://via.placeholder.com/600x600?text=A3+Poster", alt: "A3 Poster", isPrimary: true, displayOrder: 0 },
            ],
            specifications: [
                { key: "Size", value: "A3 (297 x 420 mm)", displayOrder: 0 },
                { key: "Paper", value: "300 GSM Matte", displayOrder: 1 },
                { key: "Finish", value: "Matte", displayOrder: 2 },
            ],
            attributes: [
                { attributeType: "size", attributeValue: "a3" },
            ],
            tags: ["wall-art", "decor", "print"],
            variants: [
                { name: "With Frame", sku: "POSTER-001-F", priceModifier: 200, stock: 200 },
                { name: "Without Frame", sku: "POSTER-001-NF", priceModifier: 0, stock: 300 },
            ],
        },
        // Notebooks
        {
            name: "Custom Notebook A5",
            slug: "custom-notebook-a5",
            shortDescription: "Hardcover notebook with custom design",
            description: "Premium A5 hardcover notebook with 200 ruled pages. Perfect for journaling, note-taking, or as a personalized gift.",
            basePrice: 399,
            sellingPrice: 349,
            mrp: 499,
            categorySlug: "notebooks",
            brandSlug: "printhub",
            sku: "NOTEBOOK-001",
            stock: 400,
            weight: 0.3,
            dimensions: "A5 (5.8 x 8.3 inches)",
            isFeatured: true,
            images: [
                { url: "https://via.placeholder.com/600x600?text=Notebook", alt: "Custom Notebook", isPrimary: true, displayOrder: 0 },
            ],
            specifications: [
                { key: "Size", value: "A5", displayOrder: 0 },
                { key: "Pages", value: "200 Ruled Pages", displayOrder: 1 },
                { key: "Cover", value: "Hardcover", displayOrder: 2 },
            ],
            attributes: [
                { attributeType: "size", attributeValue: "a5" },
            ],
            tags: ["stationery", "notebook", "gift"],
            variants: [
                { name: "Standard", sku: "NOTEBOOK-001-STD", priceModifier: 0, stock: 400 },
            ],
        },
        // Phone Cases
        {
            name: "iPhone Case",
            slug: "iphone-case",
            shortDescription: "Durable custom printed phone case",
            description: "High-quality protective phone case with custom printing. Slim design with precise cutouts. Available for multiple iPhone models.",
            basePrice: 499,
            sellingPrice: 399,
            mrp: 599,
            categorySlug: "phone-cases",
            brandSlug: "customwear",
            sku: "PHONE-001",
            stock: 300,
            weight: 0.05,
            isFeatured: true,
            images: [
                { url: "https://via.placeholder.com/600x600?text=iPhone+Case", alt: "iPhone Case", isPrimary: true, displayOrder: 0 },
            ],
            specifications: [
                { key: "Material", value: "Polycarbonate", displayOrder: 0 },
                { key: "Type", value: "Snap Case", displayOrder: 1 },
                { key: "Protection", value: "Scratch Resistant", displayOrder: 2 },
            ],
            attributes: [
                { attributeType: "material", attributeValue: "polycarbonate" },
            ],
            tags: ["phone", "case", "protective"],
            variants: [
                { name: "iPhone 13", sku: "PHONE-001-IP13", priceModifier: 0, stock: 100 },
                { name: "iPhone 14", sku: "PHONE-001-IP14", priceModifier: 0, stock: 100 },
                { name: "iPhone 15", sku: "PHONE-001-IP15", priceModifier: 50, stock: 100 },
            ],
        },
        // Tote Bags
        {
            name: "Canvas Tote Bag",
            slug: "canvas-tote-bag",
            shortDescription: "Eco-friendly cotton canvas bag",
            description: "Durable and eco-friendly cotton canvas tote bag with custom printing. Perfect for shopping, beach trips, or daily use.",
            basePrice: 399,
            sellingPrice: 349,
            mrp: 499,
            categorySlug: "tote-bags",
            brandSlug: "customwear",
            sku: "TOTE-001",
            stock: 500,
            weight: 0.2,
            dimensions: "15 x 16 inches",
            isFeatured: true,
            isNewArrival: true,
            images: [
                { url: "https://via.placeholder.com/600x600?text=Tote+Bag", alt: "Canvas Tote Bag", isPrimary: true, displayOrder: 0 },
            ],
            specifications: [
                { key: "Material", value: "100% Cotton Canvas", displayOrder: 0 },
                { key: "Size", value: "15 x 16 inches", displayOrder: 1 },
                { key: "Handle Length", value: "11 inches", displayOrder: 2 },
            ],
            attributes: [
                { attributeType: "material", attributeValue: "canvas" },
            ],
            tags: ["eco-friendly", "bag", "shopping"],
            variants: [
                { name: "Natural", sku: "TOTE-001-NAT", priceModifier: 0, stock: 300 },
                { name: "Black", sku: "TOTE-001-BLK", priceModifier: 20, stock: 200 },
            ],
        },
        // Stickers
        {
            name: "Custom Stickers Pack",
            slug: "custom-stickers-pack",
            shortDescription: "Waterproof vinyl stickers",
            description: "High-quality waterproof vinyl stickers. Perfect for laptops, water bottles, or any smooth surface. Available in various sizes.",
            basePrice: 99,
            sellingPrice: 79,
            mrp: 149,
            categorySlug: "stickers",
            brandSlug: "artprints",
            sku: "STICKER-001",
            stock: 2000,
            weight: 0.01,
            isBestSeller: true,
            images: [
                { url: "https://via.placeholder.com/600x600?text=Stickers", alt: "Custom Stickers", isPrimary: true, displayOrder: 0 },
            ],
            specifications: [
                { key: "Material", value: "Vinyl", displayOrder: 0 },
                { key: "Finish", value: "Glossy", displayOrder: 1 },
                { key: "Features", value: "Waterproof, UV Resistant", displayOrder: 2 },
            ],
            attributes: [
                { attributeType: "material", attributeValue: "vinyl" },
            ],
            tags: ["sticker", "waterproof", "decal"],
            variants: [
                { name: "Small (3 inch)", sku: "STICKER-001-S", priceModifier: 0, stock: 1000 },
                { name: "Medium (5 inch)", sku: "STICKER-001-M", priceModifier: 30, stock: 700 },
                { name: "Large (8 inch)", sku: "STICKER-001-L", priceModifier: 70, stock: 300 },
            ],
        },
    ];

    const createdProducts: any[] = [];
    for (const productData of productsData) {
        const {
            categorySlug,
            brandSlug,
            images,
            specifications,
            attributes,
            tags,
            variants,
            ...productFields
        } = productData;

        const product = await prisma.product.upsert({
            where: { slug: productData.slug },
            update: {},
            create: {
                ...productFields,
                categoryId: categories[categorySlug].id,
                brandId: brandSlug ? brands[brandSlug].id : null,
            },
        });

        // Create images
        for (const image of images) {
            await prisma.productImage.upsert({
                where: {
                    // Create a composite unique identifier
                    id: `${product.id}-${image.displayOrder}`,
                },
                update: {},
                create: {
                    id: `${product.id}-${image.displayOrder}`,
                    productId: product.id,
                    ...image,
                },
            });
        }

        // Create specifications
        for (const spec of specifications) {
            await prisma.productSpecification.create({
                data: {
                    productId: product.id,
                    ...spec,
                },
            });
        }

        // Create attributes
        for (const attr of attributes) {
            await prisma.productAttribute.create({
                data: {
                    productId: product.id,
                    ...attr,
                },
            });
        }

        // Create tags
        for (const tag of tags) {
            await prisma.productTag.create({
                data: {
                    productId: product.id,
                    tag,
                },
            });
        }

        // Create variants
        for (const variant of variants) {
            await prisma.productVariant.upsert({
                where: { sku: variant.sku },
                update: {},
                create: {
                    productId: product.id,
                    name: variant.name,
                    sku: variant.sku,
                    priceModifier: variant.priceModifier,
                    stock: variant.stock,
                    available: true,
                },
            });
        }

        createdProducts.push(product);
        console.log(`  ✅ ${product.name}`);
    }

    // ============================================
    // 4. COUPONS
    // ============================================
    console.log("\n🎟️  Creating Coupons...");
    const couponsData = [
        {
            code: "WELCOME10",
            name: "Welcome Offer",
            description: "Get 10% off on your first order",
            discountType: DiscountType.PERCENTAGE,
            discountValue: 10,
            minPurchaseAmount: 500,
            maxDiscountAmount: 200,
            usageLimit: 1000,
            usageLimitPerUser: 1,
            validFrom: new Date(),
            validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
            applicableTo: CouponApplicableTo.ALL,
        },
        {
            code: "SAVE20",
            name: "Flat 20% Off",
            description: "Save 20% on orders above ₹1000",
            discountType: DiscountType.PERCENTAGE,
            discountValue: 20,
            minPurchaseAmount: 1000,
            maxDiscountAmount: 500,
            usageLimit: 500,
            usageLimitPerUser: 3,
            validFrom: new Date(),
            validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // 60 days
            applicableTo: CouponApplicableTo.ALL,
        },
        {
            code: "FLAT100",
            name: "Flat ₹100 Off",
            description: "Flat ₹100 off on orders above ₹999",
            discountType: DiscountType.FIXED,
            discountValue: 100,
            minPurchaseAmount: 999,
            usageLimit: 200,
            usageLimitPerUser: 2,
            validFrom: new Date(),
            validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            applicableTo: CouponApplicableTo.ALL,
        },
        {
            code: "BULK50",
            name: "Bulk Order Discount",
            description: "Special discount for bulk orders",
            discountType: DiscountType.PERCENTAGE,
            discountValue: 15,
            minPurchaseAmount: 5000,
            maxDiscountAmount: 1000,
            usageLimit: null, // Unlimited
            usageLimitPerUser: 5,
            validFrom: new Date(),
            validUntil: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 180 days
            applicableTo: CouponApplicableTo.ALL,
        },
    ];

    for (const couponData of couponsData) {
        await prisma.coupon.upsert({
            where: { code: couponData.code },
            update: couponData,
            create: couponData,
        });
        console.log(`  ✅ ${couponData.code} - ${couponData.name}`);
    }

    // ============================================
    // 5. DEMO USERS (for testing)
    // ============================================
    console.log("\n👤 Creating Demo Users...");
    
    const demoUsers = [
        {
            email: "admin@example.com",
            name: "Admin User",
            phone: "+919876543210",
            isAdmin: true,
            isSuperAdmin: true,
        },
        {
            email: "customer@example.com",
            name: "Test Customer",
            phone: "+919876543211",
            isAdmin: false,
            isSuperAdmin: false,
        },
    ];

    for (const userData of demoUsers) {
        const user = await prisma.user.upsert({
            where: { email: userData.email },
            update: userData,
            create: userData,
        });
        console.log(`  ✅ ${user.name} (${user.email})`);

        // Create sample address for customer
        if (!userData.isAdmin) {
            await prisma.address.upsert({
                where: {
                    id: `${user.id}-default`,
                },
                update: {},
                create: {
                    id: `${user.id}-default`,
                    userId: user.id,
                    street: "123 Main Street, Apartment 4B",
                    city: "Mumbai",
                    state: "Maharashtra",
                    zipCode: "400001",
                    country: "India",
                    isDefault: true,
                },
            });
            console.log(`    ✅ Created default address`);
        }
    }

    // ============================================
    // SUMMARY
    // ============================================
    console.log("\n" + "=".repeat(50));
    console.log("📊 SEEDING SUMMARY");
    console.log("=".repeat(50));
    console.log(`✅ Brands: ${brandsData.length}`);
    console.log(`✅ Categories: ${categoriesData.length + subCategoriesData.length}`);
    console.log(`✅ Products: ${productsData.length}`);
    console.log(`✅ Coupons: ${couponsData.length}`);
    console.log(`✅ Demo Users: ${demoUsers.length}`);
    console.log("=".repeat(50));
    console.log("\n🎉 Database seeding completed successfully!\n");
    console.log("💡 You can now:");
    console.log("   - Start the API server: cd apps/api && bun run dev");
    console.log("   - Access the frontend: cd apps/web && bun run dev");
    console.log("   - Login as admin: admin@example.com");
    console.log("   - Login as customer: customer@example.com");
    console.log("\n   Note: Use Supabase auth for actual login\n");
}

main()
    .catch((e) => {
        console.error("\n❌ Seeding failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });

