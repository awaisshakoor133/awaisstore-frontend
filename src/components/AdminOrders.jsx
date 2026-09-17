import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const API = import.meta.env.VITE_API_URL;

const STATUSES = [
  "Confirmed",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

function AdminOrders({ refreshStats }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${API}/orders`);
      setOrders(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Orders load nahi ho paaye");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (id, newStatus, oldStatus) => {
    const loadingToast = toast.loading("Updating status...");
    try {
      await axios.put(`${API}/orders/${id}`, { status: newStatus });
      fetchOrders();
      refreshStats?.();
      toast.success(`Status: ${oldStatus} → ${newStatus}`, {
        id: loadingToast,
        icon: "✅",
      });
    } catch (err) {
      console.error(err);
      toast.error("Status update failed", { id: loadingToast });
    }
  };

  const handleDelete = (id, orderId) => {
    toast(
      (t) => (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <span>
            Order <strong>#{orderId.slice(-6)}</strong> delete karna hai?
          </span>
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                const loadToast = toast.loading("Deleting...");
                try {
                  await axios.delete(`${API}/orders/${id}`);
                  fetchOrders();
                  refreshStats?.();
                  toast.success("Order deleted 🗑️", { id: loadToast });
                } catch (err) {
                  console.error(err);
                  toast.error("Delete failed", { id: loadToast });
                }
              }}
              style={{
                padding: "6px 14px",
                border: "none",
                borderRadius: "6px",
                background: "#b0455f",
                color: "#fff",
                fontWeight: "700",
                cursor: "pointer",
                fontSize: "13px",
              }}
            >
              Yes, Delete
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              style={{
                padding: "6px 14px",
                border: "1px solid #ccc",
                borderRadius: "6px",
                background: "transparent",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "13px",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      { duration: 6000 }
    );
  };

  const getStatusClass = (status) => {
    return `status-${status.toLowerCase()}`;
  };

  return (
    <div className="admin-section">
      <div className="admin-section-head">
        <h2>Orders ({orders.length})</h2>
      </div>

      {loading ? (
        <p className="muted">Loading...</p>
      ) : orders.length === 0 ? (
        <div className="admin-empty">
          <p>Koi order nahi aaya abhi.</p>
        </div>
      ) : (
        <div className="admin-orders-list">
          {orders.map((order) => (
            <div className="admin-order-card" key={order._id}>
              <div className="admin-order-head">
                <div>
                  <strong>Order #{order._id.toString().slice(-6)}</strong>
                  <p className="muted">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="admin-order-actions">
                  <select
                    className={`admin-status-select ${getStatusClass(
                      order.status
                    )}`}
                    value={order.status}
                    onChange={(e) =>
                      handleStatusChange(
                        order._id,
                        e.target.value,
                        order.status
                      )
                    }
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>

                  <button
                    className="admin-edit-btn"
                    onClick={() =>
                      setExpanded(expanded === order._id ? null : order._id)
                    }
                  >
                    {expanded === order._id ? "▲ Hide" : "▼ View"}
                  </button>

                  <button
                    className="admin-del-btn"
                    onClick={() =>
                      handleDelete(order._id, order._id.toString())
                    }
                  >
                    🗑️
                  </button>
                </div>
              </div>

              <div className="admin-order-meta">
                <span>👤 {order.customer.name}</span>
                <span>📞 {order.customer.phone}</span>
                <span>📍 {order.customer.city}</span>
                <span>💳 {order.customer.payment}</span>
                <span className="admin-order-total">
                  💰 Rs. {order.total.toLocaleString()}
                </span>
              </div>

              {expanded === order._id && (
                <div className="admin-order-details">
                  <h4>Products</h4>
                  {order.products.map((p, i) => (
                    <div className="admin-order-product" key={i}>
                      <span className="admin-table-icon">{p.icon}</span>
                      <div>
                        <strong>{p.name}</strong>
                        <p className="muted">Qty: {p.quantity}</p>
                      </div>
                      <strong>
                        Rs. {(p.price * p.quantity).toLocaleString()}
                      </strong>
                    </div>
                  ))}
                  <h4 style={{ marginTop: "16px" }}>Shipping Address</h4>
                  <p className="muted">{order.customer.address}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminOrders;