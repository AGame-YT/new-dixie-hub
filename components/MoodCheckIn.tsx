"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";
import { moodLevels, type MoodLevel } from "@/lib/types";

export const moodLabels: Record<MoodLevel, string> = {
  1: "Awful",
  2: "Low",
  3: "OK",
  4: "Good",
  5: "Great"
};

type State = "idle" | "sending" | "sent" | "error";

export function MoodCheckIn({
  demo = false,
  supportUrl
}: {
  demo?: boolean;
  supportUrl: string;
}) {
  const [mood, setMood] = useState<MoodLevel | null>(null);
  const [note, setNote] = useState("");
  const [state, setState] = useState<State>("idle");
  const [routed, setRouted] = useState(true);

  async function send() {
    if (!mood) return;
    setState("sending");
    try {
      const response = await fetch("/api/wellbeing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mood, note, demo })
      });
      const data = (await response.json()) as { routed?: boolean };
      if (!response.ok) throw new Error();
      setRouted(data.routed !== false);
      setState("sent");
    } catch {
      setState("error");
    }
  }

  if (state === "sent") {
    return (
      <div className="mood-card sent" role="status">
        <span className="mood-sent-icon">
          <Icon name={`mood-${mood}`} size={30} />
        </span>
        <div>
          <strong>Thanks for checking in</strong>
          <p>
            {routed
              ? "Shared privately with your form tutor and head of section."
              : "Saved. Your form group isn't linked yet, so please also speak to your form tutor."}
            {demo && " (Demo: nothing was sent.)"}
          </p>
        </div>
        <button
          type="button"
          className="icon-button small"
          onClick={() => {
            setMood(null);
            setNote("");
            setState("idle");
          }}
          aria-label="Check in again"
          title="Check in again"
        >
          <Icon name="pencil" size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="mood-card">
      <div className="mood-heading">
        <h2>How are you feeling?</h2>
        <span className="mood-private" title="Only your form tutor and head of section can see this">
          <Icon name="lock" size={14} /> Private
        </span>
      </div>
      <div className="mood-options" role="radiogroup" aria-label="How are you feeling?">
        {moodLevels.map((level) => (
          <button
            type="button"
            role="radio"
            aria-checked={mood === level}
            key={level}
            className={`mood-option mood-${level} ${mood === level ? "active" : ""}`}
            onClick={() => setMood(level)}
            title={moodLabels[level]}
          >
            <Icon name={`mood-${level}`} size={30} />
            <span>{moodLabels[level]}</span>
          </button>
        ))}
      </div>
      {mood && (
        <div className="mood-followup">
          <label>
            <span className="sr-only">Anything you want to add? (optional)</span>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              maxLength={500}
              rows={2}
              placeholder="Anything you'd like your tutor to know? (optional)"
            />
          </label>
          <button
            type="button"
            className="button primary small"
            onClick={send}
            disabled={state === "sending"}
          >
            <Icon name="send" size={16} /> Send
          </button>
        </div>
      )}
      {mood && mood <= 2 && (
        <p className="mood-support">
          <Icon name="heart" size={15} />
          Need to talk today? Speak to any member of staff, or{" "}
          <a href={supportUrl} target="_blank" rel="noreferrer">
            find support
          </a>
          .
        </p>
      )}
      {state === "error" && (
        <p className="mood-error" role="alert">
          That didn&apos;t send. Please try again or speak to your form tutor.
        </p>
      )}
    </div>
  );
}
