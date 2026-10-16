import { Icon } from "@/components/Icon";
import { TrackedLink } from "@/components/TrackedLink";

type QuickLink = {
  id: string;
  title: string;
  url: string;
  icon: string;
  colour: string;
  description?: string;
};

/** Icon-first tiles, laid out 4 × 2 (wraps on small screens). */
export function QuickLinks({ links }: { links: QuickLink[] }) {
  return (
    <nav className="quick-links" aria-label="Quick links">
      {links.slice(0, 8).map((link) => (
        <TrackedLink
          key={link.id}
          href={link.url}
          target={link.url.startsWith("mailto:") ? undefined : "_blank"}
          rel="noreferrer"
          className={`quick-link ${link.colour}`}
          trackingId={link.id}
          trackingLabel={link.title}
          title={link.description ?? link.title}
        >
          <span className="quick-link-icon">
            <Icon name={link.icon} size={26} />
          </span>
          <span className="quick-link-label">{link.title}</span>
        </TrackedLink>
      ))}
    </nav>
  );
}
