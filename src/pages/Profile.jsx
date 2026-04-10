import { useEffect, useState } from "react";
import Navbar from "../components/Navbar/Navbar";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import { useWishlist } from "../context/WishlistContext";
import { getOrders, getUsers, setUsers, fmt, uid } from "../utils/helpers";
import styles from "./Profile.module.css";

const EMPTY_ADDRESS = {
  id: "",
  label: "",
  fullName: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  isDefault: false,
};

export default function Profile() {
  const { user, login } = useAuth();
  const { wishlistCount } = useWishlist();
  const { navigate, toast } = useApp();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user?.name || "", phone: user?.phone || "" });
  const [addressForm, setAddressForm] = useState({
    ...EMPTY_ADDRESS,
    fullName: user?.name || "",
    phone: user?.phone || "",
  });
  const [editingAddressId, setEditingAddressId] = useState("");
  const [preBookings, setPreBookings] = useState([]);

  const orders = getOrders().filter((o) => o.userId === user?.id || o.userEmail === user?.email);
  const totalSpent = orders.reduce((a, o) => a + o.total, 0);
  const addresses = user?.addresses || [];
  const activePreBookings = preBookings.filter((item) => item.status === "active" || item.status === "partial");

  useEffect(() => {
    if (!user?.email) return;

    fetch(`https://smartcart-api-2ogq.onrender.com/api/prebookings?userEmail=${encodeURIComponent(user.email)}`)
      .then((res) => res.json())
      .then((data) => setPreBookings(Array.isArray(data) ? data : []))
      .catch((error) => console.log("pre-bookings fetch error", error));
  }, [user?.email]);

  const persistUser = (updatedUser) => {
    const users = getUsers();
    const updatedUsers = users.map((u) => {
      const sameUser =
        (u._id && updatedUser._id && u._id === updatedUser._id) ||
        (u.id && updatedUser.id && u.id === updatedUser.id) ||
        u.email === updatedUser.email;

      return sameUser ? { ...u, ...updatedUser } : u;
    });

    setUsers(updatedUsers);
    login(updatedUser);
  };

  const save = () => {
    const updatedUser = { ...user, ...form };
    persistUser(updatedUser);
    setEditing(false);
    toast("Profile updated ✓", "success");
  };

  const resetAddressForm = () => {
    setAddressForm({
      ...EMPTY_ADDRESS,
      fullName: user?.name || "",
      phone: user?.phone || "",
    });
    setEditingAddressId("");
  };

  const saveAddress = () => {
    const req = ["label", "fullName", "phone", "address", "city", "state", "pincode"];

    if (req.some((key) => !String(addressForm[key] || "").trim())) {
      toast("Fill all address fields", "error");
      return;
    }

    if (!/^\d{10}$/.test(addressForm.phone)) {
      toast("Enter a valid 10-digit phone number", "error");
      return;
    }

    if (!/^\d{6}$/.test(addressForm.pincode)) {
      toast("Enter a valid 6-digit PIN code", "error");
      return;
    }

    const nextAddress = {
      ...addressForm,
      id: editingAddressId || uid(),
    };

    const nextAddressesBase = editingAddressId
      ? addresses.map((item) => (item.id === editingAddressId ? nextAddress : item))
      : [...addresses, nextAddress];

    const nextAddresses = nextAddressesBase.map((item, index) => ({
      ...item,
      isDefault: nextAddress.isDefault ? item.id === nextAddress.id : item.isDefault || index === 0,
    }));

    const updatedUser = { ...user, addresses: nextAddresses };
    persistUser(updatedUser);
    resetAddressForm();
    toast(editingAddressId ? "Address updated ✓" : "Address saved ✓", "success");
  };

  const editAddress = (address) => {
    setEditingAddressId(address.id);
    setAddressForm(address);
  };

  const removeAddress = (id) => {
    const nextAddresses = addresses.filter((item) => item.id !== id);
    const normalized = nextAddresses.map((item, index) => ({
      ...item,
      isDefault: nextAddresses.length > 0 ? item.isDefault || index === 0 : false,
    }));

    persistUser({ ...user, addresses: normalized });
    if (editingAddressId === id) resetAddressForm();
    toast("Address removed", "success");
  };

  const makeDefault = (id) => {
    const nextAddresses = addresses.map((item) => ({
      ...item,
      isDefault: item.id === id,
    }));

    persistUser({ ...user, addresses: nextAddresses });
    toast("Default address updated ✓", "success");
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
            ["♡", "Wishlist Items", wishlistCount],
            ["⏳", "Pre-Bookings", activePreBookings.length],
          ].map(([icon, label, val]) => (
            <div key={label} className={styles.statCard}>
              <div className={styles.statIcon}>{icon}</div>
              <div className={styles.statVal}>{val}</div>
              <div className={styles.statLabel}>{label}</div>
            </div>
          ))}
        </div>

        <div className={styles.addressSection}>
          <div className={styles.addressHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Saved Addresses</h2>
              <p className={styles.sectionSub}>Use a default address to speed up checkout.</p>
            </div>
            <span className="badge badge-dim">{addresses.length} saved</span>
          </div>

          <div className={styles.addressForm}>
            <div className="field" style={{ margin: 0 }}>
              <label>Label</label>
              <input
                value={addressForm.label}
                onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                placeholder="Home, Office, Hostel"
              />
            </div>
            <div className="field" style={{ margin: 0 }}>
              <label>Full Name</label>
              <input
                value={addressForm.fullName}
                onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                placeholder="John Doe"
              />
            </div>
            <div className="field" style={{ margin: 0 }}>
              <label>Phone</label>
              <input
                value={addressForm.phone}
                onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                placeholder="10-digit number"
              />
            </div>
            <div className="field" style={{ margin: 0 }}>
              <label>PIN Code</label>
              <input
                value={addressForm.pincode}
                onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                placeholder="400001"
              />
            </div>
            <div className="field" style={{ margin: 0, gridColumn: "1 / -1" }}>
              <label>Address</label>
              <input
                value={addressForm.address}
                onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                placeholder="Flat, Street, Area"
              />
            </div>
            <div className="field" style={{ margin: 0 }}>
              <label>City</label>
              <input
                value={addressForm.city}
                onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                placeholder="Mumbai"
              />
            </div>
            <div className="field" style={{ margin: 0 }}>
              <label>State</label>
              <input
                value={addressForm.state}
                onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                placeholder="Maharashtra"
              />
            </div>
            <label className={styles.defaultCheck}>
              <input
                type="checkbox"
                checked={addressForm.isDefault}
                onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
              />
              Set as default address
            </label>
            <div className={styles.addressActions}>
              <button className="btn btn-primary" onClick={saveAddress}>
                {editingAddressId ? "Update Address" : "Save Address"}
              </button>
              {editingAddressId && (
                <button className="btn btn-outline" onClick={resetAddressForm}>
                  Cancel
                </button>
              )}
            </div>
          </div>

          {addresses.length > 0 ? (
            <div className={styles.addressList}>
              {addresses.map((address) => (
                <div key={address.id} className={styles.addressCard}>
                  <div className={styles.addressCardTop}>
                    <div className={styles.addressMeta}>
                      <h3>{address.label}</h3>
                      {address.isDefault && <span className="badge badge-success">Default</span>}
                    </div>
                    <div className={styles.addressButtons}>
                      {!address.isDefault && (
                        <button className="btn btn-ghost btn-sm" onClick={() => makeDefault(address.id)}>
                          Make Default
                        </button>
                      )}
                      <button className="btn btn-ghost btn-sm" onClick={() => editAddress(address)}>
                        Edit
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => removeAddress(address.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className={styles.addressText}>{address.fullName} · {address.phone}</p>
                  <p className={styles.addressText}>
                    {address.address}, {address.city}, {address.state} - {address.pincode}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.addressEmpty}>No saved addresses yet. Add one for faster checkout.</div>
          )}
        </div>

        <div className={styles.addressSection}>
          <div className={styles.addressHeader}>
            <div>
              <h2 className={styles.sectionTitle}>Pre-Bookings</h2>
              <p className={styles.sectionSub}>Track active reservations and expired holds here.</p>
            </div>
            <span className="badge badge-dim">{preBookings.length} total</span>
          </div>

          {preBookings.length > 0 ? (
            <div className={styles.addressList}>
              {preBookings.map((booking) => (
                <div key={booking._id} className={styles.addressCard}>
                  <div className={styles.addressCardTop}>
                    <div className={styles.addressMeta}>
                      <h3>{booking.productName}</h3>
                      <span className={`badge badge-${booking.status === "expired" ? "dim" : "accent"}`}>
                        {booking.status}
                      </span>
                    </div>
                    <div className={styles.addressButtons}>
                      <button className="btn btn-ghost btn-sm" onClick={() => navigate(`product/${booking.productId}`)}>
                        View Product
                      </button>
                    </div>
                  </div>
                  <p className={styles.addressText}>
                    Qty reserved: {booking.quantity} · Remaining hold: {booking.remainingQuantity}
                  </p>
                  <p className={styles.addressText}>
                    Advance: {fmt(booking.advanceAmount)} · Remaining credit: {fmt(booking.remainingAdvanceAmount || 0)}
                  </p>
                  <p className={styles.addressText}>
                    Expires on {new Date(booking.expiresAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.addressEmpty}>No pre-bookings yet. Reserve products from the product page.</div>
          )}
        </div>

        <button className="btn btn-primary" style={{ width: "100%" }} onClick={() => navigate("wishlist")}>
          Open Wishlist →
        </button>
        <button className="btn btn-outline" style={{ width: "100%" }} onClick={() => navigate("orders")}>
          View All Orders →
        </button>
      </div>
    </div>
  );
}
