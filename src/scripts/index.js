import "./pages/app.js";
import NotificationHelper from "./utils/notification-helper.js";
import { getToken, isAuthenticated } from "./utils/index.js";
import { syncOfflineStories } from "./utils/idb-sync.js";

export async function initNotificationToggle() {
  const toggleBtn = document.getElementById("toggleNotification");
  if (!toggleBtn) {
    console.warn("[initNotificationToggle] Button not found");
    return;
  }

  // 🔑 Ambil token login dari localStorage
  const token = getToken();
  console.log("[Index.js] Token untuk notifikasi:", token);

  // Kalau belum login, sembunyikan tombol
  if (!isAuthenticated() || !token) {
    console.warn("[Index.js] User belum login, tombol disembunyikan");
    toggleBtn.classList.add("hidden");
    return;
  }

  // Register Service Worker
  const registration = await NotificationHelper.registerServiceWorker();
  if (!registration) {
    toggleBtn.disabled = true;
    toggleBtn.textContent = "🔴 Notification Not Available";
    return;
  }

  // 🔁 Fungsi untuk update teks tombol sesuai status
  const updateButtonUI = async () => {
    const subscribed = await NotificationHelper.isSubscribed(registration);
    const localSubscribed = localStorage.getItem("push-subscribed") === "true";
    const isSubscribed = subscribed || localSubscribed;

    toggleBtn.textContent = isSubscribed
      ? "🔕 Disable Push Notification"
      : "🔔 Enable Push Notification";
    return isSubscribed;
  };

  await updateButtonUI();

  // 🖱️ Event klik tombol
  toggleBtn.onclick = async () => {
    try {
      toggleBtn.disabled = true;
      const originalText = toggleBtn.textContent;
      toggleBtn.textContent = "⏳ Processing...";

      const currentlySubscribed = await NotificationHelper.isSubscribed(
        registration
      );

      if (currentlySubscribed) {
        // 🔕 Unsubscribe
        await NotificationHelper.unsubscribeUser(registration, token);
        toggleBtn.textContent = "🔔 Enable Push Notification";
        alert("✅ Push Notification dinonaktifkan.");
      } else {
        // 🔔 Subscribe
        const permissionGranted = await NotificationHelper.requestPermission();
        if (!permissionGranted) {
          alert("❌ Izin notifikasi ditolak.");
          toggleBtn.textContent = originalText;
          toggleBtn.disabled = false;
          return;
        }

        await NotificationHelper.subscribeUser(registration, token);
        toggleBtn.textContent = "🔕 Disable Push Notification";
        alert("✅ Push Notification diaktifkan!");
      }

      toggleBtn.disabled = false;
      await updateButtonUI();
    } catch (err) {
      console.error("[Toggle] Error:", err);
      toggleBtn.disabled = false;
      await updateButtonUI();
      alert(
        "⚠️ Terjadi kesalahan saat mengatur notifikasi. Silakan coba lagi."
      );
    }
  };

  console.log("✅ Notification toggle initialized");
}

// Auto-init saat halaman load
window.addEventListener("load", () => {
  console.log("[index.js] Page loaded, initializing notification toggle...");
  initNotificationToggle();
});

window.addEventListener("online", () => {
  console.log("Back online! Syncing offline data...");
  syncOfflineStories();
});
