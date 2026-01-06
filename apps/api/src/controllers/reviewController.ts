import { Request, Response, NextFunction } from "express";
import { prisma } from "../services/prisma.js";
import { sendSuccess } from "../utils/response.js";
import { ValidationError, NotFoundError, UnauthorizedError } from "../utils/errors.js";

// Get product reviews
export const getProductReviews = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { productId } = req.params;

        if (!productId) {
            throw new ValidationError("Product ID is required");
        }
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;
        const skip = (page - 1) * limit;
        const sortBy = (req.query.sortBy as string) || "createdAt"; // createdAt, rating, helpful
        const order = (req.query.order as string) || "desc";

        // Verify product exists
        const product = await prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product) {
            throw new NotFoundError("Product not found");
        }

        const orderBy: any = {};
        if (sortBy === "helpful") {
            orderBy.isHelpful = order === "asc" ? "asc" : "desc";
        } else if (sortBy === "rating") {
            orderBy.rating = order === "asc" ? "asc" : "desc";
        } else {
            orderBy.createdAt = order === "asc" ? "asc" : "desc";
        }

        const [reviews, total] = await Promise.all([
            prisma.review.findMany({
                where: {
                    productId,
                    isApproved: true,
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    helpfulVotes: req.user ? {
                        where: { userId: req.user.id },
                    } : false,
                },
                skip,
                take: limit,
                orderBy,
            }),
            prisma.review.count({
                where: {
                    productId,
                    isApproved: true,
                },
            }),
        ]);

        // Calculate rating distribution
        const ratingDistribution = await prisma.review.groupBy({
            by: ["rating"],
            where: {
                productId,
                isApproved: true,
            },
            _count: true,
        });

        return sendSuccess(res, {
            reviews,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
            ratingDistribution: ratingDistribution.reduce((acc, item) => {
                acc[item.rating] = item._count;
                return acc;
            }, {} as Record<number, number>),
        });
    } catch (error) {
        next(error);
    }
};

// Create review
export const createReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            throw new UnauthorizedError("User not authenticated");
        }

        const { productId } = req.params;

        if (!productId) {
            throw new ValidationError("Product ID is required");
        }
        const { rating, title, comment, images = [] } = req.body;

        if (!rating || rating < 1 || rating > 5) {
            throw new ValidationError("Rating must be between 1 and 5");
        }

        // Verify product exists
        const product = await prisma.product.findUnique({
            where: { id: productId },
        });

        if (!product) {
            throw new NotFoundError("Product not found");
        }

        // Check if user already reviewed this product
        const existingReview = await prisma.review.findUnique({
            where: {
                productId_userId: {
                    productId,
                    userId: req.user.id,
                },
            },
        });

        if (existingReview) {
            throw new ValidationError("You have already reviewed this product");
        }

        // Check if user has purchased this product (optional verification)
        const hasPurchased = await prisma.orderItem.findFirst({
            where: {
                productId,
                order: {
                    userId: req.user.id,
                    paymentStatus: "SUCCESS",
                },
            },
        });

        const review = await prisma.review.create({
            data: {
                productId,
                userId: req.user.id,
                rating,
                title: title || null,
                comment: comment || null,
                images,
                isVerifiedPurchase: !!hasPurchased,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        // Update product rating and review count
        const allReviews = await prisma.review.findMany({
            where: {
                productId,
                isApproved: true,
            },
            select: { rating: true },
        });

        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

        await prisma.product.update({
            where: { id: productId },
            data: {
                rating: avgRating,
                totalReviews: allReviews.length,
            },
        });

        return sendSuccess(res, review, "Review created successfully", 201);
    } catch (error) {
        next(error);
    }
};

// Update review
export const updateReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            throw new UnauthorizedError("User not authenticated");
        }

        const { reviewId } = req.params;

        if (!reviewId) {
            throw new ValidationError("Review ID is required");
        }
        const { rating, title, comment, images } = req.body;

        const review = await prisma.review.findUnique({
            where: { id: reviewId },
        });

        if (!review) {
            throw new NotFoundError("Review not found");
        }

        if (review.userId !== req.user.id) {
            throw new UnauthorizedError("Not authorized to update this review");
        }

        const updateData: any = {};
        if (rating !== undefined) {
            if (rating < 1 || rating > 5) {
                throw new ValidationError("Rating must be between 1 and 5");
            }
            updateData.rating = rating;
        }
        if (title !== undefined) updateData.title = title;
        if (comment !== undefined) updateData.comment = comment;
        if (images !== undefined) updateData.images = images;

        const updatedReview = await prisma.review.update({
            where: { id: reviewId },
            data: updateData,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        // Recalculate product rating
        const allReviews = await prisma.review.findMany({
            where: {
                productId: review.productId,
                isApproved: true,
            },
            select: { rating: true },
        });

        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

        await prisma.product.update({
            where: { id: review.productId },
            data: {
                rating: avgRating,
            },
        });

        return sendSuccess(res, updatedReview, "Review updated successfully");
    } catch (error) {
        next(error);
    }
};

