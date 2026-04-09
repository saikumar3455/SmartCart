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
