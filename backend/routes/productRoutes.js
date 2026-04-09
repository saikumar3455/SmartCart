import express from "express";
import Product from "../models/Product.js";

const router = express.Router();

const mapDummyProduct = (p) => {
  let mappedCategory = "accessories";
  const cat = (p.category || "").toLowerCase();

  if (
    cat.includes("mens") ||
    cat.includes("shirts") ||
    cat.includes("shoes") ||
    cat.includes("tops")
  ) {
    mappedCategory = "mens";
  } else if (
    cat.includes("womens") ||
    cat.includes("dress") ||
    cat.includes("beauty") ||
    cat.includes("skincare")
  ) {
    mappedCategory = "womens";
  } else if (cat.includes("kids") || cat.includes("baby")) {
    mappedCategory = "kids";
  }

  return {
    id: p.id,
    name: p.title,
    price: Math.round(p.price * 83),
    category: mappedCategory,
    image: p.thumbnail,
    description: p.description,
    rating: p.rating,
    reviews: Array.isArray(p.reviews) ? p.reviews.length : Number(p.reviews) || 0,
    stock: p.stock,
  };
};

/* GET ALL PRODUCTS */
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const product =
      (await Product.findById(id).catch(() => null)) ||
      (await Product.findOne({ id: Number(id) }));

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
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
    const products = Array.isArray(req.body) ? req.body : [];

    if (products.length === 0) {
      return res.status(400).json({
        message: "No products provided for import",
        count: 0,
      });
    }

    // existing product names
    const existing = await Product.find({}, "name");
    const existingNames = new Set(existing.map((p) => p.name));

    const seenInBatch = new Set();

    // only fresh products
    const newProducts = products.filter((p) => {
      if (!p?.name) return false;
      if (existingNames.has(p.name)) return false;
      if (seenInBatch.has(p.name)) return false;

      seenInBatch.add(p.name);
      return true;
    });

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
      totalReceived: products.length,
    });
  } catch (error) {
    console.error("IMPORT ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

router.post("/import-dummy", async (req, res) => {
  try {
    const response = await fetch("https://dummyjson.com/products?limit=200");

    if (!response.ok) {
      return res.status(502).json({
        message: "Failed to fetch dummy products",
      });
    }

    const data = await response.json();
    const incomingProducts = Array.isArray(data?.products)
      ? data.products.map(mapDummyProduct)
      : [];

    if (incomingProducts.length === 0) {
      return res.status(400).json({
        message: "No dummy products received",
        count: 0,
      });
    }

    const existing = await Product.find({}, "name");
    const existingNames = new Set(existing.map((p) => p.name));
    const seenInBatch = new Set();

    const newProducts = incomingProducts.filter((p) => {
      if (!p?.name) return false;
      if (existingNames.has(p.name)) return false;
      if (seenInBatch.has(p.name)) return false;

      seenInBatch.add(p.name);
      return true;
    });

    if (newProducts.length === 0) {
      return res.json({
        message: "No new dummy products to import",
        count: 0,
        totalReceived: incomingProducts.length,
      });
    }

    const saved = await Product.insertMany(newProducts);

    res.json({
      message: `${saved.length} dummy products imported`,
      count: saved.length,
      totalReceived: incomingProducts.length,
    });
  } catch (error) {
    console.error("DUMMY IMPORT ERROR:", error);
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
