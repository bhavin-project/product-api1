import { Router } from "express";
import {
  insertProduct,
  getProductById,
  getActiveProducts1,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

const router = Router();

router.post("/", insertProduct);
router.get("/:productId", getProductById);
router.get("/active", getActiveProducts1);
router.put("/:productId", updateProduct);
router.delete("/:productId", deleteProduct);

export default router;
