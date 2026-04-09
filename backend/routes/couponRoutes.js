import express from "express";
import Coupon from "../models/Coupon.js";

const router = express.Router();

const DEFAULT_COUPONS = [
  { code: "WELCOME15", label: "15% off for new shoppers", type: "percent", value: 15, minSubtotal: 1499, isActive: true },
  { code: "SAVE10", label: "10% off on fashion picks", type: "percent", value: 10, minSubtotal: 999, isActive: true },
  { code: "APP200", label: "Flat Rs.200 off above Rs.2499", type: "flat", value: 200, minSubtotal: 2499, isActive: true },
  { code: "FREESHIP", label: "Free shipping on this order", type: "shipping", value: 99, minSubtotal: 699, isActive: true },
];

router.get("/", async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/seed", async (req, res) => {
  try {
    if (await Coupon.countDocuments()) {
      return res.json({ message: "Coupons already seeded" });
    }

    const seeded = await Coupon.insertMany(DEFAULT_COUPONS);
    res.status(201).json(seeded);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const payload = {
      ...req.body,
      code: String(req.body.code || "").trim().toUpperCase(),
    };
    const coupon = await Coupon.create(payload);
    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const payload = {
      ...req.body,
      code: req.body.code ? String(req.body.code).trim().toUpperCase() : undefined,
    };

    const updated = await Coupon.findByIdAndUpdate(req.params.id, payload, { new: true });
    if (!updated) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ message: "Coupon deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
