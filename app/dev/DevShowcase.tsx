"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { Icon } from "@/components/Icon";
import { learningLinks, schoolValues } from "@/lib/config";
import { demoHomework, demoTimetable } from "@/lib/demo-data";

/* ------------------------------------------------------------------ types */
type AgeMode = "junior" | "senior";
type TextSize = 1 | 2 | 3;

type Task = {
  id: string;
  title: string;
  subject: string;
  priority: string;
  dueLabel: string;
  done: boolean;
};

type House = {
  id: "york" | "lancaster";
  name: string;
  points: number;
  bump: number;
};

/* --------------------------------------------------------------- helpers */
const WEEKDAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
const DAY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
];

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};

const dueLabelFor = (priority: string) => {
  switch (priority) {
    case "overdue":
      return "Overdue";
    case "today":
      return "Due today";
    case "tomorrow":
      return "Tomorrow";
    case "week":
      return "This week";
    default:
      return "Later";
  }
};

const VALUE_BLURB: Record<AgeMode, string> = {
  junior: "Tap a value to find out what it means and how we show it every day.",
  senior:
    "The habits that shape how we learn, work together and contribute to school life."
};

/* tiny confetti burst — skipped automatically under reduced motion */
function burstConfetti() {
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
  const colours = ["#0f336f", "#578bc5", "#edbd00", "#58a8ac", "#dc4f50"];
  for (let i = 0; i < 70; i += 1) {
    const piece = document.createElement("div");
    piece.className = "dev-confetti";
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.background = colours[i % colours.length];
    piece.style.animationDuration = `${1.6 + Math.random() * 1.4}s`;
    piece.style.animationDelay = `${Math.random() * 0.25}s`;
    document.body.appendChild(piece);
    window.setTimeout(() => piece.remove(), 3200);
  }
}

/* a short, friendly chime for the focus timer */
function playChime() {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    const ctx = new Ctx();
    [523.25, 659.25, 783.99].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = freq;
      osc.type = "sine";
      osc.connect(gain);
      gain.connect(ctx.destination);
      const start = ctx.currentTime + i * 0.16;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.25, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.5);
      osc.start(start);
      osc.stop(start + 0.5);
    });
    window.setTimeout(() => ctx.close(), 1500);
  } catch {
    /* audio not available — no problem */
  }
}

/* =================================================================== page */
export function DevShowcase() {
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState<Date | null>(null);

  // preferences
  const [mode, setMode] = useState<AgeMode>("senior");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [textSize, setTextSize] = useState<TextSize>(1);
  const [easyRead, setEasyRead] = useState(false);
  const [contrast, setContrast] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [a11yOpen, setA11yOpen] = useState(false);

  // command palette
  const [paletteOpen, setPaletteOpen] = useState(false);

  // clock + mount guard (prevents hydration mismatch on time-based UI)
  useEffect(() => {
    setMounted(true);
    setNow(new Date());
    const id = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(id);
  }, []);

  // reflect chosen theme on the document root so globals.css dark tokens apply
  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    const previous = root.getAttribute("data-theme");
    root.setAttribute("data-theme", theme);
    return () => {
      if (previous) root.setAttribute("data-theme", previous);
      else root.removeAttribute("data-theme");
    };
  }, [theme, mounted]);

  // keyboard: Cmd/Ctrl+K opens the palette, Esc closes overlays
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
      if (e.key === "Escape") {
        setPaletteOpen(false);
        setA11yOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const shellClass = [
    "dev-shell",
    `mode-${mode}`,
    easyRead && "easyread",
    contrast && "contrast"
  ]
    .filter(Boolean)
    .join(" ");

  const readScale = textSize === 1 ? 1 : textSize === 2 ? 1.14 : 1.28;

  return (
    <div
      className={shellClass}
      data-motion={reduceMotion ? "reduced" : "full"}
      style={{ ["--read-scale" as string]: String(readScale) }}
    >
      <TopBar
        mode={mode}
        setMode={setMode}
        theme={theme}
        setTheme={setTheme}
        now={now}
        onSearch={() => setPaletteOpen(true)}
        a11yOpen={a11yOpen}
        setA11yOpen={setA11yOpen}
        textSize={textSize}
        setTextSize={setTextSize}
        easyRead={easyRead}
        setEasyRead={setEasyRead}
        contrast={contrast}
        setContrast={setContrast}
        reduceMotion={reduceMotion}
        setReduceMotion={setReduceMotion}
      />

      <div className="dev-banner">
        <Icon name="alert" size={15} />
        <span>
          <b>Dev preview.</b> An experimental Dixie Hub interface for trying out
          new ideas — not the live site.
        </span>
        <a href="/">Back to live hub →</a>
      </div>

      <main className="dev-main">
        <Welcome mode={mode} now={now} />

        <section className="dev-bento">
          <HomeworkRing mode={mode} />
          <HouseRace />
          <Wellbeing mode={mode} />
          <TimetableToday now={now} />
          <FocusTimer />
          <QuickLinks />
        </section>

        <ValuesShowcase mode={mode} mounted={mounted} />
      </main>

      {paletteOpen && (
        <CommandPalette
          onClose={() => setPaletteOpen(false)}
          actions={[
            {
              id: "theme",
              label: theme === "light" ? "Switch to dark mode" : "Switch to light mode",
              hint: "Appearance",
              icon: theme === "light" ? "moon" : "sun",
              tone: "navy",
              run: () => setTheme((t) => (t === "light" ? "dark" : "light"))
            },
            {
              id: "junior",
              label: "Lower School view (ages 7–11)",
              hint: "Age mode",
              icon: "star",
              tone: "amber",
              run: () => setMode("junior")
            },
            {
              id: "senior",
              label: "Senior School view (ages 11–18)",
              hint: "Age mode",
              icon: "book",
              tone: "navy",
              run: () => setMode("senior")
            },
            {
              id: "homework",
              label: "Go to homework",
              hint: "Jump to section",
              icon: "homework",
              tone: "violet",
              run: () => scrollToCard("homework")
            },
            {
              id: "timetable",
              label: "Go to today's timetable",
              hint: "Jump to section",
              icon: "calendar",
              tone: "blue",
              run: () => scrollToCard("timetable")
            },
            {
              id: "focus",
              label: "Open the focus timer",
              hint: "Study tools",
              icon: "clock",
              tone: "teal",
              run: () => scrollToCard("focus")
            },
            {
              id: "values",
              label: "See the five school values",
              hint: "Jump to section",
              icon: "spark",
              tone: "rose",
              run: () => scrollToCard("values")
            },
            {
              id: "bigtext",
              label: "Make the text larger",
              hint: "Accessibility",
              icon: "search",
              tone: "green",
              run: () => setTextSize((s) => (s < 3 ? ((s + 1) as TextSize) : s))
            }
          ]}
        />
      )}
    </div>
  );
}

function scrollToCard(id: string) {
  document
    .getElementById(`dev-${id}`)
    ?.scrollIntoView({ behavior: "smooth", block: "center" });
}

/* ================================================================ top bar */
type TopBarProps = {
  mode: AgeMode;
  setMode: (m: AgeMode) => void;
  theme: "light" | "dark";
  setTheme: (fn: (t: "light" | "dark") => "light" | "dark") => void;
  now: Date | null;
  onSearch: () => void;
  a11yOpen: boolean;
  setA11yOpen: (fn: boolean | ((v: boolean) => boolean)) => void;
  textSize: TextSize;
  setTextSize: (fn: TextSize | ((s: TextSize) => TextSize)) => void;
  easyRead: boolean;
  setEasyRead: (fn: (v: boolean) => boolean) => void;
  contrast: boolean;
  setContrast: (fn: (v: boolean) => boolean) => void;
  reduceMotion: boolean;
  setReduceMotion: (fn: (v: boolean) => boolean) => void;
};

