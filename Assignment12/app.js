import express from "express";
import ProductRouter from "./routes/productRoutes.js";

const app = express();

// Parses incoming JSON request bodies (Essential for Postman/Thunder Client POST/PUT data)
app.use(express.json());

// Main base routing middleware
app.use("/", ProductRouter);

export default app;
