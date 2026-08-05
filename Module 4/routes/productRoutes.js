const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

// Public: browse, filter, search, sort
router.get("/", getProducts);
router.get("/:id", getProductById);

// Admin only: create, update, delete
router.post("/", protect, authorizeRoles("admin"), createProduct);
router.put("/:id", protect, authorizeRoles("admin"), updateProduct);
router.delete("/:id", protect, authorizeRoles("admin"), deleteProduct);

module.exports = router;