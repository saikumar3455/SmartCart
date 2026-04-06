import { useEffect, useState } from "react";
import Navbar from "../components/Navbar/Navbar";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import { fmt } from "../utils/helpers";
import styles from "./Orders.module.css";

export default function Orders() {
  const { user } = useAuth();
  const { navigate } = useApp();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.email) return;

    fetch("https://smartcart-api-2ogq.onrender.com/api/orders")
      .then((res) => res.json())
      .then((data) => {
        const myOrders = data
          .filter(
            (o) =>
              o.userEmail === user.email ||
              o.userId === user._id
          )
          .reverse();

        setOrders(myOrders);
      })
      .catch((err) => console.log(err))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <div className={styles.page}>
      <Navbar />

      <div className={styles.container}>
        <h1 className={styles.title}>My Orders</h1>

        {loading ? (
          <p>Loading orders...</p>
        ) : orders.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>📦</div>
            <h3>No orders yet</h3>
            <p>Place your first order today!</p>
            <button
              className="btn btn-primary"
              onClick={() => navigate("home")}
            >
              Start Shopping →
            </button>
          </div>
        ) : (
          <div className={styles.list}>
            {orders.map((order) => (
              <div key={order._id} className={styles.order}>
                <div className={styles.orderTop}>
                  <div>
                    <p className={styles.orderId}>
                      #{order._id.slice(-6)}
                    </p>
                    <p className={styles.orderDate}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div>
                    <span className="badge badge-success">
                      {order.status}
                    </span>
                    <p className={styles.orderTotal}>
                      {fmt(order.total)}
                    </p>
                  </div>
                </div>

                <div className={styles.orderMeta}>
                  <p>📍 {order.shipping?.city}, {order.shipping?.state}</p>
                  <p>💳 {order.payment}</p>
                  <p>🛒 {order.items?.length} items</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}