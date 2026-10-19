import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  BellIcon,
  TrashIcon,
  CheckIcon,
  CloseIcon,
  ClockIcon,
  UserIcon,
  PackageIconSmall,
  ArrowRightIcon,
} from "../components/StoreIcons";

const API = import.meta.env.VITE_API_URL;

const QUICK_TEMPLATES = [
  {
    label: "🔥 Sale Announcement",
    title: "🔥 Mega Sale is LIVE!",
    body: "Up to 50% OFF on all products. Limited time only!",
    url: "/products",
  },
  {
    label: "✨ New Arrivals",
    title: "✨ New Arrivals Just Dropped!",
    body: "Check out the latest smartphones and accessories.",
    url: "/products",
  },
  {
    label: "🚚 Free Shipping",
    title: "🚚 Free Shipping Available!",
    body: "Free delivery on all orders above Rs. 5,000.",
    url: "/products",
  },
  {
    label: "🎁 Special Offer",
    title: "🎁 Exclusive 10% OFF for you!",
    body: "Use code WELCOME10 on your next order.",
    url: "/products",
  },
];

function AdminNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  // Form
  const [form, setForm] = useState({
    title: "",
    body: "",
    url: "/products",
    icon: "/icon-192.png",
    targetType: "all",
    targetEmail: "",
  });

  // ============ FETCH HISTORY ============
  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API}/notifications/history`);
      setNotifications(res.data.notifications);
      setStats(res.data.stats);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  // ============ HANDLERS ============
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const applyTemplate = (template) => {
    setForm({
      ...form,
      title: template.title,
      body: template.body,
      url: template.url,
    });
    toast.success("Template loaded");
  };

  const handleSend = async (testOnly = false) => {
    if (!form.title.trim() || !form.body.trim()) {
      toast.error("Title and body required");
      return;
    }

    if (form.targetType === "specific" && !form.targetEmail.trim()) {
      toast.error("Please enter target email");
      return;
    }

    setSending(true);
    const loadToast = toast.loading(
      testOnly ? "Sending test..." : "Sending notification..."
    );

    try {
      const payload = {
        title: form.title.trim(),
        body: form.body.trim(),
        url: form.url || "/",
        icon: form.icon || "/icon-192.png",
      };

      // Test mode — only to admin
      if (testOnly) {
        payload.userEmail = "awaisshakoor133@gmail.com";
      } else if (form.targetType === "specific") {
        payload.userEmail = form.targetEmail.trim();
      }

      const res = await axios.post(`${API}/notifications/send`, payload);

      if (res.data.success) {
        if (testOnly) {
          toast.success("Test notification sent!", { id: loadToast });
        } else {
          toast.success(
            `Sent to ${res.data.sent}/${res.data.total} devices`,
            { id: loadToast }
          );
          // Reset form
          setForm({
            title: "",
            body: "",
            url: "/products",
            icon: "/icon-192.png",
            targetType: "all",
            targetEmail: "",
          });
        }
        fetchHistory();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Send failed", {
        id: loadToast,
      });
    } finally {
      setSending(false);
    }
  };

  // ============ HELPERS ============
  const formatDate = (date) => {
    return new Date(date).toLocaleString("en-PK", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTimeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (loading) return <p className="muted">Loading notifications...</p>;

  return (
    <div className="admin-section">
      <div className="admin-section-head">
        <h2>Push Notifications</h2>
      </div>

      {/* STATS */}
      {stats && (
        <div className="notif-stats">
          <div className="notif-stat">
            <div className="notif-stat-icon">
              <BellIcon size={22} />
            </div>
            <div>
              <p className="stat-label">Total Sent</p>
              <h3>{stats.totalNotificationsSent}</h3>
            </div>
          </div>
          <div className="notif-stat">
            <div className="notif-stat-icon">
              <PackageIconSmall size={22} />
            </div>
            <div>
              <p className="stat-label">Campaigns</p>
              <h3>{stats.total}</h3>
            </div>
          </div>
        </div>
      )}

      {/* COMPOSE */}
      <div className="notif-compose">
        <div className="notif-compose-header">
          <h3>Send New Notification</h3>
          <p className="muted">Send to all subscribers or specific user</p>
        </div>

        {/* Quick Templates */}
        <div className="notif-templates">
          <p className="notif-label">Quick Templates:</p>
          <div className="notif-template-chips">
            {QUICK_TEMPLATES.map((t) => (
              <button
                type="button"
                key={t.label}
                className="notif-template-chip"
                onClick={() => applyTemplate(t)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(false);
          }}
          className="notif-form"
        >
          {/* Title */}
          <div className="notif-field">
            <label>Title ({form.title.length}/100)</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="🔥 Mega Sale is LIVE!"
              maxLength={100}
              required
            />
          </div>

          {/* Body */}
          <div className="notif-field">
            <label>Message ({form.body.length}/300)</label>
            <textarea
              name="body"
              value={form.body}
              onChange={handleChange}
              placeholder="Up to 50% OFF on all products..."
              maxLength={300}
              rows={3}
              required
            />
          </div>

          {/* URL */}
          <div className="notif-field">
            <label>Click URL (where to go)</label>
            <input
              type="text"
              name="url"
              value={form.url}
              onChange={handleChange}
              placeholder="/products"
            />
          </div>

          {/* Target */}
          <div className="notif-field">
            <label>Target Audience</label>
            <div className="notif-target-tabs">
              <button
                type="button"
                className={form.targetType === "all" ? "active" : ""}
                onClick={() =>
                  setForm({ ...form, targetType: "all", targetEmail: "" })
                }
              >
                🌐 All Subscribers
              </button>
              <button
                type="button"
                className={form.targetType === "specific" ? "active" : ""}
                onClick={() => setForm({ ...form, targetType: "specific" })}
              >
                👤 Specific User
              </button>
            </div>
          </div>

          {/* Target Email */}
          {form.targetType === "specific" && (
            <div className="notif-field">
              <label>User Email</label>
              <input
                type="email"
                name="targetEmail"
                value={form.targetEmail}
                onChange={handleChange}
                placeholder="user@example.com"
              />
            </div>
          )}

          {/* Preview */}
          {form.title && (
            <div className="notif-preview">
              <p className="notif-label">Preview:</p>
              <div className="notif-preview-card">
                <div className="notif-preview-icon">
                  <BellIcon size={20} />
                </div>
                <div className="notif-preview-content">
                  <strong>{form.title}</strong>
                  <p>{form.body}</p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="notif-actions">
            <button
              type="button"
              className="notif-btn test"
              onClick={() => handleSend(true)}
              disabled={sending || !form.title || !form.body}
            >
              Send Test
            </button>
            <button
              type="submit"
              className="notif-btn send"
              disabled={sending || !form.title || !form.body}
            >
              <BellIcon size={16} />
              <span>{sending ? "Sending..." : "Send to All"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* HISTORY */}
      <div className="notif-history">
        <h3>Recent Notifications ({notifications.length})</h3>

        {notifications.length === 0 ? (
          <div className="admin-empty">
            <p>No notifications sent yet.</p>
          </div>
        ) : (
          <div className="notif-history-list">
            {notifications.map((notif) => (
              <div className="notif-history-item" key={notif._id}>
                <div
                  className={`notif-history-icon notif-${notif.status}`}
                >
                  <BellIcon size={18} />
                </div>

                <div className="notif-history-content">
                  <div className="notif-history-head">
                    <strong>{notif.title}</strong>
                    <span className={`notif-status-badge ${notif.status}`}>
                      {notif.status}
                    </span>
                  </div>
                  <p className="notif-history-body">{notif.body}</p>
                  <div className="notif-history-meta">
                    <span>
                      <CheckIcon size={12} /> {notif.sent} sent
                    </span>
                    {notif.failed > 0 && (
                      <span className="notif-failed">
                        <CloseIcon size={12} /> {notif.failed} failed
                      </span>
                    )}
                    <span>
                      {notif.targetType === "all" ? (
                        <>🌐 All subscribers</>
                      ) : (
                        <>
                          <UserIcon size={12} /> {notif.targetEmail}
                        </>
                      )}
                    </span>
                    <span>
                      <ClockIcon size={12} /> {getTimeAgo(notif.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminNotificationsPage;