import { useState, useEffect } from "react";
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
} from "../components/StoreIcons";
import { chatOnWhatsApp } from "../utils/whatsapp";

const API = import.meta.env.VITE_API_URL;

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

  // ============ FETCH ORDER ============
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axios.get(`${API}/orders`);
        const found = res.data.find((o) => o._id === id);

        if (!found) {
          toast.error("Order not found");
          navigate("/orders");
          return;
        }

        setOrder(found);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load order");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, navigate]);

  // ============ LOADING ============
  if (loading) {
    return (
      <section className="order-tracking-page">
        <div className="empty-state">
          <h3>Loading order...</h3>
        </div>
      </section>
    );
  }

  if (!order) return null;

  // ============ CURRENT STATUS INDEX ============
  const currentStepIndex = STATUS_STEPS.findIndex(
    (s) => s.key === order.status
  );

  const isCancelled = order.status === "Cancelled";

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

  // ============ WHATSAPP SUPPORT ============
  const contactSupport = () => {
    const msg = `Assalam-o-Alaikum!%0A%0AI need help with my order:%0A%0A*Order ID:* #${order._id.slice(-6).toUpperCase()}%0A*Status:* ${order.status}%0A*Total:* Rs. ${order.total.toLocaleString()}%0A%0APlease assist.`;
    chatOnWhatsApp(msg);
  };

  return (
    <section className="order-tracking-page">
      {/* BACK BUTTON */}
      <button className="back-btn" onClick={() => navigate("/orders")}>
        <ArrowLeftIcon size={16} />
        <span>Back to Orders</span>
      </button>

      {/* HEADER */}
      <div className="order-tracking-header">
        <div>
          <p className="eyebrow">— ORDER DETAILS</p>
          <h1>Order #{order._id.slice(-6).toUpperCase()}</h1>
          <p className="muted">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>
        <span className={`order-status-badge ${getStatusClass(order.status)}`}>
          {order.status}
        </span>
      </div>

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

      {/* TRACKING TIMELINE */}
      {!isCancelled && (
        <div className="order-timeline-section">
          <h2>Order Tracking</h2>

          <div className="order-timeline">
            {STATUS_STEPS.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;

              // Get timestamp from history
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
        <h2>Products</h2>
        <div className="order-detail-products">
          {order.products?.map((item, idx) => (
            <div className="order-detail-product" key={idx}>
              <div className="order-detail-icon">
                {item.icon || <CartIcon size={20} />}
              </div>
              <div className="order-detail-info">
                <strong>{item.name}</strong>
                <span>Rs. {item.price?.toLocaleString()} × {item.quantity}</span>
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