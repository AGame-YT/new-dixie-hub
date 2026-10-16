export const homeworkStatuses = [
  "NEW",
  "TODO",
  "IN_PROGRESS",
  "SUBMITTED",
  "COMPLETE"
] as const;

export type HomeworkStatus = (typeof homeworkStatuses)[number];

export type HomeworkItem = {
  id: string;
  title: string;
  subject: string;
  teacher?: string;
  dueAt?: string;
  description?: string;
  classroomUrl?: string;
  status: HomeworkStatus;
  source: "demo" | "classroom";
  priority: "overdue" | "today" | "tomorrow" | "week" | "later" | "none";
};

export type EmailSummaryItem = {
  id: string;
  subject: string;
  sender: string;
  preview: string;
  receivedAt: string;
  important?: boolean;
};

export type TimetableItem = {
  id: string;
  day: string;
  lesson: string;
  subject: string;
  teacher: string;
  room: string;
  startTime: string;
  endTime: string;
  colour: string;
};

export type LearningLinkItem = {
  id: string;
  title: string;
  description: string;
  url: string;
  icon: string;
  category: "Google" | "Learning" | "School" | "Support";
  colour: string;
};

export type NoticeItem = {
  id: string;
  title: string;
  body: string;
  date: string;
  audience: string;
  pinned?: boolean;
};

export type NewsItem = {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  accent: string;
};

export type SubjectLinkItem = {
  id: string;
  subject: string;
  icon: string;
  colour: string;
  driveUrl: string;
  classroomUrl: string;
};

export type StaffLinkItem = {
  id: string;
  title: string;
  description: string;
  url: string;
  icon: string;
  colour: string;
};

export const moodLevels = [1, 2, 3, 4, 5] as const;
export type MoodLevel = (typeof moodLevels)[number];

export type WellbeingCheckInItem = {
  id: string;
  studentName: string;
  formGroup: string;
  section: string;
  mood: MoodLevel;
  note?: string;
  createdAt: string;
  acknowledged: boolean;
};
