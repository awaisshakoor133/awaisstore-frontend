import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import {
  ArrowLeftIcon,
  CheckIcon,
  TruckIcon,
  PackageIconSmall,
  HomeIcon,
  CloseIcon,
  WhatsAppIcon,
  CartIcon,
  MapPinIcon,
  PhoneIcon,
  UserIcon,
  MoneyIcon,
  LinkIcon,
  ClockIcon,
} from "../components/StoreIcons";
import { chatOnWhatsApp } from "../utils/whatsapp";
import { OrderTrackingSkeleton } from "../components/Skeleton";

const API = import.meta.env.VITE_API_URL;
const REFRESH_INTERVAL = 30000; // 30 seconds

// ============ STATUS STEPS ============
const STATUS_STEPS = [
  { key: "Pending", label: "Order Placed", icon: CheckIcon },
  { key: "Confirmed", label: "Confirmed", icon: CheckIcon },
  { key: "Shipped", label: "Shipped", icon: TruckIcon },
  { key: "Out for Delivery", label: "Out for Delivery", icon: PackageIconSmall },
  { key: "Delivered", label: "Delivered", icon: HomeIcon },
];

function OrderTrackingPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const previousStatus = useRef(null);

  // ============ FETCH ORDER ============
  const fetchOrder = async (silent = false) => {
    if (!silent) setLoading(true);
    if (silent) setRefreshing(true);

    try {
      const res = await axios.get(`${API}/orders`);
      const found = res.data.find((o) => o._id === id);

      if (!found) {
        toast.error("Order not found");
        navigate("/orders");
        return;
      }

      // Check status change
      if (
        previousStatus.current &&
        previousStatus.current !== found.status
      ) {
        toast.success(`Status updated: ${found.status}`, {
          icon: <CheckIcon size={18} />,
        });
      }

      previousStatus.current = found.status;
      setOrder(found);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
      if (!silent) toast.error("Failed to load order");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ============ INITIAL FETCH ============
  useEffect(() => {
    fetchOrder();
  }, [id, navigate]);

  // ============ AUTO REFRESH ============
  useEffect(() => {
    const interval = setInterval(() => {
      fetchOrder(true);
    }, REFRESH_INTERVAL);

    // Refresh on window focus
    const handleFocus = () => fetchOrder(true);
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [id]);

  // ============ LOADING ============
  if (loading) {
    return <OrderTrackingSkeleton />;
  }

  if (!order) return null;

  // ============ CURRENT STATUS INDEX ============
  const currentStepIndex = STATUS_STEPS.findIndex(
    (s) => s.key === order.status
  );

  const isCancelled = order.status === "Cancelled";

  // ============ PROGRESS ============
  const progress =
    currentStepIndex >= 0
      ? ((currentStepIndex + 1) / STATUS_STEPS.length) * 100
      : 0;

  // ============ ESTIMATED DELIVERY ============
  const estimatedDelivery = new Date(
    new Date(order.createdAt).getTime() + 5 * 24 * 60 * 60 * 1000
  );

  const formatEstimatedDate = (date) => {
    return date.toLocaleDateString("en-PK", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  // ============ HELPERS ============
  const getStatusClass = (status) => {
    const map = {
      Pending: "status-pending",
      Confirmed: "status-confirmed",
      Shipped: "status-shipped",
      "Out for Delivery": "status-out",
      Delivered: "status-delivered",
      Cancelled: "status-cancelled",
    };
    return map[status] || "status-pending";
  };

  const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleString("en-PK", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTimeAgo = (date) => {
    if (!date) return "";
    const diff = Date.now() - new Date(date).getTime();
    const secs = Math.floor(diff / 1000);
    if (secs < 10) return "just now";
    if (secs < 60) return `${secs}s ago`;
    const mins = Math.floor(secs / 60);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    return `${hours}h ago`;
  };

  // ============ COPY ORDER ID ============
  const copyOrderId = async () => {
    const orderId = order._id.slice(-6).toUpperCase();
    try {
      await navigator.clipboard.writeText(orderId);
      toast.success(`Order ID #${orderId} copied!`, {
        icon: <CheckIcon size={18} />,
      });
    } catch {
      toast.error("Failed to copy");
    }
  };

  // ============ WHATSAPP SUPPORT ============
  const contactSupport = () => {
    const msg = `Assalam-o-Alaikum!%0A%0AI need help with my order:%0A%0A*Order ID:* #${order._id
      .slice(-6)
      .toUpperCase()}%0A*Status:* ${order.status}%0A*Total:* Rs. ${order.total.toLocaleString()}%0A%0APlease assist.`;
    chatOnWhatsApp(msg);
  };

  return (
    <section className="order-tracking-page">
      {/* BACK BUTTON + LAST UPDATED */}
      <div className="order-tracking-topbar">
        <button className="back-btn" onClick={() => navigate("/orders")}>
          <ArrowLeftIcon size={16} />
          <span>Back to Orders</span>
        </button>

        <div className="last-updated">
          {refreshing ? (
            <span className="refreshing">
              <span className="refresh-dot" />
              Refreshing...
            </span>
          ) : (
            lastUpdated && (
              <span>
                <ClockIcon size={12} /> Updated {formatTimeAgo(lastUpdated)}
              </span>
            )
          )}
        </div>
      </div>

      {/* HEADER */}
      <div className="order-tracking-header">
        <div>
          <p className="eyebrow">— ORDER DETAILS</p>
          <h1 className="order-id-heading">
            Order #{order._id.slice(-6).toUpperCase()}
            <button
              className="copy-id-btn"
              onClick={copyOrderId}
              title="Copy Order ID"
              aria-label="Copy Order ID"
            >
              <LinkIcon size={14} />
            </button>
          </h1>
          <p className="muted">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <span className={`order-status-badge ${getStatusClass(order.status)}`}>
          {order.status}
        </span>
      </div>

      {/* ESTIMATED DELIVERY (only if not delivered/cancelled) */}
      {!isCancelled && order.status !== "Delivered" && (
        <div className="estimated-delivery">
          <div className="estimated-icon">
            <TruckIcon size={22} />
          </div>
          <div className="estimated-info">
            <p className="estimated-label">Estimated Delivery</p>
            <strong>{formatEstimatedDate(estimatedDelivery)}</strong>
            <p className="estimated-note">
              Usually delivers in 3-5 business days
            </p>
          </div>
        </div>
      )}

      {/* CANCELLED NOTICE */}
      {isCancelled && (
        <div className="order-cancelled-notice">
          <CloseIcon size={18} />
          <div>
            <strong>Order Cancelled</strong>
            <p>This order has been cancelled. Contact support for help.</p>
          </div>
        </div>
      )}

      {/* PROGRESS BAR (only if not cancelled) */}
      {!isCancelled && (
        <div className="order-progress-section">
          <div className="order-progress-header">
            <span>Order Progress</span>
            <strong>{Math.round(progress)}%</strong>
          </div>
          <div className="order-progress-bar">
            <div
              className="order-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* TRACKING TIMELINE */}
      {!isCancelled && (
        <div className="order-timeline-section">
          <h2>Order Tracking</h2>

          <div className="order-timeline">
            {STATUS_STEPS.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;

              const historyEntry = order.statusHistory?.find(
                (h) => h.status === step.key
              );

              return (
                <div
                  key={step.key}
                  className={`timeline-step ${
                    isCompleted ? "completed" : ""
                  } ${isCurrent ? "current" : ""}`}
                >
                  <div className="timeline-icon">
                    <Icon size={18} />
                  </div>
                  <div className="timeline-content">
                    <strong>{step.label}</strong>
                    <p className="muted">
                      {historyEntry
                        ? formatDate(historyEntry.timestamp)
                        : isCompleted
                        ? "Completed"
                        : "Pending"}
                    </p>
                  </div>
                  {index < STATUS_STEPS.length - 1 && (
                    <div className="timeline-line" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PRODUCTS */}
      <div className="order-detail-section">
        <h2>Products ({order.products?.length || 0})</h2>
        <div className="order-detail-products">
          {order.products?.map((item, idx) => (
            <div className="order-detail-product" key={idx}>
              <div className="order-detail-icon">
                {item.icon || <CartIcon size={20} />}
              </div>
              <div className="order-detail-info">
                <strong>{item.name}</strong>
                <span>
                  Rs. {item.price?.toLocaleString()} × {item.quantity}
                </span>
              </div>
              <strong className="order-detail-price">
                Rs. {(item.price * item.quantity).toLocaleString()}
              </strong>
            </div>
          ))}
        </div>
      </div>

      {/* CUSTOMER INFO */}
      <div className="order-detail-section">
        <h2>Delivery Details</h2>
        <div className="order-detail-grid">
          <div className="order-detail-row">
            <UserIcon size={16} />
            <span>{order.customer?.name}</span>
          </div>
          <div className="order-detail-row">
            <PhoneIcon size={16} />
            <span>{order.customer?.phone}</span>
          </div>
          <div className="order-detail-row">
            <MapPinIcon size={16} />
            <span>
              {order.customer?.address}, {order.customer?.city}
            </span>
          </div>
          <div className="order-detail-row">
            <MoneyIcon size={16} />
            <span>{order.customer?.payment}</span>
          </div>
        </div>
      </div>

      {/* TOTAL */}
      <div className="order-detail-total">
        <span>Total Amount</span>
        <strong>Rs. {order.total?.toLocaleString()}</strong>
      </div>

      {/* ACTIONS */}
      <div className="order-detail-actions">
        <button className="whatsapp-support-btn" onClick={contactSupport}>
          <WhatsAppIcon size={18} />
          <span>Contact Support</span>
        </button>
        <Link to="/products" className="reorder-btn">
          <CartIcon size={18} />
          <span>Order Again</span>
        </Link>
      </div>
    </section>
  );
}

export default OrderTrackingPage;