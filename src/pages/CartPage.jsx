import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const API = import.meta.env.VITE_API_URL;

function CartPage({ cart, increaseQuantity, decreaseQuantity, removeFromCart, cartTotal, setCart }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showCheckout, setShowCheckout] = useState(false);

  const [customer, setCustomer] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    address: "",
    city: "",
    payment: "Cash on Delivery",
  });

  const handleChange = (e) => setCustomer({ ...customer, [e.target.name]: e.target.value });

  const placeOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return toast.error("Cart is empty!");

    const orderData = {
      customer: { ...customer, email: user?.email || "" },
      products: cart.map((i) => ({ id: i.id, name: i.name, price: i.price, quantity: i.quantity, icon: i.icon })),
      total: cartTotal,
    };

    const loadingToast = toast.loading("Placing order...");
    try {
      await axios.post(`${API}/orders`, orderData);
      toast.success(`Order placed! 🎉`, { id: loadingToast });
      setCart([]);
      navigate("/orders");
    } catch (err) {
      toast.error("Order failed", { id: loadingToast });
    }
  };

  return (
    <section className="cart-page">
      <div className="section-head">
        <p className="eyebrow">— YOUR SELECTION</p>
        <h2>Shopping Cart</h2>
      </div>

      {cart.length === 0 ? (
        <div className="empty-state">
          <h3>Your cart is empty</h3>
          <p>Add some products to get started.</p>
          <Link to="/products" className="empty-state-cta">Start Shopping <span>→</span></Link>
        </div>
      ) : (
        <div className="cart-page-grid">
          <div className="cart-items-section">
            {cart.map((item) => (
              <div className="cart-item" key={item.id}>
                <div className="cart-icon">{item.icon}</div>
                <div className="cart-info">
                  <h3>{item.name}</h3>
                  <p className="muted">Rs. {item.price.toLocaleString()} each</p>
                  <div className="quantity-controls">
                    <button onClick={() => decreaseQuantity(item.id)}>−</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => increaseQuantity(item.id)}>+</button>
                  </div>
                </div>
                <div className="cart-right">
                  <div className="cart-price">Rs. {(item.price * item.quantity).toLocaleString()}</div>
                  <button className="remove-btn" onClick={() => removeFromCart(item.id)}>Remove</button>
                </div>
              </div>
            ))}
          </div>

          <div className="checkout-box">
            <h3>Order Summary</h3>
            <div className="checkout-summary">
              <div><span>Subtotal</span><strong>Rs. {cartTotal.toLocaleString()}</strong></div>
              <div><span>Shipping</span><strong>Free</strong></div>
              <div className="checkout-total"><span>Total</span><strong>Rs. {cartTotal.toLocaleString()}</strong></div>
            </div>

            {!showCheckout ? (
              <button className="checkout-btn" onClick={() => {
                if (!user) { toast.error("Please login first"); navigate("/login"); return; }
                setShowCheckout(true);
              }}>
                Proceed to Checkout →
              </button>
            ) : (
              <form onSubmit={placeOrder} className="checkout-form-inline">
                <input type="text" name="name" placeholder="Full Name" value={customer.name} onChange={handleChange} required />
                <input type="tel" name="phone" placeholder="Phone" value={customer.phone} onChange={handleChange} required />
                <textarea name="address" placeholder="Address" value={customer.address} onChange={handleChange} required />
                <input type="text" name="city" placeholder="City" value={customer.city} onChange={handleChange} required />
                <select name="payment" value={customer.payment} onChange={handleChange}>
                  <option>Cash on Delivery</option>
                  <option>Bank Transfer</option>
                </select>
                <button type="submit" className="place-order-btn">Place Order ✅</button>
                <button type="button" className="cancel-btn" onClick={() => setShowCheckout(false)}>Cancel</button>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

export default CartPage;