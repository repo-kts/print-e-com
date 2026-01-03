import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Sample review data
type ReviewTemplate = {
    rating: number;
    titles: string[];
    comments: string[];
};

const reviewTemplates: ReviewTemplate[] = [
    {
        rating: 5,
        titles: [
            "Excellent Quality!",
            "Perfect for my needs",
            "Highly recommended",
            "Great service and quality",
            "Exactly as described",
            "Fast delivery, great quality",
        ],
        comments: [
            "The print quality is outstanding. Very satisfied with the service!",
            "Perfect quality and fast turnaround time. Will definitely order again.",
            "Excellent service! The colors came out vibrant and clear.",
            "Great quality paper and printing. Highly recommend this service.",
            "Very professional work. The print quality exceeded my expectations.",
            "Fast delivery and excellent quality. Very happy with my purchase!",
        ],
    },
    {
        rating: 4,
        titles: [
            "Good quality",
            "Satisfied with the service",
            "Nice product",
            "Good value for money",
            "Decent quality",
        ],
        comments: [
            "Good quality printing. Minor issues but overall satisfied.",
            "The quality is good, though delivery could be faster.",
            "Nice product, meets expectations. Would order again.",
            "Good value for the price. Quality is decent.",
            "Satisfactory quality. Some improvements could be made.",
        ],
    },
    {
        rating: 3,
        titles: [
            "Average quality",
            "Could be better",
            "Okay for the price",
        ],
        comments: [
            "Average quality. Nothing special but gets the job done.",
            "Could be better quality. Acceptable for the price.",
            "Okay product. Not great but not bad either.",
        ],
    },
];

// Sample customer names
const customerNames = [
    "Rajesh Kumar",
    "Priya Sharma",
    "Amit Patel",
    "Sneha Reddy",
    "Vikram Singh",
    "Anjali Mehta",
    "Rahul Gupta",
    "Kavita Nair",
    "Suresh Iyer",
    "Deepika Joshi",
    "Mohit Agarwal",
    "Neha Desai",
    "Arjun Malhotra",
    "Swati Kapoor",
    "Rohan Verma",
];

async function getOrCreateUser(name: string, email: string) {
    const user = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
            email,
            name,
            isAdmin: false,
        },
    });
    return user;
}

function getRandomElement<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
}

function getRandomRating(): number {
    // Weighted towards positive ratings (70% 4-5 stars, 20% 3 stars, 10% 1-2 stars)
    const rand = Math.random();
    if (rand < 0.7) {
        return Math.random() < 0.5 ? 5 : 4;
    } else if (rand < 0.9) {
        return 3;
    } else {
        return Math.random() < 0.5 ? 2 : 1;
    }
}

function getReviewForRating(rating: number): ReviewTemplate {
    if (rating >= 4) {
        return reviewTemplates[0];
    } else if (rating === 3) {
        return reviewTemplates[1];
    } else {
        return {
            rating,
            titles: ["Not satisfied", "Poor quality", "Disappointed"],
            comments: [
                "Quality was not as expected. Needs improvement.",
                "Not satisfied with the service. Could be better.",
                "Disappointed with the quality. Expected more.",
            ],
        };
    }
}

async function main() {
    console.log("🌱 Seeding product reviews...");

    // Get all products
    const products = await prisma.product.findMany({
        select: {
            id: true,
            name: true,
            slug: true,
        },
    });

    if (products.length === 0) {
        console.log("⚠️  No products found. Please run product seed scripts first.");
        return;
    }

    console.log(`📦 Found ${products.length} products to add reviews to\n`);

    // Create users for reviews
    const users: Awaited<ReturnType<typeof getOrCreateUser>>[] = [];
    for (let i = 0; i < customerNames.length; i++) {
        const name = customerNames[i];
        const email = `customer${i + 1}@example.com`;
        const user = await getOrCreateUser(name, email);
        users.push(user);
    }

    let totalReviews = 0;
    let reviewsCreated = 0;

    // Add reviews to products
    for (const product of products) {
        // Add 2-5 reviews per product
        const reviewCount = Math.floor(Math.random() * 4) + 2;

        for (let i = 0; i < reviewCount; i++) {
            const rating = getRandomRating();
            const reviewTemplate = getReviewForRating(rating);
            const user = getRandomElement(users);

            // Check if user already reviewed this product
            const existingReview = await prisma.review.findUnique({
                where: {
                    productId_userId: {
                        productId: product.id,
                        userId: user.id,
                    },
                },
            });

            if (existingReview) {
                continue; // Skip if user already reviewed
            }

            const title = getRandomElement(reviewTemplate.titles);
            const comment = getRandomElement(reviewTemplate.comments);

            try {
                await prisma.review.create({
                    data: {
                        productId: product.id,
                        userId: user.id,
                        rating,
                        title,
                        comment,
                        isVerifiedPurchase: Math.random() > 0.3, // 70% verified purchases
                        isApproved: true,
                        isHelpful: Math.floor(Math.random() * 10),
                    },
                });

                reviewsCreated++;
            } catch (error: any) {
                // Skip if duplicate or other error
                if (!error.message.includes("Unique constraint")) {
                    console.error(`Error creating review for ${product.name}:`, error.message);
                }
            }
        }

        totalReviews += reviewCount;

        // Update product rating and review count
        const productReviews = await prisma.review.findMany({
            where: { productId: product.id },
            select: { rating: true },
        });

        if (productReviews.length > 0) {
            const avgRating =
                productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;

            await prisma.product.update({
                where: { id: product.id },
                data: {
                    rating: Math.round(avgRating * 100) / 100,
                    totalReviews: productReviews.length,
                },
            });
        }

        if (products.indexOf(product) % 10 === 0) {
            console.log(`  ✅ Processed ${products.indexOf(product) + 1}/${products.length} products...`);
        }
    }

    console.log(`\n✅ Reviews seeding completed!`);
    console.log(`   📊 Total reviews created: ${reviewsCreated}`);
    console.log(`   📦 Products processed: ${products.length}`);
}

main()
    .catch((e) => {
        console.error("❌ Seeding failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });

