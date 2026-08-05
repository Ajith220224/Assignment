const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const {
  placeOrder,
  getMyOrders,
  getAllOrders,
  cancelOrder,
  updateOrderStatus,
} = require("../controllers/orderController");

// Any logged-in user (not guest) can place orders / view own orders
router.post("/", protect, authorizeRoles("user", "admin"), placeOrder);
router.get("/my", protect, authorizeRoles("user", "admin"), getMyOrders);
router.put("/:id/cancel", protect, authorizeRoles("user", "admin"), cancelOrder);

// Admin only
router.get("/", protect, authorizeRoles("admin"), getAllOrders);
router.put("/:id/status", protect, authorizeRoles("admin"), updateOrderStatus);

module.exports = router;