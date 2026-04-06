import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import userRoutes from "./routes/userRoutes.js"
dotenv.config();

const app = express();


app.use(cors({
  origin: (origin, callback) => {
    const allowed = [
      "http://localhost:5173",
      "https://smart-cart-tz7g.vercel.app"
    ];

    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS blocked"));
    }
  },
  credentials: true
}));

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes)
app.use("/api/orders", orderRoutes)
app.use("/api/users", userRoutes)
app.get("/", (req, res) => {
  res.send("SmartCart backend + Atlas 🚀");
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Atlas connected ✅");

    const PORT = process.env.PORT || 8000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB Atlas failed ❌", err.message);
  });