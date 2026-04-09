import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import { fmt } from "../utils/helpers";
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
  const API = "https://smartcart-api-2ogq.onrender.com";

  const [tab, setTab] = useState("dashboard");
 const [products, setProds] = useState([]);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [newProd, setNewProd] = useState(EMPTY_PRODUCT);
  const [editProd, setEditProd] = useState(null);
  const [err, setErr] = useState("");
  const [importingDummy, setImportingDummy] = useState(false);
  const [cleaningCars, setCleaningCars] = useState(false);
  const [movingFood, setMovingFood] = useState(false);

  const loadProducts = async () => {
    const res = await fetch(`${API}/api/products`);
    const data = await res.json();
    console.log("products:", data);
    const safeProducts = Array.isArray(data)
      ? data.filter((product) => product.category !== "cars" && product.category !== "vehicles")
      : [];
    setProds(safeProducts);
  };

  useEffect(() => {
    fetch(`${API}/api/users`)
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch((err) => console.log(err));
  }, []);

  useEffect(() => {
  loadProducts().catch((err) => console.log("product fetch error", err));
}, []);
  useEffect(() => {
    fetch(`${API}/api/orders`)
      .then((res) => res.json())
      .then((data) => setOrders(data))
      .catch((err) => console.log(err));
  }, []);

  

  const saveUsers = (updated) => {
    setUsers(updated);
  };

 const addProduct = async () => {
  if (!newProd.name || !newProd.price || !newProd.category) {
    setErr("Fill required fields.");
    return;
  }

  try {
    await fetch(
      `${API}/api/products`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...newProd,
          price: Number(newProd.price),
          stock: Number(newProd.stock),
        }),
      }
    );

    await loadProducts();

    setNewProd(EMPTY_PRODUCT);
    setErr("");
    toast("Product added ✓", "success");
  } catch (error) {
    console.log(error);
    toast("Failed to add product", "error");
  }
};

  const deleteProduct = async (id) => {
  try {
    await fetch(
      `${API}/api/products/${id}`,
      {
        method: "DELETE",
      }
    );

    setProds((prev) =>
      prev.filter((p) => (p._id || p.id) !== id)
    );

    toast("Product deleted ✓", "success");
  } catch (error) {
    console.log(error);
    toast("Failed to delete product", "error");
  }
};
const saveEdit = async () => {
  try {
    const res = await fetch(
      `${API}/api/products/${editProd._id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editProd),
      }
    );

    if (!res.ok) throw new Error("Update route not found");

    const updated = await res.json();

    setProds((prev) =>
      prev.map((p) => (p._id === updated._id ? updated : p))
    );

    setEditProd(null);
    toast("Product updated ✓", "success");
  } catch (error) {
    console.log(error);
    toast("Update failed", "error");
  }
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
        `${API}/api/orders/${orderId}`,
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

  const importDummyProducts = async () => {
    try {
      setImportingDummy(true);

      const res = await fetch(`${API}/api/products/import-dummy`, {
        method: "POST",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Dummy import failed");
      }

      await loadProducts();
      toast(data.message || "Dummy products imported ✓", "success");
    } catch (error) {
      console.log(error);
      toast(error.message || "Failed to import dummy products", "error");
    } finally {
      setImportingDummy(false);
    }
  };

  const cleanupCars = async () => {
    try {
      setCleaningCars(true);
      const res = await fetch(`${API}/api/products/cleanup-cars`, {
        method: "DELETE",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Vehicle cleanup failed");
      }

      await loadProducts();
      toast(data.message || "Vehicle products removed", "success");
    } catch (error) {
      console.log(error);
      toast(error.message || "Failed to remove vehicle products", "error");
    } finally {
      setCleaningCars(false);
    }
  };

  const recategorizeFood = async () => {
    try {
      setMovingFood(true);
      const res = await fetch(`${API}/api/products/recategorize-food`, {
        method: "PUT",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Food recategorization failed");
      }

      await loadProducts();
      toast(data.message || "Food products moved successfully", "success");
    } catch (error) {
      console.log(error);
      toast(error.message || "Failed to move food products", "error");
    } finally {
      setMovingFood(false);
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
                {["mens", "womens", "kids", "accessories", "food"].map((cat) => {
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
       {tab === "products" && (
  <div style={{ animation: "fadeUp 0.3s ease" }}>
    <h1 className={styles.pageTitle}>
      Products ({products.length})
    </h1>
<div style={{ marginBottom: "16px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
  <button
    className="btn btn-outline"
    onClick={importDummyProducts}
    disabled={importingDummy}
  >
    {importingDummy ? "Importing Dummy Products..." : "Import 200 Dummy Products"}
  </button>
  <button
    className="btn btn-outline"
    onClick={cleanupCars}
    disabled={cleaningCars}
  >
    {cleaningCars ? "Removing Vehicle Products..." : "Remove Vehicle Products"}
  </button>
  <button
    className="btn btn-outline"
    onClick={recategorizeFood}
    disabled={movingFood}
  >
    {movingFood ? "Moving Food Products..." : "Move Food To Food Category"}
  </button>
</div>
{editProd && (
  <div
    style={{
      marginBottom: "24px",
      padding: "24px",
      border: "1px solid #e5e7eb",
      borderRadius: "18px",
      background: "#fff",
      boxShadow: "0 8px 20px rgba(0,0,0,0.06)",
    }}
  >
    <h2 style={{ marginBottom: "16px" }}>✏️ Edit Product</h2>

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "12px",
      }}
    >
      <input
        placeholder="Product Name"
        value={editProd.name}
        onChange={(e) =>
          setEditProd({ ...editProd, name: e.target.value })
        }
        style={{ padding: "12px", borderRadius: "10px" }}
      />

      <input
        placeholder="Price"
        type="number"
        value={editProd.price}
        onChange={(e) =>
          setEditProd({ ...editProd, price: e.target.value })
        }
        style={{ padding: "12px", borderRadius: "10px" }}
      />

      <select
        value={editProd.category}
        onChange={(e) =>
          setEditProd({ ...editProd, category: e.target.value })
        }
        style={{ padding: "12px", borderRadius: "10px" }}
      >
        <option value="mens">Mens</option>
        <option value="womens">Womens</option>
        <option value="kids">Kids</option>
        <option value="accessories">Accessories</option>
        <option value="food">Food</option>
      </select>

      <input
        placeholder="Image URL"
        value={editProd.image}
        onChange={(e) =>
          setEditProd({ ...editProd, image: e.target.value })
        }
        style={{ padding: "12px", borderRadius: "10px" }}
      />

      <textarea
        placeholder="Description"
        value={editProd.description}
        onChange={(e) =>
          setEditProd({
            ...editProd,
            description: e.target.value,
          })
        }
        rows={3}
        style={{
          padding: "12px",
          borderRadius: "10px",
          gridColumn: "span 2",
        }}
      />

      {editProd.image && (
        <div style={{ gridColumn: "span 2" }}>
          <img
            src={editProd.image}
            alt={editProd.name}
            style={{
              width: "120px",
              height: "120px",
              objectFit: "cover",
              borderRadius: "12px",
              border: "1px solid #ddd",
            }}
          />
        </div>
      )}

      <button
        className="btn btn-primary"
        onClick={saveEdit}
        style={{
          gridColumn: "span 2",
          padding: "14px",
          borderRadius: "12px",
          fontWeight: "700",
        }}
      >
        💾 Save Changes
      </button>
    </div>
  </div>
)}
<div
  style={{
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "12px",
    marginBottom: "24px",
    padding: "20px",
    border: "1px solid #e5e7eb",
    borderRadius: "16px",
    background: "#fff",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
  }}
>
  <input
    placeholder="Product Name"
    value={newProd.name}
    onChange={(e) => setNewProd({ ...newProd, name: e.target.value })}
    style={{ padding: "12px", borderRadius: "10px", border: "1px solid #d1d5db" }}
  />

  <input
    placeholder="Price"
    type="number"
    value={newProd.price}
    onChange={(e) => setNewProd({ ...newProd, price: e.target.value })}
    style={{ padding: "12px", borderRadius: "10px", border: "1px solid #d1d5db" }}
  />

  <select
    value={newProd.category}
    onChange={(e) => setNewProd({ ...newProd, category: e.target.value })}
    style={{ padding: "12px", borderRadius: "10px", border: "1px solid #d1d5db" }}
  >
    <option value="mens">Mens</option>
    <option value="womens">Womens</option>
    <option value="kids">Kids</option>
    <option value="accessories">Accessories</option>
    <option value="food">Food</option>
  </select>

  <input
    placeholder="Stock"
    type="number"
    value={newProd.stock}
    onChange={(e) => setNewProd({ ...newProd, stock: e.target.value })}
    style={{ padding: "12px", borderRadius: "10px", border: "1px solid #d1d5db" }}
  />

  <input
    placeholder="Image URL"
    value={newProd.image}
    onChange={(e) => setNewProd({ ...newProd, image: e.target.value })}
    style={{
      padding: "12px",
      borderRadius: "10px",
      border: "1px solid #d1d5db",
      gridColumn: "span 2",
    }}
  />

  <textarea
    placeholder="Description"
    value={newProd.description}
    onChange={(e) => setNewProd({ ...newProd, description: e.target.value })}
    rows={3}
    style={{
      padding: "12px",
      borderRadius: "10px",
      border: "1px solid #d1d5db",
      gridColumn: "span 2",
    }}
  />

  <button
    className="btn btn-primary"
    onClick={addProduct}
    style={{
      gridColumn: "span 2",
      padding: "14px",
      borderRadius: "12px",
      fontWeight: "700",
      fontSize: "1rem",
    }}
  >
    ➕ Add Product
  </button>
</div>


    {products.length === 0 ? (
      <p className={styles.emptyNote}>No products found.</p>
    ) : (
      <div className={styles.ordersList}>
        {products.map((p) => (
          <div key={p._id || p.id} className={styles.orderCard}>
            <div
              style={{
                display: "flex",
                gap: "12px",
                alignItems: "center",
              }}
            >
              <img
                src={p.image}
                alt={p.name}
                width="60"
                height="60"
                style={{
                  borderRadius: "10px",
                  objectFit: "cover",
                }}
              />

              <div style={{ flex: 1 }}>
                <h3 style={{ margin: 0 }}>{p.name}</h3>
                <p style={{ margin: "4px 0", opacity: 0.7 }}>
                  {p.category}
                </p>
                <p style={{ fontWeight: "bold" }}>₹{p.price}</p>
                <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
    <button
      className="btn btn-outline btn-sm"
      onClick={() => setEditProd(p)}
    >
      ✏️ Edit
    </button>

    <button
      className="btn btn-danger btn-sm"
      onClick={() => deleteProduct(p._id)}
    >
      🗑 Delete
    </button>
  </div>
</div>
                
              </div>
              
            </div>
         
        ))}
      </div>
    )}
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
