"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/Icon";
import type { LearningLinkItem } from "@/lib/types";
import { TrackedLink } from "@/components/TrackedLink";

const categories = ["All", "Google", "Learning", "School", "Support"];

export function LearningLinksGrid({
  links,
  compact = false
}: {
  links: LearningLinkItem[];
  compact?: boolean;
}) {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    return links.filter(
      (link) =>
        (category === "All" || link.category === category) &&
        (!query ||
          `${link.title} ${link.description}`.toLowerCase().includes(query))
    );
  }, [category, links, search]);

  const display = compact ? links : visible;

  return (
    <div>
      {!compact && (
        <div className="links-toolbar">
          <div className="category-tabs">
            {categories.map((item) => (
              <button
                type="button"
                key={item}
                className={category === item ? "active" : ""}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <label className="search-field">
            <Icon name="search" size={18} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Find a link"
              aria-label="Find a link"
            />
          </label>
        </div>
      )}
      <div className={compact ? "links-grid compact" : "links-grid"}>
        {display.map((link) => (
          <TrackedLink
            href={link.url}
            target={link.url.startsWith("mailto:") ? undefined : "_blank"}
            rel="noreferrer"
            className="learning-link-card"
            key={link.id}
            trackingId={link.id}
            trackingLabel={link.title}
          >
            <span className={`link-icon ${link.colour}`}>
              <Icon name={link.icon} size={23} />
            </span>
            <span className="link-copy">
              <strong>{link.title}</strong>
              <small>{link.description}</small>
            </span>
            <Icon name="external" size={16} className="link-external" />
          </TrackedLink>
        ))}
      </div>
    </div>
  );
}
