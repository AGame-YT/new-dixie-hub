import { isAdminEmail, isStaffEmail } from "@/lib/access";

/**
 * Account tiers, lowest first. Admins grant roles from /admin, so the hub
 * can be run by staff without anyone editing server settings.
 *
 * - STUDENT: the student hub
 * - TEACHER: teacher view, bulletin editing, wellbeing check-ins routed to them
 * - ADMIN:   everything, plus roles, house points and analytics
 */
export const roles = ["STUDENT", "TEACHER", "ADMIN"] as const;
export type Role = (typeof roles)[number];

export const roleLabels: Record<Role, string> = {
  STUDENT: "Student",
  TEACHER: "Teacher",
  ADMIN: "Admin"
};

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (roles as readonly string[]).includes(value);
}

export function hasRole(role: Role | undefined | null, minimum: Role) {
  return roles.indexOf(role ?? "STUDENT") >= roles.indexOf(minimum);
}

/** The role guaranteed by server settings (ADMIN_GOOGLE_EMAILS, STAFF_*). */
export function configuredRole(email?: string | null): Role {
  if (isAdminEmail(email)) return "ADMIN";
  if (isStaffEmail(email)) return "TEACHER";
  return "STUDENT";
}

/** Server settings set a minimum; the database role can only raise it. */
export function effectiveRole(email?: string | null, storedRole?: string | null): Role {
  const fromConfig = configuredRole(email);
  const fromDatabase = isRole(storedRole) ? storedRole : "STUDENT";
  return hasRole(fromDatabase, fromConfig) ? fromDatabase : fromConfig;
}
