import { useState } from "react";
import toast from "react-hot-toast";
import {
  LockIcon,
  UnlockIcon,
  ArrowLeftIcon,
} from "./AdminIcons";

const ADMIN_PASSWORD = "awais-admin-2026";

function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (password === ADMIN_PASSWORD) {
      localStorage.setItem("awais-admin-auth", "true");
      toast.success("Welcome back, Admin!", { duration: 2000 });
      onLogin();
    } else {
      setError("Galat password! Dobara try karo.");
      setPassword("");
      toast.error("Galat password!");
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-icon">
          <LockIcon size={32} />
        </div>

        <h1>Awais Mobile-Zone</h1>
        <p className="eyebrow">— ADMIN PANEL</p>
        <p className="muted">Enter password to access dashboard</p>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Admin Password</label>
            <input
              type="password"
              placeholder="••••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              autoFocus
              required
            />
          </div>

          {error && <p className="admin-error">{error}</p>}

          <button type="submit" className="place-order-btn">
            <UnlockIcon size={16} />
            <span>Unlock Dashboard</span>
          </button>
        </form>

        <a href="/" className="admin-back-link">
          <ArrowLeftIcon size={14} />
          <span>Wapas Store pe jao</span>
        </a>
      </div>
    </div>
  );
}

export default AdminLogin;