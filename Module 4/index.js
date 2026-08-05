require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/dbConnection");
const { errorHandler, notFound } = require("./middleware/errorHandler");

// Routes
const authenticationRoutes = require("./routes/authenticationRoutes");
const userProfileRoutes = require("./routes/userProfileRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");

const app = express();

// Connect to MongoDB
connectDB();

// Global middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "E-Commerce Backend System API is running",
  });
});

// Mount routes
app.use("/api/auth", authenticationRoutes);
app.use("/api/users", userProfileRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/analytics", analyticsRoutes);

// 404 + centralized error handler (must be last)
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;