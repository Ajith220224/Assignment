// server.js
// Entry point for the Express backend. Loads env vars, connects to MongoDB
// via Mongoose, and mounts the API routes.

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// Load environment variables from .env
dotenv.config();

// Connect to MongoDB (see config/db.js)
connectDB();

const app = express();

// Configure dynamic CORS for local dev + production Vercel deployment
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  process.env.FRONTEND_URL, // Set this in your Render dashboard (e.g., https://your-app.vercel.app)
].filter(Boolean); // Filters out undefined values if FRONTEND_URL is not set locally

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (Postman, curl, server-to-server) or matched origins
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      /^https:\/\/.*\.vercel\.app$/.test(origin) // Allows all Vercel preview deployment links
    ) {
      callback(null, true);
    } else {
      callback(new Error("Blocked by CORS policy"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Middleware
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions)); // Enable preflight handling across all routes
app.use(express.json()); // parse JSON request bodies
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/customers", require("./routes/customerRoutes"));

// Simple health check route
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "CRM API is running" });
});

// Basic 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Basic centralized error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res
    .status(err.status || 500)
    .json({ message: err.message || "Server error" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
