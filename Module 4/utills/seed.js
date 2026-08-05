// Run with: npm run seed
// Populates the database with a sample admin user, a sample user, and sample products.
require("dotenv").config();
const bcrypt = require("bcryptjs");
const connectDB = require("../config/dbConnection");
const User = require("../models/user");
const Product = require("../models/product");

const seed = async () => {
  await connectDB();

  console.log("Clearing existing Users and Products...");
  await User.deleteMany();
  await Product.deleteMany();

  const salt = await bcrypt.genSalt(10);

  console.log("Creating sample users...");
  const admin = await User.create({
    name: "Admin User",
    email: "admin@example.com",
    password: await bcrypt.hash("Admin@0110", salt),
    role: "admin",
  });

  await User.create({
    name: "Ajith",
    email: "ajith@example.com",
    password: await bcrypt.hash("Ajith@0110", salt),
    role: "user",
  });

  console.log("Creating sample products...");
  await Product.insertMany([
    {
      name: "Pro Wireless Gaming Headset",
      description: "Noise-isolating surround sound wireless gaming headset with mic",
      price: 129.99,
      category: "Electronics",
      brand: "Razer",
      stock: 50,
      tags: ["headset", "audio", "gaming", "electronics"],
      ratingsAverage: 4.5,
      createdBy: admin._id,
    },
    {
      name: "Mechanical Keyboard RGB",
      description: "Hot-swappable mechanical keyboard with RGB backlighting",
      price: 89.99,
      category: "Electronics",
      brand: "Logitech",
      stock: 40,
      tags: ["keyboard", "gaming", "electronics"],
      ratingsAverage: 4.3,
      createdBy: admin._id,
    },
    {
      name: "Running Shoes",
      description: "Lightweight breathable running shoes for daily training",
      price: 59.99,
      category: "Footwear",
      brand: "Nike",
      stock: 100,
      tags: ["shoes", "running", "sportswear"],
      ratingsAverage: 4.1,
      createdBy: admin._id,
    },
  ]);

  console.log("Seed data created successfully!");
  console.log("Admin login -> email: admin@example.com | password: Admin@0110");
  console.log("User login  -> email: ajith@example.com  | password: Ajith@0110");
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});