import { OrdersSkeleton } from "../components/Skeleton";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const API = import.meta.env.VITE_API_URL;

function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      if (!user) {
        setLoading(false);
        return;
      }
      try {
        const params = new URLSearchParams();
        if (user.email) params.append("email", user.email);
        if (user.phone) params.append("phone", user.phone);
        const res = await axios.get(`${API}/orders?${params}`);
        setOrders(res.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [user]);

 if (loading) {
  return (
    <section className="orders-page">
      <div className="section-head">
        <p className="eyebrow">— HISTORY</p>
        <h2>My Orders</h2>
      </div>
      <OrdersSkeleton count={3} />
    </section>
  );
}

  return (
    <section className="orders-page">
      <div className="section-head">
        <p className="eyebrow">— HISTORY</p>
        <h2>My Orders</h2>
      </div>

      {!user ? (
        <div className="empty-state">
          <h3>Login Required</h3>
          <p>Please login to see your orders.</p>
          <Link to="/login" className="empty-state-cta">
            Login Now <span>→</span>
          </Link>
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <h3>No Orders Yet</h3>
          <p>Your placed orders will appear here.</p>
          <Link to="/products" className="empty-state-cta">
            Start Shopping <span>→</span>
          </Link>
        </div>
      ) : (
        <div className="orders-container">
          {orders.map((order) => (
            <Link
              to={`/orders/${order._id}`}
              className="order-card"
              key={order._id}
            >
              <div className="order-header">
                <div>
                  <h3>Order #{order._id?.slice(-6).toUpperCase()}</h3>
                  <p className="muted">
                    Date: {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="order-status">{order.status}</span>
              </div>

              <div className="order-products">
                {order.products?.map((item, idx) => (
                  <div className="order-product" key={idx}>
                    <div className="order-product-icon">{item.icon}</div>
                    <div>
                      <h4>{item.name}</h4>
                      <p className="muted">Qty: {item.quantity}</p>
                    </div>
                    <strong>
                      Rs. {(item.price * item.quantity).toLocaleString()}
                    </strong>
                  </div>
                ))}
              </div>

              <div className="order-footer">
                <div>
                  <strong>Customer:</strong> {order.customer?.name}
                </div>
                <div>
                  <strong>Payment:</strong> {order.customer?.payment}
                </div>
                <div className="order-total">
                  Total: Rs. {order.total?.toLocaleString()}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

export default OrdersPage;