function TopBar(props: TopBarProps) {
  const {
    mode,
    setMode,
    theme,
    setTheme,
    now,
    onSearch,
    a11yOpen,
    setA11yOpen,
    textSize,
    setTextSize,
    easyRead,
    setEasyRead,
    contrast,
    setContrast,
    reduceMotion,
    setReduceMotion
  } = props;

  const time = now
    ? now.toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      })
    : "--:--:--";
  const date = now
    ? now.toLocaleDateString("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long"
      })
    : "";

  return (
    <header className="dev-topbar">
      <span className="dev-brand">
        <span className="dev-crest" aria-hidden="true">
          <img src="/brand/dixie-round.jpg" alt="" />
        </span>
        <span className="dev-brand-copy">
          <strong>Dixie Hub</strong>
          <small>The Dixie Grammar School</small>
        </span>
      </span>

      <span className="dev-topbar-spacer" />

      <span className="dev-clock" suppressHydrationWarning>
        <strong>{time}</strong>
        <small>{date}</small>
      </span>

      <button
        type="button"
        className="dev-search-hint"
        onClick={onSearch}
        aria-label="Open quick actions"
      >
        <Icon name="search" size={15} /> Quick actions <kbd>Ctrl K</kbd>
      </button>

      <div className="dev-segmented" role="group" aria-label="Age view">
        <button
          type="button"
          className={mode === "junior" ? "on" : ""}
          onClick={() => setMode("junior")}
        >
          Lower
        </button>
        <button
          type="button"
          className={mode === "senior" ? "on" : ""}
          onClick={() => setMode("senior")}
        >
          Senior
        </button>
      </div>

      <button
        type="button"
        className="dev-iconbtn"
        onClick={() => setTheme((t) => (t === "light" ? "dark" : "light"))}
        aria-label="Toggle dark mode"
      >
        <Icon name={theme === "light" ? "moon" : "sun"} size={18} />
      </button>

      <div className="dev-pop-wrap">
        <button
          type="button"
          className="dev-iconbtn"
          onClick={() => setA11yOpen((v) => !v)}
          aria-label="Accessibility options"
          aria-expanded={a11yOpen}
        >
          <Icon name="settings" size={18} />
        </button>
        {a11yOpen && (
          <div className="dev-pop" role="dialog" aria-label="Accessibility">
            <h3>Make it comfortable</h3>
            <div className="dev-pop-row">
              <span>Text size</span>
              <span className="dev-seg-mini">
                {([1, 2, 3] as TextSize[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={textSize === s ? "on" : ""}
                    onClick={() => setTextSize(() => s)}
                    style={{ fontSize: `${9 + s * 2}px` }}
                  >
                    A
                  </button>
                ))}
              </span>
            </div>
            <PopToggle
              label="Easy-read font"
              on={easyRead}
              onClick={() => setEasyRead((v) => !v)}
            />
            <PopToggle
              label="High contrast"
              on={contrast}
              onClick={() => setContrast((v) => !v)}
            />
            <PopToggle
              label="Reduce motion"
              on={reduceMotion}
              onClick={() => setReduceMotion((v) => !v)}
            />
          </div>
        )}
      </div>
    </header>
  );
}

function PopToggle({
  label,
  on,
  onClick
}: {
  label: string;
  on: boolean;
  onClick: () => void;
}) {
  return (
    <div className="dev-pop-row">
      <span>{label}</span>
      <button
        type="button"
        className={`dev-toggle ${on ? "on" : ""}`}
        onClick={onClick}
        aria-pressed={on}
        aria-label={label}
      >
        <span />
      </button>
    </div>
  );
}

/* ================================================================ welcome */
function Welcome({ mode, now }: { mode: AgeMode; now: Date | null }) {
  const hour = now?.getHours() ?? 9;
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const name = "Alex";

  const lead =
    mode === "junior"
      ? "Here is your day all in one place. Let's make it a great one! 🌟"
      : "Everything for your school day in one place — homework, lessons, links and more.";

  return (
    <section className="dev-welcome">
      <div className="dev-welcome-text">
        <span className="dev-eyebrow">
          <span />
          {mode === "junior" ? "Your Dixie day" : "Student dashboard"}
        </span>
        <h1 suppressHydrationWarning>
          {greeting}, <em>{name}</em>.
        </h1>
        <p>{lead}</p>
      </div>
      <NowNext now={now} />
    </section>
  );
}

