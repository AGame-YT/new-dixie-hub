"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";
import { moodLabels } from "@/components/MoodCheckIn";
import type { WellbeingCheckInItem } from "@/lib/types";

function formatWhen(value: string) {
  return new Date(value).toLocaleString("en-GB", {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function WellbeingInbox({ demo = false }: { demo?: boolean }) {
  const [items, setItems] = useState<WellbeingCheckInItem[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch(demo ? "/api/wellbeing?demo=1" : "/api/wellbeing")
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data: { items: WellbeingCheckInItem[] }) => setItems(data.items))
      .catch(() => setFailed(true));
  }, [demo]);

  async function acknowledge(id: string) {
    setItems((current) =>
      current?.map((item) => (item.id === id ? { ...item, acknowledged: true } : item)) ??
      null
    );
    if (demo) return;
    await fetch(`/api/wellbeing/${encodeURIComponent(id)}`, { method: "PATCH" }).catch(
      () => undefined
    );
  }

  if (failed) {
    return (
      <div className="empty-state small">
        <Icon name="alert" />
        <p>Check-ins could not be loaded.</p>
      </div>
    );
  }
  if (!items) return <p className="muted">Loading check-ins…</p>;

  const sorted = [...items].sort(
    (a, b) => Number(a.acknowledged) - Number(b.acknowledged) || a.mood - b.mood
  );

  return (
    <ul className="checkin-list">
      {sorted.map((item) => (
        <li
          key={item.id}
          className={`checkin mood-${item.mood} ${item.acknowledged ? "seen" : ""}`}
        >
          <span className="checkin-mood" title={moodLabels[item.mood]}>
            <Icon name={`mood-${item.mood}`} size={26} />
            <span className="sr-only">{moodLabels[item.mood]}</span>
          </span>
          <div className="checkin-copy">
            <strong>
              {item.studentName} <small>{item.formGroup}</small>
            </strong>
            {item.note && <p>{item.note}</p>}
            <small>{formatWhen(item.createdAt)}</small>
          </div>
          {item.acknowledged ? (
            <span className="checkin-seen" title="Seen">
              <Icon name="check" size={18} />
              <span className="sr-only">Seen</span>
            </span>
          ) : (
            <button
              type="button"
              className="icon-button small"
              onClick={() => acknowledge(item.id)}
              aria-label={`Mark ${item.studentName}'s check-in as seen`}
              title="Mark as seen"
            >
              <Icon name="check" size={18} />
            </button>
          )}
        </li>
      ))}
      {sorted.length === 0 && (
        <li className="empty-state small">
          <Icon name="heart" />
          <p>No check-ins in the last fortnight.</p>
        </li>
      )}
    </ul>
  );
}
