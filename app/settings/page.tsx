import Link from "next/link";
import { getServerSession } from "next-auth";
import { AppShell } from "@/components/AppShell";
import { Icon } from "@/components/Icon";
import { SettingsForm } from "@/components/SettingsForm";
import { authOptions } from "@/lib/auth";

export const metadata = { title: "Settings" };

export default async function SettingsPage({
  searchParams
}: {
  searchParams: Promise<{ demo?: string }>;
}) {
  const params = await searchParams;
  const session = await getServerSession(authOptions);
  const demo = params.demo === "1" || !session?.user;

  return (
    <AppShell
      user={session?.user}
      demo={demo}
      isAdmin={session?.isAdmin}
      isStaff={session?.isStaff}
      media={false}
    >
      <div className="page-heading">
        <div>
          <span className="eyebrow">Make it yours</span>
          <h1>Settings</h1>
          <p>Manage your dashboard preferences and connected account.</p>
        </div>
        {!demo && (
          <Link className="button secondary small" href="/api/auth/signout">
            <Icon name="logout" size={17} /> Sign out
          </Link>
        )}
      </div>
      <div className="settings-layout">
        <aside className="account-card panel">
          {demo ? (
            <img
              className="avatar large avatar-image"
              src="/avatars/alex-morgan-anime.png"
              alt="Alex Morgan"
            />
          ) : session?.user?.image ? (
            <img
              className="avatar large avatar-image"
              src={session.user.image}
              alt=""
              referrerPolicy="no-referrer"
            />
          ) : (
            <span className="avatar large">
              {(session?.user?.name ?? "Alex Morgan")
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)}
            </span>
          )}
          <h2>{session?.user?.name ?? "Alex Morgan"}</h2>
          <p>{session?.user?.email ?? "alex.morgan@dixie.example"}</p>
          <span className="connection-badge">
            <span /> {demo ? "Demo profile" : "Google connected"}
          </span>
          <hr />
          <small>
            Your Google account is used only to read the services enabled by the
            school.
          </small>
        </aside>
        <SettingsForm demo={demo} />
      </div>
    </AppShell>
  );
}
