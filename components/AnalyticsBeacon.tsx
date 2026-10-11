"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

const trackablePaths = new Set([
  "/",
  "/dashboard",
  "/homework",
  "/links",
  "/settings"
]);

export function AnalyticsBeacon() {
  const pathname = usePathname();

  useEffect(() => {
    if (!trackablePaths.has(pathname)) return;

    void fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType: "PAGE_VIEW",
        path: pathname
      }),
      keepalive: true
    }).catch(() => undefined);
  }, [pathname]);

  return null;
}
