import Navbar from "../components/Navbar/Navbar";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import { getOrders, fmt } from "../utils/helpers";
import styles from "./Orders.module.css";

export default function Orders() {
  const { user }     = useAuth();
  const { navigate } = useApp();
  const orders       = getOrders()
    .filter((o) => o.userId === user?.id || o.userEmail === user?.email)
    .reverse();

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.container}>
        <h1 className={styles.title}>My Orders</h1>

        {orders.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>📦</div>
            <h3>No orders yet</h3>
            <p>Place your first order today!</p>
            <button className="btn btn-primary" onClick={() => navigate("home")}>
              Start Shopping →
            </button>
          </div>
        ) : (
          <div className={styles.list}>
            {orders.map((order) => (
              <div key={order.id} className={styles.order}>
                <div className={styles.orderTop}>
                  <div>
                    <p className={styles.orderId}>{order.id}</p>
                    <p className={styles.orderDate}>{order.date}</p>
                  </div>
                  <span className="badge badge-success">{order.status}</span>
                </div>

                <div className={styles.thumbs}>
                  {order.items?.slice(0, 5).map((item) => (
                    <img
                      key={item.id}
                      src={item.image}
                      alt={item.name}
                      className={styles.thumb}
                      onError={(e) => { e.target.src = "https://placehold.co/52x52/1e1e1e/666"; }}
                    />
                  ))}
                  {order.items?.length > 5 && (
                    <div className={styles.thumbMore}>+{order.items.length - 5}</div>
                  )}
                </div>

                <div className={styles.orderBottom}>
                  <div className={styles.orderMeta}>
                    <span>{order.items?.length} item{order.items?.length !== 1 ? "s" : ""}</span>
                    <span className={styles.dot}>·</span>
                    <span>
                      {order.payment === "cod" ? "Cash on Delivery" : order.payment?.toUpperCase()}
                    </span>
                    <span className={styles.dot}>·</span>
                    <span>{order.shipping?.city}, {order.shipping?.state}</span>
                  </div>
                  <span className={styles.orderTotal}>{fmt(order.total)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}