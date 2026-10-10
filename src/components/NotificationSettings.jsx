import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import {
  isPushSupported,
  getNotificationPermission,
  subscribeToPush,
  unsubscribeFromPush,
  isSubscribedToPush,
  sendTestNotification,
} from "../utils/pushNotifications";
import { BellIcon, CheckIcon, CloseIcon } from "./StoreIcons";

function NotificationSettings() {
  const { user } = useAuth();

  const [supported, setSupported] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [permission, setPermission] = useState("default");

  // ============ CHECK STATUS ============
  useEffect(() => {
  const checkStatus = async () => {
    try {
      const isSupported = isPushSupported();
      setSupported(isSupported);

      if (isSupported) {
        setPermission(getNotificationPermission());

        // Timeout safety
        const isSub = await Promise.race([
          isSubscribedToPush(),
          new Promise((resolve) => setTimeout(() => resolve(false), 3000)),
        ]);

        setSubscribed(isSub);
      }
    } catch (err) {
      console.error("Check status error:", err);
    } finally {
      setLoading(false);   // ← ALWAYS RUN
    }
  };

  checkStatus();
}, []);
  // ============ SUBSCRIBE ============
  const handleEnable = async () => {
    setLoading(true);
    const result = await subscribeToPush(user?.email || null);

    if (result.success) {
      setSubscribed(true);
      setPermission("granted");
      toast.success("Notifications enabled! 🔔");
    } else {
      toast.error(result.error || "Failed to enable");
    }

    setLoading(false);
  };

  // ============ UNSUBSCRIBE ============
  const handleDisable = async () => {
    setLoading(true);
    const result = await unsubscribeFromPush();

    if (result.success) {
      setSubscribed(false);
      toast.success("Notifications disabled");
    } else {
      toast.error(result.error || "Failed to disable");
    }

    setLoading(false);
  };

  // ============ TEST ============
  const handleTest = async () => {
    const loadToast = toast.loading("Sending test...");
    const result = await sendTestNotification();

    if (result.success) {
      toast.success(`Sent to ${result.sent} devices!`, { id: loadToast });
    } else {
      toast.error(result.error || "Test failed", { id: loadToast });
    }
  };

  // ============ NOT SUPPORTED ============
  if (!supported) {
    return (
      <div className="notification-settings not-supported">
        <div className="notification-icon-wrap">
          <CloseIcon size={24} />
        </div>
        <div>
          <h3>Notifications Not Supported</h3>
          <p>Your browser doesn't support push notifications.</p>
        </div>
      </div>
    );
  }

  // ============ LOADING ============
  if (loading) {
    return (
      <div className="notification-settings">
        <p className="muted">Checking notification status...</p>
      </div>
    );
  }

  return (
    <div className="notification-settings">
      <div className="notification-header">
        <div className="notification-icon-wrap active">
          <BellIcon size={22} />
        </div>
        <div className="notification-info">
          <h3>Push Notifications</h3>
          <p>
            {subscribed
              ? "You'll receive order updates and special offers."
              : "Enable to get order updates, sales alerts & more."}
          </p>
        </div>
      </div>

      <div className="notification-status-row">
        <div className={`notification-status ${subscribed ? "on" : "off"}`}>
          {subscribed ? (
            <>
              <CheckIcon size={14} />
              <span>Enabled</span>
            </>
          ) : (
            <>
              <CloseIcon size={14} />
              <span>Disabled</span>
            </>
          )}
        </div>

        {permission === "denied" && (
          <p className="notification-warning">
            ⚠️ Notifications blocked in browser settings
          </p>
        )}
      </div>

      <div className="notification-actions">
        {subscribed ? (
          <>
            <button
              className="notification-btn secondary"
              onClick={handleDisable}
              disabled={loading}
            >
              Disable
            </button>
            <button
              className="notification-btn primary"
              onClick={handleTest}
              disabled={loading}
            >
              Send Test
            </button>
          </>
        ) : (
          <button
            className="notification-btn primary full-width"
            onClick={handleEnable}
            disabled={loading}
          >
            {loading ? "Enabling..." : "Enable Notifications"}
          </button>
        )}
      </div>
    </div>
  );
}

export default NotificationSettings;