import { useState } from "react";
import Navbar from "../components/Navbar/Navbar";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import { fmt, uid, getOrders, setOrders } from "../utils/helpers";
import styles from "./Checkout.module.css";

const PAYMENT_OPTIONS = [
  { val: "cod",        label: "💵 Cash on Delivery",    sub: "Pay when your order arrives"        },
  { val: "upi",        label: "📱 UPI / QR Code",        sub: "Google Pay, PhonePe, Paytm"         },
  { val: "card",       label: "💳 Credit / Debit Card",  sub: "Visa, Mastercard, RuPay"            },
  { val: "netbanking", label: "🏦 Net Banking",          sub: "All major banks supported"           },
];

export default function Checkout() {
  const { cart, total, clearCart } = useCart();
  const { user }                   = useAuth();
  const { navigate, toast }        = useApp();

  const [step, setStep]       = useState(1);
  const [err, setErr]         = useState("");
  const [loading, setLoading] = useState(false);
  const [payment, setPayment] = useState("cod");
  const [shipping, setShipping] = useState({
    name: user?.name || "", email: user?.email || "",
    phone: "", address: "", city: "", state: "", pincode: "",
  });

  const shippingFee = total >= 999 ? 0 : 99;
  const tax         = Math.round(total * 0.18);
  const grand       = total + shippingFee + tax;

  if (!cart.length) { navigate("home"); return null; }

  const validateShipping = () => {
    const req = ["name", "email", "phone", "address", "city", "state", "pincode"];
    if (req.some((k) => !shipping[k].trim())) { setErr("Please fill all fields."); return false; }
    if (!/^\d{10}$/.test(shipping.phone))     { setErr("Enter a valid 10-digit phone number."); return false; }
    if (!/^\d{6}$/.test(shipping.pincode))    { setErr("Enter a valid 6-digit PIN code."); return false; }
    return true;
  };

  const API = "https://smartcart-api-2ogq.onrender.com";

const placeOrder = async () => {
  try {
    setLoading(true);

    const currentUser = JSON.parse(localStorage.getItem("sc_user"));

    const orderData = {
      userId: currentUser._id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      shipping,
      paymentMethod: payment,
      items: cart.map((item) => ({
        productId: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity || item.qty,
        image: item.image,
      })),
      subtotal: total,
      shippingFee,
      tax,
      total: grand,
      status: "Placed",
    };

    const res = await fetch(`${API}/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderData),
    });

    const text = await res.text();
    const data = text ? JSON.parse(text) : {};

    if (!res.ok) {
      throw new Error(data.message || "Order failed");
    }

    console.log("✅ Order saved:", data);

    localStorage.removeItem(`sc_cart_${currentUser._id}`);
    clearCart();

    toast("🎉 Order placed successfully!", "success");
    navigate("success");
  } catch (error) {
    console.error("❌ ORDER ERROR:", error);
    setErr(error.message || "Order failed");
  } finally {
    setLoading(false);
  }
};

  const SHIPPING_FIELDS = [
    ["name",    "Full Name",  "John Doe",         "text"],
    ["email",   "Email",      "you@example.com",  "email"],
    ["phone",   "Phone",      "10-digit number",  "tel"],
    ["address", "Address",    "Street, Area",     "text"],
    ["city",    "City",       "Mumbai",           "text"],
    ["state",   "State",      "Maharashtra",      "text"],
    ["pincode", "PIN Code",   "400001",           "text"],
  ];

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.container}>
        <button className="btn btn-ghost" onClick={() => navigate("cart")}>← Back to Cart</button>
        <h1 className={styles.pageTitle}>Checkout</h1>

        {/* Step indicators */}
        <div className={styles.steps}>
          {[["1","📦","Shipping"], ["2","💳","Payment"], ["3","✅","Review"]].map(([n, icon, label], i) => (
            <div
              key={n}
              className={`${styles.step} ${step === +n ? styles.stepActive : ""} ${step > +n ? styles.stepDone : ""}`}
            >
              <div className={styles.stepNum}>{step > +n ? "✓" : icon}</div>
              <span className={styles.stepLabel}>{label}</span>
            </div>
          ))}
        </div>

        <div className={styles.content}>
          {/* Main form */}
          <div className={styles.formBox}>
            {err && <div className="error-msg">{err}</div>}

            {/* ── STEP 1: Shipping ── */}
            {step === 1 && (
              <div style={{ animation: "fadeUp 0.3s ease" }}>
                <h2 className={styles.stepTitle}>Shipping Details</h2>
                <div className={styles.fieldGrid}>
                  {SHIPPING_FIELDS.map(([k, l, ph, t]) => (
                    <div
                      key={k}
                      className="field"
                      style={{ gridColumn: k === "address" ? "1 / -1" : undefined, margin: 0 }}
                    >
                      <label>{l}</label>
                      <input
                        type={t}
                        placeholder={ph}
                        value={shipping[k]}
                        onChange={(e) => { setShipping({ ...shipping, [k]: e.target.value }); setErr(""); }}
                      />
                    </div>
                  ))}
                </div>
                <button
                  className="btn btn-primary"
                  style={{ width: "100%", padding: 14, marginTop: 20 }}
                  onClick={() => { if (validateShipping()) { setStep(2); setErr(""); } }}
                >
                  Continue to Payment →
                </button>
              </div>
            )}

            {/* ── STEP 2: Payment ── */}
            {step === 2 && (
              <div style={{ animation: "fadeUp 0.3s ease" }}>
                <h2 className={styles.stepTitle}>Payment Method</h2>
                <div className={styles.paymentOptions}>
                  {PAYMENT_OPTIONS.map(({ val, label, sub }) => (
                    <div
                      key={val}
                      className={`${styles.payOption} ${payment === val ? styles.paySelected : ""}`}
                      onClick={() => setPayment(val)}
                    >
                      <div className={`${styles.radio} ${payment === val ? styles.radioSelected : ""}`}>
                        {payment === val && <div className={styles.radioDot} />}
                      </div>
                      <div>
                        <p className={styles.payLabel}>{label}</p>
                        <p className={styles.paySub}>{sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className={styles.stepActions}>
                  <button className="btn btn-outline" style={{ flex: 1, padding: 13 }} onClick={() => setStep(1)}>← Back</button>
                  <button className="btn btn-primary" style={{ flex: 2, padding: 13 }} onClick={() => setStep(3)}>Review Order →</button>
                </div>
              </div>
            )}

            {/* ── STEP 3: Review ── */}
            {step === 3 && (
              <div style={{ animation: "fadeUp 0.3s ease" }}>
                <h2 className={styles.stepTitle}>Review Your Order</h2>

                <div className={styles.reviewBlock}>
                  <p className={styles.reviewLabel}>📦 Shipping to</p>
                  <p className={styles.reviewMain}>{shipping.name}</p>
                  <p className={styles.reviewSub}>{shipping.address}, {shipping.city}, {shipping.state} – {shipping.pincode}</p>
                  <p className={styles.reviewSub}>📞 {shipping.phone}</p>
                </div>

                <div className={styles.reviewBlock}>
                  <p className={styles.reviewLabel}>💳 Payment</p>
                  <p className={styles.reviewMain}>
                    {PAYMENT_OPTIONS.find((o) => o.val === payment)?.label}
                  </p>
                </div>

                <div className={styles.reviewBlock}>
                  <p className={styles.reviewLabel}>🛒 Items ({cart.length})</p>
                  {cart.map((item) => (
                    <div key={item.id} className={styles.reviewItem}>
                      <span>{item.name} × {item.qty}</span>
                      <span>{fmt(item.price * item.qty)}</span>
                    </div>
                  ))}
                </div>

                <div className={styles.stepActions}>
                  <button className="btn btn-outline" style={{ flex: 1, padding: 13 }} onClick={() => setStep(2)}>← Back</button>
                  <button
                    className="btn btn-primary"
                    style={{ flex: 2, padding: 13, fontSize: "0.95rem" }}
                    onClick={placeOrder}
                    disabled={loading}
                  >
                    {loading ? <span className="spinner" /> : `Place Order · ${fmt(grand)}`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Mini order summary */}
          <div className={styles.miniSummary}>
            <h3 className={styles.summaryTitle}>Order Total</h3>

            {cart.slice(0, 4).map((item) => (
              <div key={item.id} className={styles.miniItem}>
                <img
                  src={item.image}
                  alt=""
                  className={styles.miniImg}
                  onError={(e) => { e.target.src = "https://placehold.co/44x44/1e1e1e/666"; }}
                />
                <div className={styles.miniInfo}>
                  <p className={styles.miniName}>{item.name}</p>
                  <p className={styles.miniQty}>×{item.qty}</p>
                </div>
                <p className={styles.miniPrice}>{fmt(item.price * item.qty)}</p>
              </div>
            ))}
            {cart.length > 4 && (
              <p className={styles.moreItems}>+{cart.length - 4} more items</p>
            )}

            <hr className="divider" />

            {[["Subtotal", fmt(total)], ["Shipping", shippingFee === 0 ? "FREE" : fmt(shippingFee)], ["Tax (18%)", fmt(tax)]].map(([l, v]) => (
              <div key={l} className={styles.summaryRow}>
                <span>{l}</span>
                <span style={{ color: v === "FREE" ? "var(--success)" : undefined }}>{v}</span>
              </div>
            ))}

            <hr className="divider" />
            <div className={styles.grandTotal}>
              <span>Total</span>
              <span style={{ color: "var(--accent)" }}>{fmt(grand)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}