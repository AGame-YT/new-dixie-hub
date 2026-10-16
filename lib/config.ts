import type {
  LearningLinkItem,
  NewsItem,
  NoticeItem,
  StaffLinkItem,
  SubjectLinkItem
} from "@/lib/types";

export const schoolConfig = {
  name: "The Dixie Grammar School",
  hubName: "Dixie Hub",
  motto: "Fulfilling potential through aspiration and integrity.",
  website: "https://www.dixie.org.uk",
  values: ["Respect", "Resilience", "Courage", "Commitment", "Care"],
  supportEmail: "itsupport@dixie.org.uk",
  privacyPath: "/privacy"
};

export const schoolValues = [
  {
    id: "respect",
    name: "Respect",
    image: "/brand/respect.jpg",
    statement: "Think about the effect your words and actions have on others.",
    colour: "respect"
  },
  {
    id: "resilience",
    name: "Resilience",
    image: "/brand/resilience.jpg",
    statement: "Keep going through difficulty and learn from setbacks.",
    colour: "resilience"
  },
  {
    id: "courage",
    name: "Courage",
    image: "/brand/courage.jpg",
    statement: "Be brave enough to try, speak up and step beyond what feels comfortable.",
    colour: "courage"
  },
  {
    id: "commitment",
    name: "Commitment",
    image: "/brand/commitment.jpg",
    statement: "Give your time and energy, and see important work through.",
    colour: "commitment"
  },
  {
    id: "care",
    name: "Care",
    image: "/brand/care.jpg",
    statement: "Show compassion, notice others and offer support.",
    colour: "care"
  }
] as const;

export const learningLinks: LearningLinkItem[] = [
  {
    id: "classroom",
    title: "Google Classroom",
    description: "Classes, assignments and teacher feedback",
    url: "https://classroom.google.com",
    icon: "classroom",
    category: "Google",
    colour: "green"
  },
  {
    id: "gmail",
    title: "Gmail",
    description: "Your school inbox",
    url: "https://mail.google.com",
    icon: "mail",
    category: "Google",
    colour: "red"
  },
  {
    id: "drive",
    title: "Google Drive",
    description: "Documents, shared work and files",
    url: "https://drive.google.com",
    icon: "drive",
    category: "Google",
    colour: "blue"
  },
  {
    id: "calendar",
    title: "School calendar",
    description: "Events, fixtures and key dates",
    url: "https://www.dixie.org.uk/news-events/whole-school-calendar",
    icon: "calendar",
    category: "School",
    colour: "purple"
  },
  {
    id: "seneca",
    title: "Seneca",
    description: "Interactive revision and homework",
    url: "https://app.senecalearning.com",
    icon: "spark",
    category: "Learning",
    colour: "violet"
  },
  {
    id: "sparx",
    title: "Sparx Maths",
    description: "Maths practice and assignments",
    url: "https://sparxmaths.com",
    icon: "calculator",
    category: "Learning",
    colour: "orange"
  },
  {
    id: "gcsepod",
    title: "GCSEPod",
    description: "Short curriculum videos and quizzes",
    url: "https://www.gcsepod.com",
    icon: "play",
    category: "Learning",
    colour: "pink"
  },
  {
    id: "bitesize",
    title: "BBC Bitesize",
    description: "Revision guides and subject support",
    url: "https://www.bbc.co.uk/bitesize",
    icon: "book",
    category: "Learning",
    colour: "navy"
  },
  {
    id: "cognitive-education",
    title: "Cognitive Education",
    description: "Learning, thinking and study resources",
    url: "https://www.cognitive-edu.co.uk",
    icon: "spark",
    category: "Learning",
    colour: "blue"
  },
  {
    id: "library",
    title: "School library",
    description: "Reading lists and research resources",
    url: "https://www.dixie.org.uk",
    icon: "library",
    category: "School",
    colour: "teal"
  },
  {
    id: "revision",
    title: "Revision resources",
    description: "Dixie revision guides and study support",
    url: "https://drive.google.com",
    icon: "layers",
    category: "Learning",
    colour: "amber"
  },
  {
    id: "it-help",
    title: "IT helpdesk",
    description: "Report a Chromebook or account problem",
    url: "mailto:itsupport@dixie.org.uk",
    icon: "help",
    category: "Support",
    colour: "cyan"
  },
  {
    id: "wellbeing",
    title: "Wellbeing & safeguarding",
    description: "Find support or tell a trusted adult",
    url: "https://www.dixie.org.uk",
    icon: "heart",
    category: "Support",
    colour: "rose"
  }
];

