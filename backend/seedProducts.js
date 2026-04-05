import mongoose from "mongoose";
import dotenv from "dotenv";
import Product from "./models/Product.js";
import SEED_PRODUCTS from "../src/data/products.js";

dotenv.config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    try {
      await Product.deleteMany();
      await Product.insertMany(SEED_PRODUCTS);

      console.log("Products seeded successfully ✅");
      process.exit();
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  })
  .catch((err) => console.log(err));