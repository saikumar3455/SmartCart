import express from "express";
import Product from "../models/Product.js";

const router = express.Router();

/* GET ALL PRODUCTS */
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ADD PRODUCT */
router.post("/", async (req, res) => {
  try {
    const product = await Product.create(req.body);
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* SEED PRODUCTS */
router.post("/seed", async (req, res) => {
  try {
    const products = req.body;
    await Product.deleteMany();
    const saved = await Product.insertMany(products);
    res.json(saved);
  } catch (error) {
    res.status(500).json({ message: "Seed failed" });
  }
});

/* IMPORT PRODUCTS (duplicate safe) */
router.post("/import", async (req, res) => {
  try {
    const products = req.body;

    // existing product names
    const existing = await Product.find({}, "name");
    const existingNames = new Set(existing.map((p) => p.name));

    // only fresh products
    const newProducts = products.filter(
      (p) => !existingNames.has(p.name)
    );

    if (newProducts.length === 0) {
      return res.json({
        message: "No new products to import",
        count: 0,
      });
    }

    const saved = await Product.insertMany(newProducts);

    res.json({
      message: `${saved.length} products imported`,
      count: saved.length,
    });
  } catch (error) {
    console.error("IMPORT ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

/* UPDATE PRODUCT */
router.put("/:id", async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* DELETE PRODUCT */
router.delete("/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;