"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";
import type { EmailSummaryItem } from "@/lib/types";
import { TrackedLink } from "@/components/TrackedLink";

export function EmailPanel({
  initialItems,
  demo = false
}: {
  initialItems: EmailSummaryItem[];
  demo?: boolean;
}) {
  const [items, setItems] = useState(initialItems);

  useEffect(() => {
    if (demo) return;
    fetch("/api/email-summary")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { items?: EmailSummaryItem[] } | null) => {
        if (data?.items) setItems(data.items);
      })
      .catch(() => undefined);
  }, [demo]);

  return (
    <div className="email-list">
      {items.map((email) => (
        <TrackedLink
          className="email-row"
          href="https://mail.google.com"
          target="_blank"
          rel="noreferrer"
          key={email.id}
          trackingId="gmail"
          trackingLabel="Gmail"
        >
          <span className={email.important ? "mail-dot important" : "mail-dot"} />
          <span className="email-copy">
            <span>
              <strong>{email.sender}</strong>
              <time>{email.receivedAt}</time>
            </span>
            <b>{email.subject}</b>
            <small>{email.preview}</small>
          </span>
          <Icon name="chevron" size={16} />
        </TrackedLink>
      ))}
      {items.length === 0 && (
        <div className="empty-state small">
          <Icon name="mail" />
          <h3>Inbox clear</h3>
          <p>No unread messages to show.</p>
        </div>
      )}
    </div>
  );
}
