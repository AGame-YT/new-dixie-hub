"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/Icon";

type HouseScore = {
  id: string;
  name: string;
  colour: string;
  points: number;
  weeklyGain: number;
};

const fallbackHouses: HouseScore[] = [
  {
    id: "york",
    name: "York",
    colour: "gold",
    points: 1248,
    weeklyGain: 0
  },
  {
    id: "lancaster",
    name: "Lancaster",
    colour: "royal-blue",
    points: 1196,
    weeklyGain: 0
  }
];

export function HouseScoreboard({
  compact = false
}: {
  compact?: boolean;
}) {
  const [houses, setHouses] = useState(fallbackHouses);

  useEffect(() => {
    fetch("/api/house-points")
      .then((response) => (response.ok ? response.json() : null))
      .then((data: { houses?: HouseScore[] } | null) => {
        if (data?.houses?.length) setHouses(data.houses);
      })
      .catch(() => undefined);
  }, []);

  const rankedHouses = useMemo(
    () => [...houses].sort((a, b) => b.points - a.points),
    [houses]
  );
  const leader = rankedHouses[0];
  const maximum = Math.max(...rankedHouses.map((house) => house.points), 1);

  return (
    <section
      className={compact ? "house-scoreboard compact" : "house-scoreboard"}
    >
      <div className="house-scoreboard-heading">
        <div>
          <span className="eyebrow">House cup</span>
          <h2>House points</h2>
          {!compact && (
            <p>Every value shown, challenge met and contribution made counts.</p>
          )}
        </div>
        <span className={`leader-badge ${leader.colour}`}>
          <Icon name="star" size={compact ? 11 : 14} />
          {leader.name} leads
        </span>
      </div>

      <div className="house-score-list">
        {rankedHouses.map((house, index) => (
          <article className={`house-score house-${house.colour}`} key={house.id}>
            {!compact && <div className="house-rank">{index + 1}</div>}
            <span className="house-mark">
              <strong>{house.name[0]}</strong>
            </span>
            <div className="house-score-copy">
              <div>
                <strong>{house.name}</strong>
                {!compact && <span>+{house.weeklyGain} this week</span>}
              </div>
              <div className="house-progress" aria-hidden="true">
                <span style={{ width: `${(house.points / maximum) * 100}%` }} />
              </div>
            </div>
            <strong className="house-points">
              {house.points.toLocaleString("en-GB")}
              <small>pts</small>
            </strong>
          </article>
        ))}
      </div>

      {!compact && (
        <p className="house-score-note">
          Updated by Dixie staff · Live ePraise integration can be connected later.
        </p>
      )}
    </section>
  );
}
