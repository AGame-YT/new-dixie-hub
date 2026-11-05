import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { daysBetween, isDateKey, parseBulletinInput } from "@/lib/bulletin";
import { listBulletin, toBulletinItem } from "@/lib/bulletin-data";
import { prisma } from "@/lib/prisma";
import { hasRole } from "@/lib/roles";
import { getViewer, getViewerWithRole, isSameOrigin } from "@/lib/viewer";

const maxRangeDays = 62;

/** Bulletin entries between `from` and `to` (YYYY-MM-DD). Staff-only notices need a staff account. */
export async function GET(request: NextRequest) {
  const from = request.nextUrl.searchParams.get("from");
  const to = request.nextUrl.searchParams.get("to");
  if (!isDateKey(from) || !isDateKey(to) || daysBetween(from, to) < 0 || daysBetween(from, to) > maxRangeDays) {
    return NextResponse.json({ error: "Choose a valid date range" }, { status: 400 });
  }
  const viewer = await getViewer();
  try {
    const items = await listBulletin(from, to, {
      includeStaff: hasRole(viewer?.role, "TEACHER")
    });
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ error: "The database is not ready." }, { status: 503 });
  }
}

/** Staff add a notice to a date. */
export async function POST(request: NextRequest) {
  const viewer = await getViewerWithRole("TEACHER");
  if (!viewer) {
    return NextResponse.json({ error: "Only staff can add notices" }, { status: 403 });
  }
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }
  const input = parseBulletinInput(await request.json().catch(() => null));
  if ("error" in input) {
    return NextResponse.json(input, { status: 400 });
  }
  const entry = await prisma.bulletinEntry.create({
    data: { ...input, createdByEmail: viewer.email, createdByName: viewer.name }
  });
  return NextResponse.json({ item: toBulletinItem(entry) }, { status: 201 });
}
