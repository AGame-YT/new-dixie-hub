"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";

type House = {
  id: string;
  name: string;
  colour: string;
  points: number;
};

export function AdminHouseEditor({
  initialHouses
}: {
  initialHouses: House[];
}) {
  const [houses, setHouses] = useState(initialHouses);
  const [reason, setReason] = useState("Manual house point update");
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  async function saveHouse(house: House) {
    setSaving(house.id);
    setMessage("");
    const response = await fetch(`/api/admin/houses/${house.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ points: house.points, reason })
    });
    const data = (await response.json()) as {
      house?: House;
      error?: string;
    };
    setSaving(null);

    if (!response.ok || !data.house) {
      setMessage(data.error ?? "Unable to save house points.");
      return;
    }

    setHouses((current) =>
      current.map((item) => (item.id === house.id ? data.house! : item))
    );
    setMessage(`${data.house.name} updated.`);
  }

  return (
    <div className="admin-house-editor">
      <label className="admin-reason">
        <span>Reason for change</span>
        <input
          value={reason}
          maxLength={160}
          onChange={(event) => setReason(event.target.value)}
        />
      </label>

      <div className="admin-house-grid">
        {houses.map((house) => (
          <article
            className={`admin-house-card house-${house.colour}`}
            key={house.id}
          >
            <span className="house-mark">
              <strong>{house.name[0]}</strong>
            </span>
            <div>
              <strong>{house.name}</strong>
              <span>Current house total</span>
            </div>
            <input
              type="number"
              min={0}
              max={10_000_000}
              value={house.points}
              aria-label={`${house.name} points`}
              onChange={(event) => {
                const points = Number.parseInt(event.target.value || "0", 10);
                setHouses((current) =>
                  current.map((item) =>
                    item.id === house.id ? { ...item, points } : item
                  )
                );
              }}
            />
            <button
              type="button"
              className="button primary small"
              disabled={saving === house.id || !reason.trim()}
              onClick={() => saveHouse(house)}
            >
              {saving === house.id ? "Saving…" : "Save"}
            </button>
          </article>
        ))}
      </div>
      {message && (
        <p className="admin-form-message">
          <Icon name="check" size={15} /> {message}
        </p>
      )}
    </div>
  );
}
