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
