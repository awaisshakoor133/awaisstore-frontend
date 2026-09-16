import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import AdminProducts from "./AdminProducts";
import AdminOrders from "./AdminOrders";

const API = import.meta.env.VITE_API_URL;

function AdminDashboard({ onLogout }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState("products");
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    revenue: 0,
  });

  const fetchStats = async () => {
    try {
      const [productsRes, ordersRes] = await Promise.all([
        axios.get(`${API}/products`),
        axios.get(`${API}/orders`),
      ]);

      const orders = ordersRes.data;
      const revenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);

      setStats({
        products: productsRes.data.length,
        orders: orders.length,
        revenue,
      });
    } catch (err) {
      console.error("Stats fetch error:", err);
      toast.error("Stats load nahi ho paaye");
    }
  };

  useEffect(() => {
    fetchStats();
  }, [tab]);

  const handleLogout = () => {
    localStorage.removeItem("awais-admin-auth");
    onLogout();
    toast.success("Logged out successfully 👋");
    navigate("/");
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-header-left">
          <div className="logo">
          <img src="/logo.svg" alt="Awais Mobile-Zone" className="brand-logo" />
         </div>
        </div>

        <div className="admin-header-right">
          <a href="/" className="admin-view-store">
            🏠 View Store
          </a>
          <button className="admin-logout" onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </header>

      <div className="admin-body">
        <div className="admin-stats">
          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div>
              <p className="stat-label">Total Products</p>
              <h3>{stats.products}</h3>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🛒</div>
            <div>
              <p className="stat-label">Total Orders</p>
              <h3>{stats.orders}</h3>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div>
              <p className="stat-label">Total Revenue</p>
              <h3>Rs. {stats.revenue.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        <div className="admin-tabs">
          <button
            className={tab === "products" ? "admin-tab active" : "admin-tab"}
            onClick={() => setTab("products")}
          >
            📦 Products
          </button>
          <button
            className={tab === "orders" ? "admin-tab active" : "admin-tab"}
            onClick={() => setTab("orders")}
          >
            🛒 Orders
          </button>
        </div>

        <div className="admin-content">
          {tab === "products" && <AdminProducts refreshStats={fetchStats} />}
          {tab === "orders" && <AdminOrders refreshStats={fetchStats} />}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;