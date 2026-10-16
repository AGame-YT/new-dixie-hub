import { subjectStyle } from "@/lib/config";
import type {
  EmailSummaryItem,
  HomeworkItem,
  TimetableItem,
  WellbeingCheckInItem
} from "@/lib/types";

const isoAt = (daysFromNow: number, hour = 16) => {
  const value = new Date();
  value.setDate(value.getDate() + daysFromNow);
  value.setHours(hour, 0, 0, 0);
  return value.toISOString();
};

export const demoHomework: HomeworkItem[] = [
  {
    id: "demo-english-macbeth",
    title: "Macbeth: Act 3 analysis",
    subject: "English Literature",
    teacher: "Mrs Bennett",
    dueAt: isoAt(0),
    description: "Annotate the banquet scene and answer the three analysis questions.",
    classroomUrl: "https://classroom.google.com",
    status: "TODO",
    source: "demo",
    priority: "today"
  },
  {
    id: "demo-maths-quadratics",
    title: "Quadratic equations",
    subject: "Mathematics",
    teacher: "Mr Shah",
    dueAt: isoAt(1),
    description: "Complete questions 1–18 in the practice set. Show your working.",
    classroomUrl: "https://classroom.google.com",
    status: "IN_PROGRESS",
    source: "demo",
    priority: "tomorrow"
  },
  {
    id: "demo-chem-rates",
    title: "Rates of reaction write-up",
    subject: "Chemistry",
    teacher: "Dr Palmer",
    dueAt: isoAt(3),
    description: "Finish the graph and write a conclusion using collision theory.",
    classroomUrl: "https://classroom.google.com",
    status: "NEW",
    source: "demo",
    priority: "week"
  },
  {
    id: "demo-history-cold-war",
    title: "Cold War source question",
    subject: "History",
    teacher: "Mr Clarke",
    dueAt: isoAt(5),
    description: "Plan and write the 12-mark interpretation response.",
    classroomUrl: "https://classroom.google.com",
    status: "NEW",
    source: "demo",
    priority: "week"
  },
  {
    id: "demo-french-speaking",
    title: "Speaking photo card",
    subject: "French",
    teacher: "Mme Laurent",
    dueAt: isoAt(8),
    description: "Record a two-minute response and upload the audio file.",
    classroomUrl: "https://classroom.google.com",
    status: "TODO",
    source: "demo",
    priority: "later"
  },
  {
    id: "demo-biology-cells",
    title: "Cell biology retrieval quiz",
    subject: "Biology",
    teacher: "Mrs Lewis",
    dueAt: isoAt(-1),
    description: "Complete the self-marking quiz and review any incorrect answers.",
    classroomUrl: "https://classroom.google.com",
    status: "SUBMITTED",
    source: "demo",
    priority: "overdue"
  },
  {
    id: "demo-geography-fieldwork",
    title: "Fieldwork methods summary",
    subject: "Geography",
    teacher: "Mr Evans",
    dueAt: isoAt(-4),
    description: "Your teacher has returned this work with feedback.",
    classroomUrl: "https://classroom.google.com",
    status: "COMPLETE",
    source: "demo",
    priority: "none"
  }
];

export const demoEmails: EmailSummaryItem[] = [
  {
    id: "email-1",
    subject: "Sports Day – final arrangements",
    sender: "Dixie Grammar School",
    preview: "Please read the final timings and kit reminder for next week's event…",
    receivedAt: "09:14",
    important: true
  },
  {
    id: "email-2",
    subject: "Feedback on your Macbeth paragraph",
    sender: "Mrs Bennett",
    preview: "A strong opening. Have another look at how you introduce the quotation…",
    receivedAt: "Yesterday"
  },
  {
    id: "email-3",
    subject: "Library book due soon",
    sender: "School Library",
    preview: "Your current library loan is due back this Friday.",
    receivedAt: "Mon"
  }
];