// Delete review
export const deleteReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            throw new UnauthorizedError("User not authenticated");
        }

        const { reviewId } = req.params;

        const review = await prisma.review.findUnique({
            where: { id: reviewId },
        });

        if (!review) {
            throw new NotFoundError("Review not found");
        }

        if (review.userId !== req.user.id) {
            throw new UnauthorizedError("Not authorized to delete this review");
        }

        await prisma.review.delete({
            where: { id: reviewId },
        });

        // Recalculate product rating
        const allReviews = await prisma.review.findMany({
            where: {
                productId: review.productId,
                isApproved: true,
            },
            select: { rating: true },
        });

        const avgRating = allReviews.length > 0
            ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
            : null;

        await prisma.product.update({
            where: { id: review.productId },
            data: {
                rating: avgRating,
                totalReviews: allReviews.length,
            },
        });

        return sendSuccess(res, null, "Review deleted successfully");
    } catch (error) {
        next(error);
    }
};

// Vote review as helpful
export const voteReviewHelpful = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            throw new UnauthorizedError("User not authenticated");
        }

        const { reviewId } = req.params;

        if (!reviewId) {
            throw new ValidationError("Review ID is required");
        }
        const { isHelpful = true } = req.body;

        const review = await prisma.review.findUnique({
            where: { id: reviewId },
        });

        if (!review) {
            throw new NotFoundError("Review not found");
        }

        // Check if already voted
        const existingVote = await prisma.reviewHelpfulVote.findUnique({
            where: {
                reviewId_userId: {
                    reviewId,
                    userId: req.user.id,
                },
            },
        });

        if (existingVote) {
            // Update vote
            await prisma.reviewHelpfulVote.update({
                where: { id: existingVote.id },
                data: { isHelpful },
            });
        } else {
            // Create vote
            await prisma.reviewHelpfulVote.create({
                data: {
                    reviewId,
                    userId: req.user.id,
                    isHelpful,
                },
            });
        }

        // Update helpful count
        const helpfulCount = await prisma.reviewHelpfulVote.count({
            where: {
                reviewId,
                isHelpful: true,
            },
        });

        await prisma.review.update({
            where: { id: reviewId },
            data: { isHelpful: helpfulCount },
        });

        return sendSuccess(res, { helpfulCount }, "Vote recorded successfully");
    } catch (error) {
        next(error);
    }
};

/**
 * @openapi
 * /api/v1/admin/reviews:
 *   get:
 *     summary: Get all reviews
 *     description: Admin can view all product reviews for moderation with pagination and search.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for review title, comment, product name, or user email/name
 *       - in: query
 *         name: rating
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         description: Filter reviews by rating
 *       - in: query
 *         name: isApproved
 *         schema:
 *           type: boolean
 *         description: Filter reviews by approval status
 *     responses:
 *       200:
 *         description: List of reviews retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - success
 *                 - data
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     items:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           productId:
 *                             type: string
 *                           userId:
 *                             type: string
 *                           rating:
 *                             type: integer
 *                             minimum: 1
 *                             maximum: 5
 *                           title:
 *                             type: string
 *                             nullable: true
 *                           comment:
 *                             type: string
 *                             nullable: true
 *                           images:
 *                             type: array
 *                             items:
 *                               type: string
 *                           isVerifiedPurchase:
 *                             type: boolean
 *                           isHelpful:
 *                             type: integer
 *                           isApproved:
 *                             type: boolean
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                           product:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                           user:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               name:
 *                                 type: string
 *                               email:
 *                                 type: string
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         page:
 *                           type: integer
 *                         limit:
 *                           type: integer
 *                         total:
 *                           type: integer
 *                         totalPages:
 *                           type: integer
 *       401:
 *         description: Unauthorized - Admin authentication required
 */