export const schoolNotices: NoticeItem[] = [
  {
    id: "notice-1",
    title: "Whole School Sports Day",
    body: "Remember PE kit, a water bottle and sun protection. House colours are encouraged.",
    date: "30 Jun",
    audience: "Whole school",
    pinned: true
  },
  {
    id: "notice-2",
    title: "Senior Prize Giving",
    body: "Students taking part should check rehearsal times in Google Classroom.",
    date: "3 Jul",
    audience: "Senior school"
  },
  {
    id: "notice-3",
    title: "Library summer reading",
    body: "Borrow up to six books for the summer break from Monday.",
    date: "This week",
    audience: "All students"
  }
];

export const schoolNews: NewsItem[] = [
  {
    id: "news-1",
    title: "Dixie musicians take to the stage",
    excerpt: "Students from across the school shared an evening of performances and original music.",
    date: "18 June",
    category: "Music",
    accent: "plum"
  },
  {
    id: "news-2",
    title: "A brilliant week of outdoor learning",
    excerpt: "Year groups put courage and resilience into action on their latest expeditions.",
    date: "14 June",
    category: "Dixie Outdoors",
    accent: "green"
  },
  {
    id: "news-3",
    title: "Celebrating sporting success",
    excerpt: "A round-up of recent fixtures, personal bests and team achievements.",
    date: "10 June",
    category: "Sport",
    accent: "blue"
  }
];

/**
 * The eight icon tiles at the top of the hub (4 × 2). Order matters.
 * Everything else in `learningLinks` appears in the "All links" section.
 */
export const quickLinkIds = [
  "classroom",
  "gmail",
  "drive",
  "calendar",
  "sparx",
  "seneca",
  "library",
  "wellbeing"
] as const;

/**
 * Per-subject shortcuts at the bottom of the hub. Replace the placeholder
 * URLs with each department's shared Drive folder and Classroom class link.
 * Every department folder should follow `driveLayoutStandard` below.
 */
export const subjectLinks: SubjectLinkItem[] = [
  { id: "english", subject: "English", icon: "english", colour: "purple" },
  { id: "maths", subject: "Maths", icon: "maths", colour: "blue" },
  { id: "biology", subject: "Biology", icon: "biology", colour: "green" },
  { id: "chemistry", subject: "Chemistry", icon: "chemistry", colour: "teal" },
  { id: "physics", subject: "Physics", icon: "physics", colour: "navy" },
  { id: "history", subject: "History", icon: "history", colour: "amber" },
  { id: "geography", subject: "Geography", icon: "geography", colour: "cyan" },
  { id: "languages", subject: "Languages", icon: "languages", colour: "pink" },
  { id: "art", subject: "Art", icon: "art", colour: "orange" },
  { id: "music", subject: "Music", icon: "music", colour: "violet" },
  { id: "drama", subject: "Drama", icon: "drama", colour: "rose" },
  { id: "pe", subject: "PE & Games", icon: "pe", colour: "red" },
  { id: "computing", subject: "Computing", icon: "computing", colour: "lime" }
].map((subject) => ({
  ...subject,
  driveUrl: "https://drive.google.com",
  classroomUrl: "https://classroom.google.com"
}));

