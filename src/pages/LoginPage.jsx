import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import {
  LockIconSmall,
  MailIcon,
  LogInIcon,
  ArrowLeftIcon,
} from "../components/StoreIcons";

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(form);
      toast.success("Welcome back!");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">
            <LockIconSmall size={32} />
          </div>
          <h1>Welcome Back</h1>
          <p className="muted">Login to your Awais Mobile-Zone account</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field">
            <label>
              <MailIcon size={14} />
              <span>Email</span>
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="awais@example.com"
              required
              autoFocus
            />
          </div>

          <div className="field">
            <label>
              <LockIconSmall size={14} />
              <span>Password</span>
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Your password"
              required
            />
          </div>

          <button type="submit" className="place-order-btn" disabled={loading}>
            {loading ? (
              "Logging in..."
            ) : (
              <>
                <LogInIcon size={16} />
                <span>Login</span>
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            New here?{" "}
            <Link to="/signup" className="auth-link">
              Create an account
            </Link>
          </p>
          <Link to="/" className="auth-back">
            <ArrowLeftIcon size={14} />
            <span>Back to store</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;