import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    
    },
      userName: String,
    userEmail: String,
    shipping: {
      name: String,
      email: String,
      phone: String,
      address: String,
      city: String,
      state: String,
      pincode: String,
    },
    paymentMethod: String,
    paymentStatus: {
      type: String,
      default: "pending",
    },
    couponCode: String,
    discount: Number,
    razorpayOrderId: String,
    razorpayPaymentId: String,
    
    items: [
      {
        productId: {
          type: String,
        },
        name: String,
        price: Number,
        quantity: Number,
        image: String,
      },
    ],
    subtotal: Number,
    shippingFee: Number,
    tax: Number,
    total: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      default: "Placed",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
