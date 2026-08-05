const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { getRecommendations } = require("../controllers/analyticsController");

router.get("/recommendations", protect, authorizeRoles("user", "admin"), getRecommendations);

module.exports = router;