const periods = [
  { lesson: "Period 1", startTime: "08:45", endTime: "09:45" },
  { lesson: "Period 2", startTime: "09:50", endTime: "10:50" },
  { lesson: "Period 3", startTime: "11:10", endTime: "12:10" },
  { lesson: "Period 4", startTime: "13:10", endTime: "14:10" },
  { lesson: "Period 5", startTime: "14:15", endTime: "15:15" }
];

const lessons: Record<string, [string, string, string]> = {
  english: ["English Literature", "Mrs Bennett", "S12"],
  maths: ["Mathematics", "Mr Shah", "M4"],
  chemistry: ["Chemistry", "Dr Palmer", "Lab 2"],
  biology: ["Biology", "Mrs Lewis", "Lab 1"],
  physics: ["Physics", "Mr Okafor", "Lab 3"],
  history: ["History", "Mr Clarke", "H7"],
  geography: ["Geography", "Mr Evans", "G6"],
  french: ["French", "Mme Laurent", "L3"],
  art: ["Art", "Ms Hughes", "Art 1"],
  computing: ["Computing", "Mr Doyle", "IT2"],
  games: ["Games", "Miss Wright", "Sports Hall"]
};

const week: Record<string, string[]> = {
  Monday: ["english", "maths", "chemistry", "history", "games"],
  Tuesday: ["french", "biology", "maths", "geography", "art"],
  Wednesday: ["geography", "physics", "english", "computing", "maths"],
  Thursday: ["english", "history", "french", "chemistry", "physics"],
  Friday: ["chemistry", "maths", "biology", "art", "games"]
};

function buildTimetable(
  plan: Record<string, string[]>,
  describe: (key: string) => { subject: string; teacher: string; room: string }
): TimetableItem[] {
  return Object.entries(plan).flatMap(([day, keys]) =>
    keys.map((key, index) => {
      const lesson = describe(key);
      return {
        id: `${day.slice(0, 3).toLowerCase()}-${index + 1}`,
        day,
        ...periods[index],
        ...lesson,
        colour: subjectStyle(lesson.subject).colour
      };
    })
  );
}

export const demoTimetable: TimetableItem[] = buildTimetable(week, (key) => {
  const [subject, teacher, room] = lessons[key];
  return { subject, teacher, room };
});

/** A teacher's week: class codes stand in for the teacher name. */
export const demoTeacherTimetable: TimetableItem[] = buildTimetable(
  {
    Monday: ["11B Maths", "Free", "10A Maths", "Form 9D", "13M Further Maths"],
    Tuesday: ["9C Maths", "11B Maths", "Free", "12M Maths", "10A Maths"],
    Wednesday: ["Free", "13M Further Maths", "9C Maths", "11B Maths", "Duty"],
    Thursday: ["10A Maths", "12M Maths", "Form 9D", "Free", "9C Maths"],
    Friday: ["11B Maths", "Free", "13M Further Maths", "12M Maths", "Briefing"]
  },
  (key) => ({
    subject: key,
    teacher: key === "Free" || key === "Duty" || key === "Briefing" ? "" : "Mr Shah",
    room: key === "Duty" ? "Lunch hall" : key === "Free" ? "—" : "M4"
  })
);

export const demoCheckIns: WellbeingCheckInItem[] = [
  {
    id: "checkin-1",
    studentName: "Sam Patel",
    formGroup: "9D",
    section: "Middle School",
    mood: 2,
    note: "Feeling a bit overwhelmed with deadlines this week.",
    createdAt: isoAt(0, 8),
    acknowledged: false
  },
  {
    id: "checkin-2",
    studentName: "Ella Hughes",
    formGroup: "9D",
    section: "Middle School",
    mood: 4,
    createdAt: isoAt(0, 8),
    acknowledged: false
  },
  {
    id: "checkin-3",
    studentName: "Noah Williams",
    formGroup: "9D",
    section: "Middle School",
    mood: 1,
    note: "Can I talk to someone today please?",
    createdAt: isoAt(-1, 13),
    acknowledged: true
  }
];
