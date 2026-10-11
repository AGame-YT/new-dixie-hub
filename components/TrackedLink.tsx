"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";

export function TrackedLink({
  trackingId,
  trackingLabel,
  children,
  onClick,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
  trackingId: string;
  trackingLabel: string;
  children: ReactNode;
}) {
  return (
    <a
      {...props}
      onClick={(event) => {
        onClick?.(event);
        void fetch("/api/track", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            eventType: "LINK_CLICK",
            targetId: trackingId,
            targetLabel: trackingLabel
          }),
          keepalive: true
        }).catch(() => undefined);
      }}
    >
      {children}
    </a>
  );
}
