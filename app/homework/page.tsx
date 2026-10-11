import { getServerSession } from "next-auth";
import { AppShell } from "@/components/AppShell";
import { HomeworkBoard } from "@/components/HomeworkBoard";
import { Icon } from "@/components/Icon";
import { authOptions } from "@/lib/auth";
import { demoHomework } from "@/lib/demo-data";

export const metadata = { title: "Homework" };

export default async function HomeworkPage({
  searchParams
}: {
  searchParams: Promise<{ demo?: string }>;
}) {
  const params = await searchParams;
  const session = await getServerSession(authOptions);
  const demo = params.demo === "1" || !session?.user;

  return (
    <AppShell user={session?.user} demo={demo} isAdmin={session?.isAdmin}>
      <div className="page-heading">
        <div>
          <span className="eyebrow">Stay on track</span>
          <h1>Homework</h1>
          <p>
            Move assignments as you work. Classroom submission states stay in sync
            when Google access is enabled.
          </p>
        </div>
        <a
          className="button primary small"
          href="https://classroom.google.com"
          target="_blank"
          rel="noreferrer"
        >
          <Icon name="classroom" size={17} /> Google Classroom
        </a>
      </div>
      <HomeworkBoard initialItems={demoHomework} demo={demo} />
    </AppShell>
  );
}
