import { getServerSession } from "next-auth";
import { AppShell } from "@/components/AppShell";
import { BulletinCalendar } from "@/components/BulletinCalendar";
import { authOptions } from "@/lib/auth";
import { ukDateKey } from "@/lib/bulletin";

export const metadata = { title: "Bulletin" };

export default async function BulletinPage({
  searchParams
}: {
  searchParams: Promise<{ demo?: string }>;
}) {
  const params = await searchParams;
  const session = await getServerSession(authOptions);
  const demo = params.demo === "1" || !session?.user;
  const canEdit = demo || Boolean(session?.isStaff);

  return (
    <AppShell
      user={session?.user}
      demo={demo}
      isAdmin={session?.isAdmin}
      isStaff={session?.isStaff}
      media={false}
    >
      <div className="hub-page">
        <section className="hub-greeting bulletin-hero">
          <small>{canEdit ? "Click a date to add or change notices" : "What's on"}</small>
          <h1>
            Daily <span>bulletin</span>
          </h1>
        </section>
        <BulletinCalendar
          today={ukDateKey()}
          canEdit={canEdit}
          demo={demo}
          editorName={session?.user?.name ?? "Demo teacher"}
        />
      </div>
    </AppShell>
  );
}
