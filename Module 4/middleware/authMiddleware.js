const jwt = require("jsonwebtoken");
const User = require("../models/user");

// Verifies the JWT sent in the Authorization header (Bearer token)
const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ success: false, message: "Not authorized, no token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: "Not authorized, user no longer exists" });
    }

    req.user = user; // attach user to request
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: "Not authorized, token invalid or expired" });
  }
};

// Role-based access control middleware
// Usage: authorizeRoles("admin"), authorizeRoles("admin", "user")
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Not authorized" });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not permitted to access this resource`,
      });
    }
    next();
  };
};

module.exports = { protect, authorizeRoles };