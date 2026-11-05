import { getViewerWithRole } from "@/lib/viewer";

export { getAdminEmails, isAdminEmail } from "@/lib/access";

/** The signed-in admin, or null. Admins come from roles set in /admin or ADMIN_GOOGLE_EMAILS. */
export async function getAdminSession() {
  const viewer = await getViewerWithRole("ADMIN");
  return viewer ? { user: { email: viewer.email, name: viewer.name } } : null;
}
