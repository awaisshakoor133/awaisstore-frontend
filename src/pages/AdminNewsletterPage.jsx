import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  MailIcon,
  TrashIcon,
  CheckIcon,
  CloseIcon,
} from "../components/StoreIcons";

const API = import.meta.env.VITE_API_URL;

function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  // Compose form
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [testEmail, setTestEmail] = useState("");
  const [sending, setSending] = useState(false);

  // ============ FETCH SUBSCRIBERS ============
  const fetchSubscribers = async () => {
    try {
      const activeParam =
        filter === "all" ? "" : `?active=${filter === "active"}`;
      const res = await axios.get(`${API}/newsletter/subscribers${activeParam}`);
      setSubscribers(res.data.subscribers);
      setStats(res.data.stats);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load subscribers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, [filter]);

  // ============ SEND CAMPAIGN ============
  const handleSend = async (testOnly = false) => {
    if (!subject.trim() || !content.trim()) {
      toast.error("Subject and content required");
      return;
    }

    if (testOnly && !testEmail.trim()) {
      toast.error("Enter test email address");
      return;
    }

    setSending(true);
    const loadToast = toast.loading(
      testOnly ? "Sending test email..." : "Sending campaign..."
    );

    try {
      const res = await axios.post(`${API}/newsletter/send`, {
        subject: subject.trim(),
        html: content.trim(),
        testEmail: testOnly ? testEmail.trim() : undefined,
      });

      if (res.data.mode === "test") {
        toast.success(res.data.message, { id: loadToast });
      } else {
        toast.success(
          `Sent to ${res.data.sent}/${res.data.total} subscribers!`,
          { id: loadToast }
        );
        setSubject("");
        setContent("");
        fetchSubscribers();
      }
    } catch (err) {
      toast.error(err.response?.data?.error || "Send failed", {
        id: loadToast,
      });
    } finally {
      setSending(false);
    }
  };

  // ============ DELETE SUBSCRIBER ============
  const handleDelete = async (id, email) => {
    if (!window.confirm(`Delete ${email}?`)) return;

    try {
      await axios.delete(`${API}/newsletter/${id}`);
      toast.success("Deleted");
      fetchSubscribers();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  // ============ FORMAT DATE ============
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-PK", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) return <p className="muted">Loading newsletter...</p>;

  return (
    <div className="admin-section">
      <div className="admin-section-head">
        <h2>Newsletter</h2>
      </div>

      {/* STATS */}
      {stats && (
        <div className="newsletter-stats">
          <div className="newsletter-stat">
            <div className="newsletter-stat-icon">
              <MailIcon size={22} />
            </div>
            <div>
              <p className="stat-label">Total</p>
              <h3>{stats.total}</h3>
            </div>
          </div>

          <div className="newsletter-stat">
            <div className="newsletter-stat-icon active">
              <CheckIcon size={22} />
            </div>
            <div>
              <p className="stat-label">Active</p>
              <h3>{stats.active}</h3>
            </div>
          </div>

          <div className="newsletter-stat">
            <div className="newsletter-stat-icon">
              <CloseIcon size={22} />
            </div>
            <div>
              <p className="stat-label">Unsubscribed</p>
              <h3>{stats.unsubscribed}</h3>
            </div>
          </div>

          <div className="newsletter-stat highlight">
            <div>
              <p className="stat-label">This Month</p>
              <h3>+{stats.thisMonth}</h3>
            </div>
          </div>
        </div>
      )}

      {/* COMPOSE CAMPAIGN */}
      <div className="newsletter-compose">
        <h3>Send Campaign</h3>

        <div className="compose-field">
          <label>Subject</label>
          <input
            type="text"
            placeholder="e.g. 🔥 Mega Sale 50% OFF - This Weekend Only!"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            maxLength={100}
          />
        </div>

        <div className="compose-field">
          <label>Content (HTML supported)</label>
          <textarea
            placeholder="<h2>Hello!</h2><p>Check out our new arrivals...</p>"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
          />
        </div>

        <div className="compose-test">
          <input
            type="email"
            placeholder="Test email address"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
          />
          <button
            className="compose-btn test"
            onClick={() => handleSend(true)}
            disabled={sending}
          >
            Send Test
          </button>
        </div>

        <button
          className="compose-btn send"
          onClick={() => handleSend(false)}
          disabled={sending || !stats?.active}
        >
          {sending
            ? "Sending..."
            : `Send to ${stats?.active || 0} Subscribers`}
        </button>
      </div>

      {/* SUBSCRIBERS LIST */}
      <div className="newsletter-list">
        <div className="newsletter-list-head">
          <h3>Subscribers ({subscribers.length})</h3>
          <div className="newsletter-filter">
            <button
              className={filter === "all" ? "active" : ""}
              onClick={() => setFilter("all")}
            >
              All
            </button>
            <button
              className={filter === "active" ? "active" : ""}
              onClick={() => setFilter("active")}
            >
              Active
            </button>
            <button
              className={filter === "inactive" ? "active" : ""}
              onClick={() => setFilter("inactive")}
            >
              Unsubscribed
            </button>
          </div>
        </div>

        {subscribers.length === 0 ? (
          <div className="admin-empty">
            <p>No subscribers yet.</p>
          </div>
        ) : (
          <div className="newsletter-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Source</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Emails</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {subscribers.map((sub) => (
                  <tr key={sub._id}>
                    <td>
                      <strong>{sub.email}</strong>
                      {sub.name && <p className="muted">{sub.name}</p>}
                    </td>
                    <td>
                      <span className="subscriber-source">{sub.source}</span>
                    </td>
                    <td>
                      <span
                        className={`subscriber-status ${
                          sub.isActive ? "active" : "inactive"
                        }`}
                      >
                        {sub.isActive ? "Active" : "Unsubscribed"}
                      </span>
                    </td>
                    <td className="muted">{formatDate(sub.createdAt)}</td>
                    <td className="muted">{sub.emailsReceived}</td>
                    <td>
                      <button
                        className="admin-del-btn"
                        onClick={() => handleDelete(sub._id, sub.email)}
                        title="Delete"
                      >
                        <TrashIcon size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminNewsletterPage;