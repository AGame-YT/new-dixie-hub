import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** The tutor or head of section marks a check-in as seen. */
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const email = token?.email?.toLowerCase();
  if (!email) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  try {
    const result = await prisma.wellbeingCheckIn.updateMany({
      where: {
        id,
        acknowledgedAt: null,
        OR: [{ tutorEmail: email }, { sectionHeadEmail: email }]
      },
      data: { acknowledgedAt: new Date(), acknowledgedBy: email }
    });
    return NextResponse.json({ id, acknowledged: true, updated: result.count });
  } catch {
    return NextResponse.json({ error: "The database is not ready." }, { status: 503 });
  }
}
