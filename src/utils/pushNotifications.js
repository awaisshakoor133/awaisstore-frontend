const API = import.meta.env.VITE_API_URL;

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

export function isPushSupported() {
  return (
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export function getNotificationPermission() {
  if (!("Notification" in window)) return "unsupported";
  return Notification.permission;
}

export async function subscribeToPush(userEmail = null) {
  try {
    if (!isPushSupported()) {
      return { success: false, error: "Push not supported" };
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return { success: false, error: "Permission denied" };
    }

    const keyRes = await fetch(`${API}/notifications/vapid-public-key`);
    const { publicKey } = await keyRes.json();

    if (!publicKey) {
      return { success: false, error: "VAPID key missing" };
    }

    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });
    }

    const subData = subscription.toJSON();

    const res = await fetch(`${API}/notifications/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        endpoint: subData.endpoint,
        keys: subData.keys,
        userEmail,
        userAgent: navigator.userAgent,
      }),
    });

    if (!res.ok) {
      return { success: false, error: "Backend subscribe failed" };
    }

    localStorage.setItem("awais-push-enabled", "true");
    return { success: true };
  } catch (err) {
    console.error("Subscribe error:", err);
    return { success: false, error: err.message };
  }
}

export async function unsubscribeFromPush() {
  try {
    if (!isPushSupported()) return { success: false, error: "Not supported" };

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (!subscription) return { success: true };

    const endpoint = subscription.endpoint;
    await subscription.unsubscribe();

    await fetch(`${API}/notifications/unsubscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint }),
    });

    localStorage.removeItem("awais-push-enabled");
    return { success: true };
  } catch (err) {
    console.error("Unsubscribe error:", err);
    return { success: false, error: err.message };
  }
}

export async function isSubscribedToPush() {
  try {
    if (!isPushSupported()) return false;

    // Timeout 3 seconds — dev server pe SW nahi hota
    const registration = await Promise.race([
      navigator.serviceWorker.ready,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Service worker timeout")), 3000)
      ),
    ]);

    const subscription = await registration.pushManager.getSubscription();
    return !!subscription;
  } catch (err) {
    console.warn("isSubscribedToPush:", err.message);
    return false;
  }
}

export async function sendTestNotification() {
  try {
    const res = await fetch(`${API}/notifications/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "🎉 Test Notification",
        body: "Push notifications are working! Tap to open.",
        url: "/",
      }),
    });
    return await res.json();
  } catch (err) {
    return { error: err.message };
  }
}