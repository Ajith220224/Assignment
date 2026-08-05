const Product = require("../models/product");
const { asyncHandler } = require("../middleware/errorHandler");

// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, category, brand, stock, tags } = req.body;

  if (!name || !description || price === undefined || !category) {
    res.statusCode = 400;
    throw new Error("name, description, price and category are required");
  }

  const product = await Product.create({
    name,
    description,
    price,
    category,
    brand,
    stock,
    tags,
    createdBy: req.user._id,
  });

  res.status(201).json({ success: true, message: "Product created", data: product });
});

// @route   GET /api/products
// @access  Public
// Supports: ?search=keyword  ?category=Electronics  ?minPrice=10&maxPrice=200
// ?sort=price  or  ?sort=-price   ?page=1&limit=10
const getProducts = asyncHandler(async (req, res) => {
  const { search, category, minPrice, maxPrice, sort, page = 1, limit = 10, brand } = req.query;

  const query = {};

  if (search) {
    // Text search across name, description, tags (requires text index - see model)
    query.$text = { $search: search };
  }

  if (category) {
    query.category = { $regex: new RegExp(category, "i") };
  }

  if (brand) {
    query.brand = { $regex: new RegExp(brand, "i") };
  }

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  let sortOption = { createdAt: -1 };
  if (sort) {
    const sortField = sort.startsWith("-") ? sort.substring(1) : sort;
    const sortDirection = sort.startsWith("-") ? -1 : 1;
    sortOption = { [sortField]: sortDirection };
  }

  const pageNum = Math.max(Number(page), 1);
  const limitNum = Math.max(Number(limit), 1);
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(query).sort(sortOption).skip(skip).limit(limitNum),
    Product.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    count: products.length,
    total,
    page: pageNum,
    totalPages: Math.ceil(total / limitNum),
    data: products,
  });
});

// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.statusCode = 404;
    throw new Error("Product not found");
  }

  // Track view for the logged-in user (used later by recommendation engine)
  if (req.user) {
    const User = require("../models/user");
    await User.findByIdAndUpdate(req.user._id, {
      $addToSet: { viewedProducts: product._id },
    });
  }

  res.status(200).json({ success: true, data: product });
});

// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    res.statusCode = 404;
    throw new Error("Product not found");
  }

  res.status(200).json({ success: true, message: "Product updated", data: product });
});

// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) {
    res.statusCode = 404;
    throw new Error("Product not found");
  }
  res.status(200).json({ success: true, message: "Product deleted" });
});

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};