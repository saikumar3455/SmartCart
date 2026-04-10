import PreBooking from "../models/PreBooking.js";
import Product from "../models/Product.js";

export const PREBOOKING_ADVANCE_RATE = 0.1;
export const PREBOOKING_MAX_DAYS = 7;

export async function expireExpiredPreBookings() {
  const now = new Date();
  const expiredBookings = await PreBooking.find({
    status: { $in: ["active", "partial"] },
    expiresAt: { $lt: now },
    remainingQuantity: { $gt: 0 },
  });

  if (expiredBookings.length === 0) {
    return [];
  }

  for (const booking of expiredBookings) {
    await Product.findByIdAndUpdate(booking.productId, {
      $inc: { stock: booking.remainingQuantity },
    });

    booking.forfeitedAmount = booking.remainingAdvanceAmount;
    booking.remainingAdvanceAmount = 0;
    booking.remainingQuantity = 0;
    booking.status = "expired";
    await booking.save();
  }

  return expiredBookings;
}

export function getAdvanceAmount(price, quantity) {
  return Math.round(Number(price) * PREBOOKING_ADVANCE_RATE * Number(quantity));
}
