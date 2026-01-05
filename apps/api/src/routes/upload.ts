import { Router, type IRouter } from "express";
import { uploadDesign } from "../controllers/uploadController.js";
import { upload } from "../middleware/upload.js";
import { customerAuth } from "../middleware/auth.js";

const router: IRouter = Router();

// Protected route
router.post("/upload", customerAuth, upload.single("design"), uploadDesign);

export default router;

