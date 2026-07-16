import path from "path";
import fs from "fs/promises";

// Safe resolve mapping to the data folder structure
const dataPath = path.resolve("data/products.json");

// Helper reusable file readers
async function readData() {
  const rawData = await fs.readFile(dataPath, "utf-8");
  return JSON.parse(rawData);
}

// Helper reusable file writers
async function writeData(data) {
  await fs.writeFile(dataPath, JSON.stringify(data, null, 2), "utf-8");
}

// 1. GET ALL PRODUCTS
async function getProduct(req, res) {
  try {
    const data = await readData();
    if (!data || data.length === 0) {
      return res.json({ message: "No product found!. Yet to create one" });
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// 2. CREATE PRODUCT (POST)
async function createProduct(req, res) {
  try {
    const { productId, productName, description, Stock } = req.body;

    if (!productId || !productName) {
      return res.status(400).json({ message: "Product ID and Name are required" });
    }

    const data = await readData();

    if (data.some(p => p.productId === Number(productId))) {
      return res.status(400).json({ message: "Product ID already exists" });
    }

    const newProduct = {
      productId: Number(productId),
      productName,
      description: description || "",
      Stock: Stock ?? true
    };

    data.push(newProduct);
    await writeData(data);

    res.status(201).json({ message: "Product added successfully", product: newProduct });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// 3. UPDATE PRODUCT (PUT)
async function updateProduct(req, res) {
  try {
    const { productId, description } = req.body;

    if (!productId || !description) {
      return res.status(400).json({ message: "Product ID and new description are required" });
    }

    const data = await readData();
    const productIndex = data.findIndex(p => p.productId === Number(productId));

    if (productIndex === -1) {
      return res.status(404).json({ message: "Product not found" });
    }

    data[productIndex].description = description;
    await writeData(data);

    res.json({ message: "Product updated successfully", product: data[productIndex] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// 4. DELETE PRODUCT (DELETE)
async function deleteProduct(req, res) {
  try {
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    let data = await readData();
    const productExists = data.some(p => p.productId === Number(productId));

    if (!productExists) {
      return res.status(404).json({ message: "Product not found" });
    }

    data = data.filter(p => p.productId !== Number(productId));
    await writeData(data);

    res.json({ message: `Product with ID ${productId} deleted successfully` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export { getProduct, createProduct, updateProduct, deleteProduct };