import { PrismaClient } from "@prisma/client";
import { learningLinks, schoolNews, schoolNotices } from "../lib/config";
import { addDays, ukDateKey } from "../lib/bulletin";
import { demoHomework, demoTimetable } from "../lib/demo-data";

const prisma = new PrismaClient();

async function main() {
  const demoUser = await prisma.user.upsert({
    where: { email: "alex.morgan@dixie.example" },
    update: { name: "Alex Morgan", isDemo: true },
    create: {
      id: "demo-student",
      email: "alex.morgan@dixie.example",
      name: "Alex Morgan",
      isDemo: true
    }
  });

  const houses = [
    { id: "york", name: "York", colour: "gold", points: 1248 },
    {
      id: "lancaster",
      name: "Lancaster",
      colour: "royal-blue",
      points: 1196
    }
  ];

  for (const house of houses) {
    await prisma.house.upsert({
      where: { id: house.id },
      update: {
        name: house.name,
        colour: house.colour
      },
      create: house
    });
  }

  for (const link of learningLinks) {
    await prisma.learningLink.upsert({
      where: { id: link.id },
      update: {
        title: link.title,
        description: link.description,
        url: link.url,
        icon: link.icon,
        category: link.category,
        colour: link.colour
      },
      create: {
        ...link,
        sortOrder: learningLinks.indexOf(link)
      }
    });
  }

  for (const notice of schoolNotices) {
    await prisma.schoolNotice.upsert({
      where: { id: notice.id },
      update: {
        title: notice.title,
        body: notice.body,
        audience: notice.audience,
        labelDate: notice.date,
        pinned: notice.pinned ?? false
      },
      create: {
        id: notice.id,
        title: notice.title,
        body: notice.body,
        audience: notice.audience,
        labelDate: notice.date,
        pinned: notice.pinned ?? false
      }
    });
  }

  for (const item of schoolNews) {
    await prisma.schoolNewsItem.upsert({
      where: { id: item.id },
      update: {
        title: item.title,
        excerpt: item.excerpt,
        category: item.category,
        labelDate: item.date,
        accent: item.accent
      },
      create: {
        id: item.id,
        title: item.title,
        excerpt: item.excerpt,
        category: item.category,
        labelDate: item.date,
        accent: item.accent
      }
    });
  }

  // Demo pastoral routing for "How are you feeling?" check-ins.
  const sections = [
    { section: "Middle School", headEmail: "head.middle@dixie.example" },
    { section: "Senior School", headEmail: "head.senior@dixie.example" }
  ];
  for (const section of sections) {
    await prisma.pastoralSection.upsert({
      where: { section: section.section },
      update: section,
      create: section
    });
  }
  const groups = [
    { formGroup: "9D", section: "Middle School", tutorEmail: "mr.shah@dixie.example" },
    { formGroup: "11B", section: "Senior School", tutorEmail: "mrs.bennett@dixie.example" }
  ];
  for (const group of groups) {
    await prisma.pastoralGroup.upsert({
      where: { formGroup: group.formGroup },
      update: group,
      create: group
    });
  }
  await prisma.pastoralProfile.upsert({
    where: { email: demoUser.email },
    update: { formGroup: "11B" },
    create: { email: demoUser.email, formGroup: "11B" }
  });

  // Demo bulletin, placed around today so the calendar always has content.
  if (process.env.DEMO_MODE !== "false") {
    const today = ukDateKey();
    const bulletin = [
      { offset: 0, title: "Sports Day kit reminder", body: "PE kit, water bottle and sun cream. House colours encouraged.", audience: "Everyone", pinned: true },
      { offset: 0, title: "Chess club moves to L3", body: "Lunchtime chess club meets in L3 this week.", audience: "Students", pinned: false },
      { offset: 0, title: "Staff briefing 08:20", body: "Short briefing in the staff room. Cover list on the board.", audience: "Staff only", pinned: false },
      { offset: 1, title: "Senior Prize Giving rehearsal", body: "Students taking part: check rehearsal times in Google Classroom.", audience: "Senior School", pinned: false },
      { offset: 2, title: "Library summer reading", body: "Borrow up to six books from Monday.", audience: "Everyone", pinned: false },
      { offset: 4, title: "Year 12 UCAS workshop", body: "Period 5 in the hall. Bring your personal statement draft.", audience: "Sixth Form", pinned: false },
      { offset: 7, title: "House quiz final", body: "York vs Lancaster, lunchtime in the main hall.", audience: "Everyone", pinned: true },
      { offset: -1, title: "Mufti day", body: "£1 for the house charity.", audience: "Everyone", pinned: false }
    ];
    for (const [index, item] of bulletin.entries()) {
      const { offset, ...entry } = item;
      const data = {
        ...entry,
        date: addDays(today, offset),
        createdByEmail: "demo@dixie.example",
        createdByName: "Dixie Hub demo"
      };
      await prisma.bulletinEntry.upsert({
        where: { id: `demo-bulletin-${index + 1}` },
        update: data,
        create: { id: `demo-bulletin-${index + 1}`, ...data }
      });
    }
  }

  for (const entry of demoTimetable) {
    await prisma.timetableEntry.upsert({
      where: { id: entry.id },
      update: entry,
      create: entry
    });
  }

  for (const item of demoHomework) {
    await prisma.homeworkItem.upsert({
      where: { id: item.id },
      update: {
        title: item.title,
        subject: item.subject,
        teacher: item.teacher,
        description: item.description,
        dueAt: item.dueAt ? new Date(item.dueAt) : null,
        classroomUrl: item.classroomUrl,
        status: item.status
      },
      create: {
        id: item.id,
        sourceId: item.id,
        source: "demo",
        userId: demoUser.id,
        title: item.title,
        subject: item.subject,
        teacher: item.teacher,
        description: item.description,
        dueAt: item.dueAt ? new Date(item.dueAt) : null,
        classroomUrl: item.classroomUrl,
        status: item.status
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
