import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isStaffEmail } from "@/lib/access";
import { demoCheckIns } from "@/lib/demo-data";
import { prisma } from "@/lib/prisma";
import { moodLevels, type MoodLevel, type WellbeingCheckInItem } from "@/lib/types";

const maxNoteLength = 500;

/** A student shares how they feel. Only their form tutor and head of section can read it. */
export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as {
    mood?: number;
    note?: string;
    demo?: boolean;
  };

  if (!moodLevels.includes(body.mood as MoodLevel)) {
    return NextResponse.json({ error: "Choose how you are feeling" }, { status: 400 });
  }
  const note = body.note?.trim().slice(0, maxNoteLength) || undefined;

  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token?.email) {
    if (body.demo === true && process.env.DEMO_MODE !== "false") {
      // Demo check-ins are never stored.
      return NextResponse.json({ saved: true, routed: true, demo: true });
    }
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  try {
    const email = token.email.toLowerCase();
    const profile = await prisma.pastoralProfile.findUnique({ where: { email } });
    const group = profile
      ? await prisma.pastoralGroup.findUnique({ where: { formGroup: profile.formGroup } })
      : null;
    const section = group
      ? await prisma.pastoralSection.findUnique({ where: { section: group.section } })
      : null;

    await prisma.wellbeingCheckIn.create({
      data: {
        studentEmail: email,
        studentName: token.name ?? undefined,
        formGroup: profile?.formGroup,
        section: group?.section,
        mood: body.mood!,
        note,
        tutorEmail: group?.tutorEmail.toLowerCase(),
        sectionHeadEmail: section?.headEmail.toLowerCase()
      }
    });

    return NextResponse.json({
      saved: true,
      routed: Boolean(group?.tutorEmail || section?.headEmail)
    });
  } catch {
    return NextResponse.json(
      { error: "Your check-in could not be sent. Please speak to your form tutor." },
      { status: 503 }
    );
  }
}

/** Staff read the check-ins routed to them from the last fortnight. */
export async function GET(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const email = token?.email?.toLowerCase();

  if (!email) {
    if (request.nextUrl.searchParams.get("demo") === "1" && process.env.DEMO_MODE !== "false") {
      return NextResponse.json({ items: demoCheckIns, demo: true });
    }
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }
  if (!isStaffEmail(email) && !token?.isStaff) {
    return NextResponse.json({ error: "Staff only" }, { status: 403 });
  }

  try {
    const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const rows = await prisma.wellbeingCheckIn.findMany({
      where: {
        createdAt: { gte: since },
        OR: [{ tutorEmail: email }, { sectionHeadEmail: email }]
      },
      orderBy: { createdAt: "desc" },
      take: 200
    });
    const items: WellbeingCheckInItem[] = rows.map((row) => ({
      id: row.id,
      studentName: row.studentName ?? row.studentEmail,
      formGroup: row.formGroup ?? "—",
      section: row.section ?? "—",
      mood: row.mood as MoodLevel,
      note: row.note ?? undefined,
      createdAt: row.createdAt.toISOString(),
      acknowledged: Boolean(row.acknowledgedAt)
    }));
    return NextResponse.json({ items });
  } catch {
    return NextResponse.json({ error: "The database is not ready." }, { status: 503 });
  }
}
