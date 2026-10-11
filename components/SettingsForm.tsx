"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";

export function SettingsForm({ demo = false }: { demo?: boolean }) {
  const [saved, setSaved] = useState(false);
  const [prefs, setPrefs] = useState({
    compactHomework: false,
    emailSummary: true,
    schoolNotices: true,
    dueReminders: true,
    weekStartsMonday: true
  });

  useEffect(() => {
    const stored = localStorage.getItem("dixie-preferences");
    if (stored) {
      try {
        setPrefs((current) => ({ ...current, ...JSON.parse(stored) }));
      } catch {
        localStorage.removeItem("dixie-preferences");
      }
    }
  }, []);

  const toggle = (key: keyof typeof prefs) => {
    setPrefs((current) => ({ ...current, [key]: !current[key] }));
  };

  const save = () => {
    localStorage.setItem("dixie-preferences", JSON.stringify(prefs));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  return (
    <div className="settings-stack">
      <section className="panel settings-panel">
        <div className="settings-panel-heading">
          <span className="panel-icon"><Icon name="homework" /></span>
          <div>
            <h2>Dashboard preferences</h2>
            <p>Choose what appears first when you open Dixie Hub.</p>
          </div>
        </div>
        <SettingRow
          label="Compact homework cards"
          description="Show more assignments at once."
          checked={prefs.compactHomework}
          onChange={() => toggle("compactHomework")}
        />
        <SettingRow
          label="Email summary"
          description="Show the latest unread school emails."
          checked={prefs.emailSummary}
          onChange={() => toggle("emailSummary")}
        />
        <SettingRow
          label="School notices"
          description="Show notices from Dixie staff on your dashboard."
          checked={prefs.schoolNotices}
          onChange={() => toggle("schoolNotices")}
        />
      </section>

      <section className="panel settings-panel">
        <div className="settings-panel-heading">
          <span className="panel-icon"><Icon name="bell" /></span>
          <div>
            <h2>Reminders</h2>
            <p>Control local reminders and timetable display.</p>
          </div>
        </div>
        <SettingRow
          label="Homework due reminders"
          description="Highlight work due today or tomorrow."
          checked={prefs.dueReminders}
          onChange={() => toggle("dueReminders")}
        />
        <SettingRow
          label="Week starts on Monday"
          description="Use the standard Dixie school week layout."
          checked={prefs.weekStartsMonday}
          onChange={() => toggle("weekStartsMonday")}
        />
      </section>

      <section className="privacy-callout">
        <Icon name="heart" />
        <div>
          <strong>Your privacy matters</strong>
          <p>
            Dixie Hub only requests read-only access to enabled Google services.
            Full email content is not stored. {demo && "This preview uses demo data only."}
          </p>
        </div>
      </section>

      <div className="settings-actions">
        <button className="button primary" type="button" onClick={save}>
          {saved ? <Icon name="check" size={17} /> : null}
          {saved ? "Preferences saved" : "Save preferences"}
        </button>
      </div>
    </div>
  );
}

function SettingRow({
  label,
  description,
  checked,
  onChange
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="setting-row">
      <div>
        <strong>{label}</strong>
        <span>{description}</span>
      </div>
      <button
        className={checked ? "switch active" : "switch"}
        role="switch"
        aria-checked={checked}
        type="button"
        onClick={onChange}
      >
        <span />
      </button>
    </div>
  );
}
