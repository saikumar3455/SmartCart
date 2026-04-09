import express from "express";
import Product from "../models/Product.js";
import CURATED_DUMMY_PRODUCTS from "../data/curatedDummyProducts.js";

const router = express.Router();

const FOOD_PATTERN =
  /grocer|grocery|food|drink|beverage|snack|meal|coffee|tea|juice|soda|cola|chips|chocolate|cookie|biscuit|rice|oil|masala|spice|sauce|noodle|pasta|bread|milk|cheese|butter|fruit|vegetable|honey/i;

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
    await Product.deleteMany({
      $or: [
        { source: "dummyjson" },
        { source: "curated-catalog" },
      ],
    });

    const existing = await Product.find({}, "name");
    const existingNames = new Set(existing.map((p) => p.name));
    const seenInBatch = new Set();

    const newProducts = CURATED_DUMMY_PRODUCTS.filter((p) => {
      if (!p?.name) return false;
      if (existingNames.has(p.name)) return false;
      if (seenInBatch.has(p.name)) return false;

      seenInBatch.add(p.name);
      return true;
    });

    if (newProducts.length === 0) {
      return res.status(400).json({
        message: "No curated catalog products available to import",
        count: 0,
      });
    }

    const saved = await Product.insertMany(newProducts);
    const categoryCounts = saved.reduce((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    }, {});

    res.json({
      message: `${saved.length} curated catalog products imported`,
      count: saved.length,
      totalReceived: CURATED_DUMMY_PRODUCTS.length,
      categories: categoryCounts,
    });
  } catch (error) {
    console.error("DUMMY IMPORT ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

router.delete("/cleanup-cars", async (req, res) => {
  try {
    const result = await Product.deleteMany({
      $or: [
        { category: { $in: ["cars", "vehicles", "automotive", "motorcycle"] } },
        { name: /car|vehicle|motorcycle/i },
        { description: /car|vehicle|motorcycle/i },
      ],
    });

    res.json({
      message: `${result.deletedCount} vehicle products removed`,
      count: result.deletedCount,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/recategorize-food", async (req, res) => {
  try {
    const result = await Product.updateMany(
      {
        $or: [
          { category: { $in: ["accessories", "beauty", "groceries"] } },
          { name: FOOD_PATTERN },
          { description: FOOD_PATTERN },
        ],
      },
      [
        {
          $set: {
            category: {
              $cond: [
                {
                  $or: [
                    { $regexMatch: { input: { $toLower: { $ifNull: ["$name", ""] } }, regex: "grocer|grocery|food|drink|beverage|snack|meal|coffee|tea|juice|soda|cola|chips|chocolate|cookie|biscuit|rice|oil|masala|spice|sauce|noodle|pasta|bread|milk|cheese|butter|fruit|vegetable|honey" } },
                    { $regexMatch: { input: { $toLower: { $ifNull: ["$description", ""] } }, regex: "grocer|grocery|food|drink|beverage|snack|meal|coffee|tea|juice|soda|cola|chips|chocolate|cookie|biscuit|rice|oil|masala|spice|sauce|noodle|pasta|bread|milk|cheese|butter|fruit|vegetable|honey" } },
                  ],
                },
                "food",
                "$category",
              ],
            },
          },
        },
      ]
    );

    res.json({
      message: `${result.modifiedCount} products moved to food`,
      count: result.modifiedCount,
    });
  } catch (error) {
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
