"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/Icon";
import {
  HomeworkBoard,
  formatDueDate,
  priorityLabels
} from "@/components/HomeworkBoard";
import { subjectStyle } from "@/lib/config";
import type { HomeworkItem, HomeworkStatus } from "@/lib/types";

const overridesKey = "dixie-homework-overrides";
const viewKey = "dixie-homework-view";
const doneStatuses: HomeworkStatus[] = ["SUBMITTED", "COMPLETE"];
const priorityOrder: HomeworkItem["priority"][] = [
  "overdue",
  "today",
  "tomorrow",
  "week",
  "later",
  "none"
];

function readStorage(key: string) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Private browsing: the change still applies for this visit.
  }
}

export function HomeworkPanel({
  initialItems,
  demo = false
}: {
  initialItems: HomeworkItem[];
  demo?: boolean;
}) {
  const [items, setItems] = useState(initialItems);
  const [view, setView] = useState<"list" | "board">("list");
  const [showDone, setShowDone] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);

  useEffect(() => {
    if (readStorage(viewKey) === "board") setView("board");
  }, []);

  useEffect(() => {
    if (!demo) return;
    const stored = readStorage(overridesKey);
    if (!stored) return;
    try {
      const overrides = JSON.parse(stored) as Record<string, HomeworkStatus>;
      setItems((current) =>
        current.map((item) => ({
          ...item,
          status: overrides[item.id] ?? item.status
        }))
      );
    } catch {
      writeStorage(overridesKey, "{}");
    }
  }, [demo]);

  useEffect(() => {
    if (demo) return;
    let cancelled = false;
    fetch("/api/classroom")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { items?: HomeworkItem[] } | null) => {
        if (!cancelled && data?.items?.length) setItems(data.items);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [demo]);

  async function moveItem(id: string, status: HomeworkStatus) {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, status } : item))
    );
    setSavedId(id);
    window.setTimeout(() => setSavedId(null), 1200);

    if (demo) {
      let current: Record<string, HomeworkStatus> = {};
      try {
        current = JSON.parse(readStorage(overridesKey) ?? "{}");
      } catch {
        // Start again from an empty set of overrides.
      }
      writeStorage(overridesKey, JSON.stringify({ ...current, [id]: status }));
    }

    try {
      await fetch(`/api/homework/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, demo })
      });
    } catch {
      // The optimistic change remains available locally if the API is offline.
    }
  }

  function changeView(next: "list" | "board") {
    setView(next);
    writeStorage(viewKey, next);
  }

  const sorted = useMemo(
    () =>
      [...items].sort(
        (a, b) =>
          priorityOrder.indexOf(a.priority) - priorityOrder.indexOf(b.priority) ||
          (a.dueAt ?? "").localeCompare(b.dueAt ?? "")
      ),
    [items]
  );
  const open = sorted.filter((item) => !doneStatuses.includes(item.status));
  const done = sorted.filter((item) => doneStatuses.includes(item.status));
  const visible = showDone ? [...open, ...done] : open;

  return (
    <div className="homework-panel-body">
      <div className="homework-toolbar">
        <span className="homework-progress" aria-live="polite">
          <strong>{open.length}</strong> to do · {done.length} done
        </span>
        <div className="segmented" role="group" aria-label="Homework view">
          <button
            type="button"
            className={view === "list" ? "active" : ""}
            onClick={() => changeView("list")}
            aria-pressed={view === "list"}
            title="To-do list"
          >
            <Icon name="todo" size={16} />
            <span className="sr-only">To-do list</span>
          </button>
          <button
            type="button"
            className={view === "board" ? "active" : ""}
            onClick={() => changeView("board")}
            aria-pressed={view === "board"}
            title="Kanban board"
          >
            <Icon name="kanban" size={16} />
            <span className="sr-only">Kanban board</span>
          </button>
        </div>
      </div>

      {view === "board" ? (
        <HomeworkBoard items={items} onMove={moveItem} savedId={savedId} />
      ) : (
        <>
          <ul className="todo-list">
            {visible.map((item) => {
              const checked = doneStatuses.includes(item.status);
              const style = subjectStyle(item.subject);
              return (
                <li
                  key={item.id}
                  className={`todo-item ${checked ? "done" : ""} priority-${item.priority}`}
                >
                  <label className="todo-check">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        moveItem(item.id, checked ? "TODO" : "COMPLETE")
                      }
                    />
                    <span className="todo-box" aria-hidden="true">
                      <Icon name="check" size={18} />
                    </span>
                    <span className="sr-only">
                      Mark {item.title} as {checked ? "not done" : "done"}
                    </span>
                  </label>
                  <span className={`subject-icon ${style.colour}`}>
                    <Icon name={style.icon} size={18} />
                  </span>
                  <span className="todo-copy">
                    <strong>{item.title}</strong>
                    <small>
                      {item.subject} · {formatDueDate(item.dueAt)}
                    </small>
                  </span>
                  {!checked && ["overdue", "today", "tomorrow"].includes(item.priority) && (
                    <span className={`priority-badge ${item.priority}`}>
                      {priorityLabels[item.priority]}
                    </span>
                  )}
                  {savedId === item.id && (
                    <Icon name="check" size={16} className="todo-saved" />
                  )}
                  {item.classroomUrl && (
                    <a
                      className="icon-button small"
                      href={item.classroomUrl}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`Open ${item.title} in Google Classroom`}
                      title="Open in Classroom"
                    >
                      <Icon name="external" size={16} />
                    </a>
                  )}
                </li>
              );
            })}
            {visible.length === 0 && (
              <li className="empty-state small">
                <Icon name="trophy" />
                <p>All caught up. Nice work!</p>
              </li>
            )}
          </ul>
          {done.length > 0 && (
            <button
              type="button"
              className="text-button"
              onClick={() => setShowDone((value) => !value)}
            >
              {showDone ? "Hide finished work" : `Show finished work (${done.length})`}
            </button>
          )}
        </>
      )}
    </div>
  );
}
