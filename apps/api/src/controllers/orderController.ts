import { Request, Response, NextFunction } from "express";
import { prisma } from "../services/prisma.js";
import { sendSuccess } from "../utils/response.js";
import { ValidationError, NotFoundError, UnauthorizedError } from "../utils/errors.js";

// Customer: Create order
export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            throw new UnauthorizedError("User not authenticated");
        }

        const { items, addressId, paymentMethod } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            throw new ValidationError("Order items are required");
        }

        if (!addressId) {
            throw new ValidationError("Shipping address is required");
        }

        if (!paymentMethod || !["ONLINE", "OFFLINE"].includes(paymentMethod)) {
            throw new ValidationError("Payment method must be ONLINE or OFFLINE");
        }

        // Verify address belongs to user
        const address = await prisma.address.findFirst({
            where: {
                id: addressId,
                userId: req.user.id,
            },
        });

        if (!address) {
            throw new NotFoundError("Address not found");
        }

        const { couponCode, shippingCharges = 0 } = req.body;

        // Calculate subtotal and validate items
        let subtotal = 0;
        const orderItems = [];

        for (const item of items) {
            const { productId, variantId, quantity, customDesignUrl, customText } = item;

            if (!productId || !quantity || quantity < 1) {
                throw new ValidationError("Invalid order item");
            }

            const product = await prisma.product.findUnique({
                where: { id: productId },
                include: { variants: true },
            });

            if (!product || !product.isActive) {
                throw new NotFoundError(`Product ${productId} not found`);
            }

            // Use sellingPrice if available, otherwise basePrice
            let itemPrice = Number(product.sellingPrice || product.basePrice);

            if (variantId) {
                const variant = product.variants.find((v: { id: string }) => v.id === variantId);
                if (!variant || !variant.available) {
                    throw new ValidationError(`Variant ${variantId} not available`);
                }
                itemPrice += Number(variant.priceModifier);
            }

            const itemTotal = itemPrice * quantity;
            subtotal += itemTotal;

            orderItems.push({
                productId,
                variantId: variantId || null,
                quantity,
                price: itemPrice,
                customDesignUrl: customDesignUrl || null,
                customText: customText || null,
            });
        }

        // Calculate discount from coupon if provided
        let discountAmount = 0;
        let couponId = null;

        if (couponCode) {
            const coupon = await prisma.coupon.findUnique({
                where: { code: couponCode.toUpperCase() },
            });

            if (coupon && coupon.isActive) {
                const now = new Date();
                if (now >= coupon.validFrom && now <= coupon.validUntil) {
                    if (!coupon.minPurchaseAmount || subtotal >= Number(coupon.minPurchaseAmount)) {
                        // Check usage limits
                        const usageCount = await prisma.couponUsage.count({
                            where: { couponId: coupon.id },
                        });

                        if (coupon.usageLimit === null || usageCount < coupon.usageLimit) {
                            const userUsageCount = await prisma.couponUsage.count({
                                where: {
                                    couponId: coupon.id,
                                    userId: req.user.id,
                                },
                            });

                            if (userUsageCount < coupon.usageLimitPerUser) {
                                // Calculate discount
                                if (coupon.discountType === "PERCENTAGE") {
                                    discountAmount = (subtotal * Number(coupon.discountValue)) / 100;
                                } else {
                                    discountAmount = Number(coupon.discountValue);
                                }

                                // Apply max discount cap
                                if (coupon.maxDiscountAmount && discountAmount > Number(coupon.maxDiscountAmount)) {
                                    discountAmount = Number(coupon.maxDiscountAmount);
                                }

                                couponId = coupon.id;
                            }
                        }
                    }
                }
            }
        }

        // Calculate final total
        const finalShippingCharges = Number(shippingCharges) || 0;
        const total = subtotal - discountAmount + finalShippingCharges;

        // Create order
        const order = await prisma.order.create({
            data: {
                userId: req.user.id,
                addressId,
                subtotal,
                discountAmount: discountAmount > 0 ? discountAmount : null,
                shippingCharges: finalShippingCharges > 0 ? finalShippingCharges : null,
                total,
                paymentMethod,
                couponId,
                status: "PENDING_REVIEW",
                items: {
                    create: orderItems,
                },
                statusHistory: {
                    create: {
                        status: "PENDING_REVIEW",
                        comment: "Order created",
                    },
                },
            },
            include: {
                items: {
                    include: {
                        product: true,
                        variant: true,
                    },
                },
                address: true,
                statusHistory: {
                    orderBy: { createdAt: "desc" },
                },
            },
        });

        // Record coupon usage if applied
        if (couponId) {
            await prisma.couponUsage.create({
                data: {
                    couponId,
                    userId: req.user.id,
                    orderId: order.id,
                },
            });
        }

        return sendSuccess(res, order, "Order created successfully", 201);
    } catch (error) {
        next(error);
    }
};

