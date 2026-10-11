import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { demoHomework } from "@/lib/demo-data";
import { fetchClassroomHomework } from "@/lib/google";
import { prisma } from "@/lib/prisma";
import type { HomeworkItem, HomeworkStatus } from "@/lib/types";
import { analyticsTypes, recordAnalyticsEvent } from "@/lib/analytics";

export const dynamic = "force-dynamic";

async function persistClassroomItems(
  email: string,
  name: string | null | undefined,
  items: HomeworkItem[]
) {
  const user = await prisma.user.upsert({
    where: { email },
    update: { name: name ?? undefined },
    create: { email, name: name ?? undefined }
  });

  const persisted = await Promise.all(
    items.map(async (item) => {
      const existing = await prisma.homeworkItem.findUnique({
        where: { id: item.id },
        include: {
          overrides: {
            where: { userId: user.id },
            take: 1
          }
        }
      });

      const syncedStatus = item.status;
      const localStatus = existing?.overrides[0]?.status as
        | HomeworkStatus
        | undefined;
      const finalStatus =
        syncedStatus === "SUBMITTED" || syncedStatus === "COMPLETE"
          ? syncedStatus
          : localStatus ?? syncedStatus;

      await prisma.homeworkItem.upsert({
        where: { id: item.id },
        update: {
          title: item.title,
          subject: item.subject,
          teacher: item.teacher,
          description: item.description,
          dueAt: item.dueAt ? new Date(item.dueAt) : null,
          classroomUrl: item.classroomUrl,
          classroomState: syncedStatus,
          status: finalStatus
        },
        create: {
          id: item.id,
          userId: user.id,
          sourceId: item.id,
          source: "classroom",
          title: item.title,
          subject: item.subject,
          teacher: item.teacher,
          description: item.description,
          dueAt: item.dueAt ? new Date(item.dueAt) : null,
          classroomUrl: item.classroomUrl,
          classroomState: syncedStatus,
          status: finalStatus
        }
      });

      return { ...item, status: finalStatus };
    })
  );

  return persisted;
}

export async function GET(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET
  });

  if (
    !token?.accessToken ||
    process.env.ENABLE_CLASSROOM_API !== "true"
  ) {
    return NextResponse.json({
      items: demoHomework,
      source: "demo",
      configured: false
    });
  }

  try {
    const items = await fetchClassroomHomework(token.accessToken);
    const email = token.email ?? "unknown-google-user@dixie.local";
    let persisted = items;

    try {
      persisted = await persistClassroomItems(email, token.name, items);
    } catch {
      // Live data is still returned if the prototype database is unavailable.
    }

    await recordAnalyticsEvent({
      userId: token.sub,
      eventType: analyticsTypes.classroomSync,
      targetId: "success",
      targetLabel: String(items.length)
    });

    return NextResponse.json({
      items: persisted,
      source: "classroom",
      configured: true
    });
  } catch {
    await recordAnalyticsEvent({
      userId: token?.sub,
      eventType: analyticsTypes.classroomSync,
      targetId: "fallback"
    });
    return NextResponse.json({
      items: demoHomework,
      source: "demo",
      configured: true,
      warning: "Classroom could not be reached; demo data is shown."
    });
  }
}
