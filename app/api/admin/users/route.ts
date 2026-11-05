import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getAdminEmails } from "@/lib/access";
import { prisma } from "@/lib/prisma";
import { configuredRole, effectiveRole, hasRole, isRole } from "@/lib/roles";
import { getViewerWithRole, isSameOrigin } from "@/lib/viewer";

export type RoleMember = {
  email: string;
  name?: string;
  role: string;
  /** The lowest role this person can have, fixed by server settings. */
  minimumRole: string;
  lastLoginAt?: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function toMember(user: { email: string; name: string | null; role: string; lastLoginAt: Date | null }): RoleMember {
  return {
    email: user.email,
    name: user.name ?? undefined,
    role: effectiveRole(user.email, user.role),
    minimumRole: configuredRole(user.email),
    lastLoginAt: user.lastLoginAt?.toISOString()
  };
}

/** Staff and admins, or anyone matching `q` (name or email). */
export async function GET(request: NextRequest) {
  if (!(await getViewerWithRole("ADMIN"))) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }
  const query = request.nextUrl.searchParams.get("q")?.trim().toLowerCase();

  const users = await prisma.user.findMany({
    where: query
      ? { OR: [{ email: { contains: query } }, { name: { contains: query } }] }
      : { role: { in: ["TEACHER", "ADMIN"] } },
    orderBy: [{ role: "asc" }, { email: "asc" }],
    take: query ? 20 : 500,
    select: { email: true, name: true, role: true, lastLoginAt: true }
  });

  const members = users.map(toMember);
  if (!query) {
    // Admins from ADMIN_GOOGLE_EMAILS appear even before their first sign-in.
    for (const email of getAdminEmails()) {
      if (!members.some((member) => member.email === email)) {
        members.push({ email, role: "ADMIN", minimumRole: "ADMIN" });
      }
    }
  }
  return NextResponse.json({ members });
}

/** Sets someone's role. Unknown emails are added so the role applies at first sign-in. */
export async function POST(request: NextRequest) {
  const admin = await getViewerWithRole("ADMIN");
  if (!admin) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const body = (await request.json().catch(() => ({}))) as { email?: string; role?: string };
  const email = body.email?.trim().toLowerCase() ?? "";
  if (!emailPattern.test(email) || email.length > 254) {
    return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
  }
  if (!isRole(body.role)) {
    return NextResponse.json({ error: "Choose a role" }, { status: 400 });
  }
  if (email === admin.email) {
    return NextResponse.json(
      { error: "You can't change your own role. Ask another admin." },
      { status: 400 }
    );
  }
  const minimumRole = configuredRole(email);
  if (!hasRole(body.role, minimumRole)) {
    return NextResponse.json(
      { error: `${email} is set as ${minimumRole.toLowerCase()} in the server settings.` },
      { status: 400 }
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  const [user] = await prisma.$transaction([
    prisma.user.upsert({
      where: { email },
      update: { role: body.role },
      create: { email, role: body.role },
      select: { email: true, name: true, role: true, lastLoginAt: true }
    }),
    prisma.adminAuditLog.create({
      data: {
        actorEmail: admin.email,
        action: "ROLE_CHANGED",
        targetType: "User",
        targetId: email,
        beforeJson: JSON.stringify({ role: existing?.role ?? null }),
        afterJson: JSON.stringify({ role: body.role })
      }
    })
  ]);

  return NextResponse.json({ member: toMember(user) });
}
