import { Icon } from "@/components/Icon";
import type { FixtureItem } from "@/lib/types";

const dayLabel = (iso: string) => {
  const today = new Date().toISOString().slice(0, 10);
  const tomorrow = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10);
  if (iso === today) return "Today";
  if (iso === tomorrow) return "Tomorrow";
  return new Date(`${iso}T12:00:00`).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short"
  });
};

/** Upcoming fixtures, with who is playing. `viewerName` highlights the signed-in pupil. */
export function FixturesList({
  fixtures,
  viewerName
}: {
  fixtures: FixtureItem[];
  viewerName?: string | null;
}) {
  const me = viewerName?.trim().toLowerCase();
  return (
    <ul className="fixtures">
      {fixtures.map((fixture) => {
        const playing = Boolean(me && fixture.squad.some((name) => name.toLowerCase() === me));
        return (
          <li key={fixture.id} className={playing ? "fixture playing" : "fixture"}>
            <div className="fixture-when">
              <strong>{dayLabel(fixture.date)}</strong>
              <small>{fixture.time}</small>
            </div>
            <div className="fixture-main">
              <strong>
                {fixture.sport} · {fixture.team} v {fixture.opponent}
              </strong>
              <small>
                {fixture.venue} · {fixture.location}
                {fixture.note ? ` · ${fixture.note}` : ""}
              </small>
              <details>
                <summary>Who&apos;s playing ({fixture.squad.length})</summary>
                <p>{fixture.squad.join(", ")}</p>
              </details>
            </div>
            <span className={playing ? "fixture-status in" : "fixture-status out"}>
              <Icon name={playing ? "check" : "trophy"} size={14} />
              {playing ? "You're playing" : "Not selected"}
            </span>
          </li>
        );
      })}
      {fixtures.length === 0 && (
        <li className="empty-state small">
          <Icon name="trophy" />
          <p>No fixtures this week.</p>
        </li>
      )}
    </ul>
  );
}
