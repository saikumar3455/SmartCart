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
        const myOrders = data.filter(
          (o) => o.userEmail === user.email
        );
        setOrders(myOrders.reverse());
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

                  <div style={{ textAlign: "right" }}>
                    <p className={styles.orderTotal}>
                      {fmt(order.total)}
                    </p>
                    <span className="badge badge-success">
                      {order.status}
                    </span>
                  </div>
                </div>

                <div className={styles.meta}>
                  <div
                    style={{
                      display: "grid",
                      gap: "12px",
                      marginTop: "12px",
                    }}
                  >
                    {order.items?.map((item, i) => (
                      <div
                        key={i}
                        style={{
                          display: "flex",
                          gap: "12px",
                          alignItems: "center",
                          padding: "10px",
                          border: "1px solid #e5e7eb",
                          borderRadius: "12px",
                          background: "#fafafa",
                        }}
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          width="60"
                          height="60"
                          style={{
                            borderRadius: "10px",
                            objectFit: "cover",
                          }}
                        />

                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: 0 }}>{item.name}</h4>
                          <p
                            style={{
                              margin: "4px 0",
                              opacity: 0.7,
                            }}
                          >
                            Qty: {item.qty || 1}
                          </p>
                          <p
                            style={{
                              margin: 0,
                              fontWeight: "bold",
                              color: "#2563eb",
                            }}
                          >
                            ₹{item.price}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <p style={{ marginTop: "12px" }}>
                    💳{" "}
                    {order.payment === "cod"
                      ? "Cash on Delivery"
                      : order.payment?.toUpperCase()}
                  </p>

                  <p>
                    🛒 {order.items?.length} item
                    {order.items?.length !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}