import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    id: Number,
    name: String,
    price: Number,
    category: String,
    image: String,
    description: String,
    rating: Number,
    reviews: Number,
    stock: Number,
  },
  { timestamps: true }
);
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

export default mongoose.model("Product", productSchema);