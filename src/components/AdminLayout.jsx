import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  DashboardIcon,
  AnalyticsIcon,
  ProductsIcon,
  OrdersIcon,
  CustomersIcon,
  CouponIcon,
  ReviewsIcon,
  FileTextIcon,
  StoreIcon,
  LogoutIcon,
  AdminShieldIcon,
} from "./AdminIcons";
import { CloseIcon, CartIcon, WaveIcon, MailIcon } from "./StoreIcons";

// ============================================================
// MOBILE BLOCK SCREEN
// ============================================================
function MobileBlockScreen() {
  return (
    <div className="admin-mobile-block">
      <div className="admin-mobile-card">
        <div className="admin-mobile-icon">
          <svg
            width="60"
            height="60"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
            <line x1="12" y1="18" x2="12.01" y2="18" />
          </svg>
        </div>

        <h2>Desktop Recommended</h2>
        <p className="muted">
          Admin panel works best on a larger screen. Please use a desktop or
          tablet for the best experience.
        </p>

        <div className="admin-mobile-actions">
          <Link to="/" className="admin-mobile-btn primary">
            <StoreIcon size={18} /> 
            <span>Back to Store</span>
          </Link>
        </div>

        <p className="admin-mobile-hint">
          💡 Tip: Rotate your phone to landscape mode or open this page on a
          computer.
        </p>
      </div>
    </div>
  );
}

// ============================================================
// ADMIN LAYOUT
// ============================================================
function AdminLayout({ children, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();

  // ============ MOBILE DETECTION ============
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkSize = () => {
      // Block if width < 900px (phones + small tablets)
      setIsMobile(window.innerWidth < 900);
    };

    checkSize();
    window.addEventListener("resize", checkSize);
    return () => window.removeEventListener("resize", checkSize);
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("awais-admin-auth");
    onLogout?.();
    toast.success("Logged out successfully", {
      icon: <WaveIcon size={18} />,
    });
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
    { path: "/admin/blogs", label: "Blogs", Icon: FileTextIcon },
    {
      path: "/admin/abandoned-carts",
      label: "Abandoned Carts",
      Icon: CartIcon,
    },
     { path: "/admin/newsletter", label: "Newsletter", Icon: MailIcon },
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

  // ============ MOBILE BLOCK ============
  if (isMobile) {
    return <MobileBlockScreen />;
  }

  // ============ DESKTOP LAYOUT ============
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