"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (
      "serviceWorker" in navigator &&
      (process.env.NODE_ENV === "production" ||
        process.env.NEXT_PUBLIC_ENABLE_SW === "true")
    ) {
      void navigator.serviceWorker.register("/sw.js");
    }
  }, []);
  return null;
}
