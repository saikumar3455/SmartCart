import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar/Navbar";
import { useCart } from "../context/CartContext";
import { useApp } from "../context/AppContext";
import { fmt } from "../utils/helpers";
import styles from "./OrderDetail.module.css";

const TIMELINE = ["Placed", "Packed", "Shipped", "Delivered"];

export default function OrderDetail() {
  const { addItemsToCart } = useCart();
  const { page, navigate, toast } = useApp();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const orderId = page.startsWith("orders/") ? page.replace("orders/", "") : "";

  useEffect(() => {
    if (!orderId) {
      setError("Order not found.");
      setLoading(false);
      return;
    }

    const loadOrder = async () => {
      try {
        setLoading(true);
        const res = await fetch(`https://smartcart-api-2ogq.onrender.com/api/orders/${orderId}`);
        const contentType = res.headers.get("content-type") || "";
        const raw = await res.text();
        const data = contentType.includes("application/json")
          ? JSON.parse(raw)
          : { message: "Order details are not available yet on the deployed backend." };

        if (!res.ok) {
          throw new Error(data.message || "Order not found");
        }

        setOrder(data);
        setError("");
      } catch (err) {
        setError(err.message || "Order not found");
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId]);

  const statusIndex = useMemo(() => {
    const currentStatus = order?.status || "Placed";
    const index = TIMELINE.indexOf(currentStatus);
    return index >= 0 ? index : 0;
  }, [order]);

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.container}>
        <button className="btn btn-ghost" onClick={() => navigate("orders")}>← Back to Orders</button>

        {loading ? (
          <div className={styles.stateCard}>Loading order details...</div>
        ) : error || !order ? (
          <div className={styles.stateCard}>
            <h2>Order unavailable</h2>
            <p>{error || "We couldn't load this order."}</p>
            <button className="btn btn-primary" onClick={() => navigate("orders")}>View Orders</button>
          </div>
        ) : (
          <>
            <div className={styles.hero}>
              <div>
                <p className={styles.orderLabel}>Order</p>
                <h1 className={styles.title}>#{order._id.slice(-6)}</h1>
                <p className={styles.orderMeta}>
                  Placed on {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div className={styles.heroRight}>
                <span className="badge badge-success">{order.status}</span>
                <p className={styles.total}>{fmt(order.total)}</p>
                <button
                  className={`btn btn-primary ${styles.reorderBtn}`}
                  onClick={() => {
                    addItemsToCart(order.items || []);
                    toast("Items from this order were added to cart", "success");
                    navigate("cart");
                  }}
                >
                  Reorder All
                </button>
              </div>
            </div>

            <div className={styles.timeline}>
              {TIMELINE.map((step, index) => {
                const active = index <= statusIndex;
                return (
                  <div key={step} className={styles.timelineItem}>
                    <div className={`${styles.timelineDot} ${active ? styles.timelineDotActive : ""}`}>
                      {active ? "✓" : index + 1}
                    </div>
                    <p className={`${styles.timelineText} ${active ? styles.timelineTextActive : ""}`}>{step}</p>
                    {index < TIMELINE.length - 1 && (
                      <div className={`${styles.timelineLine} ${index < statusIndex ? styles.timelineLineActive : ""}`} />
                    )}
                  </div>
                );
              })}
            </div>

            <div className={styles.grid}>
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Items</h2>
                <div className={styles.items}>
                  {order.items?.map((item, index) => (
                    <div key={index} className={styles.item}>
                      <img
                        src={item.image}
                        alt={item.name}
                        className={styles.itemImage}
                        onError={(e) => {
                          e.target.src = `https://placehold.co/80x80/1e1e1e/666?text=${encodeURIComponent(item.name)}`;
                        }}
                      />
                      <div className={styles.itemInfo}>
                        <h3>{item.name}</h3>
                        <p>Qty: {item.quantity || item.qty || 1}</p>
                      </div>
                      <p className={styles.itemPrice}>{fmt(item.price)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.sideCol}>
                <div className={styles.card}>
                  <h2 className={styles.cardTitle}>Delivery Address</h2>
                  <p className={styles.copyStrong}>{order.shipping?.name || order.userName}</p>
                  <p className={styles.copy}>{order.shipping?.phone || "Phone unavailable"}</p>
                  <p className={styles.copy}>
                    {order.shipping?.address
                      ? `${order.shipping.address}, ${order.shipping.city}, ${order.shipping.state} - ${order.shipping.pincode}`
                      : "Shipping details unavailable for this order."}
                  </p>
                </div>

                <div className={styles.card}>
                  <h2 className={styles.cardTitle}>Payment Summary</h2>
                  <div className={styles.summaryRow}>
                    <span>Payment</span>
                    <span>
                      {order.paymentMethod === "cod"
                        ? "Cash on Delivery"
                        : order.paymentMethod === "upi"
                          ? "UPI / QR Code"
                          : order.paymentMethod === "card"
                            ? "Credit / Debit Card"
                            : order.paymentMethod === "netbanking"
                              ? "Net Banking"
                          : order.paymentMethod || "Cash on Delivery"}
                    </span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>Subtotal</span>
                    <span>{fmt(order.subtotal || order.total)}</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>Shipping</span>
                    <span>{order.shippingFee ? fmt(order.shippingFee) : "FREE"}</span>
                  </div>
                  <div className={styles.summaryRow}>
                    <span>Tax</span>
                    <span>{fmt(order.tax || 0)}</span>
                  </div>
                  <hr className="divider" />
                  <div className={styles.grandTotal}>
                    <span>Total</span>
                    <span>{fmt(order.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
