import { useState } from "react";
import toast from "react-hot-toast";

const ADMIN_PASSWORD = "awais-admin-2026";

function AdminLogin({ onLogin }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (password === ADMIN_PASSWORD) {
      localStorage.setItem("awais-admin-auth", "true");
      toast.success("Welcome back, Admin! 🔓", { duration: 2000 });
      onLogin();
    } else {
      setError("Galat password! Dobara try karo.");
      setPassword("");
      toast.error("Galat password! 🔒");
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-icon">🔐</div>
        <h1>Admin Panel</h1>
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
            Unlock Dashboard 🔓
          </button>
        </form>

        <a href="/" className="admin-back-link">
          ← Wapas Store pe jao
        </a>
      </div>
    </div>
  );
}

export default AdminLogin;