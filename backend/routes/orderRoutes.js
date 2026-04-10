import express from "express";
import crypto from "crypto";
import Order from "../models/Order.js";
import PreBooking from "../models/PreBooking.js";
import { expireExpiredPreBookings } from "../utils/preBookingUtils.js";

const router = express.Router();

router.post("/create-razorpay-order", async (req, res) => {
  try {
    const { amount, currency = "INR", receipt, notes = {} } = req.body;

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return res.status(500).json({ message: "Razorpay keys are not configured on the server" });
    }

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(
          `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`
        ).toString("base64")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount,
        currency,
        receipt,
        notes,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        message: data.error?.description || "Failed to create Razorpay order",
      });
    }

    res.json({
      orderId: data.id,
      amount: data.amount,
      currency: data.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/verify-razorpay-payment", async (req, res) => {
  try {
    const {
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature,
    } = req.body;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    if (expectedSignature !== signature) {
      return res.status(400).json({ verified: false, message: "Payment signature verification failed" });
    }

    res.json({ verified: true });
  } catch (error) {
    res.status(500).json({ verified: false, message: error.message });
  }
});

// create order
router.post("/", async (req, res) => {
  try {
    await expireExpiredPreBookings();

    const payload = { ...req.body };
    let preBookingCredit = 0;

    if (payload.userEmail && Array.isArray(payload.items) && payload.items.length > 0) {
      const activeBookings = await PreBooking.find({
        userEmail: String(payload.userEmail).toLowerCase(),
        status: { $in: ["active", "partial"] },
        remainingQuantity: { $gt: 0 },
      }).sort({ expiresAt: 1 });

      for (const item of payload.items) {
        let remainingQty = Number(item.quantity || item.qty || 1);
        const matchingBookings = activeBookings.filter(
          (booking) => String(booking.productId) === String(item.productId)
        );

        for (const booking of matchingBookings) {
          if (remainingQty <= 0 || booking.remainingQuantity <= 0) continue;

          const consumedQty = Math.min(remainingQty, booking.remainingQuantity);
          const perUnitAdvance = booking.remainingQuantity
            ? booking.remainingAdvanceAmount / booking.remainingQuantity
            : 0;
          const consumedAdvance = Math.round(perUnitAdvance * consumedQty);

          booking.remainingQuantity -= consumedQty;
          booking.remainingAdvanceAmount = Math.max(0, booking.remainingAdvanceAmount - consumedAdvance);
          booking.appliedAdvanceAmount += consumedAdvance;
          booking.status = booking.remainingQuantity === 0 ? "converted" : "partial";

          preBookingCredit += consumedAdvance;
          remainingQty -= consumedQty;
          await booking.save();
        }
      }
    }

    payload.preBookingCredit = preBookingCredit;
    payload.total = Math.max(0, Number(payload.total || 0));

    const order = await Order.create(payload);

    if (preBookingCredit > 0) {
      await PreBooking.updateMany(
        {
          userEmail: String(payload.userEmail).toLowerCase(),
          status: "converted",
          convertedOrderId: null,
        },
        { $set: { convertedOrderId: order._id } }
      );
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// get all orders
router.get("/", async (req, res) => {
  try {
    await expireExpiredPreBookings();
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    await expireExpiredPreBookings();
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { status } = req.body;

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate("userId", "name email");

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
export default router;
