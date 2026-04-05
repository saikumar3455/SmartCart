import express from "express";
import Product from "../models/Product.js";

const router = express.Router();

/* GET ALL PRODUCTS */
router.get("/", async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

/* ADD PRODUCT */
router.post("/", async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json(product);
});

export default router;