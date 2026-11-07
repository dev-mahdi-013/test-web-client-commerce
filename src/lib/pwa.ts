const SW_RESET_KEY = "hodhod-sw-reset";
const SW_RESET_VERSION = "v6";

/**
 * Unregisters any previously installed service worker and clears its caches
 * once per SW_RESET_VERSION, so clients stuck on stale icons/assets get fresh files.
 * Returns true when a reset happened and the page is reloading.
 */
async function resetServiceWorkerOnce(): Promise<boolean> {
  try {
    if (localStorage.getItem(SW_RESET_KEY) === SW_RESET_VERSION) return false;

    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((registration) => registration.unregister()));

    if ("caches" in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    }

    localStorage.setItem(SW_RESET_KEY, SW_RESET_VERSION);
    if (registrations.length > 0) {
      window.location.reload();
      return true;
    }
  } catch {
    // Reset is best-effort; the app works without it.
  }
  return false;
}

/** Registers the service worker in production builds only. */
export function registerServiceWorker() {
  if (!import.meta.env.PROD || !("serviceWorker" in navigator)) return;

  window.addEventListener("load", async () => {
    if (await resetServiceWorkerOnce()) return;

    navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
      // Offline support is optional; the app works without it.
    });
  });
}
