// AgentPay Web Push Service Worker
const VAPID_PUBLIC_KEY = "BE7M2p6QqpSyYX6aH_ZYhyq0Kgn3hg_Sa4S-CdvVbeVpcOTRGy3Ruj5OjqCqcakJcZIClAyFcUhYqx2Qc9KS7eA";
const API_BASE = "https://www.x402-agent-pay.com/api/agentpay";

self.addEventListener("install", e => { self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(self.clients.claim()); });

self.addEventListener("push", event => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch(e) {
    data = { title: "AgentPay", body: event.data ? event.data.text() : "New notification" };
  }
  const title   = data.title || "AgentPay";
  const body    = data.body  || "New notification";
  const payload = data.data  || {};
  const options = {
    body, icon: "https://www.x402-agent-pay.com/icon-192.png",
    badge: "https://www.x402-agent-pay.com/icon-72.png",
    tag: data.tag || "agentpay-" + Date.now(),
    renotify: true, vibrate: [200, 100, 200], data: payload,
    requireInteraction: !!payload.escrow_id,
    actions: payload.escrow_id ? [
      { action: "accept", title: "✅ Accept" },
      { action: "deny",   title: "❌ Deny"   }
    ] : []
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  const payload  = event.notification.data || {};
  const escrowId = payload.escrow_id;
  const apiKey   = payload.api_key || "";
  const action   = event.action;
  if (escrowId && (action === "accept" || action === "deny")) {
    event.waitUntil(
      fetch(`${API_BASE}/escrow/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-AgentPay-Key": apiKey },
        body: JSON.stringify({ escrow_id: escrowId })
      }).then(r => r.json()).then(result => {
        self.registration.showNotification(
          action === "accept" ? "✅ Accepted!" : "❌ Denied",
          { body: action === "accept" ? `${result.payout || ""} USDC added` : "Refund sent", icon: "https://www.x402-agent-pay.com/icon-192.png" }
        );
      })
    );
    return;
  }
  const url = "https://www.x402-agent-pay.com/dashboard" + (escrowId ? "?screen=escrow" : "");
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true })
      .then(clients => {
        const existing = clients.find(c => c.url.includes("x402-agent-pay.com"));
        if (existing) return existing.focus();
        return self.clients.openWindow(url);
      })
  );
});
