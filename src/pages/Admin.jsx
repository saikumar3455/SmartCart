import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import { getProducts, setProducts, fmt } from "../utils/helpers";
import styles from "./Admin.module.css";

const TABS = [
  { id: "dashboard", label: "📊 Dashboard" },
  { id: "products", label: "📦 Products" },
  { id: "users", label: "👥 Users" },
  { id: "orders", label: "🧾 Orders" },
];

const EMPTY_PRODUCT = {
  name: "",
  price: "",
  category: "mens",
  image: "",
  description: "",
  stock: "10",
  rating: 4.5,
  reviews: 0,
};

export default function Admin() {
  const { user } = useAuth();
  const { navigate, toast } = useApp();

  const [tab, setTab] = useState("dashboard");
 const [products, setProds] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [newProd, setNewProd] = useState(EMPTY_PRODUCT);
  const [editProd, setEditProd] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    fetch("https://smartcart-api-2ogq.onrender.com/api/users")
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
  fetch("https://smartcart-api-2ogq.onrender.com/api/products")
    .then((res) => res.json())
    .then((data) => {
      console.log("products:", data);
      setProds(data);
    })
    .catch((err) => console.log("product fetch error", err));
}, []);
  useEffect(() => {
    fetch("https://smartcart-api-2ogq.onrender.com/api/orders")
      .then((res) => res.json())
      .then((data) => setOrders(data))
      .catch((err) => console.log(err));
  }, []);

  const saveProducts = (updated) => {
    setProducts(updated);
    setProds(updated);
  };

  const saveUsers = (updated) => {
    setUsers(updated);
  };

  const addProduct = () => {
    if (!newProd.name || !newProd.price || !newProd.category) {
      setErr("Fill required fields.");
      return;
    }

    const p = {
      id: Date.now(),
      ...newProd,
      price: Number(newProd.price),
      stock: Number(newProd.stock),
    };

    saveProducts([...products, p]);
    setNewProd(EMPTY_PRODUCT);
    setErr("");
    toast("Product added ✓", "success");
  };

  const deleteProduct = (id) => {
    saveProducts(products.filter((p) => p.id !== id));
    toast("Product deleted", "success");
  };

  const saveEdit = () => {
    saveProducts(
      products.map((p) =>
        p.id === editProd.id
          ? {
              ...editProd,
              price: Number(editProd.price),
              stock: Number(editProd.stock),
            }
          : p
      )
    );

    setEditProd(null);
    toast("Product updated ✓", "success");
  };

  const deleteUser = (id) => {
    if (!window.confirm("Delete this user? This cannot be undone.")) return;
    saveUsers(users.filter((u) => u._id !== id));
    toast("User deleted", "success");
  };

  const revenue = orders.reduce((a, o) => a + (o.total || 0), 0);

  const updateOrderStatus = async (orderId, status) => {
    try {
      const res = await fetch(
        `https://smartcart-api-2ogq.onrender.com/api/orders/${orderId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        }
      );

      const updated = await res.json();

      setOrders((prev) =>
        prev.map((order) => (order._id === orderId ? updated : order))
      );

      toast("Order status updated ✓", "success");
    } catch (error) {
      console.log(error);
      toast("Failed to update order", "error");
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}>S</div>
            <span className={styles.logoText}>
              Smart<em>Cart</em>
              <span className={styles.adminLabel}> Admin</span>
            </span>
          </div>

          <nav className={styles.tabs}>
            {TABS.map(({ id, label }) => (
              <button
                key={id}
                className={`${styles.tabBtn} ${
                  tab === id ? styles.tabActive : ""
                }`}
                onClick={() => setTab(id)}
              >
                {label}
              </button>
            ))}
          </nav>

          <div className={styles.headerRight}>
            <button
              className="btn btn-outline btn-sm"
              onClick={() => navigate("home")}
            >
              ← Shop
            </button>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => navigate("profile")}
            >
              👤 Profile
            </button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {tab === "dashboard" && (
          <div style={{ animation: "fadeUp 0.3s ease" }}>
            <h1 className={styles.pageTitle}>Dashboard Overview</h1>

            <div className={styles.statsGrid}>
              {[
                {
                  icon: "📦",
                  label: "Products",
                  val: products.length,
                  color: "var(--accent)",
                },
                {
                  icon: "👥",
                  label: "Users",
                  val: users.length,
                  color: "#60a5fa",
                },
                {
                  icon: "🧾",
                  label: "Orders",
                  val: orders.length,
                  color: "var(--success)",
                },
                {
                  icon: "💰",
                  label: "Revenue",
                  val: fmt(revenue),
                  color: "var(--gold)",
                },
              ].map((c) => (
                <div key={c.label} className={styles.statCard}>
                  <div className={styles.statIcon}>{c.icon}</div>
                  <div
                    className={styles.statVal}
                    style={{ color: c.color }}
                  >
                    {c.val}
                  </div>
                  <div className={styles.statLabel}>{c.label}</div>
                </div>
              ))}
            </div>

            <div className={styles.dashGrid}>
              <div className={styles.dashCard}>
                <h3 className={styles.dashCardTitle}>Recent Orders</h3>
                {orders.length === 0 ? (
                  <p className={styles.emptyNote}>No orders yet</p>
                ) : (
                  [...orders]
                    .reverse()
                    .slice(0, 5)
                    .map((o) => (
                      <div key={o._id} className={styles.recentOrder}>
                        <div>
                          <p className={styles.recentOrderId}>
                            #{o._id.slice(-6)}
                          </p>
                          <p className={styles.recentOrderEmail}>
                            {o.userEmail}
                          </p>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <p style={{ fontWeight: 700, fontSize: "0.9rem" }}>
                            {fmt(o.total)}
                          </p>
                          <span
                            className="badge badge-success"
                            style={{ fontSize: "0.6rem" }}
                          >
                            {o.status}
                          </span>
                        </div>
                      </div>
                    ))
                )}
              </div>

              <div className={styles.dashCard}>
                <h3 className={styles.dashCardTitle}>
                  Products by Category
                </h3>
                {["mens", "womens", "kids", "accessories"].map((cat) => {
                  const count = products.filter(
                    (p) => p.category === cat
                  ).length;
                  const pct = products.length
                    ? Math.round((count / products.length) * 100)
                    : 0;

                  return (
                    <div key={cat} className={styles.catRow}>
                      <div className={styles.catRowTop}>
                        <span
                          style={{
                            textTransform: "capitalize",
                            fontWeight: 500,
                            fontSize: "0.85rem",
                          }}
                        >
                          {cat}
                        </span>
                        <span
                          style={{
                            color: "var(--text3)",
                            fontSize: "0.78rem",
                          }}
                        >
                          {count} · {pct}%
                        </span>
                      </div>
                      <div className={styles.barTrack}>
                        <div
                          className={styles.barFill}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {tab === "users" && (
          <div style={{ animation: "fadeUp 0.3s ease" }}>
            <h1 className={styles.pageTitle}>Users ({users.length})</h1>

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr className={styles.thead}>
                    {[
                      "Avatar",
                      "Name",
                      "Email",
                      "Role",
                      "Orders",
                      "Actions",
                    ].map((h) => (
                      <th key={h} className={styles.th}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {users.map((u, i) => {
                    const uOrders = orders.filter(
                      (o) => o.userEmail === u.email
                    );

                    return (
                      <tr
                        key={u._id}
                        className={styles.tr}
                        style={{
                          background:
                            i % 2 !== 0
                              ? "rgba(255,255,255,0.01)"
                              : "transparent",
                        }}
                      >
                        <td className={styles.td}>
                          <div className={styles.userAvatar}>
                            {u.name?.[0]?.toUpperCase() || "?"}
                          </div>
                        </td>
                        <td className={styles.td}>{u.name}</td>
                        <td className={styles.td}>{u.email}</td>
                        <td className={styles.td}>{u.role}</td>
                        <td className={styles.td}>{uOrders.length}</td>
                        <td className={styles.td}>
                          {u.role !== "admin" && (
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => deleteUser(u._id)}
                            >
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "orders" && (
          <div style={{ animation: "fadeUp 0.3s ease" }}>
            <h1 className={styles.pageTitle}>All Orders ({orders.length})</h1>

            {orders.length === 0 ? (
              <p className={styles.emptyNote}>No orders yet.</p>
            ) : (
              <div className={styles.ordersList}>
                {[...orders].reverse().map((order) => (
                  <div key={order._id} className={styles.orderCard}>
                    <div className={styles.orderCardTop}>
                      <div>
                        <span className={styles.orderId}>
                          #{order._id.slice(-6)}
                        </span>
                        <span className={styles.orderDate}>
                          {new Date(order.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <select
                        value={order.status}
                        onChange={(e) =>
                          updateOrderStatus(order._id, e.target.value)
                        }
                        className="badge badge-success"
                      >
                        <option value="Placed">Placed</option>
                        <option value="Packed">Packed</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>

                    <div className={styles.orderCardMeta}>
                      <span>👤 {order.userEmail}</span>
                     <div>
  {order.items?.map((item, i) => (
    <div key={i} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
      <img
        src={item.image}
        alt={item.name}
        width="40"
        height="40"
        style={{ borderRadius: "8px", objectFit: "cover" }}
      />
      <span>{item.name}</span>
      <span>₹{item.price}</span>
    </div>
  ))}
</div>
                      <span>
                        💳{" "}
                        {order.payment === "cod"
                          ? "Cash on Delivery"
                          : order.payment?.toUpperCase()}
                      </span>
                      <span>
                        🛒 {order.items?.length} item
                        {order.items?.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}