import { useState , useEffect} from "react";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import { getProducts, setProducts, getUsers, setUsers, getOrders, fmt, uid, setOrders } from "../utils/helpers";
import styles from "./Admin.module.css";

const TABS = [
  { id: "dashboard", label: "📊 Dashboard" },
  { id: "products",  label: "📦 Products"  },
  { id: "users",     label: "👥 Users"     },
  { id: "orders",    label: "🧾 Orders"    },
];

const EMPTY_PRODUCT = { name: "", price: "", category: "mens", image: "", description: "", stock: "10", rating: 4.5, reviews: 0 };

export default function Admin() {
  const { user }         = useAuth();
  const { navigate, toast } = useApp();

  const [tab,      setTab]      = useState("dashboard");
  const [products, setProds]    = useState(getProducts());
  const [users,    setUsers]     = useState([]);
  const [orders,    setOrders]            = useState([]);
  const [newProd,  setNewProd]  = useState(EMPTY_PRODUCT);
  const [editProd, setEditProd] = useState(null);
  const [err,      setErr]      = useState("");

  useEffect(() => {
  fetch("https://smartcart-api-20gg.onrender.com/api/users")
    .then((res) => res.json())
    .then((data) => setUsers(data))
    .catch((err) => console.log(err));
}, []);

useEffect(() => {
  fetch("https://smartcart-api-20gg.onrender.com/api/orders")
    .then((res) => res.json())
    .then((data) => setOrders(data))
    .catch((err) => console.log(err));
}, []);

  /* ── helpers ── */
  const saveProducts = (updated) => { setProducts(updated); setProds(updated); };
  const saveUsers    = (updated) => { setUsers(updated);    setUsrs(updated);  };

  const addProduct = () => {
    if (!newProd.name || !newProd.price || !newProd.category) { setErr("Fill required fields."); return; }
    const p = { id: Date.now(), ...newProd, price: Number(newProd.price), stock: Number(newProd.stock) };
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
    saveProducts(products.map((p) => p.id === editProd.id
      ? { ...editProd, price: Number(editProd.price), stock: Number(editProd.stock) }
      : p
    ));
    setEditProd(null);
    toast("Product updated ✓", "success");
  };

  const deleteUser = (id) => {
    if (!window.confirm("Delete this user? This cannot be undone.")) return;
    saveUsers(users.filter((u) => u.id !== id));
    toast("User deleted", "success");
  };

  /* ── stats ── */
  const revenue = orders.reduce((a, o) => a + o.total, 0);
  const updateOrderStatus = async (orderId, status) => {
  try {
    const res = await fetch(
      `https://smartcart-api-20gg.onrender.com/api/orders/${orderId}`,
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
      prev.map((order) =>
        order._id === orderId ? updated : order
      )
    );
  } catch (error) {
    console.log(error);
  }
};

  return (
    <div className={styles.page}>
      {/* Admin header */}
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
                className={`${styles.tabBtn} ${tab === id ? styles.tabActive : ""}`}
                onClick={() => setTab(id)}
              >
                {label}
              </button>
            ))}
          </nav>

          <div className={styles.headerRight}>
            <button className="btn btn-outline btn-sm" onClick={() => navigate("home")}>← Shop</button>
            <button className="btn btn-ghost btn-sm"   onClick={() => navigate("profile")}>👤 Profile</button>
          </div>
        </div>
      </header>

      <main className={styles.main}>

        {/* ════════════ DASHBOARD ════════════ */}
        {tab === "dashboard" && (
          <div style={{ animation: "fadeUp 0.3s ease" }}>
            <h1 className={styles.pageTitle}>Dashboard Overview</h1>

            <div className={styles.statsGrid}>
              {[
                { icon: "📦", label: "Products",  val: products.length, color: "var(--accent)"  },
                { icon: "👥", label: "Users",      val: users.length,    color: "#60a5fa"        },
                { icon: "🧾", label: "Orders",     val: orders.length,   color: "var(--success)" },
                { icon: "💰", label: "Revenue",    val: fmt(revenue),    color: "var(--gold)"    },
              ].map((c) => (
                <div key={c.label} className={styles.statCard}>
                  <div className={styles.statIcon}>{c.icon}</div>
                  <div className={styles.statVal} style={{ color: c.color }}>{c.val}</div>
                  <div className={styles.statLabel}>{c.label}</div>
                </div>
              ))}
            </div>

            <div className={styles.dashGrid}>
              {/* Recent orders */}
              <div className={styles.dashCard}>
                <h3 className={styles.dashCardTitle}>Recent Orders</h3>
                {orders.length === 0
                  ? <p className={styles.emptyNote}>No orders yet</p>
                  : [...orders].reverse().slice(0, 5).map((o) => (
                    <div key={o.id} className={styles.recentOrder}>
                      <div>
                        <p className={styles.recentOrderId}>{o.id}</p>
                        <p className={styles.recentOrderEmail}>{o.userEmail}</p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ fontWeight: 700, fontSize: "0.9rem" }}>{fmt(o.total)}</p>
                        <span className="badge badge-success" style={{ fontSize: "0.6rem" }}>{o.status}</span>
                      </div>
                    </div>
                  ))
                }
              </div>

              {/* Category breakdown */}
              <div className={styles.dashCard}>
                <h3 className={styles.dashCardTitle}>Products by Category</h3>
                {["mens", "womens", "kids", "accessories"].map((cat) => {
                  const count = products.filter((p) => p.category === cat).length;
                  const pct   = products.length ? Math.round((count / products.length) * 100) : 0;
                  return (
                    <div key={cat} className={styles.catRow}>
                      <div className={styles.catRowTop}>
                        <span style={{ textTransform: "capitalize", fontWeight: 500, fontSize: "0.85rem" }}>{cat}</span>
                        <span style={{ color: "var(--text3)", fontSize: "0.78rem" }}>{count} · {pct}%</span>
                      </div>
                      <div className={styles.barTrack}>
                        <div className={styles.barFill} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ════════════ PRODUCTS ════════════ */}
        {tab === "products" && (
          <div style={{ animation: "fadeUp 0.3s ease" }}>
            <h1 className={styles.pageTitle}>Products ({products.length})</h1>

            {/* Add form */}
            <div className={styles.formCard}>
              <h3 className={styles.formCardTitle}>➕ Add New Product</h3>
              {err && <div className="error-msg">{err}</div>}

              <div className={styles.formGrid}>
                {[["name","Name *","text"],["price","Price (₹) *","number"],["stock","Stock *","number"]].map(([k, l, t]) => (
                  <div key={k} className="field" style={{ margin: 0 }}>
                    <label>{l}</label>
                    <input type={t} placeholder={l} value={newProd[k]} onChange={(e) => setNewProd({ ...newProd, [k]: e.target.value })} />
                  </div>
                ))}
                <div className="field" style={{ margin: 0 }}>
                  <label>Category *</label>
                  <select value={newProd.category} onChange={(e) => setNewProd({ ...newProd, category: e.target.value })}>
                    {["mens", "womens", "kids", "accessories"].map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="field" style={{ margin: 0, gridColumn: "1 / -1" }}>
                  <label>Image URL</label>
                  <input placeholder="https://images.unsplash.com/…" value={newProd.image} onChange={(e) => setNewProd({ ...newProd, image: e.target.value })} />
                </div>
              </div>

              <div className="field" style={{ marginTop: 12, marginBottom: 0 }}>
                <label>Description</label>
                <textarea
                  rows={2}
                  placeholder="Product description…"
                  value={newProd.description}
                  onChange={(e) => setNewProd({ ...newProd, description: e.target.value })}
                  className={styles.textarea}
                />
              </div>

              <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={addProduct}>
                ➕ Add Product
              </button>
            </div>

            {/* Table */}
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr className={styles.thead}>
                    {["Image", "Name", "Category", "Price", "Stock", "Actions"].map((h) => (
                      <th key={h} className={styles.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map((p, i) => (
                    <tr key={p.id} className={styles.tr} style={{ background: i % 2 !== 0 ? "rgba(255,255,255,0.01)" : "transparent" }}>
                      <td className={styles.td}>
                        <img src={p.image} alt="" className={styles.tableImg}
                          onError={(e) => { e.target.src = "https://placehold.co/44x44/1e1e1e/666"; }} />
                      </td>
                      <td className={styles.td} style={{ maxWidth: 200 }}>
                        <span className={styles.truncate}>{p.name}</span>
                      </td>
                      <td className={styles.td}>
                        <span className="badge badge-dim" style={{ textTransform: "capitalize" }}>{p.category}</span>
                      </td>
                      <td className={styles.td}>
                        <span style={{ fontFamily: "var(--font-display)", fontWeight: 700 }}>{fmt(p.price)}</span>
                      </td>
                      <td className={styles.td}>
                        <span className={`badge ${p.stock > 10 ? "badge-success" : p.stock > 0 ? "badge-gold" : "badge-dim"}`}>
                          {p.stock}
                        </span>
                      </td>
                      <td className={styles.td}>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => setEditProd({ ...p })}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => deleteProduct(p.id)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ════════════ USERS ════════════ */}
        {tab === "users" && (
          <div style={{ animation: "fadeUp 0.3s ease" }}>
            <h1 className={styles.pageTitle}>Users ({users.length})</h1>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr className={styles.thead}>
                    {["Avatar", "Name", "Email", "Role", "Joined", "Cart Items", "Orders", "Actions"].map((h) => (
                      <th key={h} className={styles.th}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => {
                    const uOrders = orders.filter((o) => o.userId === u.id || o.userEmail === u.email);
                    const uCart   = JSON.parse(localStorage.getItem(`sc_cart_${u.email}`) || "[]");
                    return (
                      <tr key={u.id} className={styles.tr} style={{ background: i % 2 !== 0 ? "rgba(255,255,255,0.01)" : "transparent" }}>
                        <td className={styles.td}>
                          <div className={styles.userAvatar} style={{ background: u.role === "admin" ? "var(--accent)" : "var(--surface3)" }}>
                            {u.name?.[0]?.toUpperCase() || "?"}
                          </div>
                        </td>
                        <td className={styles.td} style={{ fontWeight: 500 }}>{u.name || "—"}</td>
                        <td className={styles.td} style={{ color: "var(--text2)", fontSize: "0.82rem" }}>{u.email}</td>
                        <td className={styles.td}>
                          <span className={`badge badge-${u.role === "admin" ? "accent" : "dim"}`}>{u.role}</span>
                        </td>
                        <td className={styles.td} style={{ color: "var(--text3)", fontSize: "0.78rem" }}>{u.joined || "—"}</td>
                        <td className={styles.td}>{uCart.length}</td>
                        <td className={styles.td}>{uOrders.length}</td>
                        <td className={styles.td}>
                          {u.role !== "admin" && (
                            <button className="btn btn-danger btn-sm" onClick={() => deleteUser(u.id)}>Delete</button>
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

        {/* ════════════ ORDERS ════════════ */}
        {tab === "orders" && (
          <div style={{ animation: "fadeUp 0.3s ease" }}>
            <h1 className={styles.pageTitle}>All Orders ({orders.length})</h1>
            {orders.length === 0
              ? <p className={styles.emptyNote}>No orders yet.</p>
              : (
                <div className={styles.ordersList}>
                  {[...orders].reverse().map((order) => (
                    <div key={order.id} className={styles.orderCard}>
                      <div className={styles.orderCardTop}>
                        <div>
                          <span className={styles.orderId}>{order.id}</span>
                          <span className={styles.orderDate}>{order.date}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                         <select
  value={order.status}
  onChange={(e) =>
    updateOrderStatus(order._id, e.target.value)
  }
  className="badge badge-success"
  style={{
    border: "none",
    outline: "none",
    cursor: "pointer",
    padding: "6px 10px",
    borderRadius: "8px",
  }}
>
  <option value="Placed">Placed</option>
  <option value="Packed">Packed</option>
  <option value="Shipped">Shipped</option>
  <option value="Delivered">Delivered</option>
  <option value="Cancelled">Cancelled</option>
</select>
                        </div>
                      </div>
                      <div className={styles.orderCardMeta}>
                        <span>👤 {order.userEmail}</span>
                        <span>📦 {order.shipping?.city}, {order.shipping?.state}</span>
                        <span>💳 {order.payment === "cod" ? "Cash on Delivery" : order.payment?.toUpperCase()}</span>
                        <span>🛒 {order.items?.length} item{order.items?.length !== 1 ? "s" : ""}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )
            }
          </div>
        )}
      </main>

      {/* ── Edit product modal ── */}
      {editProd && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setEditProd(null); }}>
          <div className="modal-box">
            <h2 className="modal-title">Edit Product</h2>
            <p className="modal-sub">Update the product details below</p>

            {[["name","Name"],["price","Price (₹)"],["stock","Stock"],["image","Image URL"]].map(([k, l]) => (
              <div key={k} className="field">
                <label>{l}</label>
                <input
                  value={editProd[k] || ""}
                  type={k === "price" || k === "stock" ? "number" : "text"}
                  onChange={(e) => setEditProd({ ...editProd, [k]: e.target.value })}
                />
              </div>
            ))}

            <div className="field">
              <label>Category</label>
              <select value={editProd.category} onChange={(e) => setEditProd({ ...editProd, category: e.target.value })}>
                {["mens", "womens", "kids", "accessories"].map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="field">
              <label>Description</label>
              <textarea
                rows={3}
                value={editProd.description || ""}
                onChange={(e) => setEditProd({ ...editProd, description: e.target.value })}
                className={styles.textarea}
              />
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={saveEdit}>Save Changes</button>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setEditProd(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}