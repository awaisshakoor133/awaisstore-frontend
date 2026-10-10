import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  CartIcon,
  TrashIcon,
  MoneyIcon,
  BellIcon,
  CheckIcon,
  MailIcon,
} from "../components/StoreIcons";

const API = import.meta.env.VITE_API_URL;

function AdminAbandonedCartsPage() {
  const [carts, setCarts] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("active");
  const [sending, setSending] = useState(false);

  const fetchCarts = async () => {
    try {
      const recoveredParam =
        filter === "all" ? "" : `?recovered=${filter === "recovered"}`;
      const res = await axios.get(`${API}/abandoned-carts${recoveredParam}`);
      setCarts(res.data.carts);
      setStats(res.data.stats);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load abandoned carts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarts();
  }, [filter]);

  const handleSendReminders = async () => {
    setSending(true);
    try {
      const res = await axios.post(`${API}/abandoned-carts/send-reminders`);
      toast.success(`Sent ${res.data.total} reminders!`);
      fetchCarts();
    } catch (err) {
      toast.error("Failed to send reminders");
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this abandoned cart?")) return;
    try {
      await axios.delete(`${API}/abandoned-carts/${id}`);
      toast.success("Deleted");
      fetchCarts();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  const getTimeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  if (loading) {
    return <p className="muted">Loading abandoned carts...</p>;
  }

  return (
    <div className="admin-section">
      <div className="admin-section-head">
        <h2>Abandoned Carts ({carts.length})</h2>
        <button
          className="admin-add-btn"
          onClick={handleSendReminders}
          disabled={sending}
        >
          <BellIcon size={16} />
          <span>{sending ? "Sending..." : "Send Reminders"}</span>
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="abandoned-stats">
          <div className="abandoned-stat-card">
            <CartIcon size={22} />
            <div>
              <p className="stat-label">Active</p>
              <h3>{stats.active}</h3>
            </div>
          </div>

          <div className="abandoned-stat-card">
            <BellIcon size={22} />
            <div>
              <p className="stat-label">Notified</p>
              <h3>{stats.notified}</h3>
            </div>
          </div>

          <div className="abandoned-stat-card">
            <CheckIcon size={22} />
            <div>
              <p className="stat-label">Recovered</p>
              <h3>{stats.recovered}</h3>
            </div>
          </div>

          <div className="abandoned-stat-card highlight">
            <MoneyIcon size={22} />
            <div>
              <p className="stat-label">Value at Risk</p>
              <h3>Rs. {stats.valueAtRisk.toLocaleString()}</h3>
            </div>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="abandoned-filter">
        <button
          className={filter === "active" ? "active" : ""}
          onClick={() => setFilter("active")}
        >
          Active
        </button>
        <button
          className={filter === "recovered" ? "active" : ""}
          onClick={() => setFilter("recovered")}
        >
          Recovered
        </button>
        <button
          className={filter === "all" ? "active" : ""}
          onClick={() => setFilter("all")}
        >
          All
        </button>
      </div>

      {/* Carts List */}
      {carts.length === 0 ? (
        <div className="admin-empty">
          <p>No abandoned carts.</p>
        </div>
      ) : (
        <div className="abandoned-list">
          {carts.map((cart) => (
            <div className="abandoned-card" key={cart._id}>
              <div className="abandoned-card-head">
                <div className="abandoned-user">
                  <div className="abandoned-avatar">
                    {cart.userName?.charAt(0).toUpperCase() || "?"}
                  </div>
                  <div>
                    <strong>{cart.userName || "Anonymous"}</strong>
                    <p className="muted">
                      <MailIcon size={12} /> {cart.userEmail}
                    </p>
                  </div>
                </div>

                <div className="abandoned-meta">
                  <span
                    className={`abandoned-badge ${
                      cart.isRecovered ? "recovered" : "active"
                    }`}
                  >
                    {cart.isRecovered ? "Recovered" : "Active"}
                  </span>
                  <p className="muted">{getTimeAgo(cart.createdAt)}</p>
                </div>
              </div>

              <div className="abandoned-items">
                {cart.items.slice(0, 3).map((item, idx) => (
                  <div className="abandoned-item" key={idx}>
                    <div className="abandoned-item-icon">
                      {item.image ? (
                        <img src={item.image} alt={item.name} />
                      ) : (
                        <span>{item.icon}</span>
                      )}
                    </div>
                    <div className="abandoned-item-info">
                      <strong>{item.name}</strong>
                      <span className="muted">
                        Rs. {item.price.toLocaleString()} × {item.quantity}
                      </span>
                    </div>
                  </div>
                ))}
                {cart.items.length > 3 && (
                  <p className="muted abandoned-more">
                    +{cart.items.length - 3} more items
                  </p>
                )}
              </div>

              <div className="abandoned-card-foot">
                <div className="abandoned-total">
                  <MoneyIcon size={16} />
                  <strong>Rs. {cart.total.toLocaleString()}</strong>
                </div>

                <div className="abandoned-actions">
                  {cart.notifiedAt && (
                    <span className="abandoned-notified">
                      <BellIcon size={12} /> Notified {cart.reminderCount}×
                    </span>
                  )}
                  <button
                    className="admin-del-btn"
                    onClick={() => handleDelete(cart._id)}
                    title="Delete"
                  >
                    <TrashIcon size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AdminAbandonedCartsPage;