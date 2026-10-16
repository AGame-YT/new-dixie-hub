import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { NoticesList } from "@/components/NewsNotices";
import { QuickLinks } from "@/components/QuickLinks";
import { TimetableView } from "@/components/TimetableView";
import { TrackedLink } from "@/components/TrackedLink";
import { WellbeingInbox } from "@/components/WellbeingInbox";
import { authOptions } from "@/lib/auth";
import { driveLayoutStandard, schoolNotices, staffLinks } from "@/lib/config";
import { demoTeacherTimetable } from "@/lib/demo-data";
import { greeting } from "@/lib/greeting";

export const metadata = { title: "Teacher view" };

export default async function TeacherPage({
  searchParams
}: {
  searchParams: Promise<{ demo?: string }>;
}) {
  const params = await searchParams;
  const session = await getServerSession(authOptions);
  const demo = params.demo === "1" || !session?.user;
  if (!demo && !session?.isStaff) redirect("/dashboard");

  const firstName = session?.user?.name?.split(" ")[0] ?? "Mr Shah";
  const briefing = staffLinks.find((link) => link.id === "briefing-notes");

  return (
    <AppShell
      user={demo ? { name: "Mr Shah" } : session?.user}
      demo={demo}
      isAdmin={session?.isAdmin}
      isStaff
    >
      <div className="hub-page">
        <section className="hub-hero">
          <div className="hub-greeting">
            <small>Teacher view</small>
            <h1>
              {greeting()}, <span>{firstName}</span>
            </h1>
          </div>
          {briefing && (
            <TrackedLink
              href={briefing.url}
              target="_blank"
              rel="noreferrer"
              className="briefing-card"
              trackingId={briefing.id}
              trackingLabel={briefing.title}
            >
              <span className="quick-link-icon">
                <Icon name="briefing" size={26} />
              </span>
              <span>
                <strong>Briefing notes</strong>
                <small>{briefing.description}</small>
              </span>
              <Icon name="external" size={16} />
            </TrackedLink>
          )}
        </section>

        <QuickLinks links={staffLinks} />

        <div className="hub-grid">
          <section id="timetable" className="hub-card">
            <h2 className="hub-card-title">
              <Icon name="calendar" /> Timetable
            </h2>
            <TimetableView entries={demoTeacherTimetable} />
          </section>
          <section id="wellbeing" className="hub-card">
            <h2 className="hub-card-title">
              <Icon name="heart" /> How students are feeling
              <span className="mood-private" title="Only you and the other pastoral lead for this form can see these">
                <Icon name="lock" size={14} /> Private
              </span>
            </h2>
            <WellbeingInbox demo={demo} />
          </section>
        </div>

        <div id="news" className="hub-grid">
          <section className="hub-card">
            <h2 className="hub-card-title">
              <Icon name="notice" /> Notices
            </h2>
            <NoticesList notices={schoolNotices} />
          </section>
          <section id="drive" className="hub-card">
            <h2 className="hub-card-title">
              <Icon name="drive" /> Student Drive layout
            </h2>
            <p className="muted">
              Every department&apos;s student folder uses the same structure, so students
              can find work in any subject.
            </p>
            <ol className="drive-standard">
              {driveLayoutStandard.map((item) => (
                <li key={item.folder}>
                  <Icon name="folder" size={18} />
                  <span>
                    <strong>{item.folder}</strong>
                    <small>{item.hint}</small>
                  </span>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>
    </AppShell>
  );
}
