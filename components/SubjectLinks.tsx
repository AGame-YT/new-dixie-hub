import { Icon } from "@/components/Icon";
import { TrackedLink } from "@/components/TrackedLink";
import type { SubjectLinkItem } from "@/lib/types";

export function SubjectLinks({ subjects }: { subjects: SubjectLinkItem[] }) {
  return (
    <ul className="subject-links">
      {subjects.map((subject) => (
        <li key={subject.id} className={`subject-link ${subject.colour}`}>
          <span className="subject-icon">
            <Icon name={subject.icon} size={20} />
          </span>
          <strong>{subject.subject}</strong>
          <span className="subject-link-actions">
            <TrackedLink
              href={subject.driveUrl}
              target="_blank"
              rel="noreferrer"
              className="icon-button small"
              trackingId={`${subject.id}-drive`}
              trackingLabel={`${subject.subject} Drive`}
              aria-label={`${subject.subject} Google Drive folder`}
              title="Drive folder"
            >
              <Icon name="drive" size={16} />
            </TrackedLink>
            <TrackedLink
              href={subject.classroomUrl}
              target="_blank"
              rel="noreferrer"
              className="icon-button small"
              trackingId={`${subject.id}-classroom`}
              trackingLabel={`${subject.subject} Classroom`}
              aria-label={`${subject.subject} Google Classroom`}
              title="Classroom"
            >
              <Icon name="classroom" size={16} />
            </TrackedLink>
          </span>
        </li>
      ))}
    </ul>
  );
}
