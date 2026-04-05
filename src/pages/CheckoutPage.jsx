import { useContext } from "react";
import Navbar from "../components/Navbar";
import { CartCtx } from "../context/CartContext";
import { fmt } from "../utils/helpers";

export default function CheckoutPage({ setPage }) {
  const { total, clearCart } = useContext(CartCtx);

  const placeOrder = () => {
    alert("Order placed successfully");
    clearCart();
    setPage("home");
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