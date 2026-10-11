"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/Icon";
import {
  homeworkStatuses,
  type HomeworkItem,
  type HomeworkStatus
} from "@/lib/types";

const columnMeta: Record<
  HomeworkStatus,
  { title: string; tone: string; description: string }
> = {
  NEW: { title: "New / Set", tone: "blue", description: "Recently assigned" },
  TODO: { title: "To Do", tone: "amber", description: "Ready to start" },
  IN_PROGRESS: {
    title: "In Progress",
    tone: "violet",
    description: "You are working on it"
  },
  SUBMITTED: {
    title: "Submitted",
    tone: "cyan",
    description: "Waiting for feedback"
  },
  COMPLETE: {
    title: "Returned / Complete",
    tone: "green",
    description: "Finished work"
  }
};

const priorityLabels: Record<HomeworkItem["priority"], string> = {
  overdue: "Overdue",
  today: "Due today",
  tomorrow: "Due tomorrow",
  week: "Due this week",
  later: "Later",
  none: "No due date"
};

function formatDueDate(value?: string) {
  if (!value) return "No due date";
  return new Date(value).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short"
  });
}

export function HomeworkBoard({
  initialItems,
  demo = false,
  compact = false
}: {
  initialItems: HomeworkItem[];
  demo?: boolean;
  compact?: boolean;
}) {
  const [items, setItems] = useState(initialItems);
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("All subjects");
  const [due, setDue] = useState("All dates");
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  useEffect(() => {
    if (!demo) return;
    const stored = localStorage.getItem("dixie-homework-overrides");
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
      localStorage.removeItem("dixie-homework-overrides");
    }
  }, [demo]);

  useEffect(() => {
    if (demo) return;
    let cancelled = false;
    fetch("/api/classroom")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { items?: HomeworkItem[] } | null) => {
        if (!cancelled && data?.items?.length) {
          setItems(data.items);
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [demo]);

  const subjects = useMemo(
    () => [
      "All subjects",
      ...Array.from(new Set(items.map((item) => item.subject))).sort()
    ],
    [items]
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter((item) => {
      const matchesSearch =
        !query ||
        `${item.title} ${item.subject} ${item.teacher ?? ""}`
          .toLowerCase()
          .includes(query);
      const matchesSubject =
        subject === "All subjects" || item.subject === subject;
      const matchesDue =
        due === "All dates" ||
        (due === "Urgent" &&
          ["overdue", "today", "tomorrow"].includes(item.priority)) ||
        (due === "This week" && item.priority === "week") ||
        (due === "Later" && ["later", "none"].includes(item.priority));
      return matchesSearch && matchesSubject && matchesDue;
    });
  }, [due, items, search, subject]);

  async function moveItem(id: string, status: HomeworkStatus) {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, status } : item))
    );
    setSavedId(id);
    window.setTimeout(() => setSavedId(null), 1200);

    if (demo) {
      const current = JSON.parse(
        localStorage.getItem("dixie-homework-overrides") ?? "{}"
      ) as Record<string, HomeworkStatus>;
      localStorage.setItem(
        "dixie-homework-overrides",
        JSON.stringify({ ...current, [id]: status })
      );
    }

    try {
      await fetch(`/api/homework/${encodeURIComponent(id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, demo })
      });
    } catch {
      // The optimistic move remains available locally if the API is offline.
    }
  }

  const visibleStatuses = compact
    ? homeworkStatuses.slice(0, 3)
    : homeworkStatuses;

  return (
    <div className={compact ? "homework-board compact" : "homework-board"}>
      {!compact && (
        <div className="board-toolbar">
          <label className="search-field">
            <Icon name="search" size={18} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search homework"
              aria-label="Search homework"
            />
          </label>
          <div className="filter-group">
            <label>
              <span className="sr-only">Filter by subject</span>
              <select
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
              >
                {subjects.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
            <label>
              <span className="sr-only">Filter by due date</span>
              <select
                value={due}
                onChange={(event) => setDue(event.target.value)}
              >
                <option>All dates</option>
                <option>Urgent</option>
                <option>This week</option>
                <option>Later</option>
              </select>
            </label>
            <span className="result-count">{filtered.length} items</span>
          </div>
        </div>
      )}

      <div className="kanban-scroll">
        <div className="kanban-grid">
          {visibleStatuses.map((status) => {
            const meta = columnMeta[status];
            const columnItems = filtered.filter((item) => item.status === status);
            return (
              <section
                className="kanban-column"
                key={status}
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  const id =
                    event.dataTransfer.getData("text/plain") || draggedId;
                  if (id) moveItem(id, status);
                  setDraggedId(null);
                }}
              >
                <header className="kanban-header">
                  <span className={`status-dot ${meta.tone}`} />
                  <div>
                    <h3>{meta.title}</h3>
                    <small>{meta.description}</small>
                  </div>
                  <span className="column-count">{columnItems.length}</span>
                </header>
                <div className="kanban-list">
                  {columnItems.map((item) => (
                    <article
                      key={item.id}
                      className={`homework-card priority-${item.priority}`}
                      draggable
                      onDragStart={(event) => {
                        setDraggedId(item.id);
                        event.dataTransfer.setData("text/plain", item.id);
                        event.dataTransfer.effectAllowed = "move";
                      }}
                      onDragEnd={() => setDraggedId(null)}
                    >
                      <div className="homework-card-top">
                        <span className="subject-label">{item.subject}</span>
                        <span className={`priority-badge ${item.priority}`}>
                          {priorityLabels[item.priority]}
                        </span>
                      </div>
                      <h4>{item.title}</h4>
                      {item.description && <p>{item.description}</p>}
                      <div className="homework-meta">
                        <span>
                          <Icon name="calendar" size={14} />
                          {formatDueDate(item.dueAt)}
                        </span>
                        {item.teacher && <span>{item.teacher}</span>}
                      </div>
                      <div className="homework-card-footer">
                        <label className="status-select">
                          <span className="sr-only">Move homework</span>
                          <select
                            value={item.status}
                            onChange={(event) =>
                              moveItem(
                                item.id,
                                event.target.value as HomeworkStatus
                              )
                            }
                          >
                            {homeworkStatuses.map((option) => (
                              <option key={option} value={option}>
                                {columnMeta[option].title}
                              </option>
                            ))}
                          </select>
                        </label>
                        {item.classroomUrl && (
                          <a
                            href={item.classroomUrl}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={`Open ${item.title} in Google Classroom`}
                          >
                            <Icon name="external" size={16} />
                          </a>
                        )}
                      </div>
                      {savedId === item.id && (
                        <span className="saved-indicator">
                          <Icon name="check" size={13} /> Saved
                        </span>
                      )}
                    </article>
                  ))}
                  {columnItems.length === 0 && (
                    <div className="empty-column">
                      <Icon name="check" size={20} />
                      <span>Nothing here</span>
                    </div>
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