// Customer: Get my orders
export const getMyOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            throw new UnauthorizedError("User not authenticated");
        }

        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const skip = (page - 1) * limit;

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where: { userId: req.user.id },
                include: {
                    items: {
                        include: {
                            product: true,
                            variant: true,
                        },
                    },
                    address: true,
                },
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
            }),
            prisma.order.count({
                where: { userId: req.user.id },
            }),
        ]);

        return sendSuccess(res, {
            orders,
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

// Customer: Get order details
export const getOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!req.user) {
            throw new UnauthorizedError("User not authenticated");
        }

        const { id } = req.params;

        const order = await prisma.order.findFirst({
            where: {
                id,
                userId: req.user.id,
            },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                category: true,
                            },
                        },
                        variant: true,
                    },
                },
                address: true,
                statusHistory: {
                    orderBy: { createdAt: "asc" },
                },
                payments: true,
            },
        });

        if (!order) {
            throw new NotFoundError("Order not found");
        }

        return sendSuccess(res, order);
    } catch (error) {
        next(error);
    }
};

/**
 * @openapi
 * /api/v1/admin/orders:
 *   get:
 *     summary: Get all orders (admin)
 *     description: >
 *       Returns a paginated list of orders for admin users. Supports filtering by status and
 *       free-text search over order ID, customer email, and customer name.
 *     tags:
 *       - Admin
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - name: limit
 *         in: query
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *       - name: status
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *           enum: [PENDING_REVIEW, PROCESSING, SHIPPED, DELIVERED, CANCELLED]
 *       - name: search
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *         description: Search by order ID, customer email, or customer name (case-insensitive).
 *     responses:
 *       200:
 *         description: List of orders retrieved successfully.
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
 *                   required:
 *                     - orders
 *                     - pagination
 *                   properties:
 *                     orders:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           total:
 *                             type: number
 *                           status:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                           user:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                               email:
 *                                 type: string
 *                                 format: email
 *                               name:
 *                                 type: string
 *                                 nullable: true
 *                           address:
 *                             type: object
 *                           items:
 *                             type: array
 *                             items:
 *                               type: object
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
 *         description: Unauthorized - admin authentication required.
 *       403:
 *         description: Forbidden - user is not an admin.
 */
// Admin: Get all orders
export const getAdminOrders = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 20;
        const status = req.query.status as string;
        const search = req.query.search as string;
        const skip = (page - 1) * limit;

        const where: any = {};

        if (status) {
            where.status = status;
        }

        // Search functionality - search by order ID, user email, user name
        if (search) {
            where.OR = [
                { id: { contains: search, mode: "insensitive" } },
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

        const [orders, total] = await Promise.all([
            prisma.order.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            name: true,
                        },
                    },
                    items: {
                        include: {
                            product: true,
                            variant: true,
                        },
                    },
                    address: true,
                },
                skip,
                take: limit,
                orderBy: { createdAt: "desc" },
            }),
            prisma.order.count({ where }),
        ]);

        return sendSuccess(res, {
            orders,
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

// Admin: Get order details
export const getAdminOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        phone: true,
                    },
                },
                items: {
                    include: {
                        product: {
                            include: {
                                category: true,
                            },
                        },
                        variant: true,
                    },
                },
                address: true,
                statusHistory: {
                    orderBy: { createdAt: "asc" },
                },
                payments: true,
            },
        });

        if (!order) {
            throw new NotFoundError("Order not found");
        }

        return sendSuccess(res, order);
    } catch (error) {
        next(error);
    }
};

// Admin: Update order status
export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { status, comment } = req.body;

        const validStatuses = [
            "PENDING_REVIEW",
            "ACCEPTED",
            "REJECTED",
            "PROCESSING",
            "SHIPPED",
            "DELIVERED",
            "CANCELLED",
        ];

        if (!id) throw new ValidationError('There is not id in params')

        if (!status || !validStatuses.includes(status)) {
            throw new ValidationError(`Status must be one of: ${validStatuses.join(", ")}`);
        }

        const order = await prisma.order.findUnique({
            where: { id },
        });

        if (!order) {
            throw new NotFoundError("Order not found");
        }

        // Update order status
        const updatedOrder = await prisma.order.update({
            where: { id },
            data: { status },
            include: {
                items: {
                    include: {
                        product: true,
                        variant: true,
                    },
                },
                address: true,
                statusHistory: {
                    orderBy: { createdAt: "asc" },
                },
            },
        });

        // Create status history entry
        await prisma.orderStatusHistory.create({
            data: {
                orderId: id,
                status,
                comment: comment || `Status updated to ${status}`,
            },
        });

        return sendSuccess(res, updatedOrder, "Order status updated successfully");
    } catch (error) {
        next(error);
    }
};

// Public/Customer: Track order
export const trackOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { email, phone } = req.query;

        const order = await prisma.order.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        email: true,
                        phone: true,
                    },
                },
                statusHistory: {
                    orderBy: { createdAt: "asc" },
                },
            },
        });

        if (!order) {
            throw new NotFoundError("Order not found");
        }

        // If not authenticated, verify with email/phone
        if (!req.user) {
            if (email && order.user.email !== email) {
                throw new UnauthorizedError("Email does not match");
            }
            if (phone && order.user.phone !== phone) {
                throw new UnauthorizedError("Phone does not match");
            }
            if (!email && !phone) {
                throw new ValidationError("Email or phone required for public tracking");
            }
        } else if (req.user.id !== order.userId) {
            throw new UnauthorizedError("Not authorized to view this order");
        }

        return sendSuccess(res, {
            orderId: order.id,
            status: order.status,
            timeline: order.statusHistory,
        });
    } catch (error) {
        next(error);
    }
};

