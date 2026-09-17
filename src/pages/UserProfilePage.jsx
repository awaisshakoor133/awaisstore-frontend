import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import AddressBook from "../components/AddressBook";

function UserProfilePage() {
  const navigate = useNavigate();
  const { user, updateProfile, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
  });

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    setForm({
      name: user.name || "",
      phone: user.phone || "",
      address: user.address || "",
      city: user.city || "",
    });
  }, [user, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await updateProfile(form);
      toast.success("Profile updated successfully ✅");
    } catch (err) {
      toast.error(err.response?.data?.error || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!user) return null;

  return (
    <div className="auth-page">
      <div className="auth-card profile-card">
        <div className="auth-header">
          <div className="auth-icon">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <h1>{user.name}</h1>
          <p className="muted">{user.email}</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
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
              required
            />
          </div>

          <div className="field">
            <label>Address</label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Street address"
            />
          </div>

          <div className="field">
            <label>City</label>
            <input
              type="text"
              name="city"
              value={form.city}
              onChange={handleChange}
              placeholder="Karachi"
            />
          </div>

          <button
            type="submit"
            className="place-order-btn"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes ✅"}
          </button>
        </form>

        <div className="profile-actions">
          <Link to="/orders" className="auth-link">
            📦 My Orders
          </Link>
          <button onClick={handleLogout} className="auth-logout-btn">
            🚪 Logout
          </button>
        </div>
        <AddressBook />
      </div>
    </div>
  );
}

export default UserProfilePage;