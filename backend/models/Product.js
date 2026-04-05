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

export default mongoose.model("Product", productSchema);