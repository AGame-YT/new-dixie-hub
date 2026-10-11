"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandMark } from "@/components/BrandMark";
import { Icon } from "@/components/Icon";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AnalyticsBeacon } from "@/components/AnalyticsBeacon";
import { schoolValues } from "@/lib/config";
import { HouseScoreboard } from "@/components/HouseScoreboard";

type AppShellProps = {
  children: React.ReactNode;
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  demo?: boolean;
  isAdmin?: boolean;
};

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "home" },
  { href: "/homework", label: "Homework", icon: "homework" },
  { href: "/links", label: "Learning links", icon: "grid" },
  { href: "/settings", label: "Settings", icon: "settings" }
];

export function AppShell({
  children,
  user,
  demo = false,
  isAdmin = false
}: AppShellProps) {
  const pathname = usePathname();
  const name = user?.name ?? "Alex Morgan";
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="app-shell">
      <AnalyticsBeacon />
      <aside className="sidebar">
        <div className="sidebar-brand">
          <BrandMark />
        </div>
        <nav className="sidebar-nav" aria-label="Main navigation">
          {navItems.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const href = demo ? `${item.href}?demo=1` : item.href;
            return (
              <Link
                href={href}
                key={item.href}
                className={active ? "nav-link active" : "nav-link"}
              >
                <Icon name={item.icon} size={19} />
                <span>{item.label}</span>
              </Link>
            );
          })}
          {isAdmin && (
            <Link
              href="/admin"
              className={pathname.startsWith("/admin") ? "nav-link active" : "nav-link"}
            >
              <Icon name="settings" size={19} />
              <span>Admin</span>
            </Link>
          )}
        </nav>
        <div className="sidebar-houses">
          <HouseScoreboard compact />
        </div>
        <div className="sidebar-values">
          <small>The Dixie values</small>
          {schoolValues.map((value) => (
            <span className={`value-${value.colour}`} key={value.id}>
              <i />
              {value.name}
            </span>
          ))}
        </div>
        <a
          className="sidebar-support"
          href="mailto:itsupport@dixie.org.uk"
        >
          <Icon name="help" size={18} />
          <span>
            <small>Need a hand?</small>
            IT support
          </span>
        </a>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <div className="mobile-brand">
            <BrandMark compact />
          </div>
          {demo && <span className="demo-pill">Demo preview</span>}
          <div className="topbar-actions">
            <ThemeToggle />
            <button
              type="button"
              className="icon-button notification-button"
              aria-label="Notifications"
            >
              <Icon name="bell" />
              <span />
            </button>
            <div className="profile-chip">
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
              <span className="profile-copy">
                <strong>{name}</strong>
                <small>{demo ? "Year 11 · Demo" : user?.email}</small>
              </span>
            </div>
          </div>
        </header>
        <main className="app-content">{children}</main>
      </div>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        {navItems.slice(0, 4).map((item) => {
          const active = pathname === item.href;
          const href = demo ? `${item.href}?demo=1` : item.href;
          return (
            <Link
              href={href}
              key={item.href}
              className={active ? "active" : ""}
            >
              <Icon name={item.icon} size={20} />
              <span>{item.label.replace("Learning ", "")}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
