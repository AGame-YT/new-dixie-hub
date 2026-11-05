import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { AdminHouseEditor } from "@/components/AdminHouseEditor";
import { AdminRoleManager } from "@/components/AdminRoleManager";
import { BrandMark } from "@/components/BrandMark";
import { Icon } from "@/components/Icon";
import { getAdminOverview } from "@/lib/admin-data";
import { authOptions } from "@/lib/auth";

export const metadata = { title: "Admin dashboard" };
export const dynamic = "force-dynamic";

function formatDate(value: Date | null) {
  if (!value) return "Never";
  return value.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/admin/login");
  }
  if (!session.isAdmin) {
    return <AdminAccessDenied email={session.user.email} />;
  }

  const overview = await getAdminOverview();
  const maximumActivity = Math.max(
    ...overview.activity.map((item) => item.events),
    1
  );

  return (
    <div className="admin-page">
      <header className="admin-header">
        <BrandMark />
        <div>
          <span>
            Signed in as <strong>{session.user.email}</strong>
          </span>
          <Link href="/dashboard">
            <Icon name="arrow" size={15} /> Student hub
          </Link>
        </div>
      </header>

      <main className="admin-main">
        <section className="admin-hero">
          <div>
            <span className="eyebrow">Dixie Hub operations</span>
            <h1>Admin dashboard</h1>
            <p>
              Manage house points and monitor adoption, engagement and service
              health without collecting unnecessary student data.
            </p>
          </div>
          <a
            className="button primary"
            href="/grafana/d/dixie-hub-overview/dixie-hub-overview?orgId=1"
            target="_blank"
            rel="noreferrer"
          >
            Open Grafana <Icon name="external" size={17} />
          </a>
        </section>

        <section className="admin-stat-grid">
          <MetricCard
            icon="grid"
            value={overview.summary.studentCount}
            label="Students registered"
            detail={`${overview.summary.activeStudents7d} active in 7 days`}
          />
          <MetricCard
            icon="logout"
            value={overview.summary.totalLogins}
            label="Total Google logins"
            detail="Successful sign-ins"
          />
          <MetricCard
            icon="external"
            value={overview.summary.linkClicks30d}
            label="Link clicks"
            detail="Last 30 days"
          />
          <MetricCard
            icon="homework"
            value={overview.summary.homeworkMoves30d}
            label="Homework updates"
            detail={`${overview.summary.pageViews30d} page views`}
          />
        </section>

        <div className="admin-layout">
          <section id="roles" className="admin-panel admin-roles-panel">
            <div className="admin-panel-heading">
              <div>
                <span className="eyebrow">Account tiers</span>
                <h2>People &amp; roles</h2>
              </div>
            </div>
            <AdminRoleManager currentEmail={session.user.email} />
          </section>

          <section className="admin-panel admin-house-panel">
            <div className="admin-panel-heading">
              <div>
                <span className="eyebrow">House cup controls</span>
                <h2>York and Lancaster</h2>
              </div>
            </div>
            <AdminHouseEditor initialHouses={overview.houses} />
          </section>

          <section className="admin-panel admin-activity-panel">
            <div className="admin-panel-heading">
              <div>
                <span className="eyebrow">Seven-day pulse</span>
                <h2>Hub activity</h2>
              </div>
            </div>
            <div className="admin-activity-chart">
              {overview.activity.map((day) => (
                <div key={day.key}>
                  <span>{day.events}</span>
                  <i
                    style={{
                      height: `${Math.max(8, (day.events / maximumActivity) * 100)}%`
                    }}
                  />
                  <small>{day.label}</small>
                </div>
              ))}
            </div>
          </section>

          <section className="admin-panel">
            <div className="admin-panel-heading">
              <div>
                <span className="eyebrow">Engagement</span>
                <h2>Most-used links</h2>
              </div>
            </div>
            <div className="admin-ranking">
              {overview.topLinks.length ? (
                overview.topLinks.map((link, index) => (
                  <div key={`${link.id}-${index}`}>
                    <span>{index + 1}</span>
                    <strong>{link.label}</strong>
                    <b>{link.clicks}</b>
                  </div>
                ))
              ) : (
                <p className="admin-empty">Link activity will appear here.</p>
              )}
            </div>
          </section>

          <section className="admin-panel">
            <div className="admin-panel-heading">
              <div>
                <span className="eyebrow">Adoption</span>
                <h2>Recent students</h2>
              </div>
            </div>
            <div className="admin-user-list">
              {overview.recentUsers.length ? (
                overview.recentUsers.map((user) => (
                  <div key={user.id}>
                    <span className="avatar">
                      {(user.name ?? user.email)
                        .split(/[ @]/)
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </span>
                    <div>
                      <strong>{user.name ?? "Student"}</strong>
                      <small>{user.email}</small>
                    </div>
                    <span>
                      {user.loginCount} logins
                      <small>{formatDate(user.lastLoginAt)}</small>
                    </span>
                  </div>
                ))
              ) : (
                <p className="admin-empty">Student logins will appear here.</p>
              )}
            </div>
          </section>

          <section className="admin-panel">
            <div className="admin-panel-heading">
              <div>
                <span className="eyebrow">Governance</span>
                <h2>Recent admin changes</h2>
              </div>
            </div>
            <div className="admin-audit-list">
              {overview.recentAudit.length ? (
                overview.recentAudit.map((entry) => (
                  <div key={entry.id}>
                    <span><Icon name="settings" size={15} /></span>
                    <div>
                      <strong>{entry.action.replaceAll("_", " ")}</strong>
                      <small>
                        {entry.actorEmail} · {entry.targetType} {entry.targetId}
                      </small>
                    </div>
                    <time>{formatDate(entry.createdAt)}</time>
                  </div>
                ))
              ) : (
                <p className="admin-empty">Admin changes will appear here.</p>
              )}
            </div>
          </section>
        </div>

        <section className="admin-panel grafana-embed">
          <div className="admin-panel-heading">
            <div>
              <span className="eyebrow">Grafana</span>
              <h2>Operational analytics</h2>
              <p>
                Trends for logins, active students, clicks, homework use, Google
                integrations and house points.
              </p>
            </div>
          </div>
          <iframe
            title="Dixie Hub Grafana dashboard"
            src="/grafana/d/dixie-hub-overview/dixie-hub-overview?orgId=1&kiosk"
          />
        </section>
      </main>
    </div>
  );
}

