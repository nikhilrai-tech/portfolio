"use client";
import { useEffect, useState } from "react";
import { listenForInstall } from "@/lib/install";

// Registers the offline service worker in production, keeps the install prompt for the
// command menu, and shows a small banner while the browser is offline.
export default function ServiceWorker({ offlineLabel }: { offlineLabel: string }) {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const stop = listenForInstall();
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});
    }
    const sync = () => setOffline(!navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      stop();
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);

  if (!offline) return null;
  return (
    <p
      role="status"
      className="label border-accent/40 bg-bg/90 text-accent fixed top-20 left-1/2 z-50 -translate-x-1/2 rounded-full border px-4 py-2 !text-[0.65rem] backdrop-blur-md"
    >
      {offlineLabel}
    </p>
  );
}