/* ----------------------------------------------------------- now & next */
function NowNext({ now }: { now: Date | null }) {
  // Render a stable skeleton until the clock is set on the client. This keeps
  // the server and first client render identical (no hydration mismatch).
  const info = useMemo(() => {
    if (!now) return null;
    const ref = now;
    const dayIdx = ref.getDay();
    const isWeekend = dayIdx === 0 || dayIdx === 6;
    const dayName = isWeekend ? "Monday" : DAY_LABELS[dayIdx];

    const lessons = demoTimetable
      .filter((l) => l.day === dayName)
      .sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));

    const mins = ref.getHours() * 60 + ref.getMinutes();
    let current = null as (typeof lessons)[number] | null;
    let next = null as (typeof lessons)[number] | null;

    if (!isWeekend) {
      for (const lesson of lessons) {
        const start = toMinutes(lesson.startTime);
        const end = toMinutes(lesson.endTime);
        if (mins >= start && mins < end) current = lesson;
        if (mins < start && !next) next = lesson;
      }
    } else {
      next = lessons[0] ?? null;
    }

    let progress = 0;
    let minutesLeft = 0;
    if (current) {
      const start = toMinutes(current.startTime);
      const end = toMinutes(current.endTime);
      progress = Math.round(((mins - start) / (end - start)) * 100);
      minutesLeft = end - mins;
    }

    return { current, next, progress, minutesLeft, isWeekend, dayName };
  }, [now]);

  if (!info) {
    return (
      <div className="dev-nownext">
        <div className="dev-nownext-top">
          <span>
            <span className="dev-pulse" /> Timetable
          </span>
        </div>
        <div className="dev-nownext-body">
          <span className="dev-nownext-icon">
            <Icon name="clock" size={24} />
          </span>
          <div>
            <strong>Loading your day…</strong>
            <small>Checking what's on right now.</small>
          </div>
        </div>
      </div>
    );
  }

  const show = info.current ?? info.next;
  const label = info.current
    ? "Now in lesson"
    : info.isWeekend
      ? `Next school day · ${info.dayName}`
      : "Up next today";

  if (!show) {
    return (
      <div className="dev-nownext">
        <div className="dev-nownext-top">
          <span>
            <span className="dev-pulse" /> Timetable
          </span>
        </div>
        <div className="dev-nownext-body">
          <span className="dev-nownext-icon">
            <Icon name="check" size={24} />
          </span>
          <div>
            <strong>All done for today</strong>
            <small>No more lessons scheduled. Enjoy your evening!</small>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dev-nownext">
      <div className="dev-nownext-top">
        <span>
          <span className="dev-pulse" /> {label}
        </span>
        <span>{show.lesson}</span>
      </div>
      <div className="dev-nownext-body">
        <span className="dev-nownext-icon">
          <Icon name="book" size={24} />
        </span>
        <div>
          <strong>{show.subject}</strong>
          <small>
            {show.room} · {show.teacher} · {show.startTime}–{show.endTime}
          </small>
        </div>
        {info.current && (
          <div className="dev-nownext-countdown">
            <b suppressHydrationWarning>{info.minutesLeft}</b>
            <span>mins left</span>
          </div>
        )}
      </div>
      {info.current && (
        <div className="dev-nownext-bar" aria-hidden="true">
          <i style={{ width: `${Math.min(100, Math.max(2, info.progress))}%` }} />
        </div>
      )}
    </div>
  );
}

