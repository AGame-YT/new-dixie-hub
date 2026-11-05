import { getServerSession } from "next-auth";
import type { NextRequest } from "next/server";
import { authOptions } from "@/lib/auth";
import { hasRole, type Role } from "@/lib/roles";

export type Viewer = {
  email: string;
  name?: string;
  role: Role;
};

/** The signed-in person and their current role, for route handlers and pages. */
export async function getViewer(): Promise<Viewer | null> {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email?.toLowerCase();
  if (!email) return null;
  return {
    email,
    name: session?.user?.name ?? undefined,
    role: session?.role ?? "STUDENT"
  };
}

export async function getViewerWithRole(minimum: Role) {
  const viewer = await getViewer();
  return viewer && hasRole(viewer.role, minimum) ? viewer : null;
}

/** Rejects cross-site form posts to state-changing endpoints. */
export function isSameOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  return !origin || new URL(origin).host === request.nextUrl.host;
}
