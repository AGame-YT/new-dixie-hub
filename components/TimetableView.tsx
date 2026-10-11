"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/Icon";
import type { TimetableItem } from "@/lib/types";

const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export function TimetableView({
  entries,
  compact = false
}: {
  entries: TimetableItem[];
  compact?: boolean;
}) {
  const currentDay = new Date().toLocaleDateString("en-GB", {
    weekday: "long"
  });
  const initialDay = weekdays.includes(currentDay) ? currentDay : "Monday";
  const [day, setDay] = useState(initialDay);
  const visible = useMemo(
    () => entries.filter((entry) => entry.day === day),
    [day, entries]
  );

  if (compact) {
    const compactEntries =
      entries.filter((entry) => entry.day === initialDay).length > 0
        ? entries.filter((entry) => entry.day === initialDay)
        : entries.filter((entry) => entry.day === "Monday");
    return (
      <div className="timetable-compact">
        {compactEntries.slice(0, 5).map((entry, index) => (
          <div className="lesson-row" key={entry.id}>
            <span className={`lesson-line ${entry.colour}`} />
            <div className="lesson-time">
              <strong>{entry.startTime}</strong>
              <small>{entry.endTime}</small>
            </div>
            <div className="lesson-copy">
              <strong>{entry.subject}</strong>
              <span>
                {entry.teacher} · {entry.room}
              </span>
            </div>
            {index === 0 && <span className="next-label">Next</span>}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="timetable-view">
      <div className="day-tabs" role="tablist" aria-label="Timetable days">
        {weekdays.map((weekday) => (
          <button
            type="button"
            key={weekday}
            className={day === weekday ? "active" : ""}
            onClick={() => setDay(weekday)}
            role="tab"
            aria-selected={day === weekday}
          >
            {weekday.slice(0, 3)}
          </button>
        ))}
      </div>
      <div className="timetable-day">
        {visible.length ? (
          visible.map((entry) => (
            <div className="lesson-row large" key={entry.id}>
              <span className={`lesson-line ${entry.colour}`} />
              <div className="lesson-time">
                <strong>{entry.startTime}</strong>
                <small>{entry.endTime}</small>
              </div>
              <div className="lesson-copy">
                <span>{entry.lesson}</span>
                <strong>{entry.subject}</strong>
                <small>
                  {entry.teacher} · {entry.room}
                </small>
              </div>
              <Icon name="chevron" size={17} />
            </div>
          ))
        ) : (
          <div className="empty-state">
            <Icon name="calendar" />
            <h3>Demo timetable coming soon</h3>
            <p>Add entries for {day} in the seed configuration.</p>
          </div>
        )}
      </div>
    </div>
  );
}
