import { useState } from "react";
import Navbar from "../components/Navbar/Navbar";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import { getOrders, getUsers, setUsers, fmt } from "../utils/helpers";
import styles from "./Profile.module.css";

export default function Profile() {
  const { user, login } = useAuth();
  const { navigate, toast } = useApp();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || "", phone: user?.phone || "" });

  const orders = getOrders().filter((o) => o.userId === user?.id || o.userEmail === user?.email);
  const totalSpent = orders.reduce((a, o) => a + o.total, 0);

  const save = () => {
    const users = getUsers();
    const updated = users.map((u) => (u.id === user.id ? { ...u, ...form } : u));
    setUsers(updated);
    login({ ...user, ...form });
    setEditing(false);
    toast("Profile updated ✓", "success");
  };

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.container}>
        <h1 className={styles.title}>My Profile</h1>

        {/* Profile card */}
        <div className={styles.profileCard}>
          <div className={styles.avatar}>
            {user?.name?.[0]?.toUpperCase() || "U"}
          </div>
          <div className={styles.info}>
            {editing ? (
              <div className={styles.editForm}>
                <div className="field" style={{ margin: 0 }}>
                  <label>Full Name</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="field" style={{ margin: 0 }}>
                  <label>Phone</label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="10-digit number" />
                </div>
                <div className={styles.editActions}>
                  <button className="btn btn-primary btn-sm" onClick={save}>Save Changes</button>
                  <button className="btn btn-outline btn-sm" onClick={() => setEditing(false)}>Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <h2 className={styles.name}>{user?.name}</h2>
                <p className={styles.email}>{user?.email}</p>
                {user?.phone && <p className={styles.phone}>📞 {user.phone}</p>}
                <div className={styles.tags}>
                  <span className={`badge badge-${user?.role === "admin" ? "accent" : "success"}`}>{user?.role}</span>
                  {user?.joined && <span className="badge badge-dim">Joined {user.joined}</span>}
                  <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>
                    ✏️ Edit Profile
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className={styles.stats}>
          {[
            ["📦", "Total Orders", orders.length],
            ["💰", "Total Spent",  fmt(totalSpent)],
            ["⭐", "Member Since", user?.joined || "2025"],
          ].map(([icon, label, val]) => (
            <div key={label} className={styles.statCard}>
              <div className={styles.statIcon}>{icon}</div>
              <div className={styles.statVal}>{val}</div>
              <div className={styles.statLabel}>{label}</div>
            </div>
          ))}
        </div>

        <button className="btn btn-outline" style={{ width: "100%" }} onClick={() => navigate("orders")}>
          View All Orders →
        </button>
      </div>
    </div>
  );
}