/* =========================================================== homework ring */
function HomeworkRing({ mode }: { mode: AgeMode }) {
  const [tasks, setTasks] = useState<Task[]>(() =>
    demoHomework.slice(0, 5).map((h) => ({
      id: h.id,
      title: h.title,
      subject: h.subject,
      priority: h.priority,
      dueLabel: dueLabelFor(h.priority),
      done: h.status === "COMPLETE" || h.status === "SUBMITTED"
    }))
  );

  const doneCount = tasks.filter((t) => t.done).length;
  const pct = Math.round((doneCount / tasks.length) * 100);
  const allDone = doneCount === tasks.length;

  const r = 52;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);

  const wasAllDone = useRef(false);
  useEffect(() => {
    if (allDone && !wasAllDone.current) burstConfetti();
    wasAllDone.current = allDone;
  }, [allDone]);

  const toggle = (id: string) =>
    setTasks((list) =>
      list.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    );

  return (
    <article className="dev-card c4" id="dev-homework">
      <div className="dev-card-head">
        <span className="dev-chip">
          <Icon name="homework" size={20} />
        </span>
        <div>
          <h2>Homework</h2>
          <p>{mode === "junior" ? "Tick off your jobs" : "Track what's due"}</p>
        </div>
      </div>

      <div className="dev-ring-wrap">
        <div className={`dev-ring ${allDone ? "done" : ""}`}>
          <svg width="116" height="116" viewBox="0 0 120 120">
            <circle
              className="dev-ring-track-c"
              cx="60"
              cy="60"
              r={r}
              fill="none"
              strokeWidth="11"
            />
            <circle
              className="dev-ring-fill"
              cx="60"
              cy="60"
              r={r}
              fill="none"
              strokeWidth="11"
              strokeDasharray={circ}
              strokeDashoffset={offset}
            />
          </svg>
          <div className="dev-ring-label">
            <b>{pct}%</b>
            <span>done</span>
          </div>
        </div>
        <div className="dev-ring-side">
          <strong>
            {allDone
              ? mode === "junior"
                ? "All done! 🎉"
                : "All caught up!"
              : `${tasks.length - doneCount} to go`}
          </strong>
          <p>
            {allDone
              ? "Brilliant work — everything is complete."
              : "Tick tasks as you finish them and watch the ring fill up."}
          </p>
        </div>
      </div>

      <div className="dev-task-list">
        {tasks.map((t) => (
          <button
            type="button"
            key={t.id}
            className={`dev-task p-${t.priority} ${t.done ? "is-done" : ""}`}
            onClick={() => toggle(t.id)}
          >
            <span className="dev-check">
              <Icon name="check" size={14} />
            </span>
            <span className="dev-task-copy">
              <strong>{t.title}</strong>
              <span>{t.subject}</span>
            </span>
            <span className="dev-task-due">{t.done ? "Done" : t.dueLabel}</span>
          </button>
        ))}
      </div>
    </article>
  );
}

