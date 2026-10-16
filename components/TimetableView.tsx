"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/Icon";
import { subjectStyle } from "@/lib/config";
import type { TimetableItem } from "@/lib/types";

const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

const toMinutes = (time: string) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

function useNow() {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);
  return now;
}

function LessonIcon({ subject }: { subject: string }) {
  const style = subjectStyle(subject);
  return (
    <span className={`subject-icon ${style.colour}`}>
      <Icon name={style.icon} size={18} />
    </span>
  );
}

export function TimetableView({ entries }: { entries: TimetableItem[] }) {
  const now = useNow();
  const today = now?.toLocaleDateString("en-GB", { weekday: "long" }) ?? "";
  const isSchoolDay = weekdays.includes(today);
  const [view, setView] = useState<"day" | "week">("day");
  const [day, setDay] = useState("Monday");

  useEffect(() => {
    if (isSchoolDay) setDay(today);
  }, [isSchoolDay, today]);

  const minutesNow = now ? now.getHours() * 60 + now.getMinutes() : -1;
  const lessonState = (entry: TimetableItem) => {
    if (entry.day !== today) return "";
    if (minutesNow >= toMinutes(entry.endTime)) return "past";
    if (minutesNow >= toMinutes(entry.startTime)) return "now";
    return "";
  };

  const dayEntries = useMemo(
    () => entries.filter((entry) => entry.day === day),
    [day, entries]
  );
  const nextId =
    day === today
      ? dayEntries.find((entry) => toMinutes(entry.startTime) > minutesNow)?.id
      : undefined;
  const periods = useMemo(
    () =>
      Array.from(new Set(entries.map((entry) => entry.lesson))).map((lesson) => {
        const sample = entries.find((entry) => entry.lesson === lesson)!;
        return { lesson, startTime: sample.startTime, endTime: sample.endTime };
      }),
    [entries]
  );

  return (
    <div className="timetable">
      <div className="timetable-toolbar">
        <div className="segmented" role="group" aria-label="Timetable view">
          <button
            type="button"
            className={view === "day" ? "active" : ""}
            onClick={() => setView("day")}
            aria-pressed={view === "day"}
          >
            <Icon name="list" size={16} /> Day
          </button>
          <button
            type="button"
            className={view === "week" ? "active" : ""}
            onClick={() => setView("week")}
            aria-pressed={view === "week"}
          >
            <Icon name="grid" size={16} /> Week
          </button>
        </div>
        {view === "day" && (
          <div className="day-pills" role="tablist" aria-label="Timetable day">
            {weekdays.map((weekday) => (
              <button
                type="button"
                key={weekday}
                role="tab"
                aria-selected={day === weekday}
                className={[
                  day === weekday ? "active" : "",
                  weekday === today ? "today" : ""
                ].join(" ")}
                onClick={() => setDay(weekday)}
              >
                {weekday.slice(0, 3)}
              </button>
            ))}
          </div>
        )}
      </div>

      {view === "day" ? (
        <ol className="day-list">
          {dayEntries.map((entry) => (
            <li
              key={entry.id}
              className={`day-lesson ${lessonState(entry)} ${
                entry.id === nextId ? "next" : ""
              }`}
            >
              <span className="day-lesson-time">
                <strong>{entry.startTime}</strong>
                <small>{entry.endTime}</small>
              </span>
              <LessonIcon subject={entry.subject} />
              <span className="day-lesson-copy">
                <strong>{entry.subject}</strong>
                <small>
                  {[entry.teacher, entry.room].filter(Boolean).join(" · ")}
                </small>
              </span>
              {lessonState(entry) === "now" && <span className="lesson-tag">Now</span>}
              {entry.id === nextId && lessonState(entry) !== "now" && (
                <span className="lesson-tag next">Next</span>
              )}
            </li>
          ))}
          {dayEntries.length === 0 && (
            <li className="empty-state small">
              <Icon name="calendar" />
              <p>No lessons on {day}.</p>
            </li>
          )}
        </ol>
      ) : (
        <div className="week-scroll">
          <table className="week-grid">
            <thead>
              <tr>
                <th scope="col">
                  <span className="sr-only">Period</span>
                </th>
                {weekdays.map((weekday) => (
                  <th
                    scope="col"
                    key={weekday}
                    className={weekday === today ? "today" : ""}
                  >
                    {weekday.slice(0, 3)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {periods.map((period) => (
                <tr key={period.lesson}>
                  <th scope="row">
                    <strong>{period.lesson.replace("Period ", "P")}</strong>
                    <small>{period.startTime}</small>
                  </th>
                  {weekdays.map((weekday) => {
                    const entry = entries.find(
                      (item) => item.day === weekday && item.lesson === period.lesson
                    );
                    if (!entry) return <td key={weekday} />;
                    const style = subjectStyle(entry.subject);
                    return (
                      <td key={weekday}>
                        <span
                          className={`week-cell ${style.colour} ${lessonState(entry)}`}
                          title={`${entry.subject} · ${entry.teacher} · ${entry.room}`}
                        >
                          <Icon name={style.icon} size={15} />
                          <strong>{entry.subject}</strong>
                          <small>{entry.room}</small>
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
