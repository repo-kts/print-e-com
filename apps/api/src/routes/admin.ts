import { Router, type IRouter } from "express";
import {
    getCategories,
    getProducts,
    getProduct,
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

// Public product routes (no auth needed)
router.get("/categories", getCategories);
router.get("/products", getProducts);
router.get("/products/:id", getProduct);

// Protected admin routes - apply middleware to all admin operations
router.use(adminAuth);

// Product management (admin only)
// WIP: add admin middleware to check the admin
router.post("/categories", createCategoties);
router.post("/products", createProduct);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);
router.post("/products/:id/variants", addVariant);

// Order management (admin only)
router.get("/orders", getAdminOrders);
router.get("/orders/:id", getAdminOrder);
router.patch("/orders/:id/status", updateOrderStatus);

export default router;
