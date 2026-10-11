import type {
  EmailSummaryItem,
  HomeworkItem,
  TimetableItem
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

export const demoTimetable: TimetableItem[] = [
  {
    id: "mon-1",
    day: "Monday",
    lesson: "Period 1",
    subject: "English Literature",
    teacher: "Mrs Bennett",
    room: "S12",
    startTime: "08:45",
    endTime: "09:45",
    colour: "plum"
  },
  {
    id: "mon-2",
    day: "Monday",
    lesson: "Period 2",
    subject: "Mathematics",
    teacher: "Mr Shah",
    room: "M4",
    startTime: "09:50",
    endTime: "10:50",
    colour: "blue"
  },
  {
    id: "mon-3",
    day: "Monday",
    lesson: "Period 3",
    subject: "Chemistry",
    teacher: "Dr Palmer",
    room: "Lab 2",
    startTime: "11:10",
    endTime: "12:10",
    colour: "green"
  },
  {
    id: "mon-4",
    day: "Monday",
    lesson: "Period 4",
    subject: "History",
    teacher: "Mr Clarke",
    room: "H7",
    startTime: "13:10",
    endTime: "14:10",
    colour: "amber"
  },
  {
    id: "mon-5",
    day: "Monday",
    lesson: "Period 5",
    subject: "Games",
    teacher: "Miss Wright",
    room: "Sports Hall",
    startTime: "14:15",
    endTime: "15:30",
    colour: "red"
  },
  {
    id: "tue-1",
    day: "Tuesday",
    lesson: "Period 1",
    subject: "French",
    teacher: "Mme Laurent",
    room: "L3",
    startTime: "08:45",
    endTime: "09:45",
    colour: "violet"
  },
  {
    id: "tue-2",
    day: "Tuesday",
    lesson: "Period 2",
    subject: "Biology",
    teacher: "Mrs Lewis",
    room: "Lab 1",
    startTime: "09:50",
    endTime: "10:50",
    colour: "green"
  },
  {
    id: "tue-3",
    day: "Tuesday",
    lesson: "Period 3",
    subject: "Mathematics",
    teacher: "Mr Shah",
    room: "M4",
    startTime: "11:10",
    endTime: "12:10",
    colour: "blue"
  },
  {
    id: "wed-1",
    day: "Wednesday",
    lesson: "Period 1",
    subject: "Geography",
    teacher: "Mr Evans",
    room: "G6",
    startTime: "08:45",
    endTime: "09:45",
    colour: "cyan"
  },
  {
    id: "thu-1",
    day: "Thursday",
    lesson: "Period 1",
    subject: "English Literature",
    teacher: "Mrs Bennett",
    room: "S12",
    startTime: "08:45",
    endTime: "09:45",
    colour: "plum"
  },
  {
    id: "fri-1",
    day: "Friday",
    lesson: "Period 1",
    subject: "Chemistry",
    teacher: "Dr Palmer",
    room: "Lab 2",
    startTime: "08:45",
    endTime: "09:45",
    colour: "green"
  }
];