function AdminAccessDenied({ email }: { email?: string | null }) {
  return (
    <div className="admin-page">
      <header className="admin-header">
        <BrandMark />
        <Link href="/">Return to Dixie Hub</Link>
      </header>
      <main className="admin-access-denied">
        <span className="admin-denied-icon">
          <Icon name="alert" size={30} />
        </span>
        <span className="eyebrow">Restricted area</span>
        <h1>Admin access has not been granted</h1>
        <p>
          You are signed in as <strong>{email ?? "an unknown account"}</strong>,
          but that account does not have the Admin role. Ask an existing admin to
          give you the Admin role under <strong>People &amp; roles</strong>.
        </p>
        <div>
          <Link className="button secondary" href="/dashboard">
            Return to dashboard
          </Link>
          <Link
            className="button primary"
            href="/api/auth/signout?callbackUrl=/admin"
          >
            Sign in with another account
          </Link>
        </div>
      </main>
    </div>
  );
}

function MetricCard({
  icon,
  value,
  label,
  detail
}: {
  icon: string;
  value: number;
  label: string;
  detail: string;
}) {
  return (
    <article className="admin-stat-card">
      <span><Icon name={icon} /></span>
      <div>
        <strong>{value.toLocaleString("en-GB")}</strong>
        <b>{label}</b>
        <small>{detail}</small>
      </div>
    </article>
  );
}
