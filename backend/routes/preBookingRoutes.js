import express from "express";
import Product from "../models/Product.js";
import PreBooking from "../models/PreBooking.js";
import {
  PREBOOKING_MAX_DAYS,
  expireExpiredPreBookings,
  getAdvanceAmount,
} from "../utils/preBookingUtils.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    await expireExpiredPreBookings();

    const query = {};
    if (req.query.userEmail) {
      query.userEmail = String(req.query.userEmail).toLowerCase();
    }

    const bookings = await PreBooking.find(query).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    await expireExpiredPreBookings();

    const { userId, userEmail, productId, quantity = 1, expiresAt } = req.body;

    if (!userId || !userEmail || !productId || !expiresAt) {
      return res.status(400).json({ message: "Missing required pre-booking fields" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const qty = Number(quantity);
    if (!Number.isInteger(qty) || qty <= 0) {
      return res.status(400).json({ message: "Quantity must be at least 1" });
    }

    if (product.stock < qty) {
      return res.status(400).json({ message: "Not enough stock available for pre-booking" });
    }

    const expiryDate = new Date(expiresAt);
    const now = new Date();
    const maxDate = new Date(now);
    maxDate.setDate(maxDate.getDate() + PREBOOKING_MAX_DAYS);

    if (Number.isNaN(expiryDate.getTime()) || expiryDate <= now) {
      return res.status(400).json({ message: "Select a valid future expiry date" });
    }

    if (expiryDate > maxDate) {
      return res.status(400).json({ message: `Pre-booking can only be held for up to ${PREBOOKING_MAX_DAYS} days` });
    }

    const existing = await PreBooking.findOne({
      userEmail: String(userEmail).toLowerCase(),
      productId,
      status: { $in: ["active", "partial"] },
    });

    if (existing) {
      return res.status(400).json({ message: "You already have an active pre-booking for this product" });
    }

    const advanceAmount = getAdvanceAmount(product.price, qty);

    const booking = await PreBooking.create({
      userId,
      userEmail: String(userEmail).toLowerCase(),
      productId,
      productName: product.name,
      productImage: product.image,
      productPrice: product.price,
      quantity: qty,
      remainingQuantity: qty,
      advanceAmount,
      remainingAdvanceAmount: advanceAmount,
      appliedAdvanceAmount: 0,
      expiresAt: expiryDate,
      status: "active",
    });

    product.stock -= qty;
    await product.save();

    res.status(201).json({
      message: `Pre-booking confirmed for ${qty} item${qty !== 1 ? "s" : ""}`,
      booking,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
