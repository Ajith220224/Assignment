const bcrypt = require("bcryptjs");
const User = require("../models/user");
const { asyncHandler } = require("../middleware/errorHandler");

// @route   GET /api/users/me
// @access  Private (any logged-in role)
const getMyProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  res.status(200).json({ success: true, data: user });
});

// @route   PUT /api/users/me
// @access  Private (any logged-in role)
const updateMyProfile = asyncHandler(async (req, res) => {
  const { name, address, phone, password } = req.body;

  const updateData = {};
  if (name) updateData.name = name;
  if (address) updateData.address = address;
  if (phone) updateData.phone = phone;

  if (password) {
    const salt = await bcrypt.genSalt(10);
    updateData.password = await bcrypt.hash(password, salt);
  }

  const user = await User.findByIdAndUpdate(req.user._id, updateData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, message: "Profile updated", data: user });
});

// @route   GET /api/users
// @access  Private/Admin
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find();
  res.status(200).json({ success: true, count: users.length, data: users });
});

// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    res.statusCode = 404;
    throw new Error("User not found");
  }
  res.status(200).json({ success: true, data: user });
});

// @route   PUT /api/users/:id/role
// @access  Private/Admin
const updateUserRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  const allowedRoles = ["admin", "user", "guest"];

  if (!allowedRoles.includes(role)) {
    res.statusCode = 400;
    throw new Error(`Role must be one of: ${allowedRoles.join(", ")}`);
  }

  const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
  if (!user) {
    res.statusCode = 404;
    throw new Error("User not found");
  }

  res.status(200).json({ success: true, message: "Role updated", data: user });
});

// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) {
    res.statusCode = 404;
    throw new Error("User not found");
  }
  res.status(200).json({ success: true, message: "User deleted" });
});

module.exports = {
  getMyProfile,
  updateMyProfile,
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
};