import express from "express";
import Product from "../models/Product.js";

const router = express.Router();

const FOOD_PATTERN =
  /grocer|grocery|food|drink|beverage|snack|meal|coffee|tea|juice|soda|cola|chips|chocolate|cookie|biscuit|rice|oil|masala|spice|sauce|noodle|pasta|bread|milk|cheese|butter|fruit|vegetable|honey/i;

const TARGET_DUMMY_COUNTS = {
  mens: 50,
  womens: 50,
  kids: 40,
};

const getMappedCategory = (rawCategory = "") => {
  const cat = rawCategory.toLowerCase();

  if (
    cat.includes("vehicle") ||
    cat.includes("car") ||
    cat.includes("motorcycle") ||
    cat.includes("automotive")
  ) {
    return null;
  }

  if (
    cat.includes("grocer") ||
    cat.includes("grocery") ||
    cat.includes("food") ||
    cat.includes("drink") ||
    cat.includes("beverage")
  ) {
    return "food";
  }

  if (
    cat.includes("mens") ||
    cat.includes("shirts") ||
    cat.includes("shoes") ||
    cat.includes("tops")
  ) {
    return "mens";
  }

  if (
    cat.includes("womens") ||
    cat.includes("dress") ||
    cat.includes("beauty") ||
    cat.includes("skincare")
  ) {
    return "womens";
  }

  if (cat.includes("kids") || cat.includes("baby")) {
    return "kids";
  }

  return "accessories";
};

const mapDummyProduct = (p) => {
  const mappedCategory = getMappedCategory(p.category || "");

  if (!mappedCategory || mappedCategory === "food") {
    return null;
  }

  return {
    id: p.id,
    source: "dummyjson",
    externalSourceId: p.id,
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

const buildCuratedDummyProducts = (products) => {
  const grouped = {
    mens: products.filter((product) => product.category === "mens"),
    womens: products.filter((product) => product.category === "womens"),
    kids: products.filter((product) => product.category === "kids"),
    accessories: products.filter((product) => product.category === "accessories"),
  };

  const pickedKeys = new Set();
  const curated = [];

  ["mens", "womens", "kids"].forEach((category) => {
    grouped[category].slice(0, TARGET_DUMMY_COUNTS[category]).forEach((product) => {
      const key = `${product.source}-${product.externalSourceId}`;
      if (pickedKeys.has(key)) return;
      pickedKeys.add(key);
      curated.push(product);
    });
  });

  grouped.accessories.forEach((product) => {
    const key = `${product.source}-${product.externalSourceId}`;
    if (pickedKeys.has(key)) return;
    pickedKeys.add(key);
    curated.push(product);
  });

  products.forEach((product) => {
    if (curated.length >= 200) return;
    const key = `${product.source}-${product.externalSourceId}`;
    if (pickedKeys.has(key)) return;
    pickedKeys.add(key);
    curated.push(product);
  });

  return curated.slice(0, 200);
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
    const rawProducts = Array.isArray(data?.products) ? data.products : [];
    const incomingProducts = rawProducts.map(mapDummyProduct).filter(Boolean);
    const curatedProducts = buildCuratedDummyProducts(incomingProducts);
    const dummyNames = rawProducts.map((product) => product.title).filter(Boolean);

    await Product.deleteMany({
      $or: [
        { source: "dummyjson" },
        { name: { $in: dummyNames } },
      ],
    });

    const existing = await Product.find({}, "name");
    const existingNames = new Set(existing.map((p) => p.name));
    const seenInBatch = new Set();

    const newProducts = curatedProducts.filter((p) => {
      if (!p?.name) return false;
      if (existingNames.has(p.name)) return false;
      if (seenInBatch.has(p.name)) return false;

      seenInBatch.add(p.name);
      return true;
    });

    if (newProducts.length === 0) {
      return res.status(400).json({
        message: "No curated dummy products available to import",
        count: 0,
      });
    }

    const saved = await Product.insertMany(newProducts);
    const categoryCounts = saved.reduce((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1;
      return acc;
    }, {});

    res.json({
      message: `${saved.length} curated dummy products imported`,
      count: saved.length,
      totalReceived: curatedProducts.length,
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
