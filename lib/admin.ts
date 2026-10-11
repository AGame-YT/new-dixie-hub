import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { isAdminEmail } from "@/lib/access";

export { getAdminEmails, isAdminEmail } from "@/lib/access";

export async function getAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session?.isAdmin && !isAdminEmail(session?.user?.email)) {
    return null;
  }
  return session;
}