/* ============================================================= house race */
function HouseRace() {
  const [houses, setHouses] = useState<House[]>([
    { id: "york", name: "York", points: 1248, bump: 0 },
    { id: "lancaster", name: "Lancaster", points: 1196, bump: 0 }
  ]);

  const award = useCallback(() => {
    setHouses((list) => {
      const pick = Math.random() < 0.5 ? 0 : 1;
      const gain = 5 + Math.floor(Math.random() * 20);
      return list.map((h, i) =>
        i === pick ? { ...h, points: h.points + gain, bump: gain } : { ...h, bump: 0 }
      );
    });
  }, []);

  const ranked = [...houses].sort((a, b) => b.points - a.points);
  const max = Math.max(...houses.map((h) => h.points));
  const leader = ranked[0];

  return (
    <article className="dev-card c4" id="dev-houses">
      <div className="dev-card-head">
        <span className="dev-chip">
          <Icon name="star" size={20} />
        </span>
        <div>
          <h2>House cup</h2>
          <p>{leader.name} in the lead</p>
        </div>
        <button
          type="button"
          className="dev-btn small dev-card-action"
          onClick={award}
        >
          <Icon name="spark" size={14} /> Award points
        </button>
      </div>

      <div className="dev-race">
        {ranked.map((h) => (
          <div className={`dev-race-row ${h.id}`} key={h.id}>
            <span className={`dev-house-mark dev-house-${h.id}`}>{h.name[0]}</span>
            <div>
              <div className="dev-race-meta">
                <strong>
                  {h.name}
                  {h.bump > 0 && <em className="dev-bump"> +{h.bump}</em>}
                </strong>
                <b>{h.points.toLocaleString("en-GB")}</b>
              </div>
              <div className="dev-race-track" aria-hidden="true">
                <i style={{ width: `${(h.points / max) * 100}%` }} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="dev-race-foot">
        <Icon name="spark" size={13} />
        Live demo — press “Award points” to see the race update in real time.
      </div>
    </article>
  );
}

/* ============================================================== wellbeing */
const MOODS = [
  { id: "great", emoji: "😄", label: "Great" },
  { id: "good", emoji: "🙂", label: "Good" },
  { id: "ok", emoji: "😐", label: "Okay" },
  { id: "low", emoji: "😟", label: "Low" },
  { id: "tough", emoji: "😢", label: "Tough" }
];

const MOOD_REPLY: Record<string, { title: string; body: string }> = {
  great: {
    title: "Love that! ⭐",
    body: "Brilliant — carry that energy into your lessons today."
  },
  good: {
    title: "Good to hear",
    body: "Have a great day. Remember to take short breaks between tasks."
  },
  ok: {
    title: "That's alright",
    body: "Some days are just okay, and that's fine. Be kind to yourself today."
  },
  low: {
    title: "Thanks for sharing",
    body: "If something is bothering you, talking to your tutor can really help."
  },
  tough: {
    title: "We're here for you",
    body: "Please tell a trusted adult or your tutor. You don't have to manage it alone."
  }
};

function Wellbeing({ mode }: { mode: AgeMode }) {
  const [picked, setPicked] = useState<string | null>(null);
  const reply = picked ? MOOD_REPLY[picked] : null;

  return (
    <article className="dev-card c4" id="dev-wellbeing">
      <div className="dev-card-head">
        <span className="dev-chip">
          <Icon name="heart" size={20} />
        </span>
        <div>
          <h2>How are you?</h2>
          <p>
            {mode === "junior"
              ? "Tap the face that fits"
              : "A quick, private check-in"}
          </p>
        </div>
      </div>

      <div className="dev-moods" role="group" aria-label="How are you feeling?">
        {MOODS.map((m) => (
          <button
            type="button"
            key={m.id}
            className={`dev-mood ${picked === m.id ? "on" : ""}`}
            onClick={() => setPicked(m.id)}
            aria-pressed={picked === m.id}
          >
            <span className="emoji" aria-hidden="true">
              {m.emoji}
            </span>
            <span>{m.label}</span>
          </button>
        ))}
      </div>

      {reply && (
        <div className="dev-mood-reply">
          <Icon name="heart" size={18} />
          <span>
            <b>{reply.title}</b>
            {reply.body}
          </span>
        </div>
      )}
    </article>
  );
}

/* ========================================================= timetable today */
function TimetableToday({ now }: { now: Date | null }) {
  // Hold off on time-derived markup until the client clock is ready.
  if (!now) {
    return (
      <article className="dev-card c8" id="dev-timetable">
        <div className="dev-card-head">
          <span className="dev-chip">
            <Icon name="calendar" size={20} />
          </span>
          <div>
            <h2>Today's lessons</h2>
            <p>Loading…</p>
          </div>
        </div>
      </article>
    );
  }

  const ref = now;
  const dayIdx = ref.getDay();
  const isWeekend = dayIdx === 0 || dayIdx === 6;
  const dayName = isWeekend ? "Monday" : DAY_LABELS[dayIdx];
  const mins = ref.getHours() * 60 + ref.getMinutes();

  const lessons = demoTimetable
    .filter((l) => l.day === dayName)
    .sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime));

  const colourClass = (c: string) =>
    ({
      plum: "rose",
      blue: "blue",
      green: "green",
      amber: "amber",
      red: "red",
      violet: "violet",
      cyan: "cyan"
    })[c] ?? "blue";

  return (
    <article className="dev-card c8" id="dev-timetable">
      <div className="dev-card-head">
        <span className="dev-chip">
          <Icon name="calendar" size={20} />
        </span>
        <div>
          <h2>{isWeekend ? "Monday's lessons" : "Today's lessons"}</h2>
          <p>
            {dayName}
            {isWeekend ? " · weekend preview" : ""}
          </p>
        </div>
      </div>

      <div className="dev-links" style={{ gridTemplateColumns: "1fr 1fr" }}>
        {lessons.map((l) => {
          const start = toMinutes(l.startTime);
          const end = toMinutes(l.endTime);
          const isNow = !isWeekend && mins >= start && mins < end;
          return (
            <div
              className="dev-link"
              key={l.id}
              style={
                isNow
                  ? {
                      borderColor: "var(--plum)",
                      boxShadow: "0 0 0 2px color-mix(in srgb, var(--plum) 25%, transparent)"
                    }
                  : undefined
              }
            >
              <span className={`ic ${colourClass(l.colour)}`}>
                <Icon name="book" size={18} />
              </span>
              <span style={{ minWidth: 0, flex: 1 }}>
                <strong>{l.subject}</strong>
                <small>
                  {l.startTime}–{l.endTime} · {l.room}
                </small>
              </span>
              {isNow && (
                <span className="dev-task-due" style={{ color: "var(--plum)" }}>
                  Now
                </span>
              )}
            </div>
          );
        })}
      </div>
    </article>
  );
}

/* ============================================================= focus timer */
const PRESETS = [5, 15, 25];

function FocusTimer() {
  const [minutes, setMinutes] = useState(25);
  const [secondsLeft, setSecondsLeft] = useState(25 * 60);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          window.clearInterval(id);
          setRunning(false);
          playChime();
          burstConfetti();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running]);

  const setPreset = (m: number) => {
    setMinutes(m);
    setSecondsLeft(m * 60);
    setRunning(false);
  };

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  const finished = secondsLeft === 0;

  return (
    <article className={`dev-card c4 dev-timer ${running ? "running" : ""}`} id="dev-focus">
      <div className="dev-card-head" style={{ alignSelf: "stretch" }}>
        <span className="dev-chip">
          <Icon name="clock" size={20} />
        </span>
        <div>
          <h2>Focus timer</h2>
          <p>Study in short bursts</p>
        </div>
      </div>

      <div className="dev-timer-presets">
        {PRESETS.map((m) => (
          <button
            type="button"
            key={m}
            className={minutes === m ? "on" : ""}
            onClick={() => setPreset(m)}
          >
            {m}m
          </button>
        ))}
      </div>

      <div className="dev-timer-display">
        {mm}:{ss}
      </div>
      <div className="dev-timer-state">
        {finished ? "Time's up — great focus! 🎉" : running ? "Focusing…" : "Ready"}
      </div>

      <div className="dev-timer-controls">
        <button
          type="button"
          className="dev-btn primary"
          onClick={() => {
            if (finished) setSecondsLeft(minutes * 60);
            setRunning((v) => !v);
          }}
        >
          <Icon name={running ? "clock" : "play"} size={15} />
          {running ? "Pause" : finished ? "Restart" : "Start"}
        </button>
        <button
          type="button"
          className="dev-btn"
          onClick={() => setPreset(minutes)}
        >
          Reset
        </button>
      </div>
    </article>
  );
}

