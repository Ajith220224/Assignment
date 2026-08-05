const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const {
  getMyProfile,
  updateMyProfile,
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
} = require("../controllers/userProfile");

// Logged-in user's own profile
router.get("/me", protect, getMyProfile);
router.put("/me", protect, updateMyProfile);

// Admin-only user management
router.get("/", protect, authorizeRoles("admin"), getAllUsers);
router.get("/:id", protect, authorizeRoles("admin"), getUserById);
router.put("/:id/role", protect, authorizeRoles("admin"), updateUserRole);
router.delete("/:id", protect, authorizeRoles("admin"), deleteUser);

module.exports = router;