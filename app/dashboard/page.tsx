import Link from "next/link";
import { getServerSession } from "next-auth";
import { AppShell } from "@/components/AppShell";
import { EmailPanel } from "@/components/EmailPanel";
import { HomeworkBoard } from "@/components/HomeworkBoard";
import { Icon } from "@/components/Icon";
import { LearningLinksGrid } from "@/components/LearningLinksGrid";
import { SectionHeading } from "@/components/SectionHeading";
import { TimetableView } from "@/components/TimetableView";
import { ValuesPillars } from "@/components/ValuesPillars";
import { TrackedLink } from "@/components/TrackedLink";
import { authOptions } from "@/lib/auth";
import { learningLinks, schoolNotices } from "@/lib/config";
import { demoEmails, demoHomework, demoTimetable } from "@/lib/demo-data";

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
  const date = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long"
  });
  const urgentCount = demoHomework.filter((item) =>
    ["overdue", "today", "tomorrow"].includes(item.priority)
  ).length;

  return (
    <AppShell user={user} demo={demo} isAdmin={session?.isAdmin}>
      <div className="dashboard-page">
        <section className="welcome-row">
          <div>
            <span className="eyebrow">Good morning</span>
            <h1>Ready for the day, {firstName}?</h1>
            <p>{date} · Here&apos;s what&apos;s happening today.</p>
          </div>
          <div className="welcome-actions">
            <TrackedLink
              className="button primary small"
              href="https://classroom.google.com"
              target="_blank"
              rel="noreferrer"
              trackingId="classroom"
              trackingLabel="Google Classroom"
            >
              <Icon name="classroom" size={17} /> Open Classroom
            </TrackedLink>
            <TrackedLink
              className="button secondary small"
              href="https://mail.google.com"
              target="_blank"
              rel="noreferrer"
              trackingId="gmail"
              trackingLabel="Gmail"
            >
              <Icon name="mail" size={17} /> Check email
            </TrackedLink>
          </div>
        </section>

        {demo && (
          <section className="demo-banner">
            <Icon name="spark" />
            <div>
              <strong>You&apos;re viewing the demo dashboard</strong>
              <span>
                It uses sample homework, email and timetable data. Google services
                appear automatically after OAuth is configured.
              </span>
            </div>
            <Link href="/" className="text-link">Back to sign in</Link>
          </section>
        )}

        <ValuesPillars compact heading={false} />

        <section className="stat-grid">
          <Link href={demo ? "/homework?demo=1" : "/homework"} className="stat-card">
            <span className="stat-icon amber"><Icon name="homework" /></span>
            <div><b>{urgentCount}</b><span>Homework due soon</span></div>
            <Icon name="chevron" size={17} />
          </Link>
          <div className="stat-card">
            <span className="stat-icon blue"><Icon name="calendar" /></span>
            <div><b>5</b><span>Lessons today</span></div>
            <small>Next at 09:50</small>
          </div>
          <TrackedLink
            href="https://mail.google.com"
            target="_blank"
            rel="noreferrer"
            className="stat-card"
            trackingId="gmail"
            trackingLabel="Gmail"
          >
            <span className="stat-icon red"><Icon name="mail" /></span>
            <div><b>3</b><span>Unread emails</span></div>
            <Icon name="chevron" size={17} />
          </TrackedLink>
          <div className="stat-card">
            <span className="stat-icon green"><Icon name="check" /></span>
            <div><b>12</b><span>Completed this term</span></div>
            <small>Nice work</small>
          </div>
        </section>

        <div className="dashboard-grid">
          <section className="panel homework-panel">
            <SectionHeading
              eyebrow="Your work"
              title="Homework tracker"
              description="Drag work between columns as you make progress."
              href={demo ? "/homework?demo=1" : "/homework"}
              linkLabel="Full board"
            />
            <HomeworkBoard initialItems={demoHomework} demo={demo} compact />
          </section>

          <section className="panel timetable-panel">
            <SectionHeading
              eyebrow="Today"
              title="Your timetable"
              description="Room changes will appear here."
            />
            <TimetableView entries={demoTimetable} compact />
          </section>

          <section className="panel email-panel">
            <SectionHeading
              eyebrow="Inbox"
              title="Email summary"
              description="Latest unread school messages."
              href="https://mail.google.com"
              linkLabel="Open Gmail"
            />
            <EmailPanel initialItems={demoEmails} demo={demo} />
          </section>

          <section className="panel notices-panel">
            <SectionHeading
              eyebrow="School"
              title="Notices"
              description="Updates from around Dixie."
            />
            <div className="dashboard-notices">
              {schoolNotices.map((notice) => (
                <article key={notice.id}>
                  <span className={notice.pinned ? "notice-icon pinned" : "notice-icon"}>
                    <Icon name={notice.pinned ? "pin" : "bell"} size={17} />
                  </span>
                  <div>
                    <span>{notice.audience} · {notice.date}</span>
                    <strong>{notice.title}</strong>
                    <p>{notice.body}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

        </div>

        <section className="panel dashboard-links-panel">
          <SectionHeading
            eyebrow="Shortcuts"
            title="Learning links"
            description="The tools you use most often."
            href={demo ? "/links?demo=1" : "/links"}
            linkLabel="All links"
          />
          <LearningLinksGrid links={learningLinks} compact />
        </section>
      </div>
    </AppShell>
  );
}
