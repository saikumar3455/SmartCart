import Navbar from "../components/Navbar/Navbar";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import { getOrders, fmt } from "../utils/helpers";
import styles from "./Success.module.css";

export default function Success() {
  const { user }       = useAuth();
  const { navigate }   = useApp();
  const orders         = getOrders();
  const myOrders       = orders.filter((o) => o.userId === user?.id || o.userEmail === user?.email);
  const last           = myOrders[myOrders.length - 1];
  const paymentLabel =
    last?.paymentMethod === "cod"
      ? "Cash on Delivery"
      : last?.paymentMethod === "upi"
        ? "UPI / QR Code"
        : last?.paymentMethod === "card"
          ? "Credit / Debit Card"
          : last?.paymentMethod === "netbanking"
            ? "Net Banking"
            : last?.paymentMethod?.toUpperCase();

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.iconWrap}>✅</div>
        <h1 className={styles.title}>Order Confirmed!</h1>
        <p className={styles.sub}>
          Thank you for your purchase. Your order has been placed successfully.
        </p>

        {last && (
          <div className={styles.card}>
            <div className={styles.cardTop}>
              <div>
                <p className={styles.orderId_label}>Order ID</p>
                <p className={styles.orderId}>{last.id}</p>
              </div>
              <span className="badge badge-success">{last.status}</span>
            </div>

            <div className={styles.details}>
              <p>📦 Delivering to: <strong>{last.shipping?.city}, {last.shipping?.state}</strong></p>
              <p>💳 Payment: <strong>{paymentLabel}</strong></p>
              <p>📅 Estimated delivery: <strong>3–5 business days</strong></p>
            </div>

            <hr className="divider" />

            {last.preBookingCredit > 0 && (
              <div className={styles.totalRow}>
                <span>Pre-booking credit used</span>
                <span className={styles.totalAmt}>-{fmt(last.preBookingCredit)}</span>
              </div>
            )}

            <div className={styles.totalRow}>
              <span>Total Paid</span>
              <span className={styles.totalAmt}>{fmt(last.total)}</span>
            </div>
          </div>
        )}

        <div className={styles.actions}>
          <button className="btn btn-primary" onClick={() => navigate("home")}>
            Continue Shopping →
          </button>
          <button className="btn btn-outline" onClick={() => navigate("orders")}>
            View All Orders
          </button>
        </div>
      </div>
    </div>
  );
}
