const Order = require("../models/order");
const Product = require("../models/product");
const User = require("../models/user");
const { asyncHandler } = require("../middleware/errorHandler");

// @route   POST /api/orders
// @access  Private (user, admin)
const placeOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    res.statusCode = 400;
    throw new Error("Order must contain at least one item: [{ product, quantity }]");
  }
  if (!shippingAddress) {
    res.statusCode = 400;
    throw new Error("shippingAddress is required");
  }

  let totalAmount = 0;
  const orderItems = [];

  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) {
      res.statusCode = 404;
      throw new Error(`Product not found: ${item.product}`);
    }
    if (product.stock < item.quantity) {
      res.statusCode = 400;
      throw new Error(`Insufficient stock for product: ${product.name}`);
    }

    orderItems.push({
      product: product._id,
      quantity: item.quantity,
      price: product.price,
    });

    totalAmount += product.price * item.quantity;

    // reduce stock
    product.stock -= item.quantity;
    await product.save();
  }

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    totalAmount,
    shippingAddress,
  });

  // track purchase history for recommendations
  await User.findByIdAndUpdate(req.user._id, {
    $addToSet: { purchasedProducts: { $each: orderItems.map((i) => i.product) } },
  });

  res.status(201).json({ success: true, message: "Order placed successfully", data: order });
});

// @route   GET /api/orders/my
// @access  Private (user, admin)
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate("items.product", "name price category")
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: orders.length, data: orders });
});

// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate("user", "name email")
    .populate("items.product", "name price")
    .sort({ createdAt: -1 });

  res.status(200).json({ success: true, count: orders.length, data: orders });
});

// @route   PUT /api/orders/:id/cancel
// @access  Private (owner or admin)
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.statusCode = 404;
    throw new Error("Order not found");
  }

  const isOwner = order.user.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "admin") {
    res.statusCode = 403;
    throw new Error("Not authorized to cancel this order");
  }

  if (order.status === "cancelled") {
    res.statusCode = 400;
    throw new Error("Order is already cancelled");
  }
  if (order.status === "delivered") {
    res.statusCode = 400;
    throw new Error("Delivered orders cannot be cancelled");
  }

  // restock items
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
  }

  order.status = "cancelled";
  await order.save();

  res.status(200).json({ success: true, message: "Order cancelled", data: order });
});

// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowedStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];

  if (!allowedStatuses.includes(status)) {
    res.statusCode = 400;
    throw new Error(`Status must be one of: ${allowedStatuses.join(", ")}`);
  }

  const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!order) {
    res.statusCode = 404;
    throw new Error("Order not found");
  }

  res.status(200).json({ success: true, message: "Order status updated", data: order });
});

module.exports = {
  placeOrder,
  getMyOrders,
  getAllOrders,
  cancelOrder,
  updateOrderStatus,
};