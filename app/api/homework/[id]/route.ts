import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { analyticsTypes, recordAnalyticsEvent } from "@/lib/analytics";
import {
  homeworkStatuses,
  type HomeworkStatus
} from "@/lib/types";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const body = (await request.json()) as {
    status?: HomeworkStatus;
    demo?: boolean;
  };

  if (!body.status || !homeworkStatuses.includes(body.status)) {
    return NextResponse.json({ error: "Invalid homework status" }, { status: 400 });
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });
  const demoAllowed =
    body.demo === true && process.env.DEMO_MODE !== "false";

  if (!token?.email && !demoAllowed) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  try {
    const email = token?.email ?? "alex.morgan@dixie.example";
    const user = await prisma.user.upsert({
      where: { email },
      update: { name: token?.name ?? undefined },
      create: {
        id: demoAllowed ? "demo-student" : undefined,
        email,
        name: token?.name ?? (demoAllowed ? "Alex Morgan" : undefined)
      }
    });

    const existing = await prisma.homeworkItem.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Homework item not found. Run the database seed first." },
        { status: 404 }
      );
    }

    const override = await prisma.homeworkStatusOverride.upsert({
      where: {
        userId_homeworkItemId: {
          userId: user.id,
          homeworkItemId: id
        }
      },
      update: { status: body.status },
      create: {
        userId: user.id,
        homeworkItemId: id,
        status: body.status
      }
    });

    await prisma.homeworkItem.update({
      where: { id },
      data: { status: body.status }
    });

    await recordAnalyticsEvent({
      userId: user.id,
      eventType: analyticsTypes.homeworkStatus,
      targetId: body.status,
      targetLabel: existing.subject
    });

    return NextResponse.json({
      id,
      status: override.status,
      saved: true
    });
  } catch {
    return NextResponse.json(
      { error: "The database is not ready; the browser kept the local change." },
      { status: 503 }
    );
  }
}
