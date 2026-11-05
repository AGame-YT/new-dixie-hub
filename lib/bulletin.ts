/** Shared bulletin types and date helpers (safe for client and server). */

export const bulletinAudiences = [
  "Everyone",
  "Students",
  "Middle School",
  "Senior School",
  "Sixth Form",
  "Staff only"
] as const;

export const staffOnlyAudience = "Staff only";

export type BulletinEntryItem = {
  id: string;
  date: string;
  title: string;
  body: string;
  audience: string;
  pinned: boolean;
  createdByName?: string;
  updatedByName?: string;
  updatedAt: string;
};

export type BulletinInput = Pick<BulletinEntryItem, "date" | "title" | "body" | "audience" | "pinned">;

const dateKeyPattern = /^\d{4}-\d{2}-\d{2}$/;
const shortDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const longDays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

/** Today's date in the UK as YYYY-MM-DD. */
export function ukDateKey(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

export function isDateKey(value: unknown): value is string {
  if (typeof value !== "string" || !dateKeyPattern.test(value)) return false;
  return toUtc(value).toISOString().slice(0, 10) === value;
}

function toUtc(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

export function addDays(key: string, days: number) {
  const date = toUtc(key);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

export function daysBetween(from: string, to: string) {
  return Math.round((toUtc(to).getTime() - toUtc(from).getTime()) / 86_400_000);
}

/** Monday = 0 … Sunday = 6. */
export function weekdayIndex(key: string) {
  return (toUtc(key).getUTCDay() + 6) % 7;
}

export function formatDateKey(key: string, style: "short" | "long" = "short") {
  const date = toUtc(key);
  const day = date.getUTCDate();
  const month = months[date.getUTCMonth()];
  return style === "long"
    ? `${longDays[date.getUTCDay()]} ${day} ${month}`
    : `${shortDays[date.getUTCDay()]} ${day} ${month.slice(0, 3)}`;
}

export function relativeDateLabel(key: string, today: string) {
  const difference = daysBetween(today, key);
  if (difference === 0) return "Today";
  if (difference === 1) return "Tomorrow";
  return formatDateKey(key);
}

/** Month as YYYY-MM, its label, and the Monday-to-Sunday grid that covers it. */
export function monthGrid(month: string) {
  const first = `${month}-01`;
  const start = addDays(first, -weekdayIndex(first));
  const date = toUtc(first);
  date.setUTCMonth(date.getUTCMonth() + 1, 0);
  const last = date.toISOString().slice(0, 10);
  const end = addDays(last, 6 - weekdayIndex(last));
  const days = Array.from({ length: daysBetween(start, end) + 1 }, (_, index) =>
    addDays(start, index)
  );
  return { start, end, days, label: `${months[toUtc(first).getUTCMonth()]} ${month.slice(0, 4)}` };
}

export function shiftMonth(month: string, by: number) {
  const date = toUtc(`${month}-01`);
  date.setUTCMonth(date.getUTCMonth() + by);
  return date.toISOString().slice(0, 7);
}

/** Validates a create/update request body. */
export function parseBulletinInput(body: unknown): BulletinInput | { error: string } {
  const value = (body ?? {}) as Record<string, unknown>;
  const title = typeof value.title === "string" ? value.title.trim() : "";
  const text = typeof value.body === "string" ? value.body.trim() : "";
  const audience = typeof value.audience === "string" ? value.audience : "Everyone";
  if (!isDateKey(value.date)) return { error: "Choose a valid date" };
  if (!title) return { error: "Add a title" };
  if (title.length > 120) return { error: "Keep the title under 120 characters" };
  if (text.length > 2000) return { error: "Keep the details under 2,000 characters" };
  if (!(bulletinAudiences as readonly string[]).includes(audience)) {
    return { error: "Choose who the notice is for" };
  }
  return { date: value.date, title, body: text, audience, pinned: value.pinned === true };
}
