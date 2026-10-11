import type {
  EmailSummaryItem,
  HomeworkItem,
  HomeworkStatus
} from "@/lib/types";

type GoogleCourse = {
  id: string;
  name: string;
  courseState?: string;
};

type GoogleCourseWork = {
  id: string;
  title: string;
  description?: string;
  alternateLink?: string;
  dueDate?: { year: number; month: number; day: number };
  dueTime?: { hours?: number; minutes?: number };
};

type GoogleSubmission = {
  courseWorkId: string;
  state?: "NEW" | "CREATED" | "TURNED_IN" | "RETURNED" | "RECLAIMED_BY_STUDENT";
};

function googleHeaders(accessToken: string) {
  return { Authorization: `Bearer ${accessToken}` };
}

async function googleJson<T>(url: string, accessToken: string): Promise<T> {
  const response = await fetch(url, {
    headers: googleHeaders(accessToken),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Google API request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

function dueDateToIso(
  dueDate?: GoogleCourseWork["dueDate"],
  dueTime?: GoogleCourseWork["dueTime"]
) {
  if (!dueDate) return undefined;

  return new Date(
    dueDate.year,
    dueDate.month - 1,
    dueDate.day,
    dueTime?.hours ?? 23,
    dueTime?.minutes ?? 59
  ).toISOString();
}

export function getPriority(
  dueAt?: string
): HomeworkItem["priority"] {
  if (!dueAt) return "none";

  const due = new Date(dueAt);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());
  const days = Math.round((dueDay.getTime() - today.getTime()) / 86_400_000);

  if (days < 0) return "overdue";
  if (days === 0) return "today";
  if (days === 1) return "tomorrow";
  if (days <= 7) return "week";
  return "later";
}

function submissionStatus(submission?: GoogleSubmission): HomeworkStatus {
  if (submission?.state === "RETURNED") return "COMPLETE";
  if (submission?.state === "TURNED_IN") return "SUBMITTED";
  if (submission?.state === "RECLAIMED_BY_STUDENT") return "IN_PROGRESS";
  return "NEW";
}

export async function fetchClassroomHomework(
  accessToken: string
): Promise<HomeworkItem[]> {
  const coursesResponse = await googleJson<{ courses?: GoogleCourse[] }>(
    "https://classroom.googleapis.com/v1/courses?courseStates=ACTIVE&pageSize=100",
    accessToken
  );

  const courses = coursesResponse.courses ?? [];
  const homework = await Promise.all(
    courses.map(async (course) => {
      const [workResponse, submissionsResponse] = await Promise.all([
        googleJson<{ courseWork?: GoogleCourseWork[] }>(
          `https://classroom.googleapis.com/v1/courses/${encodeURIComponent(
            course.id
          )}/courseWork?courseWorkStates=PUBLISHED&orderBy=dueDate%20asc&pageSize=100`,
          accessToken
        ),
        googleJson<{ studentSubmissions?: GoogleSubmission[] }>(
          `https://classroom.googleapis.com/v1/courses/${encodeURIComponent(
            course.id
          )}/courseWork/-/studentSubmissions?userId=me&pageSize=100`,
          accessToken
        )
      ]);

      const submissions = new Map(
        (submissionsResponse.studentSubmissions ?? []).map((submission) => [
          submission.courseWorkId,
          submission
        ])
      );

      return (workResponse.courseWork ?? []).map((work) => {
        const dueAt = dueDateToIso(work.dueDate, work.dueTime);
        return {
          id: `${course.id}:${work.id}`,
          title: work.title,
          subject: course.name,
          dueAt,
          description: work.description,
          classroomUrl: work.alternateLink,
          status: submissionStatus(submissions.get(work.id)),
          source: "classroom" as const,
          priority: getPriority(dueAt)
        };
      });
    })
  );

  return homework.flat();
}

type GmailHeader = { name: string; value: string };
type GmailMessage = {
  id: string;
  internalDate?: string;
  snippet?: string;
  labelIds?: string[];
  payload?: { headers?: GmailHeader[] };
};

function gmailHeader(message: GmailMessage, name: string) {
  return message.payload?.headers?.find(
    (header) => header.name.toLowerCase() === name.toLowerCase()
  )?.value;
}

export async function fetchGmailSummary(
  accessToken: string
): Promise<EmailSummaryItem[]> {
  const list = await googleJson<{ messages?: Array<{ id: string }> }>(
    "https://gmail.googleapis.com/gmail/v1/users/me/messages?labelIds=UNREAD&maxResults=5",
    accessToken
  );

  const messages = await Promise.all(
    (list.messages ?? []).map(({ id }) =>
      googleJson<GmailMessage>(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
        accessToken
      )
    )
  );

  return messages.map((message) => ({
    id: message.id,
    subject: gmailHeader(message, "Subject") ?? "No subject",
    sender: gmailHeader(message, "From") ?? "Unknown sender",
    preview: message.snippet ?? "Open Gmail to read this message.",
    receivedAt: message.internalDate
      ? new Date(Number(message.internalDate)).toLocaleString("en-GB", {
          day: "numeric",
          month: "short",
          hour: "2-digit",
          minute: "2-digit"
        })
      : gmailHeader(message, "Date") ?? "",
    important: message.labelIds?.includes("IMPORTANT")
  }));
}
