import express from "express";
import Product from "../models/Product.js";

const router = express.Router();

/* GET ALL PRODUCTS */
router.get("/", async (req, res) => {
  const product = await Product.find();
  res.json(product);
});
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
router.put("/:id", async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
// DELETE
router.delete("/:id", async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted" });
});

/* ADD PRODUCT */
router.post("/", async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json(product);
});
router.post("/import", async (req, res) => {
  try {
    const products = req.body;

    const saved = await Product.insertMany(products, {
      ordered: false,
    });

    res.json(saved);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;