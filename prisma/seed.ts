import { PrismaClient } from "@prisma/client";
import { learningLinks, schoolNews, schoolNotices } from "../lib/config";
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
