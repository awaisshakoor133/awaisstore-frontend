import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

function SignupPage() {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signup(form);
      toast.success(`Welcome ${form.name}! 🎉`);
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.error || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-icon">👤</div>
          <h1>Create Account</h1>
          <p className="muted">Join Awais Mobile-Zone today</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Awais Shakoor"
              required
            />
          </div>

          <div className="field">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="awais@example.com"
              required
            />
          </div>

          <div className="field">
            <label>Phone</label>
            <input
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="03352494258"
              required
            />
          </div>

          <div className="field">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="At least 6 characters"
              minLength={6}
              required
            />
          </div>

          <button type="submit" className="place-order-btn" disabled={loading}>
            {loading ? "Creating Account..." : "Create Account ✅"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{" "}
            <Link to="/login" className="auth-link">
              Login here
            </Link>
          </p>
          <Link to="/" className="auth-back">
            ← Back to store
          </Link>
        </div>
      </div>
    </div>
  );
}

export default SignupPage;