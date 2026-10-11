import Link from "next/link";
import { Icon } from "@/components/Icon";

export function SectionHeading({
  eyebrow,
  title,
  description,
  href,
  linkLabel
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </div>
      {href && (
        <Link href={href} className="text-link">
          {linkLabel ?? "View all"} <Icon name="arrow" size={16} />
        </Link>
      )}
    </div>
  );
}
