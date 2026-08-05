const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const { asyncHandler } = require("../middleware/errorHandler");

// Helper to generate a signed JWT for a given user id
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, address, phone } = req.body;

  if (!name || !email || !password) {
    res.statusCode = 400;
    throw new Error("Name, email and password are required");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.statusCode = 400;
    throw new Error("A user with this email already exists");
  }

  // Only allow admin role to be self-assigned if explicitly needed for seeding;
  // in production you'd typically restrict this. Default is "user".
  const allowedRoles = ["admin", "user", "guest"];
  const finalRole = allowedRoles.includes(role) ? role : "user";

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: finalRole,
    address,
    phone,
  });

  const token = generateToken(user._id);

  res.status(201).json({
    success: true,
    message: "User registered successfully",
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  });
});

// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.statusCode = 400;
    throw new Error("Email and password are required");
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    res.statusCode = 401;
    throw new Error("Invalid email or password");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    res.statusCode = 401;
    throw new Error("Invalid email or password");
  }

  const token = generateToken(user._id);

  res.status(200).json({
    success: true,
    message: "Login successful",
    data: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  });
});

module.exports = { register, login };