const subjectAliases: [RegExp, string][] = [
  [/math/, "maths"],
  [/(french|german|spanish|latin|language)/, "languages"],
  [/(games|sport|\bpe\b)/, "pe"],
  [/(computer|computing|\bict\b)/, "computing"]
];

/** Maps timetable / Classroom subject names onto a subject icon and colour. */
export function subjectStyle(subject: string) {
  const name = subject.toLowerCase();
  const aliasId = subjectAliases.find(([pattern]) => pattern.test(name))?.[1];
  const match =
    subjectLinks.find((item) => item.id === aliasId) ??
    subjectLinks.find(
      (item) => name.includes(item.id) || name.includes(item.subject.toLowerCase())
    );
  return {
    icon: match?.icon ?? "book",
    colour: match?.colour ?? "slate"
  };
}

/**
 * The folder structure every department is asked to use in its shared
 * student Drive, so students always know where to look.
 */
export const driveLayoutStandard = [
  { folder: "01 Course information", hint: "Specification, course outline, key dates" },
  { folder: "02 Lessons", hint: "One folder per topic, slides and handouts" },
  { folder: "03 Homework", hint: "Task sheets and resources, by half term" },
  { folder: "04 Revision", hint: "Knowledge organisers, past papers, mark schemes" },
  { folder: "05 Assessments", hint: "Assessment guidance and feedback" },
  { folder: "06 Extension & enrichment", hint: "Wider reading and challenge tasks" }
];

/** Teacher view shortcuts. Replace the placeholder URLs with the real documents. */
export const staffLinks: StaffLinkItem[] = [
  {
    id: "briefing-notes",
    title: "Briefing notes",
    description: "This week's staff briefing",
    url: "https://drive.google.com",
    icon: "briefing",
    colour: "navy"
  },
  {
    id: "cover",
    title: "Cover & rooming",
    description: "Today's cover and room changes",
    url: "https://drive.google.com",
    icon: "users",
    colour: "amber"
  },
  {
    id: "staff-calendar",
    title: "Staff calendar",
    description: "Meetings, duties and events",
    url: "https://calendar.google.com",
    icon: "calendar",
    colour: "purple"
  },
  {
    id: "safeguarding",
    title: "Safeguarding",
    description: "Report a concern to the DSL",
    url: "https://www.dixie.org.uk",
    icon: "shield",
    colour: "red"
  },
  {
    id: "classroom",
    title: "Google Classroom",
    description: "Your classes",
    url: "https://classroom.google.com",
    icon: "classroom",
    colour: "green"
  },
  {
    id: "staff-drive",
    title: "Staff shared drive",
    description: "Policies, templates and planning",
    url: "https://drive.google.com",
    icon: "drive",
    colour: "blue"
  },
  {
    id: "gmail",
    title: "Gmail",
    description: "School inbox",
    url: "https://mail.google.com",
    icon: "mail",
    colour: "rose"
  },
  {
    id: "it-help",
    title: "IT helpdesk",
    description: "Report a problem",
    url: "mailto:itsupport@dixie.org.uk",
    icon: "help",
    colour: "cyan"
  }
];

/**
 * Side panel media. Set NEXT_PUBLIC_SCHOOL_VIDEO_URL to a looping MP4/WebM
 * (for example the clip used on the school website's homepage). Without it
 * the panel cross-fades through these school photographs.
 */
export const schoolMedia = {
  videoUrl: process.env.NEXT_PUBLIC_SCHOOL_VIDEO_URL ?? "",
  posterUrl: "/brand/respect.jpg",
  photos: [
    { src: "/brand/respect.jpg", caption: "Respect" },
    { src: "/brand/resilience.jpg", caption: "Resilience" },
    { src: "/brand/courage.jpg", caption: "Courage" },
    { src: "/brand/commitment.jpg", caption: "Commitment" },
    { src: "/brand/care.jpg", caption: "Care" }
  ]
};