/* ============================================================== quick links */
function QuickLinks() {
  const links = learningLinks.filter((l) =>
    ["classroom", "gmail", "drive", "calendar", "seneca", "sparx", "library", "wellbeing"].includes(
      l.id
    )
  );

  return (
    <article className="dev-card c12" id="dev-links">
      <div className="dev-card-head">
        <span className="dev-chip">
          <Icon name="grid" size={20} />
        </span>
        <div>
          <h2>Quick links</h2>
          <p>Everything you use most, one tap away</p>
        </div>
      </div>

      <div className="dev-links">
        {links.map((l) => (
          <a
            className="dev-link"
            key={l.id}
            href={l.url}
            target="_blank"
            rel="noreferrer"
          >
            <span className={`ic ${l.colour}`}>
              <Icon name={l.icon} size={18} />
            </span>
            <span style={{ minWidth: 0, flex: 1 }}>
              <strong>{l.title}</strong>
              <small>{l.description}</small>
            </span>
            <Icon name="external" size={14} style={{ color: "var(--ink-soft)", opacity: 0.5 }} />
          </a>
        ))}
      </div>
    </article>
  );
}

/* ============================================================ values block */
function ValuesShowcase({ mode, mounted }: { mode: AgeMode; mounted: boolean }) {
  const [open, setOpen] = useState<string | null>(null);
  const [spot, setSpot] = useState(0);

  // gently rotate the "value of the week" spotlight
  useEffect(() => {
    if (!mounted) return;
    const id = window.setInterval(
      () => setSpot((s) => (s + 1) % schoolValues.length),
      5000
    );
    return () => window.clearInterval(id);
  }, [mounted]);

  const featured = schoolValues[spot];
  const spotColour: Record<string, string> = {
    respect: "var(--respect)",
    resilience: "var(--resilience)",
    courage: "var(--courage)",
    commitment: "var(--commitment)",
    care: "var(--care)"
  };

  return (
    <section className="dev-values" id="dev-values">
      <div className="dev-values-head">
        <div>
          <h2>Our five values</h2>
          <p>{VALUE_BLURB[mode]}</p>
        </div>
        <span className="dev-eyebrow" style={{ marginBottom: 0 }}>
          <span /> The Dixie way
        </span>
      </div>

      <div
        className="dev-spotlight"
        style={{ ["--spot-colour" as string]: spotColour[featured.colour] }}
      >
        <img className="dev-spotlight-img" src={featured.image} alt="" />
        <div className="dev-spotlight-copy">
          <span className="tag">
            <Icon name="star" size={13} /> Value in focus
          </span>
          <h3>{featured.name}</h3>
          <p>{featured.statement}</p>
        </div>
      </div>

      <div className="dev-value-grid">
        {schoolValues.map((v) => (
          <button
            type="button"
            key={v.id}
            className={`dev-value-card v-${v.colour} ${open === v.id ? "on" : ""}`}
            onClick={() => setOpen((cur) => (cur === v.id ? null : v.id))}
            aria-expanded={open === v.id}
          >
            <img src={v.image} alt="" />
            <span className="dev-value-card-body">
              <strong>
                <i /> {v.name}
              </strong>
              <p>{v.statement}</p>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

/* ========================================================== command palette */
type PaletteAction = {
  id: string;
  label: string;
  hint: string;
  icon: string;
  tone: string;
  run: () => void;
};

function CommandPalette({
  onClose,
  actions
}: {
  onClose: () => void;
  actions: PaletteAction[];
}) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const filtered = actions.filter(
    (a) =>
      a.label.toLowerCase().includes(query.toLowerCase()) ||
      a.hint.toLowerCase().includes(query.toLowerCase())
  );

  const choose = (action: PaletteAction | undefined) => {
    if (!action) return;
    action.run();
    onClose();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      choose(filtered[active]);
    }
  };

  return (
    <div
      className="dev-cmdk-overlay"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="dev-cmdk"
        role="dialog"
        aria-label="Quick actions"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dev-cmdk-input">
          <Icon name="search" size={18} />
          <input
            ref={inputRef}
            value={query}
            placeholder="Type a command or search…"
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
          />
        </div>
        <div className="dev-cmdk-list">
          {filtered.length === 0 && (
            <div className="dev-cmdk-empty">No matching actions.</div>
          )}
          {filtered.map((a, i) => (
            <button
              type="button"
              key={a.id}
              className={`dev-cmdk-item ${i === active ? "active" : ""}`}
              onMouseEnter={() => setActive(i)}
              onClick={() => choose(a)}
            >
              <span className={`ic ${a.tone}`}>
                <Icon name={a.icon} size={16} />
              </span>
              <span style={{ minWidth: 0, flex: 1 }}>
                <strong>{a.label}</strong>
                <small>{a.hint}</small>
              </span>
              <Icon name="arrow" size={14} style={{ color: "var(--ink-soft)" }} />
            </button>
          ))}
        </div>
        <div className="dev-cmdk-foot">
          <span>
            <kbd>↑</kbd> <kbd>↓</kbd> to navigate
          </span>
          <span>
            <kbd>↵</kbd> to select
          </span>
          <span>
            <kbd>Esc</kbd> to close
          </span>
        </div>
      </div>
    </div>
  );
}
