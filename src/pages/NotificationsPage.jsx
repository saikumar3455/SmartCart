import Navbar from "../components/Navbar/Navbar";
import { useNotifications } from "../context/NotificationsContext";
import { useApp } from "../context/AppContext";
import styles from "./NotificationsPage.module.css";

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { navigate } = useApp();

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Updates</p>
            <h1 className={styles.title}>Notifications Center</h1>
          </div>
          <div className={styles.headerActions}>
            <span className="badge badge-accent">{unreadCount} unread</span>
            {notifications.length > 0 && (
              <button className="btn btn-outline" onClick={markAllAsRead}>
                Mark All Read
              </button>
            )}
          </div>
        </div>

        {notifications.length === 0 ? (
          <div className={styles.empty}>
            <h2>No updates yet</h2>
            <p>Once you browse, save, and shop more, your personalized updates will appear here.</p>
          </div>
        ) : (
          <div className={styles.list}>
            {notifications.map((item) => (
              <article
                key={item.id}
                className={`${styles.card} ${!item.read ? styles.cardUnread : ""}`}
              >
                <div className={styles.cardTop}>
                  <div>
                    <h2 className={styles.cardTitle}>{item.title}</h2>
                    <p className={styles.cardText}>{item.message}</p>
                  </div>
                  {!item.read && <span className={styles.dot} />}
                </div>

                <div className={styles.cardActions}>
                  <button className="btn btn-ghost btn-sm" onClick={() => markAsRead(item.id)}>
                    Mark Read
                  </button>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      markAsRead(item.id);
                      navigate(item.link || "home");
                    }}
                  >
                    Open
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
