import { useState } from "react";
import Navbar from "../components/Navbar/Navbar";
import { useCart } from "../context/CartContext";
import { useDiscount } from "../context/DiscountContext";
import { useApp } from "../context/AppContext";
import { fmt } from "../utils/helpers";
import styles from "./CartPage.module.css";

export default function CartPage() {
  const {
    cart,
    savedForLater,
    removeFromCart,
    increaseQty,
    decreaseQty,
    clearCart,
    saveForLater,
    moveToCart,
    removeSavedItem,
    total,
  } = useCart();
  const { coupon, availableCoupons, applyCouponCode, removeCoupon, getDiscountAmount } = useDiscount();
  const { navigate, toast } = useApp();
  const [couponCode, setCouponCode] = useState(coupon?.code || "");

  const shipping = total >= 999 ? 0 : 99;
  const discount = getDiscountAmount(total, shipping);
  const tax = Math.round(total * 0.18);
  const grand = Math.max(0, total + shipping + tax - discount);

  if (!cart.length && !savedForLater.length) {
    return (
      <div>
        <Navbar />
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>🛒</div>
          <h2>Your cart is empty</h2>
          <p>Add some items to get started</p>
          <button className="btn btn-primary" onClick={() => navigate("home")}>
            Continue Shopping →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.itemsCol}>
          <div className={styles.itemsHeader}>
            <h1 className={styles.title}>Cart ({cart.length} item{cart.length !== 1 ? "s" : ""})</h1>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                clearCart();
                toast("Cart cleared", "success");
              }}
            >
              Clear All
            </button>
          </div>

          {cart.length === 0 ? (
            <div className={styles.emptyInline}>
              <p>Your active cart is empty, but your saved items are waiting below.</p>
            </div>
          ) : (
            <div className={styles.items}>
              {cart.map((item) => (
                <div key={item.id} className={styles.item}>
                  <img
                    src={item.image}
                    alt={item.name}
                    className={styles.itemImage}
                    onError={(e) => {
                      e.target.src = "https://placehold.co/80x80/1e1e1e/666";
                    }}
                  />
                  <div className={styles.itemInfo}>
                    <p className={styles.itemName}>{item.name}</p>
                    <p className={styles.itemCat}>{item.category}</p>
                    <div className={styles.qtyControl}>
                      <button onClick={() => decreaseQty(item.id)} className={styles.qtyBtn}>−</button>
                      <span className={styles.qtyNum}>{item.qty}</span>
                      <button onClick={() => increaseQty(item.id)} className={styles.qtyBtn}>+</button>
                    </div>
                  </div>
                  <div className={styles.itemRight}>
                    <p className={styles.itemTotal}>{fmt(item.price * item.qty)}</p>
                    <p className={styles.itemUnit}>{fmt(item.price)} each</p>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => {
                        saveForLater(item.id);
                        toast("Moved to saved for later", "success");
                      }}
                    >
                      Save for later
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ color: "#ff8080", marginTop: 6 }}
                      onClick={() => {
                        removeFromCart(item.id);
                        toast("Item removed", "success");
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {savedForLater.length > 0 && (
            <section className={styles.savedSection}>
              <div className={styles.savedHeader}>
                <h2 className={styles.savedTitle}>Saved For Later ({savedForLater.length})</h2>
              </div>
              <div className={styles.items}>
                {savedForLater.map((item) => (
                  <div key={item.id} className={styles.item}>
                    <img
                      src={item.image}
                      alt={item.name}
                      className={styles.itemImage}
                      onError={(e) => {
                        e.target.src = "https://placehold.co/80x80/1e1e1e/666";
                      }}
                    />
                    <div className={styles.itemInfo}>
                      <p className={styles.itemName}>{item.name}</p>
                      <p className={styles.itemCat}>{item.category}</p>
                      <p className={styles.savedMeta}>Saved so you can decide later without losing it.</p>
                    </div>
                    <div className={styles.itemRight}>
                      <p className={styles.itemTotal}>{fmt(item.price)}</p>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                          moveToCart(item.id);
                          toast("Moved back to cart", "success");
                        }}
                      >
                        Move to Cart
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ color: "#ff8080", marginTop: 6 }}
                        onClick={() => {
                          removeSavedItem(item.id);
                          toast("Removed saved item", "success");
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className={styles.summary}>
          <h2 className={styles.summaryTitle}>Order Summary</h2>

          <div className={styles.couponBox}>
            <div className={styles.couponHeader}>
              <div>
                <p className={styles.couponTitle}>Apply Coupon</p>
                <p className={styles.couponSub}>
                  Available: {availableCoupons.map((item) => item.code).join(", ")}
                </p>
              </div>
              {coupon && (
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    removeCoupon();
                    setCouponCode("");
                    toast("Coupon removed", "success");
                  }}
                >
                  Remove
                </button>
              )}
            </div>

            <div className={styles.couponRow}>
              <input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Enter coupon code"
                className={styles.couponInput}
              />
              <button
                className="btn btn-outline btn-sm"
                onClick={() => {
                  const result = applyCouponCode(couponCode, total);
                  if (!result.ok) {
                    toast(result.message, "error");
                    return;
                  }

                  setCouponCode(result.coupon.code);
                  toast(`${result.coupon.code} applied`, "success");
                }}
                disabled={!cart.length}
              >
                Apply
              </button>
            </div>

            {coupon && (
              <div className={styles.couponApplied}>
                <span>{coupon.code}</span>
                <span>-{fmt(discount)}</span>
              </div>
            )}
          </div>

          <div className={styles.summaryRows}>
            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span>{fmt(total)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Shipping</span>
              <span style={{ color: shipping === 0 ? "var(--success)" : undefined }}>
                {shipping === 0 ? "FREE" : fmt(shipping)}
              </span>
            </div>
            <div className={styles.summaryRow}>
              <span>GST (18%)</span>
              <span>{fmt(tax)}</span>
            </div>
            {discount > 0 && (
              <div className={styles.summaryRow}>
                <span>Discount</span>
                <span className={styles.discountVal}>-{fmt(discount)}</span>
              </div>
            )}
          </div>

          {shipping > 0 && (
            <p className={styles.freeShippingHint}>
              Add {fmt(999 - total)} more for free shipping
            </p>
          )}

          <hr className="divider" />

          <div className={styles.grandTotal}>
            <span>Total</span>
            <span style={{ color: "var(--accent)" }}>{fmt(grand)}</span>
          </div>

          <button
            className="btn btn-primary"
            style={{ width: "100%", padding: 14, fontSize: "0.95rem" }}
            onClick={() => navigate("checkout")}
            disabled={!cart.length}
          >
            Proceed to Checkout →
          </button>
          <button
            className="btn btn-ghost"
            style={{ width: "100%", marginTop: 10 }}
            onClick={() => navigate("home")}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}
