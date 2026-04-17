import { useEffect, useState } from "react";
import Navbar from "../components/Navbar/Navbar";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useDiscount } from "../context/DiscountContext";
import { useNotifications } from "../context/NotificationsContext";
import { useApp } from "../context/AppContext";
import { fmt, getPreBookingCredit, getProductKey } from "../utils/helpers";
import styles from "./Checkout.module.css";

const PAYMENT_OPTIONS = [
  { val: "cod",        label: "💵 Cash on Delivery",    sub: "Pay when your order arrives"        },
  { val: "upi",        label: "📱 UPI / QR Code",       sub: "Pay using UPI apps through Razorpay Test Mode" },
  { val: "card",       label: "💳 Credit / Debit Card", sub: "Pay using test cards through Razorpay" },
  { val: "netbanking", label: "🏦 Net Banking",         sub: "Use Razorpay test banking flow" },
];

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export default function Checkout() {
  const { cart, total, clearCart } = useCart();
  const { user }                   = useAuth();
  const { coupon, getDiscountAmount, removeCoupon } = useDiscount();
  const { pushNotification } = useNotifications();
  const { navigate, toast }        = useApp();
  const savedAddresses = user?.addresses || [];
  const defaultAddress = savedAddresses.find((address) => address.isDefault) || savedAddresses[0] || null;

  const [step, setStep]       = useState(1);
  const [err, setErr]         = useState("");
  const [loading, setLoading] = useState(false);
  const [payment, setPayment] = useState("cod");
  const [preBookings, setPreBookings] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(defaultAddress?.id || "");
  const [shipping, setShipping] = useState({
    name: defaultAddress?.fullName || user?.name || "",
    email: user?.email || "",
    phone: defaultAddress?.phone || user?.phone || "",
    address: defaultAddress?.address || "",
    city: defaultAddress?.city || "",
    state: defaultAddress?.state || "",
    pincode: defaultAddress?.pincode || "",
  });

  const shippingFee = total >= 999 ? 0 : 99;
  const discount    = getDiscountAmount(total, shippingFee);
  const preBookingCredit = getPreBookingCredit(cart, preBookings);
  const tax         = Math.round(total * 0.18);
  const grand       = Math.max(0, total + shippingFee + tax - discount - preBookingCredit);

  if (!cart.length) { navigate("home"); return null; }

  const validateShipping = () => {
    const req = ["name", "email", "phone", "address", "city", "state", "pincode"];
    if (req.some((k) => !shipping[k].trim())) { setErr("Please fill all fields."); return false; }
    if (!/^\d{10}$/.test(shipping.phone))     { setErr("Enter a valid 10-digit phone number."); return false; }
    if (!/^\d{6}$/.test(shipping.pincode))    { setErr("Enter a valid 6-digit PIN code."); return false; }
    return true;
  };

  const API = "https://smartcart-api-2ogq.onrender.com";

  useEffect(() => {
    if (!selectedAddressId) return;

    const selected = savedAddresses.find((address) => address.id === selectedAddressId);
    if (!selected) return;

    setShipping((prev) => ({
      ...prev,
      name: selected.fullName,
      email: user?.email || prev.email,
      phone: selected.phone,
      address: selected.address,
      city: selected.city,
      state: selected.state,
      pincode: selected.pincode,
    }));
  }, [selectedAddressId, savedAddresses, user]);

  useEffect(() => {
    if (!user?.email) return;

    fetch(`${API}/api/prebookings?userEmail=${encodeURIComponent(user.email)}`)
      .then((res) => res.json())
      .then((data) => setPreBookings(Array.isArray(data) ? data : []))
      .catch((error) => console.log("pre-booking fetch error", error));
  }, [user?.email]);

const saveOrder = async (orderData) => {
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

  return data;
};

const buildOrderData = (currentUser, paymentMeta = {}) => ({
  userId: currentUser._id,
  userName: currentUser.name,
  userEmail: currentUser.email,
  shipping,
  paymentMethod: payment,
  paymentStatus: payment === "cod" ? "pending" : "paid",
  items: cart.map((item) => ({
    productId: getProductKey(item),
    name: item.name,
    price: item.price,
    quantity: item.quantity || item.qty,
    image: item.image,
  })),
  subtotal: total,
  shippingFee,
  discount,
  couponCode: coupon?.code || "",
  preBookingCredit,
  tax,
  total: grand,
  status: "Placed",
  razorpayOrderId: paymentMeta.orderId || "",
  razorpayPaymentId: paymentMeta.paymentId || "",
});

const placeOrder = async () => {
  try {
    setLoading(true);

    const currentUser = JSON.parse(localStorage.getItem("sc_user"));

    if (payment !== "cod") {
      const scriptLoaded = await loadRazorpayScript();

      if (!scriptLoaded) {
        throw new Error("Failed to load Razorpay checkout");
      }

      const orderRes = await fetch(`${API}/api/orders/create-razorpay-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: grand * 100,
          currency: "INR",
          receipt: `smartcart_${Date.now()}`,
          notes: {
            customer: currentUser.email,
            selectedPaymentMethod: payment,
          },
        }),
      });

      const orderPayload = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderPayload.message || "Failed to initialize Razorpay");
      }

      await new Promise((resolve, reject) => {
        const razorpay = new window.Razorpay({
          key: orderPayload.key,
          amount: orderPayload.amount,
          currency: orderPayload.currency,
          name: "SmartCart",
          description: "SmartCart Test Payment",
          order_id: orderPayload.orderId,
          theme: { color: "#1e88ff" },
          prefill: {
            name: currentUser.name,
            email: currentUser.email,
            contact: shipping.phone,
          },
          config: {
            display: {
              blocks: {
                preferred: {
                  name: "Pay Using",
                  instruments:
                    payment === "upi"
                      ? [{ method: "upi" }]
                      : payment === "card"
                        ? [{ method: "card" }]
                        : payment === "netbanking"
                          ? [{ method: "netbanking" }]
                          : [],
                },
              },
              sequence: ["block.preferred"],
              preferences: {
                show_default_blocks: true,
              },
            },
          },
          notes: {
            mode: "Test payment only",
          },
          handler: async function (response) {
            try {
              const verifyRes = await fetch(`${API}/api/orders/verify-razorpay-payment`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(response),
              });

              const verifyData = await verifyRes.json();
              if (!verifyRes.ok || !verifyData.verified) {
                throw new Error(verifyData.message || "Payment verification failed");
              }

              const orderData = buildOrderData(currentUser, {
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
              });

              await saveOrder(orderData);
              resolve();
            } catch (error) {
              reject(error);
            }
          },
          modal: {
            ondismiss: function () {
              reject(new Error("Payment cancelled"));
            },
          },
        });

        razorpay.open();
      });
    } else {
      const orderData = buildOrderData(currentUser);
      await saveOrder(orderData);
    }

    localStorage.removeItem(`sc_cart_${currentUser._id}`);
    clearCart();
    if (coupon) {
      removeCoupon();
    }

    toast("🎉 Order placed successfully!", "success");
    pushNotification({
      title: "Order confirmed",
      message: `Your order for ${fmt(grand)} has been placed successfully.`,
      type: "success",
      link: "orders",
    });
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
                {savedAddresses.length > 0 && (
                  <div className={styles.savedAddressBlock}>
                    <div className={styles.savedAddressHeader}>
                      <div>
                        <p className={styles.savedAddressTitle}>Choose a saved address</p>
                        <p className={styles.savedAddressSub}>Select one to autofill the form below.</p>
                      </div>
                      <button className="btn btn-ghost btn-sm" onClick={() => navigate("profile")}>
                        Manage Addresses
                      </button>
                    </div>
                    <div className={styles.savedAddressList}>
                      {savedAddresses.map((address) => (
                        <button
                          key={address.id}
                          className={`${styles.savedAddressCard} ${selectedAddressId === address.id ? styles.savedAddressSelected : ""}`}
                          onClick={() => {
                            setSelectedAddressId(address.id);
                            setErr("");
                          }}
                        >
                          <div className={styles.savedAddressTop}>
                            <strong>{address.label}</strong>
                            {address.isDefault && <span className="badge badge-success">Default</span>}
                          </div>
                          <p>{address.fullName} · {address.phone}</p>
                          <p>{address.address}, {address.city}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
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
                        onChange={(e) => {
                          setSelectedAddressId("");
                          setShipping({ ...shipping, [k]: e.target.value });
                          setErr("");
                        }}
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
                  {coupon && (
                    <div className={styles.reviewItem}>
                      <span>Coupon ({coupon.code})</span>
                      <span>-{fmt(discount)}</span>
                    </div>
                  )}
                  {preBookingCredit > 0 && (
                    <div className={styles.reviewItem}>
                      <span>Pre-booking credit</span>
                      <span>-{fmt(preBookingCredit)}</span>
                    </div>
                  )}
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

            {[["Subtotal", fmt(total)], ["Shipping", shippingFee === 0 ? "FREE" : fmt(shippingFee)], ...(discount > 0 ? [["Discount", `-${fmt(discount)}`]] : []), ...(preBookingCredit > 0 ? [["Pre-booking credit", `-${fmt(preBookingCredit)}`]] : []), ["Tax (18%)", fmt(tax)]].map(([l, v]) => (
              <div key={l} className={styles.summaryRow}>
                <span>{l}</span>
                <span style={{ color: v === "FREE" ? "var(--success)" : l === "Discount" || l === "Pre-booking credit" ? "var(--success)" : undefined }}>{v}</span>
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
