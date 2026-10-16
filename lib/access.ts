export function getAdminEmails() {
  return (process.env.ADMIN_GOOGLE_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email?: string | null) {
  return Boolean(email && getAdminEmails().includes(email.toLowerCase()));
}

function emailList(value?: string) {
  return (value ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

/** Staff can open the teacher view. Admins always count as staff. */
export function isStaffEmail(email?: string | null) {
  if (!email) return false;
  const normalised = email.toLowerCase();
  const domain = process.env.STAFF_GOOGLE_DOMAIN?.trim().toLowerCase().replace(/^@/, "");
  return (
    isAdminEmail(normalised) ||
    emailList(process.env.STAFF_GOOGLE_EMAILS).includes(normalised) ||
    Boolean(domain && normalised.endsWith(`@${domain}`))
  );
}
