import { Router, type IRouter } from "express";
import {
    createProduct,
    updateProduct,
    deleteProduct,
    addVariant,
    createCategoties,
} from "../controllers/productController";
import {
    getAdminOrders,
    getAdminOrder,
    updateOrderStatus,
} from "../controllers/orderController";
import { adminAuth } from "../middleware/auth";

const router: IRouter = Router();

/**
 * Admin Management Routes
 * All routes require admin authentication
 * These routes are for managing products, categories, and orders
 */
router.use(adminAuth);

// Product & Category Management (admin only)
router.post("/categories", createCategoties);
router.post("/products", createProduct);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);
router.post("/products/:id/variants", addVariant);

// Order Management (admin only)
router.get("/orders", getAdminOrders);
router.get("/orders/:id", getAdminOrder);
router.patch("/orders/:id/status", updateOrderStatus);

export default router;
