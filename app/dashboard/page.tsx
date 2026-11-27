import Link from "next/link";
import { getServerSession } from "next-auth";
import { AppShell } from "@/components/AppShell";
import { HomeworkPanel } from "@/components/HomeworkPanel";
import { Icon } from "@/components/Icon";
import { LearningLinksGrid } from "@/components/LearningLinksGrid";
import { MoodCheckIn } from "@/components/MoodCheckIn";
import { BadgesReports } from "@/components/BadgesReports";
import { FixturesList } from "@/components/FixturesList";
import { NoticesList } from "@/components/NewsNotices";
import { ValuePictures } from "@/components/ValuePictures";
import { QuickLinks } from "@/components/QuickLinks";
import { SubjectLinks } from "@/components/SubjectLinks";
import { TimetableView } from "@/components/TimetableView";
import { authOptions } from "@/lib/auth";
import { upcomingNotices } from "@/lib/bulletin-data";
import {
  learningLinks,
  quickLinkIds,
  schoolNotices,
  sportsFixtures,
  subjectLinks
} from "@/lib/config";
import { demoBadges, demoHomework, demoTimetable } from "@/lib/demo-data";
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
  const notices =
    (await upcomingNotices({ includeStaff: Boolean(session?.isStaff) })) ?? schoolNotices;
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

        <ValuePictures />

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

        <section id="fixtures" className="hub-card">
          <h2 className="hub-card-title">
            <Icon name="trophy" /> Sports fixtures
            <span className="mood-private">Who&apos;s playing</span>
          </h2>
          <FixturesList fixtures={sportsFixtures} viewerName={demo ? "Alex Morgan" : user?.name} />
        </section>

        <section id="notices" className="hub-card">
          <h2 className="hub-card-title">
            <Icon name="notice" /> Notices
            <Link
              href={demo ? "/bulletin?demo=1" : "/bulletin"}
              className="icon-button small title-action"
              aria-label="Open the bulletin calendar"
              title="Bulletin calendar"
            >
              <Icon name="bulletin" size={16} />
            </Link>
          </h2>
          <NoticesList notices={notices} />
        </section>

        <section id="subjects" className="hub-card">
          <h2 className="hub-card-title">
            <Icon name="folder-open" /> My subjects
          </h2>
          <SubjectLinks subjects={subjectLinks} />
        </section>

        <section id="badges" className="hub-card">
          <h2 className="hub-card-title">
            <Icon name="award" /> Badges &amp; reports
          </h2>
          <BadgesReports
            badges={demoBadges}
            studentName={demo ? "Alex Morgan" : (user?.name ?? "Student")}
            demo={demo}
          />
        </section>

        <section id="quick" className="hub-card">
          <h2 className="hub-card-title">
            <Icon name="external" /> Quick links
          </h2>
          <QuickLinks links={quickLinks} />
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
