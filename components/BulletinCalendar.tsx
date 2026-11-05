"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/Icon";
import {
  bulletinAudiences,
  formatDateKey,
  monthGrid,
  shiftMonth,
  staffOnlyAudience,
  type BulletinEntryItem,
  type BulletinInput
} from "@/lib/bulletin";

const weekdayHeadings = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const visiblePerDay = 3;

type Draft = BulletinInput & { id?: string };

const emptyDraft = (date: string): Draft => ({
  date,
  title: "",
  body: "",
  audience: "Everyone",
  pinned: false
});

export function BulletinCalendar({
  today,
  canEdit,
  demo = false,
  editorName
}: {
  today: string;
  canEdit: boolean;
  demo?: boolean;
  editorName?: string;
}) {
  const [month, setMonth] = useState(today.slice(0, 7));
  const [selected, setSelected] = useState(today);
  const [entries, setEntries] = useState<BulletinEntryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const grid = useMemo(() => monthGrid(month), [month]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/bulletin?from=${grid.start}&to=${grid.end}`)
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then((data: { items: BulletinEntryItem[] }) => {
        if (!cancelled) setEntries(data.items);
      })
      .catch(() => !cancelled && setMessage("The bulletin could not be loaded."))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [grid.start, grid.end]);

  const byDate = useMemo(() => {
    const map = new Map<string, BulletinEntryItem[]>();
    for (const entry of entries) {
      map.set(entry.date, [...(map.get(entry.date) ?? []), entry]);
    }
    for (const list of map.values()) {
      list.sort((a, b) => Number(b.pinned) - Number(a.pinned));
    }
    return map;
  }, [entries]);
  const dayEntries = byDate.get(selected) ?? [];

  function selectDay(date: string) {
    setSelected(date);
    setDraft(null);
    setMessage("");
    if (date.slice(0, 7) !== month) setMonth(date.slice(0, 7));
  }

  function changeMonth(by: number) {
    const next = shiftMonth(month, by);
    setMonth(next);
    setSelected(next === today.slice(0, 7) ? today : `${next}-01`);
    setDraft(null);
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!draft) return;
    setSaving(true);
    setMessage("");
    const { id, ...input } = draft;
    try {
      let item: BulletinEntryItem;
      if (demo) {
        item = {
          ...input,
          id: id ?? `demo-${Date.now()}`,
          createdByName: entries.find((entry) => entry.id === id)?.createdByName ?? editorName,
          updatedByName: id ? editorName : undefined,
          updatedAt: new Date().toISOString()
        };
      } else {
        const response = await fetch(id ? `/api/bulletin/${id}` : "/api/bulletin", {
          method: id ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input)
        });
        const data = (await response.json()) as { item?: BulletinEntryItem; error?: string };
        if (!response.ok || !data.item) throw new Error(data.error ?? "Could not save the notice.");
        item = data.item;
      }
      setEntries((current) => [...current.filter((entry) => entry.id !== item.id), item]);
      setDraft(null);
      setMessage(demo ? "Saved for this demo only (not stored)." : "Notice saved.");
      if (item.date !== selected) selectDay(item.date);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save the notice.");
    } finally {
      setSaving(false);
    }
  }

  async function remove(entry: BulletinEntryItem) {
    if (!window.confirm(`Delete "${entry.title}"?`)) return;
    if (!demo) {
      const response = await fetch(`/api/bulletin/${entry.id}`, { method: "DELETE" });
      if (!response.ok) {
        setMessage("Could not delete the notice.");
        return;
      }
    }
    setEntries((current) => current.filter((item) => item.id !== entry.id));
    setMessage("Notice deleted.");
  }

  return (
    <div className="bulletin">
      <section className="hub-card bulletin-month" aria-busy={loading}>
        <div className="bulletin-month-header">
          <button
            type="button"
            className="icon-button small"
            onClick={() => changeMonth(-1)}
            aria-label="Previous month"
            title="Previous month"
          >
            <Icon name="back" size={18} />
          </button>
          <h2>{grid.label}</h2>
          <button
            type="button"
            className="icon-button small"
            onClick={() => changeMonth(1)}
            aria-label="Next month"
            title="Next month"
          >
            <Icon name="chevron" size={18} />
          </button>
          {month !== today.slice(0, 7) && (
            <button type="button" className="text-button" onClick={() => selectDay(today)}>
              Today
            </button>
          )}
        </div>
        <div className="bulletin-grid" role="grid" aria-label={grid.label}>
          {weekdayHeadings.map((day) => (
            <span key={day} className="bulletin-weekday" role="columnheader">
              {day}
            </span>
          ))}
          {grid.days.map((date, index) => {
            const items = byDate.get(date) ?? [];
            const classes = [
              "bulletin-day",
              date.slice(0, 7) !== month ? "outside" : "",
              index % 7 >= 5 ? "weekend" : "",
              date === today ? "today" : "",
              date === selected ? "selected" : ""
            ].join(" ");
            return (
              <button
                type="button"
                role="gridcell"
                key={date}
                className={classes}
                onClick={() => selectDay(date)}
                aria-label={`${formatDateKey(date, "long")}, ${items.length} notices`}
                aria-selected={date === selected}
              >
                <span className="bulletin-day-number">{Number(date.slice(8))}</span>
                <span className="bulletin-chips">
                  {items.slice(0, visiblePerDay).map((entry) => (
                    <span
                      key={entry.id}
                      className={`bulletin-chip ${entry.pinned ? "pinned" : ""} ${
                        entry.audience === staffOnlyAudience ? "staff" : ""
                      }`}
                    >
                      {entry.title}
                    </span>
                  ))}
                  {items.length > visiblePerDay && (
                    <span className="bulletin-more">+{items.length - visiblePerDay} more</span>
                  )}
                </span>
                {items.length > 0 && <span className="bulletin-dot" aria-hidden="true" />}
              </button>
            );
          })}
        </div>
      </section>

      <section className="hub-card bulletin-day-panel" aria-live="polite">
        <h2 className="hub-card-title">
          <Icon name="bulletin" /> {formatDateKey(selected, "long")}
          {canEdit && !draft && (
            <button
              type="button"
              className="icon-button small title-action"
              onClick={() => setDraft(emptyDraft(selected))}
              aria-label="Add a notice to this date"
              title="Add a notice"
            >
              <Icon name="plus" size={18} />
            </button>
          )}
        </h2>
        {demo && canEdit && (
          <p className="demo-banner-small">
            <Icon name="spark" size={14} /> Demo: try adding or editing notices. Nothing is saved.
          </p>
        )}
        {message && (
          <p className="role-message" role="status">
            {message}
          </p>
        )}

        {draft ? (
          <form className="bulletin-form" onSubmit={save}>
            <label>
              <span>Title</span>
              <input
                required
                maxLength={120}
                value={draft.title}
                onChange={(event) => setDraft({ ...draft, title: event.target.value })}
                autoFocus
              />
            </label>
            <label>
              <span>Details</span>
              <textarea
                rows={4}
                maxLength={2000}
                value={draft.body}
                onChange={(event) => setDraft({ ...draft, body: event.target.value })}
              />
            </label>
            <div className="bulletin-form-row">
              <label>
                <span>Date</span>
                <input
                  type="date"
                  required
                  value={draft.date}
                  onChange={(event) => setDraft({ ...draft, date: event.target.value })}
                />
              </label>
              <label>
                <span>For</span>
                <select
                  value={draft.audience}
                  onChange={(event) => setDraft({ ...draft, audience: event.target.value })}
                >
                  {bulletinAudiences.map((audience) => (
                    <option key={audience}>{audience}</option>
                  ))}
                </select>
              </label>
            </div>
            <label className="bulletin-pin">
              <input
                type="checkbox"
                checked={draft.pinned}
                onChange={(event) => setDraft({ ...draft, pinned: event.target.checked })}
              />
              <Icon name="pin" size={15} /> Pin to the top of the day
            </label>
            <div className="bulletin-form-actions">
              <button type="button" className="button secondary small" onClick={() => setDraft(null)}>
                <Icon name="close" size={16} /> Cancel
              </button>
              <button type="submit" className="button primary small" disabled={saving}>
                <Icon name="check" size={16} /> Save
              </button>
            </div>
          </form>
        ) : (
          <ul className="notice-list bulletin-entries">
            {dayEntries.map((entry) => (
              <li key={entry.id} className={entry.pinned ? "pinned" : ""}>
                <span className="notice-icon">
                  <Icon name={entry.pinned ? "pin" : "notice"} size={17} />
                </span>
                <div>
                  <small>
                    {entry.audience}
                    {entry.audience === staffOnlyAudience && <Icon name="lock" size={11} />}
                  </small>
                  <strong>{entry.title}</strong>
                  {entry.body && <p>{entry.body}</p>}
                  {canEdit && (
                    <small className="bulletin-author">
                      Added by {entry.createdByName ?? "staff"}
                      {entry.updatedByName && ` · edited by ${entry.updatedByName}`}
                    </small>
                  )}
                </div>
                {canEdit && (
                  <span className="bulletin-entry-actions">
                    <button
                      type="button"
                      className="icon-button small"
                      onClick={() =>
                        setDraft({
                          id: entry.id,
                          date: entry.date,
                          title: entry.title,
                          body: entry.body,
                          audience: entry.audience,
                          pinned: entry.pinned
                        })
                      }
                      aria-label={`Edit ${entry.title}`}
                      title="Edit"
                    >
                      <Icon name="pencil" size={15} />
                    </button>
                    <button
                      type="button"
                      className="icon-button small"
                      onClick={() => remove(entry)}
                      aria-label={`Delete ${entry.title}`}
                      title="Delete"
                    >
                      <Icon name="trash" size={15} />
                    </button>
                  </span>
                )}
              </li>
            ))}
            {dayEntries.length === 0 && !loading && (
              <li className="empty-state small">
                <Icon name="bulletin" />
                <p>Nothing on the bulletin for this day.</p>
              </li>
            )}
          </ul>
        )}
      </section>
    </div>
  );
}
