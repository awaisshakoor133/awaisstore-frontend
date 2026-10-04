import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  ProductsIcon,
  OrdersIcon,
  RevenueIcon,
  PendingIcon,
  ArrowRightIcon,
} from "./AdminIcons";
import { AdminDashboardSkeleton } from "./Skeleton";

const API = import.meta.env.VITE_API_URL;

function AdminDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    revenue: 0,
    pending: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [productsRes, ordersRes] = await Promise.all([
        axios.get(`${API}/products`),
        axios.get(`${API}/orders`),
      ]);

      const products = productsRes.data;
      const orders = ordersRes.data;

      const revenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
      const pending = orders.filter(
  (o) =>
    o.status === "Pending" ||
    o.status === "Confirmed" ||
    o.status === "Shipped" ||
    o.status === "Out for Delivery"
).length;

      setStats({
        products: products.length,
        orders: orders.length,
        revenue,
        pending,
      });

      setRecentOrders(orders.slice(0, 5));
    } catch (err) {
      console.error("Stats fetch error:", err);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

 if (loading) {
  return <AdminDashboardSkeleton />;
}

  return (
    <div className="admin-dashboard-content">
      {/* Stats Cards */}
      <div className="admin-stats">
        <div className="stat-card">
          <div className="stat-icon-wrap">
            <ProductsIcon size={22} />
          </div>
          <div>
            <p className="stat-label">Total Products</p>
            <h3>{stats.products}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap">
            <OrdersIcon size={22} />
          </div>
          <div>
            <p className="stat-label">Total Orders</p>
            <h3>{stats.orders}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap">
            <RevenueIcon size={22} />
          </div>
          <div>
            <p className="stat-label">Total Revenue</p>
            <h3>Rs. {stats.revenue.toLocaleString()}</h3>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-wrap">
            <PendingIcon size={22} />
          </div>
          <div>
            <p className="stat-label">Pending Orders</p>
            <h3>{stats.pending}</h3>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="admin-quick-actions">
        <h2>Quick Actions</h2>
        <div className="quick-actions-grid">
          <Link to="/admin/products" className="quick-action-card">
            <div className="quick-action-icon-wrap">
              <ProductsIcon size={22} />
            </div>
            <span className="quick-action-label">Manage Products</span>
            <span className="quick-action-arrow">
              <ArrowRightIcon size={18} />
            </span>
          </Link>

          <Link to="/admin/orders" className="quick-action-card">
            <div className="quick-action-icon-wrap">
              <OrdersIcon size={22} />
            </div>
            <span className="quick-action-label">View Orders</span>
            <span className="quick-action-arrow">
              <ArrowRightIcon size={18} />
            </span>
          </Link>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="admin-recent-orders">
        <div className="admin-section-head">
          <h2>Recent Orders</h2>
          <Link to="/admin/orders" className="admin-view-all">
            View All →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="admin-empty">
            <p>No order has been received yet.</p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <strong>#{order._id?.slice(-6)}</strong>
                    </td>
                    <td>{order.customer?.name || "N/A"}</td>
                    <td>Rs. {order.total?.toLocaleString() || 0}</td>
                    <td>
                      <span
                        className={`admin-badge status-${order.status?.toLowerCase()}`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="muted">
                      {new Date(order.createdAt).toLocaleDateString()}
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

export default AdminDashboard;