// Admin: Get all reviews
export const getAdminReviews = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const search = req.query.search as string;
        const rating = req.query.rating ? parseInt(req.query.rating as string) : undefined;
        const isApproved = req.query.isApproved !== undefined
            ? req.query.isApproved === 'true'
            : undefined;
        const skip = (page - 1) * limit;

        const where: any = {};

        if (rating) {
            where.rating = rating;
        }

        if (isApproved !== undefined) {
            where.isApproved = isApproved;
        }

        if (search) {
            where.OR = [
                { title: { contains: search, mode: "insensitive" } },
                { comment: { contains: search, mode: "insensitive" } },
                {
                    product: {
                        name: { contains: search, mode: "insensitive" },
                    },
                },
                {
                    user: {
                        OR: [
                            { email: { contains: search, mode: "insensitive" } },
                            { name: { contains: search, mode: "insensitive" } },
                        ],
                    },
                },
            ];
        }

        const [reviews, total] = await Promise.all([
            prisma.review.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    product: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
            }),
            prisma.review.count({ where }),
        ]);

        return sendSuccess(res, {
            items: reviews,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @openapi
 * /api/v1/admin/reviews/{id}:
 *   get:
 *     summary: Get single review by ID
 *     description: Admin can view detailed review information
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Review ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - success
 *                 - data
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     productId:
 *                       type: string
 *                     userId:
 *                       type: string
 *                     rating:
 *                       type: integer
 *                     title:
 *                       type: string
 *                       nullable: true
 *                     comment:
 *                       type: string
 *                       nullable: true
 *                     images:
 *                       type: array
 *                       items:
 *                         type: string
 *                     isVerifiedPurchase:
 *                       type: boolean
 *                     isHelpful:
 *                       type: integer
 *                     isApproved:
 *                       type: boolean
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                     product:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         slug:
 *                           type: string
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *       404:
 *         description: Review not found
 *       401:
 *         description: Unauthorized - Admin authentication required
 */
// Admin: Get single review
export const getAdminReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        if (!id) {
            throw new ValidationError("Review ID is required");
        }

        const review = await prisma.review.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                product: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                    },
                },
            },
        });

        if (!review) {
            throw new NotFoundError("Review not found");
        }

        return sendSuccess(res, review);
    } catch (error) {
        next(error);
    }
};

/**
 * @openapi
 * /api/v1/admin/reviews/{id}:
 *   put:
 *     summary: Update review (approve/reject)
 *     description: Admin can approve or reject product reviews
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Review ID
 *         schema:
 *           type: string
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isApproved:
 *                 type: boolean
 *                 example: true
 *                 description: Set to true to approve, false to reject
 *     responses:
 *       200:
 *         description: Review updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - success
 *                 - data
 *                 - message
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                   example: "Review updated successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     isApproved:
 *                       type: boolean
 *                     product:
 *                       type: object
 *                     user:
 *                       type: object
 *       404:
 *         description: Review not found
 *       401:
 *         description: Unauthorized - Admin authentication required
 */
// Admin: Update review (approve/reject)
export const updateAdminReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { isApproved } = req.body;

        if (!id) {
            throw new ValidationError("Review ID is required");
        }

        const review = await prisma.review.findUnique({
            where: { id },
        });

        if (!review) {
            throw new NotFoundError("Review not found");
        }

        const updatedReview = await prisma.review.update({
            where: { id },
            data: {
                isApproved: isApproved !== undefined ? isApproved : review.isApproved,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                product: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        // Recalculate product rating if approval status changed
        if (isApproved !== undefined && isApproved !== review.isApproved) {
            const allReviews = await prisma.review.findMany({
                where: {
                    productId: review.productId,
                    isApproved: true,
                },
                select: { rating: true },
            });

            const avgRating = allReviews.length > 0
                ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
                : null;

            await prisma.product.update({
                where: { id: review.productId },
                data: {
                    rating: avgRating,
                    totalReviews: allReviews.length,
                },
            });
        }

        return sendSuccess(res, updatedReview, "Review updated successfully");
    } catch (error) {
        next(error);
    }
};

/**
 * @openapi
 * /api/v1/admin/reviews/{id}:
 *   delete:
 *     summary: Delete review
 *     description: Admin can delete a product review (recalculates product rating)
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Review ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Review deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               required:
 *                 - success
 *                 - message
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Review deleted successfully"
 *                 data:
 *                   type: null
 *       404:
 *         description: Review not found
 *       401:
 *         description: Unauthorized - Admin authentication required
 */
// Admin: Delete review
export const deleteAdminReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        if (!id) {
            throw new ValidationError("Review ID is required");
        }

        const review = await prisma.review.findUnique({
            where: { id },
        });

        if (!review) {
            throw new NotFoundError("Review not found");
        }

        await prisma.review.delete({
            where: { id },
        });

        // Recalculate product rating
        const allReviews = await prisma.review.findMany({
            where: {
                productId: review.productId,
                isApproved: true,
            },
            select: { rating: true },
        });

        const avgRating = allReviews.length > 0
            ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
            : null;

        await prisma.product.update({
            where: { id: review.productId },
            data: {
                rating: avgRating,
                totalReviews: allReviews.length,
            },
        });

        return sendSuccess(res, null, "Review deleted successfully");
    } catch (error) {
        next(error);
    }
};

