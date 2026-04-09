import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";
import { getNotifications, getRecentViews, getWishlist, saveNotifications } from "../utils/helpers";

const NotificationsContext = createContext();

const buildSystemNotifications = (userKey) => {
  const recentViews = getRecentViews(userKey);
  const wishlist = getWishlist(userKey);

  return [
    recentViews[0] && {
      id: `recent-${recentViews[0]._id || recentViews[0].id}`,
      title: "Recently viewed is ready",
      message: `Pick up where you left off with ${recentViews[0].name}.`,
      type: "info",
      read: false,
      link: recentViews[0]._id || recentViews[0].id ? `product/${recentViews[0]._id || recentViews[0].id}` : "home",
    },
    wishlist.length > 0 && {
      id: `wishlist-${wishlist.length}`,
      title: "Wishlist waiting for you",
      message: `${wishlist.length} saved item${wishlist.length !== 1 ? "s are" : " is"} ready for checkout.`,
      type: "success",
      read: false,
      link: "wishlist",
    },
  ].filter(Boolean);
};

export function NotificationsProvider({ children }) {
  const { user } = useAuth();
  const userKey = user?.email || "guest";
  const [notifications, setNotifications] = useState(() => getNotifications(userKey));

  useEffect(() => {
    const saved = getNotifications(userKey);
    const system = buildSystemNotifications(userKey);
    const merged = [...system, ...saved.filter((item) => !system.some((sys) => sys.id === item.id))];
    setNotifications(merged);
  }, [userKey]);

  useEffect(() => {
    saveNotifications(userKey, notifications);
  }, [notifications, userKey]);

  const value = useMemo(() => {
    const pushNotification = ({ title, message, type = "info", link = "home" }) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setNotifications((prev) => [{ id, title, message, type, link, read: false }, ...prev].slice(0, 20));
    };

    const markAsRead = (id) => {
      setNotifications((prev) => prev.map((item) => (item.id === id ? { ...item, read: true } : item)));
    };

    const markAllAsRead = () => {
      setNotifications((prev) => prev.map((item) => ({ ...item, read: true })));
    };

    return {
      notifications,
      unreadCount: notifications.filter((item) => !item.read).length,
      pushNotification,
      markAsRead,
      markAllAsRead,
    };
  }, [notifications]);

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

export const useNotifications = () => useContext(NotificationsContext);
