import express from "express";
import { 
  getProduct, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} from "../controllers/productController.js";

const ProductRouter = express.Router();

// Defined matching project assignments rules
ProductRouter.get("/getProducts", getProduct);
ProductRouter.post("/addProduct", createProduct);
ProductRouter.put("/updateProduct", updateProduct);
ProductRouter.delete("/deleteProduct", deleteProduct);

export default ProductRouter;
