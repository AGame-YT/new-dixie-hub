import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }
  const actorEmail =
    session.user?.email ?? session.user?.name ?? "local-administrator";

  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== request.nextUrl.host) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  const { id } = await context.params;
  const body = (await request.json()) as {
    points?: number;
    reason?: string;
  };
  const points = Number(body.points);
  const reason = body.reason?.trim().slice(0, 160);

  if (!Number.isInteger(points) || points < 0 || points > 10_000_000) {
    return NextResponse.json({ error: "Invalid points total" }, { status: 400 });
  }
  if (!reason) {
    return NextResponse.json({ error: "A reason is required" }, { status: 400 });
  }

  const existing = await prisma.house.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "House not found" }, { status: 404 });
  }

  const [house] = await prisma.$transaction([
    prisma.house.update({
      where: { id },
      data: { points }
    }),
    prisma.housePointChange.create({
      data: {
        houseId: id,
        previousPoints: existing.points,
        newPoints: points,
        delta: points - existing.points,
        reason,
        actorEmail
      }
    }),
    prisma.adminAuditLog.create({
      data: {
        actorEmail,
        action: "HOUSE_POINTS_UPDATED",
        targetType: "House",
        targetId: id,
        beforeJson: JSON.stringify({ points: existing.points }),
        afterJson: JSON.stringify({ points, reason })
      }
    })
  ]);

  return NextResponse.json({ house });
}
