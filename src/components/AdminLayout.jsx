import {
  DashboardIcon,
  AnalyticsIcon,
  ProductsIcon,
  OrdersIcon,
  CustomersIcon,
  CouponIcon,
  ReviewsIcon,
  StoreIcon,
  LogoutIcon,
  AdminShieldIcon,
} from "./AdminIcons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

function AdminLayout({ children, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("awais-admin-auth");
    onLogout?.();
    toast.success("Logged out successfully 👋");
    navigate("/");
  };

  const menuItems = [
    { path: "/admin", label: "Dashboard", Icon: DashboardIcon },
    { path: "/admin/analytics", label: "Analytics", Icon: AnalyticsIcon },
    { path: "/admin/products", label: "Products", Icon: ProductsIcon },
    { path: "/admin/orders", label: "Orders", Icon: OrdersIcon },
    { path: "/admin/customers", label: "Customers", Icon: CustomersIcon },
     { path: "/admin/coupons", label: "Coupons", Icon: CouponIcon },
     { path: "/admin/reviews", label: "Reviews", Icon: ReviewsIcon },
  ];

  const getActiveLabel = () => {
    const found = menuItems.find((item) => {
      if (item.path === "/admin") {
        return location.pathname === "/admin";
      }
      return location.pathname.startsWith(item.path);
    });
    return found?.label || "Admin";
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-header">
          <Link to="/" className="admin-logo">
            <span className="logo-mark">AM</span>
            <span className="logo-text">
              Awais<em>Admin</em>
            </span>
          </Link>
        </div>

        <nav className="admin-nav">
          {menuItems.map((item) => {
            const isActive =
              item.path === "/admin"
                ? location.pathname === "/admin"
                : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`admin-nav-item ${isActive ? "active" : ""}`}
              >
                <span className="admin-nav-icon">
                  <item.Icon size={18} />
                </span>
                <span className="admin-nav-label">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="admin-sidebar-footer">
          <Link to="/" className="admin-view-store">
            <StoreIcon size={16} />
            <span>View Store</span>
          </Link>
          <button className="admin-logout-btn" onClick={handleLogout}>
            <LogoutIcon size={16} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-topbar">
          <h1 className="admin-page-title">{getActiveLabel()}</h1>
          <div className="admin-topbar-right">
            <span className="admin-user-badge">
              <AdminShieldIcon size={14} />
              <span>Admin</span>
            </span>
          </div>
        </header>

        <div className="admin-content">{children}</div>
      </main>
    </div>
  );
}

export default AdminLayout;