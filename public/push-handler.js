// ============================================================
// PUSH NOTIFICATION HANDLER
// ============================================================

self.addEventListener("push", (event) => {
  console.log("[SW] Push received:", event);

  let data = {
    title: "Awais Mobile-Zone",
    body: "You have a new notification!",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    url: "/",
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (err) {
      console.error("[SW] Push data parse error:", err);
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    vibrate: [200, 100, 200],
    data: {
      url: data.url,
      dateOfArrival: Date.now(),
    },
    actions: [
      { action: "open", title: "Open" },
      { action: "close", title: "Close" },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked:", event);

  event.notification.close();

  if (event.action === "close") return;

  const urlToOpen = event.notification.data?.url || "/";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});