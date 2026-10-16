import Link from "next/link";
import { getServerSession } from "next-auth";
import { AppShell } from "@/components/AppShell";
import { HomeworkPanel } from "@/components/HomeworkPanel";
import { Icon } from "@/components/Icon";
import { LearningLinksGrid } from "@/components/LearningLinksGrid";
import { MoodCheckIn } from "@/components/MoodCheckIn";
import { NewsList, NoticesList } from "@/components/NewsNotices";
import { QuickLinks } from "@/components/QuickLinks";
import { SubjectLinks } from "@/components/SubjectLinks";
import { TimetableView } from "@/components/TimetableView";
import { authOptions } from "@/lib/auth";
import {
  learningLinks,
  quickLinkIds,
  schoolNews,
  schoolNotices,
  subjectLinks
} from "@/lib/config";
import { demoHomework, demoTimetable } from "@/lib/demo-data";
import { greeting } from "@/lib/greeting";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage({
  searchParams
}: {
  searchParams: Promise<{ demo?: string }>;
}) {
  const params = await searchParams;
  const session = await getServerSession(authOptions);
  const demo = params.demo === "1" || !session?.user;
  const user = session?.user;
  const firstName = user?.name?.split(" ")[0] ?? "Alex";
  const now = new Date();
  const date = now.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Europe/London"
  });

  const quickLinks = quickLinkIds
    .map((id) => learningLinks.find((link) => link.id === id))
    .filter((link) => link !== undefined);
  const otherLinks = learningLinks.filter(
    (link) => !(quickLinkIds as readonly string[]).includes(link.id)
  );
  const supportUrl =
    learningLinks.find((link) => link.id === "wellbeing")?.url ?? "https://www.dixie.org.uk";

  return (
    <AppShell
      user={user}
      demo={demo}
      isAdmin={session?.isAdmin}
      isStaff={session?.isStaff}
    >
      <div className="hub-page">
        <section className="hub-hero">
          <div className="hub-greeting">
            <small>{date}</small>
            <h1>
              {greeting(now)}, <span>{firstName}</span>
            </h1>
            {demo && (
              <p className="demo-note">
                <Icon name="spark" size={15} /> Demo data.{" "}
                <Link href="/">Sign in</Link> to see your own.
              </p>
            )}
          </div>
          <MoodCheckIn demo={demo} supportUrl={supportUrl} />
        </section>

        <QuickLinks links={quickLinks} />

        <div className="hub-grid">
          <section id="timetable" className="hub-card">
            <h2 className="hub-card-title">
              <Icon name="calendar" /> Timetable
            </h2>
            <TimetableView entries={demoTimetable} />
          </section>

          <section id="homework" className="hub-card">
            <h2 className="hub-card-title">
              <Icon name="homework" /> Homework
            </h2>
            <HomeworkPanel initialItems={demoHomework} demo={demo} />
          </section>
        </div>

        <div id="news" className="hub-grid">
          <section className="hub-card">
            <h2 className="hub-card-title">
              <Icon name="news" /> News
              <a
                href="https://www.dixie.org.uk/news-events"
                target="_blank"
                rel="noreferrer"
                className="icon-button small title-action"
                aria-label="More news on the school website"
                title="More news"
              >
                <Icon name="external" size={16} />
              </a>
            </h2>
            <NewsList news={schoolNews} />
          </section>
          <section className="hub-card">
            <h2 className="hub-card-title">
              <Icon name="notice" /> Notices
            </h2>
            <NoticesList notices={schoolNotices} />
          </section>
        </div>

        <section id="subjects" className="hub-card">
          <h2 className="hub-card-title">
            <Icon name="folder-open" /> My subjects
          </h2>
          <SubjectLinks subjects={subjectLinks} />
        </section>

        <section id="links" className="hub-card">
          <h2 className="hub-card-title">
            <Icon name="grid" /> All links
          </h2>
          <LearningLinksGrid links={otherLinks} compact />
        </section>
      </div>
    </AppShell>
  );
}
