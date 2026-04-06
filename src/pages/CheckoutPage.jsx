import { useContext } from "react";
import Navbar from "../components/Navbar";
import { CartCtx } from "../context/CartContext";
import { fmt } from "../utils/helpers";

const API = "https://smartcart-api-2ogq.onrender.com";

export default function CheckoutPage({ setPage }) {
  const { cart, total, clearCart } = useContext(CartCtx);

  const placeOrder = async () => {
    try {
      const currentUser = JSON.parse(localStorage.getItem("sc_user"));

      const orderData = {
        userId: currentUser._id,
        userName: currentUser.name,
        userEmail: currentUser.email,
        items: cart,
        total,
        status: "Placed",
      };

      const res = await fetch(`${API}/api/order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      alert("🎉 Order placed successfully");
      clearCart();
      setPage("home");
    } catch (error) {
      console.error(error);
      alert(error.message || "Order failed");
    }
  };

  return (
    <div>
      <Navbar setPage={setPage} />
      <div className="checkout-page">
        <h1>Checkout</h1>
        <p>Total Amount: {fmt(total)}</p>
        <button onClick={placeOrder}>Place Order</button>
      </div>
    </div>
  );
}