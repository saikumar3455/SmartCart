export const fmt = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

export const uid = () => Math.random().toString(36).slice(2, 10).toUpperCase();

export const stars = (r) =>
  Array.from({ length: 5 }, (_, i) => (
    <span key={i} style={{ color: i < Math.floor(r) ? "#f5a623" : "#333", fontSize: "0.72rem" }}>
      ★
    </span>
  ));

export const getProductKey = (product) => String(product?._id || product?.id || "");

export const normalizeCartItem = (product) => ({
  ...product,
  id: getProductKey(product),
});

// localStorage helpers
export const getProducts = () => JSON.parse(localStorage.getItem("sc_products") || "[]");
export const setProducts = (p) => localStorage.setItem("sc_products", JSON.stringify(p));

export const getUsers = () => JSON.parse(localStorage.getItem("sc_users") || "[]");
export const setUsers = (u) => localStorage.setItem("sc_users", JSON.stringify(u));

export const getOrders = () => JSON.parse(localStorage.getItem("sc_orders") || "[]");
export const setOrders = (o) => localStorage.setItem("sc_orders", JSON.stringify(o));

export const getCart = (u) => JSON.parse(localStorage.getItem(`sc_cart_${u}`) || "[]");
export const saveCart = (u, c) => localStorage.setItem(`sc_cart_${u}`, JSON.stringify(c));

export const getWishlist = (u) => JSON.parse(localStorage.getItem(`sc_wishlist_${u}`) || "[]");
export const saveWishlist = (u, w) => localStorage.setItem(`sc_wishlist_${u}`, JSON.stringify(w));

export const getRecentViews = (u) => JSON.parse(localStorage.getItem(`sc_recent_${u}`) || "[]");
export const saveRecentViews = (u, items) =>
  localStorage.setItem(`sc_recent_${u}`, JSON.stringify(items));

export const getCompareItems = (u) => JSON.parse(localStorage.getItem(`sc_compare_${u}`) || "[]");
export const saveCompareItems = (u, items) =>
  localStorage.setItem(`sc_compare_${u}`, JSON.stringify(items));

export const getNotifications = (u) => JSON.parse(localStorage.getItem(`sc_notifications_${u}`) || "[]");
export const saveNotifications = (u, items) =>
  localStorage.setItem(`sc_notifications_${u}`, JSON.stringify(items));

export const getSavedForLater = (u) => JSON.parse(localStorage.getItem(`sc_saved_${u}`) || "[]");
export const saveSavedForLater = (u, items) =>
  localStorage.setItem(`sc_saved_${u}`, JSON.stringify(items));

export const getCouponState = (u) => JSON.parse(localStorage.getItem(`sc_coupon_${u}`) || "null");
export const saveCouponState = (u, coupon) =>
  localStorage.setItem(`sc_coupon_${u}`, JSON.stringify(coupon));

export const COUPONS = {
  WELCOME15: {
    code: "WELCOME15",
    label: "15% off for new shoppers",
    type: "percent",
    value: 15,
    minSubtotal: 1499,
  },
  SAVE10: {
    code: "SAVE10",
    label: "10% off on fashion picks",
    type: "percent",
    value: 10,
    minSubtotal: 999,
  },
  APP200: {
    code: "APP200",
    label: "Flat Rs.200 off above Rs.2499",
    type: "flat",
    value: 200,
    minSubtotal: 2499,
  },
  FREESHIP: {
    code: "FREESHIP",
    label: "Free shipping on this order",
    type: "shipping",
    value: 99,
    minSubtotal: 699,
  },
};

export const getCouponDiscount = (coupon, subtotal, shipping = 0) => {
  if (!coupon || subtotal < (coupon.minSubtotal || 0)) return 0;

  if (coupon.type === "percent") {
    return Math.round(subtotal * (coupon.value / 100));
  }

  if (coupon.type === "shipping") {
    return Math.min(shipping, coupon.value || shipping);
  }

  return Math.min(subtotal, coupon.value || 0);
};

export const getPreBookingCredit = (cartItems = [], bookings = []) => {
  let totalCredit = 0;

  cartItems.forEach((item) => {
    let remainingQty = Number(item.quantity || item.qty || 1);
    const matchingBookings = bookings
      .filter((booking) => booking.status === "active" || booking.status === "partial")
      .filter((booking) => String(booking.productId) === String(item._id || item.id || item.productId));

    matchingBookings.forEach((booking) => {
      if (remainingQty <= 0 || Number(booking.remainingQuantity || 0) <= 0) return;

      const consumedQty = Math.min(remainingQty, Number(booking.remainingQuantity || 0));
      const perUnitAdvance = Number(booking.remainingAdvanceAmount || 0) / Number(booking.remainingQuantity || 1);
      totalCredit += Math.round(perUnitAdvance * consumedQty);
      remainingQty -= consumedQty;
    });
  });

  return totalCredit;
};

export const getUrgencyMeta = (product) => {
  const stock = Number(product?.stock || 0);
  const reviews = Number(product?.reviews || 0);
  const cartCount = Math.max(2, Math.min(18, Math.round((reviews || 12) / 6) || 4));

  if (stock <= 0) {
    return {
      tone: "soldout",
      badge: "Out of stock",
      message: "This item is currently unavailable.",
    };
  }

  if (stock <= 3) {
    return {
      tone: "critical",
      badge: `Only ${stock} left`,
      message: `${cartCount} shoppers are checking this right now.`,
    };
  }

  if (stock <= 8) {
    return {
      tone: "low",
      badge: "Low stock",
      message: `Selling fast. Only ${stock} pieces left.`,
    };
  }

  if (reviews >= 80) {
    return {
      tone: "hot",
      badge: "Popular pick",
      message: `${cartCount} carts added in the last 24 hours.`,
    };
  }

  return {
    tone: "fresh",
    badge: "Just in demand",
    message: `${cartCount} people viewed this today.`,
  };
};
