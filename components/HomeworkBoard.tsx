"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/Icon";
import {
  homeworkStatuses,
  type HomeworkItem,
  type HomeworkStatus
} from "@/lib/types";

export const columnMeta: Record<
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

export const priorityLabels: Record<HomeworkItem["priority"], string> = {
  overdue: "Overdue",
  today: "Due today",
  tomorrow: "Due tomorrow",
  week: "Due this week",
  later: "Later",
  none: "No due date"
};

const shortDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const shortMonths = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Formatted by hand (in UK time) so server and browser render identical text.
export function formatDueDate(value?: string) {
  if (!value) return "No due date";
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/London",
      year: "numeric",
      month: "numeric",
      day: "numeric"
    })
      .formatToParts(new Date(value))
      .map((part) => [part.type, Number(part.value)])
  );
  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
  return `${shortDays[date.getUTCDay()]} ${parts.day} ${shortMonths[parts.month - 1]}`;
}

export function HomeworkBoard({
  items,
  onMove,
  savedId
}: {
  items: HomeworkItem[];
  onMove: (id: string, status: HomeworkStatus) => void;
  savedId?: string | null;
}) {
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("All subjects");
  const [due, setDue] = useState("All dates");
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const moveItem = onMove;

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

  return (
    <div className="homework-board">
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

      <div className="kanban-scroll">
        <div className="kanban-grid">
          {homeworkStatuses.map((status) => {
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
