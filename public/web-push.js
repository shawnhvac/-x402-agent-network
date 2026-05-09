// AgentPay Web Push Registration
const VAPID_PUBLIC_KEY = "BE7M2p6QqpSyYX6aH_ZYhyq0Kgn3hg_Sa4S-CdvVbeVpcOTRGy3Ruj5OjqCqcakJcZIClAyFcUhYqx2Qc9KS7eA";

async function registerWebPush(apiKey) {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) return false;
  try {
    const reg = await navigator.serviceWorker.register("/sw.js");
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return false;
    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    });
    const resp = await fetch("https://www.x402-agent-pay.com/api/agentpay/webpush/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-AgentPay-Key": apiKey },
      body: JSON.stringify({ subscription: subscription.toJSON() })
    });
    const result = await resp.json();
    if (result.success) console.log("✅ Web push enabled!");
    return !!result.success;
  } catch(err) { console.error("Web push failed:", err); return false; }
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - base64String.length % 4) % 4);
  const base64  = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)));
}

document.addEventListener("DOMContentLoaded", () => {
  const apiKey = localStorage.getItem("agentpay_api_key");
  if (apiKey) registerWebPush(apiKey);
});
