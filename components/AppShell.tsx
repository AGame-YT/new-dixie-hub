"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";
import { Icon } from "@/components/Icon";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AnalyticsBeacon } from "@/components/AnalyticsBeacon";
import { SchoolMediaRail } from "@/components/SchoolMediaRail";

type AppShellProps = {
  children: React.ReactNode;
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  demo?: boolean;
  isAdmin?: boolean;
  isStaff?: boolean;
  /** Hide the school pictures panel, e.g. on admin screens. */
  media?: boolean;
};

const sectionLinks = [
  { hash: "timetable", label: "Timetable", icon: "calendar" },
  { hash: "homework", label: "Homework", icon: "homework" },
  { hash: "news", label: "News & notices", icon: "notice" },
  { hash: "links", label: "All links", icon: "grid" }
];

export function AppShell({
  children,
  user,
  demo = false,
  isAdmin = false,
  isStaff = false,
  media = true
}: AppShellProps) {
  const pathname = usePathname();
  const name = user?.name ?? "Alex Morgan";
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  const withDemo = (href: string) => {
    if (!demo) return href;
    const [path, hash] = href.split("#");
    return `${path}?demo=1${hash ? `#${hash}` : ""}`;
  };
  const onDashboard = pathname === "/dashboard";

  return (
    <div className="hub-shell">
      <AnalyticsBeacon />
      <header className="hub-topbar">
        <BrandMark />
        {demo && <span className="demo-pill">Demo</span>}
        <nav className="hub-nav" aria-label="Main navigation">
          <Link
            href={withDemo("/dashboard")}
            className={onDashboard ? "icon-button active" : "icon-button"}
            aria-label="Home"
            title="Home"
          >
            <Icon name="home" />
          </Link>
          {sectionLinks.map((link) => (
            <Link
              key={link.hash}
              href={onDashboard ? `#${link.hash}` : withDemo(`/dashboard#${link.hash}`)}
              className="icon-button"
              aria-label={link.label}
              title={link.label}
            >
              <Icon name={link.icon} />
            </Link>
          ))}
          {(isStaff || demo) && (
            <Link
              href={withDemo("/teacher")}
              className={pathname.startsWith("/teacher") ? "icon-button active" : "icon-button"}
              aria-label="Teacher view"
              title="Teacher view"
            >
              <Icon name="teacher" />
            </Link>
          )}
          {isAdmin && (
            <Link
              href="/admin"
              className={pathname.startsWith("/admin") ? "icon-button active" : "icon-button"}
              aria-label="Admin"
              title="Admin"
            >
              <Icon name="shield" />
            </Link>
          )}
        </nav>
        <div className="topbar-actions">
          <ThemeToggle />
          <Link
            href={withDemo("/settings")}
            className={pathname.startsWith("/settings") ? "icon-button active" : "icon-button"}
            aria-label="Settings"
            title="Settings"
          >
            <Icon name="settings" />
          </Link>
          <span className="profile-chip" title={user?.email ?? name}>
            {user?.image || demo ? (
              // Google controls this URL; no personal image is persisted by Dixie Hub.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user?.image ?? "/avatars/alex-morgan-anime.png"}
                alt=""
                referrerPolicy="no-referrer"
              />
            ) : (
              <span className="avatar">{initials}</span>
            )}
            <span className="sr-only">{name}</span>
          </span>
        </div>
      </header>
      <div className="leopard-band" aria-hidden="true" />

      <div className={media ? "hub-body with-media" : "hub-body"}>
        {media && <SchoolMediaRail />}
        <main className="hub-content">{children}</main>
      </div>
    </div>
